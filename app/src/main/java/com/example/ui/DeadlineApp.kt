package com.example.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.TextStyle
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.Task
import com.example.data.Habit
import com.example.utils.RiskScoring
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DeadlineApp(viewModel: DeadlineViewModel) {
    var currentTab by remember { mutableStateOf("Dashboard") }
    var showAddTaskDialog by remember { mutableStateOf(false) }

    val tasks by viewModel.tasks.collectAsState()
    val habits by viewModel.habits.collectAsState()
    val streak by viewModel.streakCount.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .background(
                                    Brush.linearGradient(
                                        colors = listOf(
                                            MaterialTheme.colorScheme.primary,
                                            MaterialTheme.colorScheme.secondary
                                        )
                                    ),
                                    CircleShape
                                )
                                .padding(4.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = "Shield",
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Deadline Defender ",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                                Text(
                                    text = "AI",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Medium,
                                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                                    color = MaterialTheme.colorScheme.outline
                                )
                            }
                            Text(
                                text = "RESCUE COMPANION ACTIVE",
                                fontSize = 9.sp,
                                color = MaterialTheme.colorScheme.outline,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.5.sp
                            )
                        }
                    }
                },
                actions = {
                    IconButton(
                        onClick = { viewModel.injectDemoData() },
                        modifier = Modifier.testTag("load_demo_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Load Demo Data",
                            tint = MaterialTheme.colorScheme.secondary
                        )
                    }
                    Text(
                        text = "🔥 $streak",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        color = MaterialTheme.colorScheme.tertiary,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Box(
                        modifier = Modifier
                            .padding(end = 12.dp)
                            .size(32.dp)
                            .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f), CircleShape)
                            .border(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "SP",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = MaterialTheme.colorScheme.onSurface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                val tabs = listOf(
                    Triple("Dashboard", Icons.Default.Home, "dashboard_tab"),
                    Triple("Tasks", Icons.Default.List, "tasks_tab"),
                    Triple("AI Plan", Icons.Default.CheckCircle, "ai_plan_tab"),
                    Triple("Rescue Mode", Icons.Default.Warning, "rescue_mode_tab"),
                    Triple("Coach", Icons.Default.Person, "coach_tab")
                )
                tabs.forEach { (tabName, icon, tag) ->
                    NavigationBarItem(
                        selected = currentTab == tabName,
                        onClick = { currentTab = tabName },
                        icon = { Icon(imageVector = icon, contentDescription = tabName) },
                        label = { Text(tabName, fontSize = 11.sp) },
                        modifier = Modifier.testTag(tag)
                    )
                }
            }
        },
        floatingActionButton = {
            if (currentTab == "Tasks") {
                ExtendedFloatingActionButton(
                    text = { Text("Add Task", color = Color.White) },
                    icon = { Icon(Icons.Default.Add, contentDescription = "Add Task", tint = Color.White) },
                    onClick = { showAddTaskDialog = true },
                    containerColor = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.testTag("add_task_fab")
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            when (currentTab) {
                "Dashboard" -> DashboardScreen(viewModel = viewModel, onNavigateToTab = { currentTab = it })
                "Tasks" -> TasksScreen(viewModel = viewModel)
                "AI Plan" -> AIPlanScreen(viewModel = viewModel)
                "Rescue Mode" -> RescueModeScreen(viewModel = viewModel)
                "Coach" -> CoachScreen(viewModel = viewModel)
            }
        }
    }

    if (showAddTaskDialog) {
        AddTaskDialog(
            onDismiss = { showAddTaskDialog = false },
            onConfirm = { title, desc, cat, deadline, estMin, imp, energy, notes ->
                viewModel.addTask(title, desc, cat, deadline, estMin, imp, energy, notes)
                showAddTaskDialog = false
            }
        )
    }
}

// ==========================================
// 1. DASHBOARD SCREEN
// ==========================================
@Composable
fun DashboardScreen(viewModel: DeadlineViewModel, onNavigateToTab: (String) -> Unit) {
    val tasks by viewModel.tasks.collectAsState()
    val habits by viewModel.habits.collectAsState()
    val focusGoal by viewModel.focusGoal.collectAsState()
    val reflection by viewModel.productivityReflection.collectAsState()
    val streak by viewModel.streakCount.collectAsState()

    val totalTasks = tasks.size
    val completedTasks = tasks.count { it.status == "Completed" }
    val urgentTasks = tasks.count { it.status != "Completed" && RiskScoring.calculateRiskScore(it) >= 60 }
    
    // Calculate overall risk score
    val highestRiskTask = tasks
        .filter { it.status != "Completed" }
        .maxByOrNull { RiskScoring.calculateRiskScore(it) }

    val completionProgress = if (totalTasks > 0) completedTasks.toFloat() / totalTasks else 0.0f
    val productivityScore = (completionProgress * 100).roundToInt()

    var editingGoal by remember { mutableStateOf(false) }
    var goalText by remember { mutableStateOf(focusGoal) }

    var editingReflection by remember { mutableStateOf(false) }
    var reflectionText by remember { mutableStateOf(reflection) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Welcome and tagline
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.linearGradient(
                            colors = listOf(
                                MaterialTheme.colorScheme.primary,
                                MaterialTheme.colorScheme.secondary
                            )
                        ),
                        RoundedCornerShape(16.dp)
                    )
                    .padding(20.dp)
            ) {
                Text(
                    text = "Deadline Defender AI",
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Text(
                    text = "“Stop missing deadlines. Start taking action.”",
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 4.dp)
                )
                
                Button(
                    onClick = { viewModel.injectDemoData() },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.tertiary),
                    modifier = Modifier
                        .padding(top = 16.dp)
                        .testTag("try_demo_button"),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null, tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Load Demo Tasks & Habits", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Stats Cards Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("VITAL METRICS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatsCard(
                        title = "Urgent Targets",
                        value = "$urgentTasks",
                        color = MaterialTheme.colorScheme.error,
                        icon = Icons.Default.Warning,
                        modifier = Modifier.weight(1f)
                    )
                    StatsCard(
                        title = "Completed",
                        value = "$completedTasks/$totalTasks",
                        color = MaterialTheme.colorScheme.secondary,
                        icon = Icons.Default.CheckCircle,
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatsCard(
                        title = "Productivity",
                        value = "$productivityScore%",
                        color = MaterialTheme.colorScheme.primary,
                        icon = Icons.Default.Star,
                        modifier = Modifier.weight(1f)
                    )
                    StatsCard(
                        title = "Streak State",
                        value = "$streak Days",
                        color = MaterialTheme.colorScheme.tertiary,
                        icon = Icons.Default.Favorite,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // NEXT BEST ACTION / RECOMMENDATION CARD
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.Transparent),
                shape = RoundedCornerShape(24.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                colors = listOf(
                                    MaterialTheme.colorScheme.primary,
                                    MaterialTheme.colorScheme.primary.copy(alpha = 0.85f)
                                )
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .background(Color(0xFF10B981), CircleShape) // Emerald dot
                            )
                            Text(
                                text = "AI NEXT BEST ACTION",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White.copy(alpha = 0.85f),
                                letterSpacing = 1.sp
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))

                        if (highestRiskTask != null) {
                            val score = RiskScoring.calculateRiskScore(highestRiskTask)
                            Text(
                                text = "Tackle: \"${highestRiskTask.title}\"",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                            Text(
                                text = "Deadline Risk Score: $score/100 • This critical task consumes high cognitive load and is due soon. Stop contemplating and activate Rescue Mode immediately.",
                                fontSize = 13.sp,
                                color = Color.White.copy(alpha = 0.9f),
                                modifier = Modifier.padding(top = 6.dp),
                                lineHeight = 18.sp
                            )
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Button(
                                    onClick = { 
                                        viewModel.runRescuePlan(highestRiskTask)
                                        onNavigateToTab("Rescue Mode")
                                    },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color.White,
                                        contentColor = MaterialTheme.colorScheme.primary
                                    ),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(Icons.Default.PlayArrow, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Rescue Now", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                }
                                Button(
                                    onClick = { onNavigateToTab("Tasks") },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color.White.copy(alpha = 0.2f),
                                        contentColor = Color.White
                                    ),
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("View Details", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                }
                            }
                        } else {
                            Text(
                                text = "All clear! No pending risk targets.",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Add some tasks under 'Tasks' or load demo files to activate the Deadline Defender scoring engine.",
                                fontSize = 13.sp,
                                color = Color.White.copy(alpha = 0.8f),
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }
            }
        }

        // TODAY'S FOCUS GOAL
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "🌅 TODAY'S FOCUS GOAL",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.secondary
                        )
                        IconButton(onClick = { editingGoal = !editingGoal }) {
                            Icon(
                                imageVector = if (editingGoal) Icons.Default.Check else Icons.Default.Edit,
                                contentDescription = "Edit Goal",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                    if (editingGoal) {
                        OutlinedTextField(
                            value = goalText,
                            onValueChange = { goalText = it },
                            modifier = Modifier.fillMaxWidth(),
                            textStyle = TextStyle(fontSize = 14.sp)
                        )
                        Button(
                            onClick = {
                                viewModel.saveFocusGoal(goalText)
                                editingGoal = false
                            },
                            modifier = Modifier.padding(top = 8.dp)
                        ) {
                            Text("Save")
                        }
                    } else {
                        Text(
                            text = focusGoal.ifBlank { "Double-tap edit to set a visual benchmark for today's efforts..." },
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // HABITS SECTION
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "⚡ QUICK CONCURRENT HABITS",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.tertiary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    var newHabitTitle by remember { mutableStateOf("") }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = newHabitTitle,
                            onValueChange = { newHabitTitle = it },
                            placeholder = { Text("Water, stand, pushups...", fontSize = 13.sp) },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            textStyle = TextStyle(fontSize = 13.sp)
                        )
                        IconButton(
                            onClick = {
                                if (newHabitTitle.isNotBlank()) {
                                    viewModel.addHabit(newHabitTitle)
                                    newHabitTitle = ""
                                }
                            }
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Add Habit", tint = MaterialTheme.colorScheme.primary)
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (habits.isEmpty()) {
                        Text("No active habits registered.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    } else {
                        habits.forEach { habit ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Checkbox(
                                        checked = habit.isCompleted,
                                        onCheckedChange = { viewModel.toggleHabitCompletion(habit) }
                                    )
                                    Text(
                                        text = habit.title,
                                        fontSize = 14.sp,
                                        color = if (habit.isCompleted) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                                IconButton(onClick = { viewModel.deleteHabit(habit.id) }) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete Habit", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }
        }

        // DAILY REFLECTION
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                shape = RoundedCornerShape(12.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "🧠 PRODUCTIVITY REFLECTION",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        IconButton(onClick = { editingReflection = !editingReflection }) {
                            Icon(
                                imageVector = if (editingReflection) Icons.Default.Check else Icons.Default.Edit,
                                contentDescription = "Edit Reflection",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                    if (editingReflection) {
                        OutlinedTextField(
                            value = reflectionText,
                            onValueChange = { reflectionText = it },
                            modifier = Modifier.fillMaxWidth(),
                            textStyle = TextStyle(fontSize = 14.sp),
                            placeholder = { Text("How was focus today? Any blocks?", fontSize = 13.sp) }
                        )
                        Button(
                            onClick = {
                                viewModel.saveReflection(reflectionText)
                                editingReflection = false
                            },
                            modifier = Modifier.padding(top = 8.dp)
                        ) {
                            Text("Save")
                        }
                    } else {
                        Text(
                            text = reflection.ifBlank { "Write a brief reflection note on what triggered distraction or helped deep focus today..." },
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatsCard(title: String, value: String, color: Color, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(12.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(color.copy(alpha = 0.15f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(imageVector = icon, contentDescription = null, tint = color)
            }
            Column {
                Text(text = title, fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, fontWeight = FontWeight.Bold)
                Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.onSurface)
            }
        }
    }
}

// ==========================================
// 2. TASKS LIST SCREEN
// ==========================================
@Composable
fun TasksScreen(viewModel: DeadlineViewModel) {
    val tasks by viewModel.tasks.collectAsState()
    var selectedCategoryFilter by remember { mutableStateOf("All") }
    var selectedImportanceFilter by remember { mutableStateOf("All") }
    
    var showLateRecoveryDialogForTask by remember { mutableStateOf<Task?>(null) }
    var showEditDialogForTask by remember { mutableStateOf<Task?>(null) }

    val categories = listOf("All", "Study", "Work", "Personal", "Finance", "Health", "Business", "Other")
    val importances = listOf("All", "Low", "Medium", "High", "Critical")

    val filteredTasks = tasks.filter { task ->
        (selectedCategoryFilter == "All" || task.category == selectedCategoryFilter) &&
        (selectedImportanceFilter == "All" || task.importance == selectedImportanceFilter)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "YOUR ACTIVE TARGETS",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onBackground
            )
        }

        // Filter Rows
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                // Category Filter
                Text("Category filter:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                ScrollableRow {
                    categories.forEach { cat ->
                        FilterChip(
                            selected = selectedCategoryFilter == cat,
                            onClick = { selectedCategoryFilter = cat },
                            label = { Text(cat, fontSize = 11.sp) },
                            modifier = Modifier.padding(end = 4.dp)
                        )
                    }
                }

                // Importance Filter
                Text("Importance filter:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                ScrollableRow {
                    importances.forEach { imp ->
                        FilterChip(
                            selected = selectedImportanceFilter == imp,
                            onClick = { selectedImportanceFilter = imp },
                            label = { Text(imp, fontSize = 11.sp) },
                            modifier = Modifier.padding(end = 4.dp)
                        )
                    }
                }
            }
        }

        if (filteredTasks.isEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(40.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.List,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        "No tasks matching your current filter.",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            items(filteredTasks, key = { it.id }) { task ->
                TaskCard(
                    task = task,
                    onToggleComplete = { viewModel.toggleTaskCompletion(task) },
                    onDelete = { viewModel.deleteTask(task.id) },
                    onStartRescue = { 
                        viewModel.runRescuePlan(task)
                        // Note: If you want user to go automatically, let them select tab manually
                    },
                    onRunningLate = { showLateRecoveryDialogForTask = task },
                    onEdit = { showEditDialogForTask = task }
                )
            }
        }
    }

    if (showLateRecoveryDialogForTask != null) {
        LateRecoveryDialog(
            task = showLateRecoveryDialogForTask!!,
            onDismiss = { showLateRecoveryDialogForTask = null },
            onConfirm = { mins, prog, mandatory ->
                viewModel.runDelayRecovery(showLateRecoveryDialogForTask!!, mins, prog, mandatory)
                showLateRecoveryDialogForTask = null
                // Note: The AI plan screen shows results of delay recovery plan, so we can tell user to view Priority screen!
            }
        )
    }

    if (showEditDialogForTask != null) {
        EditTaskDialog(
            task = showEditDialogForTask!!,
            onDismiss = { showEditDialogForTask = null },
            onConfirm = { updated ->
                viewModel.updateTask(updated)
                showEditDialogForTask = null
            }
        )
    }
}

@Composable
fun ScrollableRow(content: @Composable () -> Unit) {
    androidx.compose.foundation.lazy.LazyRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        item { content() }
    }
}

@Composable
fun TaskCard(
    task: Task,
    onToggleComplete: () -> Unit,
    onDelete: () -> Unit,
    onStartRescue: () -> Unit,
    onRunningLate: () -> Unit,
    onEdit: () -> Unit
) {
    val risk = RiskScoring.calculateRiskScore(task)
    val riskCat = RiskScoring.getRiskCategory(risk)

    val riskColor = when (riskCat) {
        "Critical" -> MaterialTheme.colorScheme.error
        "Urgent" -> MaterialTheme.colorScheme.tertiary
        "Watch" -> MaterialTheme.colorScheme.primary
        else -> MaterialTheme.colorScheme.secondary
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("task_item_card"),
        colors = CardDefaults.cardColors(
            containerColor = if (task.status == "Completed") 
                MaterialTheme.colorScheme.surface.copy(alpha = 0.6f) 
            else MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min)
        ) {
            // Thick Left Border Indicator
            Box(
                modifier = Modifier
                    .width(5.dp)
                    .fillMaxHeight()
                    .background(riskColor)
            )

            Column(modifier = Modifier.weight(1f).padding(16.dp)) {
                // Header Row: Category, Badges, and Circular Risk Indicator
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = task.category.uppercase(),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        
                        Spacer(modifier = Modifier.height(4.dp))
                        
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            // Importance Badge
                            Surface(
                                color = when (task.importance) {
                                    "Critical" -> MaterialTheme.colorScheme.errorContainer
                                    "High" -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.5f)
                                    "Medium" -> MaterialTheme.colorScheme.secondaryContainer
                                    else -> MaterialTheme.colorScheme.surfaceVariant
                                },
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = task.importance,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }

                            // Risk Badge
                            Surface(
                                color = riskColor.copy(alpha = 0.15f),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = riskCat,
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = riskColor,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    // Circular Progress Indicator for Risk %
                    Box(
                        modifier = Modifier.size(44.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            progress = 1f,
                            color = riskColor.copy(alpha = 0.15f),
                            strokeWidth = 3.dp,
                            modifier = Modifier.fillMaxSize()
                        )
                        CircularProgressIndicator(
                            progress = risk.toFloat() / 100f,
                            color = riskColor,
                            strokeWidth = 3.dp,
                            modifier = Modifier.fillMaxSize()
                        )
                        Text(
                            text = "$risk%",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = riskColor
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Title and description
                Text(
                    text = task.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (task.status == "Completed") MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface,
                    style = LocalTextStyle.current.copy(
                        textDecoration = if (task.status == "Completed") androidx.compose.ui.text.style.TextDecoration.LineThrough else null
                    )
                )

                if (task.description.isNotBlank()) {
                    Text(
                        text = task.description,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Deadline and Estimated Duration info
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.DateRange, contentDescription = "Deadline", modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.primary)
                        Spacer(modifier = Modifier.width(4.dp))
                        val prettyDate = task.deadline.replace("T", " ").substringBeforeLast(":")
                        Text(text = "Due: $prettyDate", fontSize = 11.sp, fontWeight = FontWeight.Medium)
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, contentDescription = "Duration", modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.secondary)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "${task.estimatedMinutes} mins", fontSize = 11.sp, fontWeight = FontWeight.Medium)
                    }
                    
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Info, contentDescription = "Status", modifier = Modifier.size(14.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = task.status, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                if (!task.notes.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = "📝 Notes: ${task.notes}",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(8.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Action Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        // Checkbox or complete icon button
                        IconButton(
                            onClick = onToggleComplete,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(
                                imageVector = if (task.status == "Completed") Icons.Default.CheckCircle else Icons.Default.AddCircle,
                                contentDescription = "Toggle Complete",
                                tint = if (task.status == "Completed") MaterialTheme.colorScheme.secondary else MaterialTheme.colorScheme.outline,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        // Edit
                        IconButton(onClick = onEdit, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Default.Edit, contentDescription = "Edit Task", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                        }

                        // Delete
                        IconButton(onClick = onDelete, modifier = Modifier.size(36.dp)) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete Task", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(20.dp))
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        if (task.status != "Completed") {
                            // Running Late
                            OutlinedButton(
                                onClick = onRunningLate,
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Text("Late...", fontSize = 11.sp)
                            }

                            // Rescue Mode trigger
                            Button(
                                onClick = onStartRescue,
                                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                                modifier = Modifier.height(32.dp)
                            ) {
                                Icon(Icons.Default.Warning, contentDescription = null, tint = Color.White, modifier = Modifier.size(12.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Rescue", fontSize = 11.sp, color = Color.White)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// 3. AI PLAN (PRIORITIZATION & DAILY PLAN)
// ==========================================
@Composable
fun AIPlanScreen(viewModel: DeadlineViewModel) {
    val prioritizationPlan by viewModel.prioritizationPlan.collectAsState()
    val dailyPlan by viewModel.dailyPlan.collectAsState()
    val delayRecoveryPlan by viewModel.delayRecoveryPlan.collectAsState()
    val tasks by viewModel.tasks.collectAsState()

    val pendingTasks = tasks.filter { it.status != "Completed" }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "AI TASK PRIORITIZER & PLANNER",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onBackground
            )
            Text(
                text = "Generate structured focus maps based on deadline risk, importance, and effort.",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Delay Recovery Box if exists
        if (delayRecoveryPlan !is UIState.Idle) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.error)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("⏱️ DELAY RECOVERY STRATEGY", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.error)
                            IconButton(onClick = { viewModel.clearDelayRecoveryPlan() }) {
                                Icon(Icons.Default.Close, contentDescription = "Clear Plan", tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        when (val state = delayRecoveryPlan) {
                            is UIState.Loading -> CircularProgressIndicator(modifier = Modifier.size(24.dp))
                            is UIState.Success -> {
                                MarkdownText(text = state.data)
                            }
                            is UIState.Error -> {
                                Text("Error generating: ${state.message}", color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                            }
                            else -> {}
                        }
                    }
                }
            }
        }

        // Generate Buttons Block
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = { viewModel.runAIPrioritization() },
                    modifier = Modifier.weight(1f).testTag("generate_prioritization_button")
                ) {
                    Icon(Icons.Default.Check, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("AI Priorities", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = { viewModel.runDailyPlan() },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                    modifier = Modifier.weight(1f).testTag("generate_daily_planner_button")
                ) {
                    Icon(Icons.Default.DateRange, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Daily Schedule", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // PRIORITIZATION SECTION
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "📋 AI TASK PRIORITIZATION MATRIX",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    when (val state = prioritizationPlan) {
                        is UIState.Idle -> {
                            Text(
                                text = "Click 'AI Priorities' to let Gemini map, analyze, and rank your active backlog of tasks.",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        is UIState.Loading -> {
                            Column(
                                modifier = Modifier.fillMaxWidth().padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                CircularProgressIndicator()
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Analyzing priority profiles with Gemini...", fontSize = 13.sp)
                            }
                        }
                        is UIState.Success -> {
                            MarkdownText(
                                text = state.data,
                                modifier = Modifier.testTag("ai_priority_output")
                            )
                        }
                        is UIState.Error -> {
                            Text(
                                text = "Gemini API unavailable. Falling back to local scoring.\n\n" + 
                                       "Detailed priority matrix below:\n" +
                                       viewModel.tasks.value.joinToString("\n") { "- ${it.title}: Risk ${RiskScoring.calculateRiskScore(it)}/100" },
                                color = MaterialTheme.colorScheme.error,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }

        // DAILY SCHEDULE SECTION
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "⏱️ OPTIMIZED DAILY TIMELINE",
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.secondary,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    when (val state = dailyPlan) {
                        is UIState.Idle -> {
                            Text(
                                text = "Click 'Daily Schedule' to compile your outstanding tasks into a sensible timeline layout.",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        is UIState.Loading -> {
                            Column(
                                modifier = Modifier.fillMaxWidth().padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                CircularProgressIndicator()
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("Assembling daily blocks...", fontSize = 13.sp)
                            }
                        }
                        is UIState.Success -> {
                            MarkdownText(
                                text = state.data,
                                modifier = Modifier.testTag("ai_daily_planner_output")
                            )
                        }
                        is UIState.Error -> {
                            Text(
                                text = "Unable to reach planning core. Create structure manually or retry.",
                                color = MaterialTheme.colorScheme.error,
                                fontSize = 13.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

// ==========================================
// 4. RESCUE MODE SCREEN
// ==========================================
@Composable
fun RescueModeScreen(viewModel: DeadlineViewModel) {
    val tasks by viewModel.tasks.collectAsState()
    val selectedTask by viewModel.selectedRescueTask.collectAsState()
    val rescuePlan by viewModel.rescuePlan.collectAsState()
    
    val secondsRemaining by viewModel.timerSecondsRemaining.collectAsState()
    val isTimerRunning by viewModel.isTimerRunning.collectAsState()

    val uncompletedTasks = tasks.filter { it.status != "Completed" }

    val formattedTime = String.format("%02d:%02d", secondsRemaining / 60, secondsRemaining % 60)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "🚨 RESCUE MISSION DEPLOYED",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.error
            )
            Text(
                text = "Stop panic, start progress. Build an emergency MVC blueprint and focus.",
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Selection Dropdown or layout
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("SELECT TASK TO RESCUE:", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                    Spacer(modifier = Modifier.height(8.dp))

                    if (uncompletedTasks.isEmpty()) {
                        Text("No active tasks to rescue. Add some first!", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    } else {
                        // Horizontal scrollable or direct Column with small cards
                        uncompletedTasks.forEach { task ->
                            val isSelected = selectedTask?.id == task.id
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable { viewModel.selectRescueTaskDirectly(task) }
                                    .background(
                                        if (isSelected) MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.4f) 
                                        else Color.Transparent,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .padding(8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = task.title,
                                    fontSize = 13.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                                    modifier = Modifier.weight(1f),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                if (isSelected) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = "Selected", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }
        }

        if (selectedTask != null) {
            // Task context
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Target: ${selectedTask!!.title}", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text(text = selectedTask!!.description, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        
                        Button(
                            onClick = { viewModel.runRescuePlan(selectedTask!!) },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                            modifier = Modifier.padding(top = 12.dp).testTag("generate_rescue_mode_button")
                        ) {
                            Text("Generate Emergency Plan")
                        }
                    }
                }
            }

            // Interactive countdown focus timer
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("🛡️ FOCUS SPRINT TIMER (POMODORO)", fontWeight = FontWeight.Bold, fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
                        
                        Spacer(modifier = Modifier.height(16.dp))

                        // Large beautiful clock
                        Text(
                            text = formattedTime,
                            fontSize = 48.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (isTimerRunning) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.testTag("rescue_timer")
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            Button(
                                onClick = { viewModel.toggleTimer() },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isTimerRunning) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.secondary
                                ),
                                modifier = Modifier.testTag("rescue_timer_start")
                            ) {
                                Icon(
                                    imageVector = if (isTimerRunning) Icons.Default.Close else Icons.Default.PlayArrow,
                                    contentDescription = null
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(if (isTimerRunning) "Pause Sprint" else "Start Sprint")
                            }

                            OutlinedButton(
                                onClick = { viewModel.resetTimer(25) },
                                modifier = Modifier.testTag("rescue_timer_reset")
                            ) {
                                Icon(Icons.Default.Refresh, contentDescription = null)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Reset")
                            }
                        }
                    }
                }
            }

            // AI Generated Emergency Rescue plan details
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "📖 EMERGENCY STRATEGY BLUEPRINT",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.error,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))

                        when (val state = rescuePlan) {
                            is UIState.Idle -> {
                                Text("Click 'Generate Emergency Plan' to formulate scope cuts and blocks.", fontSize = 13.sp)
                            }
                            is UIState.Loading -> {
                                Column(
                                    modifier = Modifier.fillMaxWidth().padding(24.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    CircularProgressIndicator()
                                    Spacer(modifier = Modifier.height(12.dp))
                                    Text("Drafting rescue directives...", fontSize = 13.sp)
                                }
                            }
                            is UIState.Success -> {
                                MarkdownText(
                                    text = state.data,
                                    modifier = Modifier.testTag("rescue_mode_output")
                                )
                            }
                            is UIState.Error -> {
                                Text(
                                    text = "Fallback mode active. Focus on core deliverables. Leave style formatting for later.",
                                    color = MaterialTheme.colorScheme.error,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }
                }
            }
        } else {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Text(
                        text = "To deploy Rescue Mode, first select an active target from the list above.",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
    }
}

// ==========================================
// 5. PRODUCTIVITY COACH CHAT SCREEN
// ==========================================
@Composable
fun CoachScreen(viewModel: DeadlineViewModel) {
    val chatHistory by viewModel.chatHistory.collectAsState()
    val chatLoading by viewModel.chatLoading.collectAsState()
    var userMessageText by remember { mutableStateOf("") }
    
    val listState = rememberLazyListState()

    // Scroll to bottom on updates
    LaunchedEffect(chatHistory.size) {
        if (chatHistory.isNotEmpty()) {
            listState.animateScrollToItem(chatHistory.size - 1)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Coach Profile Info Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            shape = RoundedCornerShape(12.dp)
        ) {
            Row(
                modifier = Modifier.padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(MaterialTheme.colorScheme.secondary.copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.secondary)
                }
                Column {
                    Text("AI Productivity Coach", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text("Direct, action-focused stress mitigation.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Chat Bubble list
        LazyColumn(
            state = listState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(chatHistory) { msg ->
                val isUser = msg.sender == "user"
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = if (isUser) Alignment.CenterEnd else Alignment.CenterStart
                ) {
                    Column(
                        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                    ) {
                        Surface(
                            color = if (isUser) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(
                                topStart = 12.dp,
                                topEnd = 12.dp,
                                bottomStart = if (isUser) 12.dp else 0.dp,
                                bottomEnd = if (isUser) 0.dp else 12.dp
                            ),
                            modifier = Modifier.widthIn(max = 280.dp)
                        ) {
                            Text(
                                text = parseBoldText(msg.text, textColor = if (isUser) Color.White else MaterialTheme.colorScheme.onSurface),
                                modifier = Modifier.padding(12.dp),
                                fontSize = 13.sp,
                                color = if (isUser) Color.White else MaterialTheme.colorScheme.onSurface
                            )
                        }
                        Text(
                            text = msg.timestamp,
                            fontSize = 9.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 2.dp, start = 4.dp, end = 4.dp)
                        )
                    }
                }
            }

            if (chatLoading) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Coach is drafting...", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Pre-populated Quick Prompt Suggestions Row
        val suggestions = listOf(
            "What should I do first?",
            "I'm stressed, help me plan.",
            "I missed my deadline, what now?"
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp)
                .background(Color.Transparent),
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            suggestions.forEach { item ->
                SuggestionChip(
                    onClick = { viewModel.sendCoachMessage(item) },
                    label = { Text(item, fontSize = 11.sp) }
                )
            }
        }

        // Input Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = userMessageText,
                onValueChange = { userMessageText = it },
                placeholder = { Text("Ask about focus strategies, scheduling, or stress...", fontSize = 13.sp) },
                modifier = Modifier.weight(1f).testTag("coach_input"),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                keyboardActions = KeyboardActions(onSend = {
                    if (userMessageText.isNotBlank()) {
                        viewModel.sendCoachMessage(userMessageText)
                        userMessageText = ""
                    }
                }),
                textStyle = TextStyle(fontSize = 13.sp)
            )

            Button(
                onClick = {
                    if (userMessageText.isNotBlank()) {
                        viewModel.sendCoachMessage(userMessageText)
                        userMessageText = ""
                    }
                },
                modifier = Modifier.testTag("coach_send_button")
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send")
            }
        }
    }
}

// ==========================================
// 6. DIALOG FORMS
// ==========================================

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddTaskDialog(onDismiss: () -> Unit, onConfirm: (String, String, String, String, Int, String, String, String?) -> Unit) {
    var title by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Study") }
    var deadlineDate by remember { mutableStateOf(LocalDateTime.now().toLocalDate().toString()) }
    var deadlineTime by remember { mutableStateOf("17:00") }
    var estDuration by remember { mutableStateOf("60") }
    var importance by remember { mutableStateOf("Medium") }
    var energyRequired by remember { mutableStateOf("Medium") }
    var notes by remember { mutableStateOf("") }

    val categories = listOf("Study", "Work", "Personal", "Finance", "Health", "Business", "Other")
    val importances = listOf("Low", "Medium", "High", "Critical")
    val energies = listOf("Low", "Medium", "High")

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth().heightIn(max = 580.dp)
        ) {
            LazyColumn(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Text("ADD NEW DEFENDER TARGET", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }

                item {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Task Title") },
                        modifier = Modifier.fillMaxWidth().testTag("add_task_title_input"),
                        singleLine = true
                    )
                }

                item {
                    OutlinedTextField(
                        value = desc,
                        onValueChange = { desc = it },
                        label = { Text("Short Description") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }

                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = deadlineDate,
                            onValueChange = { deadlineDate = it },
                            label = { Text("Date (YYYY-MM-DD)") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = deadlineTime,
                            onValueChange = { deadlineTime = it },
                            label = { Text("Time (HH:MM)") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                item {
                    OutlinedTextField(
                        value = estDuration,
                        onValueChange = { estDuration = it },
                        label = { Text("Duration (minutes)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    Column {
                        Text("Category:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        ScrollableRow {
                            categories.forEach { cat ->
                                FilterChip(
                                    selected = category == cat,
                                    onClick = { category = cat },
                                    label = { Text(cat, fontSize = 11.sp) },
                                    modifier = Modifier.padding(end = 4.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    Column {
                        Text("Importance:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        ScrollableRow {
                            importances.forEach { imp ->
                                FilterChip(
                                    selected = importance == imp,
                                    onClick = { importance = imp },
                                    label = { Text(imp, fontSize = 11.sp) },
                                    modifier = Modifier.padding(end = 4.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    Column {
                        Text("Energy Required:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        ScrollableRow {
                            energies.forEach { en ->
                                FilterChip(
                                    selected = energyRequired == en,
                                    onClick = { energyRequired = en },
                                    label = { Text(en, fontSize = 11.sp) },
                                    modifier = Modifier.padding(end = 4.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Optional Action Notes") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = onDismiss) { Text("Cancel") }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                if (title.isNotBlank()) {
                                    val fullDeadline = "${deadlineDate}T${deadlineTime}:00"
                                    val duration = estDuration.toIntOrNull() ?: 60
                                    onConfirm(title, desc, category, fullDeadline, duration, importance, energyRequired, notes.ifBlank { null })
                                }
                            },
                            modifier = Modifier.testTag("add_task_dialog_confirm")
                        ) {
                            Text("Confirm")
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditTaskDialog(task: Task, onDismiss: () -> Unit, onConfirm: (Task) -> Unit) {
    var title by remember { mutableStateOf(task.title) }
    var desc by remember { mutableStateOf(task.description) }
    var category by remember { mutableStateOf(task.category) }
    var deadlineDate by remember { mutableStateOf(task.deadline.substringBefore("T")) }
    var deadlineTime by remember { mutableStateOf(task.deadline.substringAfter("T").substringBeforeLast(":")) }
    var estDuration by remember { mutableStateOf(task.estimatedMinutes.toString()) }
    var importance by remember { mutableStateOf(task.importance) }
    var energyRequired by remember { mutableStateOf(task.energyRequired) }
    var status by remember { mutableStateOf(task.status) }
    var notes by remember { mutableStateOf(task.notes ?: "") }

    val categories = listOf("Study", "Work", "Personal", "Finance", "Health", "Business", "Other")
    val importances = listOf("Low", "Medium", "High", "Critical")
    val energies = listOf("Low", "Medium", "High")
    val statuses = listOf("Not Started", "In Progress", "Blocked", "Completed")

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth().heightIn(max = 580.dp)
        ) {
            LazyColumn(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Text("EDIT DEFENDER TARGET", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }

                item {
                    OutlinedTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Task Title") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }

                item {
                    OutlinedTextField(
                        value = desc,
                        onValueChange = { desc = it },
                        label = { Text("Short Description") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }

                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = deadlineDate,
                            onValueChange = { deadlineDate = it },
                            label = { Text("Date (YYYY-MM-DD)") },
                            modifier = Modifier.weight(1f)
                        )
                        OutlinedTextField(
                            value = deadlineTime,
                            onValueChange = { deadlineTime = it },
                            label = { Text("Time (HH:MM)") },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                item {
                    OutlinedTextField(
                        value = estDuration,
                        onValueChange = { estDuration = it },
                        label = { Text("Duration (minutes)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    Column {
                        Text("Status:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        ScrollableRow {
                            statuses.forEach { st ->
                                FilterChip(
                                    selected = status == st,
                                    onClick = { status = st },
                                    label = { Text(st, fontSize = 11.sp) },
                                    modifier = Modifier.padding(end = 4.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    Column {
                        Text("Category:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        ScrollableRow {
                            categories.forEach { cat ->
                                FilterChip(
                                    selected = category == cat,
                                    onClick = { category = cat },
                                    label = { Text(cat, fontSize = 11.sp) },
                                    modifier = Modifier.padding(end = 4.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    Column {
                        Text("Importance:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        ScrollableRow {
                            importances.forEach { imp ->
                                FilterChip(
                                    selected = importance == imp,
                                    onClick = { importance = imp },
                                    label = { Text(imp, fontSize = 11.sp) },
                                    modifier = Modifier.padding(end = 4.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    Column {
                        Text("Energy Required:", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        ScrollableRow {
                            energies.forEach { en ->
                                FilterChip(
                                    selected = energyRequired == en,
                                    onClick = { energyRequired = en },
                                    label = { Text(en, fontSize = 11.sp) },
                                    modifier = Modifier.padding(end = 4.dp)
                                )
                            }
                        }
                    }
                }

                item {
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Action Notes") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(onClick = onDismiss) { Text("Cancel") }
                        Spacer(modifier = Modifier.width(8.dp))
                        Button(
                            onClick = {
                                if (title.isNotBlank()) {
                                    val fullDeadline = "${deadlineDate}T${deadlineTime}:00"
                                    val duration = estDuration.toIntOrNull() ?: 60
                                    val updated = task.copy(
                                        title = title,
                                        description = desc,
                                        category = category,
                                        deadline = fullDeadline,
                                        estimatedMinutes = duration,
                                        importance = importance,
                                        energyRequired = energyRequired,
                                        status = status,
                                        notes = notes.ifBlank { null }
                                    )
                                    onConfirm(updated)
                                }
                            }
                        ) {
                            Text("Save")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LateRecoveryDialog(task: Task, onDismiss: () -> Unit, onConfirm: (Int, Int, Boolean) -> Unit) {
    var minutesLeft by remember { mutableStateOf(task.estimatedMinutes.toString()) }
    var progressSlider by remember { mutableStateOf(20f) }
    var isMandatory by remember { mutableStateOf(true) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text("“I'M RUNNING LATE” RECOVERY PLANNER", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.error)
                
                Text(text = "Trigger recovery engine for: \"${task.title}\"", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

                OutlinedTextField(
                    value = minutesLeft,
                    onValueChange = { minutesLeft = it },
                    label = { Text("How much time is actually left? (minutes)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )

                Column {
                    Text(text = "Current Completed Progress: ${progressSlider.roundToInt()}%", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Slider(
                        value = progressSlider,
                        onValueChange = { progressSlider = it },
                        valueRange = 0f..100f,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Is this deadline mandatory?", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Switch(
                        checked = isMandatory,
                        onCheckedChange = { isMandatory = it }
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) { Text("Cancel") }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val mins = minutesLeft.toIntOrNull() ?: 30
                            onConfirm(mins, progressSlider.roundToInt(), isMandatory)
                        }
                    ) {
                        Text("Get Recovery Plan")
                    }
                }
            }
        }
    }
}

@Composable
fun MarkdownText(text: String, modifier: Modifier = Modifier) {
    val lines = text.split("\n")
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        lines.forEach { line ->
            val trimmed = line.trim()
            if (trimmed.startsWith("###")) {
                Text(
                    text = trimmed.removePrefix("###").trim(),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(start = 0.dp, top = 8.dp, end = 0.dp, bottom = 2.dp)
                )
            } else if (trimmed.startsWith("##")) {
                Text(
                    text = trimmed.removePrefix("##").trim(),
                    fontSize = 17.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(start = 0.dp, top = 10.dp, end = 0.dp, bottom = 4.dp)
                )
            } else if (trimmed.startsWith("#")) {
                Text(
                    text = trimmed.removePrefix("#").trim(),
                    fontSize = 19.sp,
                    fontWeight = FontWeight.Black,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(start = 0.dp, top = 12.dp, end = 0.dp, bottom = 6.dp)
                )
            } else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                val content = if (trimmed.startsWith("-")) trimmed.removePrefix("-").trim() else trimmed.removePrefix("*").trim()
                Row(
                    modifier = Modifier.fillMaxWidth().padding(start = 8.dp, top = 2.dp, end = 0.dp, bottom = 2.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Box(
                        modifier = Modifier
                            .padding(start = 0.dp, top = 6.dp, end = 8.dp, bottom = 0.dp)
                            .size(6.dp)
                            .background(MaterialTheme.colorScheme.primary, CircleShape)
                    )
                    Text(
                        text = parseBoldText(content),
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurface,
                        lineHeight = 18.sp
                    )
                }
            } else if (trimmed.isNotBlank()) {
                Text(
                    text = parseBoldText(trimmed),
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface,
                    lineHeight = 18.sp
                )
            } else {
                Spacer(modifier = Modifier.height(4.dp))
            }
        }
    }
}

@Composable
fun parseBoldText(input: String, textColor: Color = MaterialTheme.colorScheme.onSurface): androidx.compose.ui.text.AnnotatedString {
    val builder = androidx.compose.ui.text.AnnotatedString.Builder()
    val parts = input.split("**")
    parts.forEachIndexed { index, part ->
        if (index % 2 == 1) {
            builder.pushStyle(androidx.compose.ui.text.SpanStyle(fontWeight = FontWeight.Bold, color = textColor))
            builder.append(part)
            builder.pop()
        } else {
            builder.append(part)
        }
    }
    return builder.toAnnotatedString()
}

// Custom typography class references to compile cleanly with standard Type.kt
private val TextStyle = androidx.compose.ui.text.TextStyle
