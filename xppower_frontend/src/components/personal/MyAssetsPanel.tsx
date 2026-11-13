import React, { useMemo } from 'react';
import type { AssetDTO } from '../../dtos/AssetDTO';
import { formatDateVN } from '../../utils/personalDate';

interface MyAssetsPanelProps {
  owned: AssetDTO[];
  managed: AssetDTO[];
  loading: boolean;
  error: string | null;
}

const statusClass = (status: string): string => {
  if (status === 'In Use') return 'bg-success';
  if (status === 'Damaged') return 'bg-danger';
  if (status === 'In Stock' || status === 'Backup') return 'bg-secondary';
  return 'bg-dark';
};

const uniqueNonEmpty = (values: Array<string | undefined | null>): string[] =>
  Array.from(new Set(values.map((v) => (v ?? '').trim()).filter(Boolean)));

const formatPurchaseDate = (v?: string): string => (v && /^\d{4}-\d{2}-\d{2}/.test(v) ? formatDateVN(v.slice(0, 10)) : v || '-');

const EmptyLine: React.FC<{ text: string }> = ({ text }) => <div className="text-muted small">{text}</div>;

export const MyAssetsPanel: React.FC<MyAssetsPanelProps> = ({ owned, managed, loading, error }) => {
  const lines = useMemo(() => uniqueNonEmpty(managed.map((a) => a.productionLine)), [managed]);
  const groups = useMemo(() => uniqueNonEmpty(managed.map((a) => a.managedByGroup)), [managed]);

  return (
    <section className="pp-panel pp-panel-blue" aria-label="Thiết bị được quản lý">
      <div className="pp-panel-head fs-5">Thiết bị được quản lý</div>
      <div className="pp-panel-body d-flex flex-column gap-3">
        {error && <div className="alert alert-danger py-2 small m-0" role="alert">{error}</div>}

        <div className="pp-panel pp-panel-blue">
          <div className="pp-panel-head fs-6">Thiết bị cá nhân</div>
          <div className="pp-panel-body">
            {loading && <div className="spinner-border spinner-border-sm text-primary" role="status" aria-label="Đang tải" />}
            {!loading && owned.length === 0 && <EmptyLine text="Bạn chưa được cấp thiết bị nào." />}
            {owned.map((a) => (
              <article key={a.id} className="pp-asset">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <h3 className="fs-6 fw-bold m-0 text-primary-emphasis">{a.itAssetCode}</h3>
                  <span className={`badge rounded-pill ${statusClass(a.assetStatus)}`}>{a.assetStatus}</span>
                </div>
                <div className="pp-asset-meta">
                  <div>Loại: {a.category || '-'}</div>
                  <div>Serial: {a.serialNumber || '-'}</div>
                  <div>FA: {a.financeAssetCode || '-'}</div>
                  <div>PO: {a.poInvoice || '-'}</div>
                  <div>Mô tả: {a.computerDescription || '-'}</div>
                  <div>Ngày cấp: {formatPurchaseDate(a.purchaseDate)}</div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="pp-panel pp-panel-blue">
          <div className="pp-panel-head fs-6">Line tôi quản lý</div>
          <div className="pp-panel-body">
            {lines.length === 0 ? (
              <EmptyLine text="Không có line nào" />
            ) : (
              <ul className="list-unstyled m-0 d-flex flex-wrap gap-2">
                {lines.map((l) => <li key={l} className="badge text-bg-light border fw-semibold">{l}</li>)}
              </ul>
            )}
          </div>
        </div>

        <div className="pp-panel pp-panel-blue">
          <div className="pp-panel-head fs-6">Group line tôi quản lý</div>
          <div className="pp-panel-body">
            {groups.length === 0 ? (
              <EmptyLine text="Không có group nào" />
            ) : (
              <ul className="list-unstyled m-0 d-flex flex-wrap gap-2">
                {groups.map((g) => <li key={g} className="badge text-bg-light border fw-semibold">{g}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
