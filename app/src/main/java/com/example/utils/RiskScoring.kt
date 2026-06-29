package com.example.utils

import com.example.data.Task
import java.time.Duration
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.math.max
import kotlin.math.min

object RiskScoring {

    private val formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    fun calculateRiskScore(task: Task, currentDateTime: LocalDateTime = LocalDateTime.now()): Int {
        if (task.status == "Completed") return 0

        val deadlineTime = try {
            LocalDateTime.parse(task.deadline, formatter)
        } catch (e: Exception) {
            // Try fallback format if it's not standard ISO_LOCAL_DATE_TIME
            try {
                // If contains 'Z' or space, clean it
                val cleaned = task.deadline.replace(" ", "T").substringBefore("+").substringBefore("Z")
                LocalDateTime.parse(cleaned, formatter)
            } catch (e2: Exception) {
                // Fallback to 1 day from now if parsing fails
                currentDateTime.plusDays(1)
            }
        }

        val durationRemaining = Duration.between(currentDateTime, deadlineTime)
        val hoursRemaining = durationRemaining.toMinutes() / 60.0

        var baseScore = when {
            hoursRemaining < 0 -> 100 // Overdue
            hoursRemaining <= 2.0 -> 90
            hoursRemaining <= 24.0 -> 75
            hoursRemaining <= 48.0 -> 60
            hoursRemaining <= 72.0 -> 45
            else -> 20
        }

        // Adjust based on importance
        baseScore += when (task.importance) {
            "Critical" -> 20
            "High" -> 10
            "Medium" -> 0
            "Low" -> -10
            else -> 0
        }

        // Adjust based on estimated duration
        baseScore += when {
            task.estimatedMinutes > 360 -> 20
            task.estimatedMinutes > 120 -> 10
            task.estimatedMinutes > 30 -> 5
            else -> 0
        }

        // Adjust based on status
        baseScore += when (task.status) {
            "Blocked" -> 15
            "Not Started" -> 10
            "In Progress" -> -5
            else -> 0
        }

        // Ensure clamped to 0..100
        val finalScore = max(0, min(100, baseScore))
        return finalScore
    }

    fun getRiskCategory(score: Int): String {
        return when {
            score <= 30 -> "Safe"
            score <= 60 -> "Watch"
            score <= 80 -> "Urgent"
            else -> "Critical"
        }
    }
}
