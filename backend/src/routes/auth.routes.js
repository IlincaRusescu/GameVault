const express = require("express");
const {
  register,
  login,
  me,
  checkUsername,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

// public
router.get("/check-username", checkUsername); //GET /api/auth/check-username?username=ana_12
router.post("/register", register); //POST /api/auth/register
router.post("/login", login); //POST /api/auth/login
router.post("/forgot-password", forgotPassword); //POST /api/auth/forgot-password
router.post("/reset-password", resetPassword); //POST /api/auth/reset-password

// protected
router.get("/me", requireAuth, me);

module.exports = router;
