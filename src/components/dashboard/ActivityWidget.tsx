import React from 'react';
import { Event, FinanceRecord, TaskModel, MerchSale } from '../../types';

interface ActivityItem {
  id: string;
  type: 'event' | 'finance' | 'task' | 'merch';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

interface ActivityWidgetProps {
  events: Event[];
  financeRecords: FinanceRecord[];
  tasks: TaskModel[];
  merchSales: MerchSale[];
  items?: any[];
  isLoading?: boolean;
}

export const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  events,
  financeRecords,
  tasks,
  merchSales,
  items = [],
  isLoading = false
}) => {
  const getRecentActivity = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Recent events (created in last 30 days)
    const recentEvents = events
      .filter(event => {
        const createdDate = new Date(event.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate > thirtyDaysAgo;
      })
      .slice(0, 3);

    recentEvents.forEach(event => {
      activities.push({
        id: event.id!,
        type: 'event',
        title: 'New Event',
        description: `${event.title} scheduled`,
        timestamp: new Date(event.date),
        icon: '📅',
        color: 'text-blue-600'
      });
    });

    // Recent finance records
    const recentFinances = financeRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    recentFinances.forEach(record => {
      activities.push({
        id: record.id,
        type: 'finance',
        title: `${record.type} Added`,
        description: `€${record.amount} - ${record.category}`,
        timestamp: record.date,
        icon: record.type === 'Income' ? '💰' : '💸',
        color: record.type === 'Income' ? 'text-green-600' : 'text-red-600'
      });
    });

    // Recent completed tasks
    const recentCompletedTasks = tasks
      .filter(task => task.completed)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 2);

    recentCompletedTasks.forEach(task => {
      activities.push({
        id: task.id!,
        type: 'task',
        title: 'Task Completed',
        description: task.title,
        timestamp: task.updatedAt,
        icon: '✅',
        color: 'text-green-600'
      });
    });

    // Recent merch sales
    const recentSales = merchSales
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    recentSales.forEach(sale => {
      const item = items.find(i => i.id === sale.itemId);
      activities.push({
        id: sale.id!,
        type: 'merch',
        title: 'Merchandise Sold',
        description: `${sale.quantity}x ${item?.name || 'Item'} - Size ${sale.size}`,
        timestamp: sale.date,
        icon: '🛍️',
        color: 'text-purple-600'
      });
    });

    // Sort by timestamp and take recent 8
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const recentActivity = getRecentActivity();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>

      {recentActivity.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">No recent activity</p>
          <p className="text-xs text-gray-400 mt-1">Start using BandSync to see activity here</p>
        </div>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivity.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== recentActivity.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg">
                      {activity.icon}
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className={`font-medium ${activity.color}`}>
                            {activity.title}
                          </span>
                          {' '}
                          <span className="text-gray-600">{activity.description}</span>
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-xs text-gray-500">
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
