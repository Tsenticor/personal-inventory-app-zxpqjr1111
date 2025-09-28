
import { commonStyles, colors } from '@/styles/commonStyles';
import { InventoryItem, Section } from '@/types/inventory';
import { storageService } from '@/services/storageService';
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { ContextMenu } from '@/components/ContextMenu';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, sectionsData] = await Promise.all([
        storageService.getItems(),
        storageService.getSections(),
      ]);
      
      // Initialize default sections if none exist
      if (sectionsData.length === 0) {
        await storageService.initializeDefaultSections();
        const newSectionsData = await storageService.getSections();
        setSections(newSectionsData.filter(s => !s.isArchived));
      } else {
        setSections(sectionsData.filter(s => !s.isArchived));
      }
      
      setItems(itemsData.filter(item => !item.isArchived));
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

  const filteredItems = selectedSectionId === 'all' 
    ? items 
    : items.filter(item => item.sectionId === selectedSectionId);

  const renderSectionFilter = () => (
    <View style={styles.sectionFilter}>
      <Pressable
        style={[
          styles.sectionFilterItem,
          selectedSectionId === 'all' && styles.sectionFilterItemActive
        ]}
        onPress={() => setSelectedSectionId('all')}
      >
        <Text style={[
          styles.sectionFilterText,
          selectedSectionId === 'all' && styles.sectionFilterTextActive
        ]}>
          Все ({items.length})
        </Text>
      </Pressable>
      
      {sections.map((section) => {
        const sectionItemCount = items.filter(item => item.sectionId === section.id).length;
        return (
          <Pressable
            key={section.id}
            style={[
              styles.sectionFilterItem,
              selectedSectionId === section.id && styles.sectionFilterItemActive
            ]}
            onPress={() => setSelectedSectionId(section.id)}
          >
            <Text style={styles.sectionEmoji}>{section.emoji}</Text>
            <Text style={[
              styles.sectionFilterText,
              selectedSectionId === section.id && styles.sectionFilterTextActive
            ]}>
              {section.name} ({sectionItemCount})
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

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
      case 'delete':
        Alert.alert(
          'Удалить предмет',
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
                  Alert.alert('Успешно', 'Предмет удален');
                } catch (error) {
                  console.log('Error deleting item:', error);
                  Alert.alert('Ошибка', 'Не удалось удалить предмет');
                }
              },
            },
          ]
        );
        break;
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const section = sections.find(s => s.id === item.sectionId);
    
    return (
      <Pressable
        style={styles.itemCard}
        onPress={() => router.push(`/item-detail?id=${item.id}`)}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.itemHeader}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
              <IconSymbol name="cube.box.fill" size={24} color={colors.textSecondary} />
            </View>
          )}
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.itemDescription} numberOfLines={2}>
              {item.description || 'Без описания'}
            </Text>
            
            <View style={styles.itemMeta}>
              <View style={styles.itemMetaItem}>
                <Text style={styles.itemMetaLabel}>№{item.serialNumber}</Text>
              </View>
              {section && (
                <View style={styles.itemMetaItem}>
                  <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                  <Text style={styles.itemMetaLabel}>{section.name}</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.itemActions}>
            <Text style={styles.itemPrice}>
              {item.price > 0 ? `${item.price.toLocaleString()} ₽` : 'Бесплатно'}
            </Text>
            {item.quantity > 1 && (
              <Text style={styles.itemQuantity}>
                Кол-во: {item.quantity}
              </Text>
            )}
            {item.isOnLoan && (
              <View style={styles.loanBadge}>
                <IconSymbol name="arrow.up.right.square.fill" size={12} color={colors.warning} />
                <Text style={styles.loanBadgeText}>На выдаче</Text>
              </View>
            )}
          </View>
        </View>
        
        {item.tags.length > 0 && (
          <View style={styles.itemTags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.itemTag}>
                <Text style={styles.itemTagText}>{tag}</Text>
              </View>
            ))}
            {item.tags.length > 3 && (
              <Text style={styles.itemTagsMore}>+{item.tags.length - 3}</Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="cube.box" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>
        {selectedSectionId === 'all' ? 'Нет предметов' : 'Нет предметов в этом разделе'}
      </Text>
      <Text style={styles.emptyStateDescription}>
        Добавьте первый предмет, нажав кнопку "+" внизу экрана
      </Text>
      <Pressable
        style={[commonStyles.button, { backgroundColor: colors.primary, marginTop: 16 }]}
        onPress={() => router.push(`/add-item${selectedSectionId !== 'all' ? `?sectionId=${selectedSectionId}` : ''}`)}
      >
        <IconSymbol name="plus" size={20} color={colors.white} />
        <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
          Добавить предмет
        </Text>
      </Pressable>
    </View>
  );

  const getTotalStats = () => {
    const totalValue = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalWeight = filteredItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    
    return { totalValue, totalWeight };
  };

  const { totalValue, totalWeight } = getTotalStats();

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      {renderSectionFilter()}
      
      {filteredItems.length > 0 && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            Предметов: {filteredItems.length}
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
      
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={filteredItems.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Floating Add Button */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push(`/add-item${selectedSectionId !== 'all' ? `?sectionId=${selectedSectionId}` : ''}`)}
      >
        <IconSymbol name="plus" size={24} color={colors.white} />
      </Pressable>

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
              id: 'delete',
              title: 'Удалить',
              icon: 'trash.fill',
              destructive: true,
            },
          ]
        }}
        onAction={handleContextAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionFilter: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionFilterItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sectionFilterText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  sectionFilterTextActive: {
    color: colors.white,
  },
  sectionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
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
  listContainer: {
    padding: 16,
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
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  itemMetaLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  loanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loanBadgeText: {
    fontSize: 10,
    color: colors.warning,
    marginLeft: 2,
    fontWeight: '600',
  },
  itemTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  itemTagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  itemTagsMore: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
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
  },
});
