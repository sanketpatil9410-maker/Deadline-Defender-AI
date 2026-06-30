import { Task, Habit } from '../types/task';

const TASKS_KEY = 'deadline_defender_tasks';
const HABITS_KEY = 'deadline_defender_habits';
const STREAK_KEY = 'deadline_defender_streak_count';
const FOCUS_GOAL_KEY = 'deadline_defender_focus_goal';
const REFLECTION_KEY = 'deadline_defender_reflection';

export function getStoredTasks(): Task[] {
  const data = localStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveStoredTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getStoredHabits(): Habit[] {
  const data = localStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveStoredHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getStoredStreak(): number {
  const data = localStorage.getItem(STREAK_KEY);
  return data ? parseInt(data, 10) || 5 : 5;
}

export function saveStoredStreak(streak: number): void {
  localStorage.setItem(STREAK_KEY, streak.toString());
}

export function getStoredFocusGoal(): string {
  return localStorage.getItem(FOCUS_GOAL_KEY) || 'Complete the final hackathon submission build.';
}

export function saveStoredFocusGoal(goal: string): void {
  localStorage.setItem(FOCUS_GOAL_KEY, goal);
}

export function getStoredReflection(): string {
  return localStorage.getItem(REFLECTION_KEY) || 'Maintained strict focus during the afternoon sprint, but need to improve morning startup time.';
}

export function saveStoredReflection(reflection: string): void {
  localStorage.setItem(REFLECTION_KEY, reflection);
}
