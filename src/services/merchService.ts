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
import { MerchItem, MerchSale, MerchCategory, MerchSaleChannel, MerchSizeStock } from '../types';

export class MerchService {
  private static ITEMS_COLLECTION = 'merchandise';
  private static SALES_COLLECTION = 'merch_sales';

  static async fetchItems(groupId: string): Promise<MerchItem[]> {
    const q = query(
      collection(firestore, this.ITEMS_COLLECTION),
      where('groupId', '==', groupId)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
      } as MerchItem;
    });
  }

  static async fetchSales(groupId: string): Promise<MerchSale[]> {
    const q = query(
      collection(firestore, this.SALES_COLLECTION),
      where('groupId', '==', groupId)
    );

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date ? data.date.toDate() : new Date()
      } as MerchSale;
    });
  }

  static async addItem(item: Omit<MerchItem, 'id'>): Promise<string> {
    const itemData = {
      ...item,
      updatedAt: Timestamp.fromDate(new Date())
    };

    const docRef = await addDoc(collection(firestore, this.ITEMS_COLLECTION), itemData);
    return docRef.id;
  }

  static async updateItem(itemId: string, item: Partial<MerchItem>): Promise<void> {
    const updateData = {
      ...item,
      updatedAt: Timestamp.fromDate(new Date())
    };

    await updateDoc(doc(firestore, this.ITEMS_COLLECTION, itemId), updateData);
  }

  static async deleteItem(itemId: string): Promise<void> {
    await deleteDoc(doc(firestore, this.ITEMS_COLLECTION, itemId));
    
    const salesQ = query(
      collection(firestore, this.SALES_COLLECTION),
      where('itemId', '==', itemId)
    );
    
    const salesSnapshot = await getDocs(salesQ);
    const deletePromises = salesSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
  }

  static async recordSale(sale: Omit<MerchSale, 'id'>): Promise<string> {
    const saleData = {
      ...sale,
      date: Timestamp.fromDate(sale.date)
    };

    const docRef = await addDoc(collection(firestore, this.SALES_COLLECTION), saleData);
    return docRef.id;
  }

  static async updateStock(itemId: string, newStock: MerchSizeStock): Promise<void> {
    await updateDoc(doc(firestore, this.ITEMS_COLLECTION, itemId), {
      stock: newStock,
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  static calculateTotalStock(stock: MerchSizeStock): number {
    return stock.S + stock.M + stock.L + stock.XL + stock.XXL;
  }

  static isLowStock(item: MerchItem): boolean {
    const totalStock = this.calculateTotalStock(item.stock);
    
    if (item.category === MerchCategory.CLOTHING) {
      return (
        (item.stock.S > 0 && item.stock.S <= item.lowStockThreshold) ||
        (item.stock.M > 0 && item.stock.M <= item.lowStockThreshold) ||
        (item.stock.L > 0 && item.stock.L <= item.lowStockThreshold) ||
        (item.stock.XL > 0 && item.stock.XL <= item.lowStockThreshold) ||
        (item.stock.XXL > 0 && item.stock.XXL <= item.lowStockThreshold) ||
        totalStock === 0
      );
    } else {
      return totalStock <= item.lowStockThreshold;
    }
  }

  static getLowStockItems(items: MerchItem[]): MerchItem[] {
    return items.filter(item => this.isLowStock(item));
  }

  static getTopSellingItems(items: MerchItem[], sales: MerchSale[], limit: number = 5): MerchItem[] {
    const salesByItem = sales.reduce((acc, sale) => {
      acc[sale.itemId] = (acc[sale.itemId] || 0) + sale.quantity;
      return acc;
    }, {} as Record<string, number>);

    return items
      .sort((a, b) => (salesByItem[b.id!] || 0) - (salesByItem[a.id!] || 0))
      .slice(0, limit);
  }

  static calculateRevenue(items: MerchItem[], sales: MerchSale[]): number {
    return sales.reduce((total, sale) => {
      if (sale.channel === MerchSaleChannel.GIFT) return total;
      
      const item = items.find(item => item.id === sale.itemId);
      if (item) {
        total += item.price * sale.quantity;
      }
      return total;
    }, 0);
  }

  static getSalesByPeriod(sales: MerchSale[], startDate: Date, endDate: Date): MerchSale[] {
    return sales.filter(sale => 
      sale.date >= startDate && sale.date <= endDate
    );
  }

  static getSalesByCategory(items: MerchItem[], sales: MerchSale[], category: MerchCategory): MerchSale[] {
    const categoryItemIds = items
      .filter(item => item.category === category)
      .map(item => item.id!);
    
    return sales.filter(sale => categoryItemIds.includes(sale.itemId));
  }
}
