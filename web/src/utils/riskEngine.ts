import { Task } from '../types/task';

export function calculateRiskDetails(task: Task, allTasks: Task[] = []): {
  riskScore: number;
  urgencyLevel: 'Safe' | 'Watch' | 'Urgent' | 'Critical' | 'Overdue';
  riskReason: string;
  timeRemainingText: string;
  recommendedAction: string;
  rescueRequired: boolean;
} {
  if (task.status === 'Completed') {
    return {
      riskScore: 0,
      urgencyLevel: 'Safe',
      riskReason: 'Task is completed successfully.',
      timeRemainingText: 'Completed',
      recommendedAction: 'No action required.',
      rescueRequired: false,
    };
  }

  const now = new Date();
  const due = new Date(task.deadline);
  const diffMs = due.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffMins = diffMs / (1000 * 60);

  let score = 30; // base score
  let reasons: string[] = ['Base risk factor (30).'];

  // 1. Overdue Check
  const isOverdue = diffHours < 0;

  // 2. Importance Multipliers
  if (task.importance === 'Critical') {
    score += 30;
    reasons.push('Critical importance (+30).');
  } else if (task.importance === 'High') {
    score += 20;
    reasons.push('High importance (+20).');
  } else if (task.importance === 'Medium') {
    score += 10;
    reasons.push('Medium importance (+10).');
  }

  // 3. Deadline Proximity
  if (isOverdue) {
    score += 40;
    reasons.push('Task is overdue (+40).');
  } else if (diffHours <= 4) {
    score += 35;
    reasons.push('Due in less than 4 hours (+35).');
  } else if (diffHours <= 12) {
    score += 25;
    reasons.push('Due in less than 12 hours (+25).');
  } else if (diffHours <= 24) {
    score += 15;
    reasons.push('Due in less than 24 hours (+15).');
  } else if (diffHours <= 72) {
    score += 5;
    reasons.push('Due in less than 3 days (+5).');
  }

  // 4. Time remaining vs estimated duration crisis
  const estMins = task.estimatedMinutes || 30;
  if (!isOverdue && diffMins < estMins) {
    score += 20;
    reasons.push('CRITICAL: Time remaining is less than estimated work duration (+20).');
  }

  // 5. Blocked status penalty
  if (task.status === 'Blocked') {
    score += 15;
    reasons.push('Task is blocked (+15).');
  }

  // 6. Energy penalty (high energy + low time)
  if (task.energyRequired === 'High' && diffHours <= 24 && !isOverdue) {
    score += 10;
    reasons.push('High energy task with less than 24h remaining (+10).');
  }

  // 7. Contextual concurrency: Number of tasks due today
  const dueTodayCount = allTasks.filter(t => {
    if (t.status === 'Completed') return false;
    const tDue = new Date(t.deadline);
    return (
      tDue.getDate() === now.getDate() &&
      tDue.getMonth() === now.getMonth() &&
      tDue.getFullYear() === now.getFullYear()
    );
  }).length;

  if (dueTodayCount > 3 && diffHours <= 24 && !isOverdue) {
    score += 8;
    reasons.push(`High concurrency: ${dueTodayCount} other tasks due today (+8).`);
  }

  // Bound the risk score
  const finalScore = Math.min(100, Math.max(0, score));

  // Urgency category mapping
  let urgencyLevel: 'Safe' | 'Watch' | 'Urgent' | 'Critical' | 'Overdue';
  if (isOverdue) {
    urgencyLevel = 'Overdue';
  } else if (finalScore >= 81) {
    urgencyLevel = 'Critical';
  } else if (finalScore >= 61) {
    urgencyLevel = 'Urgent';
  } else if (finalScore >= 31) {
    urgencyLevel = 'Watch';
  } else {
    urgencyLevel = 'Safe';
  }

  // Time remaining text formatting
  let timeRemainingText = '';
  if (isOverdue) {
    const absHours = Math.abs(diffHours);
    if (absHours < 1) {
      timeRemainingText = `${Math.round(Math.abs(diffMins))}m ago`;
    } else if (absHours < 24) {
      timeRemainingText = `${Math.round(absHours)}h ago`;
    } else {
      timeRemainingText = `${Math.round(absHours / 24)}d ago`;
    }
  } else {
    if (diffHours < 1) {
      timeRemainingText = `${Math.round(diffMins)}m left`;
    } else if (diffHours < 24) {
      timeRemainingText = `${Math.round(diffHours)}h left`;
    } else {
      timeRemainingText = `${Math.round(diffHours / 24)}d left`;
    }
  }

  // Recommended next actions
  let recommendedAction = '';
  const rescueRequired = finalScore >= 61 && task.status !== 'Completed';

  if (isOverdue) {
    recommendedAction = '⚠️ CONTACT RECOVERY PROTOCOL: Send an extension request or a high-velocity scope compression plan.';
  } else if (finalScore >= 81) {
    recommendedAction = '🔥 TRIGGER RESCUE MODE IMMEDIATELY: Stop everything, close all tabs, and run a 25-minute Pomodoro focus sprint.';
  } else if (finalScore >= 61) {
    recommendedAction = '⚡ ACCELERATE WORK: Focus completely for 45 minutes to knock out the core functionality of this task.';
  } else if (finalScore >= 31) {
    recommendedAction = '⏱️ PLAN TIME BLOCK: Dedicate a 1-hour session today to get this task to In Progress before it becomes critical.';
  } else {
    recommendedAction = '🌱 MAINTAIN STEADY PACE: Keep on your calendar. Work on this during normal energy slots.';
  }

  return {
    riskScore: finalScore,
    urgencyLevel,
    riskReason: reasons.join(' '),
    timeRemainingText,
    recommendedAction,
    rescueRequired,
  };
}
