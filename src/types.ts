export interface Medicine {
  id: string;
  name: string;
  supplier: string;
  price: number;
  quantity: number;
  expiryDate: string;
  plu: string;
  category: string;
}

export interface Sale {
  id: string;
  customerName: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  dateTime: string;
}

export type View = 'dashboard' | 'inventory' | 'sales' | 'expired' | 'metrics';

export interface DashboardMetrics {
  totalInventoryValue: number;
  totalSales: number;
  lowStockItems: number;
  expiredItems: number;
}