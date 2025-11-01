import { Clock, Shield, Database, Github } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* App Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-8">
          <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SkillClock</h1>
          <p className="text-lg text-gray-600">
            Track your daily dedicated hours by skill and work category
          </p>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            SkillClock is a productivity application designed to help you monitor 
            and analyze how you spend your time across different skills and work categories. 
            Whether you're learning new technologies, working on projects, or developing 
            professional skills, this app provides insights into your time investment.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Skill Management</h3>
                <p className="text-sm text-gray-600">Create and manage your skills and work categories</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Time Logging</h3>
                <p className="text-sm text-gray-600">Log daily hours with optional notes</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Analytics & Charts</h3>
                <p className="text-sm text-gray-600">Visualize your time distribution and trends</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Profile Management</h3>
                <p className="text-sm text-gray-600">Maintain your professional profile</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Data Export/Import</h3>
                <p className="text-sm text-gray-600">Backup and restore your data</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <h3 className="font-medium">Responsive Design</h3>
                <p className="text-sm text-gray-600">Works seamlessly on desktop and mobile</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold">Privacy & Security</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <Database className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Local Data Storage</h3>
              <p className="text-sm text-gray-600">
                All your data is stored locally in your browser. No data is transmitted 
                to external servers or third parties.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">No Account Required</h3>
              <p className="text-sm text-gray-600">
                Start using the app immediately without creating accounts or providing 
                personal information.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Database className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Data Control</h3>
              <p className="text-sm text-gray-600">
                You have complete control over your data with export, import, and 
                clear options available.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Technical Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">Built With</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React with TypeScript</li>
              <li>• Vite for fast development</li>
              <li>• Zustand for state management</li>
              <li>• Recharts for data visualization</li>
              <li>• Tailwind CSS for styling</li>
              <li>• React Router for navigation</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Browser Compatibility</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Chrome (recommended)</li>
              <li>• Firefox</li>
              <li>• Safari</li>
              <li>• Edge</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          Version 1.0.0 • Built with ❤️ for productivity enthusiasts
        </p>
      </div>
    </div>
  );
};