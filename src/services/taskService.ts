import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { TaskModel, TaskPriority, TaskCategory } from '../types';

export class TaskService {
  private static COLLECTION = 'tasks';

  static async fetchTasks(groupId: string): Promise<TaskModel[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('groupId', '==', groupId),
        orderBy('dueDate')
      );

      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          assignedTo: data.assignedTo || [],
          dueDate: data.dueDate ? data.dueDate.toDate() : new Date(),
          completed: data.completed || false,
          groupId: data.groupId,
          priority: data.priority,
          category: data.category,
          attachments: data.attachments || [],
          subtasks: data.subtasks || [],
          reminders: data.reminders ? data.reminders.map((r: any) => r.toDate()) : [],
          createdBy: data.createdBy,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
        } as TaskModel;
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  static async addTask(task: Omit<TaskModel, 'id'>): Promise<string> {
    const taskData = {
      ...task,
      dueDate: Timestamp.fromDate(task.dueDate),
      createdAt: Timestamp.fromDate(task.createdAt),
      updatedAt: Timestamp.fromDate(task.updatedAt),
      reminders: task.reminders?.map(r => Timestamp.fromDate(r)) || []
    };

    const docRef = await addDoc(collection(firestore, this.COLLECTION), taskData);
    return docRef.id;
  }

  static async updateTask(taskId: string, task: Partial<TaskModel>): Promise<void> {
    const updateData = { ...task };
    
    if (task.dueDate) {
      updateData.dueDate = Timestamp.fromDate(task.dueDate) as any;
    }
    if (task.updatedAt) {
      updateData.updatedAt = Timestamp.fromDate(task.updatedAt) as any;
    }
    if (task.reminders) {
      updateData.reminders = task.reminders.map(r => Timestamp.fromDate(r)) as any;
    }

    await updateDoc(doc(firestore, this.COLLECTION, taskId), updateData);
  }

  static async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(firestore, this.COLLECTION, taskId));
  }

  static async toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
    await updateDoc(doc(firestore, this.COLLECTION, taskId), {
      completed,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  static getPendingTasks(tasks: TaskModel[]): TaskModel[] {
    return tasks.filter(task => !task.completed);
  }

  static getCompletedTasks(tasks: TaskModel[]): TaskModel[] {
    return tasks.filter(task => task.completed);
  }

  static getTasksByPriority(tasks: TaskModel[], priority: TaskPriority): TaskModel[] {
    return tasks.filter(task => task.priority === priority);
  }

  static getTasksByCategory(tasks: TaskModel[], category: TaskCategory): TaskModel[] {
    return tasks.filter(task => task.category === category);
  }

  static getOverdueTasks(tasks: TaskModel[]): TaskModel[] {
    const now = new Date();
    return tasks.filter(task => !task.completed && task.dueDate < now);
  }

  static getTasksDueSoon(tasks: TaskModel[], days: number = 7): TaskModel[] {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => 
      !task.completed && 
      task.dueDate >= now && 
      task.dueDate <= future
    );
  }
}
