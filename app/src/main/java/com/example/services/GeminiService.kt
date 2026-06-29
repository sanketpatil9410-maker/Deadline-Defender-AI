package com.example.services

import android.util.Log
import com.example.BuildConfig
import com.example.data.Task
import com.example.utils.RiskScoring
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit

object GeminiService {
    private const val TAG = "GeminiService"
    private const val MODEL_NAME = "gemini-3.5-flash"
    private const val BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/$MODEL_NAME:generateContent"

    private val client = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    /**
     * Call direct REST API of Gemini 3.5 Flash
     */
    private suspend fun callGeminiApi(prompt: String, systemInstruction: String? = null): String = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isEmpty() || apiKey == "MY_GEMINI_API_KEY") {
            Log.e(TAG, "API Key is empty or placeholder. Falling back to local AI mode.")
            throw IllegalStateException("API Key missing")
        }

        try {
            val rootObj = JSONObject()
            
            // Contents
            val contentsArr = JSONArray()
            val contentObj = JSONObject()
            val partsArr = JSONArray()
            val partObj = JSONObject()
            partObj.put("text", prompt)
            partsArr.put(partObj)
            contentObj.put("parts", partsArr)
            contentsArr.put(contentObj)
            rootObj.put("contents", contentsArr)

            // System Instruction
            if (systemInstruction != null) {
                val sysContentObj = JSONObject()
                val sysPartsArr = JSONArray()
                val sysPartObj = JSONObject()
                sysPartObj.put("text", systemInstruction)
                sysPartsArr.put(sysPartObj)
                sysContentObj.put("parts", sysPartsArr)
                rootObj.put("systemInstruction", sysContentObj)
            }

            // Generation config
            val genConfig = JSONObject()
            genConfig.put("temperature", 0.7)
            rootObj.put("generationConfig", genConfig)

            val mediaType = "application/json; charset=utf-8".toMediaType()
            val requestBody = rootObj.toString().toRequestBody(mediaType)

            val request = Request.Builder()
                .url("$BASE_URL?key=$apiKey")
                .post(requestBody)
                .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    val errBody = response.body?.string() ?: ""
                    Log.e(TAG, "Gemini API error code: ${response.code}, body: $errBody")
                    throw Exception("API Error: ${response.code}")
                }

                val responseBody = response.body?.string() ?: throw Exception("Empty response body")
                val responseJson = JSONObject(responseBody)
                
                val candidates = responseJson.optJSONArray("candidates")
                if (candidates != null && candidates.length() > 0) {
                    val candidate = candidates.getJSONObject(0)
                    val content = candidate.optJSONObject("content")
                    val parts = content?.optJSONArray("parts")
                    if (parts != null && parts.length() > 0) {
                        return@withContext parts.getJSONObject(0).optString("text", "No response text")
                    }
                }
                "No candidate content text found"
            }
        } catch (e: Exception) {
            Log.e(TAG, "API call exception", e)
            throw e
        }
    }

    /**
     * Prioritization Service
     */
    suspend fun generatePrioritizationPlan(tasks: List<Task>): String {
        if (tasks.isEmpty()) {
            return "No tasks available. Add some tasks first to prioritize!"
        }

        val formattedTasks = tasks.joinToString("\n\n") { t ->
            "Task ID: ${t.id}\n" +
            "Title: ${t.title}\n" +
            "Description: ${t.description}\n" +
            "Category: ${t.category}\n" +
            "Deadline: ${t.deadline}\n" +
            "Importance: ${t.importance}\n" +
            "Status: ${t.status}\n" +
            "Estimated Duration: ${t.estimatedMinutes} mins\n" +
            "Energy Required: ${t.energyRequired}\n" +
            "Risk Score: ${RiskScoring.calculateRiskScore(t)}"
        }

        val prompt = "Here is my current task list:\n\n$formattedTasks\n\nAnalyze and prioritize these tasks."
        val systemInstruction = "You are Deadline Defender AI, an expert productivity strategist. " +
                "Analyze the user's current task list and create a prioritized action plan. " +
                "Do NOT give generic productivity advice. Be extremely direct and specific. " +
                "Organize your advice into these sections:\n" +
                "1. ### 🚨 HIGH-RISK THREAT CONTEXT: State which task(s) are at critical risk, why, and the exact consequence if missed.\n" +
                "2. ### 📋 THE TRIAGE ORDER: Present a numbered ranking list of tasks to execute first. For each task, list:\n" +
                "   * Task Title\n" +
                "   * **Impact Ratio**: Why this must be prioritized (importance vs effort).\n" +
                "   * **Next Concrete Action**: A hyper-specific micro-action they can do in under 5 minutes.\n" +
                "3. ### ⚡ ENERGETIC SCHEDULING: Group the tasks by high/medium/low energy requirements matching the user's list."

        return try {
            callGeminiApi(prompt, systemInstruction)
        } catch (e: Exception) {
            generateLocalPrioritization(tasks)
        }
    }

    /**
     * Rescue Mode Plan Service
     */
    suspend fun generateRescuePlan(task: Task): String {
        val prompt = "Task details:\n" +
                "Title: ${task.title}\n" +
                "Description: ${task.description}\n" +
                "Deadline: ${task.deadline}\n" +
                "Importance: ${task.importance}\n" +
                "Estimated Duration: ${task.estimatedMinutes} mins\n" +
                "Category: ${task.category}\n" +
                "Notes: ${task.notes ?: "None"}"

        val systemInstruction = "You are Deadline Defender AI in Rescue Mode. " +
                "The user is close to missing a deadline. Create an emergency completion plan. " +
                "Do not give generic advice like 'stay calm' or 'take a breath'. Instead, deliver a high-velocity emergency roadmap:\n" +
                "1. ### ✂️ SCOPE COMPRESSION (WHAT TO CUT): Detail exactly 2-3 parts of this task that can be completely skipped, ignored, or simplified to achieve Minimum Viable Completion (MVC).\n" +
                "2. ### ⏱️ 25-MINUTE SPRINT STEPS: Break the remaining scope into exactly 3 sequential action intervals (e.g., Sprint 1: 10 mins, Sprint 2: 10 mins, Sprint 3: 5 mins).\n" +
                "3. ### 🚫 DISTRACTION FIREWALL: Identify the #1 source of delay for this task type and state a brutal action to block it."

        return try {
            callGeminiApi(prompt, systemInstruction)
        } catch (e: Exception) {
            generateLocalRescuePlan(task)
        }
    }

    /**
     * Daily Planner Service
     */
    suspend fun generateDailyPlan(tasks: List<Task>): String {
        if (tasks.isEmpty()) {
            return "No tasks to plan. Add some tasks to generate Today's Plan!"
        }

        val formattedTasks = tasks.joinToString("\n") { t ->
            "- ${t.title} (${t.estimatedMinutes}m, Importance: ${t.importance}, Due: ${t.deadline}, Status: ${t.status})"
        }

        val prompt = "Here are my pending tasks for today:\n$formattedTasks\n\nGenerate my structured daily schedule."
        val systemInstruction = "You are Deadline Defender AI, a realistic daily planning assistant. " +
                "Create an optimized daily schedule.\n" +
                "Organize the schedule clearly:\n" +
                "1. ### 🎯 THE ANCHOR TARGET: Identify the single most important task of the day.\n" +
                "2. ### 📅 HOUR-BY-HOUR FOCUS MAP: Provide a realistic hourly timeline. Group tasks into morning deep-work blocks and afternoon low-energy catchups, explicitly building in 10-minute rest buffers.\n" +
                "3. ### 🛡️ BUFFER DEFENSE: Write a one-sentence rule on how to handle interruptions during deep-work blocks."

        return try {
            callGeminiApi(prompt, systemInstruction)
        } catch (e: Exception) {
            generateLocalDailyPlan(tasks)
        }
    }

    /**
     * Delay Recovery Plan ("I'm Running Late")
     */
    suspend fun generateDelayRecoveryPlan(task: Task, timeRemainingMins: Int, progressPct: Int, isMandatory: Boolean): String {
        val prompt = "Task Title: ${task.title}\n" +
                "Total Estimated Time: ${task.estimatedMinutes} mins\n" +
                "Time remaining: $timeRemainingMins mins\n" +
                "Progress completed: $progressPct%\n" +
                "Is task mandatory: ${if (isMandatory) "Yes" else "No"}\n" +
                "Importance: ${task.importance}"

        val systemInstruction = "You are Deadline Defender AI, helping a user recover from delay. " +
                "Create a revised recovery roadmap.\n" +
                "Organize as follows:\n" +
                "1. ### 🩹 EMERGENCY COMPRESSION: How to condense the remaining work into the limited time left.\n" +
                "2. ### 🛑 WHAT TO POSTPONE: Identify low-priority items or non-essential features that must be rescheduled.\n" +
                "3. ### 🚀 RECOVERY PROTOCOL: Give 3 micro-steps to restart momentum immediately."

        return try {
            callGeminiApi(prompt, systemInstruction)
        } catch (e: Exception) {
            generateLocalDelayRecoveryPlan(task, timeRemainingMins, progressPct, isMandatory)
        }
    }

    /**
     * Productivity Coach Chat Assistant
     */
    suspend fun chatWithCoach(userMessage: String, tasks: List<Task>): String {
        val formattedTasks = if (tasks.isEmpty()) {
            "No active tasks right now."
        } else {
            tasks.joinToString("\n") { t ->
                "- ${t.title} (Importance: ${t.importance}, Status: ${t.status}, Due: ${t.deadline})"
            }
        }

        val prompt = "User Message: \"$userMessage\"\n\n" +
                "User's Task Context:\n$formattedTasks"

        val systemInstruction = "You are Deadline Defender AI, an encouraging but hyper-focused productivity coach. " +
                "Help the user with planning, focus, overcoming stress, and beating procrastination. " +
                "Never offer generic platitudes. Always refer back to their active tasks. " +
                "If they are stressed, give them exactly one micro-step to start on their highest-risk task right now. " +
                "Keep responses under 150 words. Focus on immediate physical actions rather than theoretical strategies."

        return try {
            callGeminiApi(prompt, systemInstruction)
        } catch (e: Exception) {
            generateLocalCoachResponse(userMessage, tasks)
        }
    }

    // --- LOCAL FALLBACK AI ENGINES (PROMPT RULES COMPLIANCE) ---

    private fun generateLocalPrioritization(tasks: List<Task>): String {
        val sortedTasks = tasks
            .filter { it.status != "Completed" }
            .map { it to RiskScoring.calculateRiskScore(it) }
            .sortedByDescending { it.second }

        val sb = StringBuilder()
        sb.append("⚠️ **[AI Local Backup Active]** Showing Smart Local Prioritization:\n\n")
        sb.append("Here is your prioritized action roadmap to defend your upcoming deadlines:\n\n")

        sortedTasks.forEachIndexed { idx, pair ->
            val (task, score) = pair
            val cat = RiskScoring.getRiskCategory(score)
            sb.append("### Rank #${idx + 1}: ${task.title}\n")
            sb.append("- **Category**: ${task.category} | **Importance**: ${task.importance}\n")
            sb.append("- **Risk Level**: **$cat ($score/100)**\n")
            sb.append("- **Recommended Action**: ")
            when {
                score >= 80 -> sb.append("🚀 Activate **Rescue Mode** immediately! Break this task into 15-minute intervals and drop non-essential features.")
                score >= 60 -> sb.append("⏱️ Start a focused 45-minute sprint now. Eliminate tabs and block phone notifications.")
                score >= 30 -> sb.append("📅 Assign a dedicated 1-hour block today to make progress before urgency rises.")
                else -> sb.append("🌱 Steady progress. Check this off during low-energy periods.")
            }
            sb.append("\n- **Reasoning**: Due on ${task.deadline.replace("T", " ")}. Length: ${task.estimatedMinutes}m. Currently marked as: ${task.status}.\n\n")
        }

        sb.append("\n💡 **Pro-Tip**: Tackle your highest risk item first to break the paralysis loop!")
        return sb.toString()
    }

    private fun generateLocalRescuePlan(task: Task): String {
        val totalMins = task.estimatedMinutes
        val step1 = (totalMins * 0.15).toInt().coerceAtLeast(10)
        val step2 = (totalMins * 0.50).toInt().coerceAtLeast(20)
        val step3 = (totalMins * 0.20).toInt().coerceAtLeast(10)
        val step4 = (totalMins * 0.15).toInt().coerceAtLeast(5)

        return """
            🚨 **[AI Local Backup Active] EMERGENCY RESCUE PLAN**
            
            Let's rescue **"${task.title}"** before the deadline! We are trimming the fat and focusing exclusively on a Minimum Viable Completion (MVC).
            
            ⏱️ **Time-Boxed Focus Blocks (Total: $totalMins minutes)**
            
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
            
            🔥 **Motivational Charge**: "Perfection is the enemy of completed. A finished project at 80% quality wins. A perfect project that is late gets a zero. Focus on execution!"
        """.trimIndent()
    }

    private fun generateLocalDailyPlan(tasks: List<Task>): String {
        val activeTasks = tasks.filter { it.status != "Completed" }
        if (activeTasks.isEmpty()) {
            return "🎉 You have no active tasks left! Today is a perfect day for deep learning, relaxation, or planning your next big goal."
        }

        val highPriority = activeTasks.filter { it.importance == "Critical" || it.importance == "High" }
        val otherTasks = activeTasks.filter { it.importance != "Critical" && it.importance != "High" }

        val sb = StringBuilder()
        sb.append("📅 **[AI Local Backup Active] YOUR SURVIVAL DAILY PLAN**\n\n")
        sb.append("Here is your tactical layout for today, structured for high-focus deep work and sensible pacing:\n\n")

        sb.append("🌅 **Morning Block (09:00 - 12:00) | Peak Focus**\n")
        if (highPriority.isNotEmpty()) {
            val prime = highPriority.first()
            sb.append("- **09:00 - 11:00**: Deep Work on **`${prime.title}`** (${prime.estimatedMinutes}m expected). Shut off all comms.\n")
            sb.append("- **11:00 - 11:15**: 🚶 active walking break. Decompress.\n")
            if (highPriority.size > 1) {
                val second = highPriority[1]
                sb.append("- **11:15 - 12:00**: Progress on **`${second.title}`**.\n")
            } else {
                sb.append("- **11:15 - 12:00**: Focus buffer/administrative cleanup.\n")
            }
        } else {
            val prime = otherTasks.first()
            sb.append("- **09:00 - 10:30**: Work on **`${prime.title}`**.\n")
            sb.append("- **10:30 - 10:45**: Coffee break.\n")
            sb.append("- **10:45 - 12:00**: Continue or process light tasks.\n")
        }

        sb.append("\n🍕 **Mid-day (12:00 - 13:00) | Recharge**\n")
        sb.append("- Eat a balanced lunch, hydrate, and do not look at screens.\n\n")

        sb.append("🌇 **Afternoon Block (13:00 - 17:00) | Secondary Work & Habits**\n")
        val pmTasks = if (highPriority.size > 2) highPriority.drop(2) else otherTasks
        if (pmTasks.isNotEmpty()) {
            val pmt = pmTasks.first()
            sb.append("- **13:00 - 14:30**: Momentum Session: **`${pmt.title}`**.\n")
            sb.append("- **14:30 - 14:45**: Hydration & breathing stretch.\n")
            if (pmTasks.size > 1) {
                sb.append("- **14:45 - 16:00**: Side tasks: ${pmTasks.drop(1).take(2).joinToString { "`${it.title}`" }}\n")
            }
            sb.append("- **16:00 - 17:00**: Email, cleanup, update status of completed tasks.\n")
        } else {
            sb.append("- **13:00 - 15:00**: Creative brainstorming, task optimization, review.\n")
            sb.append("- **15:00 - 17:00**: Habit tracker check-offs, setting tomorrow's goals.\n")
        }

        sb.append("\n🌙 **Evening Block (18:00+) | Reflection & Review**\n")
        sb.append("- Review today's completed accomplishments.\n")
        sb.append("- Set your 'One Critical Focus' for tomorrow to avoid decision fatigue.")

        return sb.toString()
    }

    private fun generateLocalDelayRecoveryPlan(task: Task, timeRemaining: Int, progress: Int, isMandatory: Boolean): String {
        val scale = if (isMandatory) "Mandatory - Scope compression required." else "Flexible - Postponement recommended."
        return """
            ⚠️ **[AI Local Backup Active] LATE RECOVERY TACTICAL DEBRIEF**
            
            We are falling behind on **"${task.title}"** but panic is not an option. Here is your tactical recovery layout:
            
            📊 **Status Check**: $progress% completed, with **$timeRemaining minutes remaining**.
            🏷️ **Task Level**: $scale (Importance: ${task.importance})
            
            🛠️ **Action Plan:**
            1. **Implement Scope Cut**: 
               ${if (isMandatory) "Since this task is mandatory, do NOT postpone. Immediately remove auxiliary features. Focus ONLY on submitting a functional base draft." else "Since this task is flexible, push the deadline by 24 hours. Put this task aside for 1 hour to lower stress levels, and restart tomorrow with a fresh slate."}
            2. **Stop Multi-tasking**: Close all browser tabs, silence your phone, and let colleagues/family know you are in an 'emergency deep work' window for the next $timeRemaining minutes.
            3. **Communicate (If applicable)**: If this involves a client or supervisor, send a 1-sentence heads-up: *"Hey, finishing up the details on ${task.title}, will have it to you shortly."* This proactively manages expectations.
        """.trimIndent()
    }

    private fun generateLocalCoachResponse(message: String, tasks: List<Task>): String {
        val normalized = message.lowercase()
        val activeTasks = tasks.filter { it.status != "Completed" }

        return when {
            normalized.contains("stress") || normalized.contains("anxious") || normalized.contains("overwhelm") -> {
                "Take a deep, slow breath. Stress is just your brain reacting to a high volume of choices. " +
                        "Let's simplify. You have ${activeTasks.size} pending tasks. " +
                        "${if (activeTasks.isNotEmpty()) "Let's ignore everything except **'${activeTasks.first().title}'** for the next 15 minutes. Just open it and look at it." else "You actually have no urgent tasks pending! Your stress might be habit-based. Give yourself permission to rest."} " +
                        "Can you do just one tiny action right now?"
            }
            normalized.contains("first") || normalized.contains("start") -> {
                if (activeTasks.isEmpty()) {
                    "You are all caught up! If you want to start something new, write down a fresh creative goal. Otherwise, take a well-deserved break."
                } else {
                    val target = activeTasks.maxByOrNull { RiskScoring.calculateRiskScore(it) }!!
                    "According to your deadline metrics, your top-priority target is **'${target.title}'** (Due: ${target.deadline.replace("T", " ")}). " +
                            "My recommendation: Launch **Rescue Mode** for this task immediately and do a 25-minute focused sprint. Let's conquer it!"
                }
            }
            normalized.contains("late") || normalized.contains("missed") -> {
                "Missing a deadline feels heavy, but it is excellent data. It means your initial time estimate was too optimistic. " +
                        "Action item: 1. Update the deadline of the task to a realistic future slot. 2. Write down *why* it took longer (Blocked? Procrastination? Scope creep?). " +
                        "Self-compassion drives productivity, guilt drives procrastination. Forgive yourself and take the next step."
            }
            else -> {
                "Hi there! I am your hyper-focused productivity strategist. " +
                        "Right now, you have ${activeTasks.size} active tasks waiting for completion. " +
                        "Tell me: Are you stuck on a specific task, feeling overwhelmed, or looking for a structured schedule block for today?"
            }
        }
    }
}
