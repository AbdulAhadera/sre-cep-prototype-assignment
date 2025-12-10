import { Medicine, Sale, DashboardMetrics } from './types.ts';

export const isExpired = (expiryDate: string): boolean => {
  return new Date(expiryDate) < new Date();
};

export const isLowStock = (quantity: number): boolean => {
  return quantity < 5;
};

export const isNearExpiry = (expiryDate: string, daysThreshold: number = 90): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= daysThreshold;
};

export const getMedicineStatus = (medicine: Medicine): string => {
  if (isExpired(medicine.expiryDate)) return 'Expired';
  if (isLowStock(medicine.quantity)) return 'Low Stock';
  return 'In Stock';
};

export const calculateMetrics = (medicines: Medicine[], sales: Sale[]): DashboardMetrics => {
  const totalInventoryValue = medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0);
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const lowStockItems = medicines.filter(med => isLowStock(med.quantity) && !isExpired(med.expiryDate)).length;
  const expiredItems = medicines.filter(med => isExpired(med.expiryDate)).length;

  return {
    totalInventoryValue,
    totalSales,
    lowStockItems,
    expiredItems,
  };
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
