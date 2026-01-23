const express = require("express");
const { addToLibrary, getLibrary } = require("../controllers/library.controller");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/", requireAuth, getLibrary);
router.post("/:gameId", requireAuth, addToLibrary);

module.exports = router;
