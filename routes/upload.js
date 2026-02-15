const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });
const router = express.Router();

router.post("/", upload.array("images"), (req, res) => {
  const files = req.files.map(f => "/uploads/" + f.filename);
  res.json(files);
});

module.exports = router;

