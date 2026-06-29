package com.example.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tasks")
data class Task(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val category: String, // "Study" | "Work" | "Personal" | "Finance" | "Health" | "Business" | "Other"
    val deadline: String, // ISO 8601 string, e.g. "2026-06-23T15:00:00"
    val estimatedMinutes: Int,
    val importance: String, // "Low" | "Medium" | "High" | "Critical"
    val status: String, // "Not Started" | "In Progress" | "Blocked" | "Completed"
    val energyRequired: String, // "Low" | "Medium" | "High"
    val notes: String? = null,
    val createdAt: String,
    val updatedAt: String
)

@Entity(tableName = "habits")
data class Habit(
    @PrimaryKey val id: String,
    val title: String,
    val isCompleted: Boolean,
    val date: String // e.g. "2026-06-23"
)

@Entity(tableName = "settings")
data class Setting(
    @PrimaryKey val key: String,
    val value: String
)
