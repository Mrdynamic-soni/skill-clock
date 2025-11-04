import { supabase } from '../lib/supabase';

class SupabaseService {
  // Check auth status
  async checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  // Auth
  async register(userData: { email: string; password: string; name: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: { name: userData.name }
      }
    });
    if (error) {
      throw new Error(error.message || 'Registration failed');
    }
    return { user: data.user, session: data.session };
  }

  async login(credentials: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    if (error) {
      if (error.message === 'Email not confirmed') {
        throw new Error('Please check your email and click the confirmation link, or contact support.');
      }
      throw new Error(error.message || 'Login failed');
    }
    return { user: data.user, session: data.session };
  }

  async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    if (error) throw error;
    return { message: 'Confirmation email sent' };
  }

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://skill-clock.vercel.app/reset-password'
    });
    if (error) throw error;
    return { message: 'Password reset email sent' };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    return { user };
  }

  // Skills
  async getSkills() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { skills: data };
  }

  async createSkill(skillData: { name: string; priority: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('skills')
      .insert([{ ...skillData, user_id: user?.id }])
      .select()
      .single();
    if (error) {
      throw error;
    }
    return { skill: data };
  }

  async updateSkill(id: string, skillData: any) {
    const { data, error } = await supabase
      .from('skills')
      .update(skillData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { skill: data };
  }

  async deleteSkill(id: string) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Skill deleted successfully' };
  }

  // Entries
  async getEntries(params?: any) {
    let query = supabase
      .from('entries')
      .select(`
        *,
        skills(name)
      `)
      .order('date', { ascending: false });

    if (params?.skill_id) {
      query = query.eq('skill_id', params.skill_id);
    }
    if (params?.start_date) {
      query = query.gte('date', params.start_date);
    }
    if (params?.end_date) {
      query = query.lte('date', params.end_date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { entries: data };
  }

  async createEntry(entryData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('entries')
      .insert([{ ...entryData, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return { entry: data };
  }

  async deleteEntry(id: string) {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Entry deleted successfully' };
  }

  // Sessions
  async getSessions(params?: any) {
    let query = supabase
      .from('sessions')
      .select(`
        *,
        skills(name)
      `)
      .order('start_time', { ascending: false });

    if (params?.skill_id) {
      query = query.eq('skill_id', params.skill_id);
    }
    if (params?.start_date) {
      query = query.gte('date', params.start_date);
    }
    if (params?.end_date) {
      query = query.lte('date', params.end_date);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { sessions: data };
  }

  async createSession(sessionData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('sessions')
      .insert([{ ...sessionData, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return { session: data };
  }

  async updateSessionNotes(id: string, notes: string) {
    const { data, error } = await supabase
      .from('sessions')
      .update({ notes })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { session: data };
  }

  // Goals
  async getGoals() {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        skills(name)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return { goals: data };
  }

  async createGoal(goalData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('goals')
      .insert([{ ...goalData, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return { goal: data };
  }

  async updateGoal(id: string, goalData: any) {
    const { data, error } = await supabase
      .from('goals')
      .update(goalData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { goal: data };
  }

  async deleteGoal(id: string) {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Goal deleted successfully' };
  }

  // Daily Tasks
  async getTasks(date?: string) {
    let query = supabase
      .from('daily_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    } else {
      query = query.eq('date', new Date().toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { tasks: data };
  }

  async createTask(taskData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert([{ ...taskData, user_id: user?.id }])
      .select()
      .single();
    if (error) throw error;
    return { task: data };
  }

  async updateTask(id: string, taskData: any) {
    const { data, error } = await supabase
      .from('daily_tasks')
      .update(taskData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { task: data };
  }

  async deleteTask(id: string) {
    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { message: 'Task deleted successfully' };
  }
}

export const apiService = new SupabaseService();