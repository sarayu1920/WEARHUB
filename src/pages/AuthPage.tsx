import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
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
  Database,
  Eye,
  EyeOff,
  Loader2,
  X,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentUser,
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

  // Form input fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [homeUniversity, setHomeUniversity] = useState('VIT-AP University');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailAlreadyRegistered, setIsEmailAlreadyRegistered] = useState(false);
  const [isUserUnregistered, setIsUserUnregistered] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Determine redirection target (defaulting to Home page `/`)
  const fromState = (location.state as any)?.from?.pathname;
  const redirectParam = searchParams.get('redirect');
  const rawTarget = redirectParam || fromState || '/';
  const redirectTarget = rawTarget === '/auth' ? '/' : rawTarget;

  useEffect(() => {
    setIsSignUp(searchParams.get('mode') === 'signup');
    setError(null);
    setIsEmailAlreadyRegistered(false);
    setIsUserUnregistered(false);
  }, [searchParams]);

  // If already authenticated, redirect directly to intended destination or Home page
  if (currentUser) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleToggleMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setError(null);
    setIsEmailAlreadyRegistered(false);
    setIsUserUnregistered(false);
    setSuccessMessage(null);

    const newParams = new URLSearchParams(searchParams);
    if (signUpMode) {
      newParams.set('mode', 'signup');
    } else {
      newParams.delete('mode');
    }
    setSearchParams(newParams);
  };

  const switchToLoginWithEmail = (emailToPrefill?: string) => {
    handleToggleMode(false);
    if (emailToPrefill) {
      setEmail(emailToPrefill);
    }
  };

  const switchToSignUpWithEmail = (emailToPreserve?: string) => {
    handleToggleMode(true);
    if (emailToPreserve) {
      setEmail(emailToPreserve);
    }
  };

  const validateEmailFormat = (val: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsEmailAlreadyRegistered(false);
    setIsUserUnregistered(false);
    setSuccessMessage(null);

    const emailTrimmed = email.trim();

    // 1. Validate required fields & email format
    if (!emailTrimmed) {
      setError('Please enter your email address.');
      return;
    }

    if (!validateEmailFormat(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!homeUniversity) {
        setError('Please select your home university.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      // 2. Check that password and confirmation match
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please ensure both passwords match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(emailTrimmed, password, fullName.trim(), homeUniversity);
        setSuccessMessage('Account created successfully! Redirecting...');
      } else {
        await signIn(emailTrimmed, password);
        setSuccessMessage('Signed in successfully! Redirecting...');
      }

      // 3. After successful login, redirect to intended target or profile
      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 400);
    } catch (err: any) {
      console.error('Authentication error:', err);
      const code = err?.code || '';
      const rawMsg = err?.message || '';

      if (code === 'auth/email-already-in-use' || rawMsg.includes('email already exists') || rawMsg.includes('auth/email-already-in-use')) {
        // Required exact text: "An account with this email already exists. Please log in."
        setError('An account with this email already exists. Please log in.');
        setIsEmailAlreadyRegistered(true);
      } else if (code === 'auth/user-not-found' || rawMsg.includes('not registered yet') || rawMsg.includes('user-not-found')) {
        // Unregistered email requirement: exact text and blue register link
        setError("You’re not registered yet. Please create an account to continue.");
        setIsUserUnregistered(true);
      } else if (code === 'auth/wrong-password') {
        setError('Incorrect email or password. Please try again.');
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/invalid-login-credentials' ||
        rawMsg.includes('Invalid email or password') ||
        rawMsg.includes('Incorrect email or password')
      ) {
        setError('Incorrect email or password. Please try again.');
      } else if (code === 'auth/weak-password' || rawMsg.includes('weak-password')) {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email' || rawMsg.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many unsuccessful attempts. Access temporarily restricted for security. Please try again later or reset your password.');
      } else if (code === 'auth/network-request-failed' || rawMsg.includes('network') || rawMsg.includes('Network')) {
        setError('Network connection error. Please verify your internet connection and try again.');
      } else if (code === 'auth/internal-error' || rawMsg.includes('internal error') || rawMsg.includes('server')) {
        setError('Server error encountered. Please try again in a few moments.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in Firebase Console. Please enable it in Firebase Console > Authentication > Sign-in method.');
      } else {
        setError(rawMsg || 'Authentication failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    setIsEmailAlreadyRegistered(false);
    setIsUserUnregistered(false);

    try {
      await signInWithGoogle();
      setSuccessMessage('Google sign-in successful! Redirecting...');
      setTimeout(() => {
        navigate(redirectTarget, { replace: true });
      }, 400);
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      const code = err?.code || '';
      const rawMsg = err?.message || '';

      if (code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled before completion.');
      } else if (code === 'auth/popup-blocked') {
        setError('The Google sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email address under a different sign-in method. Please sign in with your email and password.');
        setIsEmailAlreadyRegistered(true);
      } else if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase Console. Please add your current domain in Firebase Console > Authentication > Settings > Authorized domains.');
      } else if (rawMsg.includes('requires live Firebase configuration')) {
        setError(rawMsg);
      } else {
        setError(rawMsg || 'Google sign-in was cancelled or encountered an error.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    const emailTrimmed = resetEmail.trim();
    if (!emailTrimmed) {
      setResetError('Please enter your email address.');
      return;
    }

    if (!validateEmailFormat(emailTrimmed)) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setResetLoading(true);

    try {
      await resetPassword(emailTrimmed);
      setResetSuccess(true);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setResetError('No account found registered with this email address.');
      } else if (code === 'auth/invalid-email') {
        setResetError('Please enter a valid email address.');
      } else {
        setResetError(err?.message || 'Failed to send password reset email.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Headline */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-[#12372A] flex items-center justify-center text-white shadow-md group-hover:bg-[#1E4D2B] transition-colors">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-extrabold text-[#12372A] tracking-tight block">
                WEARHUB
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#2D6A4F] block -mt-1">
                Wear more. Waste less.
              </span>
            </div>
          </Link>

          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 pt-1">
            {isSignUp ? 'Create Your Student Account' : 'Welcome Back to Campus'}
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            {isSignUp
              ? 'Join student peers buying, selling, borrowing, and requesting campus items'
              : 'Sign in to access your listings, requests, messages, and student wardrobe'}
          </p>
        </div>

        {/* Configuration Notice: Preview Mode vs Live Firebase */}
        {!isFirebaseReady ? (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-amber-700" />
                <span>Preview Mode (Simulated Authentication)</span>
              </div>
              <Link
                to="/setup-guide"
                className="text-[11px] font-semibold text-amber-800 underline hover:text-amber-950 flex items-center"
              >
                <span>Config Guide</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Firebase credentials are not configured in <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono">.env</code>. You can test registration and login with local session state, or click a preset test student account below:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  loginAsDemoUser(0);
                  navigate(redirectTarget, { replace: true });
                }}
                className="text-[11px] font-bold px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300/90 text-amber-950 rounded-xl transition-colors shadow-2xs"
              >
                Sign In as Arjun (VIT-AP)
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoUser(1);
                  navigate(redirectTarget, { replace: true });
                }}
                className="text-[11px] font-bold px-3 py-1.5 bg-amber-200/80 hover:bg-amber-300/90 text-amber-950 rounded-xl transition-colors shadow-2xs"
              >
                Sign In as Priya (SRM AP)
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">
              Live Firebase Authentication connected and active.
            </span>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/90 shadow-sm space-y-5">
          {/* Form Tabs: Log In vs Sign Up */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-2xl text-xs font-bold text-neutral-600">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`py-2.5 rounded-xl transition-all ${
                !isSignUp
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'hover:text-neutral-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`py-2.5 rounded-xl transition-all ${
                isSignUp
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'hover:text-neutral-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner with Inline Switch to Login Link if Duplicate Email or Register Link if Unregistered */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-start space-x-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>

              {/* Unregistered user: Display blue Register now link immediately below error message */}
              {isUserUnregistered && !isSignUp && (
                <div className="pt-0.5 pl-6">
                  <button
                    type="button"
                    onClick={() => switchToSignUpWithEmail(email)}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs underline underline-offset-2 transition-colors cursor-pointer inline-flex items-center space-x-1"
                  >
                    <span>Register now</span>
                  </button>
                </div>
              )}

              {/* Duplicate Email in registration: switch to login with email */}
              {isEmailAlreadyRegistered && isSignUp && (
                <div className="pt-1 pl-6">
                  <button
                    type="button"
                    onClick={() => switchToLoginWithEmail(email)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-2xs transition-colors"
                  >
                    <span>Switch to Log In with this Email</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arjun Verma"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                    />
                  </div>
                </div>

                {/* Home University Selection */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Home University *
                  </label>
                  <div className="relative">
                    <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    <select
                      value={homeUniversity}
                      onChange={(e) => setHomeUniversity(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] text-neutral-800 font-medium"
                    >
                      {universities.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.shortName})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                College or Personal Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu.in or personal"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Control */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-neutral-700">Password *</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email.trim());
                      setResetError(null);
                      setResetSuccess(false);
                      setIsForgotPasswordOpen(true);
                    }}
                    className="text-[11px] font-semibold text-[#12372A] hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? 'Minimum 6 characters' : '••••••••'}
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field with Show/Hide Control (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </>
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

          {/* Continue with Google button on both forms */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-xs font-bold text-neutral-700 flex items-center justify-center space-x-2.5 transition-colors disabled:opacity-50 shadow-2xs"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            ) : (
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
            )}
            <span>Continue with Google</span>
          </button>

          {/* Form Switch Link */}
          <div className="pt-2 text-center text-xs text-neutral-500">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode(false)}
                  className="font-bold text-[#12372A] hover:underline"
                >
                  Log In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className="font-bold text-[#12372A] hover:underline"
                >
                  Create one now
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-neutral-200 animate-fadeIn relative">
            <button
              onClick={() => {
                setIsForgotPasswordOpen(false);
                setResetSuccess(false);
                setResetError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#12372A] flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-700" />
            </div>

            <div>
              <h3 className="font-extrabold text-base text-neutral-900">Reset Your Password</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Enter your registered college or personal email address to receive password reset instructions.
              </p>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Password reset link sent to <strong>{resetEmail}</strong>! Please check your email inbox and spam folder.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetSuccess(false);
                  }}
                  className="w-full py-2.5 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="student@college.edu.in"
                    className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2.5 bg-[#12372A] hover:bg-[#1E4D2B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
