![Screenshot](https://raw.githubusercontent.com/uxntani/Scholaris/refs/heads/main/readme-assets/logo.png)

<div align="center">
<br/>

**An AI-powered study workspace that combines chat, planning, and analytics — all in one place.**

<br/>

[![HTML](https://img.shields.io/badge/Frontend-HTML-e34f26?style=for-the-badge&logo=html5&logoColor=white)](https://github.com/uxntani/batchtrack)
[![CSS](https://img.shields.io/badge/Frontend-CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://github.com/uxntani/batchtrack)
[![JavaScript](https://img.shields.io/badge/Frontend-JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/uxntani/batchtrack)
[![Backend](https://img.shields.io/badge/Backend-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://github.com/uxntani/batchtrack)
[![AI Powered](https://img.shields.io/badge/AI-Powered-8b5cf6?style=for-the-badge&logo=openai&logoColor=white)](https://github.com/uxntani/batchtrack)

<br/>


</div>

---

## The Problem

Students today juggle **5+ different apps** just to study effectively — a chat tool, a planner, a notes app, a to-do list, and analytics dashboards. Context-switching kills focus.

**Scholaris fixes that.** Everything you need, in one clean interface.

---
## This is the Architecture Diagram

![Screenshot](https://raw.githubusercontent.com/uxntani/Scholaris/refs/heads/main/readme-assets/workflow.png)


## Features

<table>
<tr>
<td width="50%">

### AI Chat System
Ask questions and get instant, structured AI responses. Includes a typing indicator, real-time feedback, and smooth animations.

![AI Chat Demo](./gifs/chat.gif)

</td>
<td width="50%">

### Smart Study Planner
A fully interactive weekly planner with real dates, custom time intervals, and color-coded task tracking.

![Study Planner Demo](./gifs/open-planner.gif)

</td>
</tr>
<tr>
<td width="50%">

### Chat History Management
Conversations are saved automatically. Rename, delete, or switch between chats instantly.

</td>
<td width="50%">

### Profile Customization
Set your username, upload a profile photo, or pick from preset avatars. Changes persist across sessions.

![Avatar Change Demo](./gifs/avatar.gif)

</td>
</tr>
</table>

---

## Study Planner — Deep Dive

The planner is Scholaris's standout feature. It's not just a to-do list — it's time-aware.

| Color | Meaning |
|-------|---------|
| ⬜ White | Empty slot |
| 🟡 Yellow | Task pending |
| 🔴 Red | Missed (past due, unmarked) |
| 🟢 Green | Completed and locked |

# This is how it looks:

![Screenshot](https://raw.githubusercontent.com/uxntani/Scholaris/refs/heads/main/readme-assets/planner.png)


**Built-in logic that makes it smart:**
- You cannot mark a future task as complete
- Past unchecked tasks automatically turn red
- Completed tasks lock visually to prevent accidental changes
- The planner updates dynamically as time passes

**Analytics included:** Track completed, pending, and missed tasks across the week with visual histograms and progress charts.

---

## This how the Profile customization page looks like 

![Screenshot](https://raw.githubusercontent.com/uxntani/Scholaris/refs/heads/main/readme-assets/profile.png)

---

## This is how our Chat Interface looks like

![Screenshot](https://raw.githubusercontent.com/uxntani/Scholaris/refs/heads/main/readme-assets/chat.png)

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/your-username/scholaris.git

# 2. Navigate into the project
cd scholaris

# 3. Open in your browser
open index.html
```

No build tools. No dependencies. Just open and go.

---

## Project Structure

```bash
SCHOLARIS/
│
├── .vscode/
│
├── backend/
│   ├── __pycache__/
│   ├── auth.py
│   ├── main.py
│   ├── prompts.py
│   └── requirements.txt
│
├── frontend/
│   ├── assets/
│   ├── avatar/
│   ├── auth.css
│   ├── auth.html
│   ├── auth.js
│   ├── index.html
│   ├── script.js
│   └── style.css
│
└── README.md
```

## Roadmap

| Feature | Status |
|---------|--------|
| Dark / Light theme toggle | Planned |
| Cloud sync | Planned |
| Mobile optimization | Planned |
| Speech-to-text | Planned |
| Multilingual Support | Planned |

---

## 🚀 Getting Started with Ollama (AI Backend)

Scholaris uses **Ollama** to power its local AI — no API keys, no cloud dependency. Follow the steps below to get it running in minutes.

---

### 1️⃣ Install Ollama

Head over to [ollama.com](https://ollama.com) and download the installer for your operating system.

---

### 2️⃣ Verify Installation

Open **Command Prompt** or **PowerShell** and run:
```bash
ollama
```

> ✅ If installed correctly, you'll see the Ollama CLI help output.

---

### 3️⃣ Download a Model

Pull the AI model you want to use locally:
```bash
ollama pull phi3:mini
```

> ⬇️ This will download the model to your machine — sit tight, it may take a moment.

---

### 4️⃣ Run the Model

Start the model and open a local chat session:
```bash
ollama run phi3:mini
```

> 💬 This launches a local chat directly in your terminal — your AI is now live.

---

### ⚠️ Troubleshooting

**Error you might see:**
```
Error: 500 Internal Server Error: model requires more system memory
```

**Why it happens:** Multiple background applications are consuming memory, blocking Ollama from running.

**Fix:**
1. Close some background applications to free up memory.
2. Re-run the command:
```bash
   ollama run phi3:mini
```
3. The model should now start successfully and launch a local chat session — confirming Ollama is running in the background. 🎉

---
### 5️⃣ Run the main.py file

Open a new terminal in your desired text editor and type:
```bash
cd backend
```

> This will take you to the backend directory where your main.py file is located.

Type:
```bash
python -m uvicorn main:app --reload
```

> This will start running your backend in the server to fetch data between user and AI model.
