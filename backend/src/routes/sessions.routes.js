const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const { getAllSessions } = require("../controllers/sessions.controller");

const router = express.Router();

router.get("/", requireAuth, getAllSessions);

module.exports = router;
