import React, { useState } from 'react';
import { Upload } from 'lucide-react';
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

    // Parse CSV header
    const headers = parseCSVLine(lines[0]);
    
    // Find column indices (Goodreads export format)
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
    
    // Parse each book row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = parseCSVLine(line);
        
        const title = values[titleIdx]?.trim();
        const author = values[authorIdx]?.trim();
        
        if (!title || !author) continue;

        // Map Goodreads shelves to our status
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
        i++; // Skip next quote
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
      // Goodreads format: "2024/01/15" or "2024-01-15"
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
    // Filter out default Goodreads shelves
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

    // Read and preview file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const parsedBooks = parseGoodreadsCSV(csvText);
        setPreview(parsedBooks.slice(0, 5)); // Show first 5 books
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

        // Import books one by one
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-[700px] max-h-[90vh] overflow-y-auto max-md:max-w-[calc(100vw-var(--spacing-lg))] max-md:m-2 max-md:p-6 max-[400px]:p-4" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="max-md:text-xl max-md:mb-[var(--spacing-md)] max-[400px]:text-lg"><Upload className="w-5 h-5 inline mr-2" />Import from Goodreads</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="p-[var(--spacing-lg)]">
          {!importStats ? (
            <>
              <div className="bg-[var(--color-bg-secondary)] p-[var(--spacing-lg)] rounded-[var(--radius-md)] mb-[var(--spacing-lg)]">
                <h3 className="m-0 mb-[var(--spacing-md)] text-base text-[var(--color-text-primary)]">How to import from Goodreads:</h3>
                <ol className="m-0 pl-[var(--spacing-lg)] text-[var(--color-text-secondary)] text-sm [&_li]:mb-[var(--spacing-sm)]">
                  <li>Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] no-underline hover:underline">Goodreads Export</a></li>
                  <li>Click "Export Library" and download your CSV file</li>
                  <li>Upload the CSV file below</li>
                </ol>
              </div>

              <div className="mb-[var(--spacing-lg)]">
                <label htmlFor="csv-file" className="block cursor-pointer">
                  <div className="border-2 border-dashed border-[var(--color-border)] rounded-[var(--radius-md)] p-[var(--spacing-xl)] text-center bg-[var(--color-bg)] transition-all duration-200 flex flex-col items-center gap-[var(--spacing-sm)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] max-md:px-[var(--spacing-md)] max-[400px]:px-[var(--spacing-md)]">
                    {file ? (
                      <>
                        <span className="text-5xl max-md:text-5xl max-[400px]:text-[40px]">📄</span>
                        <span className="text-base font-semibold text-[var(--color-text-primary)] max-md:text-sm">{file.name}</span>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-5xl max-md:text-5xl max-[400px]:text-[40px]">📤</span>
                        <span className="text-base font-semibold text-[var(--color-text-primary)] max-md:text-sm">Click to select Goodreads CSV file</span>
                        <span className="text-sm text-[var(--color-text-secondary)] max-md:text-xs">or drag and drop</span>
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
                <div className="mb-[var(--spacing-lg)]">
                  <h3 className="text-base m-0 mb-[var(--spacing-md)] text-[var(--color-text-primary)]">Preview (first 5 books):</h3>
                  <div className="flex flex-col gap-[var(--spacing-sm)] max-h-[300px] overflow-y-auto">
                    {preview.map((book, index) => (
                      <div key={index} className="bg-[var(--color-bg-secondary)] p-[var(--spacing-md)] rounded-[var(--radius-md)] border-l-[3px] border-l-[var(--color-primary)]">
                        <div className="font-semibold text-[var(--color-text-primary)] mb-1">{book.title}</div>
                        <div className="text-sm text-[var(--color-text-secondary)] mb-[var(--spacing-sm)]">by {book.author}</div>
                        <div className="flex flex-wrap gap-[var(--spacing-xs)] text-xs">
                          <span className="py-0.5 px-2 bg-[var(--color-primary)] text-white rounded-xl font-medium">{book.status}</span>
                          {book.rating && <span className="text-amber-400">{'★'.repeat(book.rating)}</span>}
                          {book.tags.length > 0 && (
                            <span className="text-[var(--color-text-secondary)] italic">{book.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-[var(--spacing-md)] justify-end pt-[var(--spacing-lg)] border-t border-[var(--color-border)] max-md:flex-col-reverse max-md:gap-[var(--spacing-sm)] max-md:*:w-full max-md:*:py-3.5 max-md:*:px-[18px] max-md:*:text-sm">
                <button
                  className="btn-secondary"
                  onClick={onClose}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleImport}
                  disabled={!file || isProcessing}
                >
                  {isProcessing ? 'Importing...' : 'Import Books'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-[var(--spacing-xl)]">
              <div className="text-[64px] mb-[var(--spacing-md)]">
                {importStats.failed === 0 ? '🎉' : '✅'}
              </div>
              <h3 className="text-xl m-0 mb-[var(--spacing-lg)] text-[var(--color-text-primary)]">Import Complete!</h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
                <div className="bg-gradient-to-br from-green-100 to-green-200 p-[var(--spacing-md)] rounded-[var(--radius-md)] flex flex-col gap-[var(--spacing-xs)]">
                  <span className="text-2xl font-bold text-[var(--color-text-primary)]">{importStats.successful}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">Successfully Imported</span>
                </div>
                {importStats.failed > 0 && (
                  <div className="bg-gradient-to-br from-red-100 to-red-200 p-[var(--spacing-md)] rounded-[var(--radius-md)] flex flex-col gap-[var(--spacing-xs)]">
                    <span className="text-2xl font-bold text-[var(--color-text-primary)]">{importStats.failed}</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">Failed</span>
                  </div>
                )}
                <div className="bg-[var(--color-bg-secondary)] p-[var(--spacing-md)] rounded-[var(--radius-md)] flex flex-col gap-[var(--spacing-xs)]">
                  <span className="text-2xl font-bold text-[var(--color-text-primary)]">{importStats.total}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">Total</span>
                </div>
              </div>
              <button className="btn-primary" onClick={onClose}>
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
