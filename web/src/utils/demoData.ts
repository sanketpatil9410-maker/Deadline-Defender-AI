import { Task, Habit } from '../types/task';

export function generateDemoTasks(): Task[] {
  const now = new Date();

  // Helper to create offset ISO string
  const offsetTime = (hours: number): string => {
    const d = new Date(now.getTime() + hours * 60 * 60 * 1000);
    // Format to YYYY-MM-DDTHH:MM for datetime-local
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  return [
    {
      id: 'demo-hackathon-final',
      title: 'Submit Hackathon Project Build',
      description: 'Package application code, write up full master documentation (PROJECT_DESCRIPTION.md), test api fallback, and push submission zip.',
      category: 'Work',
      deadline: offsetTime(4), // Due in 4 hours
      estimatedMinutes: 60,
      importance: 'Critical',
      energyRequired: 'High',
      status: 'In Progress',
      notes: 'Final checklist: Verify server routes, check local storage persistence, test Pomodoro timer.'
    },
    {
      id: 'demo-pitch-script',
      title: 'Prepare Final Pitch Script',
      description: 'Write high-impact narrative for the 3-minute video pitch highlighting the "Rescue Mode" and "Agentic Pipeline Visualizer".',
      category: 'Work',
      deadline: offsetTime(5), // Due in 5 hours
      estimatedMinutes: 45,
      importance: 'Critical',
      energyRequired: 'High',
      status: 'Not Started',
      notes: 'Emphasize evaluation criteria: Agentic Depth 20% and Innovation 20%.'
    },
    {
      id: 'demo-gym-workout',
      title: 'Gym Workout Session',
      description: 'Quick cardio and strength training session to maintain high cognitive levels and counter task paralysis stress.',
      category: 'Health',
      deadline: offsetTime(8), // Due this evening
      estimatedMinutes: 50,
      importance: 'Low',
      energyRequired: 'High',
      status: 'Not Started',
      notes: 'Physical activity relieves decision fatigue. Do not skip.'
    },
    {
      id: 'demo-github-repo',
      title: 'Upload GitHub Repository',
      description: 'Clean up git history, write professional setup guides, format environment configurations (.env.example), and make repository public.',
      category: 'Work',
      deadline: offsetTime(10), // Due today
      estimatedMinutes: 30,
      importance: 'High',
      energyRequired: 'Medium',
      status: 'Not Started'
    },
    {
      id: 'demo-project-desc',
      title: 'Prepare Project Description Google Doc',
      description: 'Document architecture, Google Cloud Run instructions, and full product features lists for submission and team sharing.',
      category: 'Work',
      deadline: offsetTime(11), // Due today
      estimatedMinutes: 40,
      importance: 'High',
      energyRequired: 'Medium',
      status: 'Completed'
    },
    {
      id: 'demo-electric-bill',
      title: 'Pay Electricity Bill',
      description: 'Avoid late fees and utility service interruption. Pay online via checking account.',
      category: 'Finance',
      deadline: offsetTime(24), // Due tomorrow
      estimatedMinutes: 10,
      importance: 'High',
      energyRequired: 'Low',
      status: 'Not Started'
    },
    {
      id: 'demo-interview-answers',
      title: 'Prepare Interview Answers',
      description: 'Review system design architectures, dynamic programming, and common behavioral questions for upcoming technical lead interview.',
      category: 'Study',
      deadline: offsetTime(48), // Due in 2 days
      estimatedMinutes: 90,
      importance: 'High',
      energyRequired: 'High',
      status: 'Not Started'
    },
    {
      id: 'demo-ml-assignment',
      title: 'Complete ML Assignment',
      description: 'Train convolutional neural network, tune hyperparameters (epochs, learning rate), write final testing accuracy report.',
      category: 'Study',
      deadline: offsetTime(72), // Due in 3 days
      estimatedMinutes: 180,
      importance: 'Medium',
      energyRequired: 'High',
      status: 'Blocked',
      notes: 'Waiting for PyTorch GPU container to finish allocating resources.'
    }
  ];
}

export function generateDemoHabits(): Habit[] {
  return [
    { id: 'hab-1', title: 'Start work with 25m Pomodoro', isCompleted: true, date: new Date().toDateString() },
    { id: 'hab-2', title: 'Complete 1 core task before noon', isCompleted: false, date: new Date().toDateString() },
    { id: 'hab-3', title: 'Close social media tabs completely', isCompleted: false, date: new Date().toDateString() }
  ];
}
