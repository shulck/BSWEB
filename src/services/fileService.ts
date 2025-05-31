import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export class FileService {
  static async uploadFile(file: File, path: string): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const fileRef = ref(storage, `${path}/${fileName}`);
    
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  }

  static async uploadChatFile(file: File, chatId: string): Promise<string> {
    return this.uploadFile(file, `chats/${chatId}/files`);
  }

  static async uploadChatImage(file: File, chatId: string): Promise<string> {
    return this.uploadFile(file, `chats/${chatId}/images`);
  }

  static async uploadReceiptFile(file: File, groupId: string): Promise<string> {
    return this.uploadFile(file, `finances/${groupId}/receipts`);
  }

  static async uploadMerchImage(file: File, groupId: string): Promise<string> {
    return this.uploadFile(file, `merchandise/${groupId}/images`);
  }

  static getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  static isImage(fileName: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExtensions.includes(this.getFileExtension(fileName));
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
