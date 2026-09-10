import React from 'react';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';

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
    <div className="flex items-center gap-3 py-3 px-4 bg-bg dark:bg-[var(--color-bg,#0F0C15)] rounded-xl border border-border dark:border-[var(--color-border,#3b3670)] cursor-pointer transition-all duration-200 hover:bg-bg-secondary dark:hover:bg-[var(--color-bg-secondary,#1e1b4b)] hover:border-primary dark:hover:border-[var(--color-primary,#7C4DFF)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(109,40,217,0.08)]" onClick={handleCardClick}>
      <div className="relative flex-shrink-0 w-12 h-12">
        {user.profilePictureUrl ? (
          <img src={user.profilePictureUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-purple-400 dark:from-[var(--color-primary,#7C4DFF)] dark:to-purple-400 text-white flex items-center justify-center font-semibold text-xl">
            {getInitials()}
          </div>
        )}
        {!user.isPublic && (
          <span className="absolute -bottom-0.5 -right-0.5 text-[0.7rem] bg-bg dark:bg-[var(--color-bg,#0F0C15)] rounded-full p-0.5 leading-none" title="Private account">
            🔒
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.9375rem] text-txt-primary dark:text-[var(--color-text-primary,#e2e8f0)] whitespace-nowrap overflow-hidden text-ellipsis">
          {user.displayName || user.username}
        </div>
        <div className="text-[0.8125rem] text-txt-secondary dark:text-[var(--color-text-secondary,#a5b4fc)] mt-0.5">@{user.username}</div>
        {user.bio && (
          <div className="text-[0.8125rem] text-txt-secondary dark:text-[var(--color-text-secondary,#a5b4fc)] mt-1 line-clamp-2 leading-[1.4]">
            {user.bio}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#94a3b8] dark:text-[#6366f1]">
          <span>{user.followersCount || 0} followers</span>
          <span className="opacity-50">•</span>
          <span>{user.booksCount || 0} books</span>
        </div>
      </div>

      {showFollowButton && !isOwnProfile && (
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
