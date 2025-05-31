import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../hooks/redux';
import { MainLayout } from '../components/layout/MainLayout';
import { UpcomingEventsWidget } from '../components/dashboard/UpcomingEventsWidget';
import { FinanceSummaryWidget } from '../components/dashboard/FinanceSummaryWidget';
import { TasksWidget } from '../components/dashboard/TasksWidget';
import { ActivityWidget } from '../components/dashboard/ActivityWidget';
import { EventService } from '../services/eventService';
import { FinanceService } from '../services/financeService';
import { TaskService } from '../services/taskService';
import { MerchService } from '../services/merchService';
import { GroupService } from '../services/groupService';
import { Event, FinanceRecord, TaskModel, MerchSale, MerchItem, GroupModel } from '../types';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [merchSales, setMerchSales] = useState<MerchSale[]>([]);
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [groupData, setGroupData] = useState<GroupModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser?.groupId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dashboard data for group:', currentUser.groupId);
      
      // Fetch all data in parallel
      const [
        eventsData,
        financeData,
        tasksData,
        salesData,
        itemsData,
        groupInfo
      ] = await Promise.all([
        EventService.fetchEvents(currentUser.groupId),
        FinanceService.fetchRecords(currentUser.groupId),
        TaskService.fetchTasks(currentUser.groupId),
        MerchService.fetchSales(currentUser.groupId),
        MerchService.fetchItems(currentUser.groupId),
        GroupService.fetchGroup(currentUser.groupId)
      ]);

      console.log('Events fetched:', eventsData.length);
      console.log('Finance records fetched:', financeData.length);
      console.log('Tasks fetched:', tasksData.length);
      console.log('Sales fetched:', salesData.length);
      console.log('Items fetched:', itemsData.length);
      console.log('Group data:', groupInfo);

      setEvents(eventsData);
      setFinanceRecords(financeData);
      setTasks(tasksData);
      setMerchSales(salesData);
      setMerchItems(itemsData);
      setGroupData(groupInfo);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.groupId]);

  useEffect(() => {
    if (currentUser?.groupId) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [currentUser?.groupId, fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getQuickStats = () => {
    const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
    const pendingTasks = tasks.filter(t => !t.completed).length;
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyRecords = financeRecords.filter(r => r.date >= currentMonth);
    const monthlyTotals = FinanceService.calculateTotals(monthlyRecords);
    
    // Get real group members count
    const totalMembers = groupData ? groupData.members.length : 1;

    return {
      upcomingEvents,
      pendingTasks,
      monthlyRevenue: monthlyTotals.profit,
      totalMembers
    };
  };

  const stats = getQuickStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!currentUser?.groupId) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to BandSync!</h1>
          <p className="text-gray-600 mb-6">You need to join or create a group to get started.</p>
          <button
            onClick={() => window.location.href = '/groups'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Join or Create Group
          </button>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'there'}! 👋
              </h1>
              <p className="text-blue-100 mt-1">
                Welcome back to BandSync. Here's what's happening with your band.
              </p>
              {groupData && (
                <p className="text-blue-200 text-sm mt-2">
                  Group: {groupData.name} • {groupData.members.length} members
                </p>
              )}
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-blue-100 text-sm">Today</p>
                <p className="text-lg font-semibold">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Net</p>
                <p className={`text-2xl font-semibold ${
                  stats.monthlyRevenue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(stats.monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Group Members</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingEventsWidget 
            events={events} 
            isLoading={isLoading}
          />
          
          <FinanceSummaryWidget 
            records={financeRecords} 
            isLoading={isLoading}
          />
          
          <TasksWidget 
            tasks={tasks} 
            isLoading={isLoading}
          />
          
          <ActivityWidget 
            events={events}
            financeRecords={financeRecords}
            tasks={tasks}
            merchSales={merchSales}
            items={merchItems}
            isLoading={isLoading}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/calendar'}
              className="flex items-center p-4 text-left border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Add Event</p>
                <p className="text-xs text-gray-500">Schedule a new event</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/tasks'}
              className="flex items-center p-4 text-left border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Create Task</p>
                <p className="text-xs text-gray-500">Add a new task</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/finances'}
              className="flex items-center p-4 text-left border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
            >
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Add Transaction</p>
                <p className="text-xs text-gray-500">Record income/expense</p>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/chat'}
              className="flex items-center p-4 text-left border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Open Chat</p>
                <p className="text-xs text-gray-500">Message your band</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
