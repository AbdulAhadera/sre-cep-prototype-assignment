import { useState, useMemo } from 'react';
import { Medicine } from '../types';
import { getMedicineStatus, formatCurrency, isExpired } from '../utils';
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface InventoryTableProps {
  medicines: Medicine[];
  onAdd: (medicine: Omit<Medicine, 'id'>) => void;
  onUpdate: (id: string, medicine: Omit<Medicine, 'id'>) => void;
  onDelete: (id: string) => void;
  showExpiredOnly?: boolean;
}

type SortField = keyof Medicine;
type SortDirection = 'asc' | 'desc';

export default function InventoryTable({ medicines, onAdd, onUpdate, onDelete, showExpiredOnly }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    supplier: '',
    price: '',
    quantity: '',
    expiryDate: '',
    plu: '',
    category: '',
  });

  const filteredMedicines = useMemo(() => {
    let filtered = medicines;

    if (showExpiredOnly) {
      filtered = filtered.filter(med => isExpired(med.expiryDate));
    }

    if (searchTerm) {
      filtered = filtered.filter(
        med =>
          med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.plu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          med.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const multiplier = sortDirection === 'asc' ? 1 : -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * multiplier;
      }
      return ((aVal as number) - (bVal as number)) * multiplier;
    });

    return filtered;
  }, [medicines, searchTerm, sortField, sortDirection, showExpiredOnly]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: '',
      supplier: '',
      price: '',
      quantity: '',
      expiryDate: '',
      plu: '',
      category: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      supplier: medicine.supplier,
      price: medicine.price.toString(),
      quantity: medicine.quantity.toString(),
      expiryDate: medicine.expiryDate,
      plu: medicine.plu,
      category: medicine.category,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const medicineData = {
      name: formData.name,
      supplier: formData.supplier,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      expiryDate: formData.expiryDate,
      plu: formData.plu,
      category: formData.category,
    };

    if (editingMedicine) {
      onUpdate(editingMedicine.id, medicineData);
    } else {
      onAdd(medicineData);
    }

    setIsModalOpen(false);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-4 h-4 opacity-30" />;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Expired':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Low Stock':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Medicine
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  Medicine Name <SortIcon field="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('supplier')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  Supplier <SortIcon field="supplier" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('category')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  Category <SortIcon field="category" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('price')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 ml-auto">
                  Price <SortIcon field="price" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button onClick={() => handleSort('quantity')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 ml-auto">
                  Quantity <SortIcon field="quantity" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('expiryDate')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  Expiry Date <SortIcon field="expiryDate" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => handleSort('plu')} className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
                  PLU <SortIcon field="plu" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMedicines.map(medicine => {
              const status = getMedicineStatus(medicine);
              return (
                <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{medicine.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{medicine.supplier}</td>
                  <td className="px-4 py-2.5 text-gray-600">{medicine.category}</td>
                  <td className="px-4 py-2.5 text-right text-gray-800 font-medium">{formatCurrency(medicine.price)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-800 font-medium">{medicine.quantity}</td>
                  <td className="px-4 py-2.5 text-gray-600">{medicine.expiryDate}</td>
                  <td className="px-4 py-2.5 text-gray-600 font-mono text-xs">{medicine.plu}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(medicine)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${medicine.name}?`)) {
                            onDelete(medicine.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredMedicines.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No medicines found</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PLU / UPC</label>
                <input
                  type="text"
                  required
                  value={formData.plu}
                  onChange={e => setFormData({ ...formData, plu: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingMedicine ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
