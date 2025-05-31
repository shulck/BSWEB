import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../hooks/redux';
import { TaskService } from '../services/taskService';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { TaskModel, TaskPriority, TaskCategory } from '../types';

export const TasksPage: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskModel | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '12:00',
    priority: TaskPriority.MEDIUM,
    category: TaskCategory.OTHER,
    assignedTo: [] as string[]
  });

  const fetchTasks = useCallback(async () => {
    if (!currentUser?.groupId) return;
    
    setIsLoading(true);
    try {
      const fetchedTasks = await TaskService.fetchTasks(currentUser.groupId);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.groupId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.groupId) return;

    const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
    
    try {
      const taskData: Omit<TaskModel, 'id'> = {
        title: formData.title,
        description: formData.description,
        dueDate: dueDateTime,
        priority: formData.priority,
        category: formData.category,
        assignedTo: formData.assignedTo.length > 0 ? formData.assignedTo : [currentUser.id],
        completed: false,
        groupId: currentUser.groupId,
        createdBy: currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingTask) {
        await TaskService.updateTask(editingTask.id!, { 
          ...taskData, 
          updatedAt: new Date() 
        });
      } else {
        await TaskService.addTask(taskData);
      }
      
      await fetchTasks();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleToggleComplete = async (task: TaskModel) => {
    try {
      await TaskService.toggleTaskCompletion(task.id!, !task.completed);
      await fetchTasks();
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  };

  const handleEdit = (task: TaskModel) => {
    setEditingTask(task);
    const dueDate = task.dueDate.toISOString().split('T')[0];
    const dueTime = task.dueDate.toTimeString().slice(0, 5);
    
    setFormData({
      title: task.title,
      description: task.description,
      dueDate,
      dueTime,
      priority: task.priority,
      category: task.category,
      assignedTo: task.assignedTo
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await TaskService.deleteTask(taskId);
        await fetchTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      dueTime: '12:00',
      priority: TaskPriority.MEDIUM,
      category: TaskCategory.OTHER,
      assignedTo: []
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const priorityOptions = Object.values(TaskPriority).map(priority => ({
    value: priority,
    label: priority
  }));

  const categoryOptions = Object.values(TaskCategory).map(category => ({
    value: category,
    label: category
  }));

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' }
  ];

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH: return 'bg-red-100 text-red-800';
      case TaskPriority.MEDIUM: return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.LOW: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isOverdue = (task: TaskModel) => {
    return !task.completed && task.dueDate < new Date();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage your band's tasks and deadlines</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            Add Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-blue-600">
              {TaskService.getPendingTasks(tasks).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {TaskService.getCompletedTasks(tasks).length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
            <p className="text-2xl font-bold text-red-600">
              {TaskService.getOverdueTasks(tasks).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
            options={filterOptions}
            className="max-w-xs"
          />
        </div>

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {tasks.length === 0 
                ? 'No tasks yet. Add your first task to get started.'
                : 'No tasks match your current filter.'
              }
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-lg font-medium ${
                            task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getPriorityColor(task.priority)
                          }`}>
                            {task.priority}
                          </span>
                          
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {task.category}
                          </span>
                          
                          {isOverdue(task) && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-gray-600 mb-2 ${task.completed ? 'line-through' : ''}`}>
                          {task.description}
                        </p>
                        
                        <div className="text-sm text-gray-500">
                          Due: {formatDate(task.dueDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id!)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={editingTask ? 'Edit Task' : 'Add New Task'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description..."
              rows={3}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />

              <Input
                label="Due Time"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                options={priorityOptions}
              />

              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TaskCategory }))}
                options={categoryOptions}
              />
            </div>

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
              <Button type="submit">
                {editingTask ? 'Update' : 'Add'} Task
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
};
