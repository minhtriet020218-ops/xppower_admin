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
  computerDescription: string;
  assetStatus: 'In Stock' | 'In Use';
  staffCode: string;
  assignedTo?: string;
  mailUser?: string;
  department?: string;
  managedBy?: string;
  managedByGroup?: string;
  purchaseDate?: string;
  note?: string;
}

export interface AssetFilterParams {
  searchField?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}