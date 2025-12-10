import { useState, useEffect } from 'react';
import { Medicine, Sale, View } from './types.ts';
import { initialMedicines } from './data';
import { calculateMetrics, generateId, isExpired, isLowStock } from './utils.ts';
import MetricsCards from './components/MetricsCards';
import Charts from './components/Charts.tsx';
import InventoryTable from './components/InventoryTable.tsx';
import SalesTable from './components/SalesTable.tsx';
import { LayoutDashboard, Package, ShoppingBag, AlertCircle, BarChart3 } from 'lucide-react';

function App() {
  const [medicines, setMedicines] = useState<Medicine[]>(initialMedicines);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showAlert, setShowAlert] = useState(true);

  const metrics = calculateMetrics(medicines, sales);
  const lowStockItems = medicines.filter(med => isLowStock(med.quantity) && !isExpired(med.expiryDate));
  const expiredItems = medicines.filter(med => isExpired(med.expiryDate));

  useEffect(() => {
    if (showAlert && (lowStockItems.length > 0 || expiredItems.length > 0)) {
      const messages = [];
      if (lowStockItems.length > 0) {
        messages.push(`${lowStockItems.length} item(s) are low in stock`);
      }
      if (expiredItems.length > 0) {
        messages.push(`${expiredItems.length} item(s) have expired`);
      }
      alert('⚠️ ALERTS:\n\n' + messages.join('\n'));
      setShowAlert(false);
    }
  }, []);

  const handleAddMedicine = (medicineData: Omit<Medicine, 'id'>) => {
    const newMedicine: Medicine = {
      ...medicineData,
      id: generateId(),
    };
    setMedicines([...medicines, newMedicine]);
  };

  const handleUpdateMedicine = (id: string, medicineData: Omit<Medicine, 'id'>) => {
    setMedicines(medicines.map(med => (med.id === id ? { ...medicineData, id } : med)));
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines(medicines.filter(med => med.id !== id));
  };

  const handleSell = (saleData: Omit<Sale, 'id' | 'dateTime'>) => {
    const medicine = medicines.find(m => m.id === saleData.medicineId);
    if (!medicine || medicine.quantity < saleData.quantity) {
      alert('Error: Insufficient stock');
      return;
    }

    const newSale: Sale = {
      ...saleData,
      id: generateId(),
      dateTime: new Date().toISOString(),
    };

    setSales([newSale, ...sales]);
    setMedicines(
      medicines.map(med =>
        med.id === saleData.medicineId ? { ...med, quantity: med.quantity - saleData.quantity } : med
      )
    );

    alert(`Sale completed successfully!\nTotal: $${saleData.totalAmount.toFixed(2)}`);
  };

  const navigation = [
    { id: 'dashboard' as View, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as View, name: 'Inventory', icon: Package },
    { id: 'sales' as View, name: 'Sales', icon: ShoppingBag },
    { id: 'expired' as View, name: 'Expired Products', icon: AlertCircle },
    { id: 'metrics' as View, name: 'Metrics & Charts', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Ahad Medical Store</h1>
              <p className="text-sm text-gray-600 mt-0.5">Inventory & Sales Management System</p>
            </div>
            <div className="flex gap-2">
              {metrics.lowStockItems > 0 && (
                <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-amber-200">
                  {metrics.lowStockItems} Low Stock
                </div>
              )}
              {metrics.expiredItems > 0 && (
                <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200">
                  {metrics.expiredItems} Expired
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {navigation.map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  currentView === item.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard' && (
          <div>
            <MetricsCards metrics={metrics} />
            <Charts medicines={medicines} sales={sales} />
          </div>
        )}

        {currentView === 'inventory' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Medicine Inventory</h2>
            <InventoryTable
              medicines={medicines}
              onAdd={handleAddMedicine}
              onUpdate={handleUpdateMedicine}
              onDelete={handleDeleteMedicine}
            />
          </div>
        )}

        {currentView === 'sales' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sales Management</h2>
            <SalesTable medicines={medicines} sales={sales} onSell={handleSell} />
          </div>
        )}

        {currentView === 'expired' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Expired Products</h2>
            <InventoryTable
              medicines={medicines}
              onAdd={handleAddMedicine}
              onUpdate={handleUpdateMedicine}
              onDelete={handleDeleteMedicine}
              showExpiredOnly
            />
          </div>
        )}

        {currentView === 'metrics' && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Metrics & Analysis</h2>
            <MetricsCards metrics={metrics} />
            <Charts medicines={medicines} sales={sales} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600">
            © 2024 Ahad Medical Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;