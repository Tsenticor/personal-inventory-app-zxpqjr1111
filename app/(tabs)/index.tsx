
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { InventoryItem, Section } from '@/types/inventory';

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const filteredItems = selectedSection
    ? items.filter(item => item.sectionId === selectedSection)
    : items;

  const renderSectionFilter = () => (
    <View style={{ marginBottom: 16 }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: 'all', name: 'Все', emoji: '📦' }, ...sections]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <Pressable
            style={[
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor: selectedSection === (item.id === 'all' ? null : item.id)
                  ? colors.primary
                  : colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }
            ]}
            onPress={() => setSelectedSection(item.id === 'all' ? null : item.id)}
          >
            <Text style={{
              color: selectedSection === (item.id === 'all' ? null : item.id)
                ? 'white'
                : colors.text,
              fontWeight: '500',
            }}>
              {item.emoji} {item.name}
            </Text>
          </Pressable>
        )}
      />
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
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              №{item.serialNumber} • {item.quantity} шт. • {item.price}₽
            </Text>
          </View>
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
      <Text style={{ fontSize: 60, marginBottom: 16 }}>📦</Text>
      <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
        Инвентарь пуст
      </Text>
      <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 24 }]}>
        Добавьте первый предмет, чтобы начать учёт вашего имущества
      </Text>
      <Pressable
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
        onPress={() => router.push('/add-item')}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Добавить предмет
        </Text>
      </Pressable>
    </View>
  );

  const getTotalStats = () => {
    const totalValue = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
    return { totalValue, totalItems };
  };

  const { totalValue, totalItems } = getTotalStats();

  return (
    <View style={commonStyles.container}>
      {filteredItems.length > 0 && (
        <>
          {renderSectionFilter()}
          
          <View style={{
            backgroundColor: colors.card,
            marginHorizontal: 16,
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {totalItems}
              </Text>
              <Text style={commonStyles.textSecondary}>предметов</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {totalValue.toLocaleString()}₽
              </Text>
              <Text style={commonStyles.textSecondary}>общая стоимость</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                {sections.length}
              </Text>
              <Text style={commonStyles.textSecondary}>разделов</Text>
            </View>
          </View>
        </>
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      <Pressable
        style={commonStyles.fab}
        onPress={() => router.push('/add-item')}
      >
        <IconSymbol name="plus" size={24} color="white" />
      </Pressable>
    </View>
  );
}
