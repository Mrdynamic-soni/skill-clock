import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, Target, Clock, BarChart3, User, Settings, BookOpen, MessageSquare, Send } from "lucide-react";

export const Help = () => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'question' | 'suggestion'>('question');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittedFeedback, setSubmittedFeedback] = useState<Array<{id: string, type: string, text: string, date: string}>>([]);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    
    const newFeedback = {
      id: Date.now().toString(),
      type: feedbackType,
      text: feedbackText.trim(),
      date: new Date().toLocaleDateString()
    };
    
    setSubmittedFeedback(prev => [newFeedback, ...prev]);
    setFeedbackText('');
    setShowFeedbackForm(false);
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
    },
    {
      icon: <Settings className="text-gray-600" />,
      title: "Settings",
      content: [
        "Customize app preferences and notifications",
        "Export your data for backup purposes",
        "Clear all data if needed (use with caution)"
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="text-blue-600" size={28} />
        <h1 className="text-2xl font-bold">Help & Guide</h1>
      </div>

      <motion.div
        className="bg-gray-50 border border-gray-200 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
          <motion.div
            className="bg-white border rounded-lg p-4 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Send size={16} />
                  Submit
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
          </motion.div>
        )}
        
        {submittedFeedback.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">Your Feedback:</h3>
            {submittedFeedback.map((feedback) => (
              <div key={feedback.id} className="bg-white border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    feedback.type === 'question' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {feedback.type}
                  </span>
                  <span className="text-xs text-gray-500">{feedback.date}</span>
                </div>
                <p className="text-gray-700">{feedback.text}</p>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-gray-700 mt-4">
          Your feedback is stored locally and helps improve your experience. 
          Your data remains private and secure in your browser.
        </p>
      </motion.div>

      <motion.div
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Welcome to Skill Hours Tracker!</h2>
        <p className="text-blue-700">
          This app helps you track time spent learning and practicing different skills. 
          Set goals, monitor progress, and stay motivated on your learning journey.
        </p>
      </motion.div>

      <div className="grid gap-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            className="bg-white rounded-lg shadow p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
          </motion.div>
        ))}
      </div>

      <motion.div
        className="bg-green-50 border border-green-200 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-green-800 mb-4">💡 Pro Tips</h2>
        <div className="grid gap-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span className="text-green-700">{tip}</span>
            </div>
          ))}
        </div>
      </motion.div>


    </div>
  );
};