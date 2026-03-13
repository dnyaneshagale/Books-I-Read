import React, { useMemo, useState } from 'react';
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, Database } from 'lucide-react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import ModalShell from './ui/modal-shell';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

/**
 * ImportModal Component
 * 
 * Modal for importing books from Goodreads CSV export
 */
function ImportModal({ onClose, onImported }) {
  useBodyScrollLock();

  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState([]);
  const [importStats, setImportStats] = useState(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalToImport, setTotalToImport] = useState(0);

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
      } catch {
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
    setProcessedCount(0);
    setTotalToImport(0);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const csvText = e.target.result;
        const books = parseGoodreadsCSV(csvText);
        setTotalToImport(books.length);

        let successful = 0;
        let failed = 0;

        // Import books one by one to maximize compatibility with existing API constraints.
        for (let index = 0; index < books.length; index++) {
          const book = books[index];
          try {
            await bookApi.createBook(book);
            successful++;
          } catch {
            failed++;
          }
          setProcessedCount(index + 1);
        }

        setImportStats({ successful, failed, total: books.length });
        
        if (successful > 0) {
          toast.success(`✅ Successfully imported ${successful} books!`);
          if (onImported) onImported();
        }
        
        if (failed > 0) {
          toast.error(`⚠️ Failed to import ${failed} books`);
        }
      } catch {
        toast.error('Failed to import books');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  const progressPercentage = useMemo(() => {
    if (!isProcessing || processedCount === 0) return 0;
    const total = totalToImport || importStats?.total || Math.max(preview.length, processedCount);
    return Math.min(100, Math.round((processedCount / Math.max(1, total)) * 100));
  }, [isProcessing, processedCount, totalToImport, importStats, preview.length]);

  return (
    <ModalShell
      onClose={onClose}
      title="Import Data"
      icon={<Upload className="w-5 h-5" />}
      contentClassName="max-w-[760px] max-h-[90vh] overflow-y-auto max-md:max-w-[calc(100vw-var(--spacing-lg))] max-md:m-2 max-md:p-6 max-[400px]:p-4"
      bodyClassName="p-[var(--spacing-lg)]"
    >
          {!importStats ? (
            <>
              <div className="rounded-2xl border border-violet-200/70 dark:border-violet-400/20 bg-gradient-to-br from-violet-50 via-white to-indigo-50/70 dark:from-violet-950/20 dark:via-[var(--color-bg-secondary)] dark:to-indigo-950/20 p-4 mb-[var(--spacing-lg)]">
                <div className="flex items-center gap-2 mb-3 text-[var(--color-text-primary)]">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <h3 className="m-0 text-base font-semibold">Goodreads Import Assistant</h3>
                </div>
                <div className="grid grid-cols-1 min-[600px]:grid-cols-3 gap-2.5 text-sm">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] dark:bg-black/20 p-3">
                    <p className="m-0 font-semibold text-[var(--color-text-primary)] mb-1">1. Export CSV</p>
                    <p className="m-0 text-[var(--color-text-secondary)]">Download your library from Goodreads.</p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] dark:bg-black/20 p-3">
                    <p className="m-0 font-semibold text-[var(--color-text-primary)] mb-1">2. Upload Here</p>
                    <p className="m-0 text-[var(--color-text-secondary)]">We preview your first 5 books before import.</p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] dark:bg-black/20 p-3">
                    <p className="m-0 font-semibold text-[var(--color-text-primary)] mb-1">3. Import Safely</p>
                    <p className="m-0 text-[var(--color-text-secondary)]">Books are imported one by one for reliability.</p>
                  </div>
                </div>
                <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm text-violet-700 dark:text-violet-300 no-underline hover:underline">
                  Open Goodreads Export Page
                </a>
              </div>

              <div className="mb-[var(--spacing-lg)]">
                <label htmlFor="csv-file" className="block cursor-pointer">
                  <div className="border-2 border-dashed border-[var(--color-border)] rounded-2xl p-[var(--spacing-xl)] text-center bg-[var(--color-bg)] transition-all duration-200 flex flex-col items-center gap-[var(--spacing-sm)] hover:border-violet-500 hover:bg-[var(--color-bg-hover)] max-md:px-[var(--spacing-md)] max-[400px]:px-[var(--spacing-md)]">
                    {file ? (
                      <>
                        <FileText className="w-10 h-10 text-violet-600" />
                        <span className="text-base font-semibold text-[var(--color-text-primary)] max-md:text-sm break-all">{file.name}</span>
                        <span className="text-sm text-[var(--color-text-secondary)] inline-flex items-center gap-1">
                          <Database className="w-3.5 h-3.5" />
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready to import
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-violet-600" />
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
                  <h3 className="text-base m-0 mb-[var(--spacing-md)] text-[var(--color-text-primary)]">Preview (first 5 books)</h3>
                  <div className="flex flex-col gap-[var(--spacing-sm)] max-h-[300px] overflow-y-auto pr-1">
                    {preview.map((book, index) => (
                      <div key={index} className="bg-[var(--color-bg-secondary)] p-[var(--spacing-md)] rounded-[var(--radius-md)] border border-[var(--color-border)]">
                        <div className="font-semibold text-[var(--color-text-primary)] mb-1 line-clamp-1">{book.title}</div>
                        <div className="text-sm text-[var(--color-text-secondary)] mb-[var(--spacing-sm)]">by {book.author}</div>
                        <div className="flex flex-wrap gap-[var(--spacing-xs)] text-xs items-center">
                          <span className="py-0.5 px-2 bg-[var(--color-primary)] text-white rounded-xl font-medium">{book.status.replaceAll('_', ' ')}</span>
                          {book.rating && <span className="text-amber-500">{'★'.repeat(book.rating)}</span>}
                          {book.tags.length > 0 && (
                            <span className="text-[var(--color-text-secondary)] italic">{book.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="mb-[var(--spacing-lg)] rounded-xl border border-[var(--color-border)] p-3.5 bg-[var(--color-bg-secondary)]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="m-0 text-sm font-semibold text-[var(--color-text-primary)] inline-flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" /> Importing books...
                    </p>
                    <span className="text-xs text-[var(--color-text-secondary)]">{processedCount}/{Math.max(1, totalToImport)} processed</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-200" style={{ width: `${progressPercentage}%` }} />
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
              <div className="text-[64px] mb-[var(--spacing-md)] inline-flex text-emerald-500">
                <CheckCircle2 className="w-16 h-16" />
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
    </ModalShell>
  );
}

export default ImportModal;
