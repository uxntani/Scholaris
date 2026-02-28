/* =========================
   AUTH GUARD
========================= */
const authToken = localStorage.getItem("authToken");


if (!authToken) {
  window.location.href = "auth.html";
}


/* =========================
   API CONFIG
========================= */
const API_URL = "http://127.0.0.1:8000/analyze";


/* =========================
   CHAT STATE
========================= */
let conversations = JSON.parse(localStorage.getItem("scholaris_conversations")) || [];
let currentConversationId = null;
let pendingFile = null; /* CHANGED line: grouped with state vars; holds chosen file until send */


function saveConversations() {
  localStorage.setItem("scholaris_conversations", JSON.stringify(conversations));
}


/* =========================
   INPUT & PROMPTS
========================= */
function usePrompt(text) {
  document.getElementById("messageInput").value = text;
}


function handleKeyPress(e) {
  if (e.key === "Enter") sendMessage();
}


/* =========================
   SEND MESSAGE
========================= */
async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();


  /* CHANGED line: allow send when a file is attached even if no text was typed */
  if (!message && !pendingFile) return;


  createConversationIfNeeded(message || pendingFile.name);


  /* CHANGED lines: route to file-aware bubble when a file is pending */
  if (pendingFile) {
    addMessageWithFile(message, pendingFile);
    saveMessage(message ? `[File: ${pendingFile.name}] ${message}` : `[File: ${pendingFile.name}]`, "user");
  } else {
    addMessage(message, "user");
    saveMessage(message, "user");
  }


  input.value = "";


  /* CHANGED lines: read file as base64 so it can be sent in the API body */
  let fileDataUrl = null;
  let fileType = null;
  if (pendingFile) {
    fileDataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(pendingFile);
    });
    fileType = pendingFile.type;
    /* CHANGED lines: clear file state and the pill indicator after reading */
    pendingFile = null;
    document.getElementById("fileIndicator").textContent = "";
  }


  document.getElementById("typingIndicator").style.display = "block";
  document.getElementById("aiStatus").style.display = "block";


  try {
    /* CHANGED lines: include file_data and file_type in the API payload when a file was attached */
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        subject: "General",
        question: message,
        student_solution: message,
        file_data: fileDataUrl || null,  /* ADDED line: base64-encoded file, null if none */
        file_type: fileType || null       /* ADDED line: MIME type of the file, null if none */
      })
    });


    const data = await response.json();
    const aiReply = data.reply || "No response from AI.";


    addMessage(aiReply, "ai");
    saveMessage(aiReply, "ai");


  } catch (err) {
    const errorMsg = "Backend not responding.";
    addMessage(errorMsg, "ai");
    saveMessage(errorMsg, "ai");
  } finally {
    document.getElementById("typingIndicator").style.display = "none";
    document.getElementById("aiStatus").style.display = "none";
  }
}


/* =========================
   CONVERSATIONS
========================= */
function createConversationIfNeeded(firstMessage) {
  if (currentConversationId) return;


  const conversation = {
    id: "conv_" + Date.now(),
    title: firstMessage.slice(0, 30),
    messages: []
  };


  conversations.unshift(conversation);
  currentConversationId = conversation.id;
  saveConversations();
  renderChatHistory();
}


function saveMessage(text, role) {
  const convo = conversations.find(c => c.id === currentConversationId);
  if (!convo) return;


  convo.messages.push({ role, text });
  saveConversations();
}


/* =========================
   CHAT HISTORY UI
========================= */
function renderChatHistory() {
  const list = document.getElementById("chatHistoryList");
  if (!list) return;


  list.innerHTML = "";


  conversations.forEach(conv => {
    const item = document.createElement("div");
    item.className = "chat-history-item";
    if (conv.id === currentConversationId) item.classList.add("active");


    const title = document.createElement("span");
    title.className = "chat-title";
    title.textContent = conv.title || "New chat";
    title.onclick = () => loadConversation(conv.id);


    const actions = document.createElement("div");
    actions.className = "chat-actions";


    const renameBtn = document.createElement("i");
    renameBtn.className = "fa-solid fa-pen";
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      renameConversation(conv.id);
    };


    const deleteBtn = document.createElement("i");
    deleteBtn.className = "fa-solid fa-trash";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      deleteConversation(conv.id);
    };


    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);


    item.appendChild(title);
    item.appendChild(actions);
    list.appendChild(item);
  });
}


function loadConversation(id) {
  currentConversationId = id;
  document.getElementById("messagesArea").innerHTML = "";


  const convo = conversations.find(c => c.id === id);
  if (!convo) return;


  convo.messages.forEach(msg => {
    addMessage(msg.text, msg.role);
  });


  renderChatHistory();
  closePanels();
}


/* =========================
   RENAME & DELETE
========================= */
function renameConversation(id) {
  const convo = conversations.find(c => c.id === id);
  if (!convo) return;


  const newTitle = prompt("Rename conversation:", convo.title);
  if (!newTitle) return;


  convo.title = newTitle.trim();
  saveConversations();
  renderChatHistory();
}


function deleteConversation(id) {
  if (!confirm("Delete this conversation?")) return;


  conversations = conversations.filter(c => c.id !== id);


  if (currentConversationId === id) {
    currentConversationId = null;
    document.getElementById("messagesArea").innerHTML = "";
  }


  saveConversations();
  renderChatHistory();
}


/* =========================
   MESSAGE UI
========================= */
function addMessage(text, sender) {
  const area = document.getElementById("messagesArea");
  const div = document.createElement("div");
  div.className = `message ${sender}-message`;
  div.textContent = text;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}


/* ADDED function: renders a user bubble with an image preview or filename chip + optional text */
function addMessageWithFile(text, file) {
  const area = document.getElementById("messagesArea");
  const div = document.createElement("div");
  div.className = "message user-message";


  if (file.type.startsWith("image/")) {
    const img = document.createElement("img"); /* ADDED lines: inline thumbnail inside the bubble */
    img.style.display = "block";
    img.style.maxWidth = "200px";
    img.style.borderRadius = "8px";
    img.style.marginBottom = text ? "8px" : "0";
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.readAsDataURL(file);
    div.appendChild(img);
  } else {
    const label = document.createElement("span"); /* ADDED lines: filename chip for non-image files */
    label.textContent = "📎 " + file.name;
    label.style.fontSize = "13px";
    label.style.display = "block";
    label.style.marginBottom = text ? "6px" : "0";
    div.appendChild(label);
  }


  if (text) { div.appendChild(document.createTextNode(text)); }
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}


/* =========================
   PANEL CONTROLS
========================= */
const analyticsPanel = document.getElementById("analyticsPanel");
const profilePanel = document.getElementById("profilePanel");
const overlay = document.getElementById("overlay");


function toggleAnalytics() {
  const isOpen = analyticsPanel.classList.contains("active");
  closePanels();
  if (!isOpen) {
    analyticsPanel.classList.add("active");
    overlay.classList.add("active");
    renderChatHistory();
  }
}


function toggleProfile() {
  const isOpen = profilePanel.classList.contains("active");
  closePanels();
  if (!isOpen) {
    profilePanel.classList.add("active");
    overlay.classList.add("active");
  }
}


function closePanels() {
  analyticsPanel.classList.remove("active");
  profilePanel.classList.remove("active");
  overlay.classList.remove("active");
}


function clearChat() {
  document.getElementById("messagesArea").innerHTML = "";
  currentConversationId = null;
}


/* =========================
   PROFILE
========================= */


let selectedAvatarImage = null;


function saveProfile() {
  const name = document.getElementById("nameInput").value.trim();
  if (!name) return;


  localStorage.setItem("username", name);


  // Save avatar if selected
  if (selectedAvatarImage) {
    localStorage.setItem("profileAvatar", selectedAvatarImage);


    const sidebarAvatar = document.getElementById("sidebarAvatar");
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = `<img src="${selectedAvatarImage}" />`;
    }
  }


  closePanels();
}


window.addEventListener("DOMContentLoaded", () => {
  renderChatHistory();


  const savedName = localStorage.getItem("username");
  if (savedName) {
    document.getElementById("nameInput").value = savedName;
  }


  // Load saved avatar on refresh
  const savedAvatar = localStorage.getItem("profileAvatar");
  if (savedAvatar) {
    const sidebarAvatar = document.getElementById("sidebarAvatar");
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = `<img src="${savedAvatar}" />`;
    }


    const profilePreview = document.getElementById("profilePreview");
    if (profilePreview) {
      profilePreview.innerHTML = `
        <img src="${savedAvatar}" class="profile-image" />
      `;
    }


    selectedAvatarImage = savedAvatar;
  }


  const presetAvatars = [
    "avatar/avatar1.jpg",
    "avatar/avatar2.jpg",
    "avatar/avatar3.jpg",
    "avatar/avatar4.jpg",
    "avatar/avatar5.jpg",
    "avatar/avatar6.jpg",
    "avatar/avatar7.jpg",
  ];


  const avatarsGrid = document.getElementById("avatarsGrid");


  if (avatarsGrid) {
    avatarsGrid.innerHTML = "";


    presetAvatars.forEach(src => {
      const div = document.createElement("div");
      div.className = "avatar-option";


      const img = document.createElement("img");
      img.src = src;


      div.appendChild(img);


      div.onclick = () => {
        selectedAvatarImage = src;


        document.querySelectorAll(".avatar-option")
          .forEach(a => a.classList.remove("selected"));


        div.classList.add("selected");


        const profilePreview = document.getElementById("profilePreview");
        profilePreview.innerHTML = `
          <img src="${src}" class="profile-image" />
        `;
      };


      avatarsGrid.appendChild(div);


      const savedAvatar = localStorage.getItem("profileAvatar");
      if (savedAvatar && savedAvatar === src) {
        div.classList.add("selected");
      }
    });
  }


});

function logout() {
  localStorage.removeItem("authToken");
  window.location.href = "auth.html";
}


function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;


  pendingFile = file;  


  const indicator = document.getElementById("fileIndicator");
  indicator.innerHTML =
    '<span class="file-indicator">📎 ' + file.name +
    ' <span style="cursor:pointer;margin-left:4px;" onclick="clearPendingFile()">&#x2715;</span></span>';


  event.target.value = "";  
}


function clearPendingFile() {
  pendingFile = null;
  document.getElementById("fileIndicator").textContent = "";
}


const fileInput = document.getElementById("fileInput");
const profilePreview = document.getElementById("profilePreview");


fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];


  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();


    reader.onload = function (e) {
      selectedAvatarImage = e.target.result;


      profilePreview.innerHTML = `
        <img src="${selectedAvatarImage}" class="profile-image" />
      `;
    };


    reader.readAsDataURL(file);
  }
});



const plannerPanel = document.getElementById("plannerPanel");

function togglePlanner() {
  const isOpen = plannerPanel.classList.contains("active");
  closePanels();
  if (!isOpen) {
    plannerPanel.classList.add("active");
    overlay.classList.add("active");
    initPlanner();
  }
}

const _origClosePanels = closePanels;
closePanels = function () {
  _origClosePanels();
  if (plannerPanel) plannerPanel.classList.remove("active");
};


let plannerWeekOffset = 0;   
let plannerIntervalMins = 60; 

/* ---- Init ---- */
function initPlanner() {
  loadPlannerData();
  generateWeek();
}


function getWeekDates(offsetWeeks) {
  const now = new Date();
  const dayOfWeek = now.getDay(); 
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) + offsetWeeks * 7);
  monday.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function fmtDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function fmtTime(totalMins) {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function changeWeek(dir) {
  plannerWeekOffset += dir;
  generateWeek();
}


function generateWeek() {
 
  const valEl = document.getElementById("plannerIntervalValue");
  const unitEl = document.getElementById("plannerIntervalUnit");
  const val = parseInt(valEl.value) || 1;
  plannerIntervalMins = unitEl.value === "hours" ? val * 60 : val;
  if (plannerIntervalMins < 1) plannerIntervalMins = 1;
  if (plannerIntervalMins > 720) plannerIntervalMins = 720; // cap 12h

  const days = getWeekDates(plannerWeekOffset);
  const label = `${fmtDate(days[0])} – ${fmtDate(days[6])}`;
  document.getElementById("plannerWeekLabel").textContent = label;

  generateTimeGrid();
}


function generateTimeGrid() {

  const valEl = document.getElementById("plannerIntervalValue");
  const unitEl = document.getElementById("plannerIntervalUnit");
  const val = parseInt(valEl.value) || 1;
  plannerIntervalMins = unitEl.value === "hours" ? val * 60 : val;
  if (plannerIntervalMins < 1) plannerIntervalMins = 1;
  if (plannerIntervalMins > 720) plannerIntervalMins = 720;

  const days = getWeekDates(plannerWeekOffset);
  const slots = Math.floor((24 * 60) / plannerIntervalMins);
  const grid = document.getElementById("plannerGrid");
  grid.innerHTML = "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  days.forEach((day, di) => {
    const col = document.createElement("div");
    col.className = "planner-day-col";

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const hdr = document.createElement("div");
    hdr.className = "planner-day-header";
    if (day.getTime() === today.getTime()) hdr.classList.add("planner-today");

    const dn = document.createElement("div");
    dn.className = "planner-day-name";
    dn.textContent = dayNames[di];

    const dd = document.createElement("div");
    dd.className = "planner-day-date";
    dd.textContent = fmtDate(day);

    hdr.appendChild(dn);
    hdr.appendChild(dd);
    col.appendChild(hdr);

    for (let s = 0; s < slots; s++) {
      const startMins = s * plannerIntervalMins;
      const endMins = startMins + plannerIntervalMins;
      const cellKey = `planner_${fmtDate(day)}_${startMins}`;
      const stored = plannerData[cellKey] || { topic: "", complete: false };

      const cell = document.createElement("div");
      cell.className = "planner-cell";
      cell.dataset.key = cellKey;
      cell.dataset.day = fmtDate(day);
      cell.dataset.startMins = startMins;
      cell.dataset.dayTs = day.getTime();

     
      const timeLabel = document.createElement("div");
      timeLabel.className = "planner-cell-time";
      timeLabel.textContent = `${fmtTime(startMins)}–${fmtTime(endMins)}`;

   
      const topicEl = document.createElement("textarea");
      topicEl.className = "planner-topic-input";
      topicEl.rows = 1;
      topicEl.placeholder = "Add topic…";
      topicEl.value = stored.topic || "";
      topicEl.addEventListener("input", () => {
    
        if (cell.classList.contains("planner-complete")) {
          plannerData[cellKey].complete = false;
        }
        plannerData[cellKey] = plannerData[cellKey] || {};
        plannerData[cellKey].topic = topicEl.value;
        refreshCellState(cell, cellKey);
        savePlannerData();
        updateAnalytics();
      });
    
      topicEl.addEventListener("click", e => e.stopPropagation());

 
      const actions = document.createElement("div");
      actions.className = "planner-cell-actions";

      const tickBtn = document.createElement("button");
      tickBtn.className = "planner-tick-btn";
      tickBtn.title = "Mark complete";
      tickBtn.textContent = "✔";
      tickBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const now = new Date();
        const slotEnd = new Date(day);
        slotEnd.setHours(0, endMins, 0, 0);
        if (slotEnd > now) {
     
          tickBtn.textContent = "⛔";
          setTimeout(() => { tickBtn.textContent = "✔"; }, 1000);
          return;
        }
        plannerData[cellKey] = plannerData[cellKey] || {};
        plannerData[cellKey].complete = true;
        plannerData[cellKey].topic = topicEl.value;
        refreshCellState(cell, cellKey);
        savePlannerData();
        updateAnalytics();
      });

      actions.appendChild(tickBtn);
      cell.appendChild(timeLabel);
      cell.appendChild(topicEl);
      cell.appendChild(actions);
      col.appendChild(cell);

      refreshCellState(cell, cellKey);
    }

    grid.appendChild(col);
  });

  updateTaskStatusByTime();
  updateAnalytics();
}

function refreshCellState(cell, key) {
  const data = plannerData[key] || {};
  const startMins = parseInt(cell.dataset.startMins);
  const endMins = startMins + plannerIntervalMins;
  const dayTs = parseInt(cell.dataset.dayTs);
  const slotEnd = new Date(dayTs);
  slotEnd.setMinutes(slotEnd.getMinutes() + endMins);
  const now = new Date();
  const isFuture = slotEnd > now;

  cell.classList.remove("planner-pending", "planner-complete", "planner-missed");

  if (data.complete) {
    cell.classList.add("planner-complete");
  } else if (data.topic && isFuture) {
    cell.classList.add("planner-pending");
  } else if (data.topic && !isFuture) {
    cell.classList.add("planner-missed");
  }
}

function updateTaskStatusByTime() {
  const cells = document.querySelectorAll(".planner-cell");
  cells.forEach(cell => {
    refreshCellState(cell, cell.dataset.key);
  });
}
let plannerData = {};

function savePlannerData() {
  localStorage.setItem("scholaris_planner", JSON.stringify(plannerData));
  localStorage.setItem("scholaris_planner_week", plannerWeekOffset);
  localStorage.setItem("scholaris_planner_interval", plannerIntervalMins);
}

function loadPlannerData() {
  const raw = localStorage.getItem("scholaris_planner");
  plannerData = raw ? JSON.parse(raw) : {};

  const savedWeek = localStorage.getItem("scholaris_planner_week");
  if (savedWeek !== null) plannerWeekOffset = parseInt(savedWeek);

  const savedInterval = localStorage.getItem("scholaris_planner_interval");
  if (savedInterval !== null) {
    plannerIntervalMins = parseInt(savedInterval);
    // Restore controls
    const valEl = document.getElementById("plannerIntervalValue");
    const unitEl = document.getElementById("plannerIntervalUnit");
    if (plannerIntervalMins % 60 === 0) {
      valEl.value = plannerIntervalMins / 60;
      unitEl.value = "hours";
    } else {
      valEl.value = plannerIntervalMins;
      unitEl.value = "minutes";
    }
  }
}
function updateAnalytics() {
  const days = getWeekDates(plannerWeekOffset);
  const slots = Math.floor((24 * 60) / plannerIntervalMins);
  const now = new Date();

  let total = 0, completed = 0, missed = 0, pending = 0;
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayStats = days.map(() => ({ comp: 0, total: 0 }));

  days.forEach((day, di) => {
    for (let s = 0; s < slots; s++) {
      const startMins = s * plannerIntervalMins;
      const endMins = startMins + plannerIntervalMins;
      const key = `planner_${fmtDate(day)}_${startMins}`;
      const data = plannerData[key];
      if (!data || !data.topic) continue;

      const slotEnd = new Date(day);
      slotEnd.setMinutes(slotEnd.getMinutes() + endMins);
      const isFuture = slotEnd > now;

      total++;
      dayStats[di].total++;
      if (data.complete) { completed++; dayStats[di].comp++; }
      else if (!isFuture) missed++;
      else pending++;
    }
  });

  const statsRow = document.getElementById("plannerStatsRow");
  statsRow.innerHTML = `
    <div class="planner-stat-chip">Total <span>${total}</span></div>
    <div class="planner-stat-chip">✅ Done <span>${completed}</span></div>
    <div class="planner-stat-chip">❌ Missed <span>${missed}</span></div>
    <div class="planner-stat-chip">⏳ Pending <span>${pending}</span></div>
  `;

  const barsEl = document.getElementById("plannerBars");
  barsEl.innerHTML = "";
  days.forEach((day, di) => {
    const { comp, total: dt } = dayStats[di];
    const pct = dt > 0 ? Math.round((comp / dt) * 100) : 0;
    const row = document.createElement("div");
    row.className = "planner-bar-row";
    row.innerHTML = `
      <div class="planner-bar-label">${dayNames[di]}</div>
      <div class="planner-bar-track"><div class="planner-bar-fill" style="width:${pct}%"></div></div>
      <div class="planner-bar-pct">${pct}%</div>
    `;
    barsEl.appendChild(row);
  });
}

setInterval(() => {
  if (plannerPanel.classList.contains("active")) {
    updateTaskStatusByTime();
updateAnalytics();

const analyticsEl = document.getElementById("plannerAnalytics");
if (analyticsEl && !analyticsEl.classList.contains("expanded")) {
  analyticsEl.classList.add("expanded");
}

  }
}, 60000);

function togglePlannerAnalytics() {
  const panel = document.getElementById("plannerAnalytics");
  panel.classList.toggle("expanded");
}