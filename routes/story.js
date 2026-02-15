const express = require("express");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

router.get("/", (req, res) => {
  const db = readDB();
  res.json(db.stories.sort((a,b)=>b.views-a.views));
});

router.get("/:id", (req, res) => {
  const db = readDB();
  const story = db.stories.find(s => s.id === req.params.id);

  if (!story) return res.status(404).json({ message: "Not found" });

  story.views += 1;
  writeDB(db);

  res.json(story);
});

module.exports = router;
