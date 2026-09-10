import React, { useState } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';

/**
 * ImportModal Component
 * 
 * Modal for importing books from Goodreads CSV export
 */
function ImportModal({ onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState([]);
  const [importStats, setImportStats] = useState(null);

  const parseGoodreadsCSV = (csvText) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty');
    }

    const headers = parseCSVLine(lines[0]);

    const titleIdx = headers.findIndex(h => h.toLowerCase().includes('title'));
    const authorIdx = headers.findIndex(h => h.toLowerCase().includes('author'));
    const pagesIdx = headers.findIndex(h => h.toLowerCase() === 'number of pages');
    const ratingIdx = headers.findIndex(h => h.toLowerCase() === 'my rating');
    const dateReadIdx = headers.findIndex(h => h.toLowerCase() === 'date read');
    const dateAddedIdx = headers.findIndex(h => h.toLowerCase() === 'date added');
    const shelvesIdx = headers.findIndex(h => h.toLowerCase().includes('bookshelves') || h.toLowerCase().includes('shelf'));
    const reviewIdx = headers.findIndex(h => h.toLowerCase() === 'my review');

    if (titleIdx === -1 || authorIdx === -1) {
      throw new Error('CSV file must contain Title and Author columns');
    }

    const books = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);

        const title = values[titleIdx]?.trim();
        const author = values[authorIdx]?.trim();

        if (!title || !author) continue;

        let status = 'WANT_TO_READ';
        const shelf = values[shelvesIdx]?.toLowerCase() || '';
        if (shelf.includes('currently-reading') || shelf.includes('reading')) {
          status = 'READING';
        } else if (shelf.includes('read')) {
          status = 'FINISHED';
        }

        const book = {
          title,
          author,
          totalPages: parseInt(values[pagesIdx]) || 100,
          pagesRead: status === 'FINISHED' ? (parseInt(values[pagesIdx]) || 100) : 0,
          status,
          rating: parseInt(values[ratingIdx]) || null,
          review: values[reviewIdx]?.trim() || null,
          completeDate: status === 'FINISHED' && values[dateReadIdx] ? parseGoodreadsDate(values[dateReadIdx]) : null,
          startDate: status === 'READING' && values[dateAddedIdx] ? parseGoodreadsDate(values[dateAddedIdx]) : null,
          tags: parseGoodreadsTags(values[shelvesIdx])
        };

        books.push(book);
      } catch (error) {
        // Skip invalid lines
      }
    }

    return books;
  };

  const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    return values;
  };

  const parseGoodreadsDate = (dateStr) => {
    if (!dateStr || dateStr.trim() === '') return null;

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
      return date.toISOString().split('T')[0];
    } catch {
      return null;
    }
  };

  const parseGoodreadsTags = (shelvesStr) => {
    if (!shelvesStr) return [];

    const shelves = shelvesStr.split(',').map(s => s.trim());
    const defaultShelves = ['to-read', 'currently-reading', 'read'];
    return shelves
      .filter(shelf => !defaultShelves.includes(shelf.toLowerCase()))
      .filter(shelf => shelf.length > 0);
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const parsedBooks = parseGoodreadsCSV(csvText);
        setPreview(parsedBooks.slice(0, 5));
        toast.success(`📚 Found ${parsedBooks.length} books in file`);
      } catch (error) {
        toast.error(error.message || 'Failed to parse CSV file');
        setFile(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const csvText = e.target.result;
        const books = parseGoodreadsCSV(csvText);

        let successful = 0;
        let failed = 0;

        for (const book of books) {
          try {
            await bookApi.createBook(book);
            successful++;
          } catch (error) {
            failed++;
          }
        }

        setImportStats({ successful, failed, total: books.length });

        if (successful > 0) {
          toast.success(`✅ Successfully imported ${successful} books!`);
          if (onImported) onImported();
        }

        if (failed > 0) {
          toast.error(`⚠️ Failed to import ${failed} books`);
        }
      } catch (error) {
        toast.error('Failed to import books');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-lg animate-fade-in" onClick={onClose}>
      <div className="modal-content bg-bg rounded-xl p-xl max-w-[700px] w-full max-h-[90vh] overflow-y-auto shadow-xl border border-border animate-slide-up max-md:max-w-[calc(100vw-var(--spacing-lg))] max-md:m-sm max-md:p-lg max-[400px]:p-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-lg pb-md border-b-2 border-border">
          <h2 className="text-2xl font-bold text-txt-primary m-0 max-md:text-xl">📥 Import from Goodreads</h2>
          <button className="bg-bg-tertiary border border-border py-2 px-3.5 rounded-md text-lg cursor-pointer transition-all duration-200 text-txt-secondary hover:bg-danger hover:text-white hover:border-danger hover:scale-105" onClick={onClose}>×</button>
        </div>

        <div className="p-lg">
          {!importStats ? (
            <>
              <div className="bg-bg-secondary p-lg rounded-md mb-lg">
                <h3 className="m-0 mb-md text-base text-txt-primary">How to import from Goodreads:</h3>
                <ol className="m-0 pl-lg text-txt-secondary text-sm">
                  <li className="mb-sm">Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer" className="text-primary no-underline hover:underline">Goodreads Export</a></li>
                  <li className="mb-sm">Click "Export Library" and download your CSV file</li>
                  <li className="mb-sm">Upload the CSV file below</li>
                </ol>
              </div>

              <div className="mb-lg">
                <label htmlFor="csv-file" className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-md p-xl text-center bg-bg transition-all duration-200 flex flex-col items-center gap-sm hover:border-primary hover:bg-bg-hover">
                    {file ? (
                      <>
                        <span className="text-5xl">📄</span>
                        <span className="text-base font-semibold text-txt-primary">{file.name}</span>
                        <span className="text-sm text-txt-secondary">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-5xl max-md:text-5xl max-[400px]:text-[40px]">📤</span>
                        <span className="text-base font-semibold text-txt-primary max-md:text-sm">Click to select Goodreads CSV file</span>
                        <span className="text-sm text-txt-secondary max-md:text-xs">or drag and drop</span>
                      </>
                    )}
                  </div>
                </label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {preview.length > 0 && (
                <div className="mb-lg">
                  <h3 className="text-base m-0 mb-md text-txt-primary">Preview (first 5 books):</h3>
                  <div className="flex flex-col gap-sm max-h-[300px] overflow-y-auto">
                    {preview.map((book, index) => (
                      <div key={index} className="bg-bg-secondary p-md rounded-md border-l-[3px] border-l-primary">
                        <div className="font-semibold text-txt-primary mb-1">{book.title}</div>
                        <div className="text-sm text-txt-secondary mb-sm">by {book.author}</div>
                        <div className="flex flex-wrap gap-xs text-xs">
                          <span className="py-0.5 px-2 bg-primary text-white rounded-xl font-medium">{book.status}</span>
                          {book.rating && <span className="text-amber-400">{'★'.repeat(book.rating)}</span>}
                          {book.tags.length > 0 && (
                            <span className="text-txt-secondary italic">{book.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-md justify-end pt-lg border-t border-border max-md:flex-col-reverse max-md:gap-sm">
                <button
                  className="py-md px-lg rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 border border-border bg-bg-secondary text-txt-primary hover:bg-bg-hover hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full max-md:py-3.5 max-md:px-[18px] max-md:text-sm"
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  className="py-md px-lg rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed max-md:w-full max-md:py-3.5 max-md:px-[18px] max-md:text-sm"
                  onClick={handleImport}
                  disabled={!file || isProcessing}
                >
                  {isProcessing ? 'Importing...' : 'Import Books'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-xl">
              <div className="text-[64px] mb-md">
                {importStats.failed === 0 ? '🎉' : '✅'}
              </div>
              <h3 className="text-xl m-0 mb-lg text-txt-primary">Import Complete!</h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-md mb-xl">
                <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-md rounded-md flex flex-col gap-xs">
                  <span className="text-2xl font-bold text-txt-primary">{importStats.successful}</span>
                  <span className="text-sm text-txt-secondary">Successfully Imported</span>
                </div>
                {importStats.failed > 0 && (
                  <div className="bg-gradient-to-br from-red-100 to-red-200 p-md rounded-md flex flex-col gap-xs">
                    <span className="text-2xl font-bold text-txt-primary">{importStats.failed}</span>
                    <span className="text-sm text-txt-secondary">Failed</span>
                  </div>
                )}
                <div className="bg-bg-secondary p-md rounded-md flex flex-col gap-xs">
                  <span className="text-2xl font-bold text-txt-primary">{importStats.total}</span>
                  <span className="text-sm text-txt-secondary">Total</span>
                </div>
              </div>
              <button className="py-md px-lg rounded-md text-sm font-semibold cursor-pointer transition-all duration-200 border-none bg-primary text-white hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)]" onClick={onClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportModal;
