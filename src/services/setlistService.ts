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
import { Setlist, Song } from '../types';

export class SetlistService {
  private static COLLECTION = 'setlists';

  static async fetchSetlists(groupId: string): Promise<Setlist[]> {
    const q = query(
      collection(firestore, this.COLLECTION),
      where('groupId', '==', groupId)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        userId: data.userId,
        groupId: data.groupId,
        isShared: data.isShared,
        songs: data.songs,
        concertDate: data.concertDate?.toDate()
      } as Setlist;
    });
  }

  static async addSetlist(setlist: Omit<Setlist, 'id'>): Promise<string> {
    const setlistData = {
      ...setlist,
      concertDate: setlist.concertDate ? Timestamp.fromDate(setlist.concertDate) : null
    };

    const docRef = await addDoc(collection(firestore, this.COLLECTION), setlistData);
    return docRef.id;
  }

  static async updateSetlist(setlistId: string, setlist: Partial<Setlist>): Promise<void> {
    const updateData = { ...setlist };
    
    if (setlist.concertDate) {
      updateData.concertDate = Timestamp.fromDate(setlist.concertDate) as any;
    }

    await updateDoc(doc(firestore, this.COLLECTION, setlistId), updateData);
  }

  static async deleteSetlist(setlistId: string): Promise<void> {
    await deleteDoc(doc(firestore, this.COLLECTION, setlistId));
  }

  static calculateTotalDuration(songs: Song[]): number {
    return songs.reduce((total, song) => {
      return total + (song.durationMinutes * 60) + song.durationSeconds;
    }, 0);
  }

  static formatDuration(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  static addSongToSetlist(setlist: Setlist, song: Song): Setlist {
    return {
      ...setlist,
      songs: [...setlist.songs, song]
    };
  }

  static removeSongFromSetlist(setlist: Setlist, songId: string): Setlist {
    return {
      ...setlist,
      songs: setlist.songs.filter(song => song.id !== songId)
    };
  }

  static reorderSongs(setlist: Setlist, startIndex: number, endIndex: number): Setlist {
    const songs = [...setlist.songs];
    const [removed] = songs.splice(startIndex, 1);
    songs.splice(endIndex, 0, removed);

    return {
      ...setlist,
      songs
    };
  }
}
