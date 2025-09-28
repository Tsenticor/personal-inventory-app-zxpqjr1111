
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
}

export interface Section {
  id: string;
  name: string;
  emoji: string;
  color: string;
  viewType: 'list' | 'grid' | 'cards';
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLog {
  id: string;
  type: 'created' | 'updated' | 'moved' | 'deleted' | 'loaned' | 'returned';
  itemId: string;
  itemName: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  deadline?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  linkedItemIds: string[];
  linkedNoteIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  query: string;
  sectionId?: string;
  priceRange?: [number, number];
  weightRange?: [number, number];
  isOnLoan?: boolean;
  sortBy: 'name' | 'createdAt' | 'price' | 'weight' | 'quantity';
  sortOrder: 'asc' | 'desc';
}
