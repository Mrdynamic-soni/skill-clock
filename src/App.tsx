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
import { MobileHeader } from "./components/MobileHeader";
import { useToast } from "./hooks/useToast";
import { Skills } from "./pages/Skills";
import { Timer } from "./pages/Timer";
import { Sessions } from "./pages/Sessions";
import { Analytics } from "./pages/Analytics";
import { Goals } from "./pages/Goals";
import { DailyTasks } from "./pages/DailyTasks";
import { Profile } from "./pages/Profile";
import { About } from "./pages/About";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { ResetPassword } from "./pages/ResetPassword";
import { useAppStore } from "./store/appStore";
import { useEffect, useState } from "react";
import { AuthForm } from "./components/AuthForm";
import { handleIOSViewport, isAppleDevice } from "./utils/dateUtils";


const Layout = () => {
  const { toasts, removeToast } = useToast();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`flex h-screen bg-gray-100 overflow-hidden ${isAppleDevice() ? 'apple-layout' : ''}`}>
      <MobileHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <motion.div
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <main className="flex-1 overflow-auto flex flex-col md:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col md:block"
            >
              <div className="p-2 md:p-4 pt-16 md:pt-4 flex-1">
                <Outlet />
              </div>
              <div className="md:hidden mt-auto">
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

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAppStore();

  if (!isAuthenticated || !user) {
    return <AuthForm />;
  }

  return <>{children}</>;
};

const App = () => {
  const { checkAuthStatus } = useAppStore();

  useEffect(() => {
    // Handle iOS-specific setup
    handleIOSViewport();
    
    // Add iOS-specific body class
    if (isAppleDevice()) {
      document.body.classList.add('apple-device');
    }
    
    checkAuthStatus();
  }, [checkAuthStatus]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AuthForm />} />
        <Route path="/forgot-password" element={<AuthForm forgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Skills />} />
          <Route path="timer" element={<Timer />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="goals" element={<Goals />} />
          <Route path="daily-tasks" element={<DailyTasks />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsOfService />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<AuthForm />} />
      </Routes>
    </Router>
  );
};

export default App;
