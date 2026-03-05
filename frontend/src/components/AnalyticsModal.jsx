import React, { useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BarChart3, Calendar } from 'lucide-react';
import { useAuth } from '../AuthContext';

/* ── Tailwind class constants ── */
const overlayCls =
  'fixed inset-0 bg-black/60 backdrop-blur-[8px] flex items-center justify-center z-[9999] p-6 animate-[g-fadeIn_0.2s_ease_both] max-sm:p-0';

const contentCls =
  'bg-white rounded-2xl p-8 max-w-[900px] w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 animate-[g-slideUp_0.3s_ease_both] relative z-[10000] max-sm:w-[95%] max-sm:max-h-[85dvh] max-sm:p-6 max-sm:mx-auto max-sm:rounded-xl dark:bg-[#1E1B24] dark:border-[#2D2A35]';

const closeBtnCls =
  'bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-lg cursor-pointer transition-all duration-200 text-slate-600 hover:bg-red-500 hover:text-white hover:border-red-500 hover:scale-105 dark:bg-[#2D2A35] dark:border-[#3a3642] dark:text-[#9E95A8]';

const navBtnCls =
  'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white border-none px-4 py-2 rounded-xl text-[0.875rem] font-semibold cursor-pointer transition-all duration-200 min-w-[100px] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_4px_12px_rgba(59,130,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed max-sm:text-xs max-sm:px-3 max-sm:py-1.5 max-sm:min-w-[80px]';

const scorecardCellCls =
  'flex flex-col items-center justify-center text-center px-3 border-r border-slate-200 last:border-r-0 sm:px-5 dark:border-[#2D2A35]';

const metricsCellCls =
  'flex flex-col items-center justify-center text-center px-3 border-r border-slate-200 last:border-r-0 sm:px-5 dark:border-[#2D2A35]';

const calDayBase =
  'aspect-square rounded-[4px] bg-slate-50 border border-slate-200 cursor-pointer transition-all duration-200 relative flex items-center justify-center text-[0.7rem] text-slate-600 min-h-7 max-sm:min-h-6 max-sm:text-[0.65rem] dark:bg-[#0F0C15] dark:border-[#2D2A35] dark:text-[#9E95A8]';

/* Intensity inline styles for calendar days */
const INTENSITY_STYLES = {
  1: { background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderColor: '#6ee7b7' },
  2: { background: 'linear-gradient(135deg, #6ee7b7, #34d399)', borderColor: '#10b981' },
  3: { background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: '#047857' },
  4: { background: 'linear-gradient(135deg, #047857, #065f46)', borderColor: '#064e3b' },
  5: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderColor: '#b45309', boxShadow: '0 0 12px rgba(245,158,11,0.5)' },
};

/* Intensity hover shadow classes for calendar days */
const INTENSITY_HOVER = {
  1: 'hover:shadow-[0_4px_12px_rgba(16,185,129,0.6)]',
  2: 'hover:shadow-[0_4px_12px_rgba(16,185,129,0.6)]',
  3: 'hover:shadow-[0_4px_12px_rgba(16,185,129,0.6)]',
  4: 'hover:shadow-[0_4px_12px_rgba(6,95,70,0.7)]',
  5: 'hover:shadow-[0_4px_16px_rgba(245,158,11,0.8)]',
};

function AnalyticsModal({ stats, dailyStats = [], activityDates = [], activityDetails = [], onClose }) {
  const { user } = useAuth();
  
  // Add safety check and default values
  if (!stats) {
    return null;
  }

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

  // Calculate pages read for different periods from stats with safety checks
  const pagesThisWeek = stats?.pagesThisWeek || 0;
  const pagesThisMonth = stats?.pagesThisMonth || 0;
  const pagesThisYear = stats?.pagesThisYear || 0;

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

  const maxPages = Math.max(...last7Days.map(d => d?.pages || 0), 1);
  const hasData = last7Days.some(d => d?.pages > 0);

  const modalContent = (
    <div className={overlayCls} onClick={onClose}>
      <div className={contentCls} style={{ scrollbarWidth: 'none' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200 dark:border-[#2D2A35]">
          <h2 className="text-2xl font-bold text-slate-900 m-0 max-md:text-xl dark:text-[#E2D9F3]"><BarChart3 className="w-6 h-6 inline mr-2" />Reading Analytics</h2>
          <button className={closeBtnCls} onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Chart Section - Only show if there's data */}
        {hasData && (
          <div className="mb-6 bg-slate-50 p-6 rounded-xl border border-slate-200 max-md:p-4 dark:bg-[#0F0C15] dark:border-[#2D2A35]">
            <h3 className="text-sm font-semibold text-slate-600 m-0 mb-6 uppercase tracking-[0.5px] dark:text-[#9E95A8]">Pages Read - Last 7 Days</h3>
            <div className="flex items-end justify-between gap-4 h-[200px] py-6 max-md:h-[140px] max-md:gap-1">
              {last7Days.map((data, index) => {
                const pages = data?.pages || 0;
                const barHeight = `${(pages / maxPages) * 100}%`;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end relative">
                    {pages > 0 && (
                      <span className="text-sm font-bold text-slate-900 absolute top-0 -translate-y-6 whitespace-nowrap dark:text-[#E2D9F3]">{pages}</span>
                    )}
                    <div
                      className="w-full max-w-[60px] bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-lg relative transition-all duration-200 min-h-[3px] animate-[am-barGrow_0.6s_ease-out_forwards] h-0 origin-bottom hover:from-teal-600 hover:to-teal-500 hover:brightness-110"
                      style={{
                        '--final-height': barHeight,
                        animationDelay: `${index * 0.1}s`
                      }}
                    />
                    <span className="text-xs text-slate-600 font-medium mt-2 dark:text-[#9E95A8]">{data?.day || ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scorecard Row - Time Periods (Split Grid) */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 grid grid-cols-3 py-4 mb-6 sm:py-5 dark:bg-[#1E1B24] dark:border-[#2D2A35]">
          <div className={scorecardCellCls}>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.05em] mb-1 sm:text-xs sm:mb-2 dark:text-[#7a7181]">This Week</div>
            <div className="text-2xl font-black bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 bg-clip-text text-transparent leading-none my-1 sm:text-3xl sm:my-1.5 dark:from-[#7C4DFF] dark:to-[#9575FF]">{stats?.booksThisWeek || 0}</div>
            <div className="text-[10px] text-slate-500 font-medium mb-0.5 sm:text-xs sm:mb-1 dark:text-[#7a7181]">{(stats?.booksThisWeek || 0) === 1 ? 'book' : 'books'}</div>
            <div className="text-xs text-slate-600 font-medium mt-1 sm:text-sm sm:mt-2 dark:text-[#9E95A8]">{pagesThisWeek} pages</div>
          </div>

          <div className={scorecardCellCls}>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.05em] mb-1 sm:text-xs sm:mb-2 dark:text-[#7a7181]">This Month</div>
            <div className="text-2xl font-black bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 bg-clip-text text-transparent leading-none my-1 sm:text-3xl sm:my-1.5 dark:from-[#7C4DFF] dark:to-[#9575FF]">{stats?.booksThisMonth || 0}</div>
            <div className="text-[10px] text-slate-500 font-medium mb-0.5 sm:text-xs sm:mb-1 dark:text-[#7a7181]">{(stats?.booksThisMonth || 0) === 1 ? 'book' : 'books'}</div>
            <div className="text-xs text-slate-600 font-medium mt-1 sm:text-sm sm:mt-2 dark:text-[#9E95A8]">{pagesThisMonth} pages</div>
          </div>

          <div className={scorecardCellCls}>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.05em] mb-1 sm:text-xs sm:mb-2 dark:text-[#7a7181]">This Year</div>
            <div className="text-2xl font-black bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 bg-clip-text text-transparent leading-none my-1 sm:text-3xl sm:my-1.5 dark:from-[#7C4DFF] dark:to-[#9575FF]">{stats?.booksThisYear || 0}</div>
            <div className="text-[10px] text-slate-500 font-medium mb-0.5 sm:text-xs sm:mb-1 dark:text-[#7a7181]">{(stats?.booksThisYear || 0) === 1 ? 'book' : 'books'}</div>
            <div className="text-xs text-slate-600 font-medium mt-1 sm:text-sm sm:mt-2 dark:text-[#9E95A8]">{pagesThisYear} pages</div>
          </div>
        </div>

        {/* Streak Banner */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-400 rounded-2xl p-6 mb-6 relative overflow-hidden shadow-[0_4px_16px_rgba(251,146,60,0.2)] w-full box-border max-sm:p-4 dark:from-orange-400/10 dark:to-orange-500/15 dark:border-orange-400">
          <div className="flex items-center gap-6 relative z-[1] max-sm:gap-4">
            <div className="text-5xl animate-[am-flameFlicker_2s_ease-in-out_infinite] shrink-0 max-sm:text-[32px] max-md:text-4xl">🔥</div>
            <div className="flex-1">
              <div className="text-sm text-orange-900 font-semibold uppercase tracking-[0.5px] mb-1 dark:text-orange-400">Longest Reading Streak</div>
              <div className="text-3xl font-black bg-gradient-to-br from-orange-500 to-orange-400 bg-clip-text text-transparent leading-tight mb-1 max-sm:text-2xl">{stats?.longestStreak || 0} Days</div>
              <div className="text-sm text-orange-900 font-medium dark:text-orange-300">
                {(stats?.longestStreak || 0) === 0 ? 'Start reading to build your streak!' : 
                 (stats?.longestStreak || 0) < 7 ? 'Keep it up! You\'re building momentum!' :
                 (stats?.longestStreak || 0) < 30 ? 'Amazing consistency! 🎉' :
                 'Legendary dedication! 🏆'}
              </div>
            </div>
          </div>
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 opacity-15 text-[120px] pointer-events-none max-md:text-[80px] max-md:-right-2.5">
            <span>🔥</span>
          </div>
        </div>

        {/* Streak Calendar */}
        <div className="mt-6 p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl border border-slate-200 max-sm:p-4 dark:border-[#2D2A35]">
          <h3 className="text-lg font-bold text-slate-900 m-0 mb-4 flex flex-col gap-1 max-sm:text-base dark:text-[#E2D9F3]">
            <span><Calendar className="w-5 h-5 inline mr-2" />Reading Activity Calendar</span>
            <span className="text-sm font-normal text-slate-600 dark:text-[#9E95A8]">
              {user?.createdAt 
                ? `Since ${new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                : 'Last 365 days'
              }
            </span>
          </h3>
          <div className="flex gap-6 mb-6 text-sm text-slate-600 flex-wrap justify-center max-sm:gap-2 max-sm:text-[0.7rem] max-sm:justify-start dark:text-[#9E95A8]">
            <div className="flex items-center gap-1 whitespace-nowrap text-[0.875rem] max-sm:text-[0.7rem]">
              <div className="w-3.5 h-3.5 rounded-[3px] border border-slate-200 bg-slate-50 dark:border-[#2D2A35] dark:bg-[#0F0C15]"></div>
              <span>No activity</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-[0.875rem] max-sm:text-[0.7rem]">
              <div className="w-3.5 h-3.5 rounded-[3px] border border-slate-200 dark:border-[#2D2A35]" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderColor: '#6ee7b7' }}></div>
              <span>1-2 pages</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-[0.875rem] max-sm:text-[0.7rem]">
              <div className="w-3.5 h-3.5 rounded-[3px] border border-slate-200 dark:border-[#2D2A35]" style={{ background: 'linear-gradient(135deg, #6ee7b7, #34d399)', borderColor: '#10b981' }}></div>
              <span>3-4 pages</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-[0.875rem] max-sm:text-[0.7rem]">
              <div className="w-3.5 h-3.5 rounded-[3px] border border-slate-200 dark:border-[#2D2A35]" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: '#047857' }}></div>
              <span>5-9 pages</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-[0.875rem] max-sm:text-[0.7rem]">
              <div className="w-3.5 h-3.5 rounded-[3px] border border-slate-200 dark:border-[#2D2A35]" style={{ background: 'linear-gradient(135deg, #047857, #065f46)', borderColor: '#064e3b' }}></div>
              <span>10-14 pages</span>
            </div>
            <div className="flex items-center gap-1 whitespace-nowrap text-[0.875rem] max-sm:text-[0.7rem]">
              <div className="w-3.5 h-3.5 rounded-[3px] border border-slate-200 dark:border-[#2D2A35]" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderColor: '#b45309', boxShadow: '0 0 12px rgba(245,158,11,0.5)' }}></div>
              <span>15+ pages</span>
            </div>
          </div>
          {streakCalendar.length > 0 ? (
            <div className="flex flex-col gap-4 mt-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between gap-4 py-2 max-sm:gap-1">
                <button 
                  className={navBtnCls}
                  onClick={() => setCurrentMonthIndex(prev => Math.min(prev + 1, streakCalendar.length - 1))}
                  disabled={currentMonthIndex >= streakCalendar.length - 1}
                  title="Previous month"
                >
                  ← Previous
                </button>
                <div className="text-lg font-bold text-slate-900 text-center flex-1 tracking-[0.5px] max-sm:text-[0.9rem] dark:text-[#E2D9F3]">
                  {streakCalendar[streakCalendar.length - 1 - currentMonthIndex]?.monthName}
                </div>
                <button 
                  className={navBtnCls}
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
                  <div className="bg-white rounded-xl p-6 border border-slate-200 max-w-[500px] mx-auto w-full max-sm:p-3 dark:bg-[#1E1B24] dark:border-[#2D2A35]">
                    <div className="grid grid-cols-7 gap-0.5 mb-1 text-center">
                      {['S','M','T','W','T','F','S'].map((d, i) => (
                        <span key={i} className="text-xs text-slate-600 font-medium p-0.5 max-sm:text-[0.7rem] dark:text-[#9E95A8]">{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-[3px]">
                      {monthData.days.map((day, dayIndex) => {
                        if (!day || day.isEmpty) {
                          return <div key={dayIndex} className={`${calDayBase} !bg-transparent !border-none !cursor-default`} />;
                        }
                        const isToday = day.date && day.date.toDateString() === new Date().toDateString();
                        const isDisabled = day.isFuture || day.isBeforeAccount;
                        const intensityStyle = day.hasActivity ? INTENSITY_STYLES[day.intensity] : undefined;
                        const hoverCls = day.hasActivity && !isDisabled
                          ? INTENSITY_HOVER[day.intensity] || ''
                          : '';

                        return (
                          <div
                            key={dayIndex}
                            className={[
                              calDayBase,
                              isDisabled ? 'bg-slate-200 border-slate-300 cursor-default opacity-30 dark:bg-[#0F0C15] dark:border-[#2D2A35]' : '',
                              isToday ? 'border-2 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : '',
                              !isDisabled ? 'hover:scale-[1.15] hover:z-10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : '',
                              hoverCls,
                            ].filter(Boolean).join(' ')}
                            style={intensityStyle}
                            title={`${day.date ? day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}${
                              day.pagesRead > 0 ? ` - ${day.pagesRead} page${day.pagesRead !== 1 ? 's' : ''} read` : 
                              day.isFuture || day.isBeforeAccount ? '' : ' - No activity'
                            }`}
                          >
                            <span className="text-[0.7rem] select-none max-sm:text-[0.65rem]">{day.date ? day.date.getDate() : ''}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-center text-slate-600 p-4 dark:text-[#9E95A8]">
              No calendar data available
            </p>
          )}
        </div>

        {/* Additional Metrics Row */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 grid grid-cols-3 py-4 mb-6 sm:py-5 dark:bg-[#1E1B24] dark:border-[#2D2A35]">
          <div className={metricsCellCls}>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.05em] mb-1.5 sm:text-xs sm:mb-2 dark:text-[#7a7181]">Avg Pages/Book</div>
            <div className="text-2xl font-black bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 bg-clip-text text-transparent leading-none sm:text-3xl dark:from-[#7C4DFF] dark:to-[#9575FF]">{stats?.avgPages || 0}</div>
          </div>

          <div className={metricsCellCls}>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.05em] mb-1.5 sm:text-xs sm:mb-2 dark:text-[#7a7181]">Pages/Day</div>
            <div className="text-2xl font-black bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 bg-clip-text text-transparent leading-none sm:text-3xl dark:from-[#7C4DFF] dark:to-[#9575FF]">{stats?.readingPace || 0}</div>
          </div>

          <div className={metricsCellCls}>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-[0.05em] mb-1.5 sm:text-xs sm:mb-2 dark:text-[#7a7181]">Current Streak</div>
            <div className="text-2xl font-black bg-gradient-to-br from-violet-700 via-violet-600 to-blue-600 bg-clip-text text-transparent leading-none sm:text-3xl dark:from-[#7C4DFF] dark:to-[#9575FF]">{stats?.currentStreak || 0}</div>
          </div>
        </div>

        {/* Spacer to prevent content cutoff by mobile browser toolbar */}
        <div className="w-full h-0 shrink-0 pointer-events-none max-sm:h-[120px]" aria-hidden="true" />
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
