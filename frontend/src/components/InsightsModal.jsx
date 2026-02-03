import React, { useEffect } from 'react';
import './InsightsModal.css';

/**
 * InsightsModal Component
 * 
 * Displays AI-generated book insights in a responsive modal
 * - Summary: Brief overview of the book
 * - Key Takeaways: Main points and themes
 * - Reader Insights: What readers commonly like/dislike
 * 
 * Props:
 * - book: Book object with AI data
 * - loading: Boolean for loading state
 * - onClose: Function to close modal
 */
function InsightsModal({ book, loading = false, onClose }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.classList.add('insights-modal-open');
    return () => {
      document.body.classList.remove('insights-modal-open');
    };
  }, []);

  if (!book && !loading) return null;

  // Parse AI data from book object
  const summary = book?.aiSummary || null;
  const keyTakeaways = book?.aiHighlights 
    ? (typeof book.aiHighlights === 'string' 
        ? book.aiHighlights.split('\n').filter(item => item.trim()) 
        : book.aiHighlights)
    : [];
  const readerInsights = book?.aiOverallOpinion
    ? (typeof book.aiOverallOpinion === 'string'
        ? book.aiOverallOpinion.split('\n').filter(item => item.trim())
        : book.aiOverallOpinion)
    : [];

  // Check if we have any data to show
  const hasData = summary || keyTakeaways.length > 0 || readerInsights.length > 0;

  return (
    <div className="insights-modal-overlay" onClick={onClose}>
      <div className="insights-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="insights-modal-header">
          <div className="insights-header-text">
            <h2>✨ Book Insights</h2>
            {book && !loading && (
              <p className="insights-book-title">{book.title} by {book.author}</p>
            )}
          </div>
          <button 
            className="btn-close-insights" 
            onClick={onClose} 
            title="Close"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="insights-modal-body">
          
          {/* Loading State */}
          {loading && (
            <div className="insights-loading">
              <div className="insights-spinner"></div>
              <p className="insights-loading-text">Generating AI insights...</p>
              <p className="insights-loading-subtext">This may take a few seconds</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !hasData && (
            <div className="insights-empty">
              <div className="insights-empty-icon">📚</div>
              <p className="insights-empty-text">No insights available yet</p>
              <p className="insights-empty-subtext">
                AI insights are being generated. Please check back in a moment.
              </p>
            </div>
          )}

          {/* Content - Only show if we have data and not loading */}
          {!loading && hasData && (
            <>
              {/* Summary Section */}
              {summary && (
                <div className="insights-section">
                  <h3 className="insights-section-title">📖 Summary</h3>
                  <div className="insights-summary-box">
                    <p className="insights-summary-text">{summary}</p>
                  </div>
                </div>
              )}

              {/* Key Takeaways Section */}
              {keyTakeaways.length > 0 && (
                <div className="insights-section">
                  <h3 className="insights-section-title">💡 Key Takeaways</h3>
                  <div className="insights-pills-container">
                    {keyTakeaways.map((takeaway, index) => (
                      <div key={index} className="insights-pill takeaways-pill">
                        <span className="insights-pill-icon">◆</span>
                        <span className="insights-pill-text">{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reader Insights Section */}
              {readerInsights.length > 0 && (
                <div className="insights-section">
                  <h3 className="insights-section-title">💬 Reader Insights</h3>
                  <div className="insights-pills-container">
                    {readerInsights.map((insight, index) => (
                      <div key={index} className="insights-pill reader-pill">
                        <span className="insights-pill-icon">💬</span>
                        <span className="insights-pill-text">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Generated Footer */}
              {book?.aiGeneratedAt && (
                <div className="insights-footer">
                  <p className="insights-footer-text">
                    🤖 Generated by AI on {new Date(book.aiGeneratedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}

export default InsightsModal;
