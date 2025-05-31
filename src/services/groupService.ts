import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { GroupModel, UserRole } from '../types';

export class GroupService {
  private static COLLECTION = 'groups';

  static async createGroup(name: string, creatorId: string): Promise<string> {
    const code = this.generateInviteCode();
    
    const groupData: Omit<GroupModel, 'id'> = {
      name,
      code,
      members: [creatorId],
      pendingMembers: []
    };

    const docRef = await addDoc(collection(firestore, this.COLLECTION), groupData);
    return docRef.id;
  }

  static async joinGroupByCode(code: string, userId: string): Promise<boolean> {
    const q = query(collection(firestore, this.COLLECTION), where('code', '==', code));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Group not found');
    }

    const groupDoc = snapshot.docs[0];
    const groupData = groupDoc.data() as GroupModel;
    
    if (groupData.members.includes(userId) || groupData.pendingMembers.includes(userId)) {
      throw new Error('Already in group or pending');
    }

    await updateDoc(doc(firestore, this.COLLECTION, groupDoc.id), {
      pendingMembers: [...groupData.pendingMembers, userId]
    });

    return true;
  }

  static async approveUser(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(firestore, this.COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupSnap.data() as GroupModel;
    
    await updateDoc(groupRef, {
      members: [...groupData.members, userId],
      pendingMembers: groupData.pendingMembers.filter(id => id !== userId)
    });
  }

  static async rejectUser(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(firestore, this.COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupSnap.data() as GroupModel;
    
    await updateDoc(groupRef, {
      pendingMembers: groupData.pendingMembers.filter(id => id !== userId)
    });
  }

  static async removeUser(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(firestore, this.COLLECTION, groupId);
    const groupSnap = await getDoc(groupRef);
    
    if (!groupSnap.exists()) {
      throw new Error('Group not found');
    }

    const groupData = groupSnap.data() as GroupModel;
    
    await updateDoc(groupRef, {
      members: groupData.members.filter(id => id !== userId)
    });
  }

  static async updateGroupName(groupId: string, newName: string): Promise<void> {
    await updateDoc(doc(firestore, this.COLLECTION, groupId), {
      name: newName
    });
  }

  static async regenerateCode(groupId: string): Promise<string> {
    const newCode = this.generateInviteCode();
    
    await updateDoc(doc(firestore, this.COLLECTION, groupId), {
      code: newCode
    });
    
    return newCode;
  }

  static async fetchGroup(groupId: string): Promise<GroupModel | null> {
    const docSnap = await getDoc(doc(firestore, this.COLLECTION, groupId));
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as GroupModel;
  }

  static subscribeToGroup(groupId: string, callback: (group: GroupModel | null) => void) {
    return onSnapshot(doc(firestore, this.COLLECTION, groupId), (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        } as GroupModel);
      } else {
        callback(null);
      }
    });
  }

  static async changeUserRole(userId: string, newRole: UserRole): Promise<void> {
    await updateDoc(doc(firestore, 'users', userId), {
      role: newRole
    });
  }

  private static generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
