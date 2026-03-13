import React from 'react';
import toast from 'react-hot-toast';
import { Share2, Copy, Mail, Link2, UserRound, BookOpen, Check } from 'lucide-react';
import ModalShell from './ui/modal-shell';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

function ShareProfileModal({ username, totalBooks = 0, onClose }) {
  useBodyScrollLock();

  const profileUrl = `${window.location.origin}/profile/${username}`;

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied!');
    } catch {
      toast.error('Could not copy profile link');
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      copyProfileLink();
      return;
    }

    try {
      await navigator.share({
        title: `${username}'s profile on Books I Read`,
        text: `Check out ${username}'s reading profile on Books I Read`,
        url: profileUrl,
      });
    } catch {
      // User cancellation does not need an error toast.
    }
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(`${username}'s profile on Books I Read`);
    const body = encodeURIComponent(`Take a look at ${username}'s reading profile:\n\n${profileUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <ModalShell
      onClose={onClose}
      title="Share Profile"
      icon={<Share2 className="w-5 h-5" />}
      contentClassName="max-w-[560px] max-h-[90vh] overflow-y-auto max-md:max-w-[calc(100vw-var(--spacing-lg))] max-md:m-2"
      bodyClassName="p-[var(--spacing-lg)]"
    >
          <div className="rounded-2xl border border-violet-200/60 dark:border-violet-400/20 bg-gradient-to-br from-violet-50 via-white to-indigo-50/60 dark:from-violet-950/20 dark:via-[var(--color-bg-secondary)] dark:to-indigo-950/20 p-4 mb-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2 text-[var(--color-text-primary)]">
                <UserRound className="w-4 h-4 text-violet-600" />
                <span className="font-semibold">@{username}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-violet-600/10 text-violet-700 dark:text-violet-300">
                <BookOpen className="w-3.5 h-3.5" />
                {totalBooks} books tracked
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] dark:bg-black/20 px-3 py-2.5 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[var(--color-text-secondary)] shrink-0" />
              <p className="text-xs text-[var(--color-text-secondary)] truncate m-0">{profileUrl}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-2.5 mb-4">
            <button
              className="btn-primary !mt-0 inline-flex items-center justify-center gap-2"
              onClick={copyProfileLink}
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <button
              className="btn-secondary !mt-0 inline-flex items-center justify-center gap-2"
              onClick={nativeShare}
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              className="btn-secondary !mt-0 inline-flex items-center justify-center gap-2 min-[520px]:col-span-2"
              onClick={shareByEmail}
            >
              <Mail className="w-4 h-4" />
              Share via Email
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-tertiary)] px-3.5 py-3 inline-flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="m-0 text-sm text-[var(--color-text-secondary)]">Anyone with your link can view your public profile. Private account settings are still respected.</p>
          </div>
    </ModalShell>
  );
}

export default ShareProfileModal;
