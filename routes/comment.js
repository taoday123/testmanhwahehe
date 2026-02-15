const express = require("express");
const { readDB, writeDB } = require("../utils/db");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:storyId", (req, res) => {
  const db = readDB();
  res.json(db.comments?.[req.params.storyId] || []);
});

router.post("/:storyId", auth, (req, res) => {
  const db = readDB();

  if (!db.comments) db.comments = {};
  if (!db.comments[req.params.storyId])
    db.comments[req.params.storyId] = [];

  db.comments[req.params.storyId].push({
    user: req.user.id,
    text: req.body.text
  });

  writeDB(db);
  res.json({ message: "Comment added" });
});

module.exports = router;

