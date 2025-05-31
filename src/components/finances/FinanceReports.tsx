import React, { useState, useMemo } from 'react';
import { FinanceRecord, FinanceType, TimeFrame } from '../../types';
import { FinanceService } from '../../services/financeService';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface FinanceReportsProps {
  records: FinanceRecord[];
}

export const FinanceReports: React.FC<FinanceReportsProps> = ({ records }) => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>(TimeFrame.MONTH);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const getDateRange = (frame: TimeFrame) => {
    const now = new Date();
    let start: Date;
    
    switch (frame) {
      case TimeFrame.WEEK:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case TimeFrame.MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case TimeFrame.QUARTER:
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case TimeFrame.YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(0);
    }
    
    return { start, end: now };
  };

  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    if (timeFrame !== TimeFrame.ALL) {
      const { start, end } = getDateRange(timeFrame);
      filtered = filtered.filter(record => 
        record.date >= start && record.date <= end
      );
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filtered = filtered.filter(record => 
        record.date >= start && record.date <= end
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(record => record.category === selectedCategory);
    }

    return filtered;
  }, [records, timeFrame, startDate, endDate, selectedCategory]);

  const analytics = useMemo(() => {
    const income = filteredRecords
      .filter(r => r.type === FinanceType.INCOME)
      .reduce((sum, r) => sum + r.amount, 0);
    
    const expenses = filteredRecords
      .filter(r => r.type === FinanceType.EXPENSE)
      .reduce((sum, r) => sum + r.amount, 0);

    const categoryBreakdown = filteredRecords.reduce((acc, record) => {
      const key = `${record.type}-${record.category}`;
      acc[key] = (acc[key] || 0) + record.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrends = filteredRecords.reduce((acc, record) => {
      const month = record.date.toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
      
      if (record.type === FinanceType.INCOME) {
        acc[month].income += record.amount;
      } else {
        acc[month].expenses += record.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    return {
      income,
      expenses,
      profit: income - expenses,
      categoryBreakdown,
      monthlyTrends,
      avgTransactionSize: filteredRecords.length ? 
        filteredRecords.reduce((sum, r) => sum + r.amount, 0) / filteredRecords.length : 0
    };
  }, [filteredRecords]);

  const categories = Array.from(new Set(records.map(r => r.category)));

  const timeFrameOptions = Object.values(TimeFrame).map(frame => ({
    value: frame,
    label: frame
  }));

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select
            label="Time Frame"
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
            options={timeFrameOptions}
          />
          
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          
          <Select
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={categoryOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(analytics.income)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(analytics.expenses)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
          <p className={`text-2xl font-bold ${
            analytics.profit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(analytics.profit)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Transaction</h3>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(analytics.avgTransactionSize)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analytics.categoryBreakdown)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([key, amount]) => {
                const [type, category] = key.split('-');
                const percentage = (amount / (analytics.income + analytics.expenses)) * 100;
                
                return (
                  <div key={key} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${
                        type === 'Income' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className="text-sm text-gray-600">{category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(amount)}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
          <div className="space-y-3">
            {Object.entries(analytics.monthlyTrends)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, data]) => (
                <div key={month} className="border-b border-gray-100 pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      {new Date(month + '-01').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                    <span className={`text-sm font-medium ${
                      data.income - data.expenses >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(data.income - data.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Income: {formatCurrency(data.income)}</span>
                    <span>Expenses: {formatCurrency(data.expenses)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
