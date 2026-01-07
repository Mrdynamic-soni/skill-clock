import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { GOAL_MESSAGES, GOAL_PROGRESS_THRESHOLDS } from "../constants/goalMessages";

interface ExpiredGoalTileProps {
  goal: any;
  progress: number;
}

export const ExpiredGoalTile = ({ goal, progress }: ExpiredGoalTileProps) => {
  const today = new Date().toISOString().split("T")[0];
  const deadline = new Date(goal.deadline).toISOString().split("T")[0];
  const isExpired = deadline <= today && !goal.completed;

  if (!isExpired) return null;

  const getMotivationMessage = () => {
    if (progress >= GOAL_PROGRESS_THRESHOLDS.HIGH) return GOAL_MESSAGES.DEADLINE_PASSED.messages.high;
    if (progress >= GOAL_PROGRESS_THRESHOLDS.MEDIUM) return GOAL_MESSAGES.DEADLINE_PASSED.messages.medium;
    if (progress >= GOAL_PROGRESS_THRESHOLDS.LOW) return GOAL_MESSAGES.DEADLINE_PASSED.messages.low;
    return GOAL_MESSAGES.DEADLINE_PASSED.messages.none;
  };

  return (
    <motion.div
      className="mb-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-800 mb-1">
            {GOAL_MESSAGES.DEADLINE_PASSED.title}
          </p>
          <p className="text-xs text-yellow-700">
            {getMotivationMessage()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};