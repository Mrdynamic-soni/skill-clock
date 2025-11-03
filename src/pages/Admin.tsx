import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Calendar, User, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

interface FeedbackItem {
  id: string;
  type: 'question' | 'suggestion';
  message: string;
  user_email: string;
  user_name: string;
  created_at: string;
}

export const Admin = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'question' | 'suggestion'>('all');
  const { user } = useAppStore();

  // Check if user is admin
  const isAdmin = user?.email === 'ssoni5930@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;
    
    fetchFeedback();
  }, [isAdmin]);

  const fetchFeedback = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      // Fetch error handled silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  const filteredFeedback = feedback.filter(item => 
    filter === 'all' || item.type === filter
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-blue-600" size={24} />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Feedback</option>
              <option value="question">Questions</option>
              <option value="suggestion">Suggestions</option>
            </select>
            <button
              onClick={() => fetchFeedback(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`${refreshing ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="bg-blue-50 p-2 sm:p-4 rounded-lg text-center">
            <MessageSquare className="text-blue-600 mx-auto mb-1" size={16} />
            <div className="text-xs sm:text-sm font-medium text-gray-600">All</div>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {feedback.length}
            </div>
          </div>
          <div className="bg-green-50 p-2 sm:p-4 rounded-lg text-center">
            <MessageSquare className="text-green-600 mx-auto mb-1" size={16} />
            <div className="text-xs sm:text-sm font-medium text-gray-600">Q&A</div>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {feedback.filter(f => f.type === 'question').length}
            </div>
          </div>
          <div className="bg-purple-50 p-2 sm:p-4 rounded-lg text-center">
            <MessageSquare className="text-purple-600 mx-auto mb-1" size={16} />
            <div className="text-xs sm:text-sm font-medium text-gray-600">Ideas</div>
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {feedback.filter(f => f.type === 'suggestion').length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading feedback...</p>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
            <p className="text-gray-600">Feedback and suggestions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border rounded-lg p-4 ${
                  item.type === 'question' 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-purple-200 bg-purple-50'
                }`}
              >
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'question'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span className="hidden sm:inline">{formatDate(item.created_at)}</span>
                      <span className="sm:hidden">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                      <User size={12} />
                      <span>{item.user_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                      <Mail size={12} />
                      <span className="truncate">{item.user_email}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{item.message}</p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};