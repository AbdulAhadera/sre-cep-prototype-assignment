import { useState, useMemo } from 'react';
import { Medicine, Sale } from '../types';
import { formatCurrency, formatDateTime, isExpired, isLowStock } from '../utils';
import { Search, ShoppingCart } from 'lucide-react';

interface SalesTableProps {
  medicines: Medicine[];
  sales: Sale[];
  onSell: (sale: Omit<Sale, 'id' | 'dateTime'>) => void;
}

export default function SalesTable({ medicines, sales, onSell }: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    medicineId: '',
    quantity: '',
  });

  const availableMedicines = useMemo(() => {
    return medicines.filter(med => !isExpired(med.expiryDate) && med.quantity > 0);
  }, [medicines]);

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    return sales.filter(
      sale =>
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const medicine = medicines.find(m => m.id === formData.medicineId);
    if (!medicine) {
      alert('Please select a medicine');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity > medicine.quantity) {
      alert(`Insufficient stock. Available: ${medicine.quantity}`);
      return;
    }

    if (quantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }

    const saleData = {
      customerName: formData.customerName,
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity,
      price: medicine.price,
      totalAmount: medicine.price * quantity,
    };

    onSell(saleData);
    setIsModalOpen(false);
    setFormData({
      customerName: '',
      medicineId: '',
      quantity: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            New Sale
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Customer Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Medicine</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Quantity</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Unit Price</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Amount</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date/Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{sale.customerName}</td>
                  <td className="px-4 py-2.5 text-gray-600">{sale.medicineName}</td>
                  <td className="px-4 py-2.5 text-right text-gray-800 font-medium">{sale.quantity}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{formatCurrency(sale.price)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-800 font-bold">{formatCurrency(sale.totalAmount)}</td>
                  <td className="px-4 py-2.5 text-gray-600">{formatDateTime(sale.dateTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No sales recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">New Sale</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
                <select
                  required
                  value={formData.medicineId}
                  onChange={e => setFormData({ ...formData, medicineId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a medicine</option>
                  {availableMedicines.map(medicine => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.name} - {formatCurrency(medicine.price)} (Stock: {medicine.quantity})
                      {isLowStock(medicine.quantity) ? ' ⚠️' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.medicineId && formData.quantity && (
                  <p className="mt-2 text-sm text-gray-600">
                    Total: {formatCurrency(
                      (medicines.find(m => m.id === formData.medicineId)?.price || 0) * parseInt(formData.quantity || '0')
                    )}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Complete Sale
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      customerName: '',
                      medicineId: '',
                      quantity: '',
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}