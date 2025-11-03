import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { supabase } from '../lib/supabase';

export const SuggestionForm = () => {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { user } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setLoading(true);
    try {
      // Store in database
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id,
          type: 'suggestion',
          message: suggestion.trim(),
          user_email: user?.email || 'Anonymous',
          user_name: user?.user_metadata?.name || 'Anonymous User'
        });

      if (error) throw error;
      
      setSent(true);
      setSuggestion('');
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      alert('Failed to submit suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-700 font-medium">✅ Suggestion sent successfully!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Send Suggestion</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="Share your ideas to improve SkillClock..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={loading || !suggestion.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {loading ? 'Sending...' : 'Send Suggestion'}
        </button>
      </form>
    </div>
  );
};