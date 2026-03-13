import React, { useState } from 'react';
import socialApi from '../../api/socialApi';
import toast from 'react-hot-toast';

/**
 * FollowButton - Instagram-like follow/unfollow button
 */
const FollowButton = ({
  userId,
  isFollowing: initialIsFollowing = false,
  hasPendingRequest: initialHasPendingRequest = false,
  onFollowChange,
  size = 'medium',
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [hasPendingRequest, setHasPendingRequest] = useState(initialHasPendingRequest);
  const [loading, setLoading] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);

  const handleFollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await socialApi.followUser(userId);
      const status = response.data.status;
      if (status === 'followed') {
        setIsFollowing(true);
        setHasPendingRequest(false);
        toast.success('Following!');
        onFollowChange?.({ isFollowing: true, hasPendingRequest: false });
      } else if (status === 'requested') {
        setHasPendingRequest(true);
        toast.success('Follow request sent');
        onFollowChange?.({ isFollowing: false, hasPendingRequest: true });
      } else if (status === 'already_following') {
        setIsFollowing(true);
      } else if (status === 'already_requested') {
        setHasPendingRequest(true);
      }
    } catch (error) {
      console.error('Failed to follow:', error);
      toast.error('Failed to follow user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await socialApi.unfollowUser(userId);
      setIsFollowing(false);
      setHasPendingRequest(false);
      setShowUnfollowConfirm(false);
      toast.success('Unfollowed');
      onFollowChange?.({ isFollowing: false, hasPendingRequest: false });
    } catch (error) {
      console.error('Failed to unfollow:', error);
      toast.error('Failed to unfollow user');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await socialApi.cancelFollowRequest(userId);
      setHasPendingRequest(false);
      toast.success('Request cancelled');
      onFollowChange?.({ isFollowing: false, hasPendingRequest: false });
    } catch (error) {
      console.error('Failed to cancel request:', error);
      toast.error('Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (isFollowing) {
      setShowUnfollowConfirm(true);
    } else if (hasPendingRequest) {
      handleCancelRequest();
    } else {
      handleFollow();
    }
  };

  const getButtonText = () => {
    if (loading) return '...';
    if (isFollowing) return 'Following';
    if (hasPendingRequest) return 'Requested';
    return 'Follow';
  };

  const sizeClasses = {
    small: 'py-1.5 px-3 text-xs',
    medium: 'py-2 px-5 text-sm',
    large: 'py-2.5 px-7 text-base',
  };

  const stateClasses = isFollowing
    ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:bg-[var(--color-bg-secondary)] dark:text-[var(--color-text-primary)] dark:border-[var(--color-border)] dark:hover:bg-red-950 dark:hover:border-red-900 dark:hover:text-red-300'
    : hasPendingRequest
      ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 dark:bg-[var(--color-bg-secondary)] dark:text-[var(--color-text-secondary)] dark:border-[var(--color-border)] dark:hover:bg-amber-950 dark:hover:border-amber-900 dark:hover:text-amber-300'
      : 'bg-[var(--color-primary)] text-white border-none hover:bg-[var(--color-primary-hover)] hover:-translate-y-px';

  return (
    <>
      <button
        className={`font-semibold rounded-lg cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] inline-flex items-center justify-center whitespace-nowrap active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${stateClasses} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={handleButtonClick}
        disabled={loading}
      >
        {getButtonText()}
      </button>

      {showUnfollowConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fade-in" onClick={() => setShowUnfollowConfirm(false)}>
          <div className="bg-[var(--color-bg)] rounded-xl p-6 max-w-[320px] w-[90%] text-center animate-fade-in-up dark:bg-[var(--color-bg)] dark:border dark:border-[var(--color-border)]" onClick={(e) => e.stopPropagation()}>
            <p className="mb-5 text-base font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">Unfollow this user?</p>
            <div className="flex gap-3 justify-center">
              <button
                className="py-2.5 px-6 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-border)] dark:bg-[var(--color-bg-secondary)] dark:text-[var(--color-text-primary)] dark:border-[var(--color-border)] dark:hover:bg-[var(--color-border)]"
                onClick={() => setShowUnfollowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="py-2.5 px-6 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 bg-red-600 text-white border-none hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleUnfollow}
                disabled={loading}
              >
                {loading ? 'Unfollowing...' : 'Unfollow'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FollowButton;
