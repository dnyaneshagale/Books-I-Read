import React, { useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './AnalyticsModal.css';

function AnalyticsModal({ stats, dailyStats = [], onClose }) {
  if (!stats) return null;

  // Prevent background scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);

  // Calculate pages read for different periods from stats
  const pagesThisWeek = stats.pagesThisWeek || 0;
  const pagesThisMonth = stats.pagesThisMonth || 0;
  const pagesThisYear = stats.pagesThisYear || 0;

  // Process daily stats from backend
  const last7Days = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (dailyStats && dailyStats.length === 7) {
      // Use actual data from backend
      return dailyStats.map(stat => {
        const date = new Date(stat.date);
        const dayName = dayNames[date.getDay()];
        return {
          day: dayName,
          pages: stat.pages || 0
        };
      });
    } else {
      // Fallback: Generate empty data structure for last 7 days
      const result = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = dayNames[date.getDay()];
        
        result.push({
          day: dayName,
          pages: 0
        });
      }
      
      return result;
    }
  }, [dailyStats]);

  const maxPages = Math.max(...last7Days.map(d => d.pages), 1);
  const hasData = last7Days.some(d => d.pages > 0);

  const modalContent = (
    <div className="analytics-modal-overlay" onClick={onClose}>
      <div className="analytics-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-modal-header">
          <h2>📊 Reading Analytics</h2>
          <button className="btn-close-analytics" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Chart Section - Only show if there's data */}
        {hasData && (
          <div className="chart-section">
            <h3 className="chart-title">Pages Read - Last 7 Days</h3>
            <div className="bar-chart">
              {last7Days.map((data, index) => {
                const barHeight = `${(data.pages / maxPages) * 100}%`;
                return (
                  <div key={index} className="bar-container">
                    {data.pages > 0 && (
                      <span className="bar-value-top">{data.pages}</span>
                    )}
                    <div 
                      className="bar"
                      style={{ 
                        '--final-height': barHeight,
                        animationDelay: `${index * 0.1}s`
                      }}
                    />
                    <span className="bar-label">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scorecard Row - Time Periods (Split Grid) */}
        <div className="scorecard-grid-container">
          <div className="scorecard-grid-cell">
            <div className="scorecard-grid-label">This Week</div>
            <div className="scorecard-grid-value">{stats.booksThisWeek}</div>
            <div className="scorecard-grid-sublabel">{stats.booksThisWeek === 1 ? 'book' : 'books'}</div>
            <div className="scorecard-grid-secondary">{pagesThisWeek} pages</div>
          </div>

          <div className="scorecard-grid-cell">
            <div className="scorecard-grid-label">This Month</div>
            <div className="scorecard-grid-value">{stats.booksThisMonth}</div>
            <div className="scorecard-grid-sublabel">{stats.booksThisMonth === 1 ? 'book' : 'books'}</div>
            <div className="scorecard-grid-secondary">{pagesThisMonth} pages</div>
          </div>

          <div className="scorecard-grid-cell">
            <div className="scorecard-grid-label">This Year</div>
            <div className="scorecard-grid-value">{stats.booksThisYear}</div>
            <div className="scorecard-grid-sublabel">{stats.booksThisYear === 1 ? 'book' : 'books'}</div>
            <div className="scorecard-grid-secondary">{pagesThisYear} pages</div>
          </div>
        </div>

        {/* Streak Banner */}
        <div className="streak-banner">
          <div className="streak-content">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
              <div className="streak-label">Longest Reading Streak</div>
              <div className="streak-value">{stats.longestStreak} Days</div>
              <div className="streak-message">
                {stats.longestStreak === 0 ? 'Start reading to build your streak!' : 
                 stats.longestStreak < 7 ? 'Keep it up! You\'re building momentum!' :
                 stats.longestStreak < 30 ? 'Amazing consistency! 🎉' :
                 'Legendary dedication! 🏆'}
              </div>
            </div>
          </div>
          <div className="streak-flame-bg">
            <span className="flame-large">🔥</span>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="metrics-grid-container">
          <div className="metrics-grid-cell">
            <div className="metrics-grid-label">Avg Pages/Book</div>
            <div className="metrics-grid-value">{stats.avgPages}</div>
          </div>

          <div className="metrics-grid-cell">
            <div className="metrics-grid-label">Pages/Day</div>
            <div className="metrics-grid-value">{stats.readingPace}</div>
          </div>

          <div className="metrics-grid-cell">
            <div className="metrics-grid-label">Current Streak</div>
            <div className="metrics-grid-value">{stats.currentStreak}</div>
          </div>
        </div>

        {/* Spacer to prevent content cutoff by mobile browser toolbar */}
        <div className="scroll-spacer" aria-hidden="true" />
      </div>
    </div>
  );

  // Render modal in portal to prevent z-index stacking issues
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}

export default AnalyticsModal;
