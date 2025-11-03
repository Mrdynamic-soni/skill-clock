import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, User, Lock, Clock, ArrowRight } from "lucide-react";
import { useAppStore } from "../store/appStore";
import { useToast } from "../hooks/useToast";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  // const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login, register } = useAppStore();
  // const { signInWithGoogle } = useAppStore(); // For future use
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        showToast("Login successful!", "success");
        navigate("/");
      } else {
        const result = await register(formData);
        if (result && result.user && !result.session) {
          // User created but needs email confirmation
          setJustSignedUp(true);
          showToast(
            "Account created! Please check your email to verify your account.",
            "success"
          );
        } else if (result && result.session) {
          // User created and logged in (confirmations disabled)
          showToast("Registration successful!", "success");
          navigate("/");
        }
      }
    } catch (error: any) {
      const errorMsg = error.message?.toLowerCase() || "";

      // Email confirmation errors
      if (errorMsg.includes("email not confirmed")) {
        setNeedsConfirmation(true);
        setErrorMessage(
          "Email not verified. Please check your email and click the confirmation link."
        );
      }
      // Invalid credentials - user doesn't exist or wrong password
      else if (
        errorMsg.includes("invalid login credentials") ||
        errorMsg.includes("invalid email or password")
      ) {
        if (isLogin) {
          setErrorMessage(
            "Invalid email or password. Check your credentials or sign up for a new account."
          );
        } else {
          setErrorMessage(
            "Registration failed. Please check your information and try again."
          );
        }
      }
      // User already exists
      else if (
        errorMsg.includes("user already registered") ||
        errorMsg.includes("already been registered") ||
        errorMsg.includes("email address is already registered")
      ) {
        setErrorMessage(
          "This email is already registered. Please sign in instead."
        );
        setIsLogin(true);
        setJustSignedUp(false);
      }
      // Password validation
      else if (
        errorMsg.includes("password") &&
        (errorMsg.includes("at least") || errorMsg.includes("too short"))
      ) {
        setErrorMessage("Password must be at least 6 characters long.");
      }
      // Email validation
      else if (
        errorMsg.includes("email") &&
        (errorMsg.includes("invalid") || errorMsg.includes("validate"))
      ) {
        setErrorMessage("Please enter a valid email address.");
      }
      // Network or server errors
      else if (errorMsg.includes("network") || errorMsg.includes("fetch")) {
        setErrorMessage(
          "Network error. Please check your connection and try again."
        );
      }
      // Generic fallback
      else {
        setErrorMessage(
          error.message || "Authentication failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   setGoogleLoading(true);
  //   setErrorMessage("");
  //   try {
  //     await signInWithGoogle();
  //     // OAuth redirect will handle the rest, don't set loading to false here
  //   } catch (error: any) {
  //     setErrorMessage(
  //       error.message || "Google sign-in failed. Please try again."
  //     );
  //     setGoogleLoading(false);
  //   }
  // };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      showToast("Please enter your email address", "error");
      return;
    }

    setLoading(true);
    try {
      // Use Supabase's resend method
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
      });

      if (error) throw error;
      showToast("Confirmation email sent! Check your inbox.", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to resend confirmation", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        className="max-w-md w-full space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Clock className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            SkillClock
          </motion.h1>
          <motion.p
            className="mt-2 text-gray-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isLogin ? "✨ Welcome back!" : "🚀 Start your journey"}
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {errorMessage && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Sign Up"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Google Sign-in - Hidden for now */}
          {/* {false && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <motion.button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="mt-4 w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-200 rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {false ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>
                  Continue with Google
                </span>
              </motion.button>
            </div>
          )} */}

          {(needsConfirmation || justSignedUp) && (
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm text-blue-700">
                  {justSignedUp ? (
                    <>
                      <p className="font-semibold mb-1">📧 Check your email!</p>
                      <p>
                        We've sent a verification link to{" "}
                        <strong>{formData.email}</strong>
                      </p>
                      <p className="mt-1 text-blue-600">
                        Click the link in your email to verify your account,
                        then come back to sign in.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-1">
                        Email confirmation required
                      </p>
                      <p className="text-blue-600">
                        Check your email and click the confirmation link, or
                        resend it below.
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={handleResendConfirmation}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50 font-medium"
                >
                  Resend verification email
                </button>
                {justSignedUp && (
                  <button
                    onClick={() => {
                      setJustSignedUp(false);
                      setIsLogin(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    I've verified, let me sign in
                  </button>
                )}
              </div>
            </motion.div>
          )}

          <div className="text-center pt-4">
            {!justSignedUp && (
              <motion.button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setNeedsConfirmation(false);
                  setJustSignedUp(false);
                  setErrorMessage("");
                }}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
              >
                {isLogin ? (
                  <span>
                    Don't have an account?{" "}
                    <span className="text-blue-600 font-semibold">Sign up</span>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <span className="text-blue-600 font-semibold">Sign in</span>
                  </span>
                )}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>🔒 Your data is secure and encrypted</p>
        </motion.div>
      </motion.div>
    </div>
  );
};
