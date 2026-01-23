const { getDb } = require("../services/firestore");

const addToLibrary = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { gameId } = req.params;

    if (!gameId) {
      return res.status(400).json({ message: "gameId is required" });
    }

    const db = getDb();

     // 1. verificam daca jocul exista in catalog
    const gameRef = db.collection("game_catalog").doc(gameId);
    const gameSnap = await gameRef.get();

    if (!gameSnap.exists) {
      return res.status(404).json({ message: "Game not found" });
    }

    // 2. referinta catre library/{gameId}
    const libraryRef = db
      .collection("users")
      .doc(uid)
      .collection("library")
      .doc(gameId);

    const librarySnap = await libraryRef.get();

    if (librarySnap.exists) {
      return res.status(409).json({ message: "Game already in library" });
    }

    // 3. adaugam in library
    await libraryRef.set({
      addedAt: new Date(),
      status: "owned",
    });

    return res.status(201).json({
      message: "Game added to library",
      gameId,
    });
  } catch (error) {
    console.error("Add to library error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getLibrary = async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = getDb();

    // 1) gameIds din library (doc ids)
    const libSnap = await db
      .collection("users")
      .doc(uid)
      .collection("library")
      .get();

    const gameIds = libSnap.docs.map((d) => d.id);

    if (gameIds.length === 0) {
      return res.status(200).json({ items: [] });
    }

    // 2) Firestore "in" max 10 -> chunk
    const CHUNK_SIZE = 10;
    const chunks = [];
    for (let i = 0; i < gameIds.length; i += CHUNK_SIZE) {
      chunks.push(gameIds.slice(i, i + CHUNK_SIZE));
    }

    // 3) fetch games din game_catalog
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

    // //sortare alfabetica
    // results.sort((a, b) => {
    //   const aName = (a.name || a.title || "").toString().toLowerCase();
    //   const bName = (b.name || b.title || "").toString().toLowerCase();
    //   return aName.localeCompare(bName);
    // });

    return res.status(200).json({ items: results });
  } catch (error) {
    console.error("Get library error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addToLibrary,
  getLibrary,
};