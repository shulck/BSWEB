import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchRecords, addRecord, updateRecord, deleteRecord } from '../store/slices/financesSlice';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { FinanceRecord, FinanceType } from '../types';
import { FinanceService } from '../services/financeService';

export const FinancePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { records, isLoading, error } = useAppSelector((state) => state.finances);
  
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [formData, setFormData] = useState({
    type: FinanceType.EXPENSE,
    amount: '',
    currency: 'EUR',
    category: '',
    details: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (currentUser?.groupId) {
      dispatch(fetchRecords(currentUser.groupId));
    }
  }, [dispatch, currentUser?.groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.groupId) return;

    const recordData: Omit<FinanceRecord, 'id'> = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      details: formData.details,
      date: new Date(formData.date),
      groupId: currentUser.groupId
    };

    try {
      if (editingRecord) {
        await dispatch(updateRecord({
          recordId: editingRecord.id,
          record: recordData
        })).unwrap();
      } else {
        await dispatch(addRecord(recordData)).unwrap();
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save record:', error);
    }
  };

  const handleEdit = (record: FinanceRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      amount: record.amount.toString(),
      currency: record.currency,
      category: record.category,
      details: record.details,
      date: record.date.toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await dispatch(deleteRecord(recordId)).unwrap();
      } catch (error) {
        console.error('Failed to delete record:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData({
      type: FinanceType.EXPENSE,
      amount: '',
      currency: 'EUR',
      category: '',
      details: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const totals = FinanceService.calculateTotals(records);
  const categories = FinanceService.getFinanceCategoriesForType(formData.type);

  const typeOptions = [
    { value: FinanceType.INCOME, label: 'Income' },
    { value: FinanceType.EXPENSE, label: 'Expense' }
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat,
    label: cat
  }));

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
            <p className="text-gray-600">Track your band's income and expenses</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            Add Record
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.income, 'EUR')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.expenses, 'EUR')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Profit/Loss</h3>
            <p className={`text-2xl font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.profit, 'EUR')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Records</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : records.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No financial records yet. Add your first record to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          record.type === FinanceType.INCOME 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {record.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={record.type === FinanceType.INCOME ? 'text-green-600' : 'text-red-600'}>
                          {record.type === FinanceType.INCOME ? '+' : '-'}
                          {formatCurrency(record.amount, record.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingRecord ? 'Edit Record' : 'Add New Record'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => {
                const newType = e.target.value as FinanceType;
                setFormData(prev => ({ 
                  ...prev, 
                  type: newType,
                  category: '' // Reset category when type changes
                }));
              }}
              options={typeOptions}
            />

            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              options={[
                { value: '', label: 'Select category' },
                ...categoryOptions
              ]}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
              />

              <Input
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                placeholder="EUR"
                required
              />
            </div>

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />

            <Textarea
              label="Details"
              value={formData.details}
              onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
              placeholder="Description of the transaction..."
              rows={3}
              required
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isLoading}
              >
                {editingRecord ? 'Update' : 'Add'} Record
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};
