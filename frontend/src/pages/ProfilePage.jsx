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

// ============================================
// Tailwind Class Constants
// ============================================

const pageCls = [
  'min-h-screen px-4 py-6 pb-20 md:pt-20 md:pb-10',
  'bg-gradient-to-br from-slate-50 to-slate-100',
  'dark:from-[#1E1B24] dark:to-[#0F0C15]',
  'transition-[background] duration-300',
].join(' ');

const containerCls = [
  'max-w-[680px] lg:max-w-[740px] mx-auto',
  'animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]',
].join(' ');

const pageEmptyCls = [
  'flex flex-col items-center justify-center gap-3',
  'min-h-[50vh] text-slate-500 dark:text-[#9E95A8] text-base',
  '[&_svg]:opacity-40 [&_svg]:w-10 [&_svg]:h-10',
].join(' ');

const backBtnCls = [
  'inline-flex items-center gap-1.5 px-3.5 py-2',
  'bg-white dark:bg-[#1E1B24]',
  'border border-slate-200 dark:border-[#2D2A35]',
  'rounded-full text-slate-600 dark:text-[#9E95A8]',
  'text-[0.85rem] font-medium cursor-pointer',
  'shadow-[0_1px_2px_rgba(0,0,0,0.04)] mb-5',
  'transition-all duration-200',
  'hover:border-violet-700 hover:text-violet-700',
  'dark:hover:border-[#7C4DFF] dark:hover:text-[#7C4DFF]',
  'hover:shadow-sm',
].join(' ');

const headerCls = [
  'flex gap-7 p-6 px-7 bg-white dark:bg-[#1E1B24]',
  'rounded-2xl border border-slate-200 dark:border-[#2D2A35]',
  'shadow-md dark:shadow-[0_6px_18px_rgba(0,0,0,0.2)]',
  'mb-0 transition-all duration-300',
  'max-[640px]:flex-col max-[640px]:items-center max-[640px]:text-center',
  'max-[640px]:gap-4 max-[640px]:px-5',
].join(' ');

const avatarRingCls = [
  'w-[120px] h-[120px] max-[640px]:w-24 max-[640px]:h-24',
  'rounded-full p-1',
  'bg-[linear-gradient(135deg,#6d28d9_0%,#a855f7_40%,#ec4899_70%,#f59e0b_100%)]',
  'transition-transform duration-300',
  'hover:scale-[1.04] hover:animate-[pp-ringPulse_1.5s_ease_infinite]',
].join(' ');

const avatarImgCls = 'w-full h-full rounded-full object-cover border-[3px] border-white dark:border-[#1E1B24]';

const avatarFallbackCls = [
  'w-full h-full rounded-full',
  'bg-white dark:bg-[#1E1B24]',
  'text-violet-700 dark:text-[#7C4DFF]',
  'flex items-center justify-center font-bold',
  'text-[2.8rem] max-[640px]:text-[2.2rem]',
  'border-[3px] border-white dark:border-[#1E1B24]',
].join(' ');

const nameRowCls = [
  'flex items-center gap-3.5 flex-wrap mb-4',
  'max-[640px]:flex-col max-[640px]:gap-2.5',
].join(' ');

const usernameCls = [
  'text-[1.35rem] font-normal text-slate-900 dark:text-[#E2D9F3]',
  'm-0 flex items-center gap-1.5 tracking-tight',
].join(' ');

const editBtnCls = [
  'inline-flex items-center gap-1.5 px-4 py-[7px]',
  'bg-slate-100 dark:bg-[#2D2A35]',
  'border border-slate-200 dark:border-[#3b3670]',
  'rounded-lg font-semibold text-[0.82rem]',
  'text-slate-900 dark:text-[#E2D9F3]',
  'cursor-pointer transition-all duration-200',
  'hover:bg-slate-200 hover:border-violet-700',
  'dark:hover:bg-[#3b3670] dark:hover:border-[#7C4DFF]',
].join(' ');

const shareBtnCls = [
  'inline-flex items-center justify-center p-2',
  'bg-slate-100 dark:bg-[#2D2A35]',
  'border border-slate-200 dark:border-[#3b3670]',
  'rounded-lg text-slate-600 dark:text-[#9E95A8]',
  'cursor-pointer transition-all duration-200',
  'hover:bg-slate-200 hover:text-violet-700',
  'dark:hover:text-[#7C4DFF] dark:hover:border-[#7C4DFF]',
].join(' ');

const statBtnCls = [
  'bg-transparent border-none cursor-pointer',
  'py-2 px-0 flex flex-col items-center gap-0.5',
  'min-w-[72px] transition-opacity duration-200 hover:opacity-70',
].join(' ');

const statCountCls = 'font-bold text-[1.1rem] text-slate-900 dark:text-[#E2D9F3] leading-tight';
const statLabelCls = 'text-[0.78rem] text-slate-500 dark:text-[#9E95A8] font-normal';

const displayNameCls = 'font-semibold text-[0.9rem] text-slate-900 dark:text-[#E2D9F3] mb-0.5';
const bioCls = [
  'text-[0.88rem] text-slate-900 dark:text-[#c9bfdb]',
  'leading-relaxed m-0 mb-2 whitespace-pre-wrap break-words',
  'max-[640px]:text-center',
].join(' ');

const genreTagCls = [
  'px-2.5 py-[3px]',
  'bg-gradient-to-br from-violet-700/[0.08] to-purple-400/[0.08]',
  'dark:from-[#7C4DFF]/[0.12] dark:to-[#9575FF]/[0.08]',
  'border border-violet-700/15 dark:border-[#7C4DFF]/20',
  'rounded-full text-[0.73rem] font-medium',
  'text-violet-700 dark:text-[#7C4DFF]',
  'transition-all duration-200 hover:bg-violet-700/[0.12]',
].join(' ');

const followsYouCls = [
  'inline-flex items-center mt-2',
  'text-[0.78rem] font-medium text-slate-400 dark:text-[#9E95A8]',
  'bg-slate-100 dark:bg-[#2D2A35] px-2.5 py-[3px] rounded-full',
].join(' ');

const tabBarCls = [
  'flex bg-white dark:bg-[#1E1B24]',
  'border border-slate-200 dark:border-[#2D2A35] border-t-0',
  'rounded-b-2xl overflow-hidden shadow-sm mb-4',
].join(' ');

const tabItemBaseCls = [
  'flex-1 flex flex-col items-center gap-1',
  'py-3 px-2 max-[480px]:py-2.5 max-[480px]:px-1.5',
  'bg-transparent border-none border-t-2 border-t-transparent',
  'text-slate-400 dark:text-[#6b6580]',
  'text-[0.72rem] font-semibold uppercase tracking-[0.06em]',
  'cursor-pointer transition-all duration-200 relative',
  '[&_svg]:opacity-50 [&_svg]:transition-opacity [&_svg]:duration-200',
  'hover:text-slate-900 dark:hover:text-[#E2D9F3]',
  'hover:[&_svg]:opacity-80',
  'max-[480px]:[&_svg]:w-[22px] max-[480px]:[&_svg]:h-[22px]',
].join(' ');

const tabItemActiveCls = [
  '!text-violet-700 dark:!text-[#7C4DFF]',
  '!border-t-violet-700 dark:!border-t-[#7C4DFF]',
  '[&_svg]:!opacity-100 [&_svg]:!text-violet-700',
  'dark:[&_svg]:!text-[#7C4DFF]',
].join(' ');

const tabBadgeCls = [
  'absolute top-1.5 right-[calc(50%-20px)]',
  'min-w-4 h-4 px-1 rounded-lg',
  'bg-red-500 text-white text-[0.65rem] font-bold',
  'flex items-center justify-center leading-none',
].join(' ');

const contentCls = 'animate-[g-contentFade_0.3s_ease_0.1s_both]';
const sectionCls = 'animate-[g-contentFade_0.3s_ease]';

const emptyCls = [
  'flex flex-col items-center justify-center gap-3',
  'py-16 px-6 text-slate-400 dark:text-[#6b6580] text-[0.95rem]',
  'bg-white dark:bg-[#1E1B24] rounded-2xl',
  'border border-slate-200 dark:border-[#2D2A35]',
  '[&_svg]:opacity-30 [&_svg]:w-9 [&_svg]:h-9',
  '[&_p]:m-0',
].join(' ');

const privateNoticeCls = [
  'text-center py-20 px-6',
  'bg-white dark:bg-[#1E1B24] rounded-2xl',
  'border border-slate-200 dark:border-[#2D2A35] shadow-sm',
].join(' ');

const bookCardCls = [
  'flex gap-3.5 p-4 bg-white dark:bg-[#1E1B24]',
  'border border-slate-200 dark:border-[#2D2A35] rounded-xl',
  'transition-all duration-[250ms] ease-in-out',
  'animate-[g-fadeInScale_0.3s_ease_both] cursor-default',
  'hover:border-violet-700/30 dark:hover:border-[#7C4DFF]/30',
  'hover:shadow-md dark:hover:shadow-[0_6px_18px_rgba(0,0,0,0.2)]',
  'hover:-translate-y-px',
].join(' ');

const bookCoverCls = [
  'w-14 h-[72px] rounded-md flex items-center justify-center shrink-0',
  'bg-gradient-to-br from-violet-700/[0.08] to-blue-600/[0.06]',
  'dark:from-[#7C4DFF]/10 dark:to-[#9575FF]/[0.06]',
  'text-violet-700 dark:text-[#7C4DFF]',
  'border border-violet-700/10 dark:border-[#7C4DFF]/15',
].join(' ');

const bookTitleCls = [
  'text-[0.9rem] font-bold text-slate-900 dark:text-[#E2D9F3]',
  'm-0 mb-0.5 leading-tight truncate',
].join(' ');

const bookAuthorCls = 'text-[0.78rem] text-slate-500 dark:text-[#9E95A8] block mb-1.5';

const bookStatusBaseCls = [
  'inline-flex items-center gap-1 text-[0.72rem] font-semibold',
  'py-0.5 px-2 rounded-full',
].join(' ');

const STATUS_STYLES = {
  finished: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  reading: 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
  want_to_read: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300',
  default: 'bg-slate-100 dark:bg-[#2D2A35] text-slate-600 dark:text-[#9E95A8]',
};

const listCardCls = [
  'group flex items-center gap-3.5 py-3.5 px-4',
  'bg-white dark:bg-[#1E1B24]',
  'border border-slate-200 dark:border-[#2D2A35] rounded-xl',
  'cursor-pointer transition-all duration-[250ms] ease-in-out',
  'hover:border-violet-700/30 dark:hover:border-[#7C4DFF]/30',
  'hover:shadow-md dark:hover:shadow-[0_6px_18px_rgba(0,0,0,0.2)]',
  'hover:-translate-y-px',
].join(' ');

const listEmojiCls = [
  'text-2xl w-11 h-11 flex items-center justify-center shrink-0',
  'bg-gradient-to-br from-violet-700/[0.06] to-purple-400/[0.06]',
  'dark:from-[#7C4DFF]/10 dark:to-[#9575FF]/[0.06]',
  'rounded-xl',
].join(' ');

const listArrowCls = [
  'shrink-0 text-slate-400 dark:text-[#6b6580] opacity-50',
  'transition-opacity duration-200',
  'group-hover:opacity-100 group-hover:text-violet-700',
  'dark:group-hover:text-[#7C4DFF]',
].join(' ');

const reflectionCardCls = [
  'p-4 px-[18px] bg-white dark:bg-[#1E1B24]',
  'border border-slate-200 dark:border-[#2D2A35] rounded-xl',
  'cursor-pointer transition-all duration-[250ms] ease-in-out',
  'hover:border-violet-700/30 dark:hover:border-[#7C4DFF]/30',
  'hover:shadow-md dark:hover:shadow-[0_6px_18px_rgba(0,0,0,0.2)]',
  'hover:-translate-y-px',
].join(' ');

const reflectionContentCls = [
  'text-[0.9rem] leading-relaxed text-slate-900 dark:text-[#E2D9F3]',
  'whitespace-pre-wrap break-words m-0',
  'line-clamp-4',
].join(' ');

const reflectionBookCls = [
  'flex items-center gap-1.5 mt-2.5 py-2 px-3 rounded-lg',
  'bg-gradient-to-br from-violet-700/[0.04] to-blue-600/[0.03]',
  'dark:from-[#7C4DFF]/[0.08] dark:to-[#9575FF]/[0.04]',
  'text-[0.8rem] text-slate-600 dark:text-[#9E95A8]',
  '[&_svg]:shrink-0 [&_svg]:opacity-50',
].join(' ');

const requestCardCls = [
  'flex items-center justify-between py-3.5 px-4',
  'bg-white dark:bg-[#1E1B24]',
  'border border-slate-200 dark:border-[#2D2A35] rounded-xl',
  'transition-shadow duration-200 hover:shadow-sm',
].join(' ');

const requestAvatarCls = [
  'w-11 h-11 rounded-full shrink-0 overflow-hidden',
  'bg-gradient-to-br from-violet-700 to-purple-400',
  'flex items-center justify-center',
].join(' ');

const requestApproveBtnCls = [
  'py-[7px] px-4 border-none rounded-lg',
  'text-[0.82rem] font-semibold cursor-pointer',
  'transition-all duration-200',
  'bg-violet-700 text-white hover:bg-violet-800',
].join(' ');

const requestRejectBtnCls = [
  'py-[7px] px-4 rounded-lg',
  'text-[0.82rem] font-semibold cursor-pointer',
  'transition-all duration-200',
  'bg-slate-100 dark:bg-[#2D2A35]',
  'text-slate-600 dark:text-[#9E95A8]',
  'border border-slate-200 dark:border-[#3b3670]',
  'hover:bg-slate-200 dark:hover:bg-[#3b3670]',
].join(' ');

// Edit Profile Modal
const modalOverlayCls = [
  'fixed inset-0 bg-black/55 backdrop-blur-[4px]',
  'flex items-center justify-center z-[1000] p-6',
  'animate-[g-contentFade_0.15s_ease]',
].join(' ');

const modalCls = [
  'bg-white dark:bg-[#1E1B24]',
  'dark:border dark:border-[#2D2A35]',
  'rounded-2xl max-w-[480px] w-full max-h-[90vh] overflow-y-auto',
  'animate-[g-fadeInScale_0.2s_ease]',
  'shadow-[0_25px_50px_rgba(0,0,0,0.2)]',
].join(' ');

const modalHeaderCls = [
  'flex items-center justify-between px-6 py-[18px]',
  'border-b border-slate-200 dark:border-[#2D2A35]',
].join(' ');

const modalCloseBtnCls = [
  'p-1 bg-transparent border-none',
  'text-slate-400 cursor-pointer rounded-full',
  'transition-all duration-200 flex items-center justify-center',
  'hover:bg-slate-100 hover:text-slate-900',
  'dark:hover:bg-[#2D2A35] dark:hover:text-[#E2D9F3]',
].join(' ');

const formGroupCls = 'mb-[18px]';
const formLabelCls = 'block font-semibold text-[0.82rem] text-slate-900 dark:text-[#E2D9F3] mb-1.5';
const formInputCls = [
  'w-full py-2.5 px-3 border border-slate-200 dark:border-[#2D2A35]',
  'rounded-lg text-[0.88rem] font-[inherit]',
  'bg-white dark:bg-[#0F0C15]',
  'text-slate-900 dark:text-[#E2D9F3]',
  'transition-[border-color,box-shadow] duration-200 box-border',
  'focus:outline-none focus:border-violet-700 dark:focus:border-[#7C4DFF]',
  'focus:shadow-[0_0_0_3px_rgba(109,40,217,0.1)]',
  'dark:focus:shadow-[0_0_0_3px_rgba(124,77,255,0.15)]',
].join(' ');

const formTextareaCls = [
  formInputCls,
  'resize-y min-h-[90px] leading-relaxed',
].join(' ');

const editPhotoRingCls = [
  'w-14 h-14 rounded-full p-0.5 shrink-0',
  'bg-[linear-gradient(135deg,#6d28d9,#a855f7,#ec4899,#f59e0b)]',
].join(' ');

const editPhotoImgCls = 'w-full h-full rounded-full object-cover border-2 border-white dark:border-[#1E1B24]';

const editPhotoFallbackCls = [
  'w-full h-full rounded-full',
  'bg-white dark:bg-[#1E1B24] text-violet-700 dark:text-[#7C4DFF]',
  'flex items-center justify-center font-bold text-[1.3rem]',
  'border-2 border-white dark:border-[#1E1B24]',
].join(' ');

const changePhotoBtnCls = [
  'bg-transparent border-none p-0',
  'text-[#0095f6] dark:text-[#58b1f5] text-[0.875rem] font-semibold',
  'cursor-pointer text-left transition-colors duration-200',
  'hover:text-[#00376b] dark:hover:text-[#8ecdf7]',
].join(' ');

const toggleBaseCls = [
  'relative w-12 h-[26px] border-none rounded-[26px]',
  'cursor-pointer p-0 transition-colors duration-200 shrink-0',
  'bg-slate-200 dark:bg-[#2D2A35]',
].join(' ');

const toggleActiveCls = '!bg-violet-700 dark:!bg-[#7C4DFF]';

const ghostBtnCls = [
  'py-[9px] px-5 rounded-lg font-semibold text-[0.85rem]',
  'cursor-pointer transition-all duration-200',
  'bg-slate-100 dark:bg-[#2D2A35]',
  'border border-slate-200 dark:border-[#3b3670]',
  'text-slate-900 dark:text-[#E2D9F3]',
  'hover:bg-slate-200 dark:hover:bg-[#3b3670]',
].join(' ');

const primaryBtnCls = [
  'py-[9px] px-5 border-none rounded-lg font-semibold text-[0.85rem]',
  'cursor-pointer transition-all duration-200',
  'bg-violet-700 text-white hover:bg-violet-800',
].join(' ');

// Skeleton
const skeletonShimmerCls = 'skeleton rounded-md';
const skeletonAvatarCls = 'skeleton w-[120px] h-[120px] max-[640px]:w-24 max-[640px]:h-24 rounded-full shrink-0';
const skeletonLineCls = 'skeleton h-3 rounded-md';

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
  <div className="animate-[g-contentFade_0.3s_ease]" aria-hidden="true">
    {/* Header */}
    <div className={[
      'flex gap-7 p-6 px-7 bg-white dark:bg-[#1E1B24]',
      'rounded-2xl border border-slate-200 dark:border-[#2D2A35]',
      'shadow-md mb-0',
      'max-[640px]:flex-col max-[640px]:items-center max-[640px]:gap-4 max-[640px]:px-5',
    ].join(' ')}>
      <div className={skeletonAvatarCls} />
      <div className="flex-1 flex flex-col gap-3 pt-2 max-[640px]:items-center">
        <div className={`${skeletonLineCls} w-40 !h-4`} />
        <div className={`${skeletonLineCls} w-[100px]`} />
        <div className="flex gap-6 mt-1 max-[640px]:justify-center">
          <div className="skeleton w-[52px] h-9 rounded-md" />
          <div className="skeleton w-[52px] h-9 rounded-md" />
          <div className="skeleton w-[52px] h-9 rounded-md" />
        </div>
      </div>
    </div>
    {/* Bio */}
    <div className="flex flex-col gap-2 py-4 px-7 bg-white dark:bg-[#1E1B24] border border-slate-200 dark:border-[#2D2A35] border-t-0">
      <div className={`${skeletonLineCls} w-full`} />
      <div className={`${skeletonLineCls} w-[55%]`} />
    </div>
    {/* Tabs */}
    <div className={[
      'flex gap-1 bg-white dark:bg-[#1E1B24]',
      'border border-slate-200 dark:border-[#2D2A35] border-t-0',
      'rounded-b-2xl py-3 px-4 mb-4',
    ].join(' ')}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="skeleton flex-1 h-8 rounded-md" />
      ))}
    </div>
    {/* Grid */}
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-[640px]:grid-cols-1 gap-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton h-[100px] rounded-xl" />
      ))}
    </div>
  </div>
);

// ============================================
// Star Rating
// ============================================

const StarRating = ({ rating }) => (
  <span className="inline-flex gap-px items-center">
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
      throw error;
    }
  };

  if (!loading && !profile) {
    return (
      <div className={pageCls}>
        <div className={pageEmptyCls}>
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

  const getStatusCls = (status) => {
    const key = (status || 'WANT_TO_READ').toLowerCase();
    return `${bookStatusBaseCls} ${STATUS_STYLES[key] || STATUS_STYLES.default}`;
  };

  return (
    <div className={pageCls}>
      {loading ? (
        <div className={containerCls}>
          <SkeletonLoader />
        </div>
      ) : (
      <>
      <div className={containerCls}>

        {/* Back Button */}
        <button className={backBtnCls} onClick={() => navigate(-1)}>
          <BackIcon />
          <span>Back</span>
        </button>

        {/* ── Profile Header ── */}
        <header className={headerCls}>
          {/* Avatar with gradient ring */}
          <div className="shrink-0 flex items-start pt-1">
            <div className={avatarRingCls}>
              {profile.profilePictureUrl ? (
                <img src={profile.profilePictureUrl} alt={profile.username} className={avatarImgCls} />
              ) : (
                <div className={avatarFallbackCls}>{getInitials()}</div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 min-w-0">
            {/* Username Row */}
            <div className={nameRowCls}>
              <h1 className={usernameCls}>
                {profile.username}
                {!profile.isPublic && <LockIcon size={16} />}
              </h1>
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <button className={editBtnCls} onClick={() => setIsEditing(true)}>
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
                  className={shareBtnCls}
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

            {/* Stats Row */}
            <div className="flex gap-0 mb-4 max-[640px]:justify-center">
              <button className={statBtnCls} onClick={() => handleTabChange('books')}>
                <span className={statCountCls}>{profile.booksCount || 0}</span>
                <span className={statLabelCls}>books</span>
              </button>
              <button className={statBtnCls} onClick={() => handleTabChange('followers')}>
                <span className={statCountCls}>{profile.followersCount || 0}</span>
                <span className={statLabelCls}>followers</span>
              </button>
              <button className={statBtnCls} onClick={() => handleTabChange('following')}>
                <span className={statCountCls}>{profile.followingCount || 0}</span>
                <span className={statLabelCls}>following</span>
              </button>
            </div>

            {/* Bio Section */}
            <div className="mt-1 max-[640px]:flex max-[640px]:flex-col max-[640px]:items-center">
              {profile.displayName && profile.displayName !== profile.username && (
                <div className={displayNameCls}>{profile.displayName}</div>
              )}
              {profile.bio && <p className={bioCls}>{profile.bio}</p>}
              {profile.favoriteGenres?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-[640px]:justify-center">
                  {profile.favoriteGenres.map((genre, i) => (
                    <span key={i} className={genreTagCls}>{genre}</span>
                  ))}
                </div>
              )}
              {!isOwnProfile && profile.isFollowedBy && (
                <span className={followsYouCls}>Follows you</span>
              )}
            </div>
          </div>
        </header>

        {/* ── Tab Bar ── */}
        <nav className={tabBarCls} role="tablist">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`${tabItemBaseCls} ${activeTab === t.key ? tabItemActiveCls : ''}`}
              onClick={() => handleTabChange(t.key)}
              role="tab"
              aria-selected={activeTab === t.key}
            >
              {t.icon}
              <span className="block max-[480px]:hidden">{t.label}</span>
              {t.badge > 0 && <span className={tabBadgeCls}>{t.badge}</span>}
            </button>
          ))}
        </nav>

        {/* ── Content ── */}
        <section className={contentCls}>
          {!canViewContent ? (
            <div className={privateNoticeCls}>
              <div className="mb-4 opacity-40"><LockIcon size={48} /></div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-[#E2D9F3] m-0 mb-2">This Account is Private</h3>
              <p className="text-slate-500 dark:text-[#9E95A8] m-0 text-[0.9rem]">Follow this account to see their books and activity.</p>
            </div>
          ) : (
            <>
              {/* BOOKS TAB */}
              {activeTab === 'books' && (
                <div className={sectionCls}>
                  {profileBooks.length === 0 ? (
                    <div className={emptyCls}>
                      <BookIcon />
                      <p>No books yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] max-[640px]:grid-cols-1 gap-3">
                      {profileBooks.map((book) => (
                        <div key={book.id} className={bookCardCls}>
                          <div className={bookCoverCls}>
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 opacity-60">
                              <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={bookTitleCls}>{book.title}</h4>
                            <span className={bookAuthorCls}>{book.author}</span>
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <span className={getStatusCls(book.status)}>
                                {book.status === 'FINISHED' && <><CheckIcon /> Finished</>}
                                {book.status === 'READING' && <><BookOpenIcon /> Reading</>}
                                {(!book.status || book.status === 'WANT_TO_READ') && 'Want to Read'}
                              </span>
                              {book.rating > 0 && <StarRating rating={book.rating} />}
                            </div>
                            {book.totalPages > 0 && (
                              <div className="mt-1 flex items-center gap-2">
                                <div className="flex-1 h-1 bg-slate-200 dark:bg-[#2D2A35] rounded-sm overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-violet-700 to-purple-400 rounded-sm transition-[width] duration-[400ms] ease-in-out"
                                    style={{ width: `${Math.min(100, book.progress || 0)}%` }}
                                  />
                                </div>
                                <span className="text-[0.7rem] text-slate-400 dark:text-[#6b6580] whitespace-nowrap">
                                  {book.pagesRead || 0}/{book.totalPages}
                                </span>
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
                <div className={sectionCls}>
                  {reviews.length === 0 ? (
                    <div className={emptyCls}>
                      <ReviewIcon />
                      <p>No reviews yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {reviews.map(review => (
                        <ReviewCard key={review.id} review={review} currentUserId={currentUser?.id} onUpdate={loadReviews} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LISTS TAB */}
              {activeTab === 'lists' && (
                <div className={sectionCls}>
                  {lists.length === 0 ? (
                    <div className={emptyCls}>
                      <ListIcon />
                      <p>No lists yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {lists.map(list => (
                        <div key={list.id} className={listCardCls} onClick={() => navigate(`/lists/${list.id}`)}>
                          <div className={listEmojiCls}>{list.coverEmoji}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="m-0 text-[0.9rem] font-semibold text-slate-900 dark:text-[#E2D9F3] truncate">
                              {list.name}
                            </h4>
                            <span className="flex items-center gap-1 text-[0.75rem] text-slate-400 dark:text-[#6b6580] mt-0.5">
                              {list.booksCount} book{list.booksCount !== 1 ? 's' : ''}
                              <span className="mx-0.5">·</span>
                              <HeartIcon filled /> {list.likesCount}
                            </span>
                          </div>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className={listArrowCls}>
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
                <div className={sectionCls}>
                  {reflections.length === 0 ? (
                    <div className={emptyCls}>
                      <ReflectionIcon />
                      <p>No reflections yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {reflections.map(r => (
                        <div key={r.id} className={reflectionCardCls} onClick={() => navigate(`/reflections/${r.id}`)}>
                          <p className={reflectionContentCls}>{r.content}</p>
                          {r.book && (
                            <div className={reflectionBookCls}>
                              <BookIcon /> {r.book.title} — {r.book.author}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 text-[0.75rem] text-slate-400 dark:text-[#6b6580]">
                            <span>
                              {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <div className="flex gap-3">
                              {r.likesCount > 0 && <span className="inline-flex items-center gap-1"><HeartIcon filled /> {r.likesCount}</span>}
                              {r.commentsCount > 0 && <span className="inline-flex items-center gap-1"><CommentBubbleIcon /> {r.commentsCount}</span>}
                            </div>
                          </div>
                          {r.visibleToFollowersOnly && (
                            <span className="inline-flex items-center gap-1 mt-2 text-[0.72rem] text-slate-400 dark:text-[#6b6580] opacity-70">
                              <LockIcon size={12} /> Followers only
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SAVED TAB */}
              {activeTab === 'saved' && isOwnProfile && (
                <div className={sectionCls}>
                  {savedItems.length === 0 ? (
                    <div className={emptyCls}>
                      <BookmarkIcon />
                      <p>No saved items yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {savedItems.map(item => (
                        item._type === 'review' ? (
                          <div key={`review-${item.id}`} className="relative flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-[5px] w-fit text-[0.72rem] font-bold uppercase tracking-[0.5px] py-[3px] px-2.5 rounded-[20px] text-violet-700 dark:text-violet-400 bg-violet-700/10 dark:bg-violet-400/15 [&_svg]:w-[13px] [&_svg]:h-[13px]">
                              <ReviewIcon /> Review
                            </span>
                            <ReviewCard review={item} currentUserId={currentUser?.id} onUpdate={loadSavedItems} />
                            <span className="text-[0.72rem] text-slate-400 dark:text-[#6b6580] pl-1">
                              Saved {new Date(item.savedAt || item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        ) : (
                          <div key={`reflection-${item.id}`} className="relative flex flex-col gap-1.5">
                            <span className="inline-flex items-center gap-[5px] w-fit text-[0.72rem] font-bold uppercase tracking-[0.5px] py-[3px] px-2.5 rounded-[20px] text-cyan-600 dark:text-cyan-300 bg-cyan-600/10 dark:bg-cyan-300/[0.12] [&_svg]:w-[13px] [&_svg]:h-[13px]">
                              <ReflectionIcon /> Reflection
                            </span>
                            <div className={reflectionCardCls} onClick={() => navigate(`/reflections/${item.id}`)}>
                              <p className={reflectionContentCls}>{item.content}</p>
                              {item.book && (
                                <div className={reflectionBookCls}>
                                  <BookIcon /> {item.book.title} — {item.book.author}
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-3 text-[0.75rem] text-slate-400 dark:text-[#6b6580]">
                                <span>
                                  {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <div className="flex gap-3">
                                  {item.likesCount > 0 && <span className="inline-flex items-center gap-1"><HeartIcon filled /> {item.likesCount}</span>}
                                  {item.commentsCount > 0 && <span className="inline-flex items-center gap-1"><CommentBubbleIcon /> {item.commentsCount}</span>}
                                </div>
                              </div>
                              {item.user && item.user.username !== profile.username && (
                                <span className="block mt-1.5 text-[0.78rem] font-semibold text-violet-700 dark:text-violet-400">
                                  by @{item.user.username}
                                </span>
                              )}
                            </div>
                            <span className="text-[0.72rem] text-slate-400 dark:text-[#6b6580] pl-1">
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
                <div className={sectionCls}>
                  {followers.length === 0 ? (
                    <div className={emptyCls}><p>No followers yet</p></div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {followers.map(user => (
                        <UserCard key={user.id} user={user} showFollowButton={user.id !== currentUser?.id} isOwnProfile={user.id === currentUser?.id} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* FOLLOWING TAB */}
              {activeTab === 'following' && (
                <div className={sectionCls}>
                  {following.length === 0 ? (
                    <div className={emptyCls}><p>Not following anyone yet</p></div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {following.map(user => (
                        <UserCard key={user.id} user={user} showFollowButton={user.id !== currentUser?.id} isOwnProfile={user.id === currentUser?.id} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REQUESTS TAB */}
              {activeTab === 'requests' && isOwnProfile && (
                <div className={sectionCls}>
                  {followRequests.length === 0 ? (
                    <div className={emptyCls}>
                      <RequestsIcon />
                      <p>No pending follow requests</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {followRequests.map(request => (
                        <div key={request.requestId} className={requestCardCls}>
                          <div
                            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                            onClick={() => navigate(`/profile/${request.requester.username}`)}
                          >
                            <div className={requestAvatarCls}>
                              {request.requester.profilePictureUrl ? (
                                <img src={request.requester.profilePictureUrl} alt={request.requester.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-bold text-[1.1rem]">
                                  {(request.requester.displayName || request.requester.username).charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-[0.9rem] text-slate-900 dark:text-[#E2D9F3]">
                                {request.requester.username}
                              </span>
                              {request.requester.displayName && (
                                <span className="text-[0.78rem] text-slate-500 dark:text-[#9E95A8] truncate">
                                  {request.requester.displayName}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button className={requestApproveBtnCls} onClick={() => handleApproveRequest(request.requestId)}>
                              Confirm
                            </button>
                            <button className={requestRejectBtnCls} onClick={() => handleRejectRequest(request.requestId)}>
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
        <div className={modalOverlayCls} onClick={() => setIsEditing(false)}>
          <div className={modalCls} onClick={e => e.stopPropagation()}>
            <div className={modalHeaderCls}>
              <h2 className="text-[1.15rem] font-semibold m-0 text-slate-900 dark:text-[#E2D9F3]">Edit Profile</h2>
              <button className={modalCloseBtnCls} onClick={() => setIsEditing(false)}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="py-5 px-6">
              {/* Instagram-style profile photo section */}
              <div className="flex items-center gap-5 py-4 mb-2 border-b border-[#efefef] dark:border-white/10">
                <div className={editPhotoRingCls}>
                  {profile.profilePictureUrl ? (
                    <img src={profile.profilePictureUrl} alt={profile.username} className={editPhotoImgCls} />
                  ) : (
                    <div className={editPhotoFallbackCls}>{getInitials()}</div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-base text-slate-900 dark:text-[#e0e0e0]">
                    {profile.username}
                  </span>
                  <button
                    type="button"
                    className={changePhotoBtnCls}
                    onClick={() => setIsPhotoModalOpen(true)}
                  >
                    Change profile photo
                  </button>
                </div>
              </div>

              <div className={formGroupCls}>
                <label className={formLabelCls}>Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={e => handleEditUsernameChange(e.target.value)}
                    placeholder="Unique username"
                    maxLength={50}
                    className={`${formInputCls} ${editUsernameStatus === 'taken' ? '!border-red-600' : editUsernameStatus === 'available' ? '!border-emerald-600' : ''}`}
                  />
                  {editUsernameStatus === 'checking' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-slate-500">Checking...</span>
                  )}
                  {editUsernameStatus === 'available' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-emerald-600">Available</span>
                  )}
                  {editUsernameStatus === 'taken' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-red-600">Taken</span>
                  )}
                  {editUsernameStatus === 'invalid' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-red-600">3-50 chars</span>
                  )}
                  {editUsernameStatus === 'same' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.72rem] font-semibold pointer-events-none text-slate-500">Current</span>
                  )}
                </div>
              </div>

              <div className={formGroupCls}>
                <label className={formLabelCls}>Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
                  placeholder="Your display name"
                  maxLength={100}
                  className={formInputCls}
                />
              </div>

              <div className={formGroupCls}>
                <label className={formLabelCls}>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  rows={4}
                  className={formTextareaCls}
                />
              </div>

              <div className={`${formGroupCls} flex items-start justify-between gap-4`}>
                <div className="flex-1">
                  <label className={formLabelCls}>Private Account</label>
                  <span className="block font-normal text-[0.78rem] text-slate-500 dark:text-[#6b6580] mt-0.5">
                    Only approved followers can see your books
                  </span>
                </div>
                <button
                  type="button"
                  className={`${toggleBaseCls} ${!editForm.isPublic ? toggleActiveCls : ''}`}
                  onClick={() => setEditForm({ ...editForm, isPublic: !editForm.isPublic })}
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-[22px] h-[22px] bg-white rounded-full transition-transform duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
                    style={{ transform: !editForm.isPublic ? 'translateX(22px)' : 'translateX(0)' }}
                  />
                </button>
              </div>

              <div className="flex gap-2.5 justify-end mt-6 pt-4 border-t border-slate-200 dark:border-[#2D2A35]">
                <button type="button" className={ghostBtnCls} onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className={primaryBtnCls}>Save Changes</button>
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
