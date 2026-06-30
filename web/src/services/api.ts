import { Task } from '../types/task';
import { calculateRiskDetails } from '../utils/riskEngine';

// API Service with Relative Routes and Built-In Intelligent Offline Fallbacks
export async function fetchAIPlan(tasks: Task[]): Promise<{ data: string; source: 'gemini' | 'local_fallback' }> {
  try {
    const res = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('AI Plan API error, falling back to local engine:', err);
    return { data: generateLocalPlan(tasks), source: 'local_fallback' };
  }
}

export async function fetchAIRescuePlan(task: Task): Promise<{ data: string; source: 'gemini' | 'local_fallback' }> {
  try {
    const res = await fetch('/api/rescue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Rescue API error, falling back to local engine:', err);
    return { data: generateLocalRescuePlan(task), source: 'local_fallback' };
  }
}

export async function fetchAICoach(message: string, tasks: Task[]): Promise<{ data: string; source: 'gemini' | 'local_fallback' }> {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tasks }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Coach API error, falling back to local engine:', err);
    return { data: generateLocalCoachResponse(message, tasks), source: 'local_fallback' };
  }
}

export async function fetchAIDelayRecovery(
  task: Task,
  timeRemainingMins: number,
  progressPct: number,
  isMandatory: boolean
): Promise<{ data: string; source: 'gemini' | 'local_fallback' }> {
  try {
    const res = await fetch('/api/delay-recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, timeRemainingMins, progressPct, isMandatory }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Delay Recovery API error, falling back to local engine:', err);
    return { data: generateLocalDelayRecoveryPlan(task, timeRemainingMins, progressPct, isMandatory), source: 'local_fallback' };
  }
}

export async function fetchAIMicroBreakdown(task: Task): Promise<{ data: string; source: 'gemini' | 'local_fallback' }> {
  try {
    const res = await fetch('/api/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Breakdown API error, falling back to local engine:', err);
    return { data: generateLocalBreakdown(task), source: 'local_fallback' };
  }
}

export async function fetchAIWarRoom(tasks: Task[]): Promise<{ data: string; source: 'gemini' | 'local_fallback' }> {
  try {
    const res = await fetch('/api/war-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks }),
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('War Room API error, falling back to local engine:', err);
    return { data: generateLocalWarRoom(tasks), source: 'local_fallback' };
  }
}

// ==========================================
//          LOCAL FALLBACK ALGORITHMS
// ==========================================

function generateLocalPlan(tasks: Task[]): string {
  const pending = tasks.filter(t => t.status !== 'Completed');
  if (pending.length === 0) {
    return `### 🛡️ LOCAL DEFENDER ANALYSIS: ALL CLEAR
No pending items are at risk. Keep up this magnificent defensive pacing!`;
  }

  const sorted = [...pending].map(t => {
    const details = calculateRiskDetails(t, tasks);
    return { task: t, details };
  }).sort((a, b) => b.details.riskScore - a.details.riskScore);

  const highestRisk = sorted[0];

  let res = `### ⚠️ LOCAL PRIORITIZATION BACKUP ACTIVE
The server is currently offline or the API key is not configured. Utilizing local structural threat evaluation algorithms.

#### 🚨 CRITICAL DEFENSIVE FOCUS: **${highestRisk.task.title}**
- **Risk Score**: ${highestRisk.details.riskScore}/100 (**${highestRisk.details.urgencyLevel}** urgency)
- **Why it is at risk**: ${highestRisk.details.riskReason}
- **Strategic Recommendation**: ${highestRisk.details.recommendedAction}

---

### 📋 THE PRIORITY TRIAGE QUEUE
Below is the optimized queue ordered by deadline risk score:
`;

  sorted.forEach((item, idx) => {
    res += `\n**Rank #${idx + 1}: ${item.task.title}**  
- **Category**: \`${item.task.category}\` | **Importance**: \`${item.task.importance}\`  
- **Risk Level**: **${item.details.urgencyLevel} (${item.details.riskScore}/100)**  
- **Next Triage Action**: ${item.details.recommendedAction}  
- **Time Window**: Estimating ${item.task.estimatedMinutes} minutes of active work needed before deadline.\n`;
  });

  res += `\n### 🛡️ EMERGENCY SUGGESTIONS
1. **Scope Cut**: Drop aesthetics on rank #1. Deliver the core structure first.
2. **Tab Firewall**: Close all communication chat clients and browser tabs except this app and the direct working document.`;

  return res;
}

function generateLocalRescuePlan(task: Task): string {
  const m = task.estimatedMinutes || 45;
  const b1 = Math.max(5, Math.round(m * 0.15));
  const b2 = Math.max(15, Math.round(m * 0.55));
  const b3 = Math.max(5, Math.round(m * 0.15));
  const b4 = Math.max(5, Math.round(m * 0.15));

  return `### 🚨 LOCAL RESCUE BACKUP ACTIVE
The system has initialized rule-based **Rescue Mode** for **"${task.title}"**.

## ✂️ SCOPE COMPRESSION (WHAT TO SKIP)
- **IGNORE**: Perfect visual styling, final formatting, detailed copy-editing.
- **SIMPLIFY**: Use templates, outline critical arguments as bullet points, focus purely on functional completion.
- **WHAT NOT TO WASTE TIME ON**: Extensive secondary citations, long intros, or setting up complex automated tests.

---

## ⏱️ TIME-BOXED EMERGENCY SCHEDULE (Total: ${m}m)
- **Block 1: Frame & Skeleton (${b1} mins)**: Create file templates, headings, and input/output parameters. Do not write content yet.
- **Block 2: High-Yield Substance (${b2} mins)**: Build the core business logic, write the primary sections, and finish the functional base.
- **Block 3: Error Prevention (${b3} mins)**: Test the file compiled outputs, double-check for simple typos, verify links.
- **Block 4: Submission Protocol (${b4} mins)**: Push, upload, submit, or export. **Never skip this block!** Leaving 5 minutes prevents technical glitches from causing a 0.

---

## 🚫 DISTRACTION FIREWALL
- **Brutal Action**: Place your phone in another room or turn on airplane mode. Close all Slack/Discord/WhatsApp clients immediately.

---

## 💬 EMERGENCY COMMUNICATIONS
If you expect to be late, copy this ready-to-use professional draft:
*"Hi team, I am finalized the core parts of ${task.title} and am doing final validation checks now. I will submit the work shortly. Thank you for your patience."*`;
}

function generateLocalCoachResponse(message: string, tasks: Task[]): string {
  const text = message.toLowerCase();
  const pending = tasks.filter(t => t.status !== 'Completed');

  if (text.includes('stress') || text.includes('anxious') || text.includes('scared') || text.includes('help')) {
    const item = pending[0];
    return `### Take a Deep, Focused Breath 🌬️
Procrastination and stress are not moral failures; they are a nervous system response to decision fatigue.

You have **${pending.length} pending task shields**. 
Let's make this exceptionally easy:
1. Ignore everything except **"${item ? item.title : 'your first task'}"**.
2. Set a timer for **just 5 minutes**.
3. All you have to do is open the file or workspace and write one single sentence. That is it.

Once the physical transition is made, momentum will carry you. I am right here defending your back.`;
  }

  if (text.includes('first') || text.includes('do') || text.includes('start')) {
    if (pending.length === 0) {
      return `### Stand Down! 🛡️
You have zero pending high-risk deadlines right now! Your baseline posture is completely safe. Give yourself permission to rest and recharge. This prevents burnout and strengthens your next response cycle.`;
    }
    const item = pending[0];
    const details = calculateRiskDetails(item, tasks);
    return `### Your Next Defensive Target 🎯
Analyzing your current matrix, you must engage with:
- **Task**: **"${item.title}"**
- **Deadline Risk**: **${details.riskScore}/100** (${details.urgencyLevel})
- **Recommended Move**: Activate **Rescue Mode** from the tasks panel and run a 25-minute Pomodoro focus sprint. Go click the "Rescue" button and let's get it done!`;
  }

  return `### AI Coach Active (Local Offline Mode)
I have compiled your active context: **${pending.length} pending items**. 

Tell me, what are you facing right now?
- Type **"What should I do first?"** to evaluate the highest threat.
- Type **"I am stressed"** to receive anxiety de-escalation steps.
- Type **"Create a sprint"** to map out a 25-minute survival interval.`;
}

function generateLocalDelayRecoveryPlan(
  task: Task,
  timeRemainingMins: number,
  progressPct: number,
  isMandatory: boolean
): Promise<string> | string {
  const strategy = isMandatory
    ? '⚠️ TASK IS MANDATORY: You must perform strict scope compression. Cut out 50% of the minor features, focus entirely on the core functionality, and submit.'
    : 'ℹ️ TASK IS FLEXIBLE: Request a 24-hour extension or push this task to tomorrow. Do not compromise your mental health for a flexible deadline.';

  return `### 🩹 LOCAL DELAY RECOVERY PROTOCOL ACTIVE

Analyzing recovery options for **"${task.title}"** with **${timeRemainingMins} minutes left** and **${progressPct}% progress**:

#### 🛠️ EMERGENCY RECOVERY DEBRIEF
- **Strategic Decision**: ${strategy}
- **Estimated Work Needed**: ${task.estimatedMinutes}m vs. ${timeRemainingMins}m remaining.

#### 📝 TACTICAL REVISED ROADMAP
1. **Close the Gap**: Stop compiling or checking secondary formatting. Work directly on the critical path elements.
2. **Mute Comms**: Set an "Emergency Work Block" on your messaging apps.
3. **The 3-Step Reboot**:
   - Write the absolute minimum functional requirement.
   - Ignore any secondary requirements or aesthetic designs.
   - Run tests or review once, then submit immediately.`;
}

function generateLocalBreakdown(task: Task): string {
  const minutes = task.estimatedMinutes || 45;
  const t1 = Math.max(5, Math.round(minutes * 0.1));
  const t2 = Math.max(10, Math.round(minutes * 0.3));
  const t3 = Math.max(10, Math.round(minutes * 0.3));
  const t4 = Math.max(5, Math.round(minutes * 0.2));
  const t5 = Math.max(5, Math.round(minutes * 0.1));

  return `### 📋 LOCAL MICRO-STEP BREAKDOWN
We have broken down **"${task.title}"** into 5 easily digestible micro-steps to overcome inertia:

1. **Step 1: The Quick Win (${t1}m)**: Open all required tabs, locate the template or draft folder, and write down the title. (Inertia Breaker)
2. **Step 2: Structure Framing (${t2}m)**: Map out the 3 sections or files required. Build the basic layout.
3. **Step 3: Core Implementation (${t3}m)**: Complete the main core functional section. Write the code or draft the primary text.
4. **Step 4: Refinement Clean (${t4}m)**: Remove unnecessary text, check basic functionality, fix glaring errors.
5. **Step 5: Submission Checklist (${t5}m)**: Package, save, upload and review. Complete!

💡 **How to start**: Go execute **Step 1** right now. It takes less than 5 minutes!`;
}

function generateLocalWarRoom(tasks: Task[]): string {
  const pending = tasks.filter(t => t.status !== 'Completed');
  if (pending.length === 0) {
    return `### 📅 WAR ROOM: ALL SYSTEM CLEAR
No active tasks require planning. Enjoy your day!`;
  }

  const morning = pending[0];
  const afternoon = pending[1] || pending[0];
  const evening = pending[2] || pending[0];

  return `### 📅 LOCAL WAR ROOM PLANNER ACTIVE

Here is your combat schedule for today:

- **🌅 09:00 - 11:30 | MORNING FOCUS BLOCK (Peak Cognitive Peak)**  
  - Focus exclusively on: **"${morning.title}"**  
  - **Strategy**: Turn off notifications, use a 25-minute Pomodoro sprint.  
  - **Rest Buffer**: 11:30 - 11:45 (Walk away from screens).

- **🍕 12:00 - 13:00 | MID-DAY DECOMPRESSION**  
  - Re-hydrate, eat a wholesome lunch, clear mental workspace.

- **🌇 13:00 - 15:30 | AFTERNOON SESSIONS (Execution & Delivery)**  
  - Work on: **"${afternoon.title}"**  
  - **Strategy**: Break into micro-steps. Focus on Minimum Viable Completion.  
  - **Rest Buffer**: 15:30 - 15:45 (Quick breathing exercise).

- **🌆 16:00 - 17:30 | LOW-ENERGY CLEANUP & REVIEW**  
  - Work on lighter tasks or check off habits: **"${evening.title}"**  
  - Perform daily status reviews. Check items off the list.

- **🌙 18:00+ | STRATEGIC RETREAT**  
  - Reflect on focus successes, record a brief reflection text, and turn off your computer.`;
}
