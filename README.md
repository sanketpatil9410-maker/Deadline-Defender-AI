# Deadline Defender AI 🛡️
> “Your AI rescue companion before deadlines become disasters.”

Deadline Defender AI is a production-ready productivity companion built for the hackathon problem statement: **“The Last-Minute Life Saver”**. It is an active, intelligent system that helps students, professionals, and developers plan, prioritize, and conquer tasks before deadlines are missed.

---

### 🚨 IMPORTANT SUBMISSION LAYOUT
* 💻 **Primary Hackathon Submission**: `/web` — A complete, production-ready, full-stack web application (React, TypeScript, Tailwind, Node.js/Express) powered securely by the Gemini API (`gemini-3.5-flash`). This is the primary submission for evaluation.
* 📱 **Additional Mobile Prototype**: `/app` — A fully functioning native Android app written in Kotlin and Jetpack Compose utilizing local SQLite (Room) database architecture. This is a supplementary mobile prototype.

---

## 🚀 Hackathon Problem Statement & Impact

### Problem Explanation
Traditional reminder applications notify users *after* it's already too late, or provide flat alerts that do not scale with task complexity. When critical deadlines approach, users often fall into **task paralysis** or **procrastination loops**, struggling to decide what to do first, how to break down massive tasks, or how to salvage progress when only hours remain.

### Solution Overview
**Deadline Defender AI** goes beyond passive alerts. It is an intelligent companion that:
- Calculates a dynamic, multi-factor **Smart Risk Score (0-100)** for every task based on due time proximity, duration, and priority.
- Utilizes the **Gemini API** (`gemini-3.5-flash`) to prioritize, create realistic daily plans, and draft emergency action steps.
- Features **Rescue Mode 2.0**—an interactive environment that breaks down late tasks into Minimum Viable Completion (MVC) steps with a built-in Pomodoro sprint timer to force focus.
- Provides a **Productivity Coach** conversational assistant that knows your active task database and helps you work through stress or replan on-the-fly.
- Implements **"I'm Running Late"** recovery sub-agents to compress scope and generate contingency plans.

---

## ✨ Key Features (Implemented Across Both Platforms)

1. **AI Command Center Dashboard:** Displays critical statistics, completion progress, focus streaks, the current highest-risk task, and a dynamic AI recommendation.
2. **Task Management:** Full CRUD capability to add, edit, delete, and complete tasks with metadata including Importance, Category, Energy Required, Notes, and estimated duration.
3. **AI Prioritization Engine:** Runs tasks through Gemini to output detailed rankings, risk assessments, and step-by-step reasoning.
4. **Interactive Rescue Mode:** Translates complex deliverables into Minimum Viable Completion (MVC) steps with a live Pomodoro countdown timer.
5. **Daily AI Planner:** Organizes tasks into morning, afternoon, and evening deep-work schedules with built-in rest buffers.
6. **Delay Recovery Agent ("I'm Running Late"):** Helps compress scopes or delay flexible items safely when running out of time. Pre-selects current active tasks seamlessly.
7. **Productivity Coach Chat:** Conversational helper that answers productivity questions using your actual tasks as background context.
8. **Demo Data Injector:** Instantly populates the app with rich sample tasks to make evaluation easy for judges and users.
9. **Google Tech Integration Spec:** Features detailed visual breakdowns showing how Gemini 3.5 Flash and Cloud Run drive client-side autonomy securely.
10. **Calendar .ics Export:** Instantly download high-fidelity `.ics` files of schedules built by the AI War Room to import into Google Calendar or Apple Calendar.

---

## 📂 Project Structure

```
.
├── app/                      # 📱 Supplementary Native Android Mobile App (Kotlin/Compose)
│   ├── src/main/java/        # Source code (ui, data, services, utils)
│   └── build.gradle.kts      # Android build and dependency declarations
├── web/                      # 💻 Primary Full-Stack Web App (React/TS/Tailwind/Node.js)
│   ├── src/                  # React Frontend (App.tsx, index.css, main.tsx)
│   ├── server.js             # Node.js Express Secure API Proxy & SPA Static Host
│   ├── package.json          # Dependencies and scripts
│   └── .env.example          # Environment variable template
├── metadata.json             # AI Studio platform configuration
├── PROJECT_DESCRIPTION.md    # In-depth Google Doc-ready product writeup
└── README.md                 # Master documentation (this file)
```

---

## 💻 Running the Full-Stack Web App Locally (Primary Submission)

### Prerequisites
- Node.js v18 or higher
- npm

### ⚡ Option A: Streamlined Single-Process (Recommended for Judges)
You can run the entire full-stack app (Vite React frontend compiled and served statically via the Express Node.js backend) in a single unified command:

1. Navigate to the `/web` directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your secure server-side `GEMINI_API_KEY`.
4. Compile the React assets and boot up the Express server:
   ```bash
   npm run build
   npm run start
   ```
5. Open [http://localhost:3001](http://localhost:3001) in your web browser.

### 🛠️ Option B: Hot-Reloading Development Mode
If you want to edit and hot-reload front-end and back-end code separately:

1. Navigate to the `/web` directory:
   ```bash
   cd web
   ```
2. Install dependencies & configure `.env` (as shown above).
3. Start the secure backend server (runs on port `3001`):
   ```bash
   npm run server
   ```
4. In a separate terminal window, start the React Vite developer server (runs on port `3000`):
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📱 Running the Android App Prototype Locally

### Prerequisites
- Android Studio Ladybug or newer
- JDK 17+
- Android Device or Emulator

### Steps
1. Open the root folder in **Android Studio**.
2. Create a `.env` file in the project root containing your Gemini API key:
   ```properties
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
3. Sync Gradle and click **Run App** (green play icon) in Android Studio.

---

## ☁️ Google Cloud Run / AI Studio Deployment

The Node.js and React full-stack application is fully ready to deploy straight to **Google Cloud Run** or **Google AI Studio Build Mode** as a containerized web application.

To deploy using the Google Cloud SDK:
```bash
cd web
gcloud run deploy deadline-defender-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_secured_api_key
```

---

## 📋 Hackathon Evaluation & Submission Checklist
- [x] **Problem Solving & Impact**: Tackles task paralysis and the "Last-Minute Life Saver" problem with realistic, actionable mechanics.
- [x] **Agentic Depth**: Employs continuous calculation loops, contextual reasoning, and custom prompt instructions.
- [x] **Secure AI Usage**: The web version isolates the `GEMINI_API_KEY` entirely within a server-side route. No raw keys are ever leaked or exposed.
- [x] **Robust Local Fallback**: Both platforms function fully in offline mode, serving rich, rule-based responses if the Gemini API fails or is not configured.
- [x] **Clean, Responsive UI**: Gorgeous dark-slate design schemas with micro-animations, clear risk/status badges, and mobile-responsive layouts.
- [x] **No Mock-Only Interfaces**: All buttons, timers, chat blocks, and recovery agents are completely functional with real data.
- [x] **Judge Walkthrough Master Checklist**: Equipped with a 5-step evaluation protocol designed to demonstrate maximum product depth under 2 minutes.
