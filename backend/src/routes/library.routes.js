const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const {
  addToLibrary,
  deleteFromLibrary,
  getLibrary,
  createSession,
  getSessions,
  updateSession,
  deleteSession,
} = require("../controllers/library.controller");

const router = express.Router();

// library
router.get("/", requireAuth, getLibrary);
router.post("/:gameId", requireAuth, addToLibrary);
router.delete("/:gameId", requireAuth, deleteFromLibrary);

// sessions CRUD
router.post("/:gameId/sessions", requireAuth, createSession);
router.get("/:gameId/sessions", requireAuth, getSessions);
router.put("/:gameId/sessions/:sessionId", requireAuth, updateSession);
router.delete("/:gameId/sessions/:sessionId", requireAuth, deleteSession);

module.exports = router;
