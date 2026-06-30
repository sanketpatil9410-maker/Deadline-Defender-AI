export interface AIPlanData {
  summary: string;
  topPriorityId: string;
  rankedTaskIds: string[];
  reasons: Record<string, string>;
  timeBlocks: Array<{
    timeSlot: string;
    taskTitle: string;
    focusStrategy: string;
  }>;
  riskExplanation: string;
  nextBestAction: string;
  rescueTriggers: string[];
  confidenceScore: number;
  planQualityWarning?: string;
}

export interface RescuePlanData {
  taskId: string;
  mvcPlan: string;
  firstStep: string;
  whatToSkip: string[];
  whatToSimplify: string[];
  distractionFirewall: string;
  emergencySchedule: Array<{
    duration: string;
    activity: string;
  }>;
  microActions: string[];
  submissionChecklist: string[];
  motivationalAction: string;
  emergencyMessages: Array<{
    type: 'professor' | 'manager' | 'client' | 'teammate';
    message: string;
  }>;
}

export interface DelayRecoveryData {
  recoveryPlan: string;
  revisedSchedule: Array<{
    timeSlot: string;
    action: string;
  }>;
  whatToFinishFirst: string[];
  whatToSkip: string[];
  whatToPostpone: string[];
  whatToCommunicate: string;
  newNextBestAction: string;
  successProbability: number; // 0 - 100
}

export interface WarRoomPlanData {
  morning: Array<{ time: string; action: string; duration: number; isBreak?: boolean }>;
  afternoon: Array<{ time: string; action: string; duration: number; isBreak?: boolean }>;
  evening: Array<{ time: string; action: string; duration: number; isBreak?: boolean }>;
  deepWorkBlocks: string[];
  breaks: string[];
  bufferTimeMins: number;
  emergencySlots: string[];
  lowEnergyTaskSlots: string[];
  endOfDayReview: string;
  motivationQuote: string;
}

export interface MicroStepBreakdownData {
  steps: Array<{
    title: string;
    estimatedMinutes: number;
    priority: number;
    quickWin: boolean;
  }>;
  reasoning: string;
}
