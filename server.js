const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const FILE = "views.json";

// tạo file nếu chưa có
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({ views: 0 }));
}

// API lấy view
app.get("/api/views", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  res.json(data);
});

// API tăng view
app.post("/api/views", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  data.views += 1;
  fs.writeFileSync(FILE, JSON.stringify(data));
  res.json(data);
});

// Frontend 2 trang trong 1 file
app.get("*", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Simple View Counter</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
</head>
<body>
<div id="root"></div>

<script>
const { useState, useEffect } = React;

function App() {
  const [views, setViews] = useState(0);
  const [page, setPage] = useState(window.location.pathname);

  useEffect(() => {
    if (page === "/") {
      fetch("/api/views")
        .then(res => res.json())
        .then(data => setViews(data.views));
    }

    if (page === "/page2") {
      fetch("/api/views", { method: "POST" });
    }
  }, [page]);

  if (page === "/page2") {
    return React.createElement("div", null,
      React.createElement("h1", null, "Trang 2"),
      React.createElement("p", null, "Đã +1 view 👀"),
      React.createElement("button", {
        onClick: () => {
          window.history.pushState({}, "", "/");
          setPage("/");
        }
      }, "Quay lại Trang 1")
    );
  }

  return React.createElement("div", null,
    React.createElement("h1", null, "Trang 1"),
    React.createElement("h2", null, "Lượt xem: " + views),
    React.createElement("button", {
      onClick: () => {
        window.history.pushState({}, "", "/page2");
        setPage("/page2");
      }
    }, "Đi tới Trang 2")
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(App)
);
</script>

</body>
</html>
`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
