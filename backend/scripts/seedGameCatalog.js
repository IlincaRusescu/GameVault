/* backend/scripts/seedGameCatalog.js */

const fs = require("fs");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const { initFirebaseAdmin, getAdmin } = require("../src/services/firestore");


const COLLECTION = "game_catalog";

async function seedCatalog() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_PATH in .env");
  }

  initFirebaseAdmin();

  const admin = getAdmin();
  const db = admin.firestore();

  const filePath = path.resolve(__dirname, "games.json");
  if (!fs.existsSync(filePath)) {
    throw new Error("games.json not found in backend/scripts. Run generateGames.js first.");
  }

  const games = JSON.parse(fs.readFileSync(filePath, "utf8"));

  console.log(`Seeding ${games.length} games into '${COLLECTION}'`);

  const MAX_BATCH = 500;
  let batch = db.batch();
  let ops = 0;
  let committed = 0;

  for (const game of games) {
    if (!game.gameId) {
      throw new Error("A game entry is missing gameId");
    }

    const ref = db.collection(COLLECTION).doc(String(game.gameId));
    batch.set(ref, game, { merge: false });
    ops++;

    if (ops === MAX_BATCH) {
      await batch.commit();
      committed += ops;
      batch = db.batch();
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
    committed += ops;
  }

  console.log(`Seed complete. Documents written: ${committed}`);
}

seedCatalog()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
  });
