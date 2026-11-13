import { useState, useMemo, useEffect } from 'react';

export function usePagination<T>(items: T[], initialItemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialItemsPerPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Tự động lùi trang nếu xóa hết dữ liệu ở trang cuối
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [items.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, startIndex, itemsPerPage]);

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedItems,
    startIndex,
    totalItems: items.length,
  };
}