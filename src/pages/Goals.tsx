import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Plus,
  CheckCircle,
  Trash2,
  PlusCircle,
  Edit,
  Star,
  Filter,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "../store/appStore";
import { SecondChanceTile } from "../components/SecondChanceTile";
import { ExpiredGoalTile } from "../components/ExpiredGoalTile";
import { ContinueGoalModal } from "../components/ContinueGoalModal";
import { GOAL_MESSAGES, GOAL_PROGRESS_THRESHOLDS } from "../constants/goalMessages";

export const Goals = () => {
  const { skills, goals, entries, addGoal, updateGoal, deleteGoal, addSkill } =
    useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [newSkillName, setNewSkillName] = useState("");
  const [filter, setFilter] = useState<
    "all" | "pending" | "in-progress" | "completed"
  >("in-progress");
  const [completionNote, setCompletionNote] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingGoal, setCompletingGoal] = useState<any>(null);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [continuingGoal, setContinuingGoal] = useState<any>(null);
  const [newDeadline, setNewDeadline] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState<any>(null);
  const [formData, setFormData] = useState({
    skillId: "",
    title: "",
    description: "",
    targetHours: "",
    dailyTarget: "",
    deadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.skillId ||
      !formData.title ||
      !formData.targetHours ||
      !formData.dailyTarget ||
      !formData.deadline
    )
      return;

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          skillId: formData.skillId,
          title: formData.title,
          description: formData.description,
          targetHours: parseFloat(formData.targetHours),
          dailyTarget: parseFloat(formData.dailyTarget),
          deadline: formData.deadline,
        });
      } else {
        await addGoal({
          skillId: formData.skillId,
          title: formData.title,
          description: formData.description,
          targetHours: parseFloat(formData.targetHours),
          dailyTarget: parseFloat(formData.dailyTarget),
          deadline: formData.deadline,
        });
      }

      setFormData({
        skillId: "",
        title: "",
        description: "",
        targetHours: "",
        dailyTarget: "",
        deadline: "",
      });
      setEditingGoal(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save goal:', error);
      // Goal creation failed, form stays open so user can retry
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    
    try {
      await addSkill(newSkillName.trim());
      setNewSkillName("");
      setShowSkillForm(false);
    } catch (error) {
      console.error('Failed to add skill:', error);
      // Skill creation failed, form stays open so user can retry
    }
  };

  const handleEditGoal = (goal: any) => {
    setFormData({
      skillId: goal.skillId,
      title: goal.title,
      description: goal.description || "",
      targetHours: goal.targetHours.toString(),
      dailyTarget: goal.dailyTarget?.toString() || "",
      deadline: goal.deadline,
    });
    setEditingGoal(goal);
    setShowForm(true);
  };

  const getGoalEntries = (goal: any) => {
    const goalCreatedDate = goal.createdAt ? goal.createdAt.split("T")[0] : null;
    return entries.filter((entry) => {
      const matchesSkill = entry.skillId === goal.skillId;
      const matchesGoalDate = !goalCreatedDate || entry.date >= goalCreatedDate;
      return matchesSkill && matchesGoalDate;
    });
  };

  const getTodayHours = (skillId: string, goalCreatedAt?: string) => {
    const today = new Date().toISOString().split("T")[0];
    return entries
      .filter((entry) => {
        const matchesSkill = entry.skillId === skillId;
        const matchesDate = entry.date === today;
        const matchesGoalDate = !goalCreatedAt || entry.date >= goalCreatedAt.split("T")[0];
        return matchesSkill && matchesDate && matchesGoalDate;
      })
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getDailyStatus = (goal: any) => {
    const todayHours = getTodayHours(goal.skillId, goal.createdAt);
    const dailyTarget = goal.dailyTarget || 0;

    if (todayHours >= dailyTarget * GOAL_PROGRESS_THRESHOLDS.DAILY_EXCELLENT) return "excellent";
    if (todayHours >= dailyTarget) return "completed";
    if (todayHours >= dailyTarget * GOAL_PROGRESS_THRESHOLDS.DAILY_CLOSE) return "close";
    return "behind";
  };

  const getProgressForGoal = (goal: any) => {
    const skillEntries = getGoalEntries(goal);
    const totalHours = skillEntries.reduce(
      (sum, entry) => sum + entry.hours,
      0
    );
    return Math.min((totalHours / goal.targetHours) * 100, 100);
  };

  const getGoalStatus = (goal: any) => {
    const today = new Date().toISOString().split("T")[0];
    const deadline = new Date(goal.deadline).toISOString().split("T")[0];
    
    // If deadline has passed and goal is not manually completed, show in pending
    if (deadline <= today && !goal.completed) {
      return "pending";
    }
    
    // If goal is completed, show in completed
    if (goal.completed) return "completed";
    
    // For active goals, check progress
    const progress = getProgressForGoal(goal);
    if (progress > 0) return "in-progress";
    return "pending";
  };

  // Remove auto-deletion of expired goals
  // Goals with passed deadlines will show in pending filter

  const handleContinueGoal = (goal: any) => {
    setContinuingGoal(goal);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewDeadline(tomorrow.toISOString().split('T')[0]);
    setShowContinueModal(true);
  };

  const handleDeleteGoal = (goal: any) => {
    setDeletingGoal(goal);
    setShowDeleteModal(true);
  };

  const confirmDeleteGoal = () => {
    if (deletingGoal) {
      deleteGoal(deletingGoal.id);
    }
    setShowDeleteModal(false);
    setDeletingGoal(null);
  };

  const submitContinueGoal = () => {
    if (continuingGoal && newDeadline) {
      updateGoal(continuingGoal.id, {
        deadline: newDeadline,
        secondChance: true
      });
    }
    setShowContinueModal(false);
    setContinuingGoal(null);
    setNewDeadline("");
  };

  const handleCompleteGoal = (goal: any) => {
    const progress = getProgressForGoal(goal);
    
    if (progress < 100) {
      const goalEntries = getGoalEntries(goal);
      const remainingHours = (goal.targetHours - goalEntries.reduce((sum, e) => sum + e.hours, 0)).toFixed(1);
      alert(GOAL_MESSAGES.INCOMPLETE_GOAL(parseFloat(remainingHours)));
      return;
    }
    
    setCompletingGoal(goal);
    setShowCompletionModal(true);
  };

  const submitCompletion = () => {
    if (completingGoal) {
      updateGoal(completingGoal.id, {
        completed: true,
        completionNote: completionNote || undefined,
      });
    }
    setShowCompletionModal(false);
    setCompletingGoal(null);
    setCompletionNote("");
  };

  const filteredGoals = goals.filter((goal) => {
    if (filter === "all") return true;
    const status = getGoalStatus(goal);
    return status === filter;
  });



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="text-blue-600" />
          Goals
        </h1>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-600" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Goals</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setFormData({
                skillId: "",
                title: "",
                description: "",
                targetHours: "",
                dailyTarget: "",
                deadline: "",
              });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Goal
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div
          className="bg-white rounded-lg shadow p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Skill</label>
                <div className="flex gap-2">
                  <select
                    value={formData.skillId}
                    onChange={(e) =>
                      setFormData({ ...formData, skillId: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a skill</option>
                    {skills.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowSkillForm(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                  >
                    <PlusCircle size={16} />
                    Add
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Hours
                </label>
                <input
                  type="number"
                  value={formData.targetHours}
                  onChange={(e) =>
                    setFormData({ ...formData, targetHours: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Daily Target (hours)
                </label>
                <input
                  type="number"
                  value={formData.dailyTarget}
                  onChange={(e) =>
                    setFormData({ ...formData, dailyTarget: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingGoal ? "Update Goal" : "Create Goal"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingGoal(null);
                  setFormData({
                    skillId: "",
                    title: "",
                    description: "",
                    targetHours: "",
                    dailyTarget: "",
                    deadline: "",
                  });
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {showSkillForm && (
        <motion.div
          className="bg-white rounded-lg shadow p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Enter skill name"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Skill
            </button>
            <button
              type="button"
              onClick={() => setShowSkillForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">🗑️ Delete Goal</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deletingGoal?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingGoal(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGoal}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Goal
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ContinueGoalModal
        show={showContinueModal}
        goal={continuingGoal}
        newDeadline={newDeadline}
        onDeadlineChange={setNewDeadline}
        onSubmit={submitContinueGoal}
        onCancel={() => {
          setShowContinueModal(false);
          setContinuingGoal(null);
          setNewDeadline("");
        }}
      />

      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">{GOAL_MESSAGES.COMPLETION.title}</h3>
            <p className="text-gray-600 mb-4">
              {completingGoal && (() => {
                const goalEntries = getGoalEntries(completingGoal);
                const totalHours = Number(goalEntries.reduce((sum, e) => sum + e.hours, 0).toFixed(1));
                return GOAL_MESSAGES.COMPLETION.message(completingGoal.title, totalHours);
              })()}
            </p>
            <p className="text-gray-600 mb-4">
              {GOAL_MESSAGES.COMPLETION.notePrompt}
            </p>
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="What did you learn? How do you feel? Any reflections..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setCompletingGoal(null);
                  setCompletionNote("");
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitCompletion}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Complete Goal
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid gap-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target size={48} className="mx-auto mb-4 opacity-50" />
            <p>
              {filter === "all"
                ? "No goals yet. Create your first goal to start tracking progress!"
                : `No ${filter.replace('-', ' ')} goals found.`}
            </p>
            {filter !== "all" && goals.length > 0 && (
              <p className="text-sm mt-2">
                Try selecting "All Goals" to see all your goals.
              </p>
            )}
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const skill = skills.find((s) => s.id === goal.skillId);
            const progress = getProgressForGoal(goal);

            const dailyStatus = getDailyStatus(goal);
            const todayHours = getTodayHours(goal.skillId, goal.createdAt);

            return (
              <motion.div
                key={goal.id}
                className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  dailyStatus === "excellent"
                    ? "bg-gradient-to-br from-yellow-50 via-white to-yellow-50"
                    : dailyStatus === "completed"
                    ? "bg-gradient-to-br from-green-50 via-white to-green-50"
                    : dailyStatus === "close"
                    ? "bg-gradient-to-br from-amber-50 via-white to-amber-50"
                    : "bg-gradient-to-br from-red-50 via-white to-red-50"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${
                    dailyStatus === "excellent"
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                      : dailyStatus === "completed"
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : dailyStatus === "close"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500"
                      : "bg-gradient-to-r from-red-400 to-red-500"
                  }`}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                          {skill?.name}
                        </div>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full"></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-gray-800">
                            {goal.title}
                          </h3>
                          {dailyStatus === "excellent" && (
                            <Star
                              size={14}
                              className="fill-yellow-500 text-yellow-500"
                            />
                          )}
                          {goal.completed && (
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          )}
                        </div>

                      </div>
                    </div>
                    <div className="flex gap-1">
                      {(() => {
                        const today = new Date().toISOString().split("T")[0];
                        const deadline = new Date(goal.deadline).toISOString().split("T")[0];
                        const isExpired = deadline <= today && !goal.completed;
                        
                        if (isExpired) {
                          return (
                            <motion.button
                              onClick={() => handleContinueGoal(goal)}
                              className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 text-sm font-medium"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <RotateCcw size={16} />
                              Continue Goal
                            </motion.button>
                          );
                        }
                        return null;
                      })()}
                      
                      <motion.button
                        onClick={() =>
                          goal.completed
                            ? updateGoal(goal.id, { completed: false })
                            : handleCompleteGoal(goal)
                        }
                        className={`p-1.5 rounded-full ${
                          goal.completed
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <CheckCircle size={14} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleEditGoal(goal)}
                        className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit size={14} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteGoal(goal)}
                        className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </div>
                  
                  <SecondChanceTile show={!!goal.secondChance} />
                  
                  <ExpiredGoalTile goal={goal} progress={progress} />
                  
                  <div className="bg-white/50 rounded-lg p-2">


                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            Overall Progress
                          </span>
                          <span className="text-xs font-bold text-gray-700">
                            {getGoalEntries(goal)
                              .reduce((sum, e) => sum + e.hours, 0)
                              .toFixed(1)}
                            h / {goal.targetHours}h ({progress.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`h-2 rounded-full ${
                              goal.completed
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : progress >= 100
                                ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                : "bg-gradient-to-r from-blue-300 to-blue-400"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600">
                              Daily Target
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              dailyStatus === "excellent"
                                ? "bg-yellow-100 text-yellow-700"
                                : dailyStatus === "completed"
                                ? "bg-green-100 text-green-700"
                                : dailyStatus === "close"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {GOAL_MESSAGES.DAILY_STATUS[dailyStatus as keyof typeof GOAL_MESSAGES.DAILY_STATUS]}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-700">
                            {todayHours.toFixed(1)}h / {goal.dailyTarget || 0}h
                            (
                            {(
                              (todayHours / (goal.dailyTarget || 1)) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`h-2 rounded-full ${
                              dailyStatus === "excellent"
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                : dailyStatus === "completed"
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : dailyStatus === "close"
                                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                : "bg-gradient-to-r from-red-400 to-red-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                (todayHours / (goal.dailyTarget || 1)) * 100,
                                100
                              )}%`,
                            }}
                            transition={{
                              duration: 1,
                              ease: "easeOut",
                              delay: 0.2,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {getGoalEntries(goal)
                            .reduce((sum, e) => sum + e.hours, 0)
                            .toFixed(1)}
                          h of {goal.targetHours}h total
                        </span>
                        <span>{todayHours.toFixed(1)}h today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
