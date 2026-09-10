import React, { useState } from 'react';
import toast from 'react-hot-toast';

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
    const title = filterInfo ? `My Reading List - ${filterInfo}` : 'My Reading List';
    let content = `${title}\n${'='.repeat(title.length)}\n\n`;
    books.forEach((book, index) => {
      content += `${index + 1}. ${getStatusEmoji(book.status)} ${book.title}\n`;
      content += `   by ${book.author}\n`;
      if (includeProgress && book.totalPages) content += `   Progress: ${book.pagesRead}/${book.totalPages} pages (${book.progress}%)\n`;
      if (includeRatings && book.rating) content += `   Rating: ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}\n`;
      if (includeTags && book.tags && book.tags.length > 0) content += `   Tags: ${book.tags.join(', ')}\n`;
      if (book.review) content += `   Review: ${book.review}\n`;
      content += '\n';
    });
    content += `\nTotal Books: ${books.length}\n`;
    content += `Generated on ${new Date().toLocaleDateString()}\n`;
    return content;
  };

  const generateMarkdownFormat = () => {
    const title = filterInfo ? `My Reading List - ${filterInfo}` : 'My Reading List';
    let content = `# ${title}\n\n`;
    books.forEach((book, index) => {
      content += `## ${index + 1}. ${getStatusEmoji(book.status)} ${book.title}\n\n`;
      content += `**Author:** ${book.author}\n\n`;
      if (includeProgress && book.totalPages) content += `**Progress:** ${book.pagesRead}/${book.totalPages} pages (${book.progress}%)\n\n`;
      if (includeRatings && book.rating) content += `**Rating:** ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}\n\n`;
      if (includeTags && book.tags && book.tags.length > 0) content += `**Tags:** ${book.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`;
      if (book.review) content += `**Review:**\n> ${book.review}\n\n`;
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
        title: book.title, author: book.author, status: book.status,
        ...(includeProgress && { totalPages: book.totalPages, pagesRead: book.pagesRead, progress: book.progress }),
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
    const headers = ['Title', 'Author', 'Status'];
    if (includeProgress) headers.push('Total Pages', 'Pages Read', 'Progress %');
    if (includeRatings) headers.push('Rating');
    if (includeTags) headers.push('Tags');
    headers.push('Start Date', 'Complete Date', 'Review');
    let csv = headers.join(',') + '\n';
    books.forEach(book => {
      const escapeCSV = (field) => {
        if (!field) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"';
        return str;
      };
      const row = [escapeCSV(book.title), escapeCSV(book.author), book.status];
      if (includeProgress) { row.push(book.totalPages || '', book.pagesRead || '', book.progress || ''); }
      if (includeRatings) { row.push(book.rating || ''); }
      if (includeTags) { row.push(escapeCSV(book.tags ? book.tags.join('; ') : '')); }
      row.push(book.startDate || '', book.completeDate || '', escapeCSV(book.review || ''));
      csv += row.join(',') + '\n';
    });
    return csv;
  };

  const generateContent = () => {
    switch (selectedFormat) {
      case 'markdown': return generateMarkdownFormat();
      case 'json': return generateJSONFormat();
      case 'csv': return generateCSVFormat();
      default: return generateTextFormat();
    }
  };

  const handleCopyToClipboard = async () => {
    try { await navigator.clipboard.writeText(generateContent()); toast.success('📋 Copied to clipboard!'); }
    catch (error) { toast.error('Failed to copy to clipboard'); }
  };

  const handleDownload = () => {
    try {
      const content = generateContent();
      const fileExtension = selectedFormat === 'json' ? 'json' : selectedFormat === 'markdown' ? 'md' : selectedFormat === 'csv' ? 'csv' : 'txt';
      const fileName = `reading-list-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = fileName;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(url);
      toast.success(`📥 Downloaded ${fileName}`);
    } catch (error) { toast.error('Failed to download file'); }
  };

  const handleShareViaEmail = () => {
    const content = generateTextFormat();
    window.open(`mailto:?subject=${encodeURIComponent('My Reading List')}&body=${encodeURIComponent(content)}`);
  };

  const formatBtns = [
    { key: 'text', label: '📄 Plain Text' },
    { key: 'markdown', label: '📝 Markdown' },
    { key: 'json', label: '💾 JSON' },
    { key: 'csv', label: '📊 CSV' },
  ];

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-lg animate-fade-in" onClick={onClose}>
      <div className="bg-bg rounded-xl p-xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto shadow-xl border border-border animate-slide-up max-md:max-w-[calc(100vw-var(--spacing-lg))] max-md:m-sm max-md:p-lg max-[400px]:p-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-lg pb-md border-b-2 border-border">
          <h2 className="text-2xl font-bold text-txt-primary m-0 max-md:text-xl max-[400px]:text-lg">📤 Share Reading List</h2>
          <button className="bg-bg-tertiary border border-border py-2 px-3.5 rounded-md text-lg cursor-pointer transition-all duration-200 text-txt-secondary hover:bg-danger hover:text-white hover:border-danger hover:scale-105" onClick={onClose}>×</button>
        </div>

        <div className="p-lg">
          <div className="bg-bg-secondary p-md rounded-md mb-lg text-center">
            <p className="m-0 text-txt-secondary text-sm">Share {books.length} book{books.length !== 1 ? 's' : ''} {filterInfo && `(${filterInfo})`}</p>
          </div>

          {/* Format Selection */}
          <div className="mb-lg">
            <label className="block text-sm font-semibold text-txt-primary mb-sm">Export Format</label>
            <div className="grid grid-cols-4 gap-sm max-md:grid-cols-1">
              {formatBtns.map(f => (
                <button
                  key={f.key}
                  className={`p-md bg-bg border-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 text-center ${selectedFormat === f.key ? 'bg-primary border-primary text-white' : 'border-border text-txt-secondary hover:border-primary hover:bg-bg-hover hover:text-txt-primary'}`}
                  onClick={() => setSelectedFormat(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mb-lg">
            <label className="block text-sm font-semibold text-txt-primary mb-sm">Include in Export</label>
            <div className="flex flex-col gap-sm">
              {[
                { checked: includeProgress, onChange: setIncludeProgress, label: 'Reading Progress' },
                { checked: includeRatings, onChange: setIncludeRatings, label: 'Ratings' },
                { checked: includeTags, onChange: setIncludeTags, label: 'Tags' },
              ].map(opt => (
                <label key={opt.label} className="flex items-center gap-sm cursor-pointer p-sm rounded-sm transition-colors duration-200 hover:bg-bg-secondary">
                  <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="w-[18px] h-[18px] cursor-pointer" />
                  <span className="text-sm text-txt-primary">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-lg">
            <label className="block text-sm font-semibold text-txt-primary mb-sm">Preview</label>
            <pre className="bg-bg-secondary border border-border rounded-md p-md font-mono text-xs text-txt-secondary overflow-x-auto whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">{generateContent().substring(0, 500)}...</pre>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-sm pt-lg border-t border-border max-md:flex-col-reverse">
            <button className="p-md rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]" onClick={handleCopyToClipboard}>
              📋 Copy to Clipboard
            </button>
            <button className="p-md rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 bg-bg-secondary text-txt-primary border border-border hover:bg-bg-hover hover:border-primary hover:-translate-y-0.5" onClick={handleDownload}>
              📥 Download File
            </button>
            <button className="p-md rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white hover:-translate-y-0.5" onClick={handleShareViaEmail}>
              ✉️ Share via Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
