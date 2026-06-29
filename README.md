# Deadline Defender AI 🛡️
> “Your AI rescue companion before deadlines become disasters.”

Deadline Defender AI is a modern, high-fidelity native Android application built for the hackathon problem statement: **“The Last-Minute Life Saver”**. It is a proactive, intelligent productivity companion that helps students, professionals, and entrepreneurs plan, prioritize, and conquer tasks before deadlines are missed.

---

## 🚀 Hackathon Problem Statement & Impact

### Problem Explanation
Traditional reminder applications notify users *after* it's already too late or provide simple, flat alerts that do not scale with task complexity. When deadlines approach, users often fall into **task paralysis** or **procrastination loops**, struggling to decide what to do first, how to break down massive tasks, or how to salvage progress when only hours remain.

### Solution Overview
**Deadline Defender AI** goes beyond passive alerts. It is an intelligent companion that:
- Calculates a dynamic, multi-factor **Smart Risk Score** for every task.
- Utilizes the **Gemini API** (`gemini-3.5-flash`) to prioritize, create realistic daily plans, and draft emergency action steps.
- Features **Rescue Mode**—an interactive environment that breaks down late tasks into time-boxed micro-actions and includes a built-in Pomodoro sprint timer to force focus.
- Provides a **Productivity Coach** conversational assistant that knows your active task database and helps you work through stress or replan on-the-fly.

---

## ✨ Key Features

1. **Dashboard Overview:** Displays critical statistics, completion progress, focus streaks, the current highest-risk task, and a dynamic AI recommendation.
2. **Task Management (Room Database):** Full CRUD capability to add, edit, delete, and complete tasks with metadata including Importance, Category, Energy Required, Notes, and estimated duration.
3. **AI Prioritization Engine:** Runs tasks through Gemini to output detailed rankings, risk assessments, and step-by-step reasoning.
4. **Interactive Rescue Mode:** Translates complex deliverables into Minimum Viable Completion (MVC) steps with a live Pomodoro countdown timer.
5. **Daily AI Planner:** Organizes tasks into morning, afternoon, and evening deep-work schedules.
6. **Delay Recovery Agent ("I'm Running Late"):** Helps compress scopes or delay flexible items safely when running out of time.
7. **Productivity Coach Chat:** Conversational helper that answers productivity questions using your actual tasks as background context.
8. **Demo Data Injector:** Instantly populates the app with rich sample tasks to make evaluation easy for judges and users.

---

## 🧠 Agentic AI Workflow

Deadline Defender AI implements a continuous loop of agentic assistance:
```
[ Observe: User Database & Habits ]
                │
                ▼
[ Orient: Calculate Smart Risk Scores ]
                │
                ▼
[ Decide: Gemini API Formulates Custom Priorities & Plans ]
                │
                ▼
[ Act: Interactive Checklists, Timers, & Chat Guidance ]
```

---

## 🛠️ Tech Stack & Google Technologies

- **Runtime:** Android SDK (Kotlin, Jetpack Compose)
- **Database:** SQLite via Room Persistence Library
- **Networking:** OkHttp & Retrofit 2
- **JSON Parser:** Moshi / JSONObject
- **AI Core:** Google AI Studio REST integration with `gemini-3.5-flash`
- **Secrets Management:** Secrets Gradle Plugin and Android `BuildConfig`

---

## 💻 How to Run Locally

### Prerequisites
- Android Studio Ladybug or newer
- JDK 17+
- Android Device or Emulator

### Steps
1. Clone this repository or download the ZIP export.
2. Open the project in Android Studio.
3. Securely set up your **Gemini API Key**:
   - Create a file named `.env` in the project root.
   - Add your API Key:
     ```properties
     GEMINI_API_KEY=your_actual_gemini_api_key
     ```
   - *Note: In Google AI Studio, this is injected automatically from your Secrets panel.*
4. Sync Gradle and click **Run App** (green play icon) in Android Studio.

---

## ☁️ How to Deploy (AI Studio & Cloud Run)

This project is built to be deployment-ready. The AI Studio platform lets you:
- Stream the application live in a web browser using the **Streaming Android Emulator**.
- Generate and download optimized release APKs and Android App Bundles (AABs).
- Instantly push changes directly to your connected **GitHub Repository**.

---

## 🔮 Future Scope
- **Google Calendar Integration:** Sync deadlines and focus blocks directly to your calendar.
- **Gmail & Slack Scanner:** Pull in deadlines and actions automatically using NLP parsing of incoming communications.
- **On-Device Local AI:** Run lightweight open models (like Gemma) entirely on-device for total offline privacy.
- **Push Alerts:** Proactive ambient soundscapes and alarms that trigger when Risk Scores rise past 80%.

---

## 🏆 Hackathon Project Links & Submission
- **Problem Category:** The Last-Minute Life Saver
- **Project Name:** Deadline Defender AI
- **Tagline:** “Your AI rescue companion before deadlines become disasters.”
