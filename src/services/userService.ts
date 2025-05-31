import { doc, getDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../firebase';
import { UserModel, UserRole } from '../types';
import { AuthService } from './authService';

export class UserService {
  static async fetchCurrentUser(): Promise<UserModel> {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const data = userDoc.data();
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      groupId: data.groupId,
      role: data.role as UserRole,
      isOnline: data.isOnline,
      lastSeen: data.lastSeen?.toDate(),
    };
  }

  static async fetchUserById(userId: string): Promise<UserModel> {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const data = userDoc.data();
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      groupId: data.groupId,
      role: data.role as UserRole,
      isOnline: data.isOnline,
      lastSeen: data.lastSeen?.toDate(),
    };
  }

  static async fetchUsersByIds(userIds: string[]): Promise<UserModel[]> {
    const users: UserModel[] = [];
    
    for (const userId of userIds) {
      try {
        const user = await this.fetchUserById(userId);
        users.push(user);
      } catch (error) {
        console.warn(`Failed to fetch user ${userId}:`, error);
      }
    }
    
    return users;
  }

  static async fetchGroupMembers(groupId: string): Promise<UserModel[]> {
    const q = query(
      collection(firestore, 'users'),
      where('groupId', '==', groupId)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        groupId: data.groupId,
        role: data.role as UserRole,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen?.toDate(),
      };
    });
  }

  static async updateUserGroup(groupId: string): Promise<void> {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    await updateDoc(doc(firestore, 'users', currentUser.uid), {
      groupId: groupId,
    });
  }

  static async updateUserRole(userId: string, role: UserRole): Promise<void> {
    await updateDoc(doc(firestore, 'users', userId), {
      role: role,
    });
  }

  static async updateOnlineStatus(isOnline: boolean): Promise<void> {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;

    await updateDoc(doc(firestore, 'users', currentUser.uid), {
      isOnline: isOnline,
      lastSeen: new Date(),
    });
  }

  static async updateUserProfile(userId: string, updates: Partial<UserModel>): Promise<void> {
    const allowedUpdates = {
      name: updates.name,
      phone: updates.phone,
      email: updates.email
    };

    // Remove undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length === 0) {
      return;
    }

    await updateDoc(doc(firestore, 'users', userId), filteredUpdates);
  }

  static async searchUsers(searchTerm: string, excludeUserIds: string[] = []): Promise<UserModel[]> {
    // Note: This is a basic implementation. For production, consider using Algolia or similar
    const usersRef = collection(firestore, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserModel))
      .filter(user => 
        !excludeUserIds.includes(user.id) &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    return users.slice(0, 10); // Limit results
  }

  static async getUsersWithRole(groupId: string, role: UserRole): Promise<UserModel[]> {
    const q = query(
      collection(firestore, 'users'),
      where('groupId', '==', groupId),
      where('role', '==', role)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        groupId: data.groupId,
        role: data.role as UserRole,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen?.toDate(),
      };
    });
  }

  static async removeUserFromGroup(userId: string): Promise<void> {
    await updateDoc(doc(firestore, 'users', userId), {
      groupId: null,
      role: UserRole.MEMBER
    });
  }

  static async getOnlineUsers(groupId: string): Promise<UserModel[]> {
    const members = await this.fetchGroupMembers(groupId);
    return members.filter(user => user.isOnline);
  }

  static isAdmin(user: UserModel): boolean {
    return user.role === UserRole.ADMIN;
  }

  static canManageGroup(user: UserModel): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  }

  static canManageFinances(user: UserModel): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;
  }
}
