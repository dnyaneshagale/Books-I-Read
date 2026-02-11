import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import socialApi from '../api/socialApi';
import authApi from '../authApi';
import reviewApi from '../api/reviewApi';
import listApi from '../api/listApi';
import FollowButton from '../components/social/FollowButton';
import UserCard from '../components/social/UserCard';
import ReviewCard from '../components/social/ReviewCard';
import ProfilePhotoCropModal from '../components/social/ProfilePhotoCropModal';
import toast from 'react-hot-toast';
import './ProfilePage.css';

// ============================================
// SVG Icon Components
// ============================================

const BackIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
  </svg>
);

const LockIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ opacity: 0.5 }}>
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
  </svg>
);

const ReviewIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
  </svg>
);

const ReflectionIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
    <path d="M12 15l1.57-3.43L17 10l-3.43-1.57L12 5l-1.57 3.43L7 10l3.43 1.57z" />
  </svg>
);

const RequestsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill={filled ? '#ef4444' : 'currentColor'}>
    <path d={filled
      ? "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z"
      : "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2zM12 18.55l-.36-.24C7.39 15.42 4 11.85 4 7.35 4 5.56 5.45 4 7.24 4c1.18 0 2.31.65 2.98 1.69L12 7.99l1.78-2.3A3.505 3.505 0 0116.76 4C18.55 4 20 5.56 20 7.35c0 4.5-3.39 8.07-7.64 10.96L12 18.55z"
    } />
  </svg>
);

const CommentBubbleIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
  </svg>
);
const BookmarkIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill={filled ? '#f59e0b' : 'none'} stroke={filled ? '#f59e0b' : 'currentColor'} strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z" />
  </svg>
);

// ============================================
// Skeleton Loader
// ============================================

const SkeletonLoader = () => (
  <div className="pp-skeleton" aria-hidden="true">
    <div className="pp-skeleton__header">
      <div className="pp-skeleton__avatar" />
      <div className="pp-skeleton__info">
        <div className="pp-skeleton__line pp-skeleton__line--name" />
        <div className="pp-skeleton__line pp-skeleton__line--handle" />
        <div className="pp-skeleton__stats-row">
          <div className="pp-skeleton__stat" />
          <div className="pp-skeleton__stat" />
          <div className="pp-skeleton__stat" />
        </div>
      </div>
    </div>
    <div className="pp-skeleton__bio">
      <div className="pp-skeleton__line pp-skeleton__line--full" />
      <div className="pp-skeleton__line pp-skeleton__line--half" />
    </div>
    <div className="pp-skeleton__tabs">
      <div className="pp-skeleton__tab" />
      <div className="pp-skeleton__tab" />
      <div className="pp-skeleton__tab" />
      <div className="pp-skeleton__tab" />
    </div>
    <div className="pp-skeleton__grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="pp-skeleton__card" />
      ))}
    </div>
  </div>
);

// ============================================
// Star Rating
// ============================================

const StarRating = ({ rating }) => (
  <span className="pp-star-rating">
    {[1, 2, 3, 4, 5].map(i => (
      <StarIcon key={i} filled={i <= rating} />
    ))}
  </span>
);

/**
 * ProfilePage — Instagram-style user profile
 */
const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');
  const [profileBooks, setProfileBooks] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [lists, setLists] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [requestsCount, setRequestsCount] = useState(0);
  const [savedItems, setSavedItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editUsernameStatus, setEditUsernameStatus] = useState(null);
  const editUsernameTimerRef = useRef(null);

  useEffect(() => { loadProfile(); }, [username]);

  useEffect(() => {
    if (profile) {
      const canView = profile.isPublic || profile.isOwnProfile || profile.isFollowing;
      if (canView) { loadProfileBooks(); loadReviews(); loadLists(); loadReflections(); }
    }
  }, [profile?.id, profile?.isFollowing]);

  useEffect(() => {
    if (profile?.isOwnProfile) loadRequestsCount();
  }, [profile?.isOwnProfile]);

  // ── Data Loaders ──
  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = username
        ? await socialApi.getProfile(username)
        : await socialApi.getMyProfile();
      setProfile(response.data);
      setEditForm({
        username: response.data.username || '',
        displayName: response.data.displayName || '',
        bio: response.data.bio || '',
        isPublic: response.data.isPublic,
        favoriteGenres: response.data.favoriteGenres || [],
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
      navigate('/');
    } finally { setLoading(false); }
  };

  const loadProfileBooks = async () => {
    try {
      const profileUsername = username || currentUser?.username;
      if (!profileUsername) return;
      const response = await socialApi.getUserBooks(profileUsername);
      setProfileBooks(response.data || []);
    } catch (error) { console.error('Failed to load books:', error); }
  };

  const loadFollowers = async () => {
    if (!profile) return;
    try {
      const response = await socialApi.getFollowers(profile.id);
      setFollowers(response.data.content || []);
    } catch (error) {
      console.error('Failed to load followers:', error);
      if (error.response?.status === 403) toast.error('This account is private');
    }
  };

  const loadFollowing = async () => {
    if (!profile) return;
    try {
      const response = await socialApi.getFollowing(profile.id);
      setFollowing(response.data.content || []);
    } catch (error) {
      console.error('Failed to load following:', error);
      if (error.response?.status === 403) toast.error('This account is private');
    }
  };

  const loadReviews = async () => {
    if (!profile) return;
    try {
      const response = await reviewApi.getUserReviews(profile.id, 0, 20);
      setReviews(response.data.content || []);
    } catch (error) { console.error('Failed to load reviews:', error); }
  };

  const loadLists = async () => {
    if (!profile) return;
    try {
      const response = await listApi.getUserLists(profile.id);
      setLists(response.data || []);
    } catch (error) { console.error('Failed to load lists:', error); }
  };

  const loadReflections = async () => {
    if (!profile) return;
    try {
      const response = await socialApi.getUserReflections(profile.id, 0, 50);
      setReflections(response.data.content || []);
    } catch (error) { console.error('Failed to load reflections:', error); }
  };

  const loadRequestsCount = async () => {
    try {
      const response = await socialApi.getPendingRequestsCount();
      setRequestsCount(response.data.count || 0);
    } catch (error) { console.error('Failed to load requests count:', error); }
  };

  const loadFollowRequests = async () => {
    try {
      const response = await socialApi.getPendingRequests();
      setFollowRequests(response.data.content || []);
      setRequestsCount(response.data.content?.length || 0);
    } catch (error) { console.error('Failed to load follow requests:', error); }
  };

  const loadSavedItems = async () => {
    try {
      const [reviewsRes, reflectionsRes] = await Promise.all([
        reviewApi.getSavedReviews(0, 50),
        socialApi.getSavedReflections(0, 50),
      ]);
      const reviews = (reviewsRes.data.content || []).map(r => ({ ...r, _type: 'review' }));
      const reflections = (reflectionsRes.data.content || []).map(r => ({ ...r, _type: 'reflection' }));
      const merged = [...reviews, ...reflections].sort(
        (a, b) => new Date(b.savedAt || b.createdAt) - new Date(a.savedAt || a.createdAt)
      );
      setSavedItems(merged);
    } catch (error) { console.error('Failed to load saved items:', error); }
  };

  // ── Tab Change ──
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const loaders = {
      books: loadProfileBooks, followers: loadFollowers, following: loadFollowing,
      reviews: loadReviews, lists: loadLists, reflections: loadReflections,
      requests: loadFollowRequests, saved: loadSavedItems,
    };
    loaders[tab]?.();
  };

  // ── Follow / Requests / Edit ──
  const handleApproveRequest = async (requestId) => {
    try {
      await socialApi.approveFollowRequest(requestId);
      toast.success('Follow request approved');
      setFollowRequests(prev => prev.filter(r => r.requestId !== requestId));
      setRequestsCount(prev => Math.max(0, prev - 1));
      setProfile(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
    } catch { toast.error('Failed to approve request'); }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await socialApi.rejectFollowRequest(requestId);
      toast.success('Follow request rejected');
      setFollowRequests(prev => prev.filter(r => r.requestId !== requestId));
      setRequestsCount(prev => Math.max(0, prev - 1));
    } catch { toast.error('Failed to reject request'); }
  };

  const handleFollowChange = (status) => {
    setProfile(prev => ({
      ...prev,
      isFollowing: status.isFollowing,
      hasPendingRequest: status.hasPendingRequest,
      followersCount: status.isFollowing
        ? prev.followersCount + 1
        : Math.max(0, prev.followersCount - 1),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editUsernameStatus === 'taken') return toast.error('Username is already taken');
    if (editUsernameStatus === 'invalid') return toast.error('Username must be 3-50 characters');
    try {
      const oldUsername = profile.username;
      const response = await socialApi.updateProfile(editForm);
      setProfile(response.data);
      setIsEditing(false);
      setEditUsernameStatus(null);
      toast.success('Profile updated');
      if (editForm.username && editForm.username !== oldUsername) {
        const updatedUser = { ...currentUser, username: editForm.username };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        navigate(`/profile/${editForm.username}`, { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleEditUsernameChange = (value) => {
    setEditForm(prev => ({ ...prev, username: value }));
    if (editUsernameTimerRef.current) clearTimeout(editUsernameTimerRef.current);
    if (value === profile?.username) { setEditUsernameStatus('same'); return; }
    if (!value || value.length < 3 || value.length > 50) {
      setEditUsernameStatus(value.length > 0 ? 'invalid' : null); return;
    }
    setEditUsernameStatus('checking');
    editUsernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await authApi.checkUsername(value);
        setEditUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch { setEditUsernameStatus(null); }
    }, 400);
  };

  const getInitials = () => {
    const name = profile?.displayName || profile?.username || '';
    return name.charAt(0).toUpperCase();
  };

  const handleProfilePhotoSave = async (photoUrl) => {
    try {
      const response = await socialApi.updateProfile({ profilePictureUrl: photoUrl || null });
      setProfile(response.data);
    } catch (error) {
      throw error; // Let the modal handle the error toast
    }
  };

  if (!loading && !profile) {
    return (
      <div className="pp-page">
        <div className="pp-page__empty">
          <BookIcon />
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = profile?.isOwnProfile;
  const canViewContent = profile?.isPublic || isOwnProfile || profile?.isFollowing;

  const tabs = [
    { key: 'books', icon: <GridIcon />, label: 'Books' },
    { key: 'reviews', icon: <ReviewIcon />, label: 'Reviews' },
    { key: 'lists', icon: <ListIcon />, label: 'Lists' },
    { key: 'reflections', icon: <ReflectionIcon />, label: 'Reflections' },
    ...(isOwnProfile ? [
      { key: 'saved', icon: <BookmarkIcon />, label: 'Saved' },
      { key: 'requests', icon: <RequestsIcon />, label: 'Requests', badge: requestsCount },
    ] : []),
  ];

  return (
    <div className="pp-page">
      {loading ? (
        <div className="pp-page__container">
          <SkeletonLoader />
        </div>
      ) : (
      <>
      <div className="pp-page__container">

        {/* Back Button */}
        <button className="pp-back-btn" onClick={() => navigate(-1)}>
          <BackIcon />
          <span>Back</span>
        </button>

        {/* ── Profile Header ── */}
        <header className="pp-header">
          {/* Avatar with gradient ring */}
          <div className="pp-header__avatar-wrap">
            <div className="pp-header__avatar-ring">
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={profile.username} className="pp-header__avatar-img" />
              ) : (
                <div className="pp-header__avatar-fallback">{getInitials()}</div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="pp-header__info">
            {/* Username Row */}
            <div className="pp-header__name-row">
              <h1 className="pp-header__username">
                {profile.username}
                {!profile.isPublic && <LockIcon size={16} />}
              </h1>
              <div className="pp-header__actions">
                {isOwnProfile ? (
                  <button className="pp-header__edit-btn" onClick={() => setIsEditing(true)}>
                    <EditIcon />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <FollowButton
                    userId={profile.id}
                    isFollowing={profile.isFollowing}
                    hasPendingRequest={profile.hasPendingRequest}
                    isPublic={profile.isPublic}
                    onFollowChange={handleFollowChange}
                    size="medium"
                  />
                )}
                <button
                  className="pp-header__share-btn"
                  onClick={async () => {
                    const url = `${window.location.origin}/profile/${profile.username}`;
                    try { await navigator.clipboard.writeText(url); toast.success('Profile link copied!'); }
                    catch { toast.error('Failed to copy link'); }
                  }}
                  title="Share profile"
                >
                  <ShareIcon />
                </button>
              </div>
            </div>

            {/* Stats Row — Instagram style */}
            <div className="pp-header__stats">
              <button className="pp-stat" onClick={() => handleTabChange('books')}>
                <span className="pp-stat__count">{profile.booksCount || 0}</span>
                <span className="pp-stat__label">books</span>
              </button>
              <button className="pp-stat" onClick={() => handleTabChange('followers')}>
                <span className="pp-stat__count">{profile.followersCount || 0}</span>
                <span className="pp-stat__label">followers</span>
              </button>
              <button className="pp-stat" onClick={() => handleTabChange('following')}>
                <span className="pp-stat__count">{profile.followingCount || 0}</span>
                <span className="pp-stat__label">following</span>
              </button>
            </div>

            {/* Bio Section */}
            <div className="pp-header__bio-section">
              {profile.displayName && profile.displayName !== profile.username && (
                <div className="pp-header__display-name">{profile.displayName}</div>
              )}
              {profile.bio && <p className="pp-header__bio">{profile.bio}</p>}
              {profile.favoriteGenres?.length > 0 && (
                <div className="pp-header__genres">
                  {profile.favoriteGenres.map((genre, i) => (
                    <span key={i} className="pp-genre-tag">{genre}</span>
                  ))}
                </div>
              )}
              {!isOwnProfile && profile.isFollowedBy && (
                <span className="pp-header__follows-you">Follows you</span>
              )}
            </div>
          </div>
        </header>

        {/* ── Tab Bar ── */}
        <nav className="pp-tabs" role="tablist">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`pp-tabs__item ${activeTab === t.key ? 'pp-tabs__item--active' : ''}`}
              onClick={() => handleTabChange(t.key)}
              role="tab"
              aria-selected={activeTab === t.key}
            >
              {t.icon}
              <span className="pp-tabs__label">{t.label}</span>
              {t.badge > 0 && <span className="pp-tabs__badge">{t.badge}</span>}
            </button>
          ))}
        </nav>

        {/* ── Content ── */}
        <section className="pp-content">
          {!canViewContent ? (
            <div className="pp-private-notice">
              <div className="pp-private-notice__icon"><LockIcon size={48} /></div>
              <h3>This Account is Private</h3>
              <p>Follow this account to see their books and activity.</p>
            </div>
          ) : (
            <>
              {/* BOOKS TAB */}
              {activeTab === 'books' && (
                <div className="pp-section">
                  {profileBooks.length === 0 ? (
                    <div className="pp-empty">
                      <BookIcon />
                      <p>No books yet</p>
                    </div>
                  ) : (
                    <div className="pp-books-grid">
                      {profileBooks.map((book) => (
                        <div key={book.id} className="pp-book-card">
                          <div className="pp-book-card__cover">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="pp-book-card__cover-icon">
                              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                            </svg>
                          </div>
                          <div className="pp-book-card__body">
                            <h4 className="pp-book-card__title">{book.title}</h4>
                            <span className="pp-book-card__author">{book.author}</span>
                            <div className="pp-book-card__meta">
                              <span className={`pp-book-card__status pp-book-card__status--${(book.status || 'WANT_TO_READ').toLowerCase()}`}>
                                {book.status === 'FINISHED' && <><CheckIcon /> Finished</>}
                                {book.status === 'READING' && <><BookOpenIcon /> Reading</>}
                                {(!book.status || book.status === 'WANT_TO_READ') && 'Want to Read'}
                              </span>
                              {book.rating > 0 && <StarRating rating={book.rating} />}
                            </div>
                            {book.totalPages > 0 && (
                              <div className="pp-book-card__progress">
                                <div className="pp-book-card__progress-track">
                                  <div className="pp-book-card__progress-fill" style={{ width: `${Math.min(100, book.progress || 0)}%` }} />
                                </div>
                                <span className="pp-book-card__pages">{book.pagesRead || 0}/{book.totalPages}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="pp-section">
                  {reviews.length === 0 ? (
                    <div className="pp-empty">
                      <ReviewIcon />
                      <p>No reviews yet</p>
                    </div>
                  ) : (
                    <div className="pp-reviews-list">
                      {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} currentUserId={currentUser?.id} onUpdate={loadReviews} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LISTS TAB */}
              {activeTab === 'lists' && (
                <div className="pp-section">
                  {lists.length === 0 ? (
                    <div className="pp-empty">
                      <ListIcon />
                      <p>No lists yet</p>
                    </div>
                  ) : (
                    <div className="pp-lists-grid">
                      {lists.map(list => (
                        <div key={list.id} className="pp-list-card" onClick={() => navigate(`/lists/${list.id}`)}>
                          <div className="pp-list-card__emoji">{list.coverEmoji}</div>
                          <div className="pp-list-card__info">
                            <h4>{list.name}</h4>
                            <span className="pp-list-card__meta">
                              {list.booksCount} book{list.booksCount !== 1 ? 's' : ''}
                              <span className="pp-list-card__dot">·</span>
                              <HeartIcon filled /> {list.likesCount}
                            </span>
                          </div>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="pp-list-card__arrow">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REFLECTIONS TAB */}
              {activeTab === 'reflections' && (
                <div className="pp-section">
                  {reflections.length === 0 ? (
                    <div className="pp-empty">
                      <ReflectionIcon />
                      <p>No reflections yet</p>
                    </div>
                  ) : (
                    <div className="pp-reflections-list">
                      {reflections.map(r => (
                        <div key={r.id} className="pp-reflection-card" onClick={() => navigate(`/reflections/${r.id}`)}>
                          <p className="pp-reflection-card__content">{r.content}</p>
                          {r.book && (
                            <div className="pp-reflection-card__book">
                              <BookIcon /> {r.book.title} — {r.book.author}
                            </div>
                          )}
                          <div className="pp-reflection-card__footer">
                            <span className="pp-reflection-card__date">
                              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <div className="pp-reflection-card__stats">
                              {r.likesCount > 0 && <span><HeartIcon filled /> {r.likesCount}</span>}
                              {r.commentsCount > 0 && <span><CommentBubbleIcon /> {r.commentsCount}</span>}
                            </div>
                          </div>
                          {r.visibleToFollowersOnly && (
                            <span className="pp-reflection-card__privacy"><LockIcon size={12} /> Followers only</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SAVED TAB */}
              {activeTab === 'saved' && isOwnProfile && (
                <div className="pp-section">
                  {savedItems.length === 0 ? (
                    <div className="pp-empty">
                      <BookmarkIcon />
                      <p>No saved items yet</p>
                    </div>
                  ) : (
                    <div className="pp-saved-timeline">
                      {savedItems.map(item => (
                        item._type === 'review' ? (
                          <div key={`review-${item.id}`} className="pp-saved-item">
                            <span className="pp-saved-item__badge pp-saved-item__badge--review"><ReviewIcon /> Review</span>
                            <ReviewCard review={item} currentUserId={currentUser?.id} onUpdate={loadSavedItems} />
                            <span className="pp-saved-item__date">
                              Saved {new Date(item.savedAt || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <div key={`reflection-${item.id}`} className="pp-saved-item">
                            <span className="pp-saved-item__badge pp-saved-item__badge--reflection"><ReflectionIcon /> Reflection</span>
                            <div className="pp-reflection-card" onClick={() => navigate(`/reflections/${item.id}`)}>
                              <p className="pp-reflection-card__content">{item.content}</p>
                              {item.book && (
                                <div className="pp-reflection-card__book">
                                  <BookIcon /> {item.book.title} — {item.book.author}
                                </div>
                              )}
                              <div className="pp-reflection-card__footer">
                                <span className="pp-reflection-card__date">
                                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <div className="pp-reflection-card__stats">
                                  {item.likesCount > 0 && <span><HeartIcon filled /> {item.likesCount}</span>}
                                  {item.commentsCount > 0 && <span><CommentBubbleIcon /> {item.commentsCount}</span>}
                                </div>
                              </div>
                              {item.user && item.user.username !== profile.username && (
                                <span className="pp-reflection-card__author">by @{item.user.username}</span>
                              )}
                            </div>
                            <span className="pp-saved-item__date">
                              Saved {new Date(item.savedAt || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FOLLOWERS TAB */}
              {activeTab === 'followers' && (
                <div className="pp-section">
                  {followers.length === 0 ? (
                    <div className="pp-empty"><p>No followers yet</p></div>
                  ) : (
                    <div className="pp-user-list">
                      {followers.map(user => (
                        <UserCard key={user.id} user={user} showFollowButton={user.id !== currentUser?.id} isOwnProfile={user.id === currentUser?.id} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FOLLOWING TAB */}
              {activeTab === 'following' && (
                <div className="pp-section">
                  {following.length === 0 ? (
                    <div className="pp-empty"><p>Not following anyone yet</p></div>
                  ) : (
                    <div className="pp-user-list">
                      {following.map(user => (
                        <UserCard key={user.id} user={user} showFollowButton={user.id !== currentUser?.id} isOwnProfile={user.id === currentUser?.id} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REQUESTS TAB */}
              {activeTab === 'requests' && isOwnProfile && (
                <div className="pp-section">
                  {followRequests.length === 0 ? (
                    <div className="pp-empty">
                      <RequestsIcon />
                      <p>No pending follow requests</p>
                    </div>
                  ) : (
                    <div className="pp-requests-list">
                      {followRequests.map(request => (
                        <div key={request.requestId} className="pp-request-card">
                          <div className="pp-request-card__user" onClick={() => navigate(`/profile/${request.requester.username}`)}>
                            <div className="pp-request-card__avatar">
                              {request.requester.profilePictureUrl ? (
                                <img src={request.requester.profilePictureUrl} alt={request.requester.username} />
                              ) : (
                                <span>{(request.requester.displayName || request.requester.username).charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="pp-request-card__info">
                              <span className="pp-request-card__name">{request.requester.username}</span>
                              {request.requester.displayName && (
                                <span className="pp-request-card__display">{request.requester.displayName}</span>
                              )}
                            </div>
                          </div>
                          <div className="pp-request-card__actions">
                            <button className="pp-request-btn pp-request-btn--approve" onClick={() => handleApproveRequest(request.requestId)}>
                              Confirm
                            </button>
                            <button className="pp-request-btn pp-request-btn--reject" onClick={() => handleRejectRequest(request.requestId)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Profile Photo Crop Modal ── */}
      {isPhotoModalOpen && (
        <ProfilePhotoCropModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          onSave={handleProfilePhotoSave}
          userId={currentUser?.id}
          currentPhotoUrl={profile.profilePictureUrl}
        />
      )}

      {/* ── Edit Profile Modal ── */}
      {isEditing && (
        <div className="pp-modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="pp-modal" onClick={e => e.stopPropagation()}>
            <div className="pp-modal__header">
              <h2>Edit Profile</h2>
              <button className="pp-modal__close" onClick={() => setIsEditing(false)}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="pp-modal__form">
              {/* Instagram-style profile photo section */}
              <div className="pp-edit-photo">
                <div className="pp-edit-photo__avatar-ring">
                  {profile.profilePictureUrl ? (
                    <img src={profile.profilePictureUrl} alt={profile.username} className="pp-edit-photo__avatar-img" />
                  ) : (
                    <div className="pp-edit-photo__avatar-fallback">{getInitials()}</div>
                  )}
                </div>
                <div className="pp-edit-photo__info">
                  <span className="pp-edit-photo__username">{profile.username}</span>
                  <button
                    type="button"
                    className="pp-edit-photo__change-btn"
                    onClick={() => setIsPhotoModalOpen(true)}
                  >
                    Change profile photo
                  </button>
                </div>
              </div>

              <div className="pp-form-group">
                <label>Username</label>
                <div className="pp-form-group__input-wrap">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={e => handleEditUsernameChange(e.target.value)}
                    placeholder="Unique username"
                    maxLength={50}
                    className={editUsernameStatus === 'taken' ? 'pp-input--error' : editUsernameStatus === 'available' ? 'pp-input--success' : ''}
                  />
                  {editUsernameStatus === 'checking' && <span className="pp-input-status pp-input-status--checking">Checking...</span>}
                  {editUsernameStatus === 'available' && <span className="pp-input-status pp-input-status--ok">Available</span>}
                  {editUsernameStatus === 'taken' && <span className="pp-input-status pp-input-status--error">Taken</span>}
                  {editUsernameStatus === 'invalid' && <span className="pp-input-status pp-input-status--error">3-50 chars</span>}
                  {editUsernameStatus === 'same' && <span className="pp-input-status pp-input-status--checking">Current</span>}
                </div>
              </div>

              <div className="pp-form-group">
                <label>Display Name</label>
                <input type="text" value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })} placeholder="Your display name" maxLength={100} />
              </div>

              <div className="pp-form-group">
                <label>Bio</label>
                <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell us about yourself..." maxLength={500} rows={4} />
              </div>

              <div className="pp-form-group pp-form-group--toggle">
                <div className="pp-form-group__toggle-text">
                  <label>Private Account</label>
                  <span className="pp-form-group__hint">Only approved followers can see your books</span>
                </div>
                <button
                  type="button"
                  className={`pp-toggle ${!editForm.isPublic ? 'pp-toggle--active' : ''}`}
                  onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
                >
                  <span className="pp-toggle__slider" />
                </button>
              </div>

              <div className="pp-modal__footer">
                <button type="button" className="pp-btn pp-btn--ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="pp-btn pp-btn--primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default ProfilePage;
