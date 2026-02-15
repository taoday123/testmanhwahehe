const jwt = require("jsonwebtoken");
const SECRET = "supersecretkey";

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
}

module.exports = { auth, adminOnly };
