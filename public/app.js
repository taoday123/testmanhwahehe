const params = new URLSearchParams(window.location.search);
const storyId = params.get("id");

async function loadDetail() {
  if (!storyId) return;

  const res = await fetch("/api/stories");
  const stories = await res.json();
  const story = stories.find(s => s.id === storyId);

  document.getElementById("detail").innerHTML = `
    <h2>${story.title}</h2>
    <p>${story.description}</p>
    <p>👁 <span id="viewCount">${story.views}</span></p>
    <button onclick="readStory()">Đọc ngay</button>
  `;

  // tăng view không cần reload
  const viewRes = await fetch(`/api/stories/${storyId}/view`, { method: "POST" });
  const viewData = await viewRes.json();
  document.getElementById("viewCount").innerText = viewData.views;

  loadComments();
}

function readStory() {
  window.location.href = "reader.html?id=" + storyId;
}

async function loadComments() {
  const res = await fetch("/api/comments/" + storyId);
  const comments = await res.json();

  const box = document.getElementById("comments");
  box.innerHTML = comments.map(c => `
    <p><b>${c.user}</b>: ${c.text}</p>
  `).join("");
}

async function sendComment() {
  const token = localStorage.getItem("token");
  if (!token) return alert("Login trước");

  await fetch("/api/comments/" + storyId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token
    },
    body: JSON.stringify({ text: commentInput.value })
  });

  commentInput.value = "";
  loadComments();
}

async function loadReader() {
  if (!storyId) return;

  const res = await fetch("/api/chapters/" + storyId);
  const images = await res.json();

  document.getElementById("reader").innerHTML =
    images.map(img => `<img src="${img}" style="width:100%">`).join("");
}

if (window.location.pathname.includes("story-detail"))
  loadDetail();

if (window.location.pathname.includes("reader"))
  loadReader();
