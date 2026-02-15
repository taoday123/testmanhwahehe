const express = require("express");
const path = require("path");

const authRoutes = require("./routes/auth");
const storyRoutes = require("./routes/story");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/admin", adminRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(3000, () => console.log("Server running on port 3000"));
