from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from prompts import scholaris_prompt
import ollama
import uuid

app = FastAPI()

# 🌍 CORS (for frontend connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== MODELS =====================
class StudentInput(BaseModel):
    subject: str
    question: str
    student_solution: str

class LoginInput(BaseModel):
    email: str
    password: str

# ===================== TEMP STORAGE =====================
# Hackathon-friendly in-memory token store
active_tokens = set()

# ===================== ROUTES =====================
@app.get("/")
def home():
    return {"message": "Scholaris backend is running 🚀"}

@app.post("/login")
def login(data: LoginInput):
    token = str(uuid.uuid4())
    active_tokens.add(token)
    return {"token": token}


@app.post("/analyze")
def analyze_solution(data: StudentInput):
    user_text = data.student_solution.strip()

    # 👋 Greeting handling
    if is_greeting(user_text):
        return {"reply": "Hey there 😊 How can I help you today?"}

    # 🙏 Polite close
    if user_text.lower() in ["thanks", "thank you"]:
        return {"reply": "You’re welcome 😊 Happy studying!"}

    prompt = scholaris_prompt(
        subject=data.subject,
        question=data.question,
        student_solution=data.student_solution
    )

    full_prompt = f"""
You are Scholaris, a friendly and exam-focused AI tutor.

Speak naturally, like a helpful teacher talking to a student.

Rules you MUST follow:
- Do NOT use labels like Verdict, Feedback, Hint, Analysis.
- Do NOT explain what you are doing.
- Do NOT write headings or bullet points.
- Keep the response short (2–4 lines).
- Be polite, encouraging, and conversational.
- If the answer is correct, say so simply.
- If it needs improvement, explain gently and briefly.

Student message:
{prompt}
"""

    try:
        response = ollama.chat(
            model="phi3:mini",
            messages=[{"role": "user", "content": full_prompt}],
            options={
                "temperature": 0.4,
                "num_predict": 180
            }
        )

        return {"reply": response["message"]["content"].strip()}

    except Exception:
        return {"reply": "⚠️ I ran into an issue while analyzing. Please try again."}

# ===================== HELPERS =====================
def is_greeting(text: str):
    greetings = [
        "hi", "hello", "hey", "hii", "hola",
        "good morning", "good evening", "good afternoon"
    ]
    return text.lower().strip() in greetings
