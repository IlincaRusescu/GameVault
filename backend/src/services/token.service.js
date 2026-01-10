const jwt = require("jsonwebtoken");

function signAppToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

  if (!secret) throw new Error("Missing JWT_SECRET in .env");

  return jwt.sign(payload, secret, { expiresIn });
}

function verifyAppToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in .env");
  return jwt.verify(token, secret);
}

module.exports = { signAppToken, verifyAppToken };
