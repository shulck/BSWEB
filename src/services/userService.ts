import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
}
