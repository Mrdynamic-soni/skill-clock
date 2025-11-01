import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Priority = 'low' | 'medium' | 'high';

export interface Skill {
  id: string;
  name: string;
  priority: Priority;
}

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  skillId: string;
  hours: number; // 0-24
  notes?: string;
}

export interface Profile {
  name: string;
  email: string;
  profession?: string;
  company?: string;
  location?: string;
  bio?: string;
}

export interface Session {
  id: string;
  skillId: string;
  date: string;
  startTime: number;
  endTime: number;
  totalHours: number;
  notes?: string;
  intervals: Array<{
    start: number;
    end?: number;
  }>;
}

export interface Goal {
  id: string;
  skillId: string;
  title: string;
  description: string;
  targetHours: number;
  dailyTarget: number;
  deadline: string;
  completed: boolean;
  completionNote?: string;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface DailyTaskLog {
  id: string;
  date: string;
  tasks: DailyTask[];
  completionRate: number;
}

interface AppState {
  skills: Skill[];
  entries: Entry[];
  profile: Profile;
  sidebarCollapsed: boolean;
  sessions: Session[];
  goals: Goal[];
  dailyTasks: DailyTask[];
  dailyTaskLogs: DailyTaskLog[];
  activeTimer: {
    skillId: string;
    startTime: number;
    elapsedTime: number;
    isRunning: boolean;
    intervals: Array<{ start: number; end?: number }>;
  } | null;
  
  // Actions
  addSkill: (name: string, priority?: Priority) => void;
  updateSkill: (id: string, updates: Partial<Omit<Skill, 'id'>>) => void;
  deleteSkill: (id: string) => void;
  
  addEntry: (payload: Omit<Entry, 'id'>) => void;
  deleteEntry: (id: string) => void;
  
  setProfile: (partial: Partial<Profile>) => void;
  
  toggleSidebar: () => void;
  clearAll: () => void;
  
  // Timer actions
  startTimer: (skillId: string) => void;
  stopTimer: () => void;
  resumeTimer: () => void;
  endTimer: (notes?: string) => void;
  updateElapsedTime: (elapsed: number) => void;
  
  // Session actions
  addNoteToSession: (sessionId: string, notes: string) => void;
  
  // Goal actions
  addGoal: (payload: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => void;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => void;
  deleteGoal: (id: string) => void;
  
  // Daily Task actions
  addDailyTask: (payload: Omit<DailyTask, 'id' | 'completed' | 'createdAt'>) => void;
  toggleDailyTask: (id: string) => void;
  deleteDailyTask: (id: string) => void;
  saveDailyLog: () => void;
}

const initialProfile: Profile = {
  name: '',
  email: '',
  profession: '',
  company: '',
  location: '',
  bio: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      skills: [],
      entries: [],
      profile: initialProfile,
      sidebarCollapsed: false,
      sessions: [],
      goals: [],
      dailyTasks: [],
      dailyTaskLogs: [],
      activeTimer: null,

      addSkill: (name: string, priority: Priority = 'medium') => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        
        // Convert to camelCase
        const camelCaseName = trimmedName
          .split(' ')
          .map((word, index) => 
            index === 0 
              ? word.toLowerCase()
              : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join('');
        
        const exists = get().skills.some(
          skill => skill.name.toLowerCase() === camelCaseName.toLowerCase()
        );
        
        if (exists) return;
        
        set(state => ({
          skills: [...state.skills, { id: uuidv4(), name: camelCaseName, priority }]
        }));
      },

      updateSkill: (id: string, updates: Partial<Omit<Skill, 'id'>>) => {
        set(state => ({
          skills: state.skills.map(skill => 
            skill.id === id ? { ...skill, ...updates } : skill
          )
        }));
      },

      deleteSkill: (id: string) => {
        set(state => ({
          skills: state.skills.filter(skill => skill.id !== id),
          entries: state.entries.filter(entry => entry.skillId !== id)
        }));
      },

      addEntry: (payload) => {
        const hours = Math.max(0, Math.min(24, payload.hours));
        set(state => ({
          entries: [...state.entries, { ...payload, hours, id: uuidv4() }]
        }));
      },

      deleteEntry: (id: string) => {
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id)
        }));
      },

      setProfile: (partial) => {
        set(state => ({
          profile: { ...state.profile, ...partial }
        }));
      },

      toggleSidebar: () => {
        set(state => ({
          sidebarCollapsed: !state.sidebarCollapsed
        }));
      },

      clearAll: () => {
        set({
          skills: [],
          entries: [],
          profile: initialProfile,
          sessions: [],
          goals: [],
          dailyTasks: [],
          dailyTaskLogs: [],
          activeTimer: null,
        });
      },

      addNoteToSession: (sessionId: string, notes: string) => {
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? { ...session, notes } : session
          )
        }));
      },

      startTimer: (skillId: string) => {
        const now = Date.now();
        set({
          activeTimer: {
            skillId,
            startTime: now,
            elapsedTime: 0,
            isRunning: true,
            intervals: [{ start: now }]
          }
        });
      },

      stopTimer: () => {
        const state = get();
        if (!state.activeTimer || !state.activeTimer.isRunning) return;
        
        const now = Date.now();
        const currentSessionTime = Math.floor((now - state.activeTimer.startTime) / 1000);
        
        set(state => ({
          activeTimer: state.activeTimer ? {
            ...state.activeTimer,
            elapsedTime: state.activeTimer.elapsedTime + currentSessionTime,
            isRunning: false,
            intervals: state.activeTimer.intervals.map((interval, idx) => 
              idx === state.activeTimer!.intervals.length - 1 && !interval.end
                ? { ...interval, end: now }
                : interval
            )
          } : null
        }));
      },

      resumeTimer: () => {
        const now = Date.now();
        set(state => ({
          activeTimer: state.activeTimer ? {
            ...state.activeTimer,
            startTime: now,
            isRunning: true,
            intervals: [...state.activeTimer.intervals, { start: now }]
          } : null
        }));
      },

      endTimer: (notes?: string) => {
        const state = get();
        if (!state.activeTimer) return;
        
        const now = Date.now();
        let finalElapsed = state.activeTimer.elapsedTime;
        let finalIntervals = [...state.activeTimer.intervals];
        
        if (state.activeTimer.isRunning) {
          const currentSession = Math.floor((now - state.activeTimer.startTime) / 1000);
          finalElapsed += currentSession;
          finalIntervals = finalIntervals.map((interval, idx) => 
            idx === finalIntervals.length - 1 && !interval.end
              ? { ...interval, end: now }
              : interval
          );
        }
        
        const sessionStart = Math.min(...finalIntervals.map(i => i.start));
        const actualDuration = (now - sessionStart) / 1000 / 3600; // Convert to hours
        
        const session: Session = {
          id: uuidv4(),
          skillId: state.activeTimer.skillId,
          date: new Date().toISOString().split('T')[0],
          startTime: sessionStart,
          endTime: now,
          totalHours: Math.round(actualDuration * 100) / 100,
          notes,
          intervals: finalIntervals
        };
        
        const entry: Entry = {
          id: uuidv4(),
          date: new Date().toISOString().split('T')[0],
          skillId: state.activeTimer.skillId,
          hours: Math.round(actualDuration * 100) / 100,
          notes: notes || 'Timer session'
        };
        
        set(state => ({
          entries: [...state.entries, entry],
          sessions: [...state.sessions, session],
          activeTimer: null
        }));
      },

      updateElapsedTime: (elapsed: number) => {
        set(state => ({
          activeTimer: state.activeTimer ? {
            ...state.activeTimer,
            elapsedTime: elapsed
          } : null
        }));
      },

      addGoal: (payload) => {
        set(state => ({
          goals: [...state.goals, {
            ...payload,
            id: uuidv4(),
            completed: false,
            createdAt: new Date().toISOString()
          }]
        }));
      },

      updateGoal: (id: string, updates) => {
        set(state => ({
          goals: state.goals.map(goal => 
            goal.id === id ? { ...goal, ...updates } : goal
          )
        }));
      },

      deleteGoal: (id: string) => {
        set(state => ({
          goals: state.goals.filter(goal => goal.id !== id)
        }));
      },
      
      addDailyTask: (payload) => {
        set(state => ({
          dailyTasks: [...state.dailyTasks, {
            ...payload,
            id: uuidv4(),
            completed: false,
            createdAt: new Date().toISOString()
          }]
        }));
      },
      
      toggleDailyTask: (id: string) => {
        set(state => ({
          dailyTasks: state.dailyTasks.map(task => 
            task.id === id ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined
            } : task
          )
        }));
      },
      
      deleteDailyTask: (id: string) => {
        set(state => ({
          dailyTasks: state.dailyTasks.filter(task => task.id !== id)
        }));
      },
      
      saveDailyLog: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const completedTasks = state.dailyTasks.filter(task => task.completed).length;
        const totalTasks = state.dailyTasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        const existingLogIndex = state.dailyTaskLogs.findIndex(log => log.date === today);
        
        if (existingLogIndex >= 0) {
          set(state => ({
            dailyTaskLogs: state.dailyTaskLogs.map((log, index) => 
              index === existingLogIndex ? {
                ...log,
                tasks: [...state.dailyTasks],
                completionRate
              } : log
            )
          }));
        } else {
          set(state => ({
            dailyTaskLogs: [...state.dailyTaskLogs, {
              id: uuidv4(),
              date: today,
              tasks: [...state.dailyTasks],
              completionRate
            }]
          }));
        }
      },
    }),
    {
      name: 'sht.store.v1',
      version: 1,
    }
  )
);

// Selectors
export const useSkills = () => useAppStore(state => state.skills);
export type { Priority };
export const useEntries = () => useAppStore(state => state.entries);
export const useProfile = () => useAppStore(state => state.profile);

export const useTotalHours = () => useAppStore(state => 
  state.entries.reduce((sum, entry) => sum + entry.hours, 0)
);

export const useHoursBySkill = () => {
  const skills = useAppStore(state => state.skills);
  const entries = useAppStore(state => state.entries);
  
  const skillMap = skills.reduce((acc, skill) => {
    acc[skill.id] = skill.name;
    return acc;
  }, {} as Record<string, string>);

  const hoursBySkill = entries.reduce((acc, entry) => {
    const skillName = skillMap[entry.skillId] || 'Unknown';
    acc[skillName] = (acc[skillName] || 0) + entry.hours;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(hoursBySkill)
    .map(([name, hours]) => ({ name, hours }))
    .sort((a, b) => b.hours - a.hours);
};

export const useHoursByDate = () => {
  const entries = useAppStore(state => state.entries);
  
  const hoursByDate = entries.reduce((acc, entry) => {
    acc[entry.date] = (acc[entry.date] || 0) + entry.hours;
    return acc;
  }, {} as Record<string, number>);

  // Get last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const result = [];
  for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      hours: hoursByDate[dateStr] || 0
    });
  }

  return result;
};