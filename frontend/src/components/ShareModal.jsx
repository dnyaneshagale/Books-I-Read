import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, BookOpen, Library, FileText, FileCode, Database, BarChart3, Download, Mail } from 'lucide-react';

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
      case 'FINISHED': return <CheckCircle className="w-3 h-3 inline" />;
      case 'READING': return <BookOpen className="w-3 h-3 inline" />;
      case 'WANT_TO_READ': return <Library className="w-3 h-3 inline" />;
      default: return null;
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
      <div className="modal-content max-w-[600px] max-h-[90vh] overflow-y-auto max-md:max-w-[calc(100vw-var(--spacing-lg))] max-md:m-2 max-md:p-6 max-[400px]:p-4" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="max-md:text-xl max-[400px]:text-lg"><Upload className="w-5 h-5 inline mr-2" />Share Reading List</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="p-[var(--spacing-lg)]">
          <div className="bg-[var(--color-bg-secondary)] p-[var(--spacing-md)] rounded-[var(--radius-md)] mb-[var(--spacing-lg)] text-center">
            <p className="m-0 text-[var(--color-text-secondary)] text-sm">Share {books.length} book{books.length !== 1 ? 's' : ''} {filterInfo && `(${filterInfo})`}</p>
          </div>

          {/* Format Selection */}
          <div className="mb-[var(--spacing-lg)]">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-[var(--spacing-sm)]">Export Format</label>
            <div className="grid grid-cols-4 gap-[var(--spacing-sm)] max-md:grid-cols-1">
              {[
                { key: 'text', icon: FileText, label: 'Plain Text' },
                { key: 'markdown', icon: FileCode, label: 'Markdown' },
                { key: 'json', icon: Database, label: 'JSON' },
                { key: 'csv', icon: BarChart3, label: 'CSV' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  className={`p-[var(--spacing-md)] border-2 rounded-[var(--radius-md)] text-sm font-medium cursor-pointer transition-all duration-200 text-center ${
                    selectedFormat === key
                      ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                  }`}
                  onClick={() => setSelectedFormat(key)}
                >
                  <Icon className="w-4 h-4 inline mr-1" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-[var(--spacing-lg)]">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-[var(--spacing-sm)]">Include in Export</label>
            <div className="flex flex-col gap-[var(--spacing-sm)]">
              {[
                { checked: includeProgress, onChange: setIncludeProgress, label: 'Reading Progress' },
                { checked: includeRatings, onChange: setIncludeRatings, label: 'Ratings' },
                { checked: includeTags, onChange: setIncludeTags, label: 'Tags' },
              ].map(({ checked, onChange, label }) => (
                <label key={label} className="flex items-center gap-[var(--spacing-sm)] cursor-pointer p-[var(--spacing-sm)] rounded-[var(--radius-sm)] transition-colors duration-200 hover:bg-[var(--color-bg-secondary)]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-[18px] h-[18px] cursor-pointer"
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-[var(--spacing-lg)]">
            <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-[var(--spacing-sm)]">Preview</label>
            <pre className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-[var(--spacing-md)] font-mono text-xs text-[var(--color-text-secondary)] overflow-x-auto whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">{generateContent().substring(0, 500)}...</pre>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-[var(--spacing-sm)] pt-[var(--spacing-lg)] border-t border-[var(--color-border)] max-md:flex-col-reverse">
            <button
              className="p-[var(--spacing-md)] rounded-[var(--radius-md)] text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] max-md:w-full max-md:py-3.5 max-md:px-[18px]"
              onClick={handleCopyToClipboard}
            >
              📋 Copy to Clipboard
            </button>
            <button
              className="p-[var(--spacing-md)] rounded-[var(--radius-md)] text-sm font-semibold cursor-pointer transition-all duration-200 bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-primary)] hover:-translate-y-0.5 max-md:w-full max-md:py-3.5 max-md:px-[18px]"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 inline mr-1" />Download File
            </button>
            <button
              className="p-[var(--spacing-md)] rounded-[var(--radius-md)] text-sm font-semibold cursor-pointer transition-all duration-200 bg-white text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:-translate-y-0.5 max-md:w-full max-md:py-3.5 max-md:px-[18px]"
              onClick={handleShareViaEmail}
            >
              <Mail className="w-4 h-4 inline mr-1" />Share via Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
