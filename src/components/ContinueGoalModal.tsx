import { motion } from "framer-motion";
import { GOAL_MESSAGES } from "../constants/goalMessages";

interface ContinueGoalModalProps {
  show: boolean;
  goal: any;
  newDeadline: string;
  onDeadlineChange: (date: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ContinueGoalModal = ({ 
  show, 
  goal, 
  newDeadline, 
  onDeadlineChange, 
  onSubmit, 
  onCancel 
}: ContinueGoalModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3 className="text-lg font-semibold mb-4">{GOAL_MESSAGES.CONTINUE_GOAL.title}</h3>
        <p className="text-gray-600 mb-4">
          {GOAL_MESSAGES.CONTINUE_GOAL.message(goal?.title || "")}
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {GOAL_MESSAGES.CONTINUE_GOAL.deadlineLabel}
          </label>
          <input
            type="date"
            value={newDeadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!newDeadline}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Continue Goal
          </button>
        </div>
      </motion.div>
    </div>
  );
};