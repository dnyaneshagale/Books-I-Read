import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import FollowButton from './FollowButton';

/**
 * UserCard - Compact user card for displaying in lists
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

  const getInitials = () => {
    const name = user.displayName || user.username;
    return name.charAt(0).toUpperCase();
  };

  return (
    <div
      className="flex items-center gap-3 py-3 px-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-bg-secondary)] hover:border-[var(--color-primary)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(109,40,217,0.08)] dark:bg-[var(--color-bg)] dark:border-[var(--color-border)] dark:hover:bg-[var(--color-bg-secondary)] dark:hover:border-[var(--color-primary)]"
      onClick={handleCardClick}
    >
      <div className="relative shrink-0 w-12 h-12">
        {user.profilePictureUrl ? (
          <img src={user.profilePictureUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-400 text-white flex items-center justify-center font-semibold text-xl">
            {getInitials()}
          </div>
        )}
        {!user.isPublic && (
          <span className="absolute -bottom-0.5 -right-0.5 text-[0.7rem] bg-[var(--color-bg)] rounded-full p-0.5 leading-none dark:bg-[var(--color-bg)]" title="Private account">
            <Lock className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.9375rem] text-[var(--color-text-primary)] truncate dark:text-[var(--color-text-primary)]">
          {user.displayName || user.username}
        </div>
        <div className="text-[0.8125rem] text-[var(--color-text-secondary)] mt-0.5 dark:text-[var(--color-text-secondary)]">@{user.username}</div>
        {user.bio && (
          <div className="text-[0.8125rem] text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-snug dark:text-[var(--color-text-secondary)]">{user.bio}</div>
        )}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--color-text-light)] dark:text-[var(--color-text-light)]">
          <span>{user.followersCount || 0} followers</span>
          <span className="opacity-50">•</span>
          <span>{user.booksCount || 0} books</span>
        </div>
      </div>

      {showFollowButton && !isOwnProfile && (
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
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
