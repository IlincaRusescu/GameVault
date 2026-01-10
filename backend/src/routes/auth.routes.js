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
router.get("/check-username", checkUsername);
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// protected
router.get("/me", requireAuth, me);

module.exports = router;
