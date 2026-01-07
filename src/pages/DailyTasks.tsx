import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { useAppStore } from "../store/appStore";
import { getLocalDateString, parseLocalDate } from "../utils/dateUtils";
import { TaskHistory } from "../components/TaskHistory";

export const DailyTasks = () => {
  const {
    dailyTasks: allTasks,
    dailyTaskLogs,
    addDailyTask,
    toggleDailyTask,
    deleteDailyTask,
    saveDailyLog,
  } = useAppStore();

  // Filter tasks for today only
  const today = getLocalDateString();
  const todayTasks = allTasks.filter((task) => {
    const taskDate = parseLocalDate(task.createdAt);
    return taskDate === today;
  });

  // Sort tasks: unchecked first (by creation time), then checked (by completion time)
  const dailyTasks = [...todayTasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;

    if (!a.completed && !b.completed) {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }

    if (a.completed && b.completed) {
      const aCompletedTime = a.completedAt
        ? new Date(a.completedAt).getTime()
        : 0;
      const bCompletedTime = b.completedAt
        ? new Date(b.completedAt).getTime()
        : 0;
      return aCompletedTime - bCompletedTime;
    }

    return 0;
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"today" | "history">("today");
  const [newTask, setNewTask] = useState({ title: "" });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTask, setEditTask] = useState({ title: "" });

  useEffect(() => {
    saveDailyLog();
  }, [saveDailyLog]); // Remove dailyTasks dependency to prevent infinite loop

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    addDailyTask({
      title: newTask.title.trim(),
    });

    setNewTask({ title: "" });
    // Keep form open and focus on input
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task.id);
    setEditTask({ title: task.title });
  };

  const handleSaveEdit = () => {
    if (!editTask.title.trim()) return;

    // Update task in store (we need to add this action)
    const updatedTasks = dailyTasks.map((task) =>
      task.id === editingTask
        ? {
            ...task,
            title: editTask.title.trim(),
          }
        : task
    );

    useAppStore.setState(() => ({ dailyTasks: updatedTasks }));

    setEditingTask(null);
    setEditTask({ title: "" });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTask({ title: "" });
  };

  const getTodayStats = () => {
    const completed = dailyTasks.filter((task) => task.completed).length;
    const total = dailyTasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const getConsistencyStats = () => {
    const last7Days = dailyTaskLogs.slice(-7);
    const last30Days = dailyTaskLogs.slice(-30);

    const avg7Days =
      last7Days.length > 0
        ? last7Days.reduce((sum, log) => sum + log.completionRate, 0) /
          last7Days.length
        : 0;

    const avg30Days =
      last30Days.length > 0
        ? last30Days.reduce((sum, log) => sum + log.completionRate, 0) /
          last30Days.length
        : 0;

    return { avg7Days, avg30Days, streak: calculateStreak() };
  };

  const calculateStreak = () => {
    let streak = 0;
    const sortedLogs = [...dailyTaskLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const log of sortedLogs) {
      if (log.completionRate >= 80) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const todayStats = getTodayStats();
  const consistencyStats = getConsistencyStats();

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="text-blue-600" />
          Daily Tasks
        </h1>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("today")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "today"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode("history")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "history"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {viewMode === "today" ? (
        <>
          {/* Today's Stats */}
          <div className="bg-white rounded-lg shadow p-3">
            <div className="flex justify-between items-center text-center">
              <div className="flex-1">
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-sm font-bold text-green-600">
                  {todayStats.completed}/{todayStats.total}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Progress</p>
                <p className="text-sm font-bold text-blue-600">
                  {todayStats.percentage.toFixed(0)}%
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">7-Day</p>
                <p className="text-sm font-bold text-purple-600">
                  {consistencyStats.avg7Days.toFixed(0)}%
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Streak</p>
                <p className="text-sm font-bold text-orange-600">
                  {consistencyStats.streak}d
                </p>
              </div>
            </div>
          </div>

          {/* Add Task Form */}
          {showAddForm && (
            <motion.div
              className="bg-white rounded-lg shadow p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ title: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTask(e);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title..."
                    autoFocus
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTask({ title: "" });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Today's Tasks */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today's Tasks</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 text-sm"
              >
                <Plus size={14} />
                Add Task
              </button>
            </div>
            <div className="p-4">
              {dailyTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tasks for today. Add your first task to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {dailyTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          task.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <button
                          onClick={() => toggleDailyTask(task.id)}
                          className={`mt-0.5 transition-colors ${
                            task.completed
                              ? "text-green-600"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {task.completed ? (
                            <CheckSquare size={20} />
                          ) : (
                            <Square size={20} />
                          )}
                        </button>
                        <div className="flex-1">
                          {editingTask === task.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editTask.title}
                                onChange={(e) =>
                                  setEditTask({
                                    title: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3
                                className={`font-medium ${
                                  task.completed
                                    ? "line-through text-gray-500"
                                    : "text-gray-900"
                                }`}
                              >
                                {task.title}
                              </h3>
                              {task.description && (
                                <p
                                  className={`text-sm mt-1 ${
                                    task.completed
                                      ? "line-through text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {task.description}
                                </p>
                              )}
                              {task.completedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  Completed at{" "}
                                  {new Date(
                                    task.completedAt
                                  ).toLocaleTimeString()}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {editingTask !== task.id && (
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-blue-400 hover:text-blue-600 p-1"
                            >
                              <Edit size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteDailyTask(task.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <TaskHistory />
      )}
    </div>
  );
};
