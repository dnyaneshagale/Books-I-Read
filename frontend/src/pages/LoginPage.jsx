import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../authApi';

/**
 * LoginPage - User login form
 */
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!username.trim() || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    const result = await login(username, password);

    setIsLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      navigate(redirectTo);
    } else {
      toast.error(result.error);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Validation
    if (!resetEmail.trim()) {
      toast.error('Please enter your username or email');
      return;
    }

    setIsResetting(true);

    try {
      await authApi.resetPassword({ identifier: resetEmail });
      
      toast.success('Password reset link sent! Check your email inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--bg-primary)] p-8 max-sm:p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-14 px-12 max-w-[440px] w-full shadow-lg max-sm:py-8 max-sm:px-6">
        <h1 className="text-[2rem] font-bold text-[var(--text-primary)] mb-2.5 text-center tracking-tight max-sm:text-[1.625rem]">Books I Read</h1>
        <p className="text-[var(--text-secondary)] text-center mb-10 text-base leading-normal">Track your reading journey</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="username" className="text-[0.9375rem] font-semibold text-slate-800 tracking-tight dark:text-[var(--text-primary)]">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              disabled={isLoading}
              autoFocus
              className="py-3.5 px-[1.125rem] bg-white border-2 border-slate-300 rounded-[10px] text-base text-slate-800 transition-all duration-200 font-[inherit] focus:outline-none focus:border-violet-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 placeholder:text-slate-400 placeholder:text-[0.9375rem] dark:bg-[var(--color-bg)] dark:border-[var(--border-color)] dark:text-[var(--text-primary)]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="password" className="text-[0.9375rem] font-semibold text-slate-800 tracking-tight dark:text-[var(--text-primary)]">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="flex-1 pr-12 py-3.5 px-[1.125rem] bg-white border-2 border-slate-300 rounded-[10px] text-base text-slate-800 transition-all duration-200 font-[inherit] focus:outline-none focus:border-violet-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 placeholder:text-slate-400 placeholder:text-[0.9375rem] dark:bg-[var(--color-bg)] dark:border-[var(--border-color)] dark:text-[var(--text-primary)]"
              />
              <button
                type="button"
                className="absolute right-3 bg-none border-none text-slate-500 text-lg cursor-pointer p-2 flex items-center justify-center rounded-md transition-all duration-200 leading-none hover:text-violet-600 hover:bg-slate-50 active:scale-95"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="button"
              className="bg-none border-none text-violet-600 text-sm font-semibold cursor-pointer p-0 mt-2 text-right transition-all duration-200 font-[inherit] self-end hover:text-violet-700 hover:underline hover:underline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowForgotPassword(true)}
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[var(--border-color)] text-center">
          <p className="text-[var(--text-secondary)] text-[0.9375rem] m-0 leading-relaxed">
            Don't have an account?{' '}
            <a href="/register" className="text-violet-600 font-bold no-underline transition-all duration-200 px-0.5 hover:text-violet-700 hover:underline hover:underline-offset-[3px]">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-[g-fadeIn_0.2s_ease]" onClick={() => setShowForgotPassword(false)}>
          <div className="bg-white dark:bg-[var(--color-bg)] border border-gray-200 dark:border-[var(--border-color)] rounded-2xl w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-[g-slideUp_0.3s_ease] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-6 px-8 border-b border-gray-200 dark:border-[var(--border-color)] max-sm:py-5 max-sm:px-6">
              <h2 className="text-2xl font-bold text-violet-600 m-0 max-sm:text-xl">Reset Password</h2>
              <button
                className="bg-gray-100 border border-gray-200 text-gray-500 w-8 h-8 rounded-lg text-lg flex items-center justify-center cursor-pointer transition-all duration-200 p-0 leading-none font-[inherit] hover:bg-violet-600 hover:border-violet-600 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setShowForgotPassword(false)}
                disabled={isResetting}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-8 max-sm:p-6">
              <p className="text-gray-500 text-[0.95rem] leading-relaxed mb-6">
                Enter your username or email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handlePasswordReset}>
                <div className="flex flex-col gap-2.5">
                  <label htmlFor="resetEmail" className="text-[0.9375rem] font-semibold text-slate-800 tracking-tight dark:text-[var(--text-primary)]">Username or Email</label>
                  <input
                    type="text"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your username or email"
                    disabled={isResetting}
                    autoFocus
                    className="py-3.5 px-[1.125rem] bg-white border-2 border-slate-300 rounded-[10px] text-base text-slate-800 transition-all duration-200 font-[inherit] focus:outline-none focus:border-violet-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 placeholder:text-slate-400 placeholder:text-[0.9375rem] dark:bg-[var(--color-bg)] dark:border-[var(--border-color)] dark:text-[var(--text-primary)]"
                  />
                </div>

                <div className="flex gap-3 mt-6 max-sm:flex-col">
                  <button
                    type="button"
                    className="btn-secondary flex-1 max-sm:w-full"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isResetting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 !mt-0 max-sm:w-full"
                    disabled={isResetting}
                  >
                    {isResetting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
