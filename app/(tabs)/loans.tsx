
import React, { useState, useCallback } from 'react';
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

export default function LoansScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
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

  const loanedItems = items.filter(item => item.isOnLoan);

  const handleReturnItem = (item: InventoryItem) => {
    Alert.alert(
      'Вернуть предмет',
      `Вернуть "${item.name}" обратно в инвентарь?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Вернуть',
          onPress: async () => {
            try {
              await storageService.updateItem(item.id, {
                isOnLoan: false,
                loanedTo: undefined,
                loanedAt: undefined,
              });
              
              await storageService.logEvent({
                type: 'returned',
                itemId: item.id,
                itemName: item.name,
                description: `Предмет "${item.name}" возвращён в инвентарь`,
              });
              
              loadData();
            } catch (error) {
              console.log('Error returning item:', error);
              Alert.alert('Ошибка', 'Не удалось вернуть предмет');
            }
          },
        },
      ]
    );
  };

  const formatLoanDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Сегодня';
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дней назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const section = sections.find(s => s.id === item.sectionId);
    
    return (
      <Pressable
        style={[commonStyles.listItem, { backgroundColor: '#FFF3CD' }]}
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
            Выдано: {item.loanedTo}
          </Text>
          <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 2 }]}>
            {item.loanedAt && formatLoanDate(item.loanedAt)} • №{item.serialNumber}
          </Text>
        </View>
        
        <View style={{ alignItems: 'flex-end' }}>
          <Pressable
            style={{
              backgroundColor: colors.accent,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              marginBottom: 4,
            }}
            onPress={() => handleReturnItem(item)}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
              ВЕРНУТЬ
            </Text>
          </Pressable>
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
      <Text style={{ fontSize: 60, marginBottom: 16 }}>✅</Text>
      <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
        Все предметы на месте
      </Text>
      <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
        У вас нет предметов на выдаче. Все вещи находятся в инвентаре.
      </Text>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      {loanedItems.length > 0 && (
        <View style={{
          backgroundColor: '#FFF3CD',
          marginHorizontal: 16,
          marginTop: 16,
          marginBottom: 16,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#FFEAA7',
        }}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
            📋 Предметы на выдаче: {loanedItems.length}
          </Text>
          <Text style={commonStyles.textSecondary}>
            Нажмите "ВЕРНУТЬ" чтобы вернуть предмет в инвентарь
          </Text>
        </View>
      )}

      <FlatList
        data={loanedItems}
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
    </View>
  );
}
