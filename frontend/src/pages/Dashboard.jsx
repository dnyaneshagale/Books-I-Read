import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
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
// Dashboard.css fully migrated to Tailwind

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
    const totalPagesRead = books.reduce((sum, b) => sum + b.pagesRead, 0);

    // Pages per day (rounded)
    return Math.round(totalPagesRead / totalDays);
  };

  const stats = calculateStats();

  /* Shared Tailwind fragments */
  const navBtnMobile = 'block w-full text-left py-3.5 px-5 border-none bg-none text-txt-primary dark:text-[#E2D9F3] text-sm font-medium cursor-pointer transition-all border-b border-border dark:border-[#2D2A35] hover:bg-bg-hover dark:hover:bg-[#2D2A35] hover:text-primary dark:hover:text-primary-light';
  const statCardCls = 'bg-bg dark:bg-[#1E1B24] border border-border dark:border-transparent dark:border-t dark:border-t-white/[0.08] rounded-2xl p-5 md:p-6 flex items-center gap-4 transition-all shadow-xs dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-primary dark:hover:border-t-[rgba(124,77,255,0.3)] hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_-10px_rgba(124,77,255,0.2)] before:content-[\'\'] before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-gradient-to-b before:from-primary before:to-primary-light before:scale-y-0 before:transition-transform before:origin-bottom hover:before:scale-y-100 hover:before:origin-top';

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-secondary to-bg-tertiary transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-[rgba(15,23,42,0.8)] backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-[rgba(226,232,240,0.8)] dark:border-[rgba(51,65,85,0.8)] sticky top-0 z-40 shadow-sm transition-all duration-300">
        <div className="max-w-[1400px] mx-auto py-3 px-6 max-[480px]:py-1.5 max-[480px]:px-2 max-[480px]:gap-1 md:px-8 flex justify-between items-center gap-5 max-[768px]:gap-2.5 max-[768px]:py-3 max-[768px]:px-4 max-[768px]:relative">
          <div className="flex items-center gap-4 max-[480px]:gap-1.5 max-[768px]:gap-2.5 flex-shrink min-w-0 flex-wrap">
            <span className="text-[28px] max-[480px]:text-[22px] max-[768px]:text-[26px] drop-shadow-[0_2px_4px_rgba(99,102,241,0.3)] animate-[float_3s_ease-in-out_infinite] leading-none flex items-center">📚</span>
            <h1 className="text-xl max-[480px]:text-base max-[768px]:text-lg font-bold bg-gradient-to-br from-primary to-[#a855f7] bg-clip-text text-transparent tracking-tight m-0 leading-none flex items-center whitespace-nowrap">Books I Read</h1>
          </div>
          <div className="flex items-center gap-3 max-[768px]:gap-2 flex-nowrap">
            {/* AI Magic Wand */}
            <button className="bg-gradient-to-br from-[#fef3c7] to-[#fde68a] dark:bg-[rgba(255,215,0,0.1)] text-[#78350f] dark:text-[#FFD700] border-2 border-[#fbbf24] dark:border-[rgba(255,215,0,0.3)] p-0 w-10 h-10 max-[768px]:w-11 max-[768px]:h-11 max-[768px]:text-[22px] rounded-full text-xl font-bold cursor-pointer transition-all shadow-[0_2px_8px_rgba(251,191,36,0.3)] dark:shadow-[0_2px_8px_rgba(255,215,0,0.2)] flex items-center justify-center flex-shrink-0 hover:scale-110 hover:shadow-[0_4px_16px_rgba(251,191,36,0.5)] dark:hover:bg-[rgba(255,215,0,0.15)] dark:hover:shadow-[0_4px_16px_rgba(255,215,0,0.3)] dark:hover:text-[#FFE55C] active:scale-105" onClick={() => setShowRecommendationModal(true)} title="Get AI Recommendations">🪄</button>

            {/* Add Book */}
            <button className="bg-gradient-to-br from-primary to-primary-light text-white border-none px-5 max-[768px]:px-4 max-[768px]:h-11 max-[768px]:text-sm max-[400px]:px-2.5 max-[400px]:text-[11px] h-10 rounded-full text-xs font-bold cursor-pointer transition-all shadow-[0_2px_8px_rgba(109,40,217,0.3)] relative overflow-hidden tracking-wide whitespace-nowrap flex items-center justify-center hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(109,40,217,0.4)] active:translate-y-0 active:shadow-sm" onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? '← Back' : '+ Add Book'}</button>

            {/* Social (desktop) */}
            <button className="hidden md:inline-flex bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] dark:bg-[rgba(99,102,241,0.2)] text-white dark:text-[#818cf8] border-none p-0 w-10 h-10 rounded-full text-xl cursor-pointer transition-all shadow-[0_2px_8px_rgba(99,102,241,0.3)] dark:shadow-[0_2px_8px_rgba(99,102,241,0.2)] items-center justify-center flex-shrink-0 hover:scale-110 hover:shadow-[0_4px_16px_rgba(99,102,241,0.5)] dark:hover:bg-[rgba(99,102,241,0.3)] dark:hover:shadow-[0_4px_16px_rgba(99,102,241,0.35)] active:scale-105" onClick={() => navigate('/feed')} title="Social">🌐</button>

            {/* Analytics (desktop) */}
            <button className="hidden md:inline-flex bg-transparent border-none p-0 w-10 h-10 rounded-full text-xl cursor-pointer transition-all text-txt-secondary dark:text-[#94a3b8] items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 hover:scale-105 active:scale-95" onClick={() => setShowAnalyticsModal(true)} title="View Analytics">📊</button>

            {/* Notification Bell (desktop) */}
            <div className="hidden md:inline-flex"><NotificationBell /></div>

            {/* Profile Dropdown (desktop) */}
            <ProfileDropdown username={user?.username || 'User'} onImport={() => setShowImportModal(true)} onShare={() => setShowShareModal(true)} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

            {/* Hamburger (mobile) */}
            <button className="hidden max-[768px]:flex bg-gradient-to-br from-primary to-primary-light text-white border-none py-2.5 px-3 rounded-lg text-xl font-bold cursor-pointer transition-all shadow-sm items-center justify-center min-w-[44px] min-h-[44px] hover:scale-105 hover:shadow-md" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? '✕' : '☰'}</button>

            {/* Mobile Dropdown */}
            <div className={`hidden max-[768px]:block absolute top-full right-0 bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] rounded-2xl shadow-xl min-w-[200px] z-[1000] mt-2 transition-all ${menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2.5 pointer-events-none'}`}>
              <button className={navBtnMobile} onClick={() => { setShowAnalyticsModal(true); setMenuOpen(false); }}>📊 Analytics</button>
              <button className={navBtnMobile} onClick={() => { navigate('/profile'); setMenuOpen(false); }}>👤 My Profile</button>
              <button className={navBtnMobile} onClick={() => { navigate('/feed'); setMenuOpen(false); }}>📰 Feed</button>
              <button className={navBtnMobile} onClick={() => { navigate('/reviews'); setMenuOpen(false); }}>✍️ Reviews</button>
              <button className={navBtnMobile} onClick={() => { navigate('/lists'); setMenuOpen(false); }}>📚 Lists</button>
              <button className={navBtnMobile} onClick={() => { navigate('/lists/browse'); setMenuOpen(false); }}>🔍 Browse Lists</button>
              <button className={navBtnMobile} onClick={() => { navigate('/discover'); setMenuOpen(false); }}>🔍 Discover</button>
              <button className={navBtnMobile} onClick={() => { setIsDarkMode(!isDarkMode); setMenuOpen(false); }}>{isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</button>
              <button className={navBtnMobile} onClick={() => { setShowImportModal(true); setMenuOpen(false); }}>📥 Import</button>
              <button className={navBtnMobile} onClick={() => { setShowShareModal(true); setMenuOpen(false); }}>📤 Share</button>
              <button className={`${navBtnMobile} !border-b-0 rounded-b-2xl`} onClick={() => { handleLogout(); setMenuOpen(false); }}>🚪 Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 max-[768px]:px-4 max-[768px]:py-5 transition-colors duration-300 animate-fade-in-up">
        {showAddForm ? (
          <div className="max-w-[600px] mx-auto">
            <AddBookForm onBookAdded={() => { fetchBooks(); setShowAddForm(false); }} onCancel={() => setShowAddForm(false)} />
          </div>
        ) : (
          <>
            {/* Quote Banner */}
            {randomQuote && (
              <div className="mb-4 md:mb-5">
                <div className="bg-gradient-to-br from-[rgba(109,40,217,0.1)] to-[rgba(168,85,247,0.05)] dark:from-[rgba(124,77,255,0.08)] dark:to-transparent rounded-2xl py-3.5 px-5 max-[768px]:p-4 max-[768px]:flex-wrap max-[768px]:gap-2 flex items-center gap-4 border-l-4 border-l-primary dark:border-l-[#7C4DFF] dark:border-t dark:border-t-white/5 transition-all hover:border-l-[6px] hover:from-[rgba(109,40,217,0.15)] hover:to-[rgba(168,85,247,0.08)] dark:hover:from-[rgba(124,77,255,0.12)]">
                  <span className="text-xl flex-shrink-0">💡</span>
                  <div className="flex-1 flex flex-col gap-1 min-w-0 overflow-hidden">
                    <span className="text-sm text-txt-secondary dark:text-[#94a3b8] italic leading-relaxed break-words">{quoteLoading ? 'Loading...' : `"${randomQuote.text}"`}</span>
                    {!quoteLoading && <span className="text-xs text-txt-muted dark:text-[#64748b] font-medium text-right break-words">— {randomQuote.author}</span>}
                  </div>
                  <button className="bg-transparent border-none text-lg cursor-pointer p-1 px-2 rounded-lg transition-all flex-shrink-0 min-w-[36px] min-h-[36px] hover:bg-[rgba(109,40,217,0.1)] hover:rotate-180 disabled:opacity-50 disabled:cursor-not-allowed" onClick={getNewQuote} disabled={quoteLoading} title="New quote">🔄</button>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-5 md:mb-6">
              {[{ icon: '✅', val: stats.completed, lbl: 'Completed' }, { icon: '📖', val: stats.reading, lbl: 'Reading' }, { icon: '📄', val: stats.totalPagesRead.toLocaleString(), lbl: 'Pages Read' }, { icon: '🔥', val: stats.currentStreak, lbl: 'Streak' }].map(s => (
                <div key={s.lbl} className={statCardCls}>
                  <div className="text-[32px] flex-shrink-0 transition-transform group-hover:scale-110">{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl md:text-3xl font-black bg-gradient-to-br from-primary to-primary-light bg-clip-text text-transparent leading-tight mb-0.5">{s.val}</div>
                    <div className="text-xs text-txt-secondary dark:text-[#94a3b8] font-semibold uppercase tracking-wider">{s.lbl}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Goal + Social Row */}
            <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr] gap-4 mb-5 md:mb-6 items-stretch">
              <div className="min-w-0 flex [&_.goal-widget]:mb-0 [&_.goal-widget]:flex-1">
                <ReadingGoalWidget refreshKey={goalRefreshKey} />
              </div>
              <div className="min-w-0 flex">
                <div className="relative flex items-center justify-between gap-4 bg-gradient-to-br from-[#6d28d9] via-[#7c3aed] to-[#8b5cf6] dark:from-[#4c1d95] dark:via-[#5b21b6] dark:to-[#6d28d9] rounded-2xl py-7 px-6 max-[480px]:py-5 max-[480px]:px-4 cursor-pointer transition-all duration-250 text-white h-full box-border flex-1 overflow-hidden hover:-translate-y-[3px] hover:shadow-[0_12px_32px_rgba(109,40,217,0.35)] dark:hover:shadow-[0_12px_32px_rgba(76,29,149,0.45)] group" onClick={() => navigate('/feed')}>
                  <div className="absolute -top-[30%] -right-[20%] w-40 h-40 rounded-full bg-white/[0.08] pointer-events-none" />
                  <div className="flex items-center gap-4 relative z-[1]">
                    <div className="w-12 h-12 max-[480px]:w-10 max-[480px]:h-10 rounded-[14px] max-[480px]:rounded-[10px] bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-white/[0.22]">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="max-[480px]:w-[22px] max-[480px]:h-[22px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="m-0 text-[1.1rem] font-bold text-white tracking-tight">Social</h3>
                      <p className="m-0 text-[0.8rem] text-white/75 font-normal">See what friends are reading</p>
                    </div>
                  </div>
                  <div className="relative z-[1] opacity-60 flex-shrink-0 transition-all group-hover:opacity-100 group-hover:translate-x-[3px]">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 md:mb-8 flex flex-col gap-2 max-[768px]:gap-4">
              {/* Search */}
              <div className="relative w-full">
                <input type="text" placeholder="Search by title or author..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full py-4 pr-12 pl-5 max-[768px]:pl-4 max-[768px]:min-h-[52px] border-2 border-[#94a3b8] dark:border-white/10 rounded-2xl text-base bg-bg dark:bg-[#15121B] text-txt-primary dark:text-[#E2D9F3] transition-all shadow-xs font-medium focus:outline-none focus:border-primary dark:focus:border-[rgba(124,77,255,0.5)] focus:shadow-[var(--shadow-md),0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_4px_12px_rgba(0,0,0,0.3),0_0_0_4px_rgba(124,77,255,0.15)] focus:-translate-y-0.5 placeholder:text-txt-muted" />
                {searchQuery && (
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-bg-hover dark:bg-[#2D2A35] border-none text-2xl max-[768px]:text-[22px] text-txt-secondary cursor-pointer p-2 max-[768px]:min-w-[44px] max-[768px]:min-h-[44px] leading-none rounded-lg transition-all hover:bg-primary hover:text-white hover:-translate-y-1/2 hover:rotate-90" onClick={() => setSearchQuery('')} title="Clear search">×</button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-3 max-[768px]:flex-wrap max-[768px]:p-1.5 max-[768px]:gap-1.5 overflow-x-auto scrollbar-none flex-nowrap">
                {['All', 'Want to Read', 'Reading', 'Finished'].map(filter => {
                  const statusMap = { 'All': null, 'Reading': 'READING', 'Finished': 'FINISHED', 'Want to Read': 'WANT_TO_READ' };
                  const count = filter === 'All' ? books.length : books.filter(b => b.status === statusMap[filter]).length;
                  const isActive = activeFilter === filter;
                  return (
                    <button key={filter} className={`flex items-center justify-center gap-1.5 py-1.5 px-3.5 max-[768px]:flex-1 max-[768px]:basis-[calc(50%-6px)] max-[768px]:min-w-0 max-[768px]:py-3 max-[768px]:px-2.5 max-[768px]:text-xs max-[768px]:min-h-[44px] max-[400px]:text-[10px] max-[400px]:py-2 max-[400px]:px-1.5 rounded-full text-sm font-medium cursor-pointer transition-all whitespace-nowrap flex-shrink-0 shadow-xs h-8 ${isActive ? 'bg-gradient-to-br from-primary to-primary-light text-white border border-transparent shadow-[0_4px_12px_rgba(109,40,217,0.3)]' : 'bg-bg dark:bg-[#1E1B24] border border-border dark:border-[#2D2A35] text-txt-secondary dark:text-[#94a3b8] hover:border-primary hover:text-primary hover:-translate-y-px hover:shadow-sm'}`} onClick={() => setActiveFilter(filter)}>
                      {filter}
                      <span className={`text-xs max-[768px]:text-[11px] max-[768px]:py-[3px] max-[768px]:px-[7px] max-[768px]:min-w-[22px] py-0.5 px-2 rounded-full font-bold min-w-[20px] text-center ${isActive ? 'bg-white/25' : 'bg-bg-tertiary dark:bg-[#2D2A35] text-txt-muted dark:text-[#64748b]'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tag Filter */}
              {getAllTags().length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-semibold text-txt-secondary dark:text-[#94a3b8] mb-3 uppercase tracking-wider">Filter by Tag:</div>
                  <div className="flex flex-wrap gap-2 max-[768px]:gap-2">
                    <button className={`py-2.5 px-5 max-[768px]:py-2 max-[768px]:px-3.5 max-[768px]:text-xs max-[768px]:min-h-[36px] rounded-full text-sm font-semibold cursor-pointer transition-all shadow-xs ${selectedTag === null ? 'bg-gradient-to-br from-primary to-primary-light text-white border-2 border-transparent shadow-lg' : 'bg-bg dark:bg-[#1E1B24] text-txt-secondary dark:text-[#94a3b8] border-2 border-border dark:border-[#2D2A35] hover:-translate-y-[3px] hover:shadow-md hover:border-primary hover:text-primary'}`} onClick={() => setSelectedTag(null)}>All Tags</button>
                    {getAllTags().map((tag, index) => (
                      <button key={index} className={`py-2.5 px-5 max-[768px]:py-2 max-[768px]:px-3.5 max-[768px]:text-xs max-[768px]:min-h-[36px] rounded-full text-sm font-semibold cursor-pointer transition-all shadow-xs ${selectedTag === tag ? 'bg-gradient-to-br from-primary to-primary-light text-white border-2 border-transparent shadow-lg' : 'bg-bg dark:bg-[#1E1B24] text-txt-secondary dark:text-[#94a3b8] border-2 border-border dark:border-[#2D2A35] hover:-translate-y-[3px] hover:shadow-md hover:border-primary hover:text-primary'}`} onClick={() => setSelectedTag(tag)}>{tag}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Books Grid */}
            <div className="min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                  <div className="w-10 h-10 border-[3px] border-border dark:border-[#2D2A35] border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-txt-secondary dark:text-[#94a3b8] text-base mt-2">Loading your library...</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                  <div className="text-[64px] mb-4 opacity-50">📚</div>
                  <h3 className="text-xl font-semibold text-txt-primary dark:text-[#E2D9F3] mb-2">No books found</h3>
                  <p className="text-txt-secondary dark:text-[#94a3b8] text-base mt-2">{activeFilter === 'All' ? 'Start building your reading library by adding your first book!' : `No books with status "${activeFilter}"`}</p>
                  {activeFilter === 'All' && <button className="mt-5 bg-gradient-to-br from-primary to-primary-light text-white border-none py-3 px-6 rounded-xl text-sm font-bold cursor-pointer transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg" onClick={() => setShowAddForm(true)}>Add Your First Book</button>}
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-[768px]:grid-cols-1 gap-5 max-[768px]:gap-4">
                  {filteredBooks.map(book => (
                    <BookCard key={book.id} book={book} onUpdate={handleUpdate} onDelete={handleDelete} onShowInsights={handleShowInsights} onViewNotes={handleViewNotes} onWriteReview={(b) => setReviewBook(b)} onTogglePrivacy={async (id, isPublic) => { try { await bookApi.togglePrivacy(id, isPublic); fetchBooks(); toast.success(isPublic ? '🌍 Book is now public' : '🔒 Book is now private'); } catch { toast.error('Failed to update privacy'); } }} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {selectedBook && <UpdateProgressModal book={selectedBook} onClose={() => setSelectedBook(null)} onUpdated={() => { fetchBooks(); fetchActivityDates(); setSelectedBook(null); }} />}
      {showShareModal && <ShareModal books={filteredBooks} onClose={() => setShowShareModal(false)} filterInfo={getFilterInfo()} />}
      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onImported={() => { fetchBooks(); setShowImportModal(false); }} />}
      {showAnalyticsModal && <AnalyticsModal stats={stats} dailyStats={dailyStats} activityDates={activityDates} activityDetails={activityDetails} onClose={() => setShowAnalyticsModal(false)} />}
      {showInsightsModal && <InsightsModal book={insightsBook} loading={insightsLoading} onClose={handleCloseInsights} />}
      {showNotesModal && <NotesModal book={notesBook} onClose={handleCloseNotes} onUpdated={fetchBooks} />}
      {reviewBook && <ReviewForm bookId={reviewBook.id} bookTitle={reviewBook.title} onClose={() => setReviewBook(null)} onSaved={() => { fetchBooks(); setReviewBook(null); }} />}
      {showRecommendationModal && <RecommendationModal userBooks={books} onClose={() => setShowRecommendationModal(false)} onAddToWishlist={handleAddFromRecommendation} />}
    </div>
  );
}

export default Dashboard;
