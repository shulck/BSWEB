// Enums
export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager", 
  MUSICIAN = "Musician",
  MEMBER = "Member"
}

export enum EventType {
  CONCERT = "Concert",
  FESTIVAL = "Festival",
  REHEARSAL = "Rehearsal",
  MEETING = "Meeting",
  INTERVIEW = "Interview",
  PHOTOSHOOT = "Photoshoot",
  PERSONAL = "Personal"
}

export enum EventStatus {
  BOOKED = "Reserved",
  CONFIRMED = "Confirmed"
}

export enum FinanceType {
  INCOME = "Income",
  EXPENSE = "Expense"
}

export enum FinanceCategory {
  // Expenses
  LOGISTICS = "Logistics",
  ACCOMMODATION = "Accommodation",
  FOOD = "Food",
  GEAR = "Equipment",
  PROMO = "Promotion",
  PRODUCTION = "Video/Photo Production",
  OTHER = "Other",
  // Income
  PERFORMANCE = "Performances",
  MERCH = "Merchandise",
  ROYALTIES = "Royalties",
  SPONSORSHIP = "Sponsorship",
  MEDIA_PRODUCTION = "Media Production"
}

export enum ChatType {
  GROUP = "group",
  DIRECT = "direct"
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  LINK = "link"
}

export enum TaskPriority {
  HIGH = "High",
  MEDIUM = "Medium", 
  LOW = "Low"
}

export enum TaskCategory {
  REHEARSAL = "Rehearsal",
  CONCERT = "Concert",
  ORGANIZATION = "Organization",
  EQUIPMENT = "Equipment",
  PROMOTION = "Promotion",
  RECORDING = "Recording",
  PHOTO_VIDEO = "Photo & Video",
  OTHER = "Other"
}

export enum MerchCategory {
  CLOTHING = "Clothing",
  MUSIC = "Music",
  ACCESSORY = "Accessories",
  OTHER = "Other"
}

export enum MerchSubcategory {
  // Clothing
  TSHIRT = "T-shirt",
  HOODIE = "Hoodie",
  JACKET = "Jacket",
  CAP = "Cap",
  // Music
  VINYL = "Vinyl Record",
  CD = "CD",
  TAPE = "Tape",
  // Accessories
  POSTER = "Poster",
  STICKER = "Sticker",
  PIN = "Pin",
  KEYCHAIN = "Keychain"
}

export enum MerchSaleChannel {
  CONCERT = "Concert",
  ONLINE = "Online",
  STORE = "Store",
  GIFT = "Gift",
  OTHER = "Other"
}

export enum ModuleType {
  CALENDAR = "calendar",
  SETLISTS = "setlists",
  FINANCES = "finances",
  MERCHANDISE = "merchandise",
  TASKS = "tasks",
  CHATS = "chats",
  CONTACTS = "contacts",
  ADMIN = "admin"
}

export enum TimeFrame {
  WEEK = "Week",
  MONTH = "Month",
  QUARTER = "Quarter",
  YEAR = "Year",
  ALL = "All time"
}

// Interfaces
export interface UserModel {
  id: string;
  email: string;
  name: string;
  phone: string;
  groupId?: string;
  role: UserRole;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface GroupModel {
  id?: string;
  name: string;
  code: string;
  members: string[];
  pendingMembers: string[];
}

export interface Event {
  id?: string;
  title: string;
  date: Date;
  type: EventType;
  status: EventStatus;
  location?: string;
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  coordinatorPhone?: string;
  hotelName?: string;
  hotelAddress?: string;
  hotelCheckIn?: Date;
  hotelCheckOut?: Date;
  fee?: number;
  currency?: string;
  notes?: string;
  schedule?: string[];
  setlistId?: string;
  groupId: string;
  isPersonal: boolean;
}

export interface FinanceRecord {
  id: string;
  type: FinanceType;
  amount: number;
  currency: string;
  category: string;
  details: string;
  date: Date;
  receiptUrl?: string;
  groupId: string;
}

export interface Chat {
  id?: string;
  name: string;
  type: ChatType;
  participants: Record<string, boolean>;
  lastMessage?: string;
  lastMessageTime?: Date;
}

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  timestamp: Date;
  replyTo?: string;
  seenBy: string[];
  deliveredTo: string[];
  isEdited: boolean;
}

export interface GroupChatModel {
  groupId: string;
  bandId: string;
  adminId: string;
  groupName: string;
  members: string[];
  lastMessage: string;
  lastMessageSenderId: string;
  lastMessageTime: number;
}

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  groupId: string;
  eventTag?: string;
  eventType?: string;
}

export interface TaskModel {
  id?: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: Date;
  completed: boolean;
  groupId: string;
  priority: TaskPriority;
  category: TaskCategory;
  attachments?: string[];
  subtasks?: Subtask[];
  reminders?: Date[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface MerchSizeStock {
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface MerchItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: MerchCategory;
  subcategory?: MerchSubcategory;
  stock: MerchSizeStock;
  groupId: string;
  lowStockThreshold: number;
  sku?: string;
  cost?: number;
  imageURL?: string;
  imageUrls?: string[];
  updatedAt?: Date;
}

export interface MerchSale {
  id?: string;
  itemId: string;
  size: string;
  quantity: number;
  date: Date;
  channel: MerchSaleChannel;
  groupId: string;
}

export interface Song {
  id: string;
  title: string;
  durationMinutes: number;
  durationSeconds: number;
  bpm: number;
  key?: string;
  startTime?: Date;
}

export interface Setlist {
  id?: string;
  name: string;
  userId: string;
  groupId: string;
  isShared: boolean;
  songs: Song[];
  concertDate?: Date;
}

export interface PermissionModel {
  id?: string;
  groupId: string;
  modules: ModulePermission[];
  userPermissions: UserPermission[];
}

export interface ModulePermission {
  moduleId: ModuleType;
  roleAccess: UserRole[];
}

export interface UserPermission {
  userId: string;
  modules: ModuleType[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

// Helper functions
export const getEventTypeColor = (type: EventType): string => {
  const colors = {
    [EventType.CONCERT]: '#E63946',
    [EventType.FESTIVAL]: '#FFB703',
    [EventType.REHEARSAL]: '#2A9D8F',
    [EventType.MEETING]: '#457B9D',
    [EventType.INTERVIEW]: '#8338EC',
    [EventType.PHOTOSHOOT]: '#FF006E',
    [EventType.PERSONAL]: '#A8DADC',
  };
  return colors[type] || '#A8DADC';
};

export const getEventStatusColor = (status: EventStatus): string => {
  return status === EventStatus.CONFIRMED ? '#34C759' : '#FF3B30';
};
