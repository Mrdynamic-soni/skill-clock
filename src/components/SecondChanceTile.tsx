import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { GOAL_MESSAGES } from "../constants/goalMessages";

interface SecondChanceTileProps {
  show: boolean;
}

export const SecondChanceTile = ({ show }: SecondChanceTileProps) => {
  if (!show) return null;

  return (
    <motion.div
      className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-start gap-2">
        <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800 mb-1">
            {GOAL_MESSAGES.SECOND_CHANCE.title}
          </p>
          <p className="text-xs text-blue-700">
            {GOAL_MESSAGES.SECOND_CHANCE.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};