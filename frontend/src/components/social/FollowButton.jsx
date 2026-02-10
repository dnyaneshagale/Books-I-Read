import React, { useState } from 'react';
import socialApi from '../../api/socialApi';
import toast from 'react-hot-toast';
import './FollowButton.css';

/**
 * FollowButton - Instagram-like follow/unfollow button
 * 
 * States:
 * - "Follow" - Not following, public account
 * - "Requested" - Pending follow request for private account
 * - "Following" - Currently following
 * 
 * @param {Object} props
 * @param {number} props.userId - Target user ID
 * @param {boolean} props.isFollowing - Initial following state
 * @param {boolean} props.hasPendingRequest - Has pending request
 * @param {boolean} props.isPublic - Target account is public
 * @param {function} props.onFollowChange - Callback when follow status changes
 * @param {string} props.size - 'small' | 'medium' | 'large'
 */
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

  const getButtonClass = () => {
    let classes = `follow-btn follow-btn--${size}`;
    if (isFollowing) classes += ' follow-btn--following';
    if (hasPendingRequest) classes += ' follow-btn--requested';
    if (!isFollowing && !hasPendingRequest) classes += ' follow-btn--follow';
    if (loading) classes += ' follow-btn--loading';
    return classes;
  };

  return (
    <>
      <button
        className={getButtonClass()}
        onClick={handleButtonClick}
        disabled={loading}
      >
        {getButtonText()}
      </button>

      {/* Unfollow Confirmation Modal */}
      {showUnfollowConfirm && (
        <div className="unfollow-modal-overlay" onClick={() => setShowUnfollowConfirm(false)}>
          <div className="unfollow-modal" onClick={(e) => e.stopPropagation()}>
            <p>Unfollow this user?</p>
            <div className="unfollow-modal-actions">
              <button
                className="unfollow-modal-btn unfollow-modal-btn--cancel"
                onClick={() => setShowUnfollowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="unfollow-modal-btn unfollow-modal-btn--unfollow"
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
