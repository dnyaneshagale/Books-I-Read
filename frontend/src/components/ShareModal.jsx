import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './ShareModal.css';

/**
 * ShareModal Component
 * 
 * Modal for sharing/exporting reading lists in various formats
 */
function ShareModal({ books, onClose, filterInfo }) {
  const [selectedFormat, setSelectedFormat] = useState('text');
  const [includeProgress, setIncludeProgress] = useState(true);
  const [includeRatings, setIncludeRatings] = useState(true);
  const [includeTags, setIncludeTags] = useState(true);

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'FINISHED': return '✅';
      case 'READING': return '📖';
      case 'WANT_TO_READ': return '📚';
      default: return '';
    }
  };

  const generateTextFormat = () => {
    const title = filterInfo 
      ? `My Reading List - ${filterInfo}` 
      : 'My Reading List';
    
    let content = `${title}\n${'='.repeat(title.length)}\n\n`;
    
    books.forEach((book, index) => {
      content += `${index + 1}. ${getStatusEmoji(book.status)} ${book.title}\n`;
      content += `   by ${book.author}\n`;
      
      if (includeProgress && book.totalPages) {
        content += `   Progress: ${book.pagesRead}/${book.totalPages} pages (${book.progress}%)\n`;
      }
      
      if (includeRatings && book.rating) {
        content += `   Rating: ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}\n`;
      }
      
      if (includeTags && book.tags && book.tags.length > 0) {
        content += `   Tags: ${book.tags.join(', ')}\n`;
      }
      
      if (book.review) {
        content += `   Review: ${book.review}\n`;
      }
      
      content += '\n';
    });
    
    content += `\nTotal Books: ${books.length}\n`;
    content += `Generated on ${new Date().toLocaleDateString()}\n`;
    
    return content;
  };

  const generateMarkdownFormat = () => {
    const title = filterInfo 
      ? `My Reading List - ${filterInfo}` 
      : 'My Reading List';
    
    let content = `# ${title}\n\n`;
    
    books.forEach((book, index) => {
      content += `## ${index + 1}. ${getStatusEmoji(book.status)} ${book.title}\n\n`;
      content += `**Author:** ${book.author}\n\n`;
      
      if (includeProgress && book.totalPages) {
        content += `**Progress:** ${book.pagesRead}/${book.totalPages} pages (${book.progress}%)\n\n`;
      }
      
      if (includeRatings && book.rating) {
        content += `**Rating:** ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}\n\n`;
      }
      
      if (includeTags && book.tags && book.tags.length > 0) {
        content += `**Tags:** ${book.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`;
      }
      
      if (book.review) {
        content += `**Review:**\n> ${book.review}\n\n`;
      }
      
      content += '---\n\n';
    });
    
    content += `**Total Books:** ${books.length}  \n`;
    content += `**Generated:** ${new Date().toLocaleDateString()}\n`;
    
    return content;
  };

  const generateJSONFormat = () => {
    const exportData = {
      title: filterInfo ? `My Reading List - ${filterInfo}` : 'My Reading List',
      generatedAt: new Date().toISOString(),
      totalBooks: books.length,
      books: books.map(book => ({
        title: book.title,
        author: book.author,
        status: book.status,
        ...(includeProgress && { 
          totalPages: book.totalPages,
          pagesRead: book.pagesRead,
          progress: book.progress 
        }),
        ...(includeRatings && book.rating && { rating: book.rating }),
        ...(includeTags && book.tags && { tags: book.tags }),
        ...(book.review && { review: book.review }),
        ...(book.startDate && { startDate: book.startDate }),
        ...(book.completeDate && { completeDate: book.completeDate })
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  };

  const generateCSVFormat = () => {
    // CSV Headers
    const headers = ['Title', 'Author', 'Status'];
    if (includeProgress) headers.push('Total Pages', 'Pages Read', 'Progress %');
    if (includeRatings) headers.push('Rating');
    if (includeTags) headers.push('Tags');
    headers.push('Start Date', 'Complete Date', 'Review');
    
    let csv = headers.join(',') + '\n';
    
    books.forEach(book => {
      const row = [];
      
      // Escape CSV fields with commas or quotes
      const escapeCSV = (field) => {
        if (!field) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      };
      
      row.push(escapeCSV(book.title));
      row.push(escapeCSV(book.author));
      row.push(book.status);
      
      if (includeProgress) {
        row.push(book.totalPages || '');
        row.push(book.pagesRead || '');
        row.push(book.progress || '');
      }
      
      if (includeRatings) {
        row.push(book.rating || '');
      }
      
      if (includeTags) {
        row.push(escapeCSV(book.tags ? book.tags.join('; ') : ''));
      }
      
      row.push(book.startDate || '');
      row.push(book.completeDate || '');
      row.push(escapeCSV(book.review || ''));
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  };

  const generateContent = () => {
    switch (selectedFormat) {
      case 'markdown':
        return generateMarkdownFormat();
      case 'json':
        return generateJSONFormat();
      case 'csv':
        return generateCSVFormat();
      default:
        return generateTextFormat();
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const content = generateContent();
      await navigator.clipboard.writeText(content);
      toast.success('📋 Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    try {
      const content = generateContent();
      const fileExtension = selectedFormat === 'json' ? 'json' : 
                           selectedFormat === 'markdown' ? 'md' : 
                           selectedFormat === 'csv' ? 'csv' : 'txt';
      const fileName = `reading-list-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`📥 Downloaded ${fileName}`);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleShareViaEmail = () => {
    const content = generateTextFormat();
    const subject = encodeURIComponent('My Reading List');
    const body = encodeURIComponent(content);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📤 Share Reading List</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="share-modal-body">
          <div className="share-info">
            <p>Share {books.length} book{books.length !== 1 ? 's' : ''} {filterInfo && `(${filterInfo})`}</p>
          </div>

          {/* Format Selection */}
          <div className="format-selection">
            <label className="section-label">Export Format</label>
            <div className="format-options">
              <button
                className={`format-btn ${selectedFormat === 'text' ? 'active' : ''}`}
                onClick={() => setSelectedFormat('text')}
              >
                📄 Plain Text
              </button>
              <button
                className={`format-btn ${selectedFormat === 'markdown' ? 'active' : ''}`}
                onClick={() => setSelectedFormat('markdown')}
              >
                📝 Markdown
              </button>
              <button
                className={`format-btn ${selectedFormat === 'json' ? 'active' : ''}`}
                onClick={() => setSelectedFormat('json')}
              >
                💾 JSON
              </button>
              <button
                className={`format-btn ${selectedFormat === 'csv' ? 'active' : ''}`}
                onClick={() => setSelectedFormat('csv')}
              >
                📊 CSV
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="share-options">
            <label className="section-label">Include in Export</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeProgress}
                  onChange={(e) => setIncludeProgress(e.target.checked)}
                />
                <span>Reading Progress</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeRatings}
                  onChange={(e) => setIncludeRatings(e.target.checked)}
                />
                <span>Ratings</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeTags}
                  onChange={(e) => setIncludeTags(e.target.checked)}
                />
                <span>Tags</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="share-preview">
            <label className="section-label">Preview</label>
            <pre className="preview-content">{generateContent().substring(0, 500)}...</pre>
          </div>

          {/* Actions */}
          <div className="share-actions">
            <button className="share-action-btn primary" onClick={handleCopyToClipboard}>
              📋 Copy to Clipboard
            </button>
            <button className="share-action-btn secondary" onClick={handleDownload}>
              📥 Download File
            </button>
            <button className="share-action-btn tertiary" onClick={handleShareViaEmail}>
              ✉️ Share via Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
