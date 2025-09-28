
export interface InventoryItem {
  id: string;
  serialNumber: number;
  name: string;
  description: string;
  photo?: string;
  video?: string;
  price: number;
  weight: number;
  locationPath: string[];
  quantity: number;
  parentId?: string;
  childrenIds: string[];
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
  isOnLoan: boolean;
  loanedTo?: string;
  loanedAt?: Date;
  loanQuantity?: number; // Количество предметов на выдаче (если quantity > 1)
  tags: string[];
  barcode?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  condition: 'new' | 'excellent' | 'good' | 'fair' | 'poor';
  isArchived: boolean;
  type: 'item' | 'section'; // Унифицированный тип данных
  emoji?: string; // Для разделов
  color?: string; // Для разделов
  viewType?: 'list' | 'grid' | 'cards'; // Для разделов
  sortOrder?: number; // Для разделов
  containedItems?: string[]; // Предметы внутри этого предмета/раздела
}

// Оставляем Section для обратной совместимости, но теперь это алиас
export type Section = InventoryItem & {
  type: 'section';
  emoji: string;
  color: string;
  viewType: 'list' | 'grid' | 'cards';
  sortOrder: number;
}

export interface EventLog {
  id: string;
  type: 'created' | 'updated' | 'moved' | 'deleted' | 'loaned' | 'returned' | 'archived' | 'restored' | 'copied';
  itemId: string;
  itemName: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  userId?: string;
  fromLocation?: string;
  toLocation?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
  isRecurring: boolean;
  recurringInterval?: number;
  linkedItemIds: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  linkedItemIds: string[];
  linkedNoteIds: string[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  color: string;
  isPinned: boolean;
  isArchived: boolean;
  attachments: NoteAttachment[];
}

export interface NoteAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface SearchFilters {
  query: string;
  sectionId?: string;
  priceRange?: [number, number];
  weightRange?: [number, number];
  isOnLoan?: boolean;
  condition?: InventoryItem['condition'];
  tags?: string[];
  dateRange?: [Date, Date];
  sortBy: 'name' | 'createdAt' | 'price' | 'weight' | 'quantity' | 'serialNumber' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  includeArchived: boolean;
  includeSections?: boolean; // Include sections in search results
}

export interface MindMapNode {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  linkedItemIds: string[];
  linkedNoteIds: string[];
  parentNodeId?: string;
  childNodeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MindMapConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  color: string;
  type: 'solid' | 'dashed' | 'dotted';
  createdAt: Date;
}

export interface MindMap {
  id: string;
  title: string;
  description: string;
  nodes: MindMapNode[];
  connections: MindMapConnection[];
  createdAt: Date;
  updatedAt: Date;
  isShared: boolean;
  backgroundColor: string;
}

export interface TableSchema {
  id: string;
  name: string;
  description: string;
  columns: TableColumn[];
  rows: TableRow[];
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  linkedSectionId?: string;
}

export interface TableColumn {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'item_reference';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  width: number;
  sortOrder: number;
}

export interface TableRow {
  id: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  isCompleted?: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'one_time' | 'recurring';
  recurringPattern?: RecurringPattern;
  linkedItemIds: string[];
  linkedGoalIds: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
  occurrences?: number;
}

export interface ExportData {
  version: string;
  exportDate: Date;
  items: InventoryItem[];
  sections: Section[];
  events: EventLog[];
  goals: Goal[];
  notes: Note[];
  mindMaps: MindMap[];
  tables: TableSchema[];
  reminders: Reminder[];
  metadata: ExportMetadata;
}

export interface ExportMetadata {
  appVersion: string;
  deviceInfo: string;
  totalItems: number;
  totalSections: number;
  isEncrypted: boolean;
  checksum: string;
}

export interface ImportResult {
  success: boolean;
  itemsImported: number;
  sectionsImported: number;
  eventsImported: number;
  goalsImported: number;
  notesImported: number;
  errors: string[];
  warnings: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  weightUnit: 'kg' | 'lb' | 'g';
  dateFormat: string;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  compressionQuality: number;
  maxImageSize: number;
  enableNotifications: boolean;
  enableHaptics: boolean;
  defaultViewType: Section['viewType'];
  showSerialNumbers: boolean;
  enableLocationTracking: boolean;
}

export interface BackupInfo {
  id: string;
  name: string;
  createdAt: Date;
  size: number;
  itemCount: number;
  sectionCount: number;
  isAutomatic: boolean;
  filePath: string;
  checksum: string;
}

export interface SyncStatus {
  isEnabled: boolean;
  lastSyncDate?: Date;
  deviceId: string;
  connectedDevices: ConnectedDevice[];
  pendingChanges: number;
  conflictCount: number;
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'desktop';
  lastSeen: Date;
  isOnline: boolean;
  ipAddress: string;
}

export interface QRCodeData {
  type: 'item' | 'section' | 'export' | 'share';
  data: any;
  version: string;
  timestamp: Date;
  checksum: string;
}

export interface ShareableData {
  items: InventoryItem[];
  sections: Section[];
  includePhotos: boolean;
  includeVideos: boolean;
  isEncrypted: boolean;
  password?: string;
  expiresAt?: Date;
}

export interface LocationHistory {
  id: string;
  itemId: string;
  fromLocation: string[];
  toLocation: string[];
  movedAt: Date;
  movedBy?: string;
  reason?: string;
}

export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  defaultPrice: number;
  defaultWeight: number;
  defaultTags: string[];
  category: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface Statistics {
  totalItems: number;
  totalValue: number;
  totalWeight: number;
  itemsBySection: Record<string, number>;
  valueBySection: Record<string, number>;
  itemsByCondition: Record<string, number>;
  loanedItems: number;
  archivedItems: number;
  averageItemValue: number;
  mostExpensiveItem: InventoryItem | null;
  oldestItem: InventoryItem | null;
  newestItem: InventoryItem | null;
  topTags: Array<{ tag: string; count: number }>;
  monthlyAdditions: Array<{ month: string; count: number }>;
  goalCompletionRate: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Context menu for long press actions
export interface ContextMenuAction {
  id: string;
  title: string;
  icon: string;
  color?: string;
  destructive?: boolean;
}

export interface ContextMenuOptions {
  title?: string;
  actions: ContextMenuAction[];
}

// Quantity selection for loans
export interface LoanQuantitySelection {
  itemId: string;
  availableQuantity: number;
  selectedQuantity: number;
  loanedTo: string;
}

// Utility types for form handling
export type CreateInventoryItemData = Omit<InventoryItem, 'id' | 'serialNumber' | 'createdAt' | 'updatedAt' | 'childrenIds'>;
export type UpdateInventoryItemData = Partial<Omit<InventoryItem, 'id' | 'serialNumber' | 'createdAt'>>;
export type CreateSectionData = Omit<Section, 'id' | 'createdAt' | 'updatedAt' | 'childSectionIds'>;
export type UpdateSectionData = Partial<Omit<Section, 'id' | 'createdAt'>>;
export type CreateGoalData = Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;
export type UpdateGoalData = Partial<Omit<Goal, 'id' | 'createdAt'>>;
export type CreateNoteData = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateNoteData = Partial<Omit<Note, 'id' | 'createdAt'>>;

// Navigation types
export interface TabParamList {
  index: undefined;
  sections: undefined;
  search: { query?: string; sectionId?: string };
  loans: undefined;
  more: undefined;
}

export interface StackParamList {
  ItemDetail: { itemId: string };
  ItemEdit: { itemId?: string; sectionId?: string };
  SectionDetail: { sectionId: string };
  SectionEdit: { sectionId?: string };
  GoalDetail: { goalId: string };
  GoalEdit: { goalId?: string };
  NoteDetail: { noteId: string };
  NoteEdit: { noteId?: string };
  MindMapView: { mindMapId: string };
  MindMapEdit: { mindMapId?: string };
  TableView: { tableId: string };
  TableEdit: { tableId?: string };
  Settings: undefined;
  Backup: undefined;
  Export: undefined;
  Import: undefined;
  Statistics: undefined;
  QRScanner: undefined;
  QRGenerator: { data: QRCodeData };
}
