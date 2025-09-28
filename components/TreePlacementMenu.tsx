
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { InventoryItem } from '@/types/inventory';

interface TreeNode {
  item: InventoryItem;
  children: TreeNode[];
  isExpanded: boolean;
  level: number;
}

interface TreePlacementMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (itemId: string) => void;
  items: InventoryItem[];
  selectedItemId?: string;
  excludeItemId?: string; // Exclude this item and its children from the tree
  title?: string;
  maxLevels?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const MAX_TEXT_LENGTH = 25;

export function TreePlacementMenu({
  visible,
  onClose,
  onSelect,
  items,
  selectedItemId,
  excludeItemId,
  title = 'Выберите размещение',
  maxLevels = 20,
}: TreePlacementMenuProps) {
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) return;

    const buildTree = (): TreeNode[] => {
      // Filter out excluded item and its descendants
      const filteredItems = items.filter(item => {
        if (item.id === excludeItemId) return false;
        
        // Check if item is a descendant of excluded item
        let currentItem = item;
        while (currentItem.parentId) {
          if (currentItem.parentId === excludeItemId) return false;
          currentItem = items.find(i => i.id === currentItem.parentId) || currentItem;
          if (currentItem === item) break; // Prevent infinite loop
        }
        
        return !item.isArchived;
      });

      const itemMap = new Map<string, InventoryItem>();
      const rootItems: InventoryItem[] = [];
      
      // Create item map
      filteredItems.forEach(item => {
        itemMap.set(item.id, item);
      });
      
      // Find root items (no parent or parent doesn't exist in filtered items)
      filteredItems.forEach(item => {
        if (!item.parentId || !itemMap.has(item.parentId)) {
          rootItems.push(item);
        }
      });
      
      const createTreeNode = (item: InventoryItem, level: number = 0): TreeNode => {
        // Stop at max levels to prevent infinite recursion
        if (level >= maxLevels) {
          return {
            item,
            children: [],
            isExpanded: false,
            level,
          };
        }

        const children: TreeNode[] = [];
        
        // Find direct children
        const directChildren = filteredItems.filter(child => child.parentId === item.id);
        
        // Find contained items
        const containedItems = item.containedItems 
          ? filteredItems.filter(child => item.containedItems!.includes(child.id))
          : [];
        
        // Combine and deduplicate children
        const allChildren = [...directChildren, ...containedItems];
        const uniqueChildren = allChildren.filter((child, index, arr) => 
          arr.findIndex(c => c.id === child.id) === index
        );
        
        uniqueChildren.forEach(child => {
          children.push(createTreeNode(child, level + 1));
        });
        
        return {
          item,
          children,
          isExpanded: expandedNodes.has(item.id),
          level,
        };
      };
      
      return rootItems.map(item => createTreeNode(item));
    };
    
    setTreeNodes(buildTree());
  }, [items, expandedNodes, excludeItemId, visible, maxLevels]);

  const toggleExpanded = (itemId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelect = (itemId: string) => {
    onSelect(itemId);
    onClose();
  };

  const truncateText = (text: string, maxLength: number = MAX_TEXT_LENGTH): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const renderTreeNode = (node: TreeNode): React.ReactNode => {
    const { item, children, isExpanded, level } = node;
    const hasChildren = children.length > 0;
    const indentWidth = Math.min(level * 16, 160); // Max indent to prevent overflow
    const isSelected = selectedItemId === item.id;
    
    return (
      <View key={item.id}>
        <Pressable
          style={[
            styles.treeItem,
            { paddingLeft: 16 + indentWidth },
            isSelected && styles.selectedItem,
          ]}
          onPress={() => handleSelect(item.id)}
        >
          <View style={styles.treeItemContent}>
            {hasChildren && (
              <Pressable
                style={styles.expandButton}
                onPress={() => toggleExpanded(item.id)}
              >
                <IconSymbol 
                  name={isExpanded ? "chevron.down" : "chevron.right"} 
                  size={14} 
                  color={colors.textSecondary} 
                />
              </Pressable>
            )}
            
            <View style={styles.itemIcon}>
              <IconSymbol 
                name={item.type === 'section' ? "folder.fill" : "cube.box.fill"} 
                size={16} 
                color={item.type === 'section' ? (item.color || colors.primary) : colors.textSecondary} 
              />
            </View>
            
            <View style={styles.itemInfo}>
              <Text style={[
                styles.itemName,
                item.type === 'section' && styles.sectionName,
                isSelected && styles.selectedText,
              ]} numberOfLines={1}>
                {item.type === 'section' && item.emoji} {truncateText(item.name)}
              </Text>
              
              {item.description && (
                <Text style={[styles.itemDescription, isSelected && styles.selectedDescription]} numberOfLines={1}>
                  {truncateText(item.description, 30)}
                </Text>
              )}
              
              <View style={styles.itemMeta}>
                <Text style={[styles.itemMetaText, isSelected && styles.selectedMeta]}>
                  №{item.serialNumber}
                </Text>
                {hasChildren && (
                  <Text style={[styles.childrenCount, isSelected && styles.selectedMeta]}>
                    ({children.length})
                  </Text>
                )}
              </View>
            </View>
            
            {isSelected && (
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
            )}
          </View>
        </Pressable>
        
        {isExpanded && children.map(child => renderTreeNode(child))}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="folder" size={48} color={colors.textSecondary} />
      <Text style={styles.emptyStateText}>
        Нет доступных мест для размещения
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={treeNodes.length === 0 ? styles.emptyContainer : styles.treeContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {treeNodes.length > 0 ? (
              treeNodes.map(node => renderTreeNode(node))
            ) : (
              renderEmptyState()
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <Pressable
              style={[styles.footerButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
    minHeight: screenHeight * 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  treeContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  treeItem: {
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedItem: {
    backgroundColor: colors.primaryLight,
  },
  treeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  itemIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  sectionName: {
    fontWeight: '600',
    color: colors.primary,
  },
  selectedText: {
    color: colors.primary,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  selectedDescription: {
    color: colors.primary,
    opacity: 0.8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 8,
  },
  selectedMeta: {
    color: colors.primary,
    opacity: 0.7,
  },
  childrenCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
});
