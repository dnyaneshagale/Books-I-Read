import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import authApi from '../authApi';
import toast from 'react-hot-toast';

/**
 * RegisterPage - User registration form
 */
const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const usernameTimerRef = useRef(null);

  const checkUsernameAvailability = useCallback((value) => {
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current);

    if (!value || value.length < 3) {
      setUsernameStatus(value.length > 0 ? 'invalid' : null);
      return;
    }
    if (value.length > 50) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await authApi.checkUsername(value);
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 400);
  }, []);

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    checkUsernameAvailability(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (username.length < 3 || username.length > 50) {
      toast.error('Username must be 3-50 characters');
      return;
    }

    if (usernameStatus === 'taken') {
      toast.error('Username is already taken');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    setIsLoading(true);

    const result = await register(username, email, password, displayName);

    setIsLoading(false);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  // Shared input classes
  const inputCls = "w-full py-3.5 px-[1.125rem] bg-white dark:bg-[#0F0C15] border-2 border-[#cbd5e1] dark:border-[#2D2A35] rounded-[10px] text-base text-[#1e293b] dark:text-[#E2D9F3] transition-all duration-200 font-[inherit] outline-none focus:border-[#7c3aed] dark:focus:border-[#7C4DFF] focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#f8fafc] placeholder:text-[#94a3b8] placeholder:text-[0.9375rem] box-border";

  const getInputBorderCls = () => {
    if (usernameStatus === 'taken') return '!border-[#dc2626] focus:!shadow-[0_0_0_3px_rgba(220,38,38,0.12)] focus:!border-[#dc2626]';
    if (usernameStatus === 'available') return '!border-[#059669] focus:!shadow-[0_0_0_3px_rgba(5,150,105,0.12)] focus:!border-[#059669]';
    return '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary dark:bg-bg p-8 max-[640px]:p-4">
      <div className="bg-bg-secondary dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl py-14 px-12 max-w-[440px] w-full shadow-lg max-[640px]:py-8 max-[640px]:px-6">
        <h1 className="text-[2rem] font-bold text-txt-primary dark:text-[#E2D9F3] m-0 mb-2.5 text-center tracking-tight max-[640px]:text-[1.625rem]">Create Account</h1>
        <p className="text-txt-secondary dark:text-[#9E95A8] text-center m-0 mb-10 text-base leading-normal">Start tracking your reading journey</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="username" className="text-[0.9375rem] font-semibold text-[#1e293b] dark:text-[#E2D9F3] tracking-tight">Username</label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Unique username (3-50 characters)"
                disabled={isLoading}
                autoFocus
                className={`${inputCls} ${getInputBorderCls()}`}
              />
              {usernameStatus === 'checking' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] font-semibold pointer-events-none text-[#6b7280] dark:text-[#9ca3af]">Checking...</span>}
              {usernameStatus === 'available' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] font-semibold pointer-events-none text-[#059669] dark:text-[#34d399]">✓ Available</span>}
              {usernameStatus === 'taken' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] font-semibold pointer-events-none text-[#dc2626] dark:text-[#f87171]">✗ Already taken</span>}
              {usernameStatus === 'invalid' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] font-semibold pointer-events-none text-[#dc2626] dark:text-[#f87171]">3-50 characters required</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="displayName" className="text-[0.9375rem] font-semibold text-[#1e293b] dark:text-[#E2D9F3] tracking-tight">Display Name <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name shown to others"
              disabled={isLoading}
              maxLength={100}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="email" className="text-[0.9375rem] font-semibold text-[#1e293b] dark:text-[#E2D9F3] tracking-tight">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={isLoading}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="password" className="text-[0.9375rem] font-semibold text-[#1e293b] dark:text-[#E2D9F3] tracking-tight">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              disabled={isLoading}
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="confirmPassword" className="text-[0.9375rem] font-semibold text-[#1e293b] dark:text-[#E2D9F3] tracking-tight">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={isLoading}
              className={inputCls}
            />
          </div>

          <button type="submit" className="mt-3 py-4 px-6 bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white border-none rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-200 font-[inherit] shadow-[0_4px_12px_rgba(124,58,237,0.25)] hover:not-disabled:from-[#6d28d9] hover:not-disabled:to-[#5b21b6] hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_6px_16px_rgba(124,58,237,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-border dark:border-[#2D2A35] text-center">
          <p className="text-txt-secondary dark:text-[#9E95A8] text-[0.9375rem] m-0 leading-relaxed">
            Already have an account?{' '}
            <a href="/login" className="text-[#7c3aed] dark:text-[#7C4DFF] font-bold no-underline transition-all duration-200 px-0.5 hover:text-[#6d28d9] hover:underline hover:underline-offset-[3px]">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
