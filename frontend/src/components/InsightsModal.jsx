import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * InsightsModal Component
 * 
 * Displays AI-generated book insights in a responsive modal
 */
function InsightsModal({ book, loading = false, onClose }) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);

  if (!book && !loading) return null;

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

  const hasData = summary || keyTakeaways.length > 0 || readerInsights.length > 0;

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-lg max-mobile:p-0 animate-fade-in" onClick={onClose}>
      <div className="bg-bg dark:bg-[var(--color-bg-dark,#1a1a1a)] rounded-xl w-full max-w-[600px] max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-border dark:border-[var(--color-border-dark,#333)] animate-slide-up overflow-hidden relative z-[10000] max-mobile:w-[95%] max-mobile:m-auto max-mobile:rounded-lg" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 max-mobile:p-4 border-b-2 border-border dark:border-[var(--color-border-dark,#333)] bg-bg dark:bg-[var(--color-bg-dark,#1a1a1a)] flex-shrink-0">
          <div className="flex-1 mr-md">
            <h2 className="text-2xl font-bold text-txt-primary m-0 mb-1">✨ Book Insights</h2>
            {book && !loading && (
              <p className="text-sm text-txt-secondary m-0 font-medium">{book.title} by {book.author}</p>
            )}
          </div>
          <button
            className="bg-bg-tertiary dark:bg-[var(--color-bg-tertiary-dark,#2a2a2a)] border border-border dark:border-[var(--color-border-dark,#333)] py-2 px-3.5 rounded-md text-lg cursor-pointer transition-all duration-200 text-txt-secondary dark:text-[var(--color-text-secondary-dark,#94a3b8)] flex-shrink-0 hover:bg-danger hover:text-white hover:border-danger hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            title="Close"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-mobile:p-4 overflow-y-auto flex-1 [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent]">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
              <div className="w-12 h-12 border-4 border-bg-tertiary dark:border-[var(--color-bg-tertiary-dark,#333)] border-t-primary rounded-full animate-spin-slow mb-lg"></div>
              <p className="text-lg font-semibold text-txt-primary m-0 mb-2">Generating AI insights...</p>
              <p className="text-sm text-txt-secondary m-0">This may take a few seconds</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !hasData && (
            <div className="flex flex-col items-center justify-center py-[60px] px-5 text-center">
              <div className="text-[64px] mb-lg opacity-50">📚</div>
              <p className="text-lg font-semibold text-txt-primary m-0 mb-2">No insights available yet</p>
              <p className="text-sm text-txt-secondary m-0 max-w-[300px]">
                AI insights are being generated. Please check back in a moment.
              </p>
            </div>
          )}

          {/* Content */}
          {!loading && hasData && (
            <>
              {/* Summary Section */}
              {summary && (
                <div className="mb-2xl last:mb-0">
                  <h3 className="text-base font-semibold text-txt-primary m-0 mb-md">📖 Summary</h3>
                  <div className="bg-[#F3E8FF] dark:bg-[rgba(98,0,234,0.15)] border-l-4 border-l-[#6200EA] dark:border-l-violet-500 py-4 px-5 max-mobile:py-3 max-mobile:px-4 rounded-md">
                    <p className="text-[15px] leading-[1.6] text-[#1a1a1a] dark:text-[var(--color-text-primary-dark,#e2e8f0)] m-0">{summary}</p>
                  </div>
                </div>
              )}

              {/* Key Takeaways Section */}
              {keyTakeaways.length > 0 && (
                <div className="mb-2xl last:mb-0">
                  <h3 className="text-base font-semibold text-txt-primary m-0 mb-md">💡 Key Takeaways</h3>
                  <div className="flex flex-col gap-3">
                    {keyTakeaways.map((takeaway, index) => (
                      <div key={index} className="flex items-start gap-3 py-3.5 px-4 rounded-lg text-sm leading-[1.6] transition-all duration-200 bg-[#FCE4EC] dark:bg-[rgba(252,228,236,0.1)] hover:translate-x-1 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                        <span className="text-[#6200EA] text-xs mt-0.5 flex-shrink-0">◆</span>
                        <span className="text-[#2c2c2c] dark:text-[var(--color-text-primary-dark,#cbd5e1)] flex-1 break-words">{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reader Insights Section */}
              {readerInsights.length > 0 && (
                <div className="mb-2xl last:mb-0">
                  <h3 className="text-base font-semibold text-txt-primary m-0 mb-md">💬 Reader Insights</h3>
                  <div className="flex flex-col gap-3">
                    {readerInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 py-3.5 px-4 rounded-lg text-sm leading-[1.6] transition-all duration-200 bg-[#E8EAF6] dark:bg-[rgba(232,234,246,0.1)] hover:translate-x-1 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                        <span className="text-base flex-shrink-0">💬</span>
                        <span className="text-[#2c2c2c] dark:text-[var(--color-text-primary-dark,#cbd5e1)] flex-1 break-words">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Generated Footer */}
              {book?.aiGeneratedAt && (
                <div className="mt-xl pt-lg border-t border-border">
                  <p className="text-xs text-txt-light m-0 text-center">
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

  return ReactDOM.createPortal(
    modalContent,
    document.getElementById('modal-root')
  );
}

export default InsightsModal;
