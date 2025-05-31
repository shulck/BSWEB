import React from 'react';
import { Link } from 'react-router-dom';
import { FinanceRecord, FinanceType } from '../../types';
import { FinanceService } from '../../services/financeService';

interface FinanceSummaryWidgetProps {
  records: FinanceRecord[];
  isLoading?: boolean;
}

export const FinanceSummaryWidget: React.FC<FinanceSummaryWidgetProps> = ({
  records,
  isLoading = false
}) => {
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  
  const thisMonthRecords = records.filter(record => 
    record.date >= currentMonth
  );

  const totals = FinanceService.calculateTotals(records);
  const monthlyTotals = FinanceService.calculateTotals(thisMonthRecords);

  const recentTransactions = records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Financial Summary</h3>
        <Link
          to="/finances"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View details
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Monthly Income</p>
          <p className="text-lg font-semibold text-green-600">
            {formatCurrency(monthlyTotals.income)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Monthly Expenses</p>
          <p className="text-lg font-semibold text-red-600">
            {formatCurrency(monthlyTotals.expenses)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">Net Profit</p>
          <p className={`text-lg font-semibold ${
            monthlyTotals.profit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(monthlyTotals.profit)}
          </p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Transactions</h4>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No transactions yet</p>
            <Link
              to="/finances"
              className="mt-1 inline-block text-sm text-blue-600 hover:text-blue-800"
            >
              Add your first transaction
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((record) => (
              <div key={record.id} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.type === FinanceType.INCOME 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.type}
                    </span>
                    <span className="text-sm text-gray-900 truncate max-w-24">
                      {record.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {record.details}
                  </p>
                </div>
                
                <div className="text-right ml-4">
                  <p className={`text-sm font-medium ${
                    record.type === FinanceType.INCOME ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {record.type === FinanceType.INCOME ? '+' : '-'}
                    {formatCurrency(record.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(record.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4 mt-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Total Income</p>
            <p className="text-sm font-semibold text-green-600">
              {formatCurrency(totals.income)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Expenses</p>
            <p className="text-sm font-semibold text-red-600">
              {formatCurrency(totals.expenses)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
