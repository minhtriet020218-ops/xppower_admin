import React from 'react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  pageSizeOptions?: number[];
  itemName?: string; // VD: "người dùng", "tài sản", "nhân viên"
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [10, 20, 50],
  itemName = 'bản ghi',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Tạo danh sách số trang hiển thị thông minh (có dấu ... nếu quá nhiều trang)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
      {/* Thông tin số lượng + chọn số dòng/trang */}
      <div className="d-flex align-items-center gap-3 text-muted small">
        <span>
          Hiển thị <strong>{startIndex + 1}</strong> - <strong>{endIndex}</strong> trên tổng số{' '}
          <strong>{totalItems}</strong> {itemName}
        </span>

        {onItemsPerPageChange && (
          <div className="d-flex align-items-center gap-1">
            <span>Hiển thị:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1); // Reset về trang 1 khi đổi số dòng
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Các nút chuyển trang */}
      {totalPages > 1 && (
        <nav aria-label="Pagination">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                « Trước
              </button>
            </li>

            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <li key={`ellipsis-${idx}`} className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              ) : (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => onPageChange(Number(page))}
                  >
                    {page}
                  </button>
                </li>
              )
            )}

            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau »
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};