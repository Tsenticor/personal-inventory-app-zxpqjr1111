
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  InventoryItem, 
  Section, 
  EventLog, 
  Goal, 
  Note, 
  MindMap,
  TableSchema,
  Reminder,
  AppSettings,
  BackupInfo,
  ItemTemplate,
  Statistics,
  LocationHistory
} from '../types/inventory';
import { colors } from '../styles/commonStyles';
import uuid from 'react-native-uuid';

const STORAGE_KEYS = {
  ITEMS: 'inventory_items',
  SECTIONS: 'inventory_sections',
  EVENTS: 'inventory_events',
  GOALS: 'inventory_goals',
  NOTES: 'inventory_notes',
  MIND_MAPS: 'inventory_mind_maps',
  TABLES: 'inventory_tables',
  REMINDERS: 'inventory_reminders',
  TEMPLATES: 'inventory_templates',
  LOCATION_HISTORY: 'inventory_location_history',
  SETTINGS: 'app_settings',
  BACKUPS: 'backup_info',
  SERIAL_COUNTER: 'serial_counter',
};

class StorageService {
  // Serial number management
  async getNextSerialNumber(): Promise<number> {
    try {
      const counter = await AsyncStorage.getItem(STORAGE_KEYS.SERIAL_COUNTER);
      const nextSerial = counter ? parseInt(counter) + 1 : 1;
      await AsyncStorage.setItem(STORAGE_KEYS.SERIAL_COUNTER, nextSerial.toString());
      return nextSerial;
    } catch (error) {
      console.log('Error getting next serial number:', error);
      return 1;
    }
  }

  // Items
  async getItems(): Promise<InventoryItem[]> {
    try {
      const items = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
      return items ? JSON.parse(items).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        loanedAt: item.loanedAt ? new Date(item.loanedAt) : undefined,
        purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
        warrantyExpiry: item.warrantyExpiry ? new Date(item.warrantyExpiry) : undefined,
        tags: item.tags || [],
        condition: item.condition || 'good',
        isArchived: item.isArchived || false,
      })) : [];
    } catch (error) {
      console.log('Error getting items:', error);
      return [];
    }
  }

  async saveItem(item: Omit<InventoryItem, 'id' | 'serialNumber' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    try {
      const items = await this.getItems();
      const serialNumber = await this.getNextSerialNumber();
      const newItem: InventoryItem = {
        ...item,
        id: uuid.v4() as string,
        serialNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: item.tags || [],
        condition: item.condition || 'good',
        isArchived: item.isArchived || false,
        type: item.type || 'item',
        childrenIds: item.childrenIds || [],
        containedItems: item.containedItems || [],
      };
      
      items.push(newItem);
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      
      // Log the event
      await this.logEvent({
        type: 'created',
        itemId: newItem.id,
        itemName: newItem.name,
        description: newItem.type === 'section' 
          ? `Создан раздел "${newItem.name}"`
          : `Создан предмет "${newItem.name}" в разделе`,
        metadata: {
          sectionId: newItem.sectionId,
          price: newItem.price,
          quantity: newItem.quantity,
          serialNumber: newItem.serialNumber,
          type: newItem.type,
        },
      });
      
      return newItem;
    } catch (error) {
      console.log('Error saving item:', error);
      throw error;
    }
  }

  async updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
    try {
      const items = await this.getItems();
      const itemIndex = items.findIndex(item => item.id === id);
      
      if (itemIndex === -1) {
        return null;
      }
      
      const oldItem = items[itemIndex];
      const updatedItem = {
        ...oldItem,
        ...updates,
        updatedAt: new Date(),
      };
      
      items[itemIndex] = updatedItem;
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      
      // Track location changes
      if (updates.locationPath && JSON.stringify(oldItem.locationPath) !== JSON.stringify(updates.locationPath)) {
        await this.logLocationChange(id, oldItem.locationPath, updates.locationPath);
        await this.logEvent({
          type: 'moved',
          itemId: updatedItem.id,
          itemName: updatedItem.name,
          description: `Предмет "${updatedItem.name}" перемещён`,
          fromLocation: oldItem.locationPath.join(' → '),
          toLocation: updates.locationPath.join(' → '),
          metadata: {
            fromPath: oldItem.locationPath,
            toPath: updates.locationPath,
          },
        });
      }

      // Track loan status changes
      if (updates.isOnLoan !== undefined && updates.isOnLoan !== oldItem.isOnLoan) {
        if (updates.isOnLoan) {
          await this.logEvent({
            type: 'loaned',
            itemId: updatedItem.id,
            itemName: updatedItem.name,
            description: `Предмет "${updatedItem.name}" выдан`,
            metadata: {
              loanedTo: updates.loanedTo,
              loanedAt: updates.loanedAt,
            },
          });
        } else {
          await this.logEvent({
            type: 'returned',
            itemId: updatedItem.id,
            itemName: updatedItem.name,
            description: `Предмет "${updatedItem.name}" возвращён`,
            metadata: {
              wasLoanedTo: oldItem.loanedTo,
              loanDuration: oldItem.loanedAt ? 
                Math.floor((new Date().getTime() - oldItem.loanedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
            },
          });
        }
      }

      // Track other significant changes
      const significantChanges: Record<string, any> = {};
      if (updates.name && updates.name !== oldItem.name) {
        significantChanges.name = { from: oldItem.name, to: updates.name };
      }
      if (updates.price !== undefined && updates.price !== oldItem.price) {
        significantChanges.price = { from: oldItem.price, to: updates.price };
      }
      if (updates.quantity !== undefined && updates.quantity !== oldItem.quantity) {
        significantChanges.quantity = { from: oldItem.quantity, to: updates.quantity };
      }
      if (updates.condition && updates.condition !== oldItem.condition) {
        significantChanges.condition = { from: oldItem.condition, to: updates.condition };
      }

      if (Object.keys(significantChanges).length > 0) {
        await this.logEvent({
          type: 'updated',
          itemId: updatedItem.id,
          itemName: updatedItem.name,
          description: `Предмет "${updatedItem.name}" изменён`,
          metadata: {
            changes: significantChanges,
          },
        });
      }
      
      return updatedItem;
    } catch (error) {
      console.log('Error updating item:', error);
      return null;
    }
  }

  async deleteItem(id: string): Promise<boolean> {
    try {
      const items = await this.getItems();
      const item = items.find(item => item.id === id);
      
      if (!item) {
        return false;
      }
      
      const filteredItems = items.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filteredItems));
      
      // Log the event
      await this.logEvent({
        type: 'deleted',
        itemId: item.id,
        itemName: item.name,
        description: `Предмет "${item.name}" удалён`,
        metadata: {
          serialNumber: item.serialNumber,
          price: item.price,
          quantity: item.quantity,
          sectionId: item.sectionId,
        },
      });
      
      return true;
    } catch (error) {
      console.log('Error deleting item:', error);
      return false;
    }
  }

  async archiveItem(id: string): Promise<boolean> {
    try {
      const result = await this.updateItem(id, { isArchived: true });
      if (result) {
        await this.logEvent({
          type: 'archived',
          itemId: result.id,
          itemName: result.name,
          description: `Предмет "${result.name}" архивирован`,
          metadata: {
            archivedAt: new Date(),
          },
        });
      }
      return !!result;
    } catch (error) {
      console.log('Error archiving item:', error);
      return false;
    }
  }

  async restoreItem(id: string): Promise<boolean> {
    try {
      const result = await this.updateItem(id, { isArchived: false });
      if (result) {
        await this.logEvent({
          type: 'restored',
          itemId: result.id,
          itemName: result.name,
          description: `Предмет "${result.name}" восстановлен из архива`,
          metadata: {
            restoredAt: new Date(),
          },
        });
      }
      return !!result;
    } catch (error) {
      console.log('Error restoring item:', error);
      return false;
    }
  }

  async copyItem(id: string, newSectionId?: string): Promise<InventoryItem | null> {
    try {
      const items = await this.getItems();
      const originalItem = items.find(item => item.id === id);
      
      if (!originalItem) {
        return null;
      }

      const copiedItem = await this.saveItem({
        ...originalItem,
        name: `${originalItem.name} (копия)`,
        sectionId: newSectionId || originalItem.sectionId,
        parentId: undefined,
        childrenIds: [],
        isOnLoan: false,
        loanedTo: undefined,
        loanedAt: undefined,
        loanQuantity: undefined,
        containedItems: [],
      });

      await this.logEvent({
        type: 'copied',
        itemId: copiedItem.id,
        itemName: copiedItem.name,
        description: `Создана копия предмета "${originalItem.name}"`,
        metadata: {
          originalItemId: originalItem.id,
          originalItemName: originalItem.name,
          copiedToSection: newSectionId,
        },
      });

      return copiedItem;
    } catch (error) {
      console.log('Error copying item:', error);
      return null;
    }
  }

  // Nested items functionality
  async addItemToContainer(containerId: string, itemId: string): Promise<boolean> {
    try {
      const items = await this.getItems();
      const container = items.find(item => item.id === containerId);
      const item = items.find(item => item.id === itemId);
      
      if (!container || !item) {
        return false;
      }

      // Update container's contained items
      const updatedContainer = await this.updateItem(containerId, {
        containedItems: [...(container.containedItems || []), itemId],
      });

      // Update item's parent
      const updatedItem = await this.updateItem(itemId, {
        parentId: containerId,
      });

      if (updatedContainer && updatedItem) {
        await this.logEvent({
          type: 'moved',
          itemId: itemId,
          itemName: item.name,
          description: `Предмет "${item.name}" помещен в "${container.name}"`,
          metadata: {
            containerId: containerId,
            containerName: container.name,
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error adding item to container:', error);
      return false;
    }
  }

  async removeItemFromContainer(containerId: string, itemId: string): Promise<boolean> {
    try {
      const items = await this.getItems();
      const container = items.find(item => item.id === containerId);
      const item = items.find(item => item.id === itemId);
      
      if (!container || !item) {
        return false;
      }

      // Update container's contained items
      const updatedContainer = await this.updateItem(containerId, {
        containedItems: (container.containedItems || []).filter(id => id !== itemId),
      });

      // Update item's parent
      const updatedItem = await this.updateItem(itemId, {
        parentId: undefined,
      });

      if (updatedContainer && updatedItem) {
        await this.logEvent({
          type: 'moved',
          itemId: itemId,
          itemName: item.name,
          description: `Предмет "${item.name}" извлечен из "${container.name}"`,
          metadata: {
            containerId: containerId,
            containerName: container.name,
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error removing item from container:', error);
      return false;
    }
  }

  async getContainedItems(containerId: string): Promise<InventoryItem[]> {
    try {
      const items = await this.getItems();
      const container = items.find(item => item.id === containerId);
      
      if (!container || !container.containedItems) {
        return [];
      }

      return items.filter(item => container.containedItems!.includes(item.id));
    } catch (error) {
      console.log('Error getting contained items:', error);
      return [];
    }
  }

  // Loan with quantity selection
  async loanItemWithQuantity(itemId: string, quantity: number, loanedTo: string): Promise<boolean> {
    try {
      const items = await this.getItems();
      const item = items.find(i => i.id === itemId);
      
      if (!item) {
        return false;
      }

      if (quantity > item.quantity || quantity < 1) {
        return false;
      }

      const updatedItem = await this.updateItem(itemId, {
        isOnLoan: true,
        loanedTo: loanedTo,
        loanedAt: new Date(),
        loanQuantity: quantity,
      });

      if (updatedItem) {
        await this.logEvent({
          type: 'loaned',
          itemId: itemId,
          itemName: item.name,
          description: `Выдано ${quantity} из ${item.quantity} "${item.name}" пользователю ${loanedTo}`,
          metadata: {
            loanedTo: loanedTo,
            loanedQuantity: quantity,
            totalQuantity: item.quantity,
            loanedAt: new Date(),
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error loaning item with quantity:', error);
      return false;
    }
  }

  async returnLoanedItem(itemId: string): Promise<boolean> {
    try {
      const items = await this.getItems();
      const item = items.find(i => i.id === itemId);
      
      if (!item || !item.isOnLoan) {
        return false;
      }

      const updatedItem = await this.updateItem(itemId, {
        isOnLoan: false,
        loanedTo: undefined,
        loanedAt: undefined,
        loanQuantity: undefined,
      });

      if (updatedItem) {
        await this.logEvent({
          type: 'returned',
          itemId: itemId,
          itemName: item.name,
          description: `Возвращен предмет "${item.name}" от ${item.loanedTo}`,
          metadata: {
            wasLoanedTo: item.loanedTo,
            loanedQuantity: item.loanQuantity,
            loanDuration: item.loanedAt ? 
              Math.floor((new Date().getTime() - item.loanedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0,
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error returning loaned item:', error);
      return false;
    }
  }

  // Sections (now unified with items)
  async getSections(): Promise<Section[]> {
    try {
      const items = await this.getItems();
      return items
        .filter(item => item.type === 'section')
        .map(item => ({
          ...item,
          emoji: item.emoji || '📁',
          color: item.color || colors.primary,
          viewType: item.viewType || 'list',
          sortOrder: item.sortOrder || 0,
        })) as Section[];
    } catch (error) {
      console.log('Error getting sections:', error);
      return [];
    }
  }

  async saveSection(section: Omit<Section, 'id' | 'createdAt' | 'updatedAt' | 'serialNumber'>): Promise<Section> {
    try {
      const sections = await this.getSections();
      const newSectionItem: InventoryItem = {
        id: uuid.v4() as string,
        serialNumber: await this.getNextSerialNumber(),
        name: section.name,
        description: section.description || '',
        photo: section.photo,
        video: section.video,
        price: 0,
        weight: 0,
        locationPath: [],
        quantity: 1,
        parentId: section.parentSectionId,
        childrenIds: section.childSectionIds || [],
        sectionId: section.parentSectionId || 'root',
        createdAt: new Date(),
        updatedAt: new Date(),
        isOnLoan: false,
        tags: section.tags || [],
        condition: 'good',
        isArchived: section.isArchived || false,
        type: 'section',
        emoji: section.emoji,
        color: section.color,
        viewType: section.viewType,
        sortOrder: section.sortOrder || sections.length,
        containedItems: [],
      };
      
      await this.saveItem(newSectionItem);
      return newSectionItem as Section;
    } catch (error) {
      console.log('Error saving section:', error);
      throw error;
    }
  }

  async updateSection(id: string, updates: Partial<Section>): Promise<Section | null> {
    try {
      const updatedItem = await this.updateItem(id, updates);
      return updatedItem as Section | null;
    } catch (error) {
      console.log('Error updating section:', error);
      return null;
    }
  }

  async deleteSection(id: string): Promise<boolean> {
    try {
      return await this.deleteItem(id);
    } catch (error) {
      console.log('Error deleting section:', error);
      return false;
    }
  }

  // Event logging
  async logEvent(event: Omit<EventLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const events = await this.getEvents();
      const newEvent: EventLog = {
        ...event,
        id: uuid.v4() as string,
        timestamp: new Date(),
      };
      
      events.unshift(newEvent); // Add to beginning for chronological order
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.splice(1000);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (error) {
      console.log('Error logging event:', error);
    }
  }

  async getEvents(): Promise<EventLog[]> {
    try {
      const events = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
      return events ? JSON.parse(events).map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      })) : [];
    } catch (error) {
      console.log('Error getting events:', error);
      return [];
    }
  }

  async clearEvents(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([]));
      console.log('Events cleared successfully');
    } catch (error) {
      console.log('Error clearing events:', error);
      throw error;
    }
  }

  async getEventsByItem(itemId: string): Promise<EventLog[]> {
    try {
      const events = await this.getEvents();
      return events.filter(event => event.itemId === itemId);
    } catch (error) {
      console.log('Error getting events by item:', error);
      return [];
    }
  }

  async getEventsByType(type: EventLog['type']): Promise<EventLog[]> {
    try {
      const events = await this.getEvents();
      return events.filter(event => event.type === type);
    } catch (error) {
      console.log('Error getting events by type:', error);
      return [];
    }
  }

  async getEventsInDateRange(startDate: Date, endDate: Date): Promise<EventLog[]> {
    try {
      const events = await this.getEvents();
      return events.filter(event => 
        event.timestamp >= startDate && event.timestamp <= endDate
      );
    } catch (error) {
      console.log('Error getting events in date range:', error);
      return [];
    }
  }

  // Location history
  async logLocationChange(itemId: string, fromLocation: string[], toLocation: string[]): Promise<void> {
    try {
      const history = await this.getLocationHistory();
      const newEntry: LocationHistory = {
        id: uuid.v4() as string,
        itemId,
        fromLocation,
        toLocation,
        movedAt: new Date(),
      };
      
      history.unshift(newEntry);
      
      // Keep only last 500 location changes
      if (history.length > 500) {
        history.splice(500);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.log('Error logging location change:', error);
    }
  }

  async getLocationHistory(): Promise<LocationHistory[]> {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_HISTORY);
      return history ? JSON.parse(history).map((entry: any) => ({
        ...entry,
        movedAt: new Date(entry.movedAt),
      })) : [];
    } catch (error) {
      console.log('Error getting location history:', error);
      return [];
    }
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    try {
      const goals = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      return goals ? JSON.parse(goals).map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
        deadline: goal.deadline ? new Date(goal.deadline) : undefined,
        completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
        priority: goal.priority || 'medium',
        category: goal.category || 'general',
        isRecurring: goal.isRecurring || false,
        linkedItemIds: goal.linkedItemIds || [],
      })) : [];
    } catch (error) {
      console.log('Error getting goals:', error);
      return [];
    }
  }

  async saveGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    try {
      const goals = await this.getGoals();
      const newGoal: Goal = {
        ...goal,
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        priority: goal.priority || 'medium',
        category: goal.category || 'general',
        isRecurring: goal.isRecurring || false,
        linkedItemIds: goal.linkedItemIds || [],
      };
      
      goals.push(newGoal);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      return newGoal;
    } catch (error) {
      console.log('Error saving goal:', error);
      throw error;
    }
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    try {
      const goals = await this.getGoals();
      const goalIndex = goals.findIndex(goal => goal.id === id);
      
      if (goalIndex === -1) {
        return null;
      }
      
      const updatedGoal = {
        ...goals[goalIndex],
        ...updates,
        updatedAt: new Date(),
      };
      
      // Set completion date if goal is being marked as completed
      if (updates.completed && !goals[goalIndex].completed) {
        updatedGoal.completedAt = new Date();
      }
      
      goals[goalIndex] = updatedGoal;
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      return updatedGoal;
    } catch (error) {
      console.log('Error updating goal:', error);
      return null;
    }
  }

  // Notes
  async getNotes(): Promise<Note[]> {
    try {
      const notes = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      return notes ? JSON.parse(notes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        tags: note.tags || [],
        color: note.color || '#FFFFFF',
        isPinned: note.isPinned || false,
        isArchived: note.isArchived || false,
        attachments: note.attachments || [],
      })) : [];
    } catch (error) {
      console.log('Error getting notes:', error);
      return [];
    }
  }

  async saveNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const notes = await this.getNotes();
      const newNote: Note = {
        ...note,
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: note.tags || [],
        color: note.color || '#FFFFFF',
        isPinned: note.isPinned || false,
        isArchived: note.isArchived || false,
        attachments: note.attachments || [],
      };
      
      notes.push(newNote);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return newNote;
    } catch (error) {
      console.log('Error saving note:', error);
      throw error;
    }
  }

  // Mind Maps
  async getMindMaps(): Promise<MindMap[]> {
    try {
      const mindMaps = await AsyncStorage.getItem(STORAGE_KEYS.MIND_MAPS);
      return mindMaps ? JSON.parse(mindMaps).map((mindMap: any) => ({
        ...mindMap,
        createdAt: new Date(mindMap.createdAt),
        updatedAt: new Date(mindMap.updatedAt),
        nodes: mindMap.nodes.map((node: any) => ({
          ...node,
          createdAt: new Date(node.createdAt),
          updatedAt: new Date(node.updatedAt),
        })),
        connections: mindMap.connections.map((connection: any) => ({
          ...connection,
          createdAt: new Date(connection.createdAt),
        })),
      })) : [];
    } catch (error) {
      console.log('Error getting mind maps:', error);
      return [];
    }
  }

  async saveMindMap(mindMap: Omit<MindMap, 'id' | 'createdAt' | 'updatedAt'>): Promise<MindMap> {
    try {
      const mindMaps = await this.getMindMaps();
      const newMindMap: MindMap = {
        ...mindMap,
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mindMaps.push(newMindMap);
      await AsyncStorage.setItem(STORAGE_KEYS.MIND_MAPS, JSON.stringify(mindMaps));
      return newMindMap;
    } catch (error) {
      console.log('Error saving mind map:', error);
      throw error;
    }
  }

  // Tables
  async getTables(): Promise<TableSchema[]> {
    try {
      const tables = await AsyncStorage.getItem(STORAGE_KEYS.TABLES);
      return tables ? JSON.parse(tables).map((table: any) => ({
        ...table,
        createdAt: new Date(table.createdAt),
        updatedAt: new Date(table.updatedAt),
        rows: table.rows.map((row: any) => ({
          ...row,
          createdAt: new Date(row.createdAt),
          updatedAt: new Date(row.updatedAt),
        })),
      })) : [];
    } catch (error) {
      console.log('Error getting tables:', error);
      return [];
    }
  }

  async saveTable(table: Omit<TableSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<TableSchema> {
    try {
      const tables = await this.getTables();
      const newTable: TableSchema = {
        ...table,
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      tables.push(newTable);
      await AsyncStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
      return newTable;
    } catch (error) {
      console.log('Error saving table:', error);
      throw error;
    }
  }

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    try {
      const reminders = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      return reminders ? JSON.parse(reminders).map((reminder: any) => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate),
        createdAt: new Date(reminder.createdAt),
        updatedAt: new Date(reminder.updatedAt),
        completedAt: reminder.completedAt ? new Date(reminder.completedAt) : undefined,
      })) : [];
    } catch (error) {
      console.log('Error getting reminders:', error);
      return [];
    }
  }

  async saveReminder(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder> {
    try {
      const reminders = await this.getReminders();
      const newReminder: Reminder = {
        ...reminder,
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      reminders.push(newReminder);
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      return newReminder;
    } catch (error) {
      console.log('Error saving reminder:', error);
      throw error;
    }
  }

  // Templates
  async getTemplates(): Promise<ItemTemplate[]> {
    try {
      const templates = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return templates ? JSON.parse(templates).map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
      })) : [];
    } catch (error) {
      console.log('Error getting templates:', error);
      return [];
    }
  }

  async saveTemplate(template: Omit<ItemTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ItemTemplate> {
    try {
      const templates = await this.getTemplates();
      const newTemplate: ItemTemplate = {
        ...template,
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      };
      
      templates.push(newTemplate);
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
      return newTemplate;
    } catch (error) {
      console.log('Error saving template:', error);
      throw error;
    }
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const defaultSettings: AppSettings = {
        theme: 'light',
        language: 'ru',
        currency: 'RUB',
        weightUnit: 'kg',
        dateFormat: 'DD.MM.YYYY',
        autoBackup: true,
        backupFrequency: 'weekly',
        compressionQuality: 0.8,
        maxImageSize: 1024,
        enableNotifications: true,
        enableHaptics: true,
        defaultViewType: 'list',
        showSerialNumbers: true,
        enableLocationTracking: false,
      };
      
      return settings ? { ...defaultSettings, ...JSON.parse(settings) } : defaultSettings;
    } catch (error) {
      console.log('Error getting settings:', error);
      return {
        theme: 'light',
        language: 'ru',
        currency: 'RUB',
        weightUnit: 'kg',
        dateFormat: 'DD.MM.YYYY',
        autoBackup: true,
        backupFrequency: 'weekly',
        compressionQuality: 0.8,
        maxImageSize: 1024,
        enableNotifications: true,
        enableHaptics: true,
        defaultViewType: 'list',
        showSerialNumbers: true,
        enableLocationTracking: false,
      };
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  }

  // Statistics
  async getStatistics(): Promise<Statistics> {
    try {
      const items = await this.getItems();
      const sections = await this.getSections();
      const goals = await this.getGoals();
      
      const totalItems = items.length;
      const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      
      const itemsBySection: Record<string, number> = {};
      const valueBySection: Record<string, number> = {};
      const itemsByCondition: Record<string, number> = {};
      
      items.forEach(item => {
        // By section
        itemsBySection[item.sectionId] = (itemsBySection[item.sectionId] || 0) + item.quantity;
        valueBySection[item.sectionId] = (valueBySection[item.sectionId] || 0) + (item.price * item.quantity);
        
        // By condition
        itemsByCondition[item.condition] = (itemsByCondition[item.condition] || 0) + 1;
      });
      
      const loanedItems = items.filter(item => item.isOnLoan).length;
      const archivedItems = items.filter(item => item.isArchived).length;
      const averageItemValue = totalItems > 0 ? totalValue / totalItems : 0;
      
      const mostExpensiveItem = items.reduce((max, item) => 
        item.price > (max?.price || 0) ? item : max, null as InventoryItem | null);
      
      const oldestItem = items.reduce((oldest, item) => 
        item.createdAt < (oldest?.createdAt || new Date()) ? item : oldest, null as InventoryItem | null);
      
      const newestItem = items.reduce((newest, item) => 
        item.createdAt > (newest?.createdAt || new Date(0)) ? item : newest, null as InventoryItem | null);
      
      // Top tags
      const tagCounts: Record<string, number> = {};
      items.forEach(item => {
        item.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      // Monthly additions
      const monthlyAdditions: { month: string; count: number }[] = [];
      const monthCounts: Record<string, number> = {};
      
      items.forEach(item => {
        const month = item.createdAt.toISOString().substring(0, 7); // YYYY-MM
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });
      
      Object.entries(monthCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([month, count]) => {
          monthlyAdditions.push({ month, count });
        });
      
      // Goal completion rate
      const completedGoals = goals.filter(goal => goal.completed).length;
      const goalCompletionRate = goals.length > 0 ? (completedGoals / goals.length) * 100 : 0;
      
      return {
        totalItems,
        totalValue,
        totalWeight,
        itemsBySection,
        valueBySection,
        itemsByCondition,
        loanedItems,
        archivedItems,
        averageItemValue,
        mostExpensiveItem,
        oldestItem,
        newestItem,
        topTags,
        monthlyAdditions,
        goalCompletionRate,
      };
    } catch (error) {
      console.log('Error getting statistics:', error);
      return {
        totalItems: 0,
        totalValue: 0,
        totalWeight: 0,
        itemsBySection: {},
        valueBySection: {},
        itemsByCondition: {},
        loanedItems: 0,
        archivedItems: 0,
        averageItemValue: 0,
        mostExpensiveItem: null,
        oldestItem: null,
        newestItem: null,
        topTags: [],
        monthlyAdditions: [],
        goalCompletionRate: 0,
      };
    }
  }

  // Initialize default sections
  async initializeDefaultSections(): Promise<void> {
    try {
      const sections = await this.getSections();
      if (sections.length === 0) {
        const defaultSections = [
          { name: 'Спальня', emoji: '🛏️', color: '#FF6B6B', viewType: 'list' as const, parentSectionId: undefined, childSectionIds: [], isArchived: false, sortOrder: 0 },
          { name: 'Кухня', emoji: '🍳', color: '#4ECDC4', viewType: 'list' as const, parentSectionId: undefined, childSectionIds: [], isArchived: false, sortOrder: 1 },
          { name: 'Гостиная', emoji: '🛋️', color: '#45B7D1', viewType: 'list' as const, parentSectionId: undefined, childSectionIds: [], isArchived: false, sortOrder: 2 },
          { name: 'Ванная', emoji: '🚿', color: '#96CEB4', viewType: 'list' as const, parentSectionId: undefined, childSectionIds: [], isArchived: false, sortOrder: 3 },
          { name: 'Гараж', emoji: '🚗', color: '#FFEAA7', viewType: 'list' as const, parentSectionId: undefined, childSectionIds: [], isArchived: false, sortOrder: 4 },
        ];

        for (const section of defaultSections) {
          await this.saveSection(section);
        }
      }
    } catch (error) {
      console.log('Error initializing default sections:', error);
    }
  }

  // Clear all data (for testing or reset)
  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      console.log('All data cleared successfully');
    } catch (error) {
      console.log('Error clearing all data:', error);
    }
  }
}

export const storageService = new StorageService();
