export const GOAL_MESSAGES = {
  SECOND_CHANCE: {
    title: "Second Chance!",
    message: "You've got another opportunity to achieve this goal. Don't miss it this time! 🎯"
  },
  
  DEADLINE_PASSED: {
    title: "Deadline Passed",
    messages: {
      high: "You were so close! Don't give up - extend the deadline and finish strong! 💪",
      medium: "You made good progress! Set a new deadline and keep building on what you've achieved! 🚀", 
      low: "Every journey starts with a single step. You've started - now let's make it happen! ⭐",
      none: "New goals, fresh start! Learn from this experience and create an achievable plan! 🎯"
    }
  },
  
  COMPLETION: {
    title: "🎉 Congratulations! Goal Completed!",
    message: (goalTitle: string, totalHours: number) => 
      `Amazing work! You've successfully completed your goal "${goalTitle}". You put in ${totalHours} hours of dedicated effort!`,
    notePrompt: "Add a note about your achievement (optional):"
  },
  
  CONTINUE_GOAL: {
    title: "🔄 Continue Goal",
    message: (goalTitle: string) => 
      `Set a new deadline for "${goalTitle}" and give it another shot!`,
    deadlineLabel: "New Deadline"
  },
  
  DAILY_STATUS: {
    excellent: "🌟 Exceeded!",
    completed: "✅ Complete", 
    close: "⚡ Almost",
    behind: "🎯 Keep going"
  },
  
  INCOMPLETE_GOAL: (remainingHours: number) => 
    `Goal not yet complete! You need ${remainingHours} more hours to reach your target.`
};

export const GOAL_PROGRESS_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 50, 
  LOW: 20,
  DAILY_EXCELLENT: 1.2,
  DAILY_CLOSE: 0.7
};