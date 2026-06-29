package com.example.ui

import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import com.example.services.GeminiService
import com.example.utils.RiskScoring
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

sealed interface UIState<out T> {
    object Idle : UIState<Nothing>
    object Loading : UIState<Nothing>
    data class Success<T>(val data: T) : UIState<T>
    data class Error(val message: String) : UIState<Nothing>
}

data class ChatMessage(
    val sender: String, // "user" or "coach"
    val text: String,
    val timestamp: String = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
)

class DeadlineViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getDatabase(application)
    private val repository = TaskRepository(db.taskDao())

    // UI state flows from Repository
    val tasks: StateFlow<List<Task>> = repository.allTasks.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val habits: StateFlow<List<Habit>> = repository.allHabits.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    // Habit focus details & streaks
    private val _streakCount = MutableStateFlow(3) // Seed with standard hackathon starter streak
    val streakCount = _streakCount.asStateFlow()

    private val _focusGoal = MutableStateFlow("Complete primary critical tasks before dusk")
    val focusGoal = _focusGoal.asStateFlow()

    private val _productivityReflection = MutableStateFlow("")
    val productivityReflection = _productivityReflection.asStateFlow()

    // AI States
    private val _prioritizationPlan = MutableStateFlow<UIState<String>>(UIState.Idle)
    val prioritizationPlan = _prioritizationPlan.asStateFlow()

    private val _rescuePlan = MutableStateFlow<UIState<String>>(UIState.Idle)
    val rescuePlan = _rescuePlan.asStateFlow()

    private val _selectedRescueTask = MutableStateFlow<Task?>(null)
    val selectedRescueTask = _selectedRescueTask.asStateFlow()

    private val _dailyPlan = MutableStateFlow<UIState<String>>(UIState.Idle)
    val dailyPlan = _dailyPlan.asStateFlow()

    private val _delayRecoveryPlan = MutableStateFlow<UIState<String>>(UIState.Idle)
    val delayRecoveryPlan = _delayRecoveryPlan.asStateFlow()

    private val _chatHistory = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage("coach", "Hello! I am your Deadline Defender Coach. Procrastination is a response to stress, not a lack of capability. Tell me, what project are we defending today?")
        )
    )
    val chatHistory = _chatHistory.asStateFlow()

    private val _chatLoading = MutableStateFlow(false)
    val chatLoading = _chatLoading.asStateFlow()

    // Interactive countdown timer for Rescue Mode Focus Sprint
    private val _timerSecondsRemaining = MutableStateFlow(1500) // 25 mins
    val timerSecondsRemaining = _timerSecondsRemaining.asStateFlow()

    private val _isTimerRunning = MutableStateFlow(false)
    val isTimerRunning = _isTimerRunning.asStateFlow()

    private var timerJob: Job? = null

    init {
        // Load custom setting parameters
        viewModelScope.launch {
            repository.getSetting("streak")?.let { _streakCount.value = it.toInt() }
            repository.getSetting("focus_goal")?.let { _focusGoal.value = it }
            repository.getSetting("reflection")?.let { _productivityReflection.value = it }
        }
    }

    // Timer actions
    fun toggleTimer() {
        if (_isTimerRunning.value) {
            pauseTimer()
        } else {
            startTimer()
        }
    }

    private fun startTimer() {
        _isTimerRunning.value = true
        timerJob = viewModelScope.launch {
            while (_timerSecondsRemaining.value > 0) {
                delay(1000)
                _timerSecondsRemaining.value -= 1
            }
            _isTimerRunning.value = false
        }
    }

    fun pauseTimer() {
        _isTimerRunning.value = false
        timerJob?.cancel()
    }

    fun resetTimer(minutes: Int = 25) {
        pauseTimer()
        _timerSecondsRemaining.value = minutes * 60
    }

    // Task Actions
    fun addTask(
        title: String,
        description: String,
        category: String,
        deadline: String,
        estimatedMinutes: Int,
        importance: String,
        energyRequired: String,
        notes: String?
    ) {
        viewModelScope.launch {
            val now = LocalDateTime.now().toString()
            val newTask = Task(
                id = UUID.randomUUID().toString(),
                title = title,
                description = description,
                category = category,
                deadline = deadline,
                estimatedMinutes = estimatedMinutes,
                importance = importance,
                status = "Not Started",
                energyRequired = energyRequired,
                notes = notes,
                createdAt = now,
                updatedAt = now
            )
            repository.insertTask(newTask)
        }
    }

    fun updateTask(task: Task) {
        viewModelScope.launch {
            repository.insertTask(task.copy(updatedAt = LocalDateTime.now().toString()))
        }
    }

    fun deleteTask(id: String) {
        viewModelScope.launch {
            repository.deleteTask(id)
            if (_selectedRescueTask.value?.id == id) {
                _selectedRescueTask.value = null
                _rescuePlan.value = UIState.Idle
            }
        }
    }

    fun toggleTaskCompletion(task: Task) {
        viewModelScope.launch {
            val newStatus = if (task.status == "Completed") "In Progress" else "Completed"
            repository.insertTask(task.copy(status = newStatus, updatedAt = LocalDateTime.now().toString()))
        }
    }

    // Habit Actions
    fun addHabit(title: String) {
        viewModelScope.launch {
            val habit = Habit(
                id = UUID.randomUUID().toString(),
                title = title,
                isCompleted = false,
                date = LocalDateTime.now().toLocalDate().toString()
            )
            repository.insertHabit(habit)
        }
    }

    fun toggleHabitCompletion(habit: Habit) {
        viewModelScope.launch {
            repository.insertHabit(habit.copy(isCompleted = !habit.isCompleted))
        }
    }

    fun deleteHabit(id: String) {
        viewModelScope.launch {
            repository.deleteHabit(id)
        }
    }

    fun saveFocusGoal(goal: String) {
        viewModelScope.launch {
            _focusGoal.value = goal
            repository.saveSetting("focus_goal", goal)
        }
    }

    fun saveReflection(text: String) {
        viewModelScope.launch {
            _productivityReflection.value = text
            repository.saveSetting("reflection", text)
        }
    }

    fun setStreak(count: Int) {
        viewModelScope.launch {
            _streakCount.value = count
            repository.saveSetting("streak", count.toString())
        }
    }

    // AI Integrations
    fun runAIPrioritization() {
        _prioritizationPlan.value = UIState.Loading
        viewModelScope.launch {
            try {
                val plan = GeminiService.generatePrioritizationPlan(tasks.value)
                _prioritizationPlan.value = UIState.Success(plan)
            } catch (e: Exception) {
                _prioritizationPlan.value = UIState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun runRescuePlan(task: Task) {
        _selectedRescueTask.value = task
        _rescuePlan.value = UIState.Loading
        resetTimer(25) // Prepare the Pomodoro timer for focus sprint
        viewModelScope.launch {
            try {
                val plan = GeminiService.generateRescuePlan(task)
                _rescuePlan.value = UIState.Success(plan)
            } catch (e: Exception) {
                _rescuePlan.value = UIState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun selectRescueTaskDirectly(task: Task) {
        _selectedRescueTask.value = task
        _rescuePlan.value = UIState.Idle
    }

    fun clearRescueTask() {
        _selectedRescueTask.value = null
        _rescuePlan.value = UIState.Idle
    }

    fun runDailyPlan() {
        _dailyPlan.value = UIState.Loading
        viewModelScope.launch {
            try {
                val plan = GeminiService.generateDailyPlan(tasks.value)
                _dailyPlan.value = UIState.Success(plan)
            } catch (e: Exception) {
                _dailyPlan.value = UIState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun runDelayRecovery(task: Task, timeRemaining: Int, progress: Int, isMandatory: Boolean) {
        _delayRecoveryPlan.value = UIState.Loading
        viewModelScope.launch {
            try {
                val plan = GeminiService.generateDelayRecoveryPlan(task, timeRemaining, progress, isMandatory)
                _delayRecoveryPlan.value = UIState.Success(plan)
            } catch (e: Exception) {
                _delayRecoveryPlan.value = UIState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun clearDelayRecoveryPlan() {
        _delayRecoveryPlan.value = UIState.Idle
    }

    fun sendCoachMessage(text: String) {
        if (text.isBlank()) return
        
        val userMsg = ChatMessage("user", text)
        _chatHistory.value = _chatHistory.value + userMsg
        _chatLoading.value = true

        viewModelScope.launch {
            try {
                val response = GeminiService.chatWithCoach(text, tasks.value)
                val coachMsg = ChatMessage("coach", response)
                _chatHistory.value = _chatHistory.value + coachMsg
            } catch (e: Exception) {
                val errCoachMsg = ChatMessage("coach", "Oops, I had a momentary loss of focus due to network jitter! Tell me, how can I assist you with your workload right now?")
                _chatHistory.value = _chatHistory.value + errCoachMsg
            } finally {
                _chatLoading.value = false
            }
        }
    }

    // Demo Data Loader
    fun injectDemoData() {
        viewModelScope.launch {
            val now = LocalDateTime.now()
            
            // Delete existing
            tasks.value.forEach { repository.deleteTask(it.id) }
            habits.value.forEach { repository.deleteHabit(it.id) }

            // Inject Tasks
            val demoTasks = listOf(
                Task(
                    id = "demo_task_1",
                    title = "Submit internship report",
                    description = "Assemble all weekly logs, get project summary signed, and compile the final PDF for submission.",
                    category = "Work",
                    deadline = now.plusHours(3).toString().substringBefore("."),
                    estimatedMinutes = 120,
                    importance = "Critical",
                    status = "Not Started",
                    energyRequired = "High",
                    notes = "Make sure the executive summary is robust. Ensure references from lead mentor are included.",
                    createdAt = now.toString(),
                    updatedAt = now.toString()
                ),
                Task(
                    id = "demo_task_2",
                    title = "Pay electricity bill",
                    description = "Access state electricity board portal and process online transaction.",
                    category = "Finance",
                    deadline = now.plusDays(1).toString().substringBefore("."),
                    estimatedMinutes = 15,
                    importance = "High",
                    status = "Not Started",
                    energyRequired = "Low",
                    notes = "Billing cycle ends tomorrow. Avoid late fee penalty of $15.",
                    createdAt = now.toString(),
                    updatedAt = now.toString()
                ),
                Task(
                    id = "demo_task_3",
                    title = "Prepare interview answers",
                    description = "Mock review behavior, experience, and system designs utilizing standard flashcards.",
                    category = "Study",
                    deadline = now.plusDays(2).toString().substringBefore("."),
                    estimatedMinutes = 180,
                    importance = "High",
                    status = "In Progress",
                    energyRequired = "High",
                    notes = "Structure responses using the STAR method (Situation, Task, Action, Result).",
                    createdAt = now.toString(),
                    updatedAt = now.toString()
                ),
                Task(
                    id = "demo_task_4",
                    title = "Complete hackathon project",
                    description = "Integrate database operations, polish Material 3 layouts, and write a stellar submission description.",
                    category = "Business",
                    deadline = now.plusDays(4).toString().substringBefore("."),
                    estimatedMinutes = 480,
                    importance = "Critical",
                    status = "In Progress",
                    energyRequired = "High",
                    notes = "Submit the GitHub URL, video demo link, and final project build file before submission cutoff.",
                    createdAt = now.toString(),
                    updatedAt = now.toString()
                ),
                Task(
                    id = "demo_task_5",
                    title = "Gym workout plan",
                    description = "Standard dynamic lifting routine emphasizing squats, overhead presses, and high intensity interval training.",
                    category = "Health",
                    deadline = now.plusDays(5).toString().substringBefore("."),
                    estimatedMinutes = 60,
                    importance = "Medium",
                    status = "Not Started",
                    energyRequired = "High",
                    notes = "Take pre-workout, perform 10 minutes of light dynamic warmup.",
                    createdAt = now.toString(),
                    updatedAt = now.toString()
                ),
                Task(
                    id = "demo_task_6",
                    title = "Study machine learning notes",
                    description = "Review gradient descent calculations, backpropagation math models, and loss metric curves.",
                    category = "Study",
                    deadline = now.plusDays(6).toString().substringBefore("."),
                    estimatedMinutes = 120,
                    importance = "Medium",
                    status = "Blocked",
                    energyRequired = "Medium",
                    notes = "Stuck on formula for cross-entropy optimization. Ask colleague or study reference text.",
                    createdAt = now.toString(),
                    updatedAt = now.toString()
                )
            )

            // Inject Habits
            val demoHabits = listOf(
                Habit("h1", "Complete deep focus block", true, now.toLocalDate().toString()),
                Habit("h2", "Drink 3L of water", false, now.toLocalDate().toString()),
                Habit("h3", "Plan tasks for tomorrow", false, now.toLocalDate().toString())
            )

            demoTasks.forEach { repository.insertTask(it) }
            demoHabits.forEach { repository.insertHabit(it) }

            saveFocusGoal("Defend critical 'Internship Report' and build momentum.")
            saveReflection("Woke up with high drive. Need to tackle tasks early to beat the evening slump.")
            setStreak(5)
            
            _prioritizationPlan.value = UIState.Idle
            _rescuePlan.value = UIState.Idle
            _selectedRescueTask.value = null
            _dailyPlan.value = UIState.Idle
            _delayRecoveryPlan.value = UIState.Idle
        }
    }
}
