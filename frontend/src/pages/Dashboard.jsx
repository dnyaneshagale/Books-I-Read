import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Library, Wand2, Newspaper, PenLine, BookMarked, Search, Sun, Moon, Download, Upload, LogOut, CheckCircle, BookOpen, FileText, Flame, Globe, BarChart3, Lightbulb, RefreshCw } from 'lucide-react';
import BookCard from '../components/BookCard';
import AddBookForm from '../components/AddBookForm';
import UpdateProgressModal from '../components/UpdateProgressModal';
import ShareModal from '../components/ShareModal';
import ImportModal from '../components/ImportModal';
import AnalyticsModal from '../components/AnalyticsModal';
import InsightsModal from '../components/InsightsModal';
import NotesModal from '../components/NotesModal';
import RecommendationModal from '../components/RecommendationModal';
import ProfileDropdown from '../components/ProfileDropdown';
import NotificationBell from '../components/social/NotificationBell';
import ReadingGoalWidget from '../components/ReadingGoalWidget';
import ReviewForm from '../components/social/ReviewForm';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import { READING_QUOTES } from '../data/quotes';

/* ─── Tailwind class constants ─────────────────────────── */

const dashboardCls = [
  'min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30',
  'dark:from-[#0f0d15] dark:via-[#13111a] dark:to-[#0f0d15]',
  'transition-colors duration-300',
  'pb-[env(safe-area-inset-bottom,0px)]'
].join(' ');

// ── Navbar ──
const navbarCls = [
  'sticky top-0 z-40',
  'pt-[env(safe-area-inset-top,0px)]',
  'bg-white/80 dark:bg-[#1E1B24]/80',
  'backdrop-blur-[20px] backdrop-saturate-[180%]',
  'shadow-sm border-b border-gray-200/50 dark:border-white/5'
].join(' ');

const navContentCls = [
  'max-w-[1400px] mx-auto flex items-center justify-between',
  'gap-4 px-6 py-3',
  'max-[768px]:px-4 max-[768px]:py-3 max-[768px]:relative max-[768px]:gap-2.5',
  'max-[480px]:px-2 max-[480px]:py-[6px] max-[480px]:gap-1'
].join(' ');

const navBrandCls = [
  'flex items-center gap-3 shrink min-w-0 flex-wrap',
  'max-[768px]:gap-2.5 max-[480px]:gap-2'
].join(' ');

const brandIconCls = [
  'text-[28px] leading-none flex items-center',
  'drop-shadow-[0_2px_4px_rgba(99,102,241,0.3)]',
  'animate-[db-float_3s_ease-in-out_infinite]',
  'max-[768px]:text-[26px] max-[480px]:text-[22px]'
].join(' ');

const navBrandH1Cls = [
  'text-xl font-bold',
  'bg-gradient-to-br from-violet-700 to-purple-500',
  'bg-clip-text text-transparent',
  'tracking-[-0.5px] m-0 leading-none flex items-center whitespace-nowrap',
  'max-[768px]:text-lg max-[768px]:tracking-[-0.5px]',
  'max-[480px]:text-base'
].join(' ');

const navActionsCls = 'flex items-center gap-3 flex-nowrap max-[768px]:gap-2';

// ── Navbar Buttons ──
const btnAiRecommendCls = [
  'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900',
  'border-2 border-amber-400 p-0 w-10 h-10 rounded-full',
  'text-xl font-bold cursor-pointer transition-all duration-200',
  'shadow-[0_2px_8px_rgba(251,191,36,0.3)]',
  'flex items-center justify-center shrink-0',
  'hover:scale-110 hover:shadow-[0_4px_16px_rgba(251,191,36,0.5)]',
  'hover:from-amber-200 hover:to-amber-300',
  'active:scale-105',
  'dark:bg-none dark:bg-[rgba(255,215,0,0.1)] dark:text-[#FFD700]',
  'dark:border-[rgba(255,215,0,0.3)] dark:shadow-[0_2px_8px_rgba(255,215,0,0.2)]',
  'dark:hover:bg-[rgba(255,215,0,0.15)] dark:hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)]',
  'dark:hover:text-[#FFE55C]',
  'max-[768px]:w-11 max-[768px]:h-11 max-[768px]:text-[22px]'
].join(' ');

const btnAddBookCls = [
  'bg-violet-600/85 text-white',
  'border-none px-5 h-10 rounded-full',
  'text-xs font-bold cursor-pointer transition-all duration-500',
  'shadow-[0_2px_8px_rgba(109,40,217,0.15)]',
  'relative overflow-hidden tracking-wide whitespace-nowrap',
  'flex items-center justify-center',
  'hover:bg-violet-700 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(109,40,217,0.25)]',
  'active:translate-y-0 active:shadow-sm',
  'dark:bg-[#7C4DFF]/70 dark:hover:bg-[#7C4DFF]/90',
  'max-[768px]:px-4 max-[768px]:h-11 max-[768px]:text-sm'
].join(' ');

const btnSocialIconCls = [
  'bg-indigo-500/80 text-white',
  'border-none p-0 w-10 h-10 rounded-full text-xl',
  'cursor-pointer transition-all duration-200',
  'shadow-[0_2px_8px_rgba(99,102,241,0.15)]',
  'flex items-center justify-center shrink-0',
  'hover:bg-indigo-600 hover:scale-110 hover:shadow-[0_4px_16px_rgba(99,102,241,0.3)]',
  'active:scale-105',
  'dark:bg-[rgba(99,102,241,0.25)] dark:text-indigo-300',
  'dark:shadow-[0_2px_8px_rgba(99,102,241,0.1)]',
  'dark:hover:bg-[rgba(99,102,241,0.4)] dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.2)]'
].join(' ');

const btnAnalyticsIconCls = [
  'bg-transparent border-none p-0 w-10 h-10 rounded-full',
  'text-xl cursor-pointer transition-all duration-200',
  'flex items-center justify-center',
  'text-gray-500 dark:text-slate-400',
  'hover:bg-black/5 hover:scale-105 dark:hover:bg-white/10',
  'active:scale-95'
].join(' ');

const desktopOnlyCls = 'inline-flex max-[768px]:!hidden';

const btnHamburgerCls = [
  'hidden max-[768px]:flex items-center justify-center',
  'bg-violet-600/85 text-white',
  'border-none px-3 py-2.5 rounded-lg text-xl font-bold',
  'cursor-pointer transition-all duration-200 shadow-sm',
  'min-w-[44px] min-h-[44px] touch-manipulation',
  'hover:bg-violet-700 hover:scale-105 hover:shadow-md',
  'dark:bg-[#7C4DFF]/70 dark:hover:bg-[#7C4DFF]/90'
].join(' ');

// ── Mobile Dropdown ──
const navDropdownCls = [
  'hidden max-[768px]:block fixed top-[60px] right-4',
  'bg-white dark:bg-[#1E1B24]',
  'border border-gray-200 dark:border-white/10',
  'rounded-xl shadow-xl min-w-[200px] z-[1000]',
  'transition-all duration-200',
  'max-h-[80vh] overflow-y-auto',
  'max-[480px]:top-[48px] max-[480px]:right-2'
].join(' ');

const navDropdownClosedCls = 'opacity-0 -translate-y-2.5 pointer-events-none';
const navDropdownOpenCls = 'opacity-100 translate-y-0 pointer-events-auto';

const navDropdownBtnCls = [
  'block w-full text-left px-5 py-3.5',
  'border-none bg-transparent touch-manipulation',
  'text-gray-800 dark:text-gray-200 text-sm font-medium',
  'cursor-pointer transition-all duration-200',
  'border-b border-gray-200 dark:border-white/10',
  'hover:bg-gray-100 dark:hover:bg-white/5 hover:text-violet-700 dark:hover:text-violet-400',
  'last:border-b-0 last:rounded-b-xl'
].join(' ');

// ── Main Content ──
const mainContentCls = [
  'max-w-[1400px] mx-auto px-8 py-8',
  'transition-colors duration-300',
  'animate-[g-fadeInUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]',
  'max-[768px]:px-4 max-[768px]:py-6'
].join(' ');

const addBookSectionCls = 'max-w-[600px] mx-auto';

// ── Quote Banner ──
const quoteBannerCls = 'mb-4';

const quoteBannerContentCls = [
  'bg-gradient-to-br from-violet-700/10 to-purple-500/5',
  'dark:bg-[rgba(124,77,255,0.08)]',
  'rounded-xl px-6 py-4 flex items-center gap-4',
  'border-l-4 border-l-violet-700 dark:border-l-[#7C4DFF]',
  'dark:border-t dark:border-t-white/5',
  'transition-all duration-200',
  'hover:border-l-[6px] hover:from-violet-700/[0.15] hover:to-purple-500/[0.08]',
  'dark:hover:bg-[rgba(124,77,255,0.12)]',
  'max-[768px]:px-4 max-[768px]:flex-wrap max-[768px]:gap-2'
].join(' ');

const quoteIconCls = 'text-xl shrink-0';

const quoteTextWrapperCls = 'flex-1 flex flex-col gap-1 min-w-0 overflow-hidden';

const quoteTextCompactCls = [
  'text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed',
  'break-words [overflow-wrap:break-word] [word-break:break-word] [hyphens:auto]'
].join(' ');

const quoteAuthorCls = [
  'text-xs text-gray-400 dark:text-gray-500 font-medium text-right',
  'break-words [overflow-wrap:break-word]'
].join(' ');

const btnRefreshQuoteCls = [
  'bg-transparent border-none text-lg cursor-pointer',
  'px-2 py-1 rounded-lg transition-all duration-200 shrink-0',
  'hover:enabled:bg-violet-700/10 hover:enabled:rotate-180',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'max-[768px]:min-w-[36px] max-[768px]:min-h-[36px]'
].join(' ');

// ── Stats Grid ──
const statsGridCls = [
  'grid grid-cols-2 min-[769px]:grid-cols-4 gap-4 mb-6'
].join(' ');

const statCardCls = [
  'group relative overflow-hidden',
  'bg-white dark:bg-[#1E1B24]',
  'border border-gray-200',
  'dark:border-x-0 dark:border-b-0 dark:border-t-white/[0.08]',
  'rounded-xl px-6 py-6 flex items-center gap-4',
  'transition-all duration-200 shadow-xs',
  'dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]',
  'before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full',
  'before:bg-gradient-to-b before:from-violet-700 before:to-violet-400',
  'before:scale-y-0 before:origin-bottom before:transition-transform before:duration-200',
  'hover:before:scale-y-100 hover:before:origin-top',
  'hover:border-violet-700 hover:-translate-y-0.5 hover:shadow-md',
  'dark:hover:border-t-[rgba(124,77,255,0.3)]',
  'dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-10px_rgba(124,77,255,0.2)]',
  'max-[768px]:min-h-[100px]'
].join(' ');

const statIconCls = [
  'text-[32px] shrink-0 transition-transform duration-200',
  'group-hover:scale-110'
].join(' ');

const statContentCls = 'flex-1 min-w-0';

const statValueCls = [
  'text-2xl font-black',
  'bg-gradient-to-br from-violet-700 to-violet-500',
  'bg-clip-text text-transparent leading-tight mb-0.5'
].join(' ');

const statLabelCls = 'text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide';

// ── Goal + Social Row ──
const goalSocialRowCls = [
  'grid grid-cols-[3fr_2fr] gap-4 mb-6 items-stretch',
  'max-[600px]:grid-cols-1'
].join(' ');

const goalSocialColCls = 'min-w-0 flex [&>*]:flex-1 [&>*]:!mb-0';

// ── Social Entry Card ──
const socialEntryCardCls = [
  'group relative flex items-center justify-between gap-4',
  'bg-violet-600/80',
  'dark:bg-violet-800/70',
  'rounded-2xl px-6 py-7 cursor-pointer',
  'transition-all duration-300 text-white',
  'h-full box-border flex-1 overflow-hidden',
  'hover:bg-violet-700/90 hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(109,40,217,0.2)]',
  'dark:hover:bg-violet-700/80 dark:hover:shadow-[0_12px_32px_rgba(76,29,149,0.3)]',
  'max-[480px]:px-4 max-[480px]:py-5'
].join(' ');

const socialGlowCls = [
  'absolute -top-[30%] -right-[20%] w-40 h-40 rounded-full',
  'bg-white/[0.08] pointer-events-none'
].join(' ');

const socialContentCls = 'flex items-center gap-4 relative z-[1]';

const socialIconWrapCls = [
  'w-12 h-12 rounded-[14px] bg-white/15 backdrop-blur-sm',
  'flex items-center justify-center shrink-0',
  'transition-colors duration-200',
  'group-hover:bg-white/[0.22]',
  'max-[480px]:w-10 max-[480px]:h-10 max-[480px]:rounded-[10px]',
  'max-[480px]:[&_svg]:w-[22px] max-[480px]:[&_svg]:h-[22px]'
].join(' ');

const socialTextCls = 'flex flex-col gap-0.5';
const socialTextH3Cls = 'm-0 text-[1.1rem] font-bold text-white tracking-tight';
const socialTextPCls = 'm-0 text-[0.8rem] text-white/75 font-normal';

const socialArrowCls = [
  'relative z-[1] opacity-60 shrink-0',
  'transition-all duration-200',
  'group-hover:opacity-100 group-hover:translate-x-[3px]'
].join(' ');

// ── Filters Section ──
const filtersSectionCls = 'mb-8 flex flex-col gap-2 max-[768px]:gap-4';

const searchBarCls = 'relative w-full';

const searchInputCls = [
  'w-full py-4 pl-5 pr-12 border-2 border-slate-400',
  'rounded-xl text-base font-medium',
  'bg-white dark:bg-[#15121B]',
  'text-gray-800 dark:text-gray-200',
  'transition-all duration-200 shadow-xs',
  'focus:outline-none focus:border-violet-700 focus:-translate-y-0.5',
  'focus:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_0_0_4px_rgba(99,102,241,0.1)]',
  'dark:border-white/10',
  'dark:focus:border-[rgba(124,77,255,0.5)]',
  'dark:focus:shadow-[0_4px_12px_rgba(0,0,0,0.3),0_0_0_4px_rgba(124,77,255,0.15)]',
  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
  'max-[768px]:pl-4 max-[768px]:min-h-[52px]'
].join(' ');

const clearSearchCls = [
  'absolute right-3 top-1/2 -translate-y-1/2',
  'bg-gray-100 dark:bg-gray-700 border-none',
  'text-2xl text-gray-500 cursor-pointer',
  'p-2 leading-none rounded-lg transition-all duration-200',
  'hover:bg-violet-700 hover:text-white hover:rotate-90',
  'max-[768px]:text-[22px] max-[768px]:min-w-[44px] max-[768px]:min-h-[44px]'
].join(' ');

const filterTabsCls = [
  'flex gap-3 overflow-x-auto p-0 flex-nowrap',
  '[scrollbar-width:none] [-ms-overflow-style:none]',
  '[&::-webkit-scrollbar]:hidden',
  'max-[768px]:flex-wrap max-[768px]:p-1.5 max-[768px]:gap-1.5'
].join(' ');

const filterTabBaseCls = [
  'bg-white dark:bg-[#1E1B24] border border-gray-200 dark:border-white/10',
  'px-3.5 py-1.5 rounded-full text-sm font-medium',
  'text-gray-500 dark:text-gray-400 cursor-pointer',
  'transition-all duration-200 flex items-center justify-center',
  'gap-1.5 whitespace-nowrap shrink-0 shadow-xs min-h-8 h-8',
  'hover:border-violet-700 hover:text-violet-700',
  'hover:-translate-y-px hover:shadow-sm',
  'max-[768px]:flex-[1_1_calc(50%-6px)] max-[768px]:min-w-0',
  'max-[768px]:px-2.5 max-[768px]:py-3 max-[768px]:text-xs max-[768px]:min-h-[44px] max-[768px]:h-auto',
  'max-[400px]:text-[10px] max-[400px]:px-1.5 max-[400px]:py-2'
].join(' ');

const filterTabActiveCls = [
  '!bg-violet-600/85 !text-white',
  '!border-transparent shadow-[0_2px_8px_rgba(109,40,217,0.15)]',
  'dark:!bg-[#7C4DFF]/70'
].join(' ');

const filterCountCls = [
  'text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center',
  'max-[768px]:text-[11px] max-[768px]:px-[7px] max-[768px]:py-[3px] max-[768px]:min-w-[22px]'
].join(' ');

// ── Tag Filter ──
const tagFilterSectionCls = 'mt-2';
const tagFilterLabelCls = 'text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wide';
const tagFilterChipsCls = 'flex flex-wrap gap-2 max-[768px]:gap-2';

const tagFilterChipBaseCls = [
  'px-5 py-2.5 bg-white dark:bg-[#1E1B24] text-gray-500 dark:text-gray-400',
  'border-2 border-gray-200 dark:border-white/10 rounded-full',
  'text-sm font-semibold cursor-pointer transition-all duration-200 shadow-xs',
  'hover:-translate-y-[3px] hover:shadow-md hover:border-violet-700 hover:text-violet-700',
  'max-[768px]:px-3.5 max-[768px]:py-2 max-[768px]:text-xs max-[768px]:min-h-[36px]'
].join(' ');

const tagFilterChipActiveCls = [
  '!bg-violet-600/85 !text-white',
  '!border-transparent !shadow-md',
  'dark:!bg-[#7C4DFF]/70'
].join(' ');

// ── Books Section ──
const booksSectionCls = 'min-h-[400px]';

const booksGridCls = [
  'grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6',
  'max-[768px]:grid-cols-1 max-[768px]:gap-4'
].join(' ');

// ── Loading & Empty States ──
const loadingStateCls = 'flex flex-col items-center justify-center px-6 py-12 text-center';

const spinnerCls = [
  'w-10 h-10 border-[3px] border-gray-200 dark:border-white/10',
  'border-t-violet-700 rounded-full',
  'animate-[g-spin_0.8s_linear_infinite] mb-4'
].join(' ');

const emptyStateCls = 'flex flex-col items-center justify-center px-6 py-12 text-center';
const emptyIconCls = 'text-[64px] mb-4 opacity-50';
const emptyTitleCls = 'text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2';
const emptyTextCls = 'text-base text-gray-500 dark:text-gray-400 mt-2';

// ── Selection Mode & Bulk Actions ──
const selectionBarCls = [
  'fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-50',
  'bg-white dark:bg-[#1E1B24] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
  'rounded-2xl px-6 py-4 flex items-center gap-4',
  'border border-gray-200 dark:border-white/10',
  'backdrop-blur-xl transition-all duration-300'
].join(' ');

const selectionBarTextCls = 'font-semibold text-gray-900 dark:text-white';

const btnSelectModeCls = [
  'px-4 py-2 rounded-xl font-medium transition-all duration-200',
  'bg-violet-600/85 hover:bg-violet-700 text-white',
  'shadow-[0_2px_8px_rgba(109,40,217,0.15)]',
  'dark:bg-[#7C4DFF]/70 dark:hover:bg-[#7C4DFF]/90',
  'active:scale-95'
].join(' ');

const btnCancelSelectionCls = [
  'px-4 py-2 rounded-xl font-medium transition-all duration-200',
  'bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20',
  'text-gray-700 dark:text-gray-300 active:scale-95'
].join(' ');

const btnBatchDeleteCls = [
  'px-4 py-2 rounded-xl font-medium transition-all duration-200',
  'bg-red-600 hover:bg-red-700 text-white',
  'active:scale-95'
].join(' ');

const selectAllContainerCls = 'flex items-center gap-2 mb-4';
const selectAllLabelCls = 'text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none';

/* ─────────────────────────────────────────────────────── */

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [insightsBook, setInsightsBook] = useState(null);
  const [notesBook, setNotesBook] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [activityDates, setActivityDates] = useState([]);
  const [activityDetails, setActivityDetails] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [periodStats, setPeriodStats] = useState({ pagesThisWeek: 0, pagesThisMonth: 0, pagesThisYear: 0 });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [randomQuote, setRandomQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [goalRefreshKey, setGoalRefreshKey] = useState(0);
  const [reviewBook, setReviewBook] = useState(null);
  const [selectedBookIds, setSelectedBookIds] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Function to get a random quote from local collection
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * READING_QUOTES.length);
    return READING_QUOTES[randomIndex];
  };

  // Initialize with a random quote
  useEffect(() => {
    setRandomQuote(getRandomQuote());
  }, []);

  // Function to get a new random quote
  const getNewQuote = () => {
    setQuoteLoading(true);
    // Small delay for better UX
    setTimeout(() => {
      setRandomQuote(getRandomQuote());
      setQuoteLoading(false);
    }, 300);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Fetch books and activity dates on component mount
  useEffect(() => {
    fetchBooks();
    fetchActivityDates();
    fetchDailyStats();
    fetchPeriodStats();
  }, []);

  // Apply filtering whenever books, filter, search, or tag changes
  useEffect(() => {
    applyFilters();
  }, [books, activeFilter, searchQuery, selectedTag]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await bookApi.getAllBooks();
      setBooks(data);
      setGoalRefreshKey(k => k + 1);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityDates = async () => {
    try {
      const data = await bookApi.getActivityDates();
      // Convert string dates to Date objects
      const dates = data.activityDates.map(dateStr => new Date(dateStr));
      setActivityDates(dates);
      
      // Also fetch detailed activity data with page counts
      const detailsData = await bookApi.getActivityDetails();
      setActivityDetails(detailsData.activities || []);
    } catch (error) {
      // Silently handle - fall back to old streak logic
    }
  };

  const fetchDailyStats = async () => {
    try {
      const data = await bookApi.getDailyStats();
      setDailyStats(data.dailyStats || []);
    } catch (error) {
      // Silently handle - analytics will use fallback
    }
  };

  const fetchPeriodStats = async () => {
    try {
      const data = await bookApi.getPeriodStats();
      setPeriodStats({
        pagesThisWeek: data.pagesThisWeek || 0,
        pagesThisMonth: data.pagesThisMonth || 0,
        pagesThisYear: data.pagesThisYear || 0
      });
    } catch (error) {
      // Silently handle - will show 0
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const applyFilters = () => {
    let filtered = [...books];

    // Apply status filter
    if (activeFilter !== 'All') {
      const statusMap = {
        'Reading': 'READING',
        'Finished': 'FINISHED',
        'Want to Read': 'WANT_TO_READ',
        'Not Started': 'WANT_TO_READ'
      };
      filtered = filtered.filter(book => book.status === statusMap[activeFilter]);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(book => 
        book.tags && book.tags.includes(selectedTag)
      );
    }

    // Smart sorting: Reading -> Want to Read -> Finished
    filtered.sort((a, b) => {
      const statusOrder = { 'READING': 1, 'WANT_TO_READ': 2, 'FINISHED': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    setFilteredBooks(filtered);
  };

  const getAllTags = () => {
    const tagsSet = new Set();
    books.forEach(book => {
      if (book.tags && Array.isArray(book.tags)) {
        book.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  };

  const getFilterInfo = () => {
    const parts = [];
    if (activeFilter !== 'All') parts.push(activeFilter);
    if (selectedTag) parts.push(`Tag: ${selectedTag}`);
    if (searchQuery) parts.push(`Search: "${searchQuery}"`);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const handleShowInsights = async (book) => {
    setInsightsBook(book);
    setShowInsightsModal(true);
    
    // If AI notes haven't been generated yet or failed, trigger generation
    if (book.aiStatus === 'PENDING' || book.aiStatus === 'FAILED' || !book.aiSummary) {
      setInsightsLoading(true);
      try {
        await bookApi.generateAiNotes(book.id);
        // Refresh book data to get AI notes
        const updatedBook = await bookApi.getBookById(book.id);
        setInsightsBook(updatedBook);
        // Update book in the list
        setBooks(prevBooks => prevBooks.map(b => b.id === book.id ? updatedBook : b));
      } catch (error) {
        toast.error('Failed to generate AI insights');
      } finally {
        setInsightsLoading(false);
      }
    }
  };

  const handleCloseInsights = () => {
    setShowInsightsModal(false);
    setInsightsBook(null);
    setInsightsLoading(false);
  };

  const handleViewNotes = (book) => {
    setNotesBook(book);
    setShowNotesModal(true);
  };

  const handleCloseNotes = () => {
    setShowNotesModal(false);
    setNotesBook(null);
    fetchBooks(); // Refresh books to show updated notes
  };

  const handleAddFromRecommendation = async (recommendedBook) => {
    try {
      const bookRequest = {
        title: recommendedBook.title,
        author: recommendedBook.author,
        totalPages: 300, // Default, user can update later
        status: 'WANT_TO_READ',
        pagesRead: 0
        // No rating - will be null, user can add later
      };

      await bookApi.createBook(bookRequest);
      toast.success(`📚 "${recommendedBook.title}" added to your Want to Read list!`);
      fetchBooks(); // Refresh the book list
    } catch (error) {
      toast.error('Failed to add book');
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await bookApi.deleteBook(bookId);
      toast.success('🗑️ Book deleted successfully');
      fetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedBookIds(new Set()); // Clear selections when toggling mode
  };

  // Toggle individual book selection
  const toggleBookSelection = (bookId) => {
    setSelectedBookIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  // Select all filtered books
  const selectAllBooks = () => {
    if (selectedBookIds.size === filteredBooks.length) {
      setSelectedBookIds(new Set()); // Deselect all if all are selected
    } else {
      setSelectedBookIds(new Set(filteredBooks.map(book => book.id)));
    }
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    const count = selectedBookIds.size;
    if (count === 0) return;

    if (window.confirm(`Are you sure you want to delete ${count} book${count > 1 ? 's' : ''}? This will also remove all related activities.`)) {
      try {
        await bookApi.deleteBooksInBatch(Array.from(selectedBookIds));
        fetchBooks();
        toast.success(`🗑️ ${count} book${count > 1 ? 's' : ''} deleted successfully!`);
        setSelectedBookIds(new Set());
        setIsSelectionMode(false);
      } catch (error) {
        console.error('Batch delete error:', error);
        toast.error('Failed to delete books. Please try again.');
      }
    }
  };

  const handleUpdate = (book) => {
    setSelectedBook(book);
  };

  const calculateStats = () => {
    // Helper to get IST date (UTC+5:30)
    const getISTDate = (date = new Date()) => {
      const utcTime = date.getTime();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      return new Date(utcTime + istOffset);
    };

    // Helper to get start of day in IST
    const getISTStartOfDay = (date) => {
      const istDate = getISTDate(date);
      return new Date(Date.UTC(
        istDate.getUTCFullYear(),
        istDate.getUTCMonth(),
        istDate.getUTCDate(),
        0, 0, 0, 0
      ));
    };

    const completed = books.filter(b => b.status === 'FINISHED').length;
    const reading = books.filter(b => b.status === 'READING').length;
    const totalPagesRead = books.reduce((sum, b) => sum + b.pagesRead, 0);

    // Calculate temporal stats using IST
    const nowIST = getISTDate();
    const todayIST = getISTStartOfDay(nowIST);
    const finishedBooks = books.filter(b => b.status === 'FINISHED' && b.completeDate);
    
    // Books finished this week (last 7 days in IST)
    const weekAgoIST = new Date(todayIST.getTime() - 7 * 24 * 60 * 60 * 1000);
    const booksThisWeek = finishedBooks.filter(b => {
      const bookDateIST = getISTStartOfDay(new Date(b.completeDate));
      return bookDateIST >= weekAgoIST;
    }).length;
    
    // Books finished this month (in IST)
    const monthStartIST = new Date(Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      1, 0, 0, 0, 0
    ));
    const booksThisMonth = finishedBooks.filter(b => {
      const bookDateIST = getISTStartOfDay(new Date(b.completeDate));
      return bookDateIST >= monthStartIST;
    }).length;
    
    // Books finished this year (in IST)
    const yearStartIST = new Date(Date.UTC(nowIST.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
    const booksThisYear = finishedBooks.filter(b => {
      const bookDateIST = getISTStartOfDay(new Date(b.completeDate));
      return bookDateIST >= yearStartIST;
    }).length;
    
    // Calculate reading streak using activity dates (pass start of day for today)
    const streak = calculateReadingStreak(activityDates, getISTStartOfDay, todayIST);
    
    // Average pages per book (based on pages read across all books)
    const avgPages = books.length > 0 ? Math.round(totalPagesRead / books.length) : 0;
    
    // Calculate reading pace (pages per day)
    const readingPace = calculateReadingPace(books);

    // Calculate pages read for each time period
    const booksFinishedThisWeek = finishedBooks.filter(b => {
      const bookDateIST = getISTStartOfDay(new Date(b.completeDate));
      return bookDateIST >= weekAgoIST;
    });
    const pagesThisWeek = periodStats.pagesThisWeek;

    const booksFinishedThisMonth = finishedBooks.filter(b => {
      const bookDateIST = getISTStartOfDay(new Date(b.completeDate));
      return bookDateIST >= monthStartIST;
    });
    const pagesThisMonth = periodStats.pagesThisMonth;

    const booksFinishedThisYear = finishedBooks.filter(b => {
      const bookDateIST = getISTStartOfDay(new Date(b.completeDate));
      return bookDateIST >= yearStartIST;
    });
    const pagesThisYear = periodStats.pagesThisYear;

    return { 
      completed, 
      reading, 
      totalPagesRead,
      booksThisWeek,
      booksThisMonth,
      booksThisYear,
      pagesThisWeek,
      pagesThisMonth,
      pagesThisYear,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      avgPages,
      readingPace
    };
  };

  const calculateReadingStreak = (activityDatesFromBackend, getISTStartOfDay, todayIST) => {
    // Use activity dates from backend (already includes all reading activity)
    if (!activityDatesFromBackend || activityDatesFromBackend.length === 0) {
      return { current: 0, longest: 0 };
    }
    
    // Convert to IST start of day and sort (most recent first)
    // Filter out any future dates to prevent backdated entries from affecting current streak
    const todayStartOfDay = getISTStartOfDay(todayIST);
    const sortedDates = activityDatesFromBackend
      .map(date => getISTStartOfDay(new Date(date)))
      .filter(date => date <= todayStartOfDay) // Only include dates up to today
      .sort((a, b) => b - a);
    
    if (sortedDates.length === 0) {
      return { current: 0, longest: 0 };
    }
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    const yesterdayIST = new Date(todayStartOfDay.getTime() - 24 * 60 * 60 * 1000);
    const mostRecentActivity = sortedDates[0];
    
    // Current streak: Only count if most recent activity is today or yesterday
    // This ensures backdated entries don't extend current streak
    if (mostRecentActivity.getTime() === todayStartOfDay.getTime() || 
        mostRecentActivity.getTime() === yesterdayIST.getTime()) {
      currentStreak = 1;
      
      // Count consecutive days backwards from most recent
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = sortedDates[i];
        const previousDate = sortedDates[i - 1];
        const daysDiff = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
        } else if (daysDiff > 1) {
          break; // Stop counting if there's a gap
        }
      }
    }
    
    // Calculate longest streak from all dates (historical)
    tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const previousDate = sortedDates[i - 1];
      const daysDiff = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (daysDiff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    
    return { current: currentStreak, longest: longestStreak };
  };

  const calculateReadingPace = (books) => {
    if (books.length === 0) return null;
    
    // Helper to get IST date (UTC+5:30)
    const getISTDate = (date = new Date()) => {
      const utcTime = date.getTime();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      return new Date(utcTime + istOffset);
    };

    // Helper to get start of day in IST (midnight 00:00)
    const getISTStartOfDay = (date) => {
      const istDate = getISTDate(date);
      return new Date(Date.UTC(
        istDate.getUTCFullYear(),
        istDate.getUTCMonth(),
        istDate.getUTCDate(),
        0, 0, 0, 0
      ));
    };
    
    // Get all books with reading activity (reading or finished)
    const activeBooks = books.filter(b => 
      (b.status === 'READING' || b.status === 'FINISHED') && b.startDate
    );
    
    if (activeBooks.length === 0) return null;
    
    // Find the earliest start date (normalized to start of day in IST)
    const startDates = activeBooks.map(b => getISTStartOfDay(new Date(b.startDate)));
    const earliestStart = new Date(Math.min(...startDates));
    
    // Calculate days from earliest start to today (using IST midnight boundaries)
    const todayIST = getISTStartOfDay(getISTDate());
    const totalDays = Math.max(1, Math.ceil((todayIST - earliestStart) / (1000 * 60 * 60 * 24)) + 1);
    
    // Calculate total pages read across all books
    const totalPagesRead = books.reduce((sum, b) => sum + (b.pagesRead || 0), 0);
    
    // Pages per day (1 decimal place)
    const pace = totalPagesRead / totalDays;
    return Math.round(pace * 10) / 10;
  };

  const stats = calculateStats();

  return (
    <div className={dashboardCls}>
      {/* Navbar */}
      <nav className={navbarCls}>
        <div className={navContentCls}>
          <div className={navBrandCls}>
            <span className={brandIconCls}><Library className="w-6 h-6" /></span>
            <h1 className={navBrandH1Cls}>Books I Read</h1>
          </div>
          <div className={navActionsCls}>
            {/* AI Magic Wand - Icon only */}
            <button
              className={btnAiRecommendCls}
              onClick={() => setShowRecommendationModal(true)}
              title="Get AI Recommendations"
            >
              <Wand2 className="w-5 h-5" />
            </button>

            {/* Add Book - Primary action */}
            <button
              className={btnAddBookCls}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '← Back' : '+ Add Book'}
            </button>

            {/* Social - Icon only (desktop) */}
            <button
              className={`${btnSocialIconCls} ${desktopOnlyCls}`}
              onClick={() => navigate('/feed')}
              title="Social"
            >
              <Globe className="w-5 h-5" />
            </button>

            {/* Analytics - Icon only (desktop) */}
            <button
              className={`${btnAnalyticsIconCls} ${desktopOnlyCls}`}
              onClick={() => setShowAnalyticsModal(true)}
              title="View Analytics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>

            {/* Notification Bell (desktop) */}
            <div className={desktopOnlyCls}>
              <NotificationBell />
            </div>

            {/* Profile Dropdown (desktop) */}
            <ProfileDropdown
              username={user?.username || 'User'}
              onImport={() => setShowImportModal(true)}
              onShare={() => setShowShareModal(true)}
              onLogout={handleLogout}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
            
            {/* Hamburger Menu (mobile) */}
            <button 
              className={btnHamburgerCls}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[999] md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Dropdown Menu — outside nav to avoid backdrop-filter clipping */}
      <div className={`${navDropdownCls} ${menuOpen ? navDropdownOpenCls : navDropdownClosedCls}`}>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  setShowAnalyticsModal(true);
                  setMenuOpen(false);
                }}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />Analytics
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  navigate('/profile');
                  setMenuOpen(false);
                }}
              >
                👤 My Profile
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  navigate('/feed');
                  setMenuOpen(false);
                }}
              >
                <Newspaper className="w-4 h-4 inline-block mr-2" /> Feed
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  navigate('/reviews');
                  setMenuOpen(false);
                }}
              >
                <PenLine className="w-4 h-4 inline-block mr-2" /> Reviews
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  navigate('/lists');
                  setMenuOpen(false);
                }}
              >
                <BookMarked className="w-4 h-4 inline-block mr-2" /> Lists
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  navigate('/lists/browse');
                  setMenuOpen(false);
                }}
              >
                <Search className="w-4 h-4 inline-block mr-2" /> Browse Lists
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  navigate('/discover');
                  setMenuOpen(false);
                }}
              >
                <Search className="w-4 h-4 inline-block mr-2" /> Discover
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  setMenuOpen(false);
                }}
              >
                {isDarkMode ? <><Sun className="w-4 h-4 inline-block mr-2" /> Light Mode</> : <><Moon className="w-4 h-4 inline-block mr-2" /> Dark Mode</>}
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  setShowImportModal(true);
                  setMenuOpen(false);
                }}
              >
                <Download className="w-4 h-4 inline-block mr-2" /> Import
              </button>
              <button
                className={navDropdownBtnCls}
                onClick={() => {
                  setShowShareModal(true);
                  setMenuOpen(false);
                }}
              >
                <Upload className="w-4 h-4 inline-block mr-2" /> Share
              </button>
              <button 
                className={navDropdownBtnCls}
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 inline-block mr-2" /> Logout
              </button>
      </div>

      <div className={mainContentCls}>
        {showAddForm ? (
          <div className={addBookSectionCls}>
            <AddBookForm
              onBookAdded={() => {
                fetchBooks();
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        ) : (
          <>
            {/* Compact Quote Banner */}
            {randomQuote && (
              <div className={quoteBannerCls}>
                <div className={quoteBannerContentCls}>
                  <span className={quoteIconCls}><Lightbulb className="w-5 h-5" /></span>
                  <div className={quoteTextWrapperCls}>
                    <span className={quoteTextCompactCls}>
                      {quoteLoading ? 'Loading...' : `"${randomQuote.text}"`}
                    </span>
                    {!quoteLoading && (
                      <span className={quoteAuthorCls}>— {randomQuote.author}</span>
                    )}
                  </div>
                  <button 
                    className={btnRefreshQuoteCls}
                    onClick={getNewQuote}
                    disabled={quoteLoading}
                    title="New quote"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Statistics Cards - 2x2 Grid */}
            <div className={statsGridCls}>
              <div className={statCardCls}>
                <div className={statIconCls}><CheckCircle className="w-6 h-6" /></div>
                <div className={statContentCls}>
                  <div className={statValueCls}>{stats.completed}</div>
                  <div className={statLabelCls}>Completed</div>
                </div>
              </div>

              <div className={statCardCls}>
                <div className={statIconCls}><BookOpen className="w-6 h-6" /></div>
                <div className={statContentCls}>
                  <div className={statValueCls}>{stats.reading}</div>
                  <div className={statLabelCls}>Reading</div>
                </div>
              </div>

              <div className={statCardCls}>
                <div className={statIconCls}><FileText className="w-6 h-6" /></div>
                <div className={statContentCls}>
                  <div className={statValueCls}>{stats.totalPagesRead.toLocaleString()}</div>
                  <div className={statLabelCls}>Pages Read</div>
                </div>
              </div>

              <div className={statCardCls}>
                <div className={statIconCls}><Flame className="w-6 h-6" /></div>
                <div className={statContentCls}>
                  <div className={statValueCls}>{stats.currentStreak}</div>
                  <div className={statLabelCls}>Streak</div>
                </div>
              </div>
            </div>

            {/* Goal + Social Row */}
            <div className={goalSocialRowCls}>
              <div className={goalSocialColCls}>
                <ReadingGoalWidget refreshKey={goalRefreshKey} />
              </div>
              <div className={goalSocialColCls}>
                <div className={socialEntryCardCls} onClick={() => navigate('/feed')}>
                  <div className={socialGlowCls}></div>
                  <div className={socialContentCls}>
                    <div className={socialIconWrapCls}>
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className={socialTextCls}>
                      <h3 className={socialTextH3Cls}>Social</h3>
                      <p className={socialTextPCls}>See what friends are reading</p>
                    </div>
                  </div>
                  <div className={socialArrowCls}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className={filtersSectionCls}>
              <div className={searchBarCls}>
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={searchInputCls}
                />
                {searchQuery && (
                  <button
                    className={clearSearchCls}
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className={filterTabsCls}>
                {['All', 'Want to Read', 'Reading', 'Finished'].map(filter => {
                  const statusMap = {
                    'All': null,
                    'Reading': 'READING',
                    'Finished': 'FINISHED',
                    'Want to Read': 'WANT_TO_READ'
                  };
                  
                  const count = filter === 'All'
                    ? books.length
                    : books.filter(b => b.status === statusMap[filter]).length;
                  
                  const isActive = activeFilter === filter;

                  return (
                    <button
                      key={filter}
                      className={`${filterTabBaseCls} ${isActive ? filterTabActiveCls : ''}`}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                      <span className={`${filterCountCls} ${isActive ? 'bg-white/25' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tag Filter */}
              {getAllTags().length > 0 && (
                <div className={tagFilterSectionCls}>
                  <div className={tagFilterLabelCls}>Filter by Tag:</div>
                  <div className={tagFilterChipsCls}>
                    <button
                      className={`${tagFilterChipBaseCls} ${selectedTag === null ? tagFilterChipActiveCls : ''}`}
                      onClick={() => setSelectedTag(null)}
                    >
                      All Tags
                    </button>
                    {getAllTags().map((tag, index) => (
                      <button
                        key={index}
                        className={`${tagFilterChipBaseCls} ${selectedTag === tag ? tagFilterChipActiveCls : ''}`}
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selection Mode Controls */}
              {filteredBooks.length > 0 && (
                <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
                  <button
                    onClick={toggleSelectionMode}
                    className={btnSelectModeCls}
                  >
                    {isSelectionMode ? 'Cancel Selection' : 'Select Books'}
                  </button>

                  {isSelectionMode && (
                    <div className={selectAllContainerCls}>
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={selectedBookIds.size === filteredBooks.length && filteredBooks.length > 0}
                        onChange={selectAllBooks}
                        className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                      <label htmlFor="select-all" className={selectAllLabelCls}>
                        Select All ({filteredBooks.length})
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Books Grid */}
            <div className={booksSectionCls}>
              {loading ? (
                <div className={loadingStateCls}>
                  <div className={spinnerCls}></div>
                  <p className="text-gray-500 dark:text-gray-400 text-base mt-2">Loading your library...</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className={emptyStateCls}>
                  <div className={emptyIconCls}><Library className="w-16 h-16" /></div>
                  <h3 className={emptyTitleCls}>No books found</h3>
                  <p className={emptyTextCls}>
                    {activeFilter === 'All'
                      ? 'Start building your reading library by adding your first book!'
                      : `No books with status "${activeFilter}"`}
                  </p>
                  {activeFilter === 'All' && (
                    <button
                      className="btn-primary mt-6"
                      onClick={() => setShowAddForm(true)}
                    >
                      Add Your First Book
                    </button>
                  )}
                </div>
              ) : (
                <div className={booksGridCls}>
                  {filteredBooks.map(book => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onShowInsights={handleShowInsights}
                      onViewNotes={handleViewNotes}
                      onWriteReview={(b) => setReviewBook(b)}
                      onTogglePrivacy={async (id, isPublic) => {
                        try {
                          await bookApi.togglePrivacy(id, isPublic);
                          fetchBooks();
                          toast.success(isPublic ? 'Book is now public' : 'Book is now private');
                        } catch { toast.error('Failed to update privacy'); }
                      }}
                      isSelectionMode={isSelectionMode}
                      isSelected={selectedBookIds.has(book.id)}
                      onToggleSelection={() => toggleBookSelection(book.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bulk Action Bar */}
      {isSelectionMode && selectedBookIds.size > 0 && (
        <div className={selectionBarCls}>
          <span className={selectionBarTextCls}>
            {selectedBookIds.size} book{selectedBookIds.size !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleBatchDelete}
            className={btnBatchDeleteCls}
          >
            Delete Selected
          </button>
          <button
            onClick={toggleSelectionMode}
            className={btnCancelSelectionCls}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Update Progress Modal */}
      {selectedBook && (
        <UpdateProgressModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdated={() => {
            fetchBooks();
            fetchActivityDates();  // Refresh activity dates for streak calculation
            setSelectedBook(null);
          }}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          books={filteredBooks}
          onClose={() => setShowShareModal(false)}
          filterInfo={getFilterInfo()}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImported={() => {
            fetchBooks();
            setShowImportModal(false);
          }}
        />
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <AnalyticsModal
          stats={stats}
          dailyStats={dailyStats}
          activityDates={activityDates}
          activityDetails={activityDetails}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}

      {/* AI Insights Modal */}
      {showInsightsModal && (
        <InsightsModal
          book={insightsBook}
          loading={insightsLoading}
          onClose={handleCloseInsights}
        />
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <NotesModal
          book={notesBook}
          onClose={handleCloseNotes}
          onUpdated={fetchBooks}
        />
      )}

      {/* Review Form Modal */}
      {reviewBook && (
        <ReviewForm
          bookId={reviewBook.id}
          bookTitle={reviewBook.title}
          onClose={() => setReviewBook(null)}
          onSaved={() => {
            fetchBooks();
            setReviewBook(null);
          }}
        />
      )}

      {/* AI Recommendation Modal */}
      {showRecommendationModal && (
        <RecommendationModal
          userBooks={books}
          onClose={() => setShowRecommendationModal(false)}
          onAddToWishlist={handleAddFromRecommendation}
        />
      )}
    </div>
  );
}

export default Dashboard;
