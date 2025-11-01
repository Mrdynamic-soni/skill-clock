import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, SkipForward } from 'lucide-react';

interface SessionNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  onAddNote: (note: string) => void;
}

export const SessionNoteDialog = ({ isOpen, onClose, onSkip, onAddNote }: SessionNoteDialogProps) => {
  const [note, setNote] = useState('');

  const handleAddNote = () => {
    onAddNote(note.trim());
    setNote('');
  };

  const handleSkip = () => {
    onSkip();
    setNote('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-lg p-6 max-w-md w-full"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Session Note</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm">
            Would you like to add a note about this session? (Optional)
          </p>
          
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you work on? Any insights or achievements..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <motion.button
              onClick={handleSkip}
              className="flex items-center justify-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SkipForward size={16} className="mr-2" />
              Skip
            </motion.button>
            <motion.button
              onClick={handleAddNote}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} className="mr-2" />
              {note.trim() ? 'Add Note' : 'Complete Session'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};