import React, { useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../AuthContext';
import './AnalyticsModal.css';

function AnalyticsModal({ stats, dailyStats = [], activityDates = [], activityDetails = [], onClose }) {
  const { user } = useAuth();
  if (!stats) return null;

  // Track current month being displayed (0 = most recent month)
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

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

  // Generate streak calendar data (month-wise)
  const streakCalendar = useMemo(() => {
    try {
      // Use account creation date or fallback to first activity date
      let accountCreationDate;
      if (user?.createdAt) {
        accountCreationDate = new Date(user.createdAt);
      } else if (activityDates && activityDates.length > 0) {
        // Use the earliest activity date
        const earliestDate = new Date(Math.min(...activityDates.map(d => d.getTime())));
        accountCreationDate = earliestDate;
      } else {
        // Fallback to today if no data
        accountCreationDate = new Date();
      }
      
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today for comparison
      
      // Helper function to convert date to local YYYY-MM-DD string
      const toLocalDateString = (date) => {
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // Create a map of date strings to page counts
      const activityMap = new Map();
      if (activityDetails && Array.isArray(activityDetails)) {
        activityDetails.forEach(activity => {
          if (activity && activity.date) {
            // Normalize the date from backend to YYYY-MM-DD format
            const normalizedDate = activity.date.includes('T') 
              ? activity.date.split('T')[0] 
              : activity.date;
            activityMap.set(normalizedDate, activity.pages || 0);
          }
        });
      }
      
      const monthsData = [];

      // Start from the first day of the account creation month
      const startDate = new Date(accountCreationDate.getFullYear(), accountCreationDate.getMonth(), 1);
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Iterate through each month
      for (let monthDate = new Date(startDate); monthDate <= currentMonth; monthDate.setMonth(monthDate.getMonth() + 1)) {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        // Get first and last day of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Get the day of week for the first day (0 = Sunday)
        const startDayOfWeek = firstDay.getDay();
        
        const days = [];
        
        // Add empty cells for days before the month starts
        for (let i = 0; i < startDayOfWeek; i++) {
          days.push({ isEmpty: true });
        }
        
        // Add all days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
          const date = new Date(year, month, day);
          const dateStr = toLocalDateString(date);
          const isFuture = date > today;
          const isBeforeAccount = date < accountCreationDate;
          const pagesRead = activityMap.get(dateStr) || 0;
          
          // Determine intensity level based on pages read
          let intensity = 0;
          if (pagesRead >= 15) intensity = 5; // Golden
          else if (pagesRead >= 10) intensity = 4; // Dark Green
          else if (pagesRead >= 5) intensity = 3; // Dark Light Green
          else if (pagesRead >= 3) intensity = 2; // Light Green
          else if (pagesRead >= 1) intensity = 1; // Whitish Light Green
          
          days.push({
            date,
            dateStr,
            hasActivity: pagesRead > 0,
            pagesRead,
            intensity,
            isFuture,
            isBeforeAccount,
            isEmpty: false
          });
        }
        
        monthsData.push({
          monthName,
          year,
          month,
          days
        });
      }

      return monthsData;
    } catch (error) {
      console.error('Error generating calendar:', error);
      return [];
    }
  }, [activityDates, activityDetails, user]);

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

        {/* Streak Calendar */}
        <div className="streak-calendar-section">
          <h3 className="calendar-title">
            📅 Reading Activity Calendar
            <span className="calendar-subtitle">
              {user?.createdAt 
                ? `Since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : 'Last 365 days'
              }
            </span>
          </h3>
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-box legend-inactive"></div>
              <span>No activity</span>
            </div>
            <div className="legend-item">
              <div className="legend-box intensity-1"></div>
              <span>1-2 pages</span>
            </div>
            <div className="legend-item">
              <div className="legend-box intensity-2"></div>
              <span>3-4 pages</span>
            </div>
            <div className="legend-item">
              <div className="legend-box intensity-3"></div>
              <span>5-9 pages</span>
            </div>
            <div className="legend-item">
              <div className="legend-box intensity-4"></div>
              <span>10-14 pages</span>
            </div>
            <div className="legend-item">
              <div className="legend-box intensity-5"></div>
              <span>15+ pages</span>
            </div>
          </div>
          {streakCalendar.length > 0 ? (
            <div className="streak-calendar-container">
              {/* Month Navigation */}
              <div className="calendar-navigation">
                <button 
                  className="nav-btn"
                  onClick={() => setCurrentMonthIndex(prev => Math.min(prev + 1, streakCalendar.length - 1))}
                  disabled={currentMonthIndex >= streakCalendar.length - 1}
                  title="Previous month"
                >
                  ← Previous
                </button>
                <div className="current-month-display">
                  {streakCalendar[streakCalendar.length - 1 - currentMonthIndex]?.monthName}
                </div>
                <button 
                  className="nav-btn"
                  onClick={() => setCurrentMonthIndex(prev => Math.max(prev - 1, 0))}
                  disabled={currentMonthIndex === 0}
                  title="Next month"
                >
                  Next →
                </button>
              </div>

              {/* Single Month Display */}
              {(() => {
                const monthData = streakCalendar[streakCalendar.length - 1 - currentMonthIndex];
                if (!monthData || !monthData.days) return null;
                
                return (
                  <div className="calendar-month">
                    <div className="month-weekdays">
                      <span>S</span>
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                    </div>
                    <div className="month-grid">
                      {monthData.days.map((day, dayIndex) => {
                        if (!day || day.isEmpty) {
                          return <div key={dayIndex} className="calendar-day empty" />;
                        }
                        const isToday = day.date && day.date.toDateString() === new Date().toDateString();
                        return (
                          <div
                            key={dayIndex}
                            className={`calendar-day ${
                              day.isFuture || day.isBeforeAccount ? 'disabled' : ''
                            } ${day.hasActivity ? `intensity-${day.intensity}` : ''} ${isToday ? 'today' : ''}`}
                            title={`${day.date ? day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}${
                              day.pagesRead > 0 ? ` - ${day.pagesRead} page${day.pagesRead !== 1 ? 's' : ''} read` : 
                              day.isFuture || day.isBeforeAccount ? '' : ' - No activity'
                            }`}
                          >
                            <span className="day-number">{day.date ? day.date.getDate() : ''}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: 'var(--spacing-md)' }}>
              No calendar data available
            </p>
          )}
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
