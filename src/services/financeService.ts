import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { FinanceRecord, FinanceType, FinanceCategory } from '../types';

export class FinanceService {
  private static COLLECTION = 'finances';

  static async fetchRecords(groupId: string): Promise<FinanceRecord[]> {
    const q = query(
      collection(firestore, this.COLLECTION),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type as FinanceType,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        details: data.details,
        date: data.date.toDate(),
        receiptUrl: data.receiptUrl,
        groupId: data.groupId
      } as FinanceRecord;
    });
  }

  static async addRecord(record: Omit<FinanceRecord, 'id'>): Promise<string> {
    const recordData = {
      ...record,
      date: Timestamp.fromDate(record.date)
    };

    const docRef = await addDoc(collection(firestore, this.COLLECTION), recordData);
    return docRef.id;
  }

  static async updateRecord(recordId: string, record: Partial<FinanceRecord>): Promise<void> {
    const updateData = { ...record };
    
    if (record.date) {
      updateData.date = Timestamp.fromDate(record.date) as any;
    }

    await updateDoc(doc(firestore, this.COLLECTION, recordId), updateData);
  }

  static async deleteRecord(recordId: string): Promise<void> {
    await deleteDoc(doc(firestore, this.COLLECTION, recordId));
  }

  static getFinanceCategoriesForType(type: FinanceType): FinanceCategory[] {
    if (type === FinanceType.INCOME) {
      return [
        FinanceCategory.PERFORMANCE,
        FinanceCategory.MERCH,
        FinanceCategory.ROYALTIES,
        FinanceCategory.SPONSORSHIP,
        FinanceCategory.MEDIA_PRODUCTION,
        FinanceCategory.OTHER
      ];
    } else {
      return [
        FinanceCategory.LOGISTICS,
        FinanceCategory.ACCOMMODATION,
        FinanceCategory.FOOD,
        FinanceCategory.GEAR,
        FinanceCategory.PROMO,
        FinanceCategory.PRODUCTION,
        FinanceCategory.OTHER
      ];
    }
  }

  static calculateTotals(records: FinanceRecord[]): { income: number; expenses: number; profit: number } {
    const income = records
      .filter(record => record.type === FinanceType.INCOME)
      .reduce((sum, record) => sum + record.amount, 0);
    
    const expenses = records
      .filter(record => record.type === FinanceType.EXPENSE)
      .reduce((sum, record) => sum + record.amount, 0);

    return {
      income,
      expenses,
      profit: income - expenses
    };
  }

  static filterRecords(
    records: FinanceRecord[],
    filters: {
      startDate?: Date;
      endDate?: Date;
      types?: FinanceType[];
      categories?: string[];
      minAmount?: number;
      maxAmount?: number;
    }
  ): FinanceRecord[] {
    return records.filter(record => {
      if (filters.startDate && record.date < filters.startDate) return false;
      if (filters.endDate && record.date > filters.endDate) return false;
      if (filters.types && filters.types.length > 0 && !filters.types.includes(record.type)) return false;
      if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(record.category)) return false;
      if (filters.minAmount !== undefined && record.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && record.amount > filters.maxAmount) return false;
      return true;
    });
  }
}
