const { initFirebaseAdmin, admin } = require("../config/firebaseAdmin");

let db = null;

function getDb() {
  if (db) return db;

  initFirebaseAdmin();
  db = admin.firestore();

  return db;
}

module.exports = { getDb };
