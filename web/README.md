# Deadline Defender AI (Web Version)

Your AI rescue companion before deadlines become disasters.
Built with **React, TypeScript, Tailwind CSS, and Node.js Express**, powered by **Google Gemini 3.5 Flash** secure server-side routes.

---

## 🚀 Architectural Overview
1. **Frontend (React + TS + Tailwind)**: A modern, high-contrast, beautiful single-screen dashboard featuring adaptive widgets, interactive Pomodoro timer circuits, responsive visual gauges, and clean states.
2. **Backend (Node.js Express + node-fetch)**: An extremely lightweight API proxy server that processes prompts and system instructions securely without exposing your `GEMINI_API_KEY` to the client.
3. **Smart Local Fallback**: When no API key is present or connection fails, a robust local rule-based AI engine takes over to construct prioritizations, scope compressions, and recovery guides offline, ensuring continuous system operation.

---

## 🛠️ Getting Started Locally

### Prerequisite
Ensure you have **Node.js (v18 or higher)** and **npm** installed.

### 1. Install Dependencies
Navigate to the web directory and install standard dependencies:
```bash
cd web
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and insert your Google AI Studio Gemini API Key:
```bash
cp .env.example .env
```
Open `.env` and fill:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
```

### 3. Run Servers
We need to run both the frontend dev server and the backend proxy server.

* **Run Backend (Express API Server)**:
```bash
npm run server
```
* **Run Frontend (Vite Client Server)**:
In a separate terminal block, run:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to play!

---

## ☁️ Google Cloud Run / AI Studio Deployment

The Web version is fully configured to deploy straight to **Google Cloud Run** or **Google AI Studio Build Mode** as a containerized web application.

### Local Docker Build & Test (Optional)
Create a root `Dockerfile` (or use the configured Cloud Build packager):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
ENV PORT=3000
CMD ["npm", "start"]
```

### Cloud Run Deployment Commands
Use standard Google Cloud SDK commands to deploy in 20 seconds:
```bash
gcloud run deploy deadline-defender-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_secured_api_key
```

---

## 📋 Hackathon Submission Checklist (Web)
- [x] **Zero Exposed Frontend Keys**: All Gemini queries route strictly through `/api` backend endpoint.
- [x] **Vibrant Custom UX**: Features dark high-contrast themes, risk badges, and interactive gauges.
- [x] **Pomodoro Rescue Timer**: Visual, interactive 25-minute timer circuits matching Rescue plans.
- [x] **Robust Local Fallback**: Fully functional even when offline or without API Keys.
- [x] **LocalStorage Persistence**: Hydrates active tasks, habits, and scores securely upon tab reload.
