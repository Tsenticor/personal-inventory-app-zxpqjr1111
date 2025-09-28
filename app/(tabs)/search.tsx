
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { searchService } from '@/services/searchService';
import { InventoryItem, Section, SearchFilters } from '@/types/inventory';

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
  });

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

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const section = sections.find(s => s.id === item.sectionId);
    
    return (
      <Pressable
        style={commonStyles.listItem}
        onPress={() => router.push(`/item/${item.id}`)}
      >
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: section?.color || colors.grey,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 20 }}>{section?.emoji || '📦'}</Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
            {item.name}
          </Text>
          <Text style={commonStyles.textSecondary} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 2 }]}>
            {section?.name} • №{item.serialNumber} • {item.quantity} шт. • {item.price}₽
          </Text>
        </View>
        
        <View style={{ alignItems: 'flex-end' }}>
          {item.isOnLoan && (
            <View style={{
              backgroundColor: colors.destructive,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginBottom: 4,
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>
                НА ВЫДАЧЕ
              </Text>
            </View>
          )}
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </View>
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
          style={commonStyles.searchBar}
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
    </View>
  );
}
