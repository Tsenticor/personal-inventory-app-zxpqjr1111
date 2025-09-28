
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Image,
  StyleSheet,
  Share,
} from 'react-native';
import { Stack, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { searchService } from '@/services/searchService';
import { InventoryItem, Section, EventLog } from '@/types/inventory';
import { QuantitySelector } from '@/components/QuantitySelector';
import { ContextMenu } from '@/components/ContextMenu';

export default function ItemDetailScreen() {
  const params = useLocalSearchParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [containedItems, setContainedItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const loadItemData = useCallback(async () => {
    if (!itemId) return;
    
    try {
      setLoading(true);
      const items = await storageService.getItems();
      const foundItem = items.find(i => i.id === itemId);
      
      if (!foundItem) {
        Alert.alert('Ошибка', 'Предмет не найден', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      setItem(foundItem);

      // Load sections
      const sectionsData = await storageService.getSections();
      setSections(sectionsData);
      const itemSection = sectionsData.find(s => s.id === foundItem.sectionId);
      setSection(itemSection || null);

      // Load events for this item
      const itemEvents = await storageService.getEventsByItem(itemId);
      setEvents(itemEvents);

      // Load contained items if this is a container
      if (foundItem.containedItems && foundItem.containedItems.length > 0) {
        const contained = await storageService.getContainedItems(itemId);
        setContainedItems(contained);
      }
    } catch (error) {
      console.log('Error loading item data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные предмета');
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useFocusEffect(
    useCallback(() => {
      loadItemData();
    }, [loadItemData])
  );

  const handleDelete = () => {
    if (!item) return;

    Alert.alert(
      'Удалить предмет',
      `Вы уверены, что хотите удалить "${item.name}"? Это действие нельзя отменить.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteItem(itemId);
              Alert.alert('Успешно', 'Предмет удалён', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.log('Error deleting item:', error);
              Alert.alert('Ошибка', 'Не удалось удалить предмет');
            }
          },
        },
      ]
    );
  };

  const handleToggleLoan = async () => {
    if (!item) return;

    if (item.isOnLoan) {
      // Return item
      try {
        const success = await storageService.returnLoanedItem(itemId);
        if (success) {
          loadItemData();
          Alert.alert('Успешно', 'Предмет возвращён');
        } else {
          Alert.alert('Ошибка', 'Не удалось вернуть предмет');
        }
      } catch (error) {
        console.log('Error returning item:', error);
        Alert.alert('Ошибка', 'Не удалось вернуть предмет');
      }
    } else {
      // Loan item - show quantity selector if quantity > 1
      if (item.quantity > 1) {
        setShowQuantitySelector(true);
      } else {
        // Simple loan for single item
        Alert.prompt(
          'Выдача предмета',
          'Кому выдается предмет?',
          [
            { text: 'Отмена', style: 'cancel' },
            {
              text: 'Выдать',
              onPress: async (loanedTo) => {
                if (!loanedTo?.trim()) return;
                
                try {
                  const success = await storageService.loanItemWithQuantity(itemId, 1, loanedTo.trim());
                  if (success) {
                    loadItemData();
                    Alert.alert('Успешно', 'Предмет выдан');
                  } else {
                    Alert.alert('Ошибка', 'Не удалось выдать предмет');
                  }
                } catch (error) {
                  console.log('Error loaning item:', error);
                  Alert.alert('Ошибка', 'Не удалось выдать предмет');
                }
              }
            }
          ],
          'plain-text'
        );
      }
    }
  };

  const handleQuantityLoan = async (quantity: number, loanedTo: string) => {
    try {
      const success = await storageService.loanItemWithQuantity(itemId, quantity, loanedTo);
      if (success) {
        loadItemData();
        Alert.alert('Успешно', `Выдано ${quantity} из ${item?.quantity} предметов`);
      } else {
        Alert.alert('Ошибка', 'Не удалось выдать предмет');
      }
    } catch (error) {
      console.log('Error loaning item with quantity:', error);
      Alert.alert('Ошибка', 'Не удалось выдать предмет');
    }
  };

  const handleMoveItem = (targetSectionId: string) => {
    if (!item) return;

    Alert.alert(
      'Переместить предмет',
      `Переместить "${item.name}" в выбранный раздел?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Переместить',
          onPress: async () => {
            try {
              const targetSection = sections.find(s => s.id === targetSectionId);
              const updatedItem = await storageService.updateItem(itemId, {
                sectionId: targetSectionId,
              });

              if (updatedItem) {
                loadItemData();
                Alert.alert('Успешно', `Предмет перемещен в "${targetSection?.name}"`);
              } else {
                Alert.alert('Ошибка', 'Не удалось переместить предмет');
              }
            } catch (error) {
              console.log('Error moving item:', error);
              Alert.alert('Ошибка', 'Не удалось переместить предмет');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    if (!item) return;

    try {
      const shareText = `
${item.name}
${item.description ? `\n${item.description}` : ''}
${section ? `\nРаздел: ${section.name}` : ''}
${item.price > 0 ? `\nЦена: ${item.price.toLocaleString()} ₽` : ''}
${item.weight > 0 ? `\nВес: ${item.weight} кг` : ''}
${item.quantity > 1 ? `\nКоличество: ${item.quantity}` : ''}
${item.tags.length > 0 ? `\nТеги: ${item.tags.join(', ')}` : ''}

Серийный номер: ${item.serialNumber}
      `.trim();

      await Share.share({
        message: shareText,
        title: item.name,
      });
    } catch (error) {
      console.log('Error sharing item:', error);
    }
  };

  const formatEventTime = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'created': return 'plus.circle.fill';
      case 'updated': return 'pencil.circle.fill';
      case 'moved': return 'arrow.right.circle.fill';
      case 'deleted': return 'trash.circle.fill';
      case 'loaned': return 'arrow.up.right.circle.fill';
      case 'returned': return 'arrow.down.left.circle.fill';
      case 'archived': return 'archivebox.circle.fill';
      case 'restored': return 'arrow.up.bin.fill';
      case 'copied': return 'doc.on.doc.fill';
      default: return 'circle.fill';
    }
  };

  const getConditionColor = (condition: string): string => {
    switch (condition) {
      case 'new': return colors.success;
      case 'excellent': return colors.info;
      case 'good': return colors.primary;
      case 'fair': return colors.warning;
      case 'poor': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getConditionLabel = (condition: string): string => {
    switch (condition) {
      case 'new': return 'Новое';
      case 'excellent': return 'Отличное';
      case 'good': return 'Хорошее';
      case 'fair': return 'Удовлетворительное';
      case 'poor': return 'Плохое';
      default: return condition;
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Загрузка...</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Предмет не найден</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: item.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={handleShare} style={styles.headerButton}>
                <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
              </Pressable>
              <Pressable onPress={() => router.push(`/edit-item?id=${itemId}`)} style={styles.headerButton}>
                <IconSymbol name="pencil" size={20} color={colors.primary} />
              </Pressable>
            </View>
          ),
        }}
      />
      
      <ScrollView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        {/* Main Info */}
        <View style={commonStyles.section}>
          <View style={styles.mainInfo}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.itemPhoto} />
            ) : (
              <View style={[styles.itemPhoto, styles.itemPhotoPlaceholder]}>
                <IconSymbol name="cube.box.fill" size={48} color={colors.textSecondary} />
              </View>
            )}
            
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.serialNumber}>№ {item.serialNumber}</Text>
              
              {section && (
                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                  <Text style={styles.sectionName}>{section.name}</Text>
                </View>
              )}
              
              <View style={styles.statusBadges}>
                <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) + '20' }]}>
                  <Text style={[styles.conditionText, { color: getConditionColor(item.condition) }]}>
                    {getConditionLabel(item.condition)}
                  </Text>
                </View>
                
                {item.isOnLoan && (
                  <View style={styles.loanBadge}>
                    <IconSymbol name="arrow.up.right.square.fill" size={14} color={colors.warning} />
                    <Text style={styles.loanBadgeText}>На выдаче</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
        </View>

        {/* Properties */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Характеристики</Text>
          <View style={styles.propertiesGrid}>
            <View style={styles.propertyItem}>
              <IconSymbol name="rublesign.circle.fill" size={20} color={colors.success} />
              <Text style={styles.propertyLabel}>Цена</Text>
              <Text style={styles.propertyValue}>
                {item.price > 0 ? `${item.price.toLocaleString()} ₽` : 'Бесплатно'}
              </Text>
            </View>
            
            <View style={styles.propertyItem}>
              <IconSymbol name="scalemass.fill" size={20} color={colors.secondary} />
              <Text style={styles.propertyLabel}>Вес</Text>
              <Text style={styles.propertyValue}>
                {item.weight > 0 ? `${item.weight} кг` : 'Не указан'}
              </Text>
            </View>
            
            <View style={styles.propertyItem}>
              <IconSymbol name="number.circle.fill" size={20} color={colors.info} />
              <Text style={styles.propertyLabel}>Количество</Text>
              <Text style={styles.propertyValue}>{item.quantity}</Text>
            </View>
            
            {item.purchaseDate && (
              <View style={styles.propertyItem}>
                <IconSymbol name="calendar.circle.fill" size={20} color={colors.primary} />
                <Text style={styles.propertyLabel}>Дата покупки</Text>
                <Text style={styles.propertyValue}>
                  {item.purchaseDate.toLocaleDateString('ru-RU')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Tags */}
        {item.tags.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Теги</Text>
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contained Items */}
        {containedItems.length > 0 && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Содержимое ({containedItems.length})</Text>
            <View style={styles.containedItemsContainer}>
              {containedItems.map((containedItem) => (
                <Pressable
                  key={containedItem.id}
                  style={styles.containedItem}
                  onPress={() => router.push(`/item-detail?id=${containedItem.id}`)}
                >
                  {containedItem.photo ? (
                    <Image source={{ uri: containedItem.photo }} style={styles.containedItemImage} />
                  ) : (
                    <View style={[styles.containedItemImage, styles.containedItemImagePlaceholder]}>
                      <IconSymbol name="cube.box.fill" size={16} color={colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.containedItemInfo}>
                    <Text style={styles.containedItemName} numberOfLines={1}>
                      {containedItem.name}
                    </Text>
                    <Text style={styles.containedItemDetails}>
                      Кол-во: {containedItem.quantity} • {containedItem.price}₽
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Действия</Text>
          
          <Pressable
            style={[commonStyles.button, { backgroundColor: item.isOnLoan ? colors.success : colors.warning }]}
            onPress={handleToggleLoan}
          >
            <IconSymbol 
              name={item.isOnLoan ? "arrow.down.left.circle.fill" : "arrow.up.right.circle.fill"} 
              size={20} 
              color={colors.white} 
            />
            <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
              {item.isOnLoan ? 'Вернуть предмет' : 'Выдать предмет'}
            </Text>
          </Pressable>

          <Pressable
            style={[commonStyles.button, { backgroundColor: colors.info, marginTop: 12 }]}
            onPress={() => setShowMoveMenu(true)}
          >
            <IconSymbol name="arrow.right.circle.fill" size={20} color={colors.white} />
            <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
              Переместить предмет
            </Text>
          </Pressable>

          <Pressable
            style={[commonStyles.button, { backgroundColor: colors.error, marginTop: 12 }]}
            onPress={handleDelete}
          >
            <IconSymbol name="trash.fill" size={20} color={colors.white} />
            <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
              Удалить предмет
            </Text>
          </Pressable>
        </View>

        {/* History */}
        <View style={commonStyles.section}>
          <View style={styles.sectionHeader}>
            <Text style={commonStyles.sectionTitle}>История изменений</Text>
            <Pressable onPress={() => router.push(`/item-history?itemId=${itemId}`)}>
              <Text style={styles.seeAllText}>Подробнее</Text>
            </Pressable>
          </View>
          
          {events.length > 0 ? (
            <View style={styles.eventsContainer}>
              {events.slice(0, 3).map((event) => (
                <View key={event.id} style={styles.eventItem}>
                  <IconSymbol 
                    name={getEventIcon(event.type)} 
                    size={16} 
                    color={colors.primary} 
                  />
                  <View style={styles.eventContent}>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                    <Text style={styles.eventTime}>
                      {formatEventTime(event.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyEvents}>
              <Text style={styles.emptyEventsText}>Нет событий</Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Quantity Selector Modal */}
      <QuantitySelector
        visible={showQuantitySelector}
        onClose={() => setShowQuantitySelector(false)}
        onConfirm={handleQuantityLoan}
        maxQuantity={searchService.getAvailableQuantity(item)}
        itemName={item.name}
      />

      {/* Move Menu Modal */}
      <ContextMenu
        visible={showMoveMenu}
        onClose={() => setShowMoveMenu(false)}
        options={{
          title: 'Переместить в раздел',
          actions: sections
            .filter(s => s.id !== item.sectionId)
            .map(s => ({
              id: s.id,
              title: `${s.emoji} ${s.name}`,
              icon: 'folder.fill',
              color: s.color,
            }))
        }}
        onAction={handleMoveItem}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  mainInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  itemPhoto: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
  },
  itemPhotoPlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  serialNumber: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  sectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  sectionName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  loanBadgeText: {
    fontSize: 12,
    color: colors.warning,
    marginLeft: 4,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  propertyItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  propertyLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  propertyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  eventsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventContent: {
    flex: 1,
    marginLeft: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  eventTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyEvents: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyEventsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  containedItemsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  containedItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  containedItemImagePlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containedItemInfo: {
    flex: 1,
  },
  containedItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  containedItemDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
