import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { apiService } from '../services/supabaseService';


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
  date?: string;
}

export interface DailyTaskLog {
  id: string;
  date: string;
  tasks: DailyTask[];
  completionRate: number;
}

interface AppState {
  isAuthenticated: boolean;
  user: any | null;
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
  
  // Auth actions
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; name: string }) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  syncFromServer: () => Promise<void>;
  syncToServer: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  
  // Actions
  addSkill: (name: string, priority?: Priority) => Promise<void>;
  updateSkill: (id: string, updates: Partial<Omit<Skill, 'id'>>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  
  addEntry: (payload: Omit<Entry, 'id'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  
  setProfile: (partial: Partial<Profile>) => Promise<void>;
  
  toggleSidebar: () => void;
  clearAll: () => void;
  
  // Timer actions
  startTimer: (skillId: string) => void;
  stopTimer: () => void;
  resumeTimer: () => void;
  endTimer: (notes?: string) => Promise<void>;
  updateElapsedTime: (elapsed: number) => void;
  
  // Session actions
  addNoteToSession: (sessionId: string, notes: string) => Promise<void>;
  
  // Goal actions
  addGoal: (payload: Omit<Goal, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Daily Task actions
  addDailyTask: (payload: Omit<DailyTask, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
  toggleDailyTask: (id: string) => Promise<void>;
  deleteDailyTask: (id: string) => Promise<void>;
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
      isAuthenticated: false,
      user: null,
      skills: [],
      entries: [],
      profile: initialProfile,
      sidebarCollapsed: false,
      sessions: [],
      goals: [],
      dailyTasks: [],
      dailyTaskLogs: [],
      activeTimer: null,

      login: async (credentials) => {
        try {
          const result = await apiService.login(credentials);
          set({ 
            isAuthenticated: true, 
            user: result.user,
            profile: { 
              name: result.user?.user_metadata?.name || '',
              email: result.user?.email || '',
              profession: '',
              company: '',
              location: '',
              bio: ''
            }
          });
          await get().syncFromServer();
        } catch (error) {
          throw error;
        }
      },

      register: async (userData) => {
        try {
          const result = await apiService.register(userData);
          
          // Only set authenticated if we have a session (confirmations disabled)
          if (result.session) {
            set({ 
              isAuthenticated: true, 
              user: result.user,
              profile: {
                name: userData.name,
                email: userData.email,
                profession: '',
                company: '',
                location: '',
                bio: ''
              }
            });
          }
          
          return result;
        } catch (error) {
          throw error;
        }
      },

      signInWithGoogle: async () => {
        // Simple mock Google authentication
        set({ 
          isAuthenticated: true, 
          user: { email: 'user@gmail.com', name: 'Google User' },
          profile: {
            name: 'Google User',
            email: 'user@gmail.com',
            profession: '',
            company: '',
            location: '',
            bio: ''
          }
        });
      },

      logout: async () => {
        try {
          await apiService.logout();
          set({
            isAuthenticated: false,
            user: null,
            skills: [],
            entries: [],
            sessions: [],
            goals: [],
            dailyTasks: [],
            profile: initialProfile,
          });
        } catch (error) {
          // Logout error handled silently
        }
      },

      syncFromServer: async () => {
        try {
          const [skillsData, entriesData, sessionsData, goalsData, tasksData] = await Promise.all([
            apiService.getSkills(),
            apiService.getEntries(),
            apiService.getSessions(),
            apiService.getGoals(),
            apiService.getTasks(),
          ]);
          
          // Map database sessions to frontend format
          const mappedSessions = (sessionsData.sessions || []).map((session: any) => ({
            id: session.id,
            skillId: session.skill_id,
            date: session.date,
            startTime: session.start_time ? new Date(session.start_time).getTime() : Date.now(),
            endTime: session.end_time ? new Date(session.end_time).getTime() : Date.now(),
            totalHours: session.total_hours || 0,
            notes: session.notes || '',
            intervals: session.intervals || []
          }));
          
          // Map database entries to frontend format
          const mappedEntries = (entriesData.entries || []).map((entry: any) => ({
            id: entry.id,
            skillId: entry.skill_id,
            date: entry.date,
            hours: entry.hours,
            notes: entry.notes
          }));
          
          // Map database goals to frontend format
          const mappedGoals = (goalsData.goals || []).map((goal: any) => ({
            id: goal.id,
            skillId: goal.skill_id,
            title: goal.title,
            description: goal.description,
            targetHours: goal.target_hours,
            dailyTarget: goal.daily_target,
            deadline: goal.deadline,
            completed: goal.completed,
            completionNote: goal.completion_note,
            createdAt: goal.created_at
          }));
          
          // Map database tasks to frontend format
          const mappedTasks = (tasksData.tasks || []).map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            completed: task.completed,
            createdAt: task.created_at,
            completedAt: task.completed_at
          }));
          
          set({
            skills: skillsData.skills || [],
            entries: mappedEntries,
            sessions: mappedSessions,
            goals: mappedGoals,
            dailyTasks: mappedTasks,
          });
        } catch (error) {
          // Sync error handled silently
        }
      },

      syncToServer: async () => {
        // This will be called when going online after offline changes
        // For now, we'll rely on optimistic updates
      },

      checkAuthStatus: async () => {
        try {
          // Clean up old tasks on app start
          const today = new Date().toISOString().split('T')[0];
          const todayTasks = get().dailyTasks.filter(task => {
            const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
            return taskDate === today;
          });
          
          if (todayTasks.length !== get().dailyTasks.length) {
            set({ dailyTasks: todayTasks });
          }
          
          const isAuth = await apiService.checkAuth();
          if (isAuth) {
            const user = await apiService.getCurrentUser();
            set({ 
              isAuthenticated: true, 
              user,
              profile: {
                name: user?.user_metadata?.name || '',
                email: user?.email || '',
                profession: '',
                company: '',
                location: '',
                bio: ''
              }
            });
            await get().syncFromServer();
          } else {
            set({ isAuthenticated: false, user: null });
          }
        } catch (error) {
          set({ isAuthenticated: false, user: null });
        }
      },

      addSkill: async (name: string, priority: Priority = 'medium') => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        
        // Check for duplicates locally first
        const exists = get().skills.some(
          skill => skill.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (exists) throw new Error('Skill already exists');
        
        const tempSkill = { id: uuidv4(), name: trimmedName, priority };
        
        // Optimistic update
        set(state => ({ skills: [...state.skills, tempSkill] }));

        try {
          const result = await apiService.createSkill({ name: trimmedName, priority });
          // Replace temp skill with server response
          set(state => ({
            skills: state.skills.map(s => s.id === tempSkill.id ? {
              id: result.skill.id,
              name: result.skill.name,
              priority: result.skill.priority
            } : s)
          }));
        } catch (error) {
          // Rollback on error
          set(state => ({ skills: state.skills.filter(s => s.id !== tempSkill.id) }));
          throw error;
        }
      },

      updateSkill: async (id: string, updates: Partial<Omit<Skill, 'id'>>) => {
        const oldSkills = get().skills;
        set(state => ({
          skills: state.skills.map(skill => 
            skill.id === id ? { ...skill, ...updates } : skill
          )
        }));

        try {
          await apiService.updateSkill(id, updates);
        } catch (error) {
          set({ skills: oldSkills });
          throw error;
        }
      },

      deleteSkill: async (id: string) => {
        const oldState = { skills: get().skills, entries: get().entries };
        set(state => ({
          skills: state.skills.filter(skill => skill.id !== id),
          entries: state.entries.filter(entry => entry.skillId !== id)
        }));

        try {
          await apiService.deleteSkill(id);
        } catch (error) {
          set(oldState);
          throw error;
        }
      },

      addEntry: async (payload) => {
        const hours = Math.max(0, Math.min(24, payload.hours));
        const tempEntry = { ...payload, hours, id: uuidv4() };
        
        // Optimistic update
        set(state => ({ entries: [...state.entries, tempEntry] }));

        try {
          const entryData = {
            skill_id: payload.skillId,
            date: payload.date,
            hours,
            notes: payload.notes
          };
          
          const result = await apiService.createEntry(entryData);
          
          // Replace temp entry with server response
          set(state => ({
            entries: state.entries.map(e => e.id === tempEntry.id ? {
              id: result.entry.id,
              skillId: result.entry.skill_id,
              date: result.entry.date,
              hours: result.entry.hours,
              notes: result.entry.notes
            } : e)
          }));
        } catch (error) {
          // Rollback on error
          set(state => ({ entries: state.entries.filter(e => e.id !== tempEntry.id) }));
          throw error;
        }
      },

      deleteEntry: async (id: string) => {
        const oldEntries = get().entries;
        set(state => ({ entries: state.entries.filter(entry => entry.id !== id) }));

        try {
          await apiService.deleteEntry(id);
        } catch (error) {
          set({ entries: oldEntries });
          throw error;
        }
      },

      setProfile: async (partial) => {
        // Update local state immediately
        set(state => ({
          profile: { ...state.profile, ...partial }
        }));
        
        // Note: Supabase auth.users table updates would go here if needed
        // For now, we'll just keep profile data in local state
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

      addNoteToSession: async (sessionId: string, notes: string) => {
        // Optimistic update
        set(state => ({
          sessions: state.sessions.map(session => 
            session.id === sessionId ? { ...session, notes } : session
          )
        }));
        
        try {
          await apiService.updateSessionNotes(sessionId, notes);
        } catch (error) {
          // Revert on error
          set(state => ({
            sessions: state.sessions.map(session => 
              session.id === sessionId ? { ...session, notes: session.notes } : session
            )
          }));
        }
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

      endTimer: async (notes?: string) => {
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
        const actualDuration = (now - sessionStart) / 1000 / 3600;
        const totalHours = Math.round(actualDuration * 100) / 100;
        const date = new Date().toISOString().split('T')[0];
        
        // Create temp records for optimistic update
        const tempSession: Session = {
          id: uuidv4(),
          skillId: state.activeTimer.skillId,
          date,
          startTime: sessionStart,
          endTime: now,
          totalHours,
          notes,
          intervals: finalIntervals
        };
        
        const tempEntry: Entry = {
          id: uuidv4(),
          date,
          skillId: state.activeTimer.skillId,
          hours: totalHours,
          notes: notes || 'Timer session'
        };
        
        // Optimistic update
        set(state => ({
          entries: [...state.entries, tempEntry],
          sessions: [...state.sessions, tempSession],
          activeTimer: null
        }));
        
        try {
          // Save to Supabase
          const [sessionResult, entryResult] = await Promise.all([
            apiService.createSession({
              skill_id: state.activeTimer.skillId,
              date,
              start_time: new Date(sessionStart).toISOString(),
              end_time: new Date(now).toISOString(),
              total_hours: totalHours,
              notes,
              intervals: finalIntervals
            }),
            apiService.createEntry({
              skill_id: state.activeTimer.skillId,
              date,
              hours: totalHours,
              notes: notes || 'Timer session'
            })
          ]);
          
          // Update with server IDs
          set(state => ({
            sessions: state.sessions.map(s => 
              s.id === tempSession.id ? {
                ...tempSession,
                id: sessionResult.session.id
              } : s
            ),
            entries: state.entries.map(e => 
              e.id === tempEntry.id ? {
                ...tempEntry,
                id: entryResult.entry.id
              } : e
            )
          }));
        } catch (error) {
          // Keep local data even if server sync fails
        }
      },

      updateElapsedTime: (elapsed: number) => {
        set(state => ({
          activeTimer: state.activeTimer ? {
            ...state.activeTimer,
            elapsedTime: elapsed
          } : null
        }));
      },

      addGoal: async (payload) => {
        const tempGoal = {
          ...payload,
          id: uuidv4(),
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        set(state => ({ goals: [...state.goals, tempGoal] }));
        
        try {
          const result = await apiService.createGoal({
            skill_id: payload.skillId,
            title: payload.title,
            description: payload.description,
            target_hours: payload.targetHours,
            daily_target: payload.dailyTarget,
            deadline: payload.deadline
          });
          
          set(state => ({
            goals: state.goals.map(g => g.id === tempGoal.id ? {
              id: result.goal.id,
              skillId: result.goal.skill_id,
              title: result.goal.title,
              description: result.goal.description,
              targetHours: result.goal.target_hours,
              dailyTarget: result.goal.daily_target,
              deadline: result.goal.deadline,
              completed: result.goal.completed,
              completionNote: result.goal.completion_note,
              createdAt: result.goal.created_at
            } : g)
          }));
        } catch (error) {
          set(state => ({ goals: state.goals.filter(g => g.id !== tempGoal.id) }));
          throw error;
        }
      },

      updateGoal: async (id: string, updates) => {
        const oldGoals = get().goals;
        set(state => ({
          goals: state.goals.map(goal => 
            goal.id === id ? { ...goal, ...updates } : goal
          )
        }));
        
        try {
          await apiService.updateGoal(id, {
            title: updates.title,
            description: updates.description,
            target_hours: updates.targetHours,
            daily_target: updates.dailyTarget,
            deadline: updates.deadline,
            completed: updates.completed,
            completion_note: updates.completionNote
          });
        } catch (error) {
          set({ goals: oldGoals });
          throw error;
        }
      },

      deleteGoal: async (id: string) => {
        const oldGoals = get().goals;
        set(state => ({ goals: state.goals.filter(goal => goal.id !== id) }));
        
        try {
          await apiService.deleteGoal(id);
        } catch (error) {
          set({ goals: oldGoals });
          throw error;
        }
      },
      
      addDailyTask: async (payload) => {
        const today = new Date().toISOString().split('T')[0];
        const tempTask = {
          ...payload,
          id: uuidv4(),
          completed: false,
          createdAt: new Date().toISOString(),
          date: today
        };
        
        // Clean up old tasks (keep only today's tasks)
        const todayTasks = get().dailyTasks.filter(task => {
          const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
          return taskDate === today;
        });
        
        set(() => ({ dailyTasks: [...todayTasks, tempTask] }));
        
        try {
          const result = await apiService.createTask({
            title: payload.title,
            description: payload.description,
            date: payload.date || new Date().toISOString().split('T')[0]
          });
          
          set(state => ({
            dailyTasks: state.dailyTasks.map(t => t.id === tempTask.id ? {
              id: result.task.id,
              title: result.task.title,
              description: result.task.description,
              completed: result.task.completed,
              createdAt: result.task.created_at,
              completedAt: result.task.completed_at
            } : t)
          }));
        } catch (error) {
          set(state => ({ dailyTasks: state.dailyTasks.filter(t => t.id !== tempTask.id) }));
          throw error;
        }
      },
      
      toggleDailyTask: async (id: string) => {
        const oldTasks = get().dailyTasks;
        const task = oldTasks.find(t => t.id === id);
        if (!task) return;
        
        const updatedTask = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined
        };
        
        set(state => ({
          dailyTasks: state.dailyTasks.map(t => 
            t.id === id ? updatedTask : t
          )
        }));
        
        try {
          await apiService.updateTask(id, {
            completed: updatedTask.completed,
            completed_at: updatedTask.completedAt
          });
        } catch (error) {
          set({ dailyTasks: oldTasks });
          throw error;
        }
      },
      
      deleteDailyTask: async (id: string) => {
        const oldTasks = get().dailyTasks;
        set(state => ({ dailyTasks: state.dailyTasks.filter(task => task.id !== id) }));
        
        try {
          await apiService.deleteTask(id);
        } catch (error) {
          set({ dailyTasks: oldTasks });
          throw error;
        }
      },
      
      saveDailyLog: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const completedTasks = state.dailyTasks.filter(task => task.completed).length;
        const totalTasks = state.dailyTasks.length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        const existingLogIndex = state.dailyTaskLogs.findIndex(log => log.date === today);
        
        if (existingLogIndex >= 0) {
          set(currentState => ({
            dailyTaskLogs: currentState.dailyTaskLogs.map((log, index) => 
              index === existingLogIndex ? {
                ...log,
                tasks: [...state.dailyTasks],
                completionRate
              } : log
            )
          }));
        } else {
          set(currentState => ({
            dailyTaskLogs: [...currentState.dailyTaskLogs, {
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
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        profile: state.profile,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Selectors
export const useSkills = () => useAppStore(state => state.skills);
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