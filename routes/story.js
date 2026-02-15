const express = require("express");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

/*
=====================================
GET ALL STORIES
Có thể:
- /api/stories
- /api/stories?search=abc
- /api/stories?sort=top
=====================================
*/
router.get("/", (req, res) => {
  const db = readDB();
  let stories = db.stories || [];

  // Search theo title
  if (req.query.search) {
    const keyword = req.query.search.toLowerCase();
    stories = stories.filter(story =>
      story.title.toLowerCase().includes(keyword)
    );
  }

  // Sort theo view
  if (req.query.sort === "top") {
    stories = stories.sort((a, b) => b.views - a.views);
  }

  res.json(stories);
});

/*
=====================================
GET DETAIL STORY
=====================================
*/
router.get("/:id", (req, res) => {
  const db = readDB();
  const story = db.stories.find(s => s.id === req.params.id);

  if (!story)
    return res.status(404).json({ message: "Story not found" });

  res.json(story);
});

/*
=====================================
INCREASE VIEW (REAL)
POST /api/stories/:id/view
=====================================
*/
router.post("/:id/view", (req, res) => {
  const db = readDB();
  const story = db.stories.find(s => s.id === req.params.id);

  if (!story)
    return res.status(404).json({ message: "Story not found" });

  story.views += 1;

  // Optional: thêm viewToday để sau này làm top ngày
  if (!story.viewToday) story.viewToday = 0;
  story.viewToday += 1;

  writeDB(db);

  res.json({
    message: "View increased",
    views: story.views
  });
});

/*
=====================================
DELETE STORY (Admin sau này dùng)
=====================================
*/
router.delete("/:id", (req, res) => {
  const db = readDB();

  const index = db.stories.findIndex(s => s.id === req.params.id);
  if (index === -1)
    return res.status(404).json({ message: "Story not found" });

  db.stories.splice(index, 1);
  writeDB(db);

  res.json({ message: "Deleted successfully" });
});

module.exports = router;
