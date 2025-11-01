import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { ToastContainer } from "./components/Toast";
import { useToast } from "./hooks/useToast";
import { Skills } from "./pages/Skills";
import { Timer } from "./pages/Timer";
import { Sessions } from "./pages/Sessions";
import { Analytics } from "./pages/Analytics";
import { Goals } from "./pages/Goals";
import { DailyTasks } from "./pages/DailyTasks";
import { Help } from "./pages/Help";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { About } from "./pages/About";



const Layout = () => {
  const { toasts, removeToast } = useToast();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-2 md:p-4 pt-16 md:pt-4">
                <Outlet />
              </div>
              <div className="md:hidden">
                <Footer />
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
        <div className="hidden md:block">
          <Footer />
        </div>
      </motion.div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Skills />} />
        <Route path="timer" element={<Timer />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="goals" element={<Goals />} />
        <Route path="daily-tasks" element={<DailyTasks />} />
        <Route path="help" element={<Help />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
