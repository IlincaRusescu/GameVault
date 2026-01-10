const { verifyAppToken } = require("../services/token.service");

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Missing or invalid Authorization header." });
    }

    const decoded = verifyAppToken(token);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = { requireAuth };
