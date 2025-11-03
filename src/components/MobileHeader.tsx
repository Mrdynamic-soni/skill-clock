import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader = ({ onMenuClick }: MobileHeaderProps) => {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">SkillClock</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
    </header>
  );
};