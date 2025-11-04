import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  Edit,
} from "lucide-react";
import { useAppStore } from "../store/appStore";

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
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = allTasks.filter((task) => {
    const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTask, setEditTask] = useState({ title: "", description: "" });

  useEffect(() => {
    saveDailyLog();
  }, [saveDailyLog]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    addDailyTask({
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
    });

    setNewTask({ title: "", description: "" });
    setShowAddForm(false);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task.id);
    setEditTask({ title: task.title, description: task.description || "" });
  };

  const handleSaveEdit = () => {
    if (!editTask.title.trim()) return;

    // Update task in store (we need to add this action)
    const updatedTasks = dailyTasks.map((task) =>
      task.id === editingTask
        ? {
            ...task,
            title: editTask.title.trim(),
            description: editTask.description.trim() || undefined,
          }
        : task
    );

    useAppStore.setState(() => ({ dailyTasks: updatedTasks }));

    setEditingTask(null);
    setEditTask({ title: "", description: "" });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTask({ title: "", description: "" });
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

  const getHistoryData = () => {
    return [...dailyTaskLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);
  };

  const getSelectedDateData = (date: string) => {
    const log = dailyTaskLogs.find((log) => log.date === date);
    if (!log) return null;

    const completed = log.tasks.filter((task) => task.completed).length;
    const total = log.tasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    // Sort tasks same way as today: unchecked first, checked last
    const sortedTasks = [...log.tasks].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;

      if (!a.completed && !b.completed) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
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

    return { ...log, tasks: sortedTasks, completed, total, percentage };
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
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Add details about this task..."
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
                    onClick={() => setShowAddForm(false)}
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
                                    ...editTask,
                                    title: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <textarea
                                value={editTask.description}
                                onChange={(e) =>
                                  setEditTask({
                                    ...editTask,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={2}
                                placeholder="Description (optional)"
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
        <>
          {/* History View */}
          {selectedDate ? (
            <>
              {/* Selected Date Detail View */}
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to History
                </button>
                <h2 className="text-xl font-semibold">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>

              {(() => {
                const dateData = getSelectedDateData(selectedDate);
                if (!dateData) return <div>No data for this date</div>;

                return (
                  <>
                    {/* Date Stats */}
                    <div className="bg-white rounded-lg shadow p-3 mb-4">
                      <div className="flex justify-between items-center text-center">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Completed</p>
                          <p className="text-sm font-bold text-green-600">
                            {dateData.completed}/{dateData.total}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Progress</p>
                          <p className="text-sm font-bold text-blue-600">
                            {dateData.percentage.toFixed(0)}%
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">Total</p>
                          <p className="text-sm font-bold text-purple-600">
                            {dateData.total}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date Tasks */}
                    <div className="bg-white rounded-lg shadow">
                      <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold">
                          Tasks for this day
                        </h3>
                      </div>
                      <div className="p-4">
                        {dateData.tasks.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <CheckSquare
                              size={48}
                              className="mx-auto mb-4 opacity-50"
                            />
                            <p>No tasks recorded for this day</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {dateData.tasks.map((task: any) => (
                              <div
                                key={task.id}
                                className={`flex items-start gap-3 p-3 rounded-lg border ${
                                  task.completed
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div
                                  className={`mt-0.5 ${
                                    task.completed
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {task.completed ? (
                                    <CheckSquare size={20} />
                                  ) : (
                                    <Square size={20} />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h4
                                    className={`font-medium ${
                                      task.completed
                                        ? "line-through text-gray-500"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {task.title}
                                  </h4>
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
                                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                    <span>
                                      Created:{" "}
                                      {new Date(
                                        task.createdAt
                                      ).toLocaleTimeString()}
                                    </span>
                                    {task.completedAt && (
                                      <span className="text-green-600">
                                        Completed:{" "}
                                        {new Date(
                                          task.completedAt
                                        ).toLocaleTimeString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <>
              {/* History List View */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Task History</h2>
                <div className="space-y-3">
                  {getHistoryData().map((item: any) => (
                    <div
                      key={item.date}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => setSelectedDate(item.date)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(item.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.tasks.filter((t: any) => t.completed).length}/
                          {item.tasks.length} tasks completed
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.completionRate >= 80
                                ? "bg-green-500"
                                : item.completionRate >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${item.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-10 text-right">
                          {item.completionRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                  {getHistoryData().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No task history available yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
