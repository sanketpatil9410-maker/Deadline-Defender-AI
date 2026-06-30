import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // Standard Node fetch for Node 18+ (built-in) or fallback
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static assets from Vite's build directory (dist) in production
app.use(express.static(path.join(__dirname, 'dist')));

const GEMINI_MODEL = "gemini-3.5-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Secure call to Gemini API
async function callGeminiApi(prompt, systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    throw new Error("GEMINI_API_KEY is not configured or placeholder.");
  }

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API Error (HTTP ${response.status}): ${errorBody}`);
  }

  const responseJson = await response.json();
  const text = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text content returned from Gemini API");
  }

  return text;
}

// 1. Prioritization API
app.post(['/api/prioritize', '/api/plan'], async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: "No tasks provided" });
  }

  const formattedTasks = tasks.map(t => 
    `Title: ${t.title}\nDescription: ${t.description}\nCategory: ${t.category}\nDeadline: ${t.deadline}\nImportance: ${t.importance}\nDuration: ${t.estimatedMinutes} mins\nEnergy: ${t.energyRequired}\nStatus: ${t.status}\nRisk Score: ${t.riskScore}`
  ).join("\n\n");

  const prompt = `Here is my current task list:\n\n${formattedTasks}\n\nAnalyze and prioritize these tasks.`;
  const systemInstruction = "You are Deadline Defender AI, an expert productivity strategist. " +
    "Analyze the user's current task list and create a prioritized action plan. " +
    "Do NOT give generic productivity advice. Be extremely direct and specific. " +
    "Organize your advice into these sections:\n" +
    "1. ### 🚨 HIGH-RISK THREAT CONTEXT: State which task(s) are at critical risk, why, and the exact consequence if missed.\n" +
    "2. ### 📋 THE TRIAGE ORDER: Present a numbered ranking list of tasks to execute first. For each task, list:\n" +
    "   * Task Title\n" +
    "   * **Impact Ratio**: Why this must be prioritized (importance vs effort).\n" +
    "   * **Next Concrete Action**: A hyper-specific micro-action they can do in under 5 minutes.\n" +
    "3. ### ⚡ ENERGETIC SCHEDULING: Group the tasks by high/medium/low energy requirements matching the user's list.";

  try {
    const advice = await callGeminiApi(prompt, systemInstruction);
    res.json({ data: advice, source: 'gemini' });
  } catch (error) {
    console.error("Prioritize API Fallback:", error.message);
    res.json({ data: generateLocalPrioritization(tasks), source: 'local_fallback' });
  }
});

// 2. Rescue Mode API
app.post('/api/rescue', async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "No task provided" });
  }

  const prompt = `Task details:\nTitle: ${task.title}\nDescription: ${task.description}\nDeadline: ${task.deadline}\nImportance: ${task.importance}\nDuration: ${task.estimatedMinutes} mins\nCategory: ${task.category}\nNotes: ${task.notes || "None"}`;
  const systemInstruction = "You are Deadline Defender AI in Rescue Mode. " +
    "The user is close to missing a deadline. Create an emergency completion plan. " +
    "Do not give generic advice like 'stay calm' or 'take a breath'. Instead, deliver a high-velocity emergency roadmap:\n" +
    "1. ### ✂️ SCOPE COMPRESSION (WHAT TO CUT): Detail exactly 2-3 parts of this task that can be completely skipped, ignored, or simplified to achieve Minimum Viable Completion (MVC).\n" +
    "2. ### ⏱️ 25-MINUTE SPRINT STEPS: Break the remaining scope into exactly 3 sequential action intervals (e.g., Sprint 1: 10 mins, Sprint 2: 10 mins, Sprint 3: 5 mins).\n" +
    "3. ### 🚫 DISTRACTION FIREWALL: Identify the #1 source of delay for this task type and state a brutal action to block it.";

  try {
    const advice = await callGeminiApi(prompt, systemInstruction);
    res.json({ data: advice, source: 'gemini' });
  } catch (error) {
    console.error("Rescue API Fallback:", error.message);
    res.json({ data: generateLocalRescuePlan(task), source: 'local_fallback' });
  }
});

// 3. Daily Planner API
app.post(['/api/daily-plan', '/api/war-room'], async (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ error: "No tasks provided" });
  }

  const formattedTasks = tasks.map(t => 
    `- ${t.title} (${t.estimatedMinutes}m, Importance: ${t.importance}, Due: ${t.deadline}, Status: ${t.status})`
  ).join("\n");

  const prompt = `Here are my pending tasks for today:\n${formattedTasks}\n\nGenerate my structured daily schedule.`;
  const systemInstruction = "You are Deadline Defender AI, a realistic daily planning assistant. " +
    "Create an optimized daily schedule.\n" +
    "Organize the schedule clearly:\n" +
    "1. ### 🎯 THE ANCHOR TARGET: Identify the single most important task of the day.\n" +
    "2. ### 📅 HOUR-BY-HOUR FOCUS MAP: Provide a realistic hourly timeline. Group tasks into morning deep-work blocks and afternoon low-energy catchups, explicitly building in 10-minute rest buffers.\n" +
    "3. ### 🛡️ BUFFER DEFENSE: Write a one-sentence rule on how to handle interruptions during deep-work blocks.";

  try {
    const advice = await callGeminiApi(prompt, systemInstruction);
    res.json({ data: advice, source: 'gemini' });
  } catch (error) {
    console.error("Daily Plan API Fallback:", error.message);
    res.json({ data: generateLocalDailyPlan(tasks), source: 'local_fallback' });
  }
});

// 4. Delay Recovery API ("I'm Running Late")
app.post(['/api/recover', '/api/delay-recovery'], async (req, res) => {
  const { task, timeRemainingMins, progressPct, isMandatory } = req.body;
  if (!task) {
    return res.status(400).json({ error: "No task provided" });
  }

  const prompt = `Task Title: ${task.title}\nTotal Estimated Time: ${task.estimatedMinutes} mins\nTime remaining: ${timeRemainingMins} mins\nProgress completed: ${progressPct}%\nIs task mandatory: ${isMandatory ? "Yes" : "No"}\nImportance: ${task.importance}`;
  const systemInstruction = "You are Deadline Defender AI, helping a user recover from delay. " +
    "Create a revised recovery roadmap.\n" +
    "Organize as follows:\n" +
    "1. ### 🩹 EMERGENCY COMPRESSION: How to condense the remaining work into the limited time left.\n" +
    "2. ### 🛑 WHAT TO POSTPONE: Identify low-priority items or non-essential features that must be rescheduled.\n" +
    "3. ### 🚀 RECOVERY PROTOCOL: Give 3 micro-steps to restart momentum immediately.";

  try {
    const advice = await callGeminiApi(prompt, systemInstruction);
    res.json({ data: advice, source: 'gemini' });
  } catch (error) {
    console.error("Recover API Fallback:", error.message);
    res.json({ data: generateLocalDelayRecoveryPlan(task, timeRemainingMins, progressPct, isMandatory), source: 'local_fallback' });
  }
});

// 5. Micro-Step Breakdown API
app.post('/api/breakdown', async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: "No task provided" });
  }

  const prompt = `Task Details:\nTitle: ${task.title}\nDescription: ${task.description}\nEstimated Duration: ${task.estimatedMinutes} mins\nImportance: ${task.importance}`;
  const systemInstruction = "You are Deadline Defender AI, an expert structural task breakdowns planner. " +
    "Break down the user's task into exactly 5 logical, concrete micro-steps to overcome inertia. " +
    "Be extremely action-focused. Format your advice as exactly 5 numbered steps starting with ### 📋 LOCAL MICRO-STEP BREAKDOWN or similar headers.";

  try {
    const advice = await callGeminiApi(prompt, systemInstruction);
    res.json({ data: advice, source: 'gemini' });
  } catch (error) {
    console.error("Breakdown API Fallback:", error.message);
    res.json({ data: generateLocalBreakdown(task), source: 'local_fallback' });
  }
});


// 5. Coach Chat API
app.post('/api/coach', async (req, res) => {
  const { message, tasks } = req.body;
  const formattedTasks = (!tasks || tasks.length === 0) 
    ? "No active tasks right now."
    : tasks.map(t => `- ${t.title} (Importance: ${t.importance}, Status: ${t.status}, Due: ${t.deadline})`).join("\n");

  const prompt = `User Message: "${message}"\n\nUser's Task Context:\n${formattedTasks}`;
  const systemInstruction = "You are Deadline Defender AI, an encouraging but hyper-focused productivity coach. " +
    "Help the user with planning, focus, overcoming stress, and beating procrastination. " +
    "Never offer generic platitudes. Always refer back to their active tasks. " +
    "If they are stressed, give them exactly one micro-step to start on their highest-risk task right now. " +
    "Keep responses under 150 words. Focus on immediate physical actions rather than theoretical strategies.";

  try {
    const responseText = await callGeminiApi(prompt, systemInstruction);
    res.json({ data: responseText, source: 'gemini' });
  } catch (error) {
    console.error("Coach API Fallback:", error.message);
    res.json({ data: generateLocalCoachResponse(message, tasks), source: 'local_fallback' });
  }
});


// --- LOCAL FALLBACK LOGICS ---

function calculateRiskScore(task) {
  // Simple risk score mirroring Kotlin utils
  if (task.status === "Completed") return 0;
  let score = 30; // base score
  if (task.importance === "Critical") score += 30;
  else if (task.importance === "High") score += 20;
  else if (task.importance === "Medium") score += 10;

  const due = new Date(task.deadline);
  const now = new Date();
  const diffHours = (due - now) / (1000 * 60 * 60);

  if (diffHours < 0) score += 40; // Overdue
  else if (diffHours <= 6) score += 35;
  else if (diffHours <= 12) score += 25;
  else if (diffHours <= 24) score += 15;
  else if (diffHours <= 72) score += 5;

  return Math.min(100, Math.max(0, score));
}

function getRiskCategory(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "Urgent";
  if (score >= 30) return "Watch";
  return "Stable";
}

function generateLocalPrioritization(tasks) {
  const sorted = tasks
    .filter(t => t.status !== "Completed")
    .map(t => ({ task: t, score: calculateRiskScore(t) }))
    .sort((a, b) => b.score - a.score);

  let output = "⚠️ **[AI Local Backup Active]** Showing Smart Local Prioritization:\n\nHere is your prioritized action roadmap to defend your upcoming deadlines:\n\n";
  sorted.forEach((item, idx) => {
    const { task, score } = item;
    const cat = getRiskCategory(score);
    output += `### Rank #${idx + 1}: ${task.title}\n`;
    output += `- **Category**: ${task.category} | **Importance**: ${task.importance}\n`;
    output += `- **Risk Level**: **${cat} (${score}/100)**\n`;
    output += `- **Recommended Action**: `;
    if (score >= 80) {
      output += "🚀 Activate **Rescue Mode** immediately! Break this task into 15-minute intervals and drop non-essential features.";
    } else if (score >= 60) {
      output += "⏱️ Start a focused 45-minute sprint now. Eliminate tabs and block phone notifications.";
    } else if (score >= 30) {
      output += "📅 Assign a dedicated 1-hour block today to make progress before urgency rises.";
    } else {
      output += "🌱 Steady progress. Check this off during low-energy periods.";
    }
    output += `\n- **Reasoning**: Due on ${task.deadline.replace("T", " ")}. Length: ${task.estimatedMinutes}m. Currently marked as: ${task.status}.\n\n`;
  });
  output += "\n💡 **Pro-Tip**: Tackle your highest risk item first to break the paralysis loop!";
  return output;
}

function generateLocalRescuePlan(task) {
  const totalMins = task.estimatedMinutes;
  const step1 = Math.max(10, Math.round(totalMins * 0.15));
  const step2 = Math.max(20, Math.round(totalMins * 0.50));
  const step3 = Math.max(10, Math.round(totalMins * 0.20));
  const step4 = Math.max(5, Math.round(totalMins * 0.15));

  return `🚨 **[AI Local Backup Active] EMERGENCY RESCUE PLAN**

Let's rescue **"${task.title}"** before the deadline! We are trimming the fat and focusing exclusively on a Minimum Viable Completion (MVC).

⏱️ **Time-Boxed Focus Blocks (Total: ${totalMins} minutes)**

1. **Block 1: Frame and Outline (${step1} mins)**
   - Do not seek perfection. Outline the final product, layout, or template.
   - Write down the 3 core elements that *must* be delivered.

2. **Block 2: High-Yield Execution (${step2} mins)**
   - Fill in the core elements. Focus on substance, not formatting or aesthetic flourishes.
   - Skip non-essential secondary research or styling. Good enough is perfect.

3. **Block 3: Refine & Polish (${step3} mins)**
   - Correct obvious errors, format headings, and make sure the core argument/function stands out.

4. **Block 4: Submission Preparation (${step4} mins)**
   - Export, compile, package, or upload. Always leave 5 minutes for technical glitches!

🛡️ **What to Skip & Simplify:**
- **Skip**: Secondary graphics, advanced styling, extensive copyediting.
- **Simplify**: Use bullet points instead of long paragraphs; reuse existing layouts.

🔥 **Motivational Charge**: "Perfection is the enemy of completed. A finished project at 80% quality wins. A perfect project that is late gets a zero. Focus on execution!"`;
}

function generateLocalDailyPlan(tasks) {
  const activeTasks = tasks.filter(t => t.status !== "Completed");
  if (activeTasks.length === 0) {
    return "🎉 You have no active tasks left! Today is a perfect day for deep learning, relaxation, or planning your next big goal.";
  }

  const highPriority = activeTasks.filter(t => t.importance === "Critical" || t.importance === "High");
  const otherTasks = activeTasks.filter(t => t.importance !== "Critical" && t.importance !== "High");

  let output = "📅 **[AI Local Backup Active] YOUR SURVIVAL DAILY PLAN**\n\nHere is your tactical layout for today, structured for high-focus deep work and sensible pacing:\n\n";
  output += "🌅 **Morning Block (09:00 - 12:00) | Peak Focus**\n";
  if (highPriority.length > 0) {
    const prime = highPriority[0];
    output += `- **09:00 - 11:00**: Deep Work on **\`${prime.title}\`** (${prime.estimatedMinutes}m expected). Shut off all comms.\n`;
    output += `- **11:00 - 11:15**: 🚶 active walking break. Decompress.\n`;
    if (highPriority.length > 1) {
      output += `- **11:15 - 12:00**: Progress on **\`${highPriority[1].title}\`**.\n`;
    } else {
      output += "- **11:15 - 12:00**: Focus buffer/administrative cleanup.\n";
    }
  } else {
    const prime = otherTasks[0];
    output += `- **09:00 - 10:30**: Work on **\`${prime.title}\`**.\n`;
    output += "- **10:30 - 10:45**: Coffee break.\n";
    output += "- **10:45 - 12:00**: Continue or process light tasks.\n";
  }

  output += "\n🍕 **Mid-day (12:00 - 13:00) | Recharge**\n- Eat a balanced lunch, hydrate, and do not look at screens.\n\n";
  output += "🌇 **Afternoon Block (13:00 - 17:00) | Secondary Work & Habits**\n";

  const pmTasks = highPriority.length > 2 ? highPriority.slice(2) : otherTasks;
  if (pmTasks.length > 0) {
    const pmt = pmTasks[0];
    output += `- **13:00 - 14:30**: Momentum Session: **\`${pmt.title}\`**.\n`;
    output += "- **14:30 - 14:45**: Hydration & breathing stretch.\n";
    if (pmTasks.length > 1) {
      output += `- **14:45 - 16:00**: Side tasks: ${pmTasks.slice(1, 3).map(it => `\`${it.title}\``).join(', ')}\n`;
    }
    output += "- **16:00 - 17:00**: Email, cleanup, update status of completed tasks.\n";
  } else {
    output += "- **13:00 - 15:00**: Creative brainstorming, task optimization, review.\n";
    output += "- **15:00 - 17:00**: Habit tracker check-offs, setting tomorrow's goals.\n";
  }

  output += "\n🌙 **Evening Block (18:00+) | Reflection & Review**\n- Review today's completed accomplishments.\n- Set your 'One Critical Focus' for tomorrow to avoid decision fatigue.";
  return output;
}

function generateLocalDelayRecoveryPlan(task, timeRemaining, progress, isMandatory) {
  const scale = isMandatory ? "Mandatory - Scope compression required." : "Flexible - Postponement recommended.";
  const decisionText = isMandatory 
    ? "Since this task is mandatory, do NOT postpone. Immediately remove auxiliary features. Focus ONLY on submitting a functional base draft." 
    : "Since this task is flexible, push the deadline by 24 hours. Put this task aside for 1 hour to lower stress levels, and restart tomorrow with a fresh slate.";

  return `⚠️ **[AI Local Backup Active] LATE RECOVERY TACTICAL DEBRIEF**

We are falling behind on **"${task.title}"** but panic is not an option. Here is your tactical recovery layout:

📊 **Status Check**: ${progress}% completed, with **${timeRemaining} minutes remaining**.
🏷️ **Task Level**: ${scale} (Importance: ${task.importance})

🛠️ **Action Plan:**
1. **Implement Scope Cut**: 
   ${decisionText}
2. **Stop Multi-tasking**: Close all browser tabs, silence your phone, and let colleagues/family know you are in an 'emergency deep work' window for the next ${timeRemaining} minutes.
3. **Communicate (If applicable)**: If this involves a client or supervisor, send a 1-sentence heads-up: *"Hey, finishing up the details on ${task.title}, will have it to you shortly."* This proactively manages expectations.`;
}

function generateLocalCoachResponse(message, tasks) {
  const normalized = message.toLowerCase();
  const activeTasks = tasks.filter(t => t.status !== "Completed");

  if (normalized.includes("stress") || normalized.includes("anxious") || normalized.includes("overwhelm")) {
    const firstTask = activeTasks[0];
    const taskText = firstTask 
      ? `Let's ignore everything except **'${firstTask.title}'** for the next 15 minutes. Just open it and look at it.` 
      : "You actually have no urgent tasks pending! Your stress might be habit-based. Give yourself permission to rest.";
    return `Take a deep, slow breath. Stress is just your brain reacting to a high volume of choices. Let's simplify. You have ${activeTasks.length} pending tasks. ${taskText} Can you do just one tiny action right now?`;
  }

  if (normalized.includes("first") || normalized.includes("start")) {
    if (activeTasks.length === 0) {
      return "You are all caught up! If you want to start something new, write down a fresh creative goal. Otherwise, take a well-deserved break.";
    }
    const target = activeTasks[0]; // local target
    return `According to your deadline metrics, your top-priority target is **'${target.title}'** (Due: ${target.deadline.replace("T", " ")}). My recommendation: Launch **Rescue Mode** for this task immediately and do a 25-minute focused sprint. Let's conquer it!`;
  }

  if (normalized.includes("late") || normalized.includes("missed")) {
    return "Missing a deadline feels heavy, but it is excellent data. It means your initial time estimate was too optimistic. Action item: 1. Update the deadline of the task to a realistic future slot. 2. Write down *why* it took longer (Blocked? Procrastination? Scope creep?). Self-compassion drives productivity, guilt drives procrastination. Forgive yourself and take the next step.";
  }

  return `Hi there! I am your hyper-focused productivity strategist. Right now, you have ${activeTasks.length} active tasks waiting for completion. Tell me: Are you stuck on a specific task, feeling overwhelmed, or looking for a structured schedule block for today?`;
}

function generateLocalBreakdown(task) {
  const stepTime = Math.max(5, Math.round(task.estimatedMinutes / 5));
  return `### 📋 LOCAL MICRO-STEP BREAKDOWN (OFFLINE RESILIENCE)

The Deadline Defender Agent has isolated **"${task.title}"** and compiled an inertia-breaking sequence of 5 microscopic steps:

1. **Step 1: Inspect the workspace (${stepTime} minutes)**
   * Locate the files, URLs, or templates required to begin. Clear secondary browser tabs.
2. **Step 2: Draft the initial placeholder (${stepTime} minutes)**
   * Write down the title, heading, or the core function name. Overcome the blank-page syndrome.
3. **Step 3: Core execution sprint (${stepTime * 2} minutes)**
   * Tackle the single most heavy segment of the task. Keep sentences short or draft a basic draft.
4. **Step 4: Self-review and polish (${stepTime} minutes)**
   * Do a fast verification to ensure the basic requirements match the initial prompt scope.
5. **Step 5: Prepare final package and submit (${stepTime} minutes)**
   * Export, run compilation checks, and secure delivery before the clock runs out.`;
}


// SPA Fallback: Serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


// Start Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Deadline Defender AI backend running on port ${PORT}`);
});
