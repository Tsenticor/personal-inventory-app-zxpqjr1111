
import { commonStyles, colors } from '@/styles/commonStyles';
import { InventoryItem } from '@/types/inventory';
import { storageService } from '@/services/storageService';
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { ContextMenu } from '@/components/ContextMenu';
import { TreePlacementMenu } from '@/components/TreePlacementMenu';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';

interface TreeNode {
  item: InventoryItem;
  children: TreeNode[];
  isExpanded: boolean;
  level: number;
}

export default function InventoryScreen() {
  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const itemsData = await storageService.getItems();
      setAllItems(itemsData.filter(item => !item.isArchived));
    } catch (error) {
      console.log('Error loading data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  // Build tree structure with all subgroups collapsed by default
  useEffect(() => {
    const buildTree = (items: InventoryItem[]): TreeNode[] => {
      const itemMap = new Map<string, InventoryItem>();
      const rootItems: InventoryItem[] = [];
      
      // Create item map
      items.forEach(item => {
        itemMap.set(item.id, item);
      });
      
      // Find root items (no parent or parent doesn't exist)
      items.forEach(item => {
        if (!item.parentId || !itemMap.has(item.parentId)) {
          rootItems.push(item);
        }
      });
      
      const createTreeNode = (item: InventoryItem, level: number = 0): TreeNode => {
        // Limit tree depth to prevent infinite recursion
        if (level >= 20) {
          return {
            item,
            children: [],
            isExpanded: false,
            level,
          };
        }

        const children: TreeNode[] = [];
        
        // Find direct children
        const directChildren = items.filter(child => child.parentId === item.id);
        
        // Find contained items
        const containedItems = item.containedItems 
          ? items.filter(child => item.containedItems!.includes(child.id))
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
    
    setTreeNodes(buildTree(allItems));
  }, [allItems, expandedNodes]);

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

  const handleLongPress = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowContextMenu(true);
  };

  const handleContextAction = (actionId: string) => {
    if (!selectedItem) return;

    switch (actionId) {
      case 'view':
        router.push(`/item-detail?id=${selectedItem.id}`);
        break;
      case 'edit':
        router.push(`/edit-item?id=${selectedItem.id}`);
        break;
      case 'move':
        setShowMoveModal(true);
        break;
      case 'delete':
        Alert.alert(
          selectedItem.type === 'section' ? 'Удалить раздел' : 'Удалить предмет',
          `Вы уверены, что хотите удалить "${selectedItem.name}"?`,
          [
            { text: 'Отмена', style: 'cancel' },
            {
              text: 'Удалить',
              style: 'destructive',
              onPress: async () => {
                try {
                  await storageService.deleteItem(selectedItem.id);
                  loadData();
                  Alert.alert('Успешно', selectedItem.type === 'section' ? 'Раздел удален' : 'Предмет удален');
                } catch (error) {
                  console.log('Error deleting item:', error);
                  Alert.alert('Ошибка', 'Не удалось удалить');
                }
              },
            },
          ]
        );
        break;
    }
  };

  const handleMoveItem = async (targetId: string) => {
    if (!selectedItem) return;
    
    try {
      const targetItem = allItems.find(i => i.id === targetId);
      
      // Remove from old container if needed
      if (selectedItem.parentId) {
        await storageService.removeItemFromContainer(selectedItem.parentId, selectedItem.id);
      }
      
      if (targetItem?.type === 'section') {
        // Move to section
        await storageService.updateItem(selectedItem.id, {
          sectionId: targetId,
          parentId: undefined,
        });
      } else {
        // Move into another item as container
        await storageService.updateItem(selectedItem.id, {
          parentId: targetId,
          sectionId: targetItem?.sectionId || selectedItem.sectionId,
        });
        
        // Add to container's contained items
        await storageService.addItemToContainer(targetId, selectedItem.id);
      }
      
      loadData();
      Alert.alert('Успешно', `"${selectedItem.name}" перемещен в "${targetItem?.name}"`);
    } catch (error) {
      console.log('Error moving item:', error);
      Alert.alert('Ошибка', 'Не удалось переместить предмет');
    }
  };

  const renderTreeNode = (node: TreeNode): React.ReactNode => {
    const { item, children, isExpanded, level } = node;
    const hasChildren = children.length > 0;
    const indentWidth = Math.min(level * 20, 200); // Max indent to prevent overflow
    
    // Truncate text if it's too long based on level
    const maxTextLength = Math.max(30 - level * 2, 15);
    const truncatedName = item.name.length > maxTextLength 
      ? item.name.substring(0, maxTextLength - 3) + '...'
      : item.name;
    
    return (
      <View key={item.id}>
        <Pressable
          style={[styles.treeItem, { paddingLeft: 16 + indentWidth }]}
          onPress={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              router.push(`/item-detail?id=${item.id}`);
            }
          }}
          onLongPress={() => handleLongPress(item)}
        >
          <View style={styles.treeItemContent}>
            {hasChildren && (
              <Pressable
                style={styles.expandButton}
                onPress={() => toggleExpanded(item.id)}
              >
                <IconSymbol 
                  name={isExpanded ? "chevron.down" : "chevron.right"} 
                  size={16} 
                  color={colors.textSecondary} 
                />
              </Pressable>
            )}
            
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.treeItemImage} />
            ) : (
              <View style={[styles.treeItemImage, styles.treeItemImagePlaceholder]}>
                <IconSymbol 
                  name={item.type === 'section' ? "folder.fill" : "cube.box.fill"} 
                  size={20} 
                  color={item.type === 'section' ? (item.color || colors.primary) : colors.textSecondary} 
                />
              </View>
            )}
            
            <View style={styles.treeItemInfo}>
              <View style={styles.treeItemHeader}>
                <Text style={[
                  styles.treeItemName,
                  item.type === 'section' && styles.sectionName
                ]} numberOfLines={1}>
                  {item.type === 'section' && item.emoji} {truncatedName}
                </Text>
                {hasChildren && (
                  <Text style={styles.childrenCount}>
                    ({children.length})
                  </Text>
                )}
              </View>
              
              {item.description && (
                <Text style={styles.treeItemDescription} numberOfLines={1}>
                  {item.description.length > 40 ? item.description.substring(0, 37) + '...' : item.description}
                </Text>
              )}
              
              <View style={styles.treeItemMeta}>
                <Text style={styles.treeItemMetaText}>№{item.serialNumber}</Text>
                {item.type !== 'section' && item.price > 0 && (
                  <Text style={styles.treeItemPrice}>
                    {item.price.toLocaleString()} ₽
                  </Text>
                )}
                {item.type !== 'section' && item.quantity > 1 && (
                  <Text style={styles.treeItemQuantity}>
                    x{item.quantity}
                  </Text>
                )}
                {item.isOnLoan && (
                  <View style={styles.loanIndicator}>
                    <IconSymbol name="arrow.up.right.square.fill" size={10} color={colors.warning} />
                  </View>
                )}
              </View>
            </View>
          </View>
        </Pressable>
        
        {isExpanded && children.map(child => renderTreeNode(child))}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="cube.box" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>
        Инвентарь пуст
      </Text>
      <Text style={styles.emptyStateDescription}>
        Добавьте первый предмет или раздел, нажав кнопку "+" внизу экрана
      </Text>
      <View style={styles.emptyStateButtons}>
        <Pressable
          style={[commonStyles.button, { backgroundColor: colors.primary, marginRight: 8 }]}
          onPress={() => router.push('/add-item')}
        >
          <IconSymbol name="plus" size={20} color={colors.white} />
          <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
            Добавить предмет
          </Text>
        </Pressable>
        <Pressable
          style={[commonStyles.button, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/add-section')}
        >
          <IconSymbol name="folder.badge.plus" size={20} color={colors.white} />
          <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
            Добавить раздел
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const getTotalStats = () => {
    const items = allItems.filter(item => item.type !== 'section');
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    
    return { totalValue, totalWeight, totalItems: items.length };
  };

  const { totalValue, totalWeight, totalItems } = getTotalStats();

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      {/* Stats Bar */}
      {totalItems > 0 && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            Предметов: {totalItems}
          </Text>
          {totalValue > 0 && (
            <Text style={styles.statsText}>
              Стоимость: {totalValue.toLocaleString()} ₽
            </Text>
          )}
          {totalWeight > 0 && (
            <Text style={styles.statsText}>
              Вес: {totalWeight.toFixed(1)} кг
            </Text>
          )}
        </View>
      )}
      
      <ScrollView
        style={styles.treeContainer}
        contentContainerStyle={treeNodes.length === 0 ? styles.emptyContainer : styles.treeContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        {treeNodes.length > 0 ? (
          treeNodes.map(node => renderTreeNode(node))
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
      
      {/* Floating Add Buttons */}
      <View style={styles.fabContainer}>
        <Pressable
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => router.push('/add-section')}
        >
          <IconSymbol name="folder.badge.plus" size={20} color={colors.white} />
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/add-item')}
        >
          <IconSymbol name="plus" size={24} color={colors.white} />
        </Pressable>
      </View>

      {/* Context Menu */}
      <ContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        options={{
          title: selectedItem?.name,
          actions: [
            {
              id: 'view',
              title: 'Просмотреть',
              icon: 'eye.fill',
              color: colors.primary,
            },
            {
              id: 'edit',
              title: 'Редактировать',
              icon: 'pencil',
              color: colors.info,
            },
            {
              id: 'move',
              title: 'Переместить',
              icon: 'arrow.right.circle',
              color: colors.secondary,
            },
            {
              id: 'delete',
              title: 'Удалить',
              icon: 'trash.fill',
              destructive: true,
            },
          ]
        }}
        onAction={handleContextAction}
      />

      {/* Tree Move Menu */}
      <TreePlacementMenu
        visible={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onSelect={handleMoveItem}
        items={allItems}
        selectedItemId={selectedItem?.id}
        excludeItemId={selectedItem?.id}
        title={`Переместить "${selectedItem?.name}"`}
        maxLevels={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  treeContainer: {
    flex: 1,
  },
  treeContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  treeItem: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingRight: 16,
  },
  treeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  treeItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  treeItemImagePlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeItemInfo: {
    flex: 1,
  },
  treeItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  treeItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  sectionName: {
    color: colors.primary,
    fontWeight: '700',
  },
  childrenCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  treeItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  treeItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  treeItemMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 12,
  },
  treeItemPrice: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginRight: 12,
  },
  treeItemQuantity: {
    fontSize: 12,
    color: colors.info,
    fontWeight: '500',
    marginRight: 8,
  },
  loanIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  fabSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
  },
});
