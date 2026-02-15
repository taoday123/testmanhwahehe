const express = require("express");
const { readDB, writeDB } = require("../utils/db");
const { auth, adminOnly } = require("../middleware/authMiddleware");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

router.post("/add", auth, adminOnly, (req, res) => {
  const { title, description } = req.body;
  const db = readDB();

  db.stories.push({
    id: uuidv4(),
    title,
    description,
    views: 0
  });

  writeDB(db);
  res.json({ message: "Added" });
});

module.exports = router;
