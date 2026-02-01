import React from 'react';
import './AnalyticsModal.css';

function AnalyticsModal({ stats, onClose }) {
  if (!stats) return null;

  return (
    <div className="analytics-modal-overlay" onClick={onClose}>
      <div className="analytics-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="analytics-modal-header">
          <h2>📊 Reading Analytics</h2>
          <button className="btn-close-analytics" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <div className="analytics-modal-grid">
          <div className="analytics-card">
            <div className="analytics-header">
              <span className="analytics-icon">📅</span>
              <span className="analytics-title">This Week</span>
            </div>
            <div className="analytics-value">{stats.booksThisWeek}</div>
            <div className="analytics-label">books completed</div>
          </div>

          <div className="analytics-card">
            <div className="analytics-header">
              <span className="analytics-icon">📆</span>
              <span className="analytics-title">This Month</span>
            </div>
            <div className="analytics-value">{stats.booksThisMonth}</div>
            <div className="analytics-label">books completed</div>
          </div>

          <div className="analytics-card">
            <div className="analytics-header">
              <span className="analytics-icon">📊</span>
              <span className="analytics-title">This Year</span>
            </div>
            <div className="analytics-value">{stats.booksThisYear}</div>
            <div className="analytics-label">books completed</div>
          </div>

          <div className="analytics-card">
            <div className="analytics-header">
              <span className="analytics-icon">🏆</span>
              <span className="analytics-title">Longest Streak</span>
            </div>
            <div className="analytics-value">{stats.longestStreak}</div>
            <div className="analytics-label">days in a row</div>
          </div>

          <div className="analytics-card">
            <div className="analytics-header">
              <span className="analytics-icon">📚</span>
              <span className="analytics-title">Avg Pages/Book</span>
            </div>
            <div className="analytics-value">{stats.avgPages}</div>
            <div className="analytics-label">pages per book</div>
          </div>

          <div className="analytics-card">
            <div className="analytics-header">
              <span className="analytics-icon">⚡</span>
              <span className="analytics-title">Reading Pace</span>
            </div>
            <div className="analytics-value">{stats.readingPace}</div>
            <div className="analytics-label">pages per day</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsModal;
