import React, { useMemo } from 'react';
import { MerchItem, MerchSale, MerchCategory } from '../../types';
import { MerchService } from '../../services/merchService';

interface MerchAnalyticsProps {
  items: MerchItem[];
  sales: MerchSale[];
  timeframe?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export const MerchAnalytics: React.FC<MerchAnalyticsProps> = ({
  items,
  sales,
  timeframe = 'month'
}) => {
  const analytics = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0);
    }

    const filteredSales = timeframe === 'all' 
      ? sales 
      : sales.filter(sale => sale.date >= startDate);

    const totalRevenue = MerchService.calculateRevenue(items, filteredSales);
    const totalQuantitySold = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    const salesByCategory = filteredSales.reduce((acc, sale) => {
      const item = items.find(i => i.id === sale.itemId);
      if (item) {
        acc[item.category] = (acc[item.category] || 0) + sale.quantity;
      }
      return acc;
    }, {} as Record<MerchCategory, number>);

    const topSellingItems = MerchService.getTopSellingItems(items, filteredSales, 5);
    
    const salesByChannel = filteredSales.reduce((acc, sale) => {
      acc[sale.channel] = (acc[sale.channel] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const salesBySize = filteredSales.reduce((acc, sale) => {
      acc[sale.size] = (acc[sale.size] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    const averageOrderValue = totalQuantitySold > 0 ? totalRevenue / filteredSales.length : 0;

    return {
      totalRevenue,
      totalQuantitySold,
      totalOrders: filteredSales.length,
      averageOrderValue,
      salesByCategory,
      topSellingItems,
      salesByChannel,
      salesBySize
    };
  }, [items, sales, timeframe]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(analytics.totalRevenue)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Items Sold</h3>
          <p className="text-2xl font-bold text-blue-600">
            {analytics.totalQuantitySold}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Orders</h3>
          <p className="text-2xl font-bold text-purple-600">
            {analytics.totalOrders}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(analytics.averageOrderValue)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            {analytics.topSellingItems.map((item, index) => {
              const itemSales = sales.filter(s => s.itemId === item.id).length;
              return (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{itemSales} sales</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
          <div className="space-y-3">
            {Object.entries(analytics.salesByCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, quantity]) => {
                const percentage = (quantity / analytics.totalQuantitySold) * 100;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-gray-600">{quantity} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Channel</h3>
          <div className="space-y-3">
            {Object.entries(analytics.salesByChannel)
              .sort(([,a], [,b]) => b - a)
              .map(([channel, quantity]) => (
                <div key={channel} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{channel}</span>
                  <span className="text-sm text-gray-600">{quantity} sales</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Sizes</h3>
          <div className="space-y-3">
            {Object.entries(analytics.salesBySize)
              .sort(([,a], [,b]) => b - a)
              .map(([size, quantity]) => (
                <div key={size} className="flex justify-between items-center">
                  <span className="text-sm font-medium">Size {size}</span>
                  <span className="text-sm text-gray-600">{quantity} sold</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
