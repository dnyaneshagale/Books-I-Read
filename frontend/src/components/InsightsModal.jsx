import React from 'react';
import ReactDOM from 'react-dom';
import { Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

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
  useBodyScrollLock();

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

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[9999] p-[var(--spacing-lg)] animate-[g-fadeIn_0.2s_ease] max-sm:p-0" onClick={onClose}>
      <div className="bg-[var(--color-bg)] rounded-[var(--radius-xl)] w-full max-w-[600px] max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-[var(--color-border)] animate-[g-fadeInScale_0.3s_ease] overflow-hidden relative z-[10000] dark:bg-[var(--color-bg-dark,#1a1a1a)] dark:border-[var(--color-border-dark,#333)] max-sm:w-[95%] max-sm:max-h-[85vh] max-sm:m-auto max-sm:rounded-[var(--radius-lg)]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-5 border-b-2 border-[var(--color-border)] bg-[var(--color-bg)] shrink-0 max-sm:p-4 dark:bg-[var(--color-bg-dark,#1a1a1a)] dark:border-[var(--color-border-dark,#333)]">
          <div className="flex-1 mr-[var(--spacing-md)]">
            <h2 className="text-[var(--font-size-2xl)] font-[var(--font-weight-bold)] text-[var(--color-text-primary)] m-0 mb-1"><Sparkles className="w-6 h-6 inline mr-2" />Book Insights</h2>
            {book && !loading && (
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] m-0 font-[var(--font-weight-medium)]">{book.title} by {book.author}</p>
            )}
          </div>
          <button 
            className="bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] py-2 px-3.5 rounded-[var(--radius-md)] text-[18px] cursor-pointer transition-all text-[var(--color-text-secondary)] shrink-0 hover:enabled:bg-[var(--color-danger)] hover:enabled:text-white hover:enabled:border-[var(--color-danger)] hover:enabled:scale-105 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[var(--color-bg-tertiary-dark,#2a2a2a)] dark:border-[var(--color-border-dark,#333)] dark:text-[var(--color-text-secondary-dark,#94a3b8)]" 
            onClick={onClose} 
            title="Close"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 max-sm:p-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-border) transparent' }}>
          
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
              <div className="w-12 h-12 border-4 border-[var(--color-bg-tertiary)] border-t-[var(--color-primary)] rounded-full animate-[g-spin_0.8s_linear_infinite] mb-[var(--spacing-lg)] dark:border-[var(--color-bg-tertiary-dark,#333)] dark:border-t-[var(--color-primary)]"></div>
              <p className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] m-0 mb-2">Generating AI insights...</p>
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] m-0">This may take a few seconds</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !hasData && (
            <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
              <Sparkles className="w-16 h-16 mb-[var(--spacing-lg)] opacity-50 text-[var(--color-text-secondary)]" />
              <p className="text-[var(--font-size-lg)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] m-0 mb-2">No insights available yet</p>
              <p className="text-[var(--font-size-sm)] text-[var(--color-text-secondary)] m-0 max-w-[300px]">
                AI insights are being generated. Please check back in a moment.
              </p>
            </div>
          )}

          {/* Content */}
          {!loading && hasData && (
            <>
              {/* Summary Section */}
              {summary && (
                <div className="mb-[var(--spacing-2xl)]">
                  <h3 className="text-[var(--font-size-md)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] m-0 mb-[var(--spacing-md)]"><BookOpen className="w-5 h-5 inline mr-2" />Summary</h3>
                  <div className="bg-[#F3E8FF] border-l-4 border-l-[#6200EA] py-4 px-5 rounded-[var(--radius-md)] max-sm:py-3 max-sm:px-4 dark:bg-[rgba(98,0,234,0.15)] dark:border-l-[#7c3aed]">
                    <p className="text-[15px] leading-[1.6] text-[#1a1a1a] m-0 dark:text-[var(--color-text-primary-dark,#e2e8f0)]">{summary}</p>
                  </div>
                </div>
              )}

              {/* Key Takeaways Section */}
              {keyTakeaways.length > 0 && (
                <div className="mb-[var(--spacing-2xl)]">
                  <h3 className="text-[var(--font-size-md)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] m-0 mb-[var(--spacing-md)]"><Lightbulb className="w-5 h-5 inline mr-2" />Key Takeaways</h3>
                  <div className="flex flex-col gap-3">
                    {keyTakeaways.map((takeaway, index) => (
                      <div key={index} className="flex items-start gap-3 py-3.5 px-4 rounded-[var(--radius-lg)] text-sm leading-[1.6] transition-all bg-[#FCE4EC] hover:translate-x-1 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:bg-[rgba(252,228,236,0.1)]">
                        <span className="text-[#6200EA] text-xs mt-0.5 shrink-0">◆</span>
                        <span className="text-[#2c2c2c] flex-1 break-words dark:text-[var(--color-text-primary-dark,#cbd5e1)]">{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reader Insights Section */}
              {readerInsights.length > 0 && (
                <div className="mb-[var(--spacing-2xl)] last:mb-0">
                  <h3 className="text-[var(--font-size-md)] font-[var(--font-weight-semibold)] text-[var(--color-text-primary)] m-0 mb-[var(--spacing-md)]">💬 Reader Insights</h3>
                  <div className="flex flex-col gap-3">
                    {readerInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 py-3.5 px-4 rounded-[var(--radius-lg)] text-sm leading-[1.6] transition-all bg-[#E8EAF6] hover:translate-x-1 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:bg-[rgba(232,234,246,0.1)]">
                        <span className="text-base shrink-0">💬</span>
                        <span className="text-[#2c2c2c] flex-1 break-words dark:text-[var(--color-text-primary-dark,#cbd5e1)]">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Generated Footer */}
              {book?.aiGeneratedAt && (
                <div className="mt-[var(--spacing-xl)] pt-[var(--spacing-lg)] border-t border-[var(--color-border)]">
                  <p className="text-[var(--font-size-xs)] text-[var(--color-text-light)] m-0 text-center">
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

  // Render modal in portal to prevent z-index stacking issues
  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}

export default InsightsModal;
