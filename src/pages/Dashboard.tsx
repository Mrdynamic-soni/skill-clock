import { useState } from 'react';
import { useAppStore, useSkills, useEntries } from '../store/appStore';
import { Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../hooks/useToast';

export const Dashboard = () => {
  const [skillName, setSkillName] = useState('');
  const [entryForm, setEntryForm] = useState({
    date: new Date().toISOString().split('T')[0],
    skillId: '',
    hours: '',
    notes: '',
  });
  const [deleteSkillId, setDeleteSkillId] = useState<string | null>(null);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  const { addSkill, deleteSkill, addEntry, deleteEntry } = useAppStore();
  const skills = useSkills();
  const entries = useEntries();
  const { showToast } = useToast();

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    
    const exists = skills.some(skill => 
      skill.name.toLowerCase() === skillName.trim().toLowerCase()
    );
    
    if (exists) {
      showToast('Skill already exists', 'error');
      return;
    }
    
    addSkill(skillName);
    setSkillName('');
    showToast('Skill added successfully', 'success');
  };

  const handleDeleteSkill = () => {
    if (deleteSkillId) {
      deleteSkill(deleteSkillId);
      setDeleteSkillId(null);
      showToast('Skill deleted successfully', 'success');
    }
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(entryForm.hours);
    
    if (!entryForm.skillId || isNaN(hours) || hours < 0 || hours > 24) {
      showToast('Please fill all required fields with valid values', 'error');
      return;
    }

    addEntry({
      date: entryForm.date,
      skillId: entryForm.skillId,
      hours,
      notes: entryForm.notes || undefined,
    });

    setEntryForm({
      date: new Date().toISOString().split('T')[0],
      skillId: '',
      hours: '',
      notes: '',
    });
    showToast('Entry added successfully', 'success');
  };

  const handleDeleteEntry = () => {
    if (deleteEntryId) {
      deleteEntry(deleteEntryId);
      setDeleteEntryId(null);
      showToast('Entry deleted successfully', 'success');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getSkillName = (skillId: string) => 
    skills.find(skill => skill.id === skillId)?.name || 'Unknown';

  return (
    <div className="space-y-8">
      {/* Add Skill */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Manage Skills</h2>
        <form onSubmit={handleAddSkill} className="flex gap-3 mb-4">
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="Enter skill name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Skill
          </button>
        </form>
        
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center bg-gray-100 rounded-lg px-3 py-1">
                <span className="text-sm">{skill.name}</span>
                <button
                  onClick={() => setDeleteSkillId(skill.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Entry */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Log Hours</h2>
        {skills.length === 0 ? (
          <p className="text-gray-500">Add a skill first to start logging hours.</p>
        ) : (
          <form onSubmit={handleAddEntry} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={entryForm.date}
                onChange={(e) => setEntryForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
              <select
                value={entryForm.skillId}
                onChange={(e) => setEntryForm(prev => ({ ...prev, skillId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select skill</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.25"
                value={entryForm.hours}
                onChange={(e) => setEntryForm(prev => ({ ...prev, hours: e.target.value }))}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                type="text"
                value={entryForm.notes}
                onChange={(e) => setEntryForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Log Hours
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
        {sortedEntries.length === 0 ? (
          <p className="text-gray-500">No entries yet. Start logging your hours!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Skill</th>
                  <th className="text-left py-2">Hours</th>
                  <th className="text-left py-2">Notes</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEntries.map(entry => (
                  <tr key={entry.id} className="border-b">
                    <td className="py-2">{entry.date}</td>
                    <td className="py-2">{getSkillName(entry.skillId)}</td>
                    <td className="py-2">{entry.hours}</td>
                    <td className="py-2">{entry.notes || '-'}</td>
                    <td className="py-2">
                      <button
                        onClick={() => setDeleteEntryId(entry.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={!!deleteSkillId}
        onClose={() => setDeleteSkillId(null)}
        onConfirm={handleDeleteSkill}
        title="Delete Skill"
        message="This will delete the skill and all related entries. This action cannot be undone."
      />

      <ConfirmDialog
        isOpen={!!deleteEntryId}
        onClose={() => setDeleteEntryId(null)}
        onConfirm={handleDeleteEntry}
        title="Delete Entry"
        message="Are you sure you want to delete this entry?"
      />
    </div>
  );
};