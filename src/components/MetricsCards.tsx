import { DashboardMetrics } from '../types';
import { formatCurrency } from '../utils';
import { DollarSign, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Inventory Value',
      value: formatCurrency(metrics.totalInventoryValue),
      icon: DollarSign,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Total Sales',
      value: formatCurrency(metrics.totalSales),
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Low Stock Items',
      value: metrics.lowStockItems.toString(),
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
      iconBg: 'bg-amber-100',
    },
    {
      title: 'Expired Items',
      value: metrics.expiredItems.toString(),
      icon: XCircle,
      color: 'bg-red-50 text-red-600',
      iconBg: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.color} rounded-lg p-5 border border-gray-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">{card.title}</p>
              <p className="text-2xl font-bold mt-2">{card.value}</p>
            </div>
            <div className={`${card.iconBg} p-3 rounded-lg`}>
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
