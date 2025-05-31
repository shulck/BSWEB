import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';

export class ContactEventService {
  static async linkContactToEvent(contactId: string, eventId: string): Promise<void> {
    const contactRef = doc(firestore, 'contacts', contactId);
    await updateDoc(contactRef, {
      eventId: eventId,
      updatedAt: new Date()
    });
  }

  static async unlinkContactFromEvent(contactId: string): Promise<void> {
    const contactRef = doc(firestore, 'contacts', contactId);
    await updateDoc(contactRef, {
      eventId: null,
      updatedAt: new Date()
    });
  }

  static async updateContactEventInfo(
    contactId: string, 
    eventTag: string, 
    eventType: string
  ): Promise<void> {
    const contactRef = doc(firestore, 'contacts', contactId);
    await updateDoc(contactRef, {
      eventTag: eventTag || null,
      eventType: eventType || null,
      updatedAt: new Date()
    });
  }

  static async bulkUpdateContactsForEvent(
    contactIds: string[], 
    eventId: string, 
    eventTag: string,
    eventType: string
  ): Promise<void> {
    const updatePromises = contactIds.map(contactId => {
      const contactRef = doc(firestore, 'contacts', contactId);
      return updateDoc(contactRef, {
        eventId,
        eventTag,
        eventType,
        updatedAt: new Date()
      });
    });

    await Promise.all(updatePromises);
  }
}
