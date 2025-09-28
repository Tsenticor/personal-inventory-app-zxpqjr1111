
import React, { useState, useCallback } from 'react';
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
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { searchService } from '@/services/searchService';
import { InventoryItem, Section } from '@/types/inventory';
import { ContextMenu } from '@/components/ContextMenu';

export default function LoansScreen() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
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
    const loanedQuantity = item.loanQuantity || item.quantity;
    const returnMessage = loanedQuantity < item.quantity 
      ? `Вернуть ${loanedQuantity} из ${item.quantity} "${item.name}" от ${item.loanedTo}?`
      : `Вернуть "${item.name}" от ${item.loanedTo}?`;

    Alert.alert(
      'Вернуть предмет',
      returnMessage,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Вернуть',
          onPress: async () => {
            try {
              const success = await storageService.returnLoanedItem(item.id);
              if (success) {
                loadData();
                Alert.alert('Успешно', 'Предмет возвращён');
              } else {
                Alert.alert('Ошибка', 'Не удалось вернуть предмет');
              }
            } catch (error) {
              console.log('Error returning item:', error);
              Alert.alert('Ошибка', 'Не удалось вернуть предмет');
            }
          },
        },
      ]
    );
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
      case 'return':
        handleReturnItem(selectedItem);
        break;
      case 'edit':
        router.push(`/edit-item?id=${selectedItem.id}`);
        break;
    }
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
    const loanedQuantity = item.loanQuantity || item.quantity;
    const isPartialLoan = loanedQuantity < item.quantity;
    
    return (
      <Pressable
        style={styles.loanCard}
        onPress={() => router.push(`/item-detail?id=${item.id}`)}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.loanHeader}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.itemImage} />
          ) : (
            <View style={[styles.itemImage, styles.itemImagePlaceholder]}>
              <IconSymbol name="cube.box.fill" size={20} color={colors.textSecondary} />
            </View>
          )}
          
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.loanedTo}>Выдано: {item.loanedTo}</Text>
            <Text style={styles.loanDate}>
              {item.loanedAt && formatLoanDate(item.loanedAt)} • №{item.serialNumber}
            </Text>
            
            {section && (
              <View style={styles.sectionInfo}>
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <Text style={styles.sectionName}>{section.name}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.loanActions}>
            {isPartialLoan && (
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>
                  {loanedQuantity}/{item.quantity}
                </Text>
              </View>
            )}
            
            <Pressable
              style={styles.returnButton}
              onPress={() => handleReturnItem(item)}
            >
              <IconSymbol name="arrow.down.left.circle.fill" size={16} color={colors.white} />
              <Text style={styles.returnButtonText}>ВЕРНУТЬ</Text>
            </Pressable>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
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
              id: 'return',
              title: 'Вернуть',
              icon: 'arrow.down.left.circle.fill',
              color: colors.success,
            },
            {
              id: 'edit',
              title: 'Редактировать',
              icon: 'pencil',
              color: colors.info,
            },
          ]
        }}
        onAction={handleContextAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loanCard: {
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  loanHeader: {
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
  loanedTo: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '500',
    marginBottom: 2,
  },
  loanDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  sectionName: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  loanActions: {
    alignItems: 'flex-end',
  },
  quantityBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  quantityText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  returnButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    lineHeight: 18,
  },
});
