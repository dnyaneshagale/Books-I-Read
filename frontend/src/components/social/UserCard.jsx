import React from 'react';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';
import './UserCard.css';

/**
 * UserCard - Compact user card for displaying in lists
 * 
 * @param {Object} props
 * @param {Object} props.user - User data
 * @param {boolean} props.showFollowButton - Show follow button
 * @param {boolean} props.isOwnProfile - Is this the current user
 * @param {function} props.onFollowChange - Callback when follow status changes
 */
const UserCard = ({
  user,
  showFollowButton = true,
  isOwnProfile = false,
  onFollowChange,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const handleFollowChange = (status) => {
    onFollowChange?.(user.id, status);
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    const name = user.displayName || user.username;
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="user-card" onClick={handleCardClick}>
      <div className="user-card__avatar">
        {user.profilePictureUrl ? (
          <img src={user.profilePictureUrl} alt={user.username} />
        ) : (
          <div className="user-card__avatar-fallback">
            {getInitials()}
          </div>
        )}
        {!user.isPublic && (
          <span className="user-card__private-badge" title="Private account">
            🔒
          </span>
        )}
      </div>

      <div className="user-card__info">
        <div className="user-card__name">
          {user.displayName || user.username}
        </div>
        <div className="user-card__username">@{user.username}</div>
        {user.bio && (
          <div className="user-card__bio">{user.bio}</div>
        )}
        <div className="user-card__stats">
          <span>{user.followersCount || 0} followers</span>
          <span className="user-card__stats-divider">•</span>
          <span>{user.booksCount || 0} books</span>
        </div>
      </div>

      {showFollowButton && !isOwnProfile && (
        <div className="user-card__actions" onClick={(e) => e.stopPropagation()}>
          <FollowButton
            userId={user.id}
            isFollowing={user.isFollowing}
            hasPendingRequest={user.hasPendingRequest}
            isPublic={user.isPublic}
            onFollowChange={handleFollowChange}
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default UserCard;
