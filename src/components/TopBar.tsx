import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, useTotalHours } from '../store/appStore';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import RBGLOGO from '../assets/RBGLOGO.png';

interface TopBarProps {
  title: string;
}

export const TopBar = ({ title }: TopBarProps) => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const totalHours = useTotalHours();
  const clearAll = useAppStore(state => state.clearAll);

  const handleClearAll = () => {
    clearAll();
    setShowClearDialog(false);
  };

  return (
    <>
      <motion.div 
        className="bg-white border-b border-gray-200 px-3 md:px-6 py-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <img src={RBGLOGO} alt="SkillClock" className="h-10 md:h-12" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-xs md:text-sm text-gray-600">Total Hours: {totalHours}</p>
            </div>
          </motion.div>
          <motion.button
            onClick={() => setShowClearDialog(true)}
            className="flex items-center px-2 md:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm md:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Trash2 size={16} className="mr-1 md:mr-2" />
            <span className="hidden sm:inline">Clear All Data</span>
            <span className="sm:hidden">Clear</span>
          </motion.button>
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAll}
        title="Clear All Data"
        message="This will permanently delete all skills, entries, and profile data. This action cannot be undone."
      />
    </>
  );
};