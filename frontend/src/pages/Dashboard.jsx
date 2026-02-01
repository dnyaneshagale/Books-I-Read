import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import BookCard from '../components/BookCard';
import AddBookForm from '../components/AddBookForm';
import UpdateProgressModal from '../components/UpdateProgressModal';
import ShareModal from '../components/ShareModal';
import ImportModal from '../components/ImportModal';
import AnalyticsModal from '../components/AnalyticsModal';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import { READING_QUOTES } from '../data/quotes';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
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
  const [activityDates, setActivityDates] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [randomQuote, setRandomQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

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
    } catch (error) {
      console.error('Error fetching books:', error);
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
    } catch (error) {
      console.error('Error fetching activity dates:', error);
      // Don't show error to user - fall back to old streak logic
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

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await bookApi.deleteBook(bookId);
      toast.success('🗑️ Book deleted successfully');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
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

    return { 
      completed, 
      reading, 
      totalPagesRead,
      booksThisWeek,
      booksThisMonth,
      booksThisYear,
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
    const sortedDates = activityDatesFromBackend
      .map(date => getISTStartOfDay(new Date(date)))
      .sort((a, b) => b - a);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    
    // Normalize today to start of day for comparison
    const todayStartOfDay = getISTStartOfDay(todayIST);
    const yesterdayIST = new Date(todayStartOfDay.getTime() - 24 * 60 * 60 * 1000);
    const mostRecentActivity = sortedDates[0];
    
    // Check if user has activity today or yesterday (current streak)
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
          break;
        }
      }
    }
    
    // Calculate longest streak from all dates
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
    
    // Get all books with reading activity (reading or finished)
    const activeBooks = books.filter(b => 
      (b.status === 'READING' || b.status === 'FINISHED') && b.startDate
    );
    
    if (activeBooks.length === 0) return null;
    
    // Find the earliest start date
    const startDates = activeBooks.map(b => new Date(b.startDate));
    const earliestStart = new Date(Math.min(...startDates));
    
    // Calculate days from earliest start to today
    const today = new Date();
    const totalDays = Math.max(1, Math.floor((today - earliestStart) / (1000 * 60 * 60 * 24)));
    
    // Calculate total pages read across all books
    const totalPagesRead = books.reduce((sum, b) => sum + b.pagesRead, 0);
    
    // Pages per day
    return Math.round(totalPagesRead / totalDays);
  };

  const stats = calculateStats();

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <span className="brand-icon">📚</span>
            <h1>Books I Read</h1>
          </div>
          <div className="nav-actions">
            <span className="user-greeting">Hi, {user?.username}!</span>
            <button
              className="btn-analytics"
              onClick={() => setShowAnalyticsModal(true)}
              title="View Analytics"
            >
              📊 Analytics
            </button>
            <button
              className="btn-theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              className="btn-import"
              onClick={() => setShowImportModal(true)}
              title="Import from Goodreads"
            >
              📥 Import
            </button>
            <button
              className="btn-share"
              onClick={() => setShowShareModal(true)}
              title="Share reading list"
            >
              📤 Share
            </button>
            <button
              className="btn-add-book"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '← Back to Library' : '+ Add Book'}
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="main-content">
        {showAddForm ? (
          <div className="add-book-section">
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
            {/* Random Quote Section */}
            {randomQuote && (
              <div className="quote-section">
                <div className="quote-card">
                  <div className="quote-icon">💡</div>
                  <div className="quote-content">
                    {quoteLoading ? (
                      <p className="quote-text quote-loading">Loading new wisdom...</p>
                    ) : (
                      <>
                        <p className="quote-text">"{randomQuote.text}"</p>
                        <p className="quote-author">— {randomQuote.author}</p>
                      </>
                    )}
                  </div>
                  <button 
                    className="btn-refresh-quote" 
                    onClick={getNewQuote}
                    disabled={quoteLoading}
                    title="Get new quote"
                  >
                    🔄
                  </button>
                </div>
              </div>
            )}

            {/* Statistics Cards */}
            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.completed}</div>
                  <div className="stat-label">Books Completed</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📖</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.reading}</div>
                  <div className="stat-label">Currently Reading</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalPagesRead.toLocaleString()}</div>
                  <div className="stat-label">Total Pages Read</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🔥</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.currentStreak}</div>
                  <div className="stat-label">Current Streak</div>
                  <div className="stat-subtitle">days in a row</div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="filter-tabs">
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
                  
                  return (
                    <button
                      key={filter}
                      className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                      <span className="filter-count">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tag Filter */}
              {getAllTags().length > 0 && (
                <div className="tag-filter-section">
                  <div className="tag-filter-label">Filter by Tag:</div>
                  <div className="tag-filter-chips">
                    <button
                      className={`tag-filter-chip ${selectedTag === null ? 'active' : ''}`}
                      onClick={() => setSelectedTag(null)}
                    >
                      All Tags
                    </button>
                    {getAllTags().map((tag, index) => (
                      <button
                        key={index}
                        className={`tag-filter-chip ${selectedTag === tag ? 'active' : ''}`}
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Books Grid */}
            <div className="books-section">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your library...</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <h3>No books found</h3>
                  <p>
                    {activeFilter === 'All'
                      ? 'Start building your reading library by adding your first book!'
                      : `No books with status "${activeFilter}"`}
                  </p>
                  {activeFilter === 'All' && (
                    <button
                      className="btn-primary"
                      onClick={() => setShowAddForm(true)}
                    >
                      Add Your First Book
                    </button>
                  )}
                </div>
              ) : (
                <div className="books-grid">
                  {filteredBooks.map(book => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
