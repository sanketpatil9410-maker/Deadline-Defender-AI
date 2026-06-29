package com.example.data

import kotlinx.coroutines.flow.Flow

class TaskRepository(private val taskDao: TaskDao) {
    val allTasks: Flow<List<Task>> = taskDao.getAllTasks()
    val allHabits: Flow<List<Habit>> = taskDao.getAllHabits()

    suspend fun insertTask(task: Task) = taskDao.insertTask(task)
    suspend fun deleteTask(id: String) = taskDao.deleteTaskById(id)

    suspend fun insertHabit(habit: Habit) = taskDao.insertHabit(habit)
    suspend fun deleteHabit(id: String) = taskDao.deleteHabitById(id)

    suspend fun getSetting(key: String): String? {
        return taskDao.getSettingByKey(key)?.value
    }

    suspend fun saveSetting(key: String, value: String) {
        taskDao.insertSetting(Setting(key, value))
    }
}
