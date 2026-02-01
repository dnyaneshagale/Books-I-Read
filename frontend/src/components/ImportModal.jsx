import React, { useState } from 'react';
import bookApi from '../api/bookApi';
import toast from 'react-hot-toast';
import './ImportModal.css';

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
        console.warn(`Error parsing line ${i + 1}:`, error);
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
        console.error('Error parsing CSV:', error);
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
            console.error(`Failed to import "${book.title}":`, error);
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
        console.error('Error importing books:', error);
        toast.error('Failed to import books');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 Import from Goodreads</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="import-modal-body">
          {!importStats ? (
            <>
              <div className="import-instructions">
                <h3>How to import from Goodreads:</h3>
                <ol>
                  <li>Go to <a href="https://www.goodreads.com/review/import" target="_blank" rel="noopener noreferrer">Goodreads Export</a></li>
                  <li>Click "Export Library" and download your CSV file</li>
                  <li>Upload the CSV file below</li>
                </ol>
              </div>

              <div className="file-upload-section">
                <label htmlFor="csv-file" className="file-upload-label">
                  <div className="file-upload-box">
                    {file ? (
                      <>
                        <span className="file-icon">📄</span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="upload-icon">📤</span>
                        <span className="upload-text">Click to select Goodreads CSV file</span>
                        <span className="upload-hint">or drag and drop</span>
                      </>
                    )}
                  </div>
                </label>
                <input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="file-input-hidden"
                />
              </div>

              {preview.length > 0 && (
                <div className="preview-section">
                  <h3>Preview (first 5 books):</h3>
                  <div className="preview-list">
                    {preview.map((book, index) => (
                      <div key={index} className="preview-item">
                        <div className="preview-title">{book.title}</div>
                        <div className="preview-author">by {book.author}</div>
                        <div className="preview-details">
                          <span className="preview-badge">{book.status}</span>
                          {book.rating && <span className="preview-rating">{'★'.repeat(book.rating)}</span>}
                          {book.tags.length > 0 && (
                            <span className="preview-tags">{book.tags.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="import-actions">
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
            <div className="import-results">
              <div className="results-icon">
                {importStats.failed === 0 ? '🎉' : '✅'}
              </div>
              <h3>Import Complete!</h3>
              <div className="results-stats">
                <div className="stat-item success">
                  <span className="stat-number">{importStats.successful}</span>
                  <span className="stat-label">Successfully Imported</span>
                </div>
                {importStats.failed > 0 && (
                  <div className="stat-item error">
                    <span className="stat-number">{importStats.failed}</span>
                    <span className="stat-label">Failed</span>
                  </div>
                )}
                <div className="stat-item">
                  <span className="stat-number">{importStats.total}</span>
                  <span className="stat-label">Total</span>
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
