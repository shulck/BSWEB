import React from 'react';
import { Link } from 'react-router-dom';
import { TaskModel, TaskPriority } from '../../types';

interface TasksWidgetProps {
  tasks: TaskModel[];
  isLoading?: boolean;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({
  tasks,
  isLoading = false
}) => {
  const pendingTasks = tasks.filter(task => !task.completed);
  const overdueTasks = pendingTasks.filter(task => task.dueDate < new Date());
  const dueSoonTasks = pendingTasks.filter(task => {
    const daysUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  });

  const upcomingTasks = pendingTasks
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH: return 'bg-red-100 text-red-800';
      case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.LOW: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks Overview</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Tasks Overview</h3>
        <Link
          to="/tasks"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{pendingTasks.length}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{overdueTasks.length}</p>
          <p className="text-sm text-gray-500">Overdue</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{dueSoonTasks.length}</p>
          <p className="text-sm text-gray-500">Due Soon</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Upcoming Tasks</h4>
        
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-4">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm text-gray-500 mt-2">No pending tasks</p>
            <Link
              to="/tasks"
              className="mt-1 inline-block text-sm text-blue-600 hover:text-blue-800"
            >
              Create a task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task) => {
              const isOverdue = task.dueDate < new Date();
              return (
                <div key={task.id} className={`border-l-4 pl-4 py-2 ${
                  isOverdue ? 'border-red-400' : 'border-blue-400'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {formatDueDate(task.dueDate)}
                        </span>
                        <span>{task.category}</span>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
