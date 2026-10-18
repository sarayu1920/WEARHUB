import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useUniversity } from '../context/UniversityContext';
import {
  ShoppingBag,
  School,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Database,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    isFirebaseReady,
    loginAsDemoUser,
  } = useAuth();
  const { universities } = useUniversity();

  const isSignUpDefault = searchParams.get('mode') === 'signup';
  const [isSignUp, setIsSignUp] = useState(isSignUpDefault);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [homeUniversity, setHomeUniversity] = useState('VIT-AP University');

  // Forgot password
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSignUp(searchParams.get('mode') === 'signup');
  }, [searchParams]);

  const handleToggleMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setError(null);
    setSearchParams(signUpMode ? { mode: 'signup' } : {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email.trim(), password, fullName.trim(), homeUniversity);
      } else {
        await signIn(email.trim(), password);
      }
      navigate('/profile');
    } catch (err: any) {
      console.error('Authentication error:', err);
      let msg = err?.message || 'Authentication failed. Please check your credentials.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password. Please try again.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please log in.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid college email address.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/profile');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err?.message || 'Google sign-in was cancelled or encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    try {
      await resetPassword(resetEmail.trim());
      setResetSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-[#12372A] flex items-center justify-center text-white shadow-md">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-2xl font-extrabold text-[#12372A] tracking-tight">WEARHUB</span>
          </Link>
          <h2 className="text-xl font-extrabold text-neutral-900">
            {isSignUp ? 'Create your Campus Wardrobe Account' : 'Welcome Back, Student!'}
          </h2>
          <p className="text-xs text-neutral-500">
            {isSignUp
              ? 'Join student peers sharing and circulating sustainable clothing'
              : 'Sign in to access your listings, requests, and borrow messages'}
          </p>
        </div>

        {/* Configuration Notice if Firebase not active */}
        {!isFirebaseReady && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="font-bold flex items-center">
              <Database className="w-4 h-4 mr-1.5 text-amber-700" />
              <span>Preview Demo Mode</span>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Firebase keys are not yet configured in `.env`. You can explore registration and login with local session state, or click below for preset student accounts.
            </p>
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  loginAsDemoUser(0);
                  navigate('/profile');
                }}
                className="text-[10px] font-bold px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg"
              >
                Log in as Arjun (VIT-AP)
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoUser(1);
                  navigate('/profile');
                }}
                className="text-[10px] font-bold px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg"
              >
                Log in as Priya (SRM AP)
              </button>
            </div>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-sm space-y-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl text-xs font-bold text-neutral-600">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`py-2 rounded-xl transition-all ${
                !isSignUp ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`py-2 rounded-xl transition-all ${
                isSignUp ? 'bg-white text-neutral-900 shadow-xs' : 'hover:text-neutral-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arjun Verma"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Home University *
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <select
                      value={homeUniversity}
                      onChange={(e) => setHomeUniversity(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none"
                    >
                      {universities.map((u) => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                College / Personal Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu.in or personal"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-neutral-700">Password *</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[11px] font-semibold text-[#12372A] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Student Account' : 'Sign In to WEARHUB'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase font-bold text-neutral-400 bg-white px-2">
              <span>Or continue with</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-neutral-900">Reset Your Password</h3>
            <p className="text-xs text-neutral-500">
              Enter your registered college or personal email address to receive password reset instructions.
            </p>

            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Password reset link sent to {resetEmail}!</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@college.edu.in"
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#12372A] text-white text-xs font-bold rounded-xl"
                >
                  Send Reset Link
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setIsForgotPasswordOpen(false);
                setResetSuccess(false);
              }}
              className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
