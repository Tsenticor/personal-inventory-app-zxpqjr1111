
import { InventoryItem, SearchFilters, Section, Note, Goal, Statistics } from '../types/inventory';

class SearchService {
  searchItems(items: InventoryItem[], filters: SearchFilters): InventoryItem[] {
    let filteredItems = [...items];

    // Filter by type (exclude sections from regular item searches unless specified)
    if (!filters.includeSections) {
      filteredItems = filteredItems.filter(item => item.type !== 'section');
    }

    // Filter by query
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.serialNumber.toString().includes(query) ||
        (item.barcode && item.barcode.toLowerCase().includes(query))
      );
    }

    // Filter by section
    if (filters.sectionId) {
      filteredItems = filteredItems.filter(item => item.sectionId === filters.sectionId);
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filteredItems = filteredItems.filter(item => item.price >= min && item.price <= max);
    }

    // Filter by weight range
    if (filters.weightRange) {
      const [min, max] = filters.weightRange;
      filteredItems = filteredItems.filter(item => item.weight >= min && item.weight <= max);
    }

    // Filter by loan status
    if (filters.isOnLoan !== undefined) {
      filteredItems = filteredItems.filter(item => item.isOnLoan === filters.isOnLoan);
    }

    // Filter by condition
    if (filters.condition) {
      filteredItems = filteredItems.filter(item => item.condition === filters.condition);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item => 
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filteredItems = filteredItems.filter(item => 
        item.createdAt >= startDate && item.createdAt <= endDate
      );
    }

    // Filter archived items
    if (!filters.includeArchived) {
      filteredItems = filteredItems.filter(item => !item.isArchived);
    }

    // Sort items
    filteredItems.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'weight':
          comparison = a.weight - b.weight;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'serialNumber':
          comparison = a.serialNumber - b.serialNumber;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filteredItems;
  }

  searchSections(items: InventoryItem[], query: string): Section[] {
    const sections = items.filter(item => item.type === 'section') as Section[];
    
    if (!query || !query.trim()) {
      return sections;
    }

    const searchQuery = query.toLowerCase().trim();
    return sections.filter(section => 
      section.name.toLowerCase().includes(searchQuery) ||
      section.description.toLowerCase().includes(searchQuery) ||
      section.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  getItemsBySection(items: InventoryItem[], sectionId: string): InventoryItem[] {
    return items.filter(item => 
      item.sectionId === sectionId && 
      item.type !== 'section' && 
      !item.isArchived
    );
  }

  getContainedItems(items: InventoryItem[], containerId: string): InventoryItem[] {
    const container = items.find(item => item.id === containerId);
    if (!container || !container.containedItems) {
      return [];
    }

    return items.filter(item => container.containedItems!.includes(item.id));
  }

  getAvailableQuantity(item: InventoryItem): number {
    if (!item.isOnLoan) {
      return item.quantity;
    }
    
    const loanedQuantity = item.loanQuantity || item.quantity;
    return item.quantity - loanedQuantity;
  }

  getPopularTags(items: InventoryItem[], limit: number = 10): Array<{ tag: string; count: number }> {
    const tagCounts: Record<string, number> = {};
    
    items.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getRecentItems(items: InventoryItem[], limit: number = 10): InventoryItem[] {
    return items
      .filter(item => item.type !== 'section' && !item.isArchived)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  getItemsNeedingAttention(items: InventoryItem[]): InventoryItem[] {
    const now = new Date();
    return items.filter(item => {
      if (item.type === 'section' || item.isArchived) return false;
      
      // Items on loan for more than 30 days
      if (item.isOnLoan && item.loanedAt) {
        const daysSinceLoan = Math.floor((now.getTime() - item.loanedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLoan > 30) return true;
      }
      
      // Items with expired warranty
      if (item.warrantyExpiry && item.warrantyExpiry < now) {
        return true;
      }
      
      return false;
    });
  }
}

export const searchService = new SearchService();

class SearchService {
  searchItems(items: InventoryItem[], filters: SearchFilters): InventoryItem[] {
    let filteredItems = [...items];

    // Filter archived items unless explicitly requested
    if (!filters.includeArchived) {
      filteredItems = filteredItems.filter(item => !item.isArchived);
    }

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.locationPath.some(path => path.toLowerCase().includes(query)) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.serialNumber.toString().includes(query) ||
        (item.barcode && item.barcode.toLowerCase().includes(query))
      );
    }

    // Section filter
    if (filters.sectionId) {
      filteredItems = filteredItems.filter(item => item.sectionId === filters.sectionId);
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filteredItems = filteredItems.filter(item => item.price >= min && item.price <= max);
    }

    // Weight range filter
    if (filters.weightRange) {
      const [min, max] = filters.weightRange;
      filteredItems = filteredItems.filter(item => item.weight >= min && item.weight <= max);
    }

    // Loan status filter
    if (filters.isOnLoan !== undefined) {
      filteredItems = filteredItems.filter(item => item.isOnLoan === filters.isOnLoan);
    }

    // Condition filter
    if (filters.condition) {
      filteredItems = filteredItems.filter(item => item.condition === filters.condition);
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filteredItems = filteredItems.filter(item =>
        filters.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Date range filter
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      filteredItems = filteredItems.filter(item =>
        item.createdAt >= startDate && item.createdAt <= endDate
      );
    }

    // Sorting
    filteredItems.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'weight':
          aValue = a.weight;
          bValue = b.weight;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'serialNumber':
          aValue = a.serialNumber;
          bValue = b.serialNumber;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return filters.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return filters.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filteredItems;
  }

  searchNotes(notes: Note[], query: string): Note[] {
    if (!query.trim()) {
      return notes.filter(note => !note.isArchived);
    }

    const searchQuery = query.toLowerCase().trim();
    return notes.filter(note =>
      !note.isArchived && (
        note.title.toLowerCase().includes(searchQuery) ||
        note.content.toLowerCase().includes(searchQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      )
    );
  }

  searchGoals(goals: Goal[], query: string): Goal[] {
    if (!query.trim()) {
      return goals;
    }

    const searchQuery = query.toLowerCase().trim();
    return goals.filter(goal =>
      goal.title.toLowerCase().includes(searchQuery) ||
      goal.description.toLowerCase().includes(searchQuery) ||
      goal.category.toLowerCase().includes(searchQuery)
    );
  }

  getItemsBySection(items: InventoryItem[], sectionId: string, includeArchived: boolean = false): InventoryItem[] {
    return items.filter(item => 
      item.sectionId === sectionId && (includeArchived || !item.isArchived)
    );
  }

  getLoanedItems(items: InventoryItem[]): InventoryItem[] {
    return items.filter(item => item.isOnLoan && !item.isArchived);
  }

  getChildItems(items: InventoryItem[], parentId: string): InventoryItem[] {
    return items.filter(item => item.parentId === parentId && !item.isArchived);
  }

  getItemsByTag(items: InventoryItem[], tag: string): InventoryItem[] {
    return items.filter(item => item.tags.includes(tag) && !item.isArchived);
  }

  getItemsByCondition(items: InventoryItem[], condition: InventoryItem['condition']): InventoryItem[] {
    return items.filter(item => item.condition === condition && !item.isArchived);
  }

  getExpiredWarrantyItems(items: InventoryItem[]): InventoryItem[] {
    const now = new Date();
    return items.filter(item => 
      item.warrantyExpiry && 
      item.warrantyExpiry < now && 
      !item.isArchived
    );
  }

  getRecentlyAddedItems(items: InventoryItem[], days: number = 7): InventoryItem[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return items.filter(item => 
      item.createdAt >= cutoffDate && !item.isArchived
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getRecentlyUpdatedItems(items: InventoryItem[], days: number = 7): InventoryItem[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return items.filter(item => 
      item.updatedAt >= cutoffDate && !item.isArchived
    ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getHighValueItems(items: InventoryItem[], threshold: number = 1000): InventoryItem[] {
    return items.filter(item => 
      item.price >= threshold && !item.isArchived
    ).sort((a, b) => b.price - a.price);
  }

  getLowStockItems(items: InventoryItem[], threshold: number = 1): InventoryItem[] {
    return items.filter(item => 
      item.quantity <= threshold && !item.isArchived
    );
  }

  getTotalValue(items: InventoryItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalWeight(items: InventoryItem[]): number {
    return items.reduce((total, item) => total + (item.weight * item.quantity), 0);
  }

  getItemCount(items: InventoryItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  getUniqueItemCount(items: InventoryItem[]): number {
    return items.length;
  }

  getAllTags(items: InventoryItem[]): string[] {
    const tagSet = new Set<string>();
    items.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }

  getTagUsageCount(items: InventoryItem[]): Record<string, number> {
    const tagCounts: Record<string, number> = {};
    items.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return tagCounts;
  }

  getMostUsedTags(items: InventoryItem[], limit: number = 10): Array<{ tag: string; count: number }> {
    const tagCounts = this.getTagUsageCount(items);
    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getItemsByLocationPath(items: InventoryItem[], locationPath: string[]): InventoryItem[] {
    return items.filter(item => {
      if (item.locationPath.length < locationPath.length) {
        return false;
      }
      
      return locationPath.every((path, index) => 
        item.locationPath[index]?.toLowerCase() === path.toLowerCase()
      );
    });
  }

  getSimilarItems(items: InventoryItem[], targetItem: InventoryItem, threshold: number = 0.5): InventoryItem[] {
    return items.filter(item => {
      if (item.id === targetItem.id) {
        return false;
      }
      
      let similarity = 0;
      let factors = 0;
      
      // Name similarity (basic)
      if (item.name.toLowerCase().includes(targetItem.name.toLowerCase()) ||
          targetItem.name.toLowerCase().includes(item.name.toLowerCase())) {
        similarity += 0.4;
      }
      factors++;
      
      // Tag similarity
      const commonTags = item.tags.filter(tag => targetItem.tags.includes(tag));
      if (commonTags.length > 0) {
        similarity += (commonTags.length / Math.max(item.tags.length, targetItem.tags.length)) * 0.3;
      }
      factors++;
      
      // Section similarity
      if (item.sectionId === targetItem.sectionId) {
        similarity += 0.2;
      }
      factors++;
      
      // Price similarity (within 20% range)
      const priceDiff = Math.abs(item.price - targetItem.price);
      const avgPrice = (item.price + targetItem.price) / 2;
      if (avgPrice > 0 && (priceDiff / avgPrice) <= 0.2) {
        similarity += 0.1;
      }
      factors++;
      
      return (similarity / factors) >= threshold;
    });
  }

  // Advanced search with multiple criteria
  advancedSearch(items: InventoryItem[], criteria: {
    query?: string;
    sectionIds?: string[];
    tags?: string[];
    conditions?: InventoryItem['condition'][];
    priceRange?: [number, number];
    weightRange?: [number, number];
    dateRange?: [Date, Date];
    isOnLoan?: boolean;
    hasWarranty?: boolean;
    includeArchived?: boolean;
  }): InventoryItem[] {
    let filteredItems = [...items];

    // Filter archived items
    if (!criteria.includeArchived) {
      filteredItems = filteredItems.filter(item => !item.isArchived);
    }

    // Text search
    if (criteria.query?.trim()) {
      const query = criteria.query.toLowerCase().trim();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.locationPath.some(path => path.toLowerCase().includes(query)) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Multiple sections
    if (criteria.sectionIds && criteria.sectionIds.length > 0) {
      filteredItems = filteredItems.filter(item => 
        criteria.sectionIds!.includes(item.sectionId)
      );
    }

    // Multiple tags (OR logic)
    if (criteria.tags && criteria.tags.length > 0) {
      filteredItems = filteredItems.filter(item =>
        criteria.tags!.some(tag => item.tags.includes(tag))
      );
    }

    // Multiple conditions
    if (criteria.conditions && criteria.conditions.length > 0) {
      filteredItems = filteredItems.filter(item =>
        criteria.conditions!.includes(item.condition)
      );
    }

    // Price range
    if (criteria.priceRange) {
      const [min, max] = criteria.priceRange;
      filteredItems = filteredItems.filter(item => 
        item.price >= min && item.price <= max
      );
    }

    // Weight range
    if (criteria.weightRange) {
      const [min, max] = criteria.weightRange;
      filteredItems = filteredItems.filter(item => 
        item.weight >= min && item.weight <= max
      );
    }

    // Date range
    if (criteria.dateRange) {
      const [startDate, endDate] = criteria.dateRange;
      filteredItems = filteredItems.filter(item =>
        item.createdAt >= startDate && item.createdAt <= endDate
      );
    }

    // Loan status
    if (criteria.isOnLoan !== undefined) {
      filteredItems = filteredItems.filter(item => 
        item.isOnLoan === criteria.isOnLoan
      );
    }

    // Warranty status
    if (criteria.hasWarranty !== undefined) {
      filteredItems = filteredItems.filter(item => {
        const hasWarranty = item.warrantyExpiry && item.warrantyExpiry > new Date();
        return hasWarranty === criteria.hasWarranty;
      });
    }

    return filteredItems;
  }
}

export const searchService = new SearchService();
