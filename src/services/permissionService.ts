import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { PermissionModel, ModulePermission, UserPermission, ModuleType, UserRole } from '../types';

export class PermissionService {
  private static COLLECTION = 'permissions';

  static async fetchPermissions(groupId: string): Promise<PermissionModel | null> {
    const q = query(
      collection(firestore, this.COLLECTION),
      where('groupId', '==', groupId)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return await this.createDefaultPermissions(groupId);
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as PermissionModel;
  }

  static async createDefaultPermissions(groupId: string): Promise<PermissionModel> {
    const defaultModules: ModulePermission[] = Object.values(ModuleType).map(moduleType => {
      let roles: UserRole[];
      
      switch (moduleType) {
        case ModuleType.ADMIN:
          roles = [UserRole.ADMIN];
          break;
        case ModuleType.FINANCES:
        case ModuleType.MERCHANDISE:
        case ModuleType.CONTACTS:
          roles = [UserRole.ADMIN, UserRole.MANAGER];
          break;
        case ModuleType.CALENDAR:
        case ModuleType.SETLISTS:
        case ModuleType.TASKS:
        case ModuleType.CHATS:
          roles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.MUSICIAN, UserRole.MEMBER];
          break;
        default:
          roles = [UserRole.ADMIN, UserRole.MANAGER, UserRole.MUSICIAN, UserRole.MEMBER];
      }

      return {
        moduleId: moduleType,
        roleAccess: roles
      };
    });

    const permissions: Omit<PermissionModel, 'id'> = {
      groupId,
      modules: defaultModules,
      userPermissions: []
    };

    const docRef = await addDoc(collection(firestore, this.COLLECTION), permissions);
    
    return {
      id: docRef.id,
      ...permissions
    };
  }

  static async updateModulePermissions(
    permissionsId: string, 
    moduleId: ModuleType, 
    roles: UserRole[]
  ): Promise<void> {
    const permissionsRef = doc(firestore, this.COLLECTION, permissionsId);
    
    // This would need to fetch current permissions, update the specific module, then save
    // For simplicity, implementing a basic version
    await updateDoc(permissionsRef, {
      [`modules.${moduleId}`]: roles
    });
  }

  static hasAccess(permissions: PermissionModel | null, moduleId: ModuleType, userRole: UserRole): boolean {
    if (!permissions) return false;
    
    // Admins always have access
    if (userRole === UserRole.ADMIN) return true;

    const modulePermission = permissions.modules.find(m => m.moduleId === moduleId);
    if (!modulePermission) return false;

    return modulePermission.roleAccess.includes(userRole);
  }

  static hasPersonalAccess(permissions: PermissionModel | null, moduleId: ModuleType, userId: string): boolean {
    if (!permissions) return false;

    const userPermission = permissions.userPermissions.find(up => up.userId === userId);
    if (!userPermission) return false;

    return userPermission.modules.includes(moduleId);
  }

  static async updateUserPermissions(
    permissionsId: string, 
    userId: string, 
    modules: ModuleType[]
  ): Promise<void> {
    // This would need a more complex implementation to update user permissions array
    // For now, a simplified version
    const permissionsRef = doc(firestore, this.COLLECTION, permissionsId);
    
    await updateDoc(permissionsRef, {
      [`userPermissions.${userId}`]: modules
    });
  }

  static getAccessibleModules(permissions: PermissionModel | null, userRole: UserRole): ModuleType[] {
    if (!permissions) return [];
    
    if (userRole === UserRole.ADMIN) {
      return Object.values(ModuleType);
    }

    return permissions.modules
      .filter(m => m.roleAccess.includes(userRole))
      .map(m => m.moduleId);
  }
}
