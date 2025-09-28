
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

  getPopularTags(items: InventoryItem[], limit: number = 10): { tag: string; count: number }[] {
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
