import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPasswordConfirm } from '../authApi';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!token) { toast.error('Invalid reset link'); return; }

    setIsSubmitting(true);
    try {
      await resetPasswordConfirm({ token, newPassword: password });
      toast.success('Password reset successful! Please login with your new password.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-600 p-5">
        <div className="w-full max-w-[450px]">
          <div className="bg-white rounded-2xl py-12 px-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] text-center max-sm:py-8 max-sm:px-6">
            <div className="text-[64px] mb-6 max-sm:text-[52px]">❌</div>
            <h1 className="text-[28px] font-bold text-gray-900 mb-3 max-sm:text-2xl">Invalid Reset Link</h1>
            <p className="text-gray-600 mb-0">This password reset link is invalid or malformed.</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 py-3.5 px-8 bg-gradient-to-br from-indigo-400 to-purple-600 text-white border-none rounded-lg text-[15px] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)]"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-600 p-5">
      <div className="w-full max-w-[450px]">
        <div className="bg-white rounded-2xl py-12 px-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] text-center max-sm:py-8 max-sm:px-6">
          <div className="text-[64px] mb-6 animate-bounce max-sm:text-[52px]">🔐</div>
          <h1 className="text-[28px] font-bold text-gray-900 mb-3 max-sm:text-2xl">Reset Your Password</h1>
          <p className="text-gray-500 text-base mb-8">Enter your new password below</p>

          <form onSubmit={handleSubmit} className="text-left">
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={isSubmitting}
                autoFocus
                minLength={6}
                className="w-full py-3.5 px-4 border-2 border-gray-200 rounded-lg text-[15px] transition-all duration-200 focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <small className="block mt-1.5 text-[13px] text-gray-400">At least 6 characters</small>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={isSubmitting}
                minLength={6}
                className="w-full py-3.5 px-4 border-2 border-gray-200 rounded-lg text-[15px] transition-all duration-200 focus:outline-none focus:border-indigo-400 focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-br from-indigo-400 to-purple-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mb-3 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_20px_rgba(102,126,234,0.4)] active:enabled:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-transparent text-gray-500 border-2 border-gray-200 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:enabled:bg-gray-100 hover:enabled:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
