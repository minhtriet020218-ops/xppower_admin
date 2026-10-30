// --- Dashboard DTO & Builder ---
export interface DashboardStatsDTO {
  totalAssets: number;
  activeAssets: number;
  departmentsCount: number;
  deviceTypesCount: number;
  departmentDistribution: { name: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  typeDistribution: { type: string; count: number }[];
}

export class DashboardStatsDTOBuilder {
  private stats: Partial<DashboardStatsDTO> = {
    departmentDistribution: [],
    statusDistribution: [],
    typeDistribution: [],
  };

  setTotals(total: number, active: number, deptCount: number, typeCount: number): this {
    this.stats.totalAssets = total;
    this.stats.activeAssets = active;
    this.stats.departmentsCount = deptCount;
    this.stats.deviceTypesCount = typeCount;
    return this;
  }

  setDepartmentDistribution(data: { name: string; count: number }[]): this {
    this.stats.departmentDistribution = data;
    return this;
  }

  setStatusDistribution(data: { status: string; count: number }[]): this {
    this.stats.statusDistribution = data;
    return this;
  }

  setTypeDistribution(data: { type: string; count: number }[]): this {
    this.stats.typeDistribution = data;
    return this;
  }

  build(): DashboardStatsDTO {
    return {
      totalAssets: this.stats.totalAssets || 0,
      activeAssets: this.stats.activeAssets || 0,
      departmentsCount: this.stats.departmentsCount || 0,
      deviceTypesCount: this.stats.deviceTypesCount || 0,
      departmentDistribution: this.stats.departmentDistribution || [],
      statusDistribution: this.stats.statusDistribution || [],
      typeDistribution: this.stats.typeDistribution || [],
    };
  }
}