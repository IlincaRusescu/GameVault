const { getDb } = require("../services/firestore");

// ADD game to library
const addToLibrary = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { gameId } = req.params;

    if (!gameId) {
      return res.status(400).json({ message: "gameId is required" });
    }

    const db = getDb();

    // verify exists in catalog
    const gameRef = db.collection("game_catalog").doc(gameId);
    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {
      return res.status(404).json({ message: "Game not found" });
    }

    const libraryRef = db.collection("users").doc(uid).collection("library").doc(gameId);
    const librarySnap = await libraryRef.get();

    if (librarySnap.exists) {
      return res.status(409).json({ message: "Game already in library" });
    }

    await libraryRef.set({
      addedAt: new Date(),
      status: "owned",
    });

    return res.status(201).json({ message: "Game added to library", gameId });
  } catch (error) {
    console.error("Add to library error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE game from library
const deleteFromLibrary = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { gameId } = req.params;

    if (!gameId) {
      return res.status(400).json({ message: "gameId is required" });
    }

    const db = getDb();

    const libraryRef = db.collection("users").doc(uid).collection("library").doc(gameId);
    const snap = await libraryRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Game not in library" });
    }

    await libraryRef.delete();

    return res.status(200).json({
      message: "Game removed from library",
      gameId,
    });
  } catch (error) {
    console.error("Delete from library error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET library games (full objects from game_catalog)
const getLibrary = async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = getDb();

    const libSnap = await db.collection("users").doc(uid).collection("library").get();
    const gameIds = libSnap.docs.map((d) => d.id);

    if (gameIds.length === 0) {
      return res.status(200).json({ items: [] });
    }

    const CHUNK_SIZE = 10;
    const chunks = [];
    for (let i = 0; i < gameIds.length; i += CHUNK_SIZE) {
      chunks.push(gameIds.slice(i, i + CHUNK_SIZE));
    }

    const results = [];
    for (const chunk of chunks) {
      const gamesSnap = await db
        .collection("game_catalog")
        .where("__name__", "in", chunk)
        .get();

      gamesSnap.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
    }

    return res.status(200).json({ items: results });
  } catch (error) {
    console.error("Get library error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE session
const createSession = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { gameId } = req.params;
    const { durationMinutes, playersText, winner } = req.body || {};

    if (!gameId) {
      return res.status(400).json({ message: "gameId is required" });
    }

    const db = getDb();

    const libraryRef = db.collection("users").doc(uid).collection("library").doc(gameId);
    const librarySnap = await libraryRef.get();

    if (!librarySnap.exists) {
      return res.status(404).json({ message: "Game not in library" });
    }

    const dur = Number(durationMinutes);
    if (!Number.isFinite(dur) || dur <= 0) {
      return res.status(400).json({ message: "durationMinutes must be a positive number" });
    }

    const sessionRef = libraryRef.collection("sessions").doc();
    const createdAt = new Date();

    const payload = {
      createdAt,
      durationMinutes: dur,
      playersText: (playersText || "").toString(),
      winner: (winner || "").toString(),
    };

    await sessionRef.set(payload);

    return res.status(201).json({
      message: "Session created",
      data: { id: sessionRef.id, ...payload },
    });
  } catch (error) {
    console.error("Create session error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// READ sessions
const getSessions = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { gameId } = req.params;

    if (!gameId) {
      return res.status(400).json({ message: "gameId is required" });
    }

    const db = getDb();

    const libraryRef = db.collection("users").doc(uid).collection("library").doc(gameId);
    const librarySnap = await libraryRef.get();

    if (!librarySnap.exists) {
      return res.status(404).json({ message: "Game not in library" });
    }

    const sessionsSnap = await libraryRef.collection("sessions").get();
    const items = sessionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return res.status(200).json({ items });
  } catch (error) {
    console.error("Get sessions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE session
const updateSession = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { gameId, sessionId } = req.params;
    const { durationMinutes, playersText, winner } = req.body || {};

    if (!gameId || !sessionId) {
      return res.status(400).json({ message: "gameId and sessionId are required" });
    }

    const db = getDb();

    const libraryRef = db.collection("users").doc(uid).collection("library").doc(gameId);
    const librarySnap = await libraryRef.get();

    if (!librarySnap.exists) {
      return res.status(404).json({ message: "Game not in library" });
    }

    const sessionRef = libraryRef.collection("sessions").doc(sessionId);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      return res.status(404).json({ message: "Session not found" });
    }

    const patch = {};

    if (durationMinutes !== undefined) {
      const dur = Number(durationMinutes);
      if (!Number.isFinite(dur) || dur <= 0) {
        return res.status(400).json({ message: "durationMinutes must be a positive number" });
      }
      patch.durationMinutes = dur;
    }

    if (playersText !== undefined) patch.playersText = (playersText || "").toString();
    if (winner !== undefined) patch.winner = (winner || "").toString();

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    await sessionRef.update(patch);

    const updatedSnap = await sessionRef.get();
    return res.status(200).json({
      message: "Session updated",
      data: { id: updatedSnap.id, ...updatedSnap.data() },
    });
  } catch (error) {
    console.error("Update session error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE session
const deleteSession = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { gameId, sessionId } = req.params;

    if (!gameId || !sessionId) {
      return res.status(400).json({ message: "gameId and sessionId are required" });
    }

    const db = getDb();

    const libraryRef = db.collection("users").doc(uid).collection("library").doc(gameId);
    const librarySnap = await libraryRef.get();

    if (!librarySnap.exists) {
      return res.status(404).json({ message: "Game not in library" });
    }

    const sessionRef = libraryRef.collection("sessions").doc(sessionId);
    const sessionSnap = await sessionRef.get();

    if (!sessionSnap.exists) {
      return res.status(404).json({ message: "Session not found" });
    }

    await sessionRef.delete();

    return res.status(200).json({
      message: "Session deleted",
      gameId,
      sessionId,
    });
  } catch (error) {
    console.error("Delete session error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addToLibrary,
  deleteFromLibrary,
  getLibrary,
  createSession,
  getSessions,
  updateSession,
  deleteSession,
};
