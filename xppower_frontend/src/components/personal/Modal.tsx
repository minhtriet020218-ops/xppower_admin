import React, { useEffect, useRef } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

/** Modal nhẹ: đóng bằng nút X, phím Esc hoặc bấm nền tối. */
export const Modal: React.FC<ModalProps> = ({ title, onClose, children, maxWidth }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="pp-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pp-modal shadow" role="dialog" aria-modal="true" aria-label={title} style={maxWidth ? { maxWidth } : undefined}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h2 className="fs-6 fw-bold m-0">{title}</h2>
          <button ref={closeRef} type="button" className="btn-close" aria-label="Đóng" onClick={onClose} />
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
};
