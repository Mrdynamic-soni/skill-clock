import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";
import LOGO from "../assets/LOGO.png";
import {
  BarChart3,
  User,
  Settings,
  Info,
  Menu,
  Play,
  Target,
  X,
  History,
  HelpCircle,
  Trophy,
  CheckSquare,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/", icon: Target, label: "Skills" },
  { to: "/timer", icon: Play, label: "Timer" },
  { to: "/sessions", icon: History, label: "Sessions" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/goals", icon: Trophy, label: "Goals" },
  { to: "/daily-tasks", icon: CheckSquare, label: "Daily Tasks" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/help", icon: HelpCircle, label: "Help" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/about", icon: Info, label: "About" },
];

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      toggleSidebar();
    }
  };

  if (isMobile) {
    return (
      <>
        <motion.button
          onClick={handleToggle}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg md:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu size={20} />
        </motion.button>

        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                className="fixed left-0 top-0 h-full w-40 bg-gray-900 text-white z-50 md:hidden"
                initial={{ x: -264 }}
                animate={{ x: 0 }}
                exit={{ x: -264 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <img src={LOGO} alt="SkillClock" className="h-8" />
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {navItems.map(({ to, icon: Icon, label }) => (
                      <motion.li
                        key={to}
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <NavLink
                          to={to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center p-3 rounded-lg transition-colors ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`
                          }
                        >
                          <Icon size={20} />
                          <span className="ml-3">{label}</span>
                        </NavLink>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <motion.div
      className={`bg-gray-900 text-white h-screen flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? "w-20" : "w-40"
      }`}
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.img
                src={LOGO}
                alt="SkillClock"
                className="h-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          <motion.button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={20} />
          </motion.button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <motion.li
              key={to}
              whileHover={{ x: sidebarCollapsed ? 0 : 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <Icon size={sidebarCollapsed ? 24 : 20} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      className="ml-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};
