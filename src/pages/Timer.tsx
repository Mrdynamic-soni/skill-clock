import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, useSkills } from "../store/appStore";
import { Play, Pause, Square, Clock } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { SessionNoteDialog } from "../components/SessionNoteDialog";

export const Timer = () => {
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const { activeTimer, startTimer, stopTimer, resumeTimer, endTimer } =
    useAppStore();
  const skills = useSkills();
  const { showToast } = useToast();

  useEffect(() => {
    let interval: number;

    if (activeTimer?.isRunning) {
      interval = setInterval(() => {
        // Force re-render to update display
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer?.isRunning, activeTimer?.startTime]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const format12Hour = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getCurrentElapsed = () => {
    if (!activeTimer) return 0;
    if (!activeTimer.isRunning) return activeTimer.elapsedTime;
    const now = Date.now();
    const currentSession = Math.floor((now - activeTimer.startTime) / 1000);
    return activeTimer.elapsedTime + currentSession;
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    if (!selectedSkillId) {
      showToast("Please select a skill first", "error");
      return;
    }
    startTimer(selectedSkillId);
    showToast("Timer started", "success");
  };

  const handleStop = () => {
    stopTimer();
    showToast("Timer paused", "info");
  };

  const handleResume = () => {
    resumeTimer();
    showToast("Timer resumed", "success");
  };

  const handleEnd = () => {
    setShowNoteDialog(true);
  };

  const handleEndWithNote = (notes?: string) => {
    endTimer(notes);
    setShowNoteDialog(false);
    showToast("Session completed and logged", "success");
    setSelectedSkillId("");
  };

  const handleSkipNote = () => {
    handleEndWithNote();
  };

  const getSelectedSkillName = () => {
    return (
      skills.find(
        (skill) => skill.id === (activeTimer?.skillId || selectedSkillId)
      )?.name || ""
    );
  };

  return (
    <div className="h-screen flex flex-col p-4">
      {/* Real Time Clock - Centered */}
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl shadow-xl p-8 text-white mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock size={24} className="text-green-400" />
            <h2 className="text-xl font-semibold">Current Time</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <div className="bg-black rounded-xl p-4 sm:p-6 shadow-inner border border-gray-600">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-green-400">
                {(currentTime.getHours() % 12 || 12)
                  .toString()
                  .padStart(2, "0")}
              </span>
            </div>
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400 animate-pulse">
              :
            </span>
            <div className="bg-black rounded-xl p-4 sm:p-6 shadow-inner border border-gray-600">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-green-400">
                {currentTime.getMinutes().toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-400 animate-pulse">
              :
            </span>
            <div className="bg-black rounded-xl p-4 sm:p-6 shadow-inner border border-gray-600">
              <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-green-400">
                {currentTime.getSeconds().toString().padStart(2, "0")}
              </span>
            </div>
            <div className="bg-black rounded-xl p-4 sm:p-6 shadow-inner border border-gray-600 ml-2">
              <span className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-green-400">
                {currentTime.getHours() >= 12 ? "PM" : "AM"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {/* Timer Section */}
        <div className="space-y-4 ">
          {/* Skill Selection */}

          {/* Timer Display */}
          <motion.div
            className="bg-white rounded-lg shadow p-6 md:p-8 text-center h-full "
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence>
              {!activeTimer && (
                <motion.div
                  className="p-4 md:p-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-lg font-semibold mb-4">Select Skill</h2>
                  {skills.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No skills available. Please add skills first.
                    </p>
                  ) : (
                    <select
                      value={selectedSkillId}
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a skill...</option>
                      {skills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
              {activeTimer ? getSelectedSkillName() : "No Active Session"}
            </h2>

            <motion.div
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="text-4xl md:text-6xl font-mono font-bold text-blue-600 mb-2"
                key={getCurrentElapsed()}
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.3 }}
              >
                {formatTime(getCurrentElapsed())}
              </motion.div>
            </motion.div>

            <motion.div
              className="mb-8 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <p className="text-gray-500 text-lg">
                {activeTimer?.isRunning ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-green-600 font-semibold"
                  >
                    🔴 Recording Session
                  </motion.span>
                ) : activeTimer ? (
                  <span className="text-yellow-600 font-semibold">
                    ⏸️ Session Paused
                  </span>
                ) : (
                  <span className="text-gray-600">Ready to start tracking</span>
                )}
              </p>
            </motion.div>

            {/* Timer Controls */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <AnimatePresence mode="wait">
                {!activeTimer ? (
                  <motion.button
                    key="start"
                    onClick={handleStart}
                    disabled={!selectedSkillId}
                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play size={20} className="mr-2" />
                    Start
                  </motion.button>
                ) : (
                  <>
                    {activeTimer.isRunning ? (
                      <motion.button
                        key="stop"
                        onClick={handleStop}
                        className="flex items-center justify-center px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Pause size={20} className="mr-2" />
                        Stop
                      </motion.button>
                    ) : (
                      <motion.button
                        key="resume"
                        onClick={handleResume}
                        className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play size={20} className="mr-2" />
                        Resume
                      </motion.button>
                    )}

                    <motion.button
                      onClick={handleEnd}
                      className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Square size={20} className="mr-2" />
                      End Session
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Session Info - Right Column */}
        <AnimatePresence>
          {activeTimer && (
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg shadow-lg p-4 md:p-6 h-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-semibold mb-4 text-blue-800 flex items-center gap-2 mb-8">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                Current Session
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <motion.div
                  className="bg-white/70 p-3 rounded-lg border border-blue-100"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-blue-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Skill:
                  </span>
                  <p className="font-semibold text-gray-800 mt-1">
                    {getSelectedSkillName()}
                  </p>
                </motion.div>
                <motion.div
                  className="bg-white/70 p-3 rounded-lg border border-green-100"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Started:
                  </span>
                  <p className="font-semibold text-gray-800 mt-1">
                    {format12Hour(
                      new Date(
                        activeTimer.intervals[0]?.start || activeTimer.startTime
                      )
                    )}
                  </p>
                </motion.div>
                <motion.div
                  className="bg-white/70 p-3 rounded-lg border border-purple-100"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-purple-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Status:
                  </span>
                  <p className="font-semibold flex items-center mt-1">
                    <motion.span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        activeTimer.isRunning ? "bg-green-500" : "bg-yellow-500"
                      }`}
                      animate={
                        activeTimer.isRunning ? { scale: [1, 1.3, 1] } : {}
                      }
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                    <span
                      className={
                        activeTimer.isRunning
                          ? "text-green-700"
                          : "text-yellow-700"
                      }
                    >
                      {activeTimer.isRunning ? "Running" : "Paused"}
                    </span>
                  </p>
                </motion.div>
                <motion.div
                  className="bg-white/70 p-3 rounded-lg border border-orange-100"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-orange-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Duration:
                  </span>
                  <p className="font-bold text-orange-700 text-lg mt-1">
                    {formatTime(getCurrentElapsed())}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SessionNoteDialog
        isOpen={showNoteDialog}
        onClose={() => setShowNoteDialog(false)}
        onSkip={handleSkipNote}
        onAddNote={handleEndWithNote}
      />
    </div>
  );
};
