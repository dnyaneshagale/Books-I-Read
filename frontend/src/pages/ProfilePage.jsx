import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import socialApi from '../api/socialApi';
import authApi from '../authApi';
import reviewApi from '../api/reviewApi';
import listApi from '../api/listApi';
import FollowButton from '../components/social/FollowButton';
import ReviewCard from '../components/social/ReviewCard';
import UserCard from '../components/social/UserCard';
import ProfilePhotoCropModal from '../components/social/ProfilePhotoCropModal';
import toast from 'react-hot-toast';

/* Shared */
const cardCls = "bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-xl transition-all duration-[250ms] hover:border-[rgba(109,40,217,0.3)] dark:hover:border-[rgba(124,77,255,0.3)] hover:shadow-md hover:-translate-y-px cursor-pointer";
const emptyCls = "flex flex-col items-center justify-center gap-3 py-16 px-6 text-txt-secondary dark:text-[#6b6580] text-[0.95rem] bg-bg dark:bg-[#1E1B24] rounded-2xl border border-border dark:border-[#2D2A35] [&_svg]:opacity-30 [&_svg]:w-9 [&_svg]:h-9 [&_p]:m-0";
const shimBg = "bg-[linear-gradient(90deg,#e2e8f0_25%,#f1f5f9_50%,#e2e8f0_75%)] dark:bg-[linear-gradient(90deg,#2D2A35_25%,#3a3644_50%,#2D2A35_75%)] bg-[length:200%_100%] animate-shimmer";

/* SVG Icons */
const BackIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>;
const LockIcon = ({ size = 14 }) => <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" /></svg>;
const ShareIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" /></svg>;
const EditIcon = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>;
const GridIcon = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zM13 3h8v8h-8V3zm0 10h8v8h-8v-8z" /></svg>;
const ReviewIcon = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>;
const ListIcon = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>;
const ReflectionIcon = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" /><path d="M7 9h10v1.5H7V9zm0 4h7v1.5H7V13z" /></svg>;
const RequestsIcon = () => <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>;
const HeartIcon = ({ filled }) => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d={filled ? "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2z" : "M7.24 2C4.37 2 2 4.43 2 7.35c0 5.6 6.25 10.27 10 12.65 3.75-2.38 10-7.05 10-12.65C22 4.43 19.63 2 16.76 2c-1.63 0-3.19.79-4.22 2.07L12 4.74l-.54-.67C10.43 2.79 8.87 2 7.24 2zM12 18.55l-.36-.24C7.39 15.42 4 11.85 4 7.35 4 5.56 5.45 4 7.24 4c1.18 0 2.31.65 2.98 1.69L12 7.99l1.78-2.3A3.505 3.505 0 0116.76 4C18.55 4 20 5.56 20 7.35c0 4.5-3.39 8.07-7.64 10.96L12 18.55z"} /></svg>;
const CommentBubbleIcon = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-4.83L12 19.17 8.83 16H4V4h16v12z" /></svg>;
const BookIcon = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" /></svg>;
const BookmarkIcon = ({ filled }) => <svg viewBox="0 0 24 24" width="20" height="20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
const StarIcon = ({ filled }) => <svg viewBox="0 0 24 24" width="14" height="14" fill={filled ? '#f59e0b' : 'none'} stroke={filled ? '#f59e0b' : 'currentColor'} strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
const CheckIcon = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>;
const BookOpenIcon = () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z" /></svg>;

const SkeletonLoader = () => (
  <div className="animate-fade-in" aria-hidden="true">
    <div className="flex gap-7 p-6 px-7 bg-bg dark:bg-[#1E1B24] rounded-2xl border border-border dark:border-[#2D2A35] shadow-md mb-0 max-sm:flex-col max-sm:items-center max-sm:gap-4 max-sm:px-5">
      <div className={`w-[120px] h-[120px] rounded-full flex-shrink-0 ${shimBg}`} />
      <div className="flex-1 flex flex-col gap-3 pt-2 max-sm:items-center">
        <div className={`w-[160px] h-4 rounded-md ${shimBg}`} />
        <div className={`w-[100px] h-3 rounded-md ${shimBg}`} />
        <div className="flex gap-6 mt-1 max-sm:justify-center">{[1, 2, 3].map(i => <div key={i} className={`w-[52px] h-9 rounded-md ${shimBg}`} />)}</div>
      </div>
    </div>
    <div className="flex flex-col gap-2 py-4 px-7 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] border-t-0">
      <div className={`w-full h-3 rounded-md ${shimBg}`} /><div className={`w-[55%] h-3 rounded-md ${shimBg}`} />
    </div>
    <div className="flex gap-1 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] border-t-0 rounded-b-2xl py-3 px-4 mb-4">{[1, 2, 3, 4].map(i => <div key={i} className={`flex-1 h-8 rounded-md ${shimBg}`} />)}</div>
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-sm:grid-cols-1 gap-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={`h-[100px] rounded-xl ${shimBg}`} />)}</div>
  </div>
);

const StarRating = ({ rating }) => <span className="inline-flex gap-px items-center">{[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= rating} />)}</span>;

const ProfilePage = () => {
  const { username } = useParams(); const navigate = useNavigate();
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books'); const [profileBooks, setProfileBooks] = useState([]);
  const [followers, setFollowers] = useState([]); const [following, setFollowing] = useState([]);
  const [reviews, setReviews] = useState([]); const [lists, setLists] = useState([]);
  const [reflections, setReflections] = useState([]); const [followRequests, setFollowRequests] = useState([]);
  const [requestsCount, setRequestsCount] = useState(0); const [savedItems, setSavedItems] = useState([]);
  const [isEditing, setIsEditing] = useState(false); const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({}); const [editUsernameStatus, setEditUsernameStatus] = useState(null);
  const editUsernameTimerRef = useRef(null);

  useEffect(() => { loadProfile(); }, [username]);
  useEffect(() => { if (profile) { const cv = profile.isPublic || profile.isOwnProfile || profile.isFollowing; if (cv) { loadProfileBooks(); loadReviews(); loadLists(); loadReflections(); } } }, [profile?.id, profile?.isFollowing]);
  useEffect(() => { if (profile?.isOwnProfile) loadRequestsCount(); }, [profile?.isOwnProfile]);

  const loadProfile = async () => { setLoading(true); try { const r = username ? await socialApi.getProfile(username) : await socialApi.getMyProfile(); setProfile(r.data); setEditForm({ username: r.data.username || '', displayName: r.data.displayName || '', bio: r.data.bio || '', isPublic: r.data.isPublic, favoriteGenres: r.data.favoriteGenres || [] }); } catch (e) { console.error(e); toast.error('Failed to load profile'); navigate('/'); } finally { setLoading(false); } };
  const loadProfileBooks = async () => { try { const u = username || currentUser?.username; if (!u) return; const r = await socialApi.getUserBooks(u); setProfileBooks(r.data || []); } catch (e) { console.error(e); } };
  const loadFollowers = async () => { if (!profile) return; try { const r = await socialApi.getFollowers(profile.id); setFollowers(r.data.content || []); } catch (e) { if (e.response?.status === 403) toast.error('This account is private'); } };
  const loadFollowing = async () => { if (!profile) return; try { const r = await socialApi.getFollowing(profile.id); setFollowing(r.data.content || []); } catch (e) { if (e.response?.status === 403) toast.error('This account is private'); } };
  const loadReviews = async () => { if (!profile) return; try { const r = await reviewApi.getUserReviews(profile.id, 0, 20); setReviews(r.data.content || []); } catch (e) { console.error(e); } };
  const loadLists = async () => { if (!profile) return; try { const r = await listApi.getUserLists(profile.id); setLists(r.data || []); } catch (e) { console.error(e); } };
  const loadReflections = async () => { if (!profile) return; try { const r = await socialApi.getUserReflections(profile.id, 0, 50); setReflections(r.data.content || []); } catch (e) { console.error(e); } };
  const loadRequestsCount = async () => { try { const r = await socialApi.getPendingRequestsCount(); setRequestsCount(r.data.count || 0); } catch (e) { console.error(e); } };
  const loadFollowRequests = async () => { try { const r = await socialApi.getPendingRequests(); setFollowRequests(r.data.content || []); setRequestsCount(r.data.content?.length || 0); } catch (e) { console.error(e); } };
  const loadSavedItems = async () => { try { const [rr, rf] = await Promise.all([reviewApi.getSavedReviews(0, 50), socialApi.getSavedReflections(0, 50)]); const rv = (rr.data.content || []).map(r => ({ ...r, _type: 'review' })); const rl = (rf.data.content || []).map(r => ({ ...r, _type: 'reflection' })); setSavedItems([...rv, ...rl].sort((a, b) => new Date(b.savedAt || b.createdAt) - new Date(a.savedAt || a.createdAt))); } catch (e) { console.error(e); } };
  const handleTabChange = tab => { setActiveTab(tab); const l = { books: loadProfileBooks, followers: loadFollowers, following: loadFollowing, reviews: loadReviews, lists: loadLists, reflections: loadReflections, requests: loadFollowRequests, saved: loadSavedItems }; l[tab]?.(); };
  const handleApproveRequest = async id => { try { await socialApi.approveFollowRequest(id); toast.success('Approved'); setFollowRequests(p => p.filter(r => r.requestId !== id)); setRequestsCount(p => Math.max(0, p - 1)); setProfile(p => ({ ...p, followersCount: p.followersCount + 1 })); } catch { toast.error('Failed'); } };
  const handleRejectRequest = async id => { try { await socialApi.rejectFollowRequest(id); toast.success('Rejected'); setFollowRequests(p => p.filter(r => r.requestId !== id)); setRequestsCount(p => Math.max(0, p - 1)); } catch { toast.error('Failed'); } };
  const handleFollowChange = s => { setProfile(p => ({ ...p, isFollowing: s.isFollowing, hasPendingRequest: s.hasPendingRequest, followersCount: s.isFollowing ? p.followersCount + 1 : Math.max(0, p.followersCount - 1) })); };
  const handleEditSubmit = async e => { e.preventDefault(); if (editUsernameStatus === 'taken') return toast.error('Username taken'); if (editUsernameStatus === 'invalid') return toast.error('3-50 chars'); try { const old = profile.username; const r = await socialApi.updateProfile(editForm); setProfile(r.data); setIsEditing(false); setEditUsernameStatus(null); toast.success('Profile updated'); if (editForm.username && editForm.username !== old) { const u = { ...currentUser, username: editForm.username }; setCurrentUser(u); localStorage.setItem('user', JSON.stringify(u)); navigate(`/profile/${editForm.username}`, { replace: true }); } } catch (e) { toast.error(e.response?.data?.message || 'Failed'); } };
  const handleEditUsernameChange = v => { setEditForm(p => ({ ...p, username: v })); if (editUsernameTimerRef.current) clearTimeout(editUsernameTimerRef.current); if (v === profile?.username) { setEditUsernameStatus('same'); return; } if (!v || v.length < 3 || v.length > 50) { setEditUsernameStatus(v.length > 0 ? 'invalid' : null); return; } setEditUsernameStatus('checking'); editUsernameTimerRef.current = setTimeout(async () => { try { const r = await authApi.checkUsername(v); setEditUsernameStatus(r.data.available ? 'available' : 'taken'); } catch { setEditUsernameStatus(null); } }, 400); };
  const getInitials = () => (profile?.displayName || profile?.username || '').charAt(0).toUpperCase();
  const handleProfilePhotoSave = async url => { try { const r = await socialApi.updateProfile({ profilePictureUrl: url || null }); setProfile(r.data); } catch (e) { throw e; } };

  if (!loading && !profile) return <div className="min-h-screen bg-gradient-to-br from-bg-secondary to-bg-tertiary dark:from-[#1E1B24] dark:to-bg p-6 pb-20 md:pt-20"><div className="flex flex-col items-center justify-center gap-3 min-h-[50vh] text-txt-secondary text-base [&_svg]:opacity-40 [&_svg]:w-10 [&_svg]:h-10"><BookIcon /><p>Profile not found</p></div></div>;

  const isOwnProfile = profile?.isOwnProfile;
  const canViewContent = profile?.isPublic || isOwnProfile || profile?.isFollowing;
  const tabs = [
    { key: 'books', icon: <GridIcon />, label: 'Books' }, { key: 'reviews', icon: <ReviewIcon />, label: 'Reviews' },
    { key: 'lists', icon: <ListIcon />, label: 'Lists' }, { key: 'reflections', icon: <ReflectionIcon />, label: 'Reflections' },
    ...(isOwnProfile ? [{ key: 'saved', icon: <BookmarkIcon />, label: 'Saved' }, { key: 'requests', icon: <RequestsIcon />, label: 'Requests', badge: requestsCount }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-secondary dark:from-[#1E1B24] to-bg-tertiary dark:to-bg p-6 pb-20 md:pt-20 md:pb-10 transition-colors duration-300">
      {loading ? (
        <div className="max-w-[680px] lg:max-w-[740px] mx-auto animate-fade-in-up"><SkeletonLoader /></div>
      ) : (
        <>
          <div className="max-w-[680px] lg:max-w-[740px] mx-auto animate-fade-in-up">

            {/* Back */}
            <button className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-full text-txt-secondary dark:text-[#9E95A8] text-[0.85rem] font-medium cursor-pointer transition-all duration-200 shadow-xs mb-5 hover:border-primary hover:text-primary dark:hover:border-primary-light dark:hover:text-primary-light" onClick={() => navigate(-1)}>
              <BackIcon /><span>Back</span>
            </button>

            {/* Header */}
            <header className="flex gap-7 p-6 px-7 bg-bg dark:bg-[#1E1B24] rounded-2xl border border-border dark:border-[#2D2A35] shadow-md mb-0 transition-all duration-300 max-sm:flex-col max-sm:items-center max-sm:text-center max-sm:gap-4 max-sm:px-5">
              {/* Avatar */}
              <div className="flex-shrink-0 flex items-start pt-1">
                <div className="w-[120px] h-[120px] max-sm:w-24 max-sm:h-24 rounded-full p-1 bg-gradient-to-br from-[#6d28d9] via-[#a855f7] via-[40%] via-[#ec4899] via-[70%] to-[#f59e0b] transition-transform duration-300 hover:scale-[1.04] hover:animate-pulse">
                  {profile.profilePictureUrl
                    ? <img src={profile.profilePictureUrl} alt={profile.username} className="w-full h-full rounded-full object-cover border-[3px] border-bg dark:border-[#1E1B24]" />
                    : <div className="w-full h-full rounded-full bg-bg dark:bg-[#1E1B24] text-primary dark:text-primary-light flex items-center justify-center font-bold text-[2.8rem] max-sm:text-[2.2rem] border-[3px] border-bg dark:border-[#1E1B24]">{getInitials()}</div>
                  }
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {/* Name row */}
                <div className="flex items-center gap-3.5 flex-wrap mb-4 max-sm:flex-col max-sm:gap-2.5">
                  <h1 className="text-[1.35rem] font-normal text-txt-primary dark:text-[#E2D9F3] m-0 flex items-center gap-1.5 tracking-tight">
                    {profile.username}
                    {!profile.isPublic && <LockIcon size={16} />}
                  </h1>
                  <div className="flex items-center gap-2">
                    {isOwnProfile ? (
                      <button className="inline-flex items-center gap-1.5 py-[7px] px-4 bg-bg-secondary dark:bg-[#2D2A35] border border-border dark:border-[#3b3670] rounded-lg font-semibold text-[0.82rem] text-txt-primary dark:text-[#E2D9F3] cursor-pointer transition-all duration-200 hover:bg-border dark:hover:bg-[#3b3670] hover:border-primary dark:hover:border-primary-light" onClick={() => setIsEditing(true)}>
                        <EditIcon /><span>Edit Profile</span>
                      </button>
                    ) : (
                      <FollowButton userId={profile.id} isFollowing={profile.isFollowing} hasPendingRequest={profile.hasPendingRequest} isPublic={profile.isPublic} onFollowChange={handleFollowChange} size="medium" />
                    )}
                    <button className="inline-flex items-center justify-center p-2 bg-bg-secondary dark:bg-[#2D2A35] border border-border dark:border-[#3b3670] rounded-lg text-txt-secondary dark:text-[#9E95A8] cursor-pointer transition-all duration-200 hover:bg-border hover:text-primary dark:hover:text-primary-light dark:hover:border-primary-light" onClick={async () => { const url = `${window.location.origin}/profile/${profile.username}`; try { await navigator.clipboard.writeText(url); toast.success('Profile link copied!'); } catch { toast.error('Failed to copy link'); } }} title="Share profile">
                      <ShareIcon />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex mb-4 max-sm:justify-center">
                  {[{ k: 'books', c: profile.booksCount, l: 'books' }, { k: 'followers', c: profile.followersCount, l: 'followers' }, { k: 'following', c: profile.followingCount, l: 'following' }].map(s => (
                    <button key={s.k} className="bg-transparent border-none cursor-pointer py-2 flex flex-col items-center gap-0.5 min-w-[72px] transition-opacity hover:opacity-70" onClick={() => handleTabChange(s.k)}>
                      <span className="font-bold text-[1.1rem] text-txt-primary dark:text-[#E2D9F3] leading-tight">{s.c || 0}</span>
                      <span className="text-[0.78rem] text-txt-secondary dark:text-[#9E95A8]">{s.l}</span>
                    </button>
                  ))}
                </div>

                {/* Bio */}
                <div className="mt-1 max-sm:flex max-sm:flex-col max-sm:items-center">
                  {profile.displayName && profile.displayName !== profile.username && <div className="font-semibold text-[0.9rem] text-txt-primary dark:text-[#E2D9F3] mb-0.5">{profile.displayName}</div>}
                  {profile.bio && <p className="text-[0.88rem] text-txt-primary dark:text-[#c9bfdb] leading-relaxed m-0 mb-2 whitespace-pre-wrap break-words max-sm:text-center">{profile.bio}</p>}
                  {profile.favoriteGenres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-sm:justify-center">
                      {profile.favoriteGenres.map((g, i) => <span key={i} className="py-[3px] px-2.5 bg-gradient-to-br from-[rgba(109,40,217,0.08)] to-[rgba(168,85,247,0.08)] dark:from-[rgba(124,77,255,0.12)] dark:to-[rgba(149,117,255,0.08)] border border-[rgba(109,40,217,0.15)] dark:border-[rgba(124,77,255,0.2)] rounded-full text-[0.73rem] font-medium text-primary dark:text-primary-light transition-all hover:bg-[rgba(109,40,217,0.12)]">{g}</span>)}
                    </div>
                  )}
                  {!isOwnProfile && profile.isFollowedBy && <span className="inline-flex items-center mt-2 text-[0.78rem] font-medium text-txt-muted dark:text-[#9E95A8] bg-bg-secondary dark:bg-[#2D2A35] py-[3px] px-2.5 rounded-full">Follows you</span>}
                </div>
              </div>
            </header>

            {/* Tabs */}
            <nav className="flex bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] border-t-0 rounded-b-2xl overflow-hidden shadow-sm mb-4" role="tablist">
              {tabs.map(t => (
                <button key={t.key} className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 max-[480px]:py-2.5 max-[480px]:px-1.5 bg-transparent border-none border-t-2 text-[0.72rem] font-semibold uppercase tracking-wider cursor-pointer transition-all duration-200 relative ${activeTab === t.key ? 'text-primary dark:text-primary-light border-t-primary dark:border-t-primary-light [&_svg]:opacity-100 [&_svg]:text-primary dark:[&_svg]:text-primary-light' : 'text-txt-secondary dark:text-[#6b6580] border-t-transparent [&_svg]:opacity-50 hover:text-txt-primary dark:hover:text-[#E2D9F3] hover:[&_svg]:opacity-80'}`} onClick={() => handleTabChange(t.key)} role="tab" aria-selected={activeTab === t.key}>
                  <span className="[&_svg]:transition-opacity max-[480px]:[&_svg]:w-[22px] max-[480px]:[&_svg]:h-[22px]">{t.icon}</span>
                  <span className="max-[480px]:hidden">{t.label}</span>
                  {t.badge > 0 && <span className="absolute top-1.5 right-[calc(50%-20px)] min-w-4 h-4 px-1 rounded-lg bg-red-500 text-white text-[0.65rem] font-bold flex items-center justify-center leading-none">{t.badge}</span>}
                </button>
              ))}
            </nav>

            {/* Content */}
            <section className="animate-fade-in [animation-delay:0.1s]">
              {!canViewContent ? (
                <div className="text-center py-20 px-6 bg-bg dark:bg-[#1E1B24] rounded-2xl border border-border dark:border-[#2D2A35] shadow-sm">
                  <div className="mb-4 opacity-40"><LockIcon size={48} /></div>
                  <h3 className="text-[1.2rem] font-semibold text-txt-primary dark:text-[#E2D9F3] m-0 mb-2">This Account is Private</h3>
                  <p className="text-txt-secondary dark:text-[#9E95A8] m-0 text-[0.9rem]">Follow this account to see their books and activity.</p>
                </div>
              ) : (<>

                {/* BOOKS */}
                {activeTab === 'books' && (
                  <div className="animate-fade-in">
                    {profileBooks.length === 0 ? <div className={emptyCls}><BookIcon /><p>No books yet</p></div> : (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-sm:grid-cols-1 gap-3">
                        {profileBooks.map(book => (
                          <div key={book.id} className={`flex gap-3.5 p-4 ${cardCls} animate-scale-in`}>
                            <div className="w-14 h-[72px] rounded-md bg-gradient-to-br from-[rgba(109,40,217,0.08)] to-[rgba(37,99,235,0.06)] dark:from-[rgba(124,77,255,0.1)] dark:to-[rgba(149,117,255,0.06)] flex items-center justify-center flex-shrink-0 text-primary dark:text-primary-light border border-[rgba(109,40,217,0.1)] dark:border-[rgba(124,77,255,0.15)]">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 opacity-60"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-[0.9rem] font-bold text-txt-primary dark:text-[#E2D9F3] m-0 mb-0.5 leading-tight truncate">{book.title}</h4>
                              <span className="text-[0.78rem] text-txt-secondary dark:text-[#9E95A8] block mb-1.5">{book.author}</span>
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <span className={`inline-flex items-center gap-1 text-[0.72rem] font-semibold py-0.5 px-2 rounded-full ${book.status === 'FINISHED' ? 'bg-[rgba(16,185,129,0.1)] dark:bg-[rgba(16,185,129,0.15)] text-[#059669] dark:text-[#34d399]' : book.status === 'READING' ? 'bg-[rgba(59,130,246,0.1)] dark:bg-[rgba(59,130,246,0.15)] text-[#2563eb] dark:text-[#60a5fa]' : 'bg-[rgba(245,158,11,0.1)] dark:bg-[rgba(245,158,11,0.15)] text-[#d97706] dark:text-[#fbbf24]'}`}>
                                  {book.status === 'FINISHED' && <><CheckIcon /> Finished</>}
                                  {book.status === 'READING' && <><BookOpenIcon /> Reading</>}
                                  {(!book.status || book.status === 'WANT_TO_READ') && 'Want to Read'}
                                </span>
                                {book.rating > 0 && <StarRating rating={book.rating} />}
                              </div>
                              {book.totalPages > 0 && (
                                <div className="mt-1 flex items-center gap-2">
                                  <div className="flex-1 h-1 bg-bg-secondary dark:bg-[#2D2A35] rounded-sm overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-[#a855f7] rounded-sm transition-[width] duration-400" style={{ width: `${Math.min(100, book.progress || 0)}%` }} />
                                  </div>
                                  <span className="text-[0.7rem] text-txt-secondary dark:text-[#6b6580] whitespace-nowrap">{book.pagesRead || 0}/{book.totalPages}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* REVIEWS */}
                {activeTab === 'reviews' && (
                  <div className="animate-fade-in">
                    {reviews.length === 0 ? <div className={emptyCls}><ReviewIcon /><p>No reviews yet</p></div> : (
                      <div className="flex flex-col gap-3">{reviews.map(r => <ReviewCard key={r.id} review={r} currentUserId={currentUser?.id} onUpdate={loadReviews} />)}</div>
                    )}
                  </div>
                )}

                {/* LISTS */}
                {activeTab === 'lists' && (
                  <div className="animate-fade-in">
                    {lists.length === 0 ? <div className={emptyCls}><ListIcon /><p>No lists yet</p></div> : (
                      <div className="flex flex-col gap-2">
                        {lists.map(list => (
                          <div key={list.id} className={`flex items-center gap-3.5 py-3.5 px-4 ${cardCls} group`} onClick={() => navigate(`/lists/${list.id}`)}>
                            <div className="text-2xl w-11 h-11 flex items-center justify-center bg-gradient-to-br from-[rgba(109,40,217,0.06)] to-[rgba(168,85,247,0.06)] dark:from-[rgba(124,77,255,0.1)] dark:to-[rgba(149,117,255,0.06)] rounded-xl flex-shrink-0">{list.coverEmoji}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="m-0 text-[0.9rem] font-semibold text-txt-primary dark:text-[#E2D9F3] truncate">{list.name}</h4>
                              <span className="flex items-center gap-1 text-[0.75rem] text-txt-secondary dark:text-[#6b6580] mt-0.5">{list.booksCount} book{list.booksCount !== 1 ? 's' : ''}<span className="mx-0.5">·</span><HeartIcon filled /> {list.likesCount}</span>
                            </div>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="flex-shrink-0 text-txt-secondary dark:text-[#6b6580] opacity-50 transition-opacity group-hover:opacity-100 group-hover:text-primary dark:group-hover:text-primary-light"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* REFLECTIONS */}
                {activeTab === 'reflections' && (
                  <div className="animate-fade-in">
                    {reflections.length === 0 ? <div className={emptyCls}><ReflectionIcon /><p>No reflections yet</p></div> : (
                      <div className="flex flex-col gap-2.5">
                        {reflections.map(r => (
                          <div key={r.id} className={`py-4 px-[18px] ${cardCls}`} onClick={() => navigate(`/reflections/${r.id}`)}>
                            <p className="text-[0.9rem] leading-relaxed text-txt-primary dark:text-[#E2D9F3] whitespace-pre-wrap break-words m-0 line-clamp-4">{r.content}</p>
                            {r.book && <div className="flex items-center gap-1.5 mt-2.5 py-2 px-3 bg-gradient-to-br from-[rgba(109,40,217,0.04)] to-[rgba(37,99,235,0.03)] dark:from-[rgba(124,77,255,0.08)] dark:to-[rgba(149,117,255,0.04)] rounded-lg text-[0.8rem] text-txt-secondary dark:text-[#9E95A8] [&_svg]:flex-shrink-0 [&_svg]:opacity-50"><BookIcon /> {r.book.title} — {r.book.author}</div>}
                            <div className="flex items-center justify-between mt-3 text-[0.75rem] text-txt-secondary dark:text-[#6b6580]">
                              <span>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <div className="flex gap-3">{r.likesCount > 0 && <span className="inline-flex items-center gap-1"><HeartIcon filled /> {r.likesCount}</span>}{r.commentsCount > 0 && <span className="inline-flex items-center gap-1"><CommentBubbleIcon /> {r.commentsCount}</span>}</div>
                            </div>
                            {r.visibleToFollowersOnly && <span className="inline-flex items-center gap-1 mt-2 text-[0.72rem] text-txt-secondary opacity-70"><LockIcon size={12} /> Followers only</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SAVED */}
                {activeTab === 'saved' && isOwnProfile && (
                  <div className="animate-fade-in">
                    {savedItems.length === 0 ? <div className={emptyCls}><BookmarkIcon /><p>No saved items yet</p></div> : (
                      <div className="flex flex-col gap-4">
                        {savedItems.map(item => item._type === 'review' ? (
                          <div key={`review-${item.id}`} className="relative flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-[5px] w-fit text-[0.72rem] font-bold uppercase tracking-wider py-[3px] px-2.5 rounded-2xl text-[#6d28d9] dark:text-[#a78bfa] bg-[rgba(109,40,217,0.1)] dark:bg-[rgba(167,139,250,0.15)] [&_svg]:w-[13px] [&_svg]:h-[13px]"><ReviewIcon /> Review</span>
                            <ReviewCard review={item} currentUserId={currentUser?.id} onUpdate={loadSavedItems} />
                            <span className="text-[0.72rem] text-txt-muted dark:text-[#6b6580] pl-1">Saved {new Date(item.savedAt || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        ) : (
                          <div key={`reflection-${item.id}`} className="relative flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-[5px] w-fit text-[0.72rem] font-bold uppercase tracking-wider py-[3px] px-2.5 rounded-2xl text-[#0891b2] dark:text-[#22d3ee] bg-[rgba(8,145,178,0.1)] dark:bg-[rgba(34,211,238,0.12)] [&_svg]:w-[13px] [&_svg]:h-[13px]"><ReflectionIcon /> Reflection</span>
                            <div className={`py-4 px-[18px] ${cardCls}`} onClick={() => navigate(`/reflections/${item.id}`)}>
                              <p className="text-[0.9rem] leading-relaxed text-txt-primary dark:text-[#E2D9F3] whitespace-pre-wrap break-words m-0 line-clamp-4">{item.content}</p>
                              {item.book && <div className="flex items-center gap-1.5 mt-2.5 py-2 px-3 bg-gradient-to-br from-[rgba(109,40,217,0.04)] to-[rgba(37,99,235,0.03)] dark:from-[rgba(124,77,255,0.08)] dark:to-[rgba(149,117,255,0.04)] rounded-lg text-[0.8rem] text-txt-secondary dark:text-[#9E95A8] [&_svg]:flex-shrink-0 [&_svg]:opacity-50"><BookIcon /> {item.book.title} — {item.book.author}</div>}
                              <div className="flex items-center justify-between mt-3 text-[0.75rem] text-txt-secondary dark:text-[#6b6580]">
                                <span>{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                <div className="flex gap-3">{item.likesCount > 0 && <span className="inline-flex items-center gap-1"><HeartIcon filled /> {item.likesCount}</span>}{item.commentsCount > 0 && <span className="inline-flex items-center gap-1"><CommentBubbleIcon /> {item.commentsCount}</span>}</div>
                              </div>
                              {item.user && item.user.username !== profile.username && <span className="block mt-1.5 text-[0.78rem] font-semibold text-primary dark:text-[#a78bfa]">by @{item.user.username}</span>}
                            </div>
                            <span className="text-[0.72rem] text-txt-muted dark:text-[#6b6580] pl-1">Saved {new Date(item.savedAt || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* FOLLOWERS */}
                {activeTab === 'followers' && (
                  <div className="animate-fade-in">
                    {followers.length === 0 ? <div className={emptyCls}><p>No followers yet</p></div> : (
                      <div className="flex flex-col gap-2">{followers.map(u => <UserCard key={u.id} user={u} showFollowButton={u.id !== currentUser?.id} isOwnProfile={u.id === currentUser?.id} />)}</div>
                    )}
                  </div>
                )}

                {/* FOLLOWING */}
                {activeTab === 'following' && (
                  <div className="animate-fade-in">
                    {following.length === 0 ? <div className={emptyCls}><p>Not following anyone yet</p></div> : (
                      <div className="flex flex-col gap-2">{following.map(u => <UserCard key={u.id} user={u} showFollowButton={u.id !== currentUser?.id} isOwnProfile={u.id === currentUser?.id} />)}</div>
                    )}
                  </div>
                )}

                {/* REQUESTS */}
                {activeTab === 'requests' && isOwnProfile && (
                  <div className="animate-fade-in">
                    {followRequests.length === 0 ? <div className={emptyCls}><RequestsIcon /><p>No pending follow requests</p></div> : (
                      <div className="flex flex-col gap-2.5">
                        {followRequests.map(req => (
                          <div key={req.requestId} className="flex items-center justify-between py-3.5 px-4 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-xl transition-shadow hover:shadow-sm">
                            <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" onClick={() => navigate(`/profile/${req.requester.username}`)}>
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-[#a855f7] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {req.requester.profilePictureUrl ? <img src={req.requester.profilePictureUrl} alt={req.requester.username} className="w-full h-full object-cover" /> : <span className="text-white font-bold text-[1.1rem]">{(req.requester.displayName || req.requester.username).charAt(0).toUpperCase()}</span>}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-[0.9rem] text-txt-primary dark:text-[#E2D9F3]">{req.requester.username}</span>
                                {req.requester.displayName && <span className="text-[0.78rem] text-txt-secondary dark:text-[#9E95A8] truncate">{req.requester.displayName}</span>}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button className="py-[7px] px-4 border-none rounded-lg text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 bg-primary hover:bg-primary-hover text-white" onClick={() => handleApproveRequest(req.requestId)}>Confirm</button>
                              <button className="py-[7px] px-4 rounded-lg text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 bg-bg-secondary dark:bg-[#2D2A35] text-txt-secondary dark:text-[#9E95A8] border border-border dark:border-[#3b3670] hover:bg-border dark:hover:bg-[#3b3670]" onClick={() => handleRejectRequest(req.requestId)}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </>)}
            </section>
          </div>

          {/* Photo Modal */}
          {isPhotoModalOpen && <ProfilePhotoCropModal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} onSave={handleProfilePhotoSave} userId={currentUser?.id} currentPhotoUrl={profile.profilePictureUrl} />}

          {/* Edit Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center z-[1000] p-6 animate-fade-in [animation-duration:0.15s]" onClick={() => setIsEditing(false)}>
              <div className="bg-bg dark:bg-[#1E1B24] dark:border dark:border-[#2D2A35] rounded-2xl max-w-[480px] w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_rgba(0,0,0,0.2)] animate-scale-in [animation-duration:0.2s]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between py-[18px] px-6 border-b border-border dark:border-[#2D2A35]">
                  <h2 className="text-[1.15rem] font-semibold m-0 text-txt-primary dark:text-[#E2D9F3]">Edit Profile</h2>
                  <button className="p-1 bg-transparent border-none text-txt-secondary cursor-pointer rounded-full transition-all hover:bg-bg-secondary dark:hover:bg-[#2D2A35] hover:text-txt-primary dark:hover:text-[#E2D9F3] flex items-center justify-center" onClick={() => setIsEditing(false)}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" /></svg>
                  </button>
                </div>
                <form onSubmit={handleEditSubmit} className="py-5 px-6">
                  {/* Photo section */}
                  <div className="flex items-center gap-5 py-4 mb-2 border-b border-[#efefef] dark:border-white/10">
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-br from-[#6d28d9] via-[#a855f7] via-[#ec4899] to-[#f59e0b] flex-shrink-0">
                      {profile.profilePictureUrl
                        ? <img src={profile.profilePictureUrl} alt={profile.username} className="w-full h-full rounded-full object-cover border-2 border-bg dark:border-[#1E1B24]" />
                        : <div className="w-full h-full rounded-full bg-bg dark:bg-[#1E1B24] text-primary dark:text-primary-light flex items-center justify-center font-bold text-[1.3rem] border-2 border-bg dark:border-[#1E1B24]">{getInitials()}</div>
                      }
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-base text-txt dark:text-[#e0e0e0]">{profile.username}</span>
                      <button type="button" className="bg-transparent border-none p-0 text-[#0095f6] dark:text-[#58b1f5] text-[0.875rem] font-semibold cursor-pointer text-left transition-colors hover:text-[#00376b] dark:hover:text-[#8ecdf7]" onClick={() => setIsPhotoModalOpen(true)}>Change profile photo</button>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="mb-[18px]">
                    <label className="block font-semibold text-[0.82rem] text-txt-primary dark:text-[#E2D9F3] mb-1.5">Username</label>
                    <div className="relative">
                      <input type="text" value={editForm.username} onChange={e => handleEditUsernameChange(e.target.value)} placeholder="Unique username" maxLength={50} className={`w-full py-2.5 px-3 border rounded-lg text-[0.88rem] font-inherit bg-bg dark:bg-[#0F0C15] text-txt-primary dark:text-[#E2D9F3] transition-all focus:outline-none focus:border-primary dark:focus:border-primary-light focus:ring-[3px] focus:ring-primary/10 dark:focus:ring-primary-light/15 box-border ${editUsernameStatus === 'taken' ? '!border-red-600' : editUsernameStatus === 'available' ? '!border-emerald-600' : 'border-border dark:border-[#2D2A35]'}`} />
                      {editUsernameStatus === 'checking' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-txt-secondary">Checking...</span>}
                      {editUsernameStatus === 'available' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-emerald-600">Available</span>}
                      {editUsernameStatus === 'taken' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-red-600">Taken</span>}
                      {editUsernameStatus === 'invalid' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-red-600">3-50 chars</span>}
                      {editUsernameStatus === 'same' && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-txt-secondary">Current</span>}
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="mb-[18px]">
                    <label className="block font-semibold text-[0.82rem] text-txt-primary dark:text-[#E2D9F3] mb-1.5">Display Name</label>
                    <input type="text" value={editForm.displayName} onChange={e => setEditForm({ ...editForm, displayName: e.target.value })} placeholder="Your display name" maxLength={100} className="w-full py-2.5 px-3 border border-border dark:border-[#2D2A35] rounded-lg text-[0.88rem] font-inherit bg-bg dark:bg-[#0F0C15] text-txt-primary dark:text-[#E2D9F3] transition-all focus:outline-none focus:border-primary dark:focus:border-primary-light focus:ring-[3px] focus:ring-primary/10 dark:focus:ring-primary-light/15 box-border" />
                  </div>

                  {/* Bio */}
                  <div className="mb-[18px]">
                    <label className="block font-semibold text-[0.82rem] text-txt-primary dark:text-[#E2D9F3] mb-1.5">Bio</label>
                    <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell us about yourself..." maxLength={500} rows={4} className="w-full py-2.5 px-3 border border-border dark:border-[#2D2A35] rounded-lg text-[0.88rem] font-inherit bg-bg dark:bg-[#0F0C15] text-txt-primary dark:text-[#E2D9F3] transition-all resize-y min-h-[90px] leading-relaxed focus:outline-none focus:border-primary dark:focus:border-primary-light focus:ring-[3px] focus:ring-primary/10 dark:focus:ring-primary-light/15 box-border" />
                  </div>

                  {/* Privacy toggle */}
                  <div className="flex items-start justify-between gap-4 mb-[18px]">
                    <div className="flex-1">
                      <label className="block font-semibold text-[0.82rem] text-txt-primary dark:text-[#E2D9F3] mb-0">Private Account</label>
                      <span className="block font-normal text-[0.78rem] text-txt-secondary dark:text-[#6b6580] mt-0.5">Only approved followers can see your books</span>
                    </div>
                    <button type="button" className={`relative w-12 h-[26px] border-none rounded-[26px] cursor-pointer p-0 transition-colors duration-200 flex-shrink-0 ${!editForm.isPublic ? 'bg-primary dark:bg-primary-light' : 'bg-border dark:bg-[#2D2A35]'}`} onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}>
                      <span className={`absolute top-0.5 left-0.5 w-[22px] h-[22px] bg-white rounded-full transition-transform duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.15)] ${!editForm.isPublic ? 'translate-x-[22px]' : ''}`} />
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="flex gap-2.5 justify-end mt-6 pt-4 border-t border-border dark:border-[#2D2A35]">
                    <button type="button" className="py-[9px] px-5 border rounded-lg font-semibold text-[0.85rem] cursor-pointer transition-all bg-bg-secondary dark:bg-[#2D2A35] border-border dark:border-[#3b3670] text-txt-primary dark:text-[#E2D9F3] hover:bg-border dark:hover:bg-[#3b3670]" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button type="submit" className="py-[9px] px-5 border-none rounded-lg font-semibold text-[0.85rem] cursor-pointer transition-all bg-primary hover:bg-primary-hover text-white">Save Changes</button>
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
