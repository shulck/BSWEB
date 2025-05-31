import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { RegisterData, UserRole } from '../types';

export class AuthService {
  static async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  static async register(userData: RegisterData): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    
    // Создаем документ пользователя в Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      id: user.uid,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      groupId: null,
      role: UserRole.MEMBER,
      isOnline: true,
      lastSeen: new Date(),
    });

    return user;
  }

  static async logout(): Promise<void> {
    await signOut(auth);
  }

  static async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  static isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }
}
