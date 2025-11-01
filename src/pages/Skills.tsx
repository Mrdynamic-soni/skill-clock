import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, useSkills, type Priority } from "../store/appStore";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../hooks/useToast";

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

export const Skills = () => {
  const [skillName, setSkillName] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deleteSkillId, setDeleteSkillId] = useState<string | null>(null);
  const [editingSkill, setEditingSkill] = useState<{
    id: string;
    name: string;
    priority: Priority;
  } | null>(null);

  const { addSkill, updateSkill, deleteSkill } = useAppStore();
  const skills = useSkills();
  const { showToast } = useToast();

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    const exists = skills.some(
      (skill) => skill.name.toLowerCase() === skillName.trim().toLowerCase()
    );

    if (exists) {
      showToast("Skill already exists", "error");
      return;
    }

    addSkill(skillName, priority);
    setSkillName("");
    setPriority("medium");
    showToast("Skill added successfully", "success");
  };

  const handleDeleteSkill = () => {
    if (deleteSkillId) {
      deleteSkill(deleteSkillId);
      setDeleteSkillId(null);
      showToast("Skill deleted successfully", "success");
    }
  };

  const handleEditSkill = (skill: {
    id: string;
    name: string;
    priority: Priority;
  }) => {
    setEditingSkill(skill);
  };

  const handleUpdateSkill = () => {
    if (editingSkill) {
      updateSkill(editingSkill.id, {
        name: editingSkill.name,
        priority: editingSkill.priority,
      });
      setEditingSkill(null);
      showToast("Skill updated successfully", "success");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <motion.div
        className="bg-white rounded-lg shadow p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4">Add New Skill</h2>
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Enter skill name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <motion.button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} />
              Add Skill
            </motion.button>
          </div>
        </form>
      </motion.div>

      <motion.div
        className="bg-white rounded-lg shadow p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-4">Your Skills</h2>
        {skills.length === 0 ? (
          <motion.p
            className="text-gray-500 text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            No skills added yet. Add your first skill above!
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <AnimatePresence>
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-3 md:px-4 py-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm md:text-base">
                      {skill.name}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full border ${
                        priorityColors[skill.priority]
                      }`}
                    >
                      {skill.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      onClick={() => handleEditSkill(skill)}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit3 size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => setDeleteSkillId(skill.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        isOpen={!!deleteSkillId}
        onClose={() => setDeleteSkillId(null)}
        onConfirm={handleDeleteSkill}
        title="Delete Skill"
        message="This will delete the skill and all related entries. This action cannot be undone."
      />

      {editingSkill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-lg font-semibold mb-4">Edit Skill</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editingSkill.name}
                onChange={(e) =>
                  setEditingSkill({ ...editingSkill, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={editingSkill.priority}
                onChange={(e) =>
                  setEditingSkill({
                    ...editingSkill,
                    priority: e.target.value as Priority,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingSkill(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSkill}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
