import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { Event, EventType, EventStatus } from '../types';

export class EventService {
  private static COLLECTION = 'events';

  static async fetchEvents(groupId: string): Promise<Event[]> {
    try {
      console.log('🔍 EventService: Fetching events for groupId:', groupId);
      
      const q = query(
        collection(firestore, this.COLLECTION),
        where('groupId', '==', groupId)
      );
      
      const snapshot = await getDocs(q);
      console.log('📊 EventService: Found', snapshot.size, 'events');
      
      const events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          date: data.date.toDate(),
          type: data.type as EventType,
          status: data.status as EventStatus,
          location: data.location,
          organizerName: data.organizerName,
          organizerEmail: data.organizerEmail,
          organizerPhone: data.organizerPhone,
          coordinatorName: data.coordinatorName,
          coordinatorEmail: data.coordinatorEmail,
          coordinatorPhone: data.coordinatorPhone,
          hotelName: data.hotelName,
          hotelAddress: data.hotelAddress,
          hotelCheckIn: data.hotelCheckIn?.toDate(),
          hotelCheckOut: data.hotelCheckOut?.toDate(),
          fee: data.fee,
          currency: data.currency,
          notes: data.notes,
          schedule: data.schedule,
          setlistId: data.setlistId,
          groupId: data.groupId,
          isPersonal: data.isPersonal || false,
        };
      });
      
      const sortedEvents = events.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      console.log('✅ EventService: Successfully loaded', sortedEvents.length, 'events');
      return sortedEvents;
    } catch (error) {
      console.error('❌ EventService: Error fetching events:', error);
      throw error;
    }
  }

  static async addEvent(event: Omit<Event, 'id'>): Promise<string> {
    try {
      console.log('➕ EventService: Adding event:', {
        title: event.title,
        date: event.date,
        type: event.type,
        groupId: event.groupId
      });
      
      // Убедимся что у нас есть все обязательные поля
      if (!event.title || !event.date || !event.groupId) {
        throw new Error('Missing required fields: title, date, or groupId');
      }
      
      const eventData = {
        ...event,
        date: Timestamp.fromDate(event.date),
        hotelCheckIn: event.hotelCheckIn ? Timestamp.fromDate(event.hotelCheckIn) : null,
        hotelCheckOut: event.hotelCheckOut ? Timestamp.fromDate(event.hotelCheckOut) : null,
        // Убедимся что все поля определены
        title: event.title,
        type: event.type,
        status: event.status,
        groupId: event.groupId,
        isPersonal: event.isPersonal || false,
        location: event.location || null,
        organizerName: event.organizerName || null,
        organizerEmail: event.organizerEmail || null,
        organizerPhone: event.organizerPhone || null,
        coordinatorName: event.coordinatorName || null,
        coordinatorEmail: event.coordinatorEmail || null,
        coordinatorPhone: event.coordinatorPhone || null,
        hotelName: event.hotelName || null,
        hotelAddress: event.hotelAddress || null,
        fee: event.fee || null,
        currency: event.currency || 'USD',
        notes: event.notes || null,
        schedule: event.schedule || null,
        setlistId: event.setlistId || null,
      };

      console.log('💾 EventService: Saving to Firestore:', eventData);
      
      const docRef = await addDoc(collection(firestore, this.COLLECTION), eventData);
      
      console.log('✅ EventService: Event saved with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ EventService: Error adding event:', error);
      throw error;
    }
  }

  static async updateEvent(eventId: string, event: Partial<Event>): Promise<void> {
    try {
      console.log('✏️ EventService: Updating event:', eventId, event);
      
      const eventData = {
        ...event,
        date: event.date ? Timestamp.fromDate(event.date) : undefined,
        hotelCheckIn: event.hotelCheckIn ? Timestamp.fromDate(event.hotelCheckIn) : null,
        hotelCheckOut: event.hotelCheckOut ? Timestamp.fromDate(event.hotelCheckOut) : null,
      };

      await updateDoc(doc(firestore, this.COLLECTION, eventId), eventData);
      console.log('✅ EventService: Event updated successfully');
    } catch (error) {
      console.error('❌ EventService: Error updating event:', error);
      throw error;
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      console.log('🗑️ EventService: Deleting event:', eventId);
      
      await deleteDoc(doc(firestore, this.COLLECTION, eventId));
      
      console.log('✅ EventService: Event deleted successfully');
    } catch (error) {
      console.error('❌ EventService: Error deleting event:', error);
      throw error;
    }
  }

  static getEventsForDate(events: Event[], date: Date): Event[] {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  static getUpcomingEvents(events: Event[], limit: number = 5): Event[] {
    const now = new Date();
    return events
      .filter(event => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }
}
