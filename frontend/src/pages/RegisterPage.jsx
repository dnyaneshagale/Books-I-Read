import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import authApi from '../authApi';
import toast from 'react-hot-toast';

/**
 * RegisterPage - User registration form
 */

const inputCls = "w-full py-3.5 px-[1.125rem] bg-white border-2 border-slate-300 rounded-[10px] text-base text-slate-800 transition-all duration-200 font-[inherit] focus:outline-none focus:border-violet-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 placeholder:text-slate-400 placeholder:text-[0.9375rem] dark:bg-[var(--color-bg)] dark:border-[var(--border-color)] dark:text-[var(--text-primary)]";
const labelCls = "text-[0.9375rem] font-semibold text-slate-800 tracking-tight dark:text-[var(--text-primary)]";

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const { register } = useAuth();
  const navigate = useNavigate();
  const usernameTimerRef = useRef(null);

  // Debounced username availability check
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

    // Validation
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

    // Email validation (basic)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-8 max-sm:p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl py-14 px-12 max-w-[440px] w-full shadow-lg max-sm:py-8 max-sm:px-6">
        <h1 className="text-[2rem] font-bold text-[var(--text-primary)] mb-2.5 text-center tracking-tight max-sm:text-[1.625rem]">Create Account</h1>
        <p className="text-[var(--text-secondary)] text-center mb-10 text-base leading-normal">Start tracking your reading journey</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="username" className={labelCls}>Username</label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Unique username (3-50 characters)"
                disabled={isLoading}
                autoFocus
                className={`${inputCls} ${usernameStatus === 'taken' ? '!border-red-600 focus:!shadow-[0_0_0_3px_rgba(220,38,38,0.12)] focus:!border-red-600' : usernameStatus === 'available' ? '!border-green-600 focus:!shadow-[0_0_0_3px_rgba(5,150,105,0.12)] focus:!border-green-600' : ''}`}
              />
              {usernameStatus === 'checking' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] font-semibold pointer-events-none text-gray-500 dark:text-gray-400">Checking...</span>}
              {usernameStatus === 'available' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] font-semibold pointer-events-none text-green-600 dark:text-emerald-400">✓ Available</span>}
              {usernameStatus === 'taken' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] font-semibold pointer-events-none text-red-600 dark:text-red-400">✗ Already taken</span>}
              {usernameStatus === 'invalid' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] font-semibold pointer-events-none text-red-600 dark:text-red-400">3-50 characters required</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="displayName" className={labelCls}>Display Name <span style={{color: '#9ca3af', fontWeight: 400}}>(optional)</span></label>
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
            <label htmlFor="email" className={labelCls}>Email</label>
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
            <label htmlFor="password" className={labelCls}>Password</label>
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
            <label htmlFor="confirmPassword" className={labelCls}>Confirm Password</label>
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

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[var(--border-color)] text-center">
          <p className="text-[var(--text-secondary)] text-[0.9375rem] m-0 leading-relaxed">
            Already have an account?{' '}
            <a href="/login" className="text-violet-600 font-bold no-underline transition-all duration-200 px-0.5 hover:text-violet-700 hover:underline hover:underline-offset-[3px]">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
