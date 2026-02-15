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

// React + 2 trang trong 1 file
app.get("*", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>View Counter</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/react-router-dom/umd/react-router-dom.min.js"></script>
  </head>
  <body>
    <div id="root"></div>

    <script>
      const { BrowserRouter, Routes, Route, Link } = ReactRouterDOM;
      const { useState, useEffect } = React;

      function Page1() {
        const [views, setViews] = useState(0);

        useEffect(() => {
          fetch("/api/views")
            .then(res => res.json())
            .then(data => setViews(data.views));
        }, []);

        return React.createElement("div", null,
          React.createElement("h1", null, "Trang 1"),
          React.createElement("h2", null, "Lượt xem: " + views),
          React.createElement(Link, { to: "/page2" }, "Đi tới Trang 2")
        );
      }

      function Page2() {
        useEffect(() => {
          fetch("/api/views", { method: "POST" });
        }, []);

        return React.createElement("div", null,
          React.createElement("h1", null, "Trang 2"),
          React.createElement("p", null, "Đã tính 1 lượt xem 👀"),
          React.createElement(Link, { to: "/" }, "Quay lại Trang 1")
        );
      }

      function App() {
        return React.createElement(BrowserRouter, null,
          React.createElement(Routes, null,
            React.createElement(Route, { path: "/", element: React.createElement(Page1) }),
            React.createElement(Route, { path: "/page2", element: React.createElement(Page2) })
          )
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
app.listen(PORT, () => console.log("Server running"));
