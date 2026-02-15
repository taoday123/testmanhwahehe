const express = require("express");
const fs = require("fs");
const session = require("express-session");
const crypto = require("crypto");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "super-secret",
  resave: false,
  saveUninitialized: true
}));

const FILE = "data.json";

/* ================= INIT DATA ================= */

if (!fs.existsSync(FILE)) {
  const stories = [];
  for (let i = 1; i <= 10; i++) {
    stories.push({
      id: i,
      title: "Truyện VIP " + i,
      views: 0,
      likes: 0,
      comments: []
    });
  }

  fs.writeFileSync(FILE, JSON.stringify({
    users: [
      { username: "admin", password: hash("admin"), role: "admin" }
    ],
    stories
  }));
}

function getData() {
  return JSON.parse(fs.readFileSync(FILE));
}

function saveData(data) {
  fs.writeFileSync(FILE, JSON.stringify(data));
}

function hash(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/* ================= AUTH ================= */

app.get("/register", (req,res)=>res.send(authPage("Register","/register")));
app.get("/login", (req,res)=>res.send(authPage("Login","/login")));

app.post("/register",(req,res)=>{
  const data = getData();
  const {username,password} = req.body;

  if(data.users.find(u=>u.username===username))
    return res.send("User tồn tại");

  data.users.push({ username, password: hash(password), role:"user" });
  saveData(data);
  res.redirect("/login");
});

app.post("/login",(req,res)=>{
  const data = getData();
  const {username,password} = req.body;

  const user = data.users.find(u=>
    u.username===username && u.password===hash(password)
  );

  if(!user) return res.send("Sai thông tin");

  req.session.user = user;
  res.redirect("/");
});

app.get("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect("/");
});

/* ================= API ================= */

app.get("/api/stories",(req,res)=>{
  const data = getData();
  res.json(data.stories.sort((a,b)=>b.views-a.views));
});

app.post("/api/view/:id",(req,res)=>{
  const data = getData();
  const story = data.stories.find(s=>s.id==req.params.id);
  if(story){ story.views++; saveData(data); }
  res.json({ok:true});
});

app.post("/api/like/:id",(req,res)=>{
  if(!req.session.user) return res.json({error:"login required"});
  const data = getData();
  const story = data.stories.find(s=>s.id==req.params.id);
  if(story){ story.likes++; saveData(data); }
  res.json({ok:true});
});

app.post("/api/comment/:id",(req,res)=>{
  if(!req.session.user) return res.json({error:"login required"});
  const data = getData();
  const story = data.stories.find(s=>s.id==req.params.id);
  if(story){
    story.comments.push({
      user:req.session.user.username,
      text:req.body.text,
      time:Date.now()
    });
    saveData(data);
  }
  res.json({ok:true});
});

/* ================= PAGES ================= */

app.get("/",(req,res)=>res.send(homePage(req.session.user)));

app.get("/story/:id",(req,res)=>{
  if(!req.session.user) return res.redirect("/login");
  res.send(storyPage(req.params.id, req.session.user));
});

app.get("/admin",(req,res)=>{
  if(!req.session.user || req.session.user.role!=="admin")
    return res.send("Không có quyền");

  const data = getData();
  res.send(adminPage(data));
});

/* ================= UI ================= */

function homePage(user){
return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>WebTruyen Pro</title>
<style>
body{background:#0f0f0f;color:white;font-family:Arial;text-align:center}
.top{padding:20px;background:#1a1a1a}
.card{
 background:#1f1f1f;
 padding:15px;
 margin:10px;
 width:230px;
 display:inline-block;
 border-radius:10px;
 cursor:pointer;
 transition:.3s;
}
.card:hover{transform:scale(1.05);background:#2a2a2a}
a{color:orange;text-decoration:none}
.hot{color:red}
</style>
</head>
<body>

<div class="top">
<h1>🔥 Web Truyện HOT</h1>
${user ? `Xin chào ${user.username} | <a href="/logout">Logout</a> ${user.role==="admin"?"| <a href='/admin'>Admin</a>":""}`
: `<a href="/login">Login</a> | <a href="/register">Register</a>`}
</div>

<div id="list"></div>

<script>
function load(){
 fetch("/api/stories")
 .then(r=>r.json())
 .then(data=>{
  document.getElementById("list").innerHTML =
  data.map((s,i)=>\`
   <div class="card" onclick="location='/story/\${s.id}'">
     <h3>\${i==0?"🔥 HOT #1":""} \${s.title}</h3>
     <p>👁 \${s.views} | ❤️ \${s.likes}</p>
   </div>
  \`).join("");
 });
}
load();
setInterval(load,4000);
</script>

</body>
</html>
`;
}

function storyPage(id,user){
return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Truyện ${id}</title>
<style>
body{background:#0f0f0f;color:white;font-family:Arial;text-align:center}
button{padding:8px 15px;background:orange;border:none;border-radius:5px}
.comment{background:#1f1f1f;margin:5px;padding:5px;border-radius:5px}
</style>
</head>
<body>

<h1>📖 Truyện ${id}</h1>
<p>Nội dung truyện cực hấp dẫn...</p>

<button onclick="like()">❤️ Like</button>
<br><br>

<h3>Bình luận</h3>
<input id="cmt" placeholder="Viết bình luận">
<button onclick="send()">Gửi</button>

<div id="comments"></div>

<a href="/">⬅ Về trang chủ</a>

<script>
fetch("/api/view/${id}",{method:"POST"});

function load(){
 fetch("/api/stories")
 .then(r=>r.json())
 .then(data=>{
   const s=data.find(x=>x.id==${id});
   document.getElementById("comments").innerHTML =
    s.comments.map(c=>\`
      <div class="comment">
        <b>\${c.user}</b>: \${c.text}
      </div>
    \`).join("");
 });
}

function like(){
 fetch("/api/like/${id}",{method:"POST"})
 .then(load);
}

function send(){
 fetch("/api/comment/${id}",{
   method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({text:document.getElementById("cmt").value})
 }).then(()=>{document.getElementById("cmt").value="";load();});
}

load();
setInterval(load,4000);
</script>

</body>
</html>
`;
}

function authPage(title,action){
return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
body{background:#0f0f0f;color:white;text-align:center;font-family:Arial}
input{padding:10px;margin:5px;border-radius:5px;border:none}
button{padding:10px 20px;background:orange;border:none;border-radius:5px}
</style>
</head>
<body>
<h1>${title}</h1>
<form method="POST" action="${action}">
<input name="username" required placeholder="Username"><br>
<input type="password" name="password" required placeholder="Password"><br>
<button>${title}</button>
</form>
</body>
</html>
`;
}

function adminPage(data){
return `
<h1>Admin Panel</h1>
${data.stories.map(s=>`<p>${s.title} - ${s.views} views - ${s.likes} likes</p>`).join("")}
<a href="/">Về trang chủ</a>
`;
}

const PORT = process.env.PORT || 10000;
app.listen(PORT,()=>console.log("Server running"));
