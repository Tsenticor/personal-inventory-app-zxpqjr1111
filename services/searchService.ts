
import { InventoryItem, SearchFilters } from '../types/inventory';

class SearchService {
  searchItems(items: InventoryItem[], filters: SearchFilters): InventoryItem[] {
    let filteredItems = [...items];

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      filteredItems = filteredItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.locationPath.some(path => path.toLowerCase().includes(query))
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

  getItemsBySection(items: InventoryItem[], sectionId: string): InventoryItem[] {
    return items.filter(item => item.sectionId === sectionId);
  }

  getLoanedItems(items: InventoryItem[]): InventoryItem[] {
    return items.filter(item => item.isOnLoan);
  }

  getChildItems(items: InventoryItem[], parentId: string): InventoryItem[] {
    return items.filter(item => item.parentId === parentId);
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
}

export const searchService = new SearchService();
