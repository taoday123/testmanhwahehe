const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const FILE = "data.json";

// Tạo file nếu chưa có
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({
    views: 0,
    orders: 0
  }));
}

// API lấy dữ liệu
app.get("/api/data", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  res.json(data);
});

// API tăng view
app.post("/api/view", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  data.views += 1;
  fs.writeFileSync(FILE, JSON.stringify(data));
  res.json(data);
});

// API mua hàng
app.post("/api/buy", (req, res) => {
  const data = JSON.parse(fs.readFileSync(FILE));
  data.orders += 1;
  fs.writeFileSync(FILE, JSON.stringify(data));
  res.json({ message: "Đặt hàng thành công!" });
});

// Trang web
app.get("*", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Fake Shop</title>
<style>
body {
  font-family: Arial;
  text-align: center;
  background: #f4f4f4;
}
.card {
  background: white;
  padding: 20px;
  margin: 50px auto;
  width: 320px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
button {
  padding: 10px 20px;
  background: black;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}
button:hover {
  background: #333;
}
.small {
  font-size: 12px;
  color: gray;
}
</style>
</head>
<body>

<div class="card">
  <h2>🔥 Fake Product</h2>
  <p>Giá: 999.000đ</p>
  <p>Lượt xem: <span id="views">0</span></p>
  <p>Số đơn hàng: <span id="orders">0</span></p>
  <button onclick="buy()">Mua Ngay</button>
  <p class="small">Trang tự cập nhật mỗi 30 giây</p>
</div>

<script>
function loadData() {
  fetch("/api/data")
    .then(res => res.json())
    .then(data => {
      document.getElementById("views").innerText = data.views;
      document.getElementById("orders").innerText = data.orders;
    })
    .catch(err => console.log("Lỗi load data:", err));
}

function buy() {
  fetch("/api/buy", { method: "POST" })
    .then(res => res.json())
    .then(() => {
      alert("Đặt hàng thành công!");
      loadData();
    })
    .catch(err => console.log("Lỗi mua hàng:", err));
}

// 🔥 Tăng view 1 lần khi vào trang
fetch("/api/view", { method: "POST" })
  .then(loadData);

// 🔥 Tự động cập nhật mỗi 30 giây
setInterval(() => {
  loadData();
}, 30000);
</script>

</body>
</html>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
