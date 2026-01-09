const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let firebaseApp = null;

function initFirebaseAdmin() {
  if (firebaseApp) return firebaseApp;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_PATH in .env");
  }

  const absolutePath = path.isAbsolute(serviceAccountPath)
    ? serviceAccountPath
    : path.join(process.cwd(), serviceAccountPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Service account key not found at ${absolutePath}`);
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(absolutePath, "utf8")
  );

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return firebaseApp;
}

module.exports = {
  initFirebaseAdmin,
  admin,
};
