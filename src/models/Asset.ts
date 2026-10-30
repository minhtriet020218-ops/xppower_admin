export type AssetStatus = 'IN_STOCK' | 'IN_USE' | 'DAMAGED' | 'UNKNOWN' | 'WRITE_OFF' | 'RETIRED' | 'BACKUP';
export type AssetType = 'Laptop' | 'Monitor' | 'Network Device' | 'Desktop' | 'Scanner' | 'Printer' | 'Other';

export interface IAsset {
  id: string;
  assetCode: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  department: string;
  assignedTo?: string;
  purchaseDate?: string;
}

export class AssetBuilder {
  private asset: Partial<IAsset> = {};

  setId(id: string): this {
    this.asset.id = id;
    return this;
  }

  setAssetCode(code: string): this {
    this.asset.assetCode = code;
    return this;
  }

  setName(name: string): this {
    this.asset.name = name;
    return this;
  }

  setType(type: AssetType): this {
    this.asset.type = type;
    return this;
  }

  setStatus(status: AssetStatus): this {
    this.asset.status = status;
    return this;
  }

  setDepartment(department: string): this {
    this.asset.department = department;
    return this;
  }

  setAssignedTo(user: string): this {
    this.asset.assignedTo = user;
    return this;
  }

  setPurchaseDate(date: string): this {
    this.asset.purchaseDate = date;
    return this;
  }

  build(): IAsset {
    if (!this.asset.id || !this.asset.assetCode) {
      throw new Error("Missing required asset fields (id, assetCode)");
    }
    return this.asset as IAsset;
  }
}