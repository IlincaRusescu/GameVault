const express = require("express");
const { getDb } = require("../services/firestore");

const router = express.Router();

router.get("/firestore", async (req, res) => {
  try {
    const db = getDb();

    const ref = db.collection("_debug").doc("connection_test");

    await ref.set({
      ok: true,
      message: "Firestore connection works",
      updatedAt: new Date().toISOString(),
    });

    const snapshot = await ref.get();

    res.status(200).json({
      ok: true,
      data: snapshot.data(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

module.exports = router;
