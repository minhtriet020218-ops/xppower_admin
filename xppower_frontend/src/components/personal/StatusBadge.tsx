import React from 'react';
import type { RequestStatus } from '../../dtos/PersonalDTO';

const CLASS_BY_STATUS: Record<RequestStatus, string> = {
  'Chờ duyệt': 'text-bg-warning',
  'Đã duyệt': 'text-bg-success',
  'Từ chối': 'text-bg-danger',
};

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => (
  <span className={`badge rounded-pill ${CLASS_BY_STATUS[status] ?? 'text-bg-secondary'}`}>{status}</span>
);
