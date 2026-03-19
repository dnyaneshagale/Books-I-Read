import { useState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary dark:bg-bg p-8 max-[640px]:p-4">
      <div className="bg-bg-secondary dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl py-14 px-12 max-w-[440px] w-full shadow-lg max-[640px]:py-8 max-[640px]:px-6">
        <h1 className="text-[2rem] font-bold text-txt-primary dark:text-[#E2D9F3] m-0 mb-2.5 text-center tracking-tight max-[640px]:text-[1.625rem]">Books I Read</h1>
        <p className="text-txt-secondary dark:text-[#9E95A8] text-center m-0 mb-10 text-base leading-normal">Track your reading journey</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="username" className="text-[0.9375rem] font-semibold text-[#1e293b] dark:text-[#E2D9F3] tracking-tight">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              disabled={isLoading}
              autoFocus
              className="py-3.5 px-[1.125rem] bg-white dark:bg-[#0F0C15] border-2 border-[#cbd5e1] dark:border-[#2D2A35] rounded-[10px] text-base text-[#1e293b] dark:text-[#E2D9F3] transition-all duration-200 font-[inherit] outline-none focus:border-[#7c3aed] dark:focus:border-[#7C4DFF] focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#f8fafc] placeholder:text-[#94a3b8] placeholder:text-[0.9375rem]"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="password" className="text-[0.9375rem] font-semibold text-[#1e293b] dark:text-[#E2D9F3] tracking-tight">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="pr-12 flex-1 py-3.5 px-[1.125rem] bg-white dark:bg-[#0F0C15] border-2 border-[#cbd5e1] dark:border-[#2D2A35] rounded-[10px] text-base text-[#1e293b] dark:text-[#E2D9F3] transition-all duration-200 font-[inherit] outline-none focus:border-[#7c3aed] dark:focus:border-[#7C4DFF] focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#f8fafc] placeholder:text-[#94a3b8] placeholder:text-[0.9375rem]"
              />
              <button
                type="button"
                className="absolute right-3 bg-none border-none text-[#64748b] text-[1.125rem] cursor-pointer p-2 flex items-center justify-center rounded-md transition-all duration-200 leading-none hover:text-[#7c3aed] hover:bg-[#f8f9fa] active:scale-95"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button
              type="button"
              className="bg-none border-none text-[#7c3aed] dark:text-[#7C4DFF] text-sm font-semibold cursor-pointer p-0 mt-2 text-right transition-all duration-200 font-[inherit] self-end hover:text-[#6d28d9] hover:underline hover:underline-offset-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowForgotPassword(true)}
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="mt-3 py-4 px-6 bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white border-none rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-200 font-[inherit] shadow-[0_4px_12px_rgba(124,58,237,0.25)] hover:not-disabled:bg-gradient-to-br hover:not-disabled:from-[#6d28d9] hover:not-disabled:to-[#5b21b6] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_16px_rgba(124,58,237,0.35)] active:not-disabled:translate-y-0 active:not-disabled:shadow-[0_2px_8px_rgba(124,58,237,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-border dark:border-[#2D2A35] text-center">
          <p className="text-txt-secondary dark:text-[#9E95A8] text-[0.9375rem] m-0 leading-relaxed">
            Don't have an account?{' '}
            <a href="/register" className="text-[#7c3aed] dark:text-[#7C4DFF] font-bold no-underline transition-all duration-200 px-0.5 hover:text-[#6d28d9] hover:underline hover:underline-offset-[3px]">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in" onClick={() => setShowForgotPassword(false)}>
          <div className="bg-white dark:bg-[#1E1B24] border border-[#e0e0e0] dark:border-[#2D2A35] rounded-2xl w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-slide-up overflow-hidden max-[640px]:max-w-[95%]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-6 px-8 border-b border-[#e0e0e0] dark:border-[#2D2A35] max-[640px]:py-5 max-[640px]:px-6">
              <h2 className="text-2xl font-bold text-[#7c3aed] dark:text-[#7C4DFF] m-0 max-[640px]:text-xl">Reset Password</h2>
              <button
                className="bg-[#f5f5f5] dark:bg-[#2D2A35] border border-[#e0e0e0] dark:border-[#3a3642] text-[#666] dark:text-[#9E95A8] w-8 h-8 rounded-lg text-lg flex items-center justify-center cursor-pointer transition-all duration-200 p-0 leading-none font-[inherit] hover:not-disabled:bg-[#7c3aed] hover:not-disabled:border-[#7c3aed] hover:not-disabled:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={() => setShowForgotPassword(false)}
                disabled={isResetting}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-8 max-[640px]:p-6">
              <p className="text-[#666] dark:text-[#9E95A8] text-[0.95rem] leading-relaxed m-0 mb-6">
                Enter your username or email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handlePasswordReset}>
                <div className="flex flex-col gap-2.5">
                  <label htmlFor="resetEmail" className="text-[0.9375rem] font-semibold text-[#1e293b] dark:text-[#E2D9F3] tracking-tight">Username or Email</label>
                  <input
                    type="text"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your username or email"
                    disabled={isResetting}
                    autoFocus
                    className="py-3.5 px-[1.125rem] bg-white dark:bg-[#0F0C15] border-2 border-[#cbd5e1] dark:border-[#2D2A35] rounded-[10px] text-base text-[#1e293b] dark:text-[#E2D9F3] transition-all duration-200 font-[inherit] outline-none focus:border-[#7c3aed] dark:focus:border-[#7C4DFF] focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#f8fafc] placeholder:text-[#94a3b8] placeholder:text-[0.9375rem]"
                  />
                </div>

                <div className="flex gap-3 mt-6 max-[640px]:flex-col">
                  <button
                    type="button"
                    className="flex-1 py-3.5 px-6 bg-white dark:bg-[#1E1B24] text-[#333] dark:text-[#9E95A8] border-2 border-[#e0e0e0] dark:border-[#3a3642] rounded-lg text-[0.95rem] font-semibold cursor-pointer transition-all duration-200 font-[inherit] hover:not-disabled:bg-[#f5f5f5] hover:not-disabled:border-[#7c3aed] disabled:opacity-60 disabled:cursor-not-allowed max-[640px]:w-full"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isResetting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 mt-0 py-3.5 px-6 bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white border-none rounded-lg text-[0.95rem] font-semibold cursor-pointer transition-all duration-200 font-[inherit] shadow-[0_4px_12px_rgba(124,58,237,0.25)] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_16px_rgba(124,58,237,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none max-[640px]:w-full"
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
