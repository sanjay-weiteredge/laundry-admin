import './Pagination.css';

/**
 * Reusable Pagination Component
 * 
 * @param {Number} currentPage - Current active page (1-based)
 * @param {Number} totalPages - Total number of pages
 * @param {Number} totalItems - Total number of items
 * @param {Number} itemsPerPage - Number of items per page
 * @param {Function} onPageChange - Callback function when page changes (pageNumber) => void
 * @param {String} className - Additional CSS classes
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange,
  className = '',
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage && onPageChange) {
      onPageChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          className={`pagination-btn ${i === currentPage ? 'pagination-btn--active' : ''}`}
          onClick={() => handlePageChange(i)}
          aria-label={`Go to page ${i}`}
          aria-current={i === currentPage ? 'page' : undefined}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  if (totalPages <= 1 && totalItems === 0) {
    return null;
  }

  return (
    <div className={`table-pagination ${className}`}>
      <span className="text-muted">
        Showing {startItem}-{endItem} of {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </span>
      <div className="table-pagination__buttons">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
        >
          Previous
        </button>
        {renderPageNumbers()}
        <button
          type="button"
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

