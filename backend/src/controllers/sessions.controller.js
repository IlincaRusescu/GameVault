const { getDb } = require("../services/firestore");

const getAllSessions = async (req, res) => {
  try {
    const uid = req.user.uid;
    const db = getDb();

    const libSnap = await db.collection("users").doc(uid).collection("library").get();
    const gameIds = libSnap.docs.map((d) => d.id);

    if (gameIds.length === 0) {
      return res.status(200).json({ items: [] });
    }

    // map gameId -> gameName
    const CHUNK_SIZE = 10;
    const chunks = [];
    for (let i = 0; i < gameIds.length; i += CHUNK_SIZE) {
      chunks.push(gameIds.slice(i, i + CHUNK_SIZE));
    }

    const gamesMap = new Map();
    for (const chunk of chunks) {
      const gamesSnap = await db
        .collection("game_catalog")
        .where("__name__", "in", chunk)
        .get();

      gamesSnap.forEach((doc) => {
        const data = doc.data() || {};
        gamesMap.set(doc.id, data.name || "");
      });
    }

    // flatten sessions
    const items = [];
    for (const gameId of gameIds) {
      const sessionsSnap = await db
        .collection("users")
        .doc(uid)
        .collection("library")
        .doc(gameId)
        .collection("sessions")
        .get();

      sessionsSnap.forEach((s) => {
        const sd = s.data() || {};
        items.push({
          id: s.id,
          gameId,
          gameName: gamesMap.get(gameId) || "",
          createdAt: sd.createdAt || null,
          durationMinutes: sd.durationMinutes ?? null,
          winner: sd.winner ?? "",
          playersText: sd.playersText ?? "",
        });
      });
    }

    // sort newest first
    items.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dbt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dbt - da;
    });

    return res.status(200).json({ items });
  } catch (error) {
    console.error("Get all sessions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllSessions };
