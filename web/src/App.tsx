import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Flame, RefreshCw, Trophy, Sparkles, HelpCircle, 
  Layers, Settings, Menu, X, Check, ShieldCheck, Cpu
} from 'lucide-react';

// Types
import { Task, Habit, Message } from './types/task';

// Utilities
import { 
  getStoredTasks, saveStoredTasks, getStoredHabits, saveStoredHabits,
  getStoredStreak, saveStoredStreak, getStoredFocusGoal, saveStoredFocusGoal,
  getStoredReflection, saveStoredReflection 
} from './utils/storage';
import { generateDemoTasks, generateDemoHabits } from './utils/demoData';
import { calculateRiskDetails } from './utils/riskEngine';

// Services
import { 
  fetchAIPlan, fetchAIRescuePlan, fetchAICoach, fetchAIDelayRecovery, 
  fetchAIMicroBreakdown, fetchAIWarRoom 
} from './services/api';

// Components
import Dashboard from './components/Dashboard';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AIPlan from './components/AIPlan';
import RescueMode from './components/RescueMode';
import DelayRecovery from './components/DelayRecovery';
import ProductivityCoach from './components/ProductivityCoach';
import AgenticWorkflow from './components/AgenticWorkflow';
import WarRoom from './components/WarRoom';
import JudgeDemoMode from './components/JudgeDemoMode';
import GoogleTechSection from './components/GoogleTechSection';
import Toast from './components/Toast';

type Tab = 'dashboard' | 'tasks' | 'plan' | 'warroom' | 'rescue' | 'delay' | 'coach' | 'agent' | 'demo' | 'google';

export default function App() {
  // Navigation & Menu States
  const [currentTab, setCurrentTab] = useState<Tab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Storage State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [focusGoal, setFocusGoal] = useState('');
  const [reflection, setReflection] = useState('');
  const [streakCount, setStreakCount] = useState(5);

  // Modals & Intermediaries
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Toast Alerts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // AI Response states & Loading indicators
  const [planText, setPlanText] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planSource, setPlanSource] = useState<'gemini' | 'local_fallback' | undefined>(undefined);

  const [rescueTask, setRescueTask] = useState<Task | null>(null);
  const [rescueText, setRescueText] = useState('');
  const [loadingRescue, setLoadingRescue] = useState(false);
  const [rescueSource, setRescueSource] = useState<'gemini' | 'local_fallback' | undefined>(undefined);

  const [recoveryText, setRecoveryText] = useState('');
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const [recoverySource, setRecoverySource] = useState<'gemini' | 'local_fallback' | undefined>(undefined);

  const [warRoomText, setWarRoomText] = useState('');
  const [loadingWarRoom, setLoadingWarRoom] = useState(false);
  const [warRoomSource, setWarRoomSource] = useState<'gemini' | 'local_fallback' | undefined>(undefined);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Hi! I am your hyper-focused AI Productivity Coach. I specialize in deadline defense, anxiety de-escalation, and momentum recovery. Ask me anything, or choose a fast prompt chip below to analyze your active task context.',
      sender: 'coach',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [coachSource, setCoachSource] = useState<'gemini' | 'local_fallback' | undefined>(undefined);

  // Initialize and Hydrate state on startup
  useEffect(() => {
    const localTasks = getStoredTasks();
    const localHabits = getStoredHabits();
    
    setTasks(localTasks);
    setHabits(localHabits);
    setFocusGoal(getStoredFocusGoal());
    setReflection(getStoredReflection());
    setStreakCount(getStoredStreak());

    // Auto-load demo data on very first load if tasks are completely empty
    if (localTasks.length === 0) {
      triggerLoadDemo();
    }
  }, []);

  // Show floating notifications
  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // State Sync Triggers
  const handleUpdateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  };

  const handleUpdateHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    saveStoredHabits(newHabits);
  };

  // Loader for Judge Demo State
  const triggerLoadDemo = () => {
    const demoTasks = generateDemoTasks();
    const demoHabits = generateDemoHabits();

    // Map dynamic deadline risk details directly to tasks state
    const hydratedTasks = demoTasks.map(t => {
      const d = calculateRiskDetails(t, demoTasks);
      return {
        ...t,
        riskScore: d.riskScore,
        urgencyLevel: d.urgencyLevel,
        riskReason: d.riskReason,
        timeRemainingText: d.timeRemainingText,
        recommendedAction: d.recommendedAction,
        rescueRequired: d.rescueRequired
      };
    });

    handleUpdateTasks(hydratedTasks);
    handleUpdateHabits(demoHabits);
    setStreakCount(9);
    saveStoredStreak(9);
    
    // Reset AI text outputs
    setPlanText('');
    setRescueText('');
    setRecoveryText('');
    setWarRoomText('');
    setRescueTask(null);

    showToast('Telemetry hydrated! 8 Crisis Demo tasks initialized.', 'info');
  };

  // Task Mutations (CRUD)
  const handleToggleComplete = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'Completed' ? 'Not Started' : 'Completed';
        if (nextStatus === 'Completed') {
          setStreakCount(prev => {
            const next = prev + 1;
            saveStoredStreak(next);
            return next;
          });
          showToast(`Task complete! Habit streak boosted to ${streakCount + 1}.`, 'success');
        } else {
          showToast('Task marked incomplete.', 'info');
        }
        return { ...t, status: nextStatus };
      }
      return t;
    });
    handleUpdateTasks(updated);
  };

  const handleSaveFocusGoal = (val: string) => {
    setFocusGoal(val);
    saveStoredFocusGoal(val);
  };

  const handleSaveReflection = (val: string) => {
    setReflection(val);
    saveStoredReflection(val);
  };

  const handleSaveTaskForm = (formData: any) => {
    if (editingTask) {
      const updated = tasks.map(t => {
        if (t.id === editingTask.id) {
          const combined = { ...t, ...formData };
          const details = calculateRiskDetails(combined, tasks);
          return { ...combined, ...details };
        }
        return t;
      });
      handleUpdateTasks(updated);
      showToast('Task shield parameters modified successfully.', 'success');
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...formData
      };
      const details = calculateRiskDetails(newTask, tasks);
      const combined = { ...newTask, ...details };
      handleUpdateTasks([combined, ...tasks]);
      showToast('New dynamic task shield deployed.', 'success');
    }
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Retire this task shield?')) {
      const updated = tasks.filter(t => t.id !== id);
      handleUpdateTasks(updated);
      showToast('Task shield successfully retired.', 'warning');
    }
  };

  // Habit toggles
  const handleToggleHabit = (id: string) => {
    const updated = habits.map(h => h.id === id ? { ...h, isCompleted: !h.isCompleted } : h);
    handleUpdateHabits(updated);
  };

  const handleAddHabit = (title: string) => {
    const h: Habit = {
      id: `hab-${Date.now()}`,
      title,
      isCompleted: false,
      date: new Date().toDateString()
    };
    handleUpdateHabits([...habits, h]);
    showToast('Micro-habit firewall deployed.', 'success');
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    handleUpdateHabits(updated);
    showToast('Habit rule dismantled.', 'warning');
  };

  // AI triggers
  const triggerAIPlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetchAIPlan(tasks);
      setPlanText(res.data);
      setPlanSource(res.source);
      showToast('AI Plan calculated successfully.', 'success');
    } catch (err) {
      showToast('Plan generation error.', 'warning');
    } finally {
      setLoadingPlan(false);
    }
  };

  const triggerRescueMode = async (task: Task) => {
    setRescueTask(task);
    setLoadingRescue(true);
    setRescueText('');
    setCurrentTab('rescue');
    setMobileMenuOpen(false);
    try {
      const res = await fetchAIRescuePlan(task);
      setRescueText(res.data);
      setRescueSource(res.source);
      showToast(`Crisis plan generated for "${task.title}".`, 'success');
    } catch (err) {
      showToast('Rescue calculation failed.', 'warning');
    } finally {
      setLoadingRescue(false);
    }
  };

  const triggerDelayRecovery = async (task: Task, mins: number, progress: number, isMandatory: boolean) => {
    setLoadingRecovery(true);
    try {
      const res = await fetchAIDelayRecovery(task, mins, progress, isMandatory);
      setRecoveryText(res.data);
      setRecoverySource(res.source);
      showToast('Contingency recovery plan compiled.', 'success');
    } catch (err) {
      showToast('Recovery sub-agent error.', 'warning');
    } finally {
      setLoadingRecovery(false);
    }
  };

  const triggerWarRoom = async () => {
    setLoadingWarRoom(true);
    try {
      const res = await fetchAIWarRoom(tasks);
      setWarRoomText(res.data);
      setWarRoomSource(res.source);
      showToast('War Room schedule calculated.', 'success');
    } catch (err) {
      showToast('Schedule assembly failed.', 'warning');
    } finally {
      setLoadingWarRoom(false);
    }
  };

  const triggerCoachSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoadingCoach(true);

    try {
      const res = await fetchAICoach(text, tasks);
      const coachMsg: Message = {
        id: `coch-${Date.now()}`,
        text: res.data,
        sender: 'coach',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, coachMsg]);
      setCoachSource(res.source);
    } catch (err) {
      showToast('Neural relays congested.', 'warning');
    } finally {
      setLoadingCoach(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        text: 'Hi! I am your hyper-focused AI Productivity Coach. I specialize in deadline defense, anxiety de-escalation, and momentum recovery. Ask me anything, or choose a fast prompt chip below to analyze your active task context.',
        sender: 'coach',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast('Coach dialog cleared.', 'info');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      
      {/* MOBILE HEADER BAR */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-rose-500 p-1.5 rounded-lg">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm text-white tracking-wider">DEADLINE DEFENDER</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 text-amber-500 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>{streakCount}d</span>
          </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* SIDEBAR NAVIGATION (STAYS ON LARGE SCREENS, DRAWER ON MOBILE) */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0 z-40 transition-transform duration-350 md:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="space-y-6">
          {/* Brand header */}
          <div className="hidden md:flex items-center space-x-3 border-b border-slate-850 pb-4">
            <div className="bg-gradient-to-tr from-indigo-500 to-rose-500 p-2 rounded-xl shadow-lg shadow-indigo-950/40">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-sm text-white tracking-wide uppercase">DEFENDER AI</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase">V2</span>
              </div>
              <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase block mt-0.5">Tactical Command</span>
            </div>
          </div>

          {/* Nav buttons */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'AI Command Center', icon: Cpu },
              { id: 'tasks', label: 'Task Shields', icon: ShieldCheck },
              { id: 'plan', label: 'AI Prioritize & Plan', icon: Sparkles },
              { id: 'warroom', label: "Today's War Room", icon: Calendar },
              { id: 'rescue', label: 'Rescue Mode 2.0', icon: Flame },
              { id: 'delay', label: 'Delay Recovery', icon: AlertTriangle },
              { id: 'coach', label: 'Productivity Coach', icon: ProductivityCoach },
              { id: 'agent', label: 'Agentic Visualizer', icon: Layers },
              { id: 'demo', label: 'Judge Walkthrough', icon: HelpCircle },
              { id: 'google', label: 'Google Tech Spec', icon: Trophy }
            ].map(tab => {
              const Icon = tab.icon === ProductivityCoach ? Sparkles : tab.icon;
              const isSelected = currentTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setCurrentTab(tab.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-150 flex items-center space-x-3 group relative ${
                    isSelected 
                      ? 'bg-indigo-600/10 border border-indigo-500/30 text-indigo-400' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition ${
                    isSelected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                  }`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Streak block */}
        <div className="border-t border-slate-850 pt-4 space-y-3.5">
          <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Defensive Streak</span>
              <span className="text-xs font-black text-amber-400 block mt-0.5">{streakCount} Active Days</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT CONTENT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        
        {currentTab === 'dashboard' && (
          <Dashboard 
            tasks={tasks}
            streakCount={streakCount}
            focusGoal={focusGoal}
            reflection={reflection}
            onSaveFocusGoal={(val) => { handleSaveFocusGoal(val); showToast('Today\'s focus lock anchored.', 'success'); }}
            onSaveReflection={(val) => { handleSaveReflection(val); showToast('Reflection logs written to history.', 'success'); }}
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            onTriggerRescue={triggerRescueMode}
            onTriggerDemo={triggerLoadDemo}
            onNavigateToTasks={() => setCurrentTab('tasks')}
          />
        )}

        {currentTab === 'tasks' && (
          <TaskList 
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditClick}
            onDelete={handleDeleteTask}
            onRescue={triggerRescueMode}
            onBreakdown={(task) => { setRescueTask(task); setCurrentTab('rescue'); showToast(`Breakdown launched for "${task.title}".`, 'info'); }}
            onTriggerLate={(task) => { setRescueTask(task); setCurrentTab('delay'); showToast(`Recovery initiated for "${task.title}".`, 'info'); }}
            onAddTaskClick={() => { setEditingTask(null); setShowTaskForm(true); }}
          />
        )}

        {currentTab === 'plan' && (
          <AIPlan 
            tasks={tasks}
            planText={planText}
            loading={loadingPlan}
            onGeneratePlan={triggerAIPlan}
            apiSource={planSource}
          />
        )}

        {currentTab === 'warroom' && (
          <WarRoom 
            tasks={tasks}
            warRoomText={warRoomText}
            loading={loadingWarRoom}
            onGenerateWarRoom={triggerWarRoom}
            apiSource={warRoomSource}
          />
        )}

        {currentTab === 'rescue' && (
          <RescueMode 
            task={rescueTask}
            planText={rescueText}
            loading={loadingRescue}
            onMarkRescued={handleToggleComplete}
            onGenerateRescue={triggerRescueMode}
            apiSource={rescueSource}
          />
        )}

        {currentTab === 'delay' && (
          <DelayRecovery 
            tasks={tasks}
            recoveryText={recoveryText}
            loading={loadingRecovery}
            onGenerateRecovery={triggerDelayRecovery}
            apiSource={recoverySource}
            initialTaskId={rescueTask?.id}
          />
        )}

        {currentTab === 'coach' && (
          <ProductivityCoach 
            tasks={tasks}
            messages={messages}
            loading={loadingCoach}
            onSendMessage={triggerCoachSendMessage}
            onClearChat={handleClearChat}
            apiSource={coachSource}
          />
        )}

        {currentTab === 'agent' && (
          <AgenticWorkflow />
        )}

        {currentTab === 'demo' && (
          <JudgeDemoMode 
            onTriggerDemo={triggerLoadDemo}
            onNavigateTab={(tab) => { setCurrentTab(tab as any); }}
            hasTasks={tasks.length > 0}
          />
        )}

        {currentTab === 'google' && (
          <GoogleTechSection />
        )}

      </main>

      {/* TASK FORM MODAL (ADD / EDIT) */}
      {showTaskForm && (
        <TaskForm 
          task={editingTask}
          onSave={handleSaveTaskForm}
          onClose={() => { setEditingTask(null); setShowTaskForm(false); }}
        />
      )}

      {/* FLOATING TOAST NOTIFICATION CONTAINER */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
