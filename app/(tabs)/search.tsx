
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { searchService } from '@/services/searchService';
import { InventoryItem, Section, SearchFilters } from '@/types/inventory';
import { ContextMenu } from '@/components/ContextMenu';

export default function SearchScreen() {
  const params = useLocalSearchParams();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sectionId: params.sectionId as string || undefined,
    sortBy: 'name',
    sortOrder: 'asc',
    includeArchived: false,
  });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const loadData = async () => {
    try {
      const [itemsData, sectionsData] = await Promise.all([
        storageService.getItems(),
        storageService.getSections(),
      ]);
      setItems(itemsData);
      setSections(sectionsData);
    } catch (error) {
      console.log('Error loading data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    setFilters(prev => ({ ...prev, query: searchQuery }));
  }, [searchQuery]);

  const filteredItems = searchService.searchItems(items, filters);

  const renderSortOptions = () => (
    <View style={{ marginBottom: 16, paddingHorizontal: 16 }}>
      <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
        Сортировка:
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {[
          { key: 'name', label: 'По названию' },
          { key: 'createdAt', label: 'По дате' },
          { key: 'price', label: 'По цене' },
          { key: 'quantity', label: 'По количеству' },
        ].map((option) => (
          <Pressable
            key={option.key}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginRight: 8,
              marginBottom: 8,
              borderRadius: 16,
              backgroundColor: filters.sortBy === option.key ? colors.primary : colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => setFilters(prev => ({ 
              ...prev, 
              sortBy: option.key as any,
              sortOrder: prev.sortBy === option.key && prev.sortOrder === 'asc' ? 'desc' : 'asc'
            }))}
          >
            <Text style={{
              color: filters.sortBy === option.key ? 'white' : colors.text,
              fontSize: 14,
            }}>
              {option.label} {filters.sortBy === option.key && (filters.sortOrder === 'asc' ? '↑' : '↓')}
            </Text>
          </Pressable>
        ))}
      </View>
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
      case 'loan':
        // Handle loan logic here
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
              <IconSymbol name="cube.box.fill" size={20} color={colors.textSecondary} />
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
              {section && (
                <View style={styles.itemMetaItem}>
                  <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                  <Text style={styles.itemMetaText}>{section.name}</Text>
                </View>
              )}
              <Text style={styles.itemMetaText}>№{item.serialNumber}</Text>
            </View>
          </View>
          
          <View style={styles.itemActions}>
            <Text style={styles.itemPrice}>
              {item.price > 0 ? `${item.price.toLocaleString()}₽` : 'Бесплатно'}
            </Text>
            {item.quantity > 1 && (
              <Text style={styles.itemQuantity}>
                Кол-во: {item.quantity}
              </Text>
            )}
            {item.isOnLoan && (
              <View style={styles.loanBadge}>
                <IconSymbol name="arrow.up.right.square.fill" size={10} color={colors.warning} />
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
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    }}>
      <Text style={{ fontSize: 60, marginBottom: 16 }}>🔍</Text>
      <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
        {searchQuery ? 'Ничего не найдено' : 'Введите запрос для поиска'}
      </Text>
      <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
        {searchQuery 
          ? 'Попробуйте изменить поисковый запрос или фильтры'
          : 'Найдите нужные предметы по названию, описанию или местоположению'
        }
      </Text>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <TextInput
          style={[commonStyles.input, { marginBottom: 0 }]}
          placeholder="Поиск предметов..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {filteredItems.length > 0 && renderSortOptions()}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        ListEmptyComponent={renderEmptyState}
      />

      {searchQuery && filteredItems.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 100,
          left: 16,
          right: 16,
          backgroundColor: colors.card,
          padding: 12,
          borderRadius: 8,
          flexDirection: 'row',
          justifyContent: 'center',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          elevation: 4,
        }}>
          <Text style={commonStyles.textSecondary}>
            Найдено: {filteredItems.length} предметов
          </Text>
        </View>
      )}

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
              id: 'loan',
              title: selectedItem?.isOnLoan ? 'Вернуть' : 'Выдать',
              icon: selectedItem?.isOnLoan ? 'arrow.down.left.circle.fill' : 'arrow.up.right.circle.fill',
              color: selectedItem?.isOnLoan ? colors.success : colors.warning,
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
  sectionEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  itemMetaText: {
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
});
