import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authApi from '../authApi';
import './LoginPage.css';

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
      navigate('/');
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
    <div className="auth-container">
      <div className="auth-card">
        <h1>Books I Read</h1>
        <p className="auth-subtitle">Track your reading journey</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email"
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button
              type="button"
              className="forgot-password-link"
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

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <a href="/register" className="auth-link">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reset Password</h2>
              <button
                className="btn-close-modal"
                onClick={() => setShowForgotPassword(false)}
                disabled={isResetting}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Enter your username or email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handlePasswordReset}>
                <div className="form-group">
                  <label htmlFor="resetEmail">Username or Email</label>
                  <input
                    type="text"
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your username or email"
                    disabled={isResetting}
                    autoFocus
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isResetting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
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
