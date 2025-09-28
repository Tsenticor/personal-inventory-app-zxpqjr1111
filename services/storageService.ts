
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem, Section, EventLog, Goal, Note } from '../types/inventory';
import uuid from 'react-native-uuid';

const STORAGE_KEYS = {
  ITEMS: 'inventory_items',
  SECTIONS: 'inventory_sections',
  EVENTS: 'inventory_events',
  GOALS: 'inventory_goals',
  NOTES: 'inventory_notes',
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
      };
      
      items.push(newItem);
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      
      // Log the event
      await this.logEvent({
        type: 'created',
        itemId: newItem.id,
        itemName: newItem.name,
        description: `Item "${newItem.name}" was created`,
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
      
      const updatedItem = {
        ...items[itemIndex],
        ...updates,
        updatedAt: new Date(),
      };
      
      items[itemIndex] = updatedItem;
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      
      // Log the event
      await this.logEvent({
        type: 'updated',
        itemId: updatedItem.id,
        itemName: updatedItem.name,
        description: `Item "${updatedItem.name}" was updated`,
      });
      
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
        description: `Item "${item.name}" was deleted`,
      });
      
      return true;
    } catch (error) {
      console.log('Error deleting item:', error);
      return false;
    }
  }

  // Sections
  async getSections(): Promise<Section[]> {
    try {
      const sections = await AsyncStorage.getItem(STORAGE_KEYS.SECTIONS);
      return sections ? JSON.parse(sections).map((section: any) => ({
        ...section,
        createdAt: new Date(section.createdAt),
        updatedAt: new Date(section.updatedAt),
      })) : [];
    } catch (error) {
      console.log('Error getting sections:', error);
      return [];
    }
  }

  async saveSection(section: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> {
    try {
      const sections = await this.getSections();
      const newSection: Section = {
        ...section,
        id: uuid.v4() as string,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      sections.push(newSection);
      await AsyncStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
      return newSection;
    } catch (error) {
      console.log('Error saving section:', error);
      throw error;
    }
  }

  async updateSection(id: string, updates: Partial<Section>): Promise<Section | null> {
    try {
      const sections = await this.getSections();
      const sectionIndex = sections.findIndex(section => section.id === id);
      
      if (sectionIndex === -1) {
        return null;
      }
      
      const updatedSection = {
        ...sections[sectionIndex],
        ...updates,
        updatedAt: new Date(),
      };
      
      sections[sectionIndex] = updatedSection;
      await AsyncStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
      return updatedSection;
    } catch (error) {
      console.log('Error updating section:', error);
      return null;
    }
  }

  async deleteSection(id: string): Promise<boolean> {
    try {
      const sections = await this.getSections();
      const filteredSections = sections.filter(section => section.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(filteredSections));
      return true;
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

  // Goals
  async getGoals(): Promise<Goal[]> {
    try {
      const goals = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      return goals ? JSON.parse(goals).map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt),
        deadline: goal.deadline ? new Date(goal.deadline) : undefined,
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
      };
      
      goals.push(newGoal);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      return newGoal;
    } catch (error) {
      console.log('Error saving goal:', error);
      throw error;
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
      };
      
      notes.push(newNote);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return newNote;
    } catch (error) {
      console.log('Error saving note:', error);
      throw error;
    }
  }

  // Initialize default sections
  async initializeDefaultSections(): Promise<void> {
    try {
      const sections = await this.getSections();
      if (sections.length === 0) {
        const defaultSections = [
          { name: 'Спальня', emoji: '🛏️', color: '#FF6B6B', viewType: 'list' as const },
          { name: 'Кухня', emoji: '🍳', color: '#4ECDC4', viewType: 'list' as const },
          { name: 'Гостиная', emoji: '🛋️', color: '#45B7D1', viewType: 'list' as const },
          { name: 'Ванная', emoji: '🚿', color: '#96CEB4', viewType: 'list' as const },
          { name: 'Гараж', emoji: '🚗', color: '#FFEAA7', viewType: 'list' as const },
        ];

        for (const section of defaultSections) {
          await this.saveSection(section);
        }
      }
    } catch (error) {
      console.log('Error initializing default sections:', error);
    }
  }
}

export const storageService = new StorageService();
