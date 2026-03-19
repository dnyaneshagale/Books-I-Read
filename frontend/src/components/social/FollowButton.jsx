import React, { useState } from 'react';
import socialApi from '../../api/socialApi';
import toast from 'react-hot-toast';

const sizeClasses = {
  small: 'py-1.5 px-3 text-xs',
  medium: 'py-2 px-5 text-sm',
  large: 'py-2.5 px-7 text-base',
};

const FollowButton = ({
  userId,
  isFollowing: initialIsFollowing = false,
  hasPendingRequest: initialHasPendingRequest = false,
  isPublic = true,
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
      if (status === 'followed') { setIsFollowing(true); setHasPendingRequest(false); toast.success('Following!'); onFollowChange?.({ isFollowing: true, hasPendingRequest: false }); }
      else if (status === 'requested') { setHasPendingRequest(true); toast.success('Follow request sent'); onFollowChange?.({ isFollowing: false, hasPendingRequest: true }); }
      else if (status === 'already_following') { setIsFollowing(true); }
      else if (status === 'already_requested') { setHasPendingRequest(true); }
    } catch (error) { console.error('Failed to follow:', error); toast.error('Failed to follow user'); }
    finally { setLoading(false); }
  };

  const handleUnfollow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await socialApi.unfollowUser(userId);
      setIsFollowing(false); setHasPendingRequest(false); setShowUnfollowConfirm(false);
      toast.success('Unfollowed'); onFollowChange?.({ isFollowing: false, hasPendingRequest: false });
    } catch (error) { console.error('Failed to unfollow:', error); toast.error('Failed to unfollow user'); }
    finally { setLoading(false); }
  };

  const handleCancelRequest = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await socialApi.cancelFollowRequest(userId);
      setHasPendingRequest(false); toast.success('Request cancelled'); onFollowChange?.({ isFollowing: false, hasPendingRequest: false });
    } catch (error) { console.error('Failed to cancel request:', error); toast.error('Failed to cancel request'); }
    finally { setLoading(false); }
  };

  const handleButtonClick = () => {
    if (isFollowing) setShowUnfollowConfirm(true);
    else if (hasPendingRequest) handleCancelRequest();
    else handleFollow();
  };

  const getButtonText = () => {
    if (loading) return '...';
    if (isFollowing) return 'Following';
    if (hasPendingRequest) return 'Requested';
    return 'Follow';
  };

  const getButtonClasses = () => {
    const base = `font-semibold rounded-lg cursor-pointer transition-all duration-200 border-none inline-flex items-center justify-center whitespace-nowrap active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]}`;
    if (loading) return `${base} opacity-70 cursor-not-allowed`;
    if (isFollowing) return `${base} bg-bg-secondary dark:bg-[var(--color-bg-secondary,#1e1b4b)] text-txt-primary dark:text-[var(--color-text-primary,#e2e8f0)] border border-border dark:border-[var(--color-border,#3b3670)] hover:bg-red-100 hover:border-red-200 hover:text-red-600 dark:hover:bg-[#450a0a] dark:hover:border-[#7f1d1d] dark:hover:text-red-300`;
    if (hasPendingRequest) return `${base} bg-bg-secondary dark:bg-[var(--color-bg-secondary,#1e1b4b)] text-txt-secondary dark:text-[var(--color-text-secondary,#a5b4fc)] border border-border dark:border-[var(--color-border,#3b3670)] hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 dark:hover:bg-[#451a03] dark:hover:border-[#78350f] dark:hover:text-amber-300`;
    return `${base} bg-primary text-white hover:bg-primary-hover hover:-translate-y-px`;
  };

  return (
    <>
      <button className={getButtonClasses()} onClick={handleButtonClick} disabled={loading}>
        {getButtonText()}
      </button>

      {showUnfollowConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] animate-fade-in" onClick={() => setShowUnfollowConfirm(false)}>
          <div className="bg-bg dark:bg-[var(--color-bg,#0F0C15)] dark:border dark:border-[var(--color-border,#3b3670)] rounded-xl p-6 max-w-[320px] w-[90%] text-center animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <p className="m-0 mb-5 text-base font-medium text-txt-primary dark:text-[var(--color-text-primary,#e2e8f0)]">Unfollow this user?</p>
            <div className="flex gap-3 justify-center">
              <button className="py-2.5 px-6 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 bg-bg-secondary dark:bg-[var(--color-bg-secondary,#1e1b4b)] text-txt-primary dark:text-[var(--color-text-primary,#e2e8f0)] border border-border dark:border-[var(--color-border,#3b3670)] hover:bg-border dark:hover:bg-[var(--color-border,#3b3670)]" onClick={() => setShowUnfollowConfirm(false)}>Cancel</button>
              <button className="py-2.5 px-6 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-200 bg-red-600 text-white border-none hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleUnfollow} disabled={loading}>{loading ? 'Unfollowing...' : 'Unfollow'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FollowButton;
