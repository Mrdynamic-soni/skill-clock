import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useToast } from '../hooks/useToast';
import { Download, Upload, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const Settings = () => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { skills, entries, profile, clearAll } = useAppStore();
  const { showToast } = useToast();

  const exportData = () => {
    const data = {
      skills,
      entries,
      profile,
      exportDate: new Date().toISOString(),
      version: 1,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-hours-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Data exported successfully', 'success');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (!data.skills || !data.entries || !data.profile) {
          throw new Error('Invalid file format');
        }

        // Simple merge strategy - replace all data
        useAppStore.setState({
          skills: data.skills,
          entries: data.entries,
          profile: data.profile,
        });

        showToast('Data imported successfully', 'success');
      } catch (error) {
        showToast('Failed to import data. Please check the file format.', 'error');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleClearAll = () => {
    clearAll();
    setShowClearDialog(false);
    showToast('All data cleared successfully', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Data Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-6">Data Management</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium">Export Data</h3>
              <p className="text-sm text-gray-600">
                Download all your data as a JSON file for backup
              </p>
            </div>
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium">Import Data</h3>
              <p className="text-sm text-gray-600">
                Restore data from a previously exported JSON file
              </p>
            </div>
            <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              <Upload size={16} className="mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-800">Clear All Data</h3>
              <p className="text-sm text-red-600">
                Permanently delete all skills, entries, and profile data
              </p>
            </div>
            <button
              onClick={() => setShowClearDialog(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Clear All
            </button>
          </div>
        </div>
      </div>



      {/* Privacy Notice */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Privacy & Data</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            All your data is stored locally in your browser's localStorage. 
            No data is sent to any external servers.
          </p>
          <p>
            Your data will persist across browser sessions but may be lost if you:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Clear your browser's storage/cache</li>
            <li>Use incognito/private browsing mode</li>
            <li>Uninstall or reset your browser</li>
          </ul>
          <p>
            We recommend regularly exporting your data as a backup.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearAll}
        title="Clear All Data"
        message="This will permanently delete all skills, entries, and profile data. This action cannot be undone. Are you sure?"
      />
    </div>
  );
};