import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabase';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register, signInWithGoogle } = useAppStore();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
        showToast('Login successful!', 'success');
        navigate('/');
      } else {
        const result = await register(formData);
        if (result?.user && !result?.session) {
          // User created but needs email confirmation
          setJustSignedUp(true);
          showToast('Account created! Please check your email to verify your account.', 'success');
        } else {
          // User created and logged in (confirmations disabled)
          showToast('Registration successful!', 'success');
          navigate('/');
        }
      }
    } catch (error: any) {
      const errorMsg = error.message?.toLowerCase() || '';
      
      // Email confirmation errors
      if (errorMsg.includes('email not confirmed')) {
        setNeedsConfirmation(true);
        setErrorMessage('Email not verified. Please check your email and click the confirmation link.');
      } 
      // Invalid credentials - user doesn't exist or wrong password
      else if (errorMsg.includes('invalid login credentials') || errorMsg.includes('invalid email or password')) {
        if (isLogin) {
          setErrorMessage('Invalid email or password. Check your credentials or sign up for a new account.');
        } else {
          setErrorMessage('Registration failed. Please check your information and try again.');
        }
      }
      // User already exists
      else if (errorMsg.includes('user already registered') || errorMsg.includes('already been registered') || errorMsg.includes('email address is already registered')) {
        setErrorMessage('This email is already registered. Please sign in instead.');
        setIsLogin(true);
        setJustSignedUp(false);
      }
      // Password validation
      else if (errorMsg.includes('password') && (errorMsg.includes('at least') || errorMsg.includes('too short'))) {
        setErrorMessage('Password must be at least 6 characters long.');
      }
      // Email validation
      else if (errorMsg.includes('email') && (errorMsg.includes('invalid') || errorMsg.includes('validate'))) {
        setErrorMessage('Please enter a valid email address.');
      }
      // Network or server errors
      else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        setErrorMessage('Network error. Please check your connection and try again.');
      }
      // Generic fallback
      else {
        setErrorMessage(error.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      await signInWithGoogle();
      // OAuth redirect will handle the rest, don't set loading to false here
    } catch (error: any) {
      setErrorMessage(error.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      showToast('Please enter your email address', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Use Supabase's resend method
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email
      });
      
      if (error) throw error;
      showToast('Confirmation email sent! Check your inbox.', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to resend confirmation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">SkillClock</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="mt-3 w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
        
        {(needsConfirmation || justSignedUp) && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-400 mr-2" />
              <div className="text-sm text-blue-700">
                {justSignedUp ? (
                  <>
                    <p className="font-medium">Check your email!</p>
                    <p>We've sent a verification link to <strong>{formData.email}</strong></p>
                    <p className="mt-1">Click the link in your email to verify your account, then come back to sign in.</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Email confirmation required</p>
                    <p>Check your email and click the confirmation link, or resend it below.</p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleResendConfirmation}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-500 underline disabled:opacity-50"
              >
                Resend verification email
              </button>
              {justSignedUp && (
                <button
                  onClick={() => {
                    setJustSignedUp(false);
                    setIsLogin(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500 underline"
                >
                  I've verified, let me sign in
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="text-center">
          {!justSignedUp && (
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setNeedsConfirmation(false);
                setJustSignedUp(false);
                setErrorMessage('');
              }}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};