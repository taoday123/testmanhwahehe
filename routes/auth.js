const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { readDB, writeDB } = require("../utils/db");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const SECRET = "supersecretkey";

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  if (db.users.find(u => u.username === username))
    return res.json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);

  db.users.push({
    id: uuidv4(),
    username,
    password: hashed,
    role: "user"
  });

  writeDB(db);
  res.json({ message: "Registered" });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  const user = db.users.find(u => u.username === username);
  if (!user) return res.json({ message: "Not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

module.exports = router;
