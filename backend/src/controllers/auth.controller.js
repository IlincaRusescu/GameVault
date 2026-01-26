const { getAdmin } = require("../services/firestore");
const { signInWithEmailPassword } = require("../services/firebaseAuthRest");
const { signAppToken } = require("../services/token.service");

// -------------------- helpers (validation) --------------------
function isEmail(s) {
  return typeof s === "string" && s.includes("@") && s.length <= 254;
}

function isGoodPassword(p) {
  // frontend cere 8+ strong, dar backend (minim) - tu poți ridica standardul aici dacă vrei
  return typeof p === "string" && p.length >= 6;
}

function normalizeString(v) {
  return typeof v === "string" ? v.trim() : "";
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function validateUsername(username) {
  const u = normalizeString(username);
  if (u.length < 3) return "Username must be at least 3 characters.";
  if (u.length > 20) return "Username must be at most 20 characters.";
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(u)) {
    return "Username must start with a letter and can contain only letters, numbers, underscore.";
  }
  return "";
}

function validateGender(gender) {
  const allowed = ["male", "female", "other", "prefer_not_to_say"];
  return allowed.includes(gender) ? "" : "Invalid gender.";
}

function validateAge(age) {
  const n = Number(age);
  if (!Number.isInteger(n)) return "Age must be an integer.";
  if (n < 13) return "Age must be at least 13.";
  if (n > 120) return "Age must be at most 120.";
  return "";
}

// -------------------- firebase REST helpers (forgot/reset) --------------------
async function sendPasswordResetEmail(email) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error("Missing FIREBASE_WEB_API_KEY in .env");

  // where user lands after clicking email link
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  const continueUrl = `${frontendBaseUrl}/reset-password`;

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestType: "PASSWORD_RESET",
      email,
      continueUrl,
      canHandleCodeInApp: true,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || "FAILED_TO_SEND_RESET_EMAIL";
    const err = new Error(msg);
    err.status = 400;
    throw err;
  }

  return data;
}

async function confirmPasswordReset(oobCode, newPassword) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error("Missing FIREBASE_WEB_API_KEY in .env");

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ oobCode, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || "FAILED_TO_RESET_PASSWORD";
    const err = new Error(msg);
    err.status = 400;
    throw err;
  }

  return data;
}

// -------------------- controller: username availability --------------------
async function checkUsername(req, res) {
  try {
    const username = normalizeString(req.query.username);

    if (!username) {
      return res.status(400).json({ available: false, message: "Username is required." });
    }

    const formatErr = validateUsername(username);
    if (formatErr) {
      return res.status(400).json({ available: false, message: formatErr });
    }

    const admin = getAdmin();
    const usernameLower = username.toLowerCase();

    const snap = await admin
      .firestore()
      .collection("users")
      .where("usernameLower", "==", usernameLower)
      .limit(1)
      .get();

    return res.status(200).json({ available: snap.empty });
  } catch (e) {
    return res.status(500).json({ available: false, message: "Could not validate username." });
  }
}

// -------------------- controller: REGISTER --------------------
async function register(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      age,
      gender,
      city,
      country,
      username,
    } = req.body;

    // backend validations (must match your "100% validations" requirement)
    if (!isEmail(email)) return res.status(400).json({ message: "Invalid email." });
    if (!isGoodPassword(password)) return res.status(400).json({ message: "Invalid password (min 6 chars)." });

    if (!isNonEmptyString(firstName)) return res.status(400).json({ message: "First name is required." });
    if (!isNonEmptyString(lastName)) return res.status(400).json({ message: "Last name is required." });

    const ageErr = validateAge(age);
    if (ageErr) return res.status(400).json({ message: ageErr });

    const genderErr = validateGender(gender);
    if (genderErr) return res.status(400).json({ message: genderErr });

    if (!isNonEmptyString(city)) return res.status(400).json({ message: "City is required." });
    if (!isNonEmptyString(country)) return res.status(400).json({ message: "Country is required." });

    const unameErr = validateUsername(username);
    if (unameErr) return res.status(400).json({ message: unameErr });

    const admin = getAdmin();

    // 1) username unique check (case-insensitive)
    const usernameLower = normalizeString(username).toLowerCase();
    const existing = await admin
      .firestore()
      .collection("users")
      .where("usernameLower", "==", usernameLower)
      .limit(1)
      .get();

    if (!existing.empty) {
      // exact message requested
      return res.status(409).json({ message: "Username not available" });
    }

    // 2) create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: `${normalizeString(firstName)} ${normalizeString(lastName)}`.trim() || undefined,
    });

    // 3) save profile in Firestore
    await admin.firestore().collection("users").doc(userRecord.uid).set(
      {
        uid: userRecord.uid,
        email: userRecord.email,

        firstName: normalizeString(firstName),
        lastName: normalizeString(lastName),
        age: Number(age),
        gender,
        city: normalizeString(city),
        country: normalizeString(country),
        username: normalizeString(username),
        usernameLower,

        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 4) issue app JWT
    const token = signAppToken({ uid: userRecord.uid, email: userRecord.email });

    return res.status(201).json({
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: normalizeString(firstName),
        lastName: normalizeString(lastName),
        username: normalizeString(username),
      },
    });
  } catch (e) {
    const msg = e?.message || "REGISTER_FAILED";
    const status = msg.includes("email-already-exists") ? 409 : 500;
    return res.status(status).json({ message: msg });
  }
}

// -------------------- controller: LOGIN --------------------
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!isEmail(email) || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // verify password via Firebase REST
    const { idToken } = await signInWithEmailPassword(email, password);

    // verify token via Admin => uid
    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);

    // issue app JWT
    const token = signAppToken({ uid: decoded.uid, email: decoded.email });

    // load profile
    const snap = await admin.firestore().collection("users").doc(decoded.uid).get();
    const profile = snap.exists ? snap.data() : {};

    return res.status(200).json({
      token,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
      },
    });
  } catch (e) {
    const status = e.status || 401;
    return res.status(status).json({ message: e.message || "LOGIN_FAILED" });
  }
}

// -------------------- controller: ME   --------------------
function me(req, res) {
  return res.status(200).json({
    user: {
      uid: req.user.uid,
      email: req.user.email,
    },
  });
}

// -------------------- controller: forgot/reset password --------------------
async function forgotPassword(req, res) {
  try {
    const email = normalizeString(req.body.email);
    if (!isEmail(email)) return res.status(400).json({ message: "Invalid email." });

    await sendPasswordResetEmail(email);

    // don't leak whether email exists
    return res.status(200).json({ message: "If that email exists, a reset link was sent." });
  } catch (e) {
    // still avoid account enumeration
    return res.status(200).json({ message: "If that email exists, a reset link was sent." });
  }
}

async function resetPassword(req, res) {
  try {
    const oobCode = normalizeString(req.body.oobCode);
    const newPassword = req.body.newPassword;

    if (!oobCode) return res.status(400).json({ message: "Missing reset code." });
    if (!isGoodPassword(newPassword)) return res.status(400).json({ message: "Invalid password (min 6 chars)." });

    await confirmPasswordReset(oobCode, newPassword);

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (e) {
    return res.status(400).json({ message: e.message || "RESET_FAILED" });
  }
}

module.exports = {
  register,
  login,
  me,
  checkUsername,
  forgotPassword,
  resetPassword,
};
