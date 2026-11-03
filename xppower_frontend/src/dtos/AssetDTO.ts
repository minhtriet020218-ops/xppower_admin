export interface AssetDTO {
  id: string;
  itAssetCode: string;
  hostname: string;
  category: string;
  product: string;
  productionLine: string;
  financeAssetCode: string;
  poInvoice: string;
  serialNumber: string;
  macAddressWireless: string;
  ipAddress: string;
  computerDescription: string;
  assetStatus: 'In Stock' | 'In Use'| 'Damaged' | 'Không xác định' | 'Write off' | 'Retired' | 'Backup';
  staffCode: string;
  assignedTo?: string;
  mailUser?: string;
  department?: string;
  managedBy?: string;
  managedByGroup?: string;
  purchaseDate?: string;
  note?: string;
  /** Đường dẫn tương đối do server trả về, ví dụ /uploads/xxxx.jpg */
  imageUrl?: string | null;
}

export interface AssetFilterParams {
  searchField?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}