const express = require("express");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

/* =========================
   GET ALL STORIES
========================= */
router.get("/", (req, res) => {
  const db = readDB();

  if (!db.stories) db.stories = [];

  const stories = db.stories.sort((a, b) => b.views - a.views);

  res.json(stories);
});

/* =========================
   GET STORY DETAIL
========================= */
router.get("/:id", (req, res) => {
  const db = readDB();
  const story = db.stories.find(s => s.id === req.params.id);

  if (!story) {
    return res.status(404).json({ message: "Story not found" });
  }

  res.json(story);
});

/* =========================
   INCREASE VIEW (REAL)
========================= */
router.post("/:id/view", (req, res) => {
  const db = readDB();
  const story = db.stories.find(s => s.id === req.params.id);

  if (!story) {
    return res.status(404).json({ message: "Story not found" });
  }

  story.views = (story.views || 0) + 1;

  writeDB(db);

  console.log("View increased:", story.id, "=>", story.views);

  res.json({
    success: true,
    views: story.views
  });
});

module.exports = router;
