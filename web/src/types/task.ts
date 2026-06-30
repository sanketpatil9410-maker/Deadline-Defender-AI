export interface Task {
  id: string;
  title: string;
  description: string;
  category: 'Study' | 'Work' | 'Personal' | 'Finance' | 'Health' | 'Business' | 'Other';
  deadline: string; // ISO date-time string
  estimatedMinutes: number;
  importance: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';
  energyRequired: 'Low' | 'Medium' | 'High';
  notes?: string;
  
  // Risk Engine output fields
  riskScore?: number;
  urgencyLevel?: 'Safe' | 'Watch' | 'Urgent' | 'Critical' | 'Overdue';
  riskReason?: string;
  timeRemainingText?: string;
  recommendedAction?: string;
  rescueRequired?: boolean;
  microSteps?: MicroStep[];
}

export interface MicroStep {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: number;
  isCompleted: boolean;
}

export interface Habit {
  id: string;
  title: string;
  isCompleted: boolean;
  date: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: string;
}
