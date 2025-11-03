import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useSkills } from '../store/appStore';
import { Clock, Calendar, Play, Pause, Square, Edit3, Plus } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const Sessions = () => {
  const sessions = useAppStore(state => state.sessions);
  const skills = useSkills();
  const { addNoteToSession, addEntry } = useAppStore();
  const { showToast } = useToast();
  
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showAddSession, setShowAddSession] = useState(false);
  const [skillFilter, setSkillFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [newSession, setNewSession] = useState({
    skillId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    pauses: 0,
    notes: ''
  });

  const getSkillName = (skillId: string) => 
    skills.find(skill => skill.id === skillId)?.name || 'Unknown Skill';

  const formatTime = (timestamp: number) => 
    new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

  const formatDuration = (hours: number) => {
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleEditNote = (sessionId: string, currentNote?: string) => {
    setEditingNote(sessionId);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = (sessionId: string) => {
    addNoteToSession(sessionId, noteText.trim());
    setEditingNote(null);
    setNoteText('');
    showToast('Note saved successfully', 'success');
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteText('');
  };

  const handleAddNewSession = () => {
    if (!newSession.skillId || !newSession.startTime || !newSession.endTime) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const startDateTime = new Date(`${newSession.date} ${newSession.startTime}`);
    const endDateTime = new Date(`${newSession.date} ${newSession.endTime}`);
    
    if (endDateTime <= startDateTime) {
      showToast('End time must be after start time', 'error');
      return;
    }

    const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
    
    // Add to entries
    addEntry({
      date: newSession.date,
      skillId: newSession.skillId,
      hours: Math.round(durationHours * 100) / 100,
      notes: newSession.notes || `Manual session: ${newSession.startTime} - ${newSession.endTime}`
    });

    // Add to sessions
    const sessionData = {
      id: Date.now().toString(),
      skillId: newSession.skillId,
      date: newSession.date,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      totalHours: Math.round(durationHours * 100) / 100,
      notes: newSession.notes,
      intervals: [{ start: startDateTime.getTime(), end: endDateTime.getTime() }]
    };
    
    useAppStore.setState(state => ({
      sessions: [...state.sessions, sessionData]
    }));

    setNewSession({
      skillId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      pauses: 0,
      notes: ''
    });
    setShowAddSession(false);
    showToast('Session added successfully', 'success');
  };



  const getSessionIntervals = (session: any) => {
    const intervals = session.intervals || [];
    let totalPauses = 0;
    let pauseDuration = 0;

    for (let i = 0; i < intervals.length - 1; i++) {
      if (intervals[i].end && intervals[i + 1].start) {
        totalPauses++;
        pauseDuration += intervals[i + 1].start - intervals[i].end;
      }
    }

    return { totalPauses, pauseDuration: Math.floor(pauseDuration / 1000 / 60) };
  };

  const getFilterDate = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    switch (dateFilter) {
      case 'today': return today;
      case 'yesterday': return yesterday;
      case 'custom': return customDate;
      default: return null;
    }
  };

  const filteredSessions = sessions.filter(session => {
    const skillMatch = skillFilter === '' || session.skillId === skillFilter;
    const filterDate = getFilterDate();
    const dateMatch = !filterDate || session.date === filterDate;
    return skillMatch && dateMatch;
  });
  const sortedSessions = [...filteredSessions].sort((a, b) => b.endTime - a.endTime);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Title and Add Button Row */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Sessions</h1>
          <motion.button
            onClick={() => setShowAddSession(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} />
            Add Session
          </motion.button>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm flex-1 min-w-0"
          >
            <option value="">All Skills</option>
            {skills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm flex-1 min-w-0"
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="custom">Custom</option>
          </select>
          {dateFilter === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm flex-1 min-w-0"
            />
          )}
          <div className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
            {sortedSessions.length}
          </div>
        </div>
      </motion.div>

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-lg font-semibold mb-4">Add New Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                <select
                  value={newSession.skillId}
                  onChange={(e) => setNewSession({...newSession, skillId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a skill</option>
                  {skills.map(skill => (
                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                  placeholder="Add notes about this session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddSession(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewSession}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Session
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {sortedSessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow p-8 text-center"
        >
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Yet</h3>
          <p className="text-gray-600">Start using the timer to track your work sessions.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {sortedSessions.map((session, index) => {
              const { totalPauses, pauseDuration } = getSessionIntervals(session);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-lg shadow hover:shadow-md transition-shadow ${
                    index % 4 === 0 ? 'bg-blue-50 border-l-4 border-blue-500' :
                    index % 4 === 1 ? 'bg-green-50 border-l-4 border-green-500' :
                    index % 4 === 2 ? 'bg-purple-50 border-l-4 border-purple-500' :
                    'bg-orange-50 border-l-4 border-orange-500'
                  }`}
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Session Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getSkillName(session.skillId)}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar size={14} className="mr-1" />
                            {session.date}
                          </div>
                        </div>
                        
                        {/* Mobile: Compact 2-column layout */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
                          <div className="bg-white/60 p-2 md:p-3 rounded-lg">
                            <div className="flex items-center gap-1 mb-1">
                              <Play size={12} className="text-green-600" />
                              <span className="text-gray-600 font-medium hidden sm:inline">Start</span>
                            </div>
                            <span className="font-semibold text-gray-900 text-xs md:text-sm">
                              {new Date(session.startTime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                          <div className="bg-white/60 p-2 md:p-3 rounded-lg">
                            <div className="flex items-center gap-1 mb-1">
                              <Square size={12} className="text-red-600" />
                              <span className="text-gray-600 font-medium hidden sm:inline">End</span>
                            </div>
                            <span className="font-semibold text-gray-900 text-xs md:text-sm">
                              {new Date(session.endTime).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                          <div className="bg-white/60 p-2 md:p-3 rounded-lg">
                            <div className="flex items-center gap-1 mb-1">
                              <Clock size={12} className="text-blue-600" />
                              <span className="text-gray-600 font-medium hidden sm:inline">Duration</span>
                            </div>
                            <span className="font-semibold text-blue-600 text-xs md:text-sm">
                              {formatDuration(session.totalHours)}
                            </span>
                          </div>
                          <div className="bg-white/60 p-2 md:p-3 rounded-lg">
                            <div className="flex items-center gap-1 mb-1">
                              <Pause size={12} className="text-yellow-600" />
                              <span className="text-gray-600 font-medium hidden sm:inline">Pauses</span>
                            </div>
                            <span className="font-semibold text-gray-900 text-xs md:text-sm">
                              {totalPauses}<span className="hidden sm:inline"> ({pauseDuration}m)</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notes Section - Mobile: Full width, Desktop: Side panel */}
                      <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-200 pt-3 lg:pt-0 lg:pl-4 bg-white/60 rounded-lg lg:rounded-none p-2 lg:p-0 lg:bg-transparent">
                        {editingNote === session.id ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-3"
                          >
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add notes..."
                              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-xs md:text-sm"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleSaveNote(session.id)}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Save
                              </motion.button>
                              <motion.button
                                onClick={handleCancelEdit}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs md:text-sm text-gray-600">Notes</span>
                              <motion.button
                                onClick={() => handleEditNote(session.id, session.notes)}
                                className="text-gray-400 hover:text-blue-600 p-1"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                {session.notes ? <Edit3 size={14} /> : <Plus size={14} />}
                              </motion.button>
                            </div>
                            {session.notes ? (
                              <motion.p 
                                className="text-xs md:text-sm text-gray-700 bg-gray-50 p-2 rounded-lg line-clamp-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {session.notes}
                              </motion.p>
                            ) : (
                              <motion.p 
                                className="text-xs md:text-sm text-gray-400 italic"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                No notes
                              </motion.p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};