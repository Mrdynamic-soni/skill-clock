import { useState } from 'react';
import { Clock, Shield, Database, HelpCircle, Target, BarChart3, User, Settings, BookOpen, MessageSquare, Send } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { supabase } from '../lib/supabase';

export const About = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'question' | 'suggestion'>('question');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { user } = useAppStore();

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user?.id,
          type: feedbackType,
          message: feedbackText.trim(),
          user_email: user?.email || 'Anonymous',
          user_name: user?.user_metadata?.name || 'Anonymous User'
        });

      if (error) throw error;
      
      setSubmitSuccess(true);
      setFeedbackText('');
      setShowFeedbackForm(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    {
      icon: <BookOpen className="text-blue-600" />,
      title: "Getting Started",
      content: [
        "Create your first skill by clicking the '+' button on the Skills page",
        "Use the Timer to track time spent on skills in real-time",
        "Manually log hours using the Sessions page",
        "View your progress and analytics on the Analytics page"
      ]
    },
    {
      icon: <Target className="text-green-600" />,
      title: "Goals",
      content: [
        "Set learning goals with specific skills and target hours",
        "Add deadlines to stay motivated and track progress",
        "Monitor your progress with visual progress bars",
        "Mark goals as completed when achieved"
      ]
    },
    {
      icon: <Clock className="text-purple-600" />,
      title: "Timer & Sessions",
      content: [
        "Start/stop/pause timer for active skill practice",
        "Timer automatically creates session entries",
        "Add notes to sessions for better tracking",
        "View all past sessions with detailed information"
      ]
    },
    {
      icon: <BarChart3 className="text-orange-600" />,
      title: "Analytics",
      content: [
        "Filter data by date ranges (daily, weekly, monthly, custom)",
        "Filter by specific skills to focus your analysis",
        "View hours distribution across different skills",
        "Track daily progress with line charts"
      ]
    },
    {
      icon: <User className="text-red-600" />,
      title: "Profile",
      content: [
        "Add your personal information and bio",
        "Track your learning journey and achievements",
        "Customize your profile to reflect your goals"
      ]
    }
  ];

  const tips = [
    "Set realistic daily/weekly hour targets for better consistency",
    "Use the timer feature for accurate time tracking",
    "Review your analytics weekly to identify patterns",
    "Set specific, measurable goals with clear deadlines",
    "Add notes to sessions to remember what you learned",
    "Use skill priorities to focus on what matters most"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Help & About</h1>
      </div>

      {/* Feedback Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Questions & Suggestions</h2>
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <MessageSquare size={16} />
            Add Feedback
          </button>
        </div>
        
        {showFeedbackForm && (
          <div className="bg-white border rounded-lg p-4 mb-4">
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="question"
                    checked={feedbackType === 'question'}
                    onChange={(e) => setFeedbackType(e.target.value as 'question')}
                  />
                  Question
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="suggestion"
                    checked={feedbackType === 'suggestion'}
                    onChange={(e) => setFeedbackType(e.target.value as 'suggestion')}
                  />
                  Suggestion
                </label>
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={`Enter your ${feedbackType}...`}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-700 font-medium">✅ Feedback submitted successfully!</p>
            <p className="text-green-600 text-sm">Thank you for your feedback. We'll review it soon.</p>
          </div>
        )}
        
        <p className="text-gray-700 mt-4">
          Your feedback is stored securely and helps us improve SkillClock. 
          We'll review your submission and may follow up if needed.
        </p>
      </div>

      {/* Welcome Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Welcome to SkillClock!</h2>
        <p className="text-blue-700">
          This app helps you track time spent learning and practicing different skills. 
          Set goals, monitor progress, and stay motivated on your learning journey.
        </p>
      </div>

      {/* Help Sections */}
      <div className="grid gap-6">
        {sections.map((section, index) => (
          <div
            key={section.title}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              {section.icon}
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.content.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Pro Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-800 mb-4">💡 Pro Tips</h2>
        <div className="grid gap-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-green-700">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-8">
          <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SkillClock</h1>
          <p className="text-lg text-gray-600">
            Track your daily dedicated hours by skill and work category
          </p>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            SkillClock is a productivity application designed to help you monitor 
            and analyze how you spend your time across different skills and work categories. 
            Whether you're learning new technologies, working on projects, or developing 
            professional skills, this app provides insights into your time investment.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Skill Management</h3>
                <p className="text-sm text-gray-600">Create and manage skills with priority levels</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Real-time Timer</h3>
                <p className="text-sm text-gray-600">Track time with start/stop/pause functionality</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Session Tracking</h3>
                <p className="text-sm text-gray-600">Log sessions manually or via timer with notes</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Goal Setting</h3>
                <p className="text-sm text-gray-600">Set targets with deadlines and track progress</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Analytics & Charts</h3>
                <p className="text-sm text-gray-600">Visualize progress with interactive charts</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Daily Tasks</h3>
                <p className="text-sm text-gray-600">Manage daily to-do items and track completion</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Profile Management</h3>
                <p className="text-sm text-gray-600">Maintain your professional profile and bio</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Cloud Sync</h3>
                <p className="text-sm text-gray-600">Secure cloud storage with authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold">Privacy & Security</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Database className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Secure Cloud Storage</h3>
              <p className="text-sm text-gray-600">
                Your data is securely stored in the cloud with encryption. 
                Only you can access your personal tracking data.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Account Protection</h3>
              <p className="text-sm text-gray-600">
                Secure authentication with email/password or Google OAuth. 
                Your account is protected with industry-standard security.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Database className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Data Privacy</h3>
              <p className="text-sm text-gray-600">
                We don't share your data with third parties. Your skill tracking 
                and personal information remain completely private.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Technical Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Frontend Stack</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React 19 with TypeScript</li>
              <li>• Vite for fast development</li>
              <li>• Zustand for state management</li>
              <li>• Recharts for data visualization</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Framer Motion for animations</li>
              <li>• React Router for navigation</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Backend & Infrastructure</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Supabase for database & auth</li>
              <li>• PostgreSQL database</li>
              <li>• Row Level Security (RLS)</li>
              <li>• Real-time subscriptions</li>
              <li>• Edge Functions for serverless</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-2">Browser Compatibility</h3>
          <p className="text-sm text-gray-600">
            Works on all modern browsers: Chrome, Firefox, Safari, Edge. 
            Requires JavaScript enabled and internet connection for sync.
          </p>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          Version 1.0.0 • Built with ❤️ for productivity enthusiasts
        </p>
      </div>
    </div>
  );
};