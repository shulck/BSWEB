import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { Contact } from '../types';

export class ContactService {
  private static COLLECTION = 'contacts';

  static async fetchContacts(groupId: string): Promise<Contact[]> {
    const q = query(
      collection(firestore, this.COLLECTION),
      where('groupId', '==', groupId)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Contact));
  }

  static async addContact(contact: Omit<Contact, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(firestore, this.COLLECTION), contact);
    return docRef.id;
  }

  static async updateContact(contactId: string, contact: Partial<Contact>): Promise<void> {
    await updateDoc(doc(firestore, this.COLLECTION, contactId), contact);
  }

  static async deleteContact(contactId: string): Promise<void> {
    await deleteDoc(doc(firestore, this.COLLECTION, contactId));
  }

  static getContactsForEvent(contacts: Contact[], eventTag: string): Contact[] {
    return contacts.filter(contact => contact.eventTag === eventTag);
  }

  static getUniqueEventTags(contacts: Contact[]): string[] {
    const tags = contacts
      .map(contact => contact.eventTag)
      .filter((tag): tag is string => Boolean(tag));
    
    return Array.from(new Set(tags)).sort();
  }

  static getContactsByRole(contacts: Contact[], role: string): Contact[] {
    return contacts.filter(contact => contact.role === role);
  }
}
