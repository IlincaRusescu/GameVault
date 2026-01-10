const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

function initFirebaseAdmin() {
  if (admin.apps.length) return admin;

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_PATH in .env");
  }

  const absolutePath = path.resolve(process.cwd(), serviceAccountPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Service account file not found at: ${absolutePath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return admin;
}

function getAdmin() {
  return admin;
}

module.exports = { initFirebaseAdmin, getAdmin };
