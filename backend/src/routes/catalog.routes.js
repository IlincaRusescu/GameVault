const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const { getDb } = require("../services/firestore");

const router = express.Router();
router.use(requireAuth);

// READ ALL
router.get("/", async (req, res, next) => {
  try {
    const db = getDb();

    const snap = await db.collection("game_catalog").orderBy("name", "asc").get();
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.status(200).json({ data });
  } catch (err) {
    return next(err);
  }
});

// READ ONE
router.get("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const doc = await db.collection("game_catalog").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "NotFound", message: "Game not found." });
    }

    return res.status(200).json({ data: { id: doc.id, ...doc.data() } });
  } catch (err) {
    return next(err);
  }
});

// CREATE
router.post("/", async (req, res, next) => {
  try {
    const db = getDb();
    const payload = req.body;

    if (!payload || typeof payload.name !== "string" || !payload.name.trim()) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Field `name` is required (string).",
      });
    }

    const newDoc = {
      ...payload,
      name: payload.name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ref = await db.collection("game_catalog").add(newDoc);
    const created = await ref.get();

    return res.status(201).json({ data: { id: created.id, ...created.data() } });
  } catch (err) {
    return next(err);
  }
});

// UPDATE (merge)
router.put("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const payload = req.body;

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "ValidationError", message: "Body is required." });
    }

    const ref = db.collection("game_catalog").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "NotFound", message: "Game not found." });
    }

    const updatedDoc = {
      ...payload,
      ...(typeof payload.name === "string" ? { name: payload.name.trim() } : {}),
      updatedAt: new Date().toISOString(),
    };

    await ref.set(updatedDoc, { merge: true });
    const after = await ref.get();

    return res.status(200).json({ data: { id: after.id, ...after.data() } });
  } catch (err) {
    return next(err);
  }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const ref = db.collection("game_catalog").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "NotFound", message: "Game not found." });
    }

    await ref.delete();
    return res.status(200).json({ message: "Deleted." });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
