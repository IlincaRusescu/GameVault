async function signInWithEmailPassword(email, password) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error("Missing FIREBASE_WEB_API_KEY in .env");

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || "AUTH_FAILED";
    const err = new Error(msg);
    err.status = 401;
    throw err;
  }

  return {
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn,
    localId: data.localId,
    email: data.email,
  };
}

module.exports = { signInWithEmailPassword };
