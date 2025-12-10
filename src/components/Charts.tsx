import { Medicine, Sale } from '../types';
import { isNearExpiry, formatCurrency } from '../utils';
import { useMemo } from 'react';

interface ChartsProps {
  medicines: Medicine[];
  sales: Sale[];
}

export default function Charts({ medicines, sales }: ChartsProps) {
  const salesByDay = useMemo(() => {
    const salesMap = new Map<string, number>();
    sales.forEach(sale => {
      const date = new Date(sale.dateTime).toLocaleDateString();
      salesMap.set(date, (salesMap.get(date) || 0) + sale.totalAmount);
    });
    return Array.from(salesMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-7);
  }, [sales]);

  const nearExpiryProducts = useMemo(() => {
    return medicines
      .filter(med => isNearExpiry(med.expiryDate) && med.quantity > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
      .slice(0, 10);
  }, [medicines]);

  const inventoryByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();
    medicines.forEach(med => {
      const currentValue = (categoryMap.get(med.category) || 0) + (med.price * med.quantity);
      categoryMap.set(med.category, currentValue);
    });
    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [medicines]);

  const maxSales = Math.max(...salesByDay.map(([, amount]) => amount), 1);
  const maxInventory = Math.max(...inventoryByCategory.map(([, value]) => value), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Over Time (Last 7 Days)</h3>
        {salesByDay.length > 0 ? (
          <div className="space-y-3">
            {salesByDay.map(([date, amount]) => (
              <div key={date} className="flex items-center gap-3">
                <div className="text-xs text-gray-600 w-24 flex-shrink-0">{date}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{ width: `${(amount / maxSales) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-white">{formatCurrency(amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No sales data available</p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Near Expiry Products (Next 90 Days)</h3>
        {nearExpiryProducts.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {nearExpiryProducts.map(med => {
              const daysUntilExpiry = Math.ceil(
                (new Date(med.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{med.name}</p>
                    <p className="text-xs text-gray-600">Qty: {med.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-amber-600">{daysUntilExpiry} days</p>
                    <p className="text-xs text-gray-500">{med.expiryDate}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No products expiring soon</p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Value by Category</h3>
        {inventoryByCategory.length > 0 ? (
          <div className="space-y-3">
            {inventoryByCategory.map(([category, value]) => (
              <div key={category} className="flex items-center gap-3">
                <div className="text-sm text-gray-700 w-32 flex-shrink-0 font-medium">{category}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end px-3 transition-all duration-500"
                    style={{ width: `${(value / maxInventory) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-white">{formatCurrency(value)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">No inventory data available</p>
        )}
      </div>
    </div>
  );
}
