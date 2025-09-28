
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useFocusEffect, Stack, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { EventLog, InventoryItem } from '@/types/inventory';

export default function ItemHistoryScreen() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const [events, setEvents] = useState<EventLog[]>([]);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!itemId) {
      Alert.alert('Ошибка', 'ID предмета не указан');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const [itemEvents, items] = await Promise.all([
        storageService.getEventsByItem(itemId),
        storageService.getItems(),
      ]);

      const currentItem = items.find(i => i.id === itemId);
      setItem(currentItem || null);
      setEvents(itemEvents);
    } catch (error) {
      console.log('Error loading item history:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить историю предмета');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [itemId])
  );

  const formatEventTime = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return { icon: '➕', color: '#4CAF50' };
      case 'updated': return { icon: '✏️', color: '#2196F3' };
      case 'moved': return { icon: '📦', color: '#FF9800' };
      case 'deleted': return { icon: '🗑️', color: '#F44336' };
      case 'loaned': return { icon: '📤', color: '#9C27B0' };
      case 'returned': return { icon: '📥', color: '#4CAF50' };
      case 'archived': return { icon: '📁', color: '#607D8B' };
      case 'restored': return { icon: '♻️', color: '#4CAF50' };
      case 'copied': return { icon: '📋', color: '#00BCD4' };
      default: return { icon: '📋', color: colors.textSecondary };
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'created': return 'Создан';
      case 'updated': return 'Изменён';
      case 'moved': return 'Перемещён';
      case 'deleted': return 'Удалён';
      case 'loaned': return 'Выдан';
      case 'returned': return 'Возвращён';
      case 'archived': return 'Архивирован';
      case 'restored': return 'Восстановлен';
      case 'copied': return 'Скопирован';
      default: return 'Событие';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: item ? `История: ${item.name}` : 'История предмета',
        }}
      />
      
      <View style={commonStyles.container}>
        {loading ? (
          <View style={[commonStyles.card, { margin: 16, alignItems: 'center', padding: 32 }]}>
            <Text style={commonStyles.textSecondary}>Загрузка истории...</Text>
          </View>
        ) : !item ? (
          <View style={[commonStyles.card, { margin: 16, alignItems: 'center', padding: 32 }]}>
            <IconSymbol name="exclamationmark.triangle" size={48} color={colors.textSecondary} />
            <Text style={[commonStyles.subtitle, { marginTop: 16, marginBottom: 8 }]}>
              Предмет не найден
            </Text>
            <Text style={commonStyles.textSecondary}>
              Возможно, предмет был удалён
            </Text>
          </View>
        ) : events.length === 0 ? (
          <View style={[commonStyles.card, { margin: 16, alignItems: 'center', padding: 32 }]}>
            <IconSymbol name="clock" size={48} color={colors.textSecondary} />
            <Text style={[commonStyles.subtitle, { marginTop: 16, marginBottom: 8 }]}>
              История пуста
            </Text>
            <Text style={commonStyles.textSecondary}>
              События для этого предмета не найдены
            </Text>
          </View>
        ) : (
          <>
            {/* Item Info */}
            <View style={[commonStyles.card, { margin: 16, marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 20 }}>📦</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                    {item.name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    №{item.serialNumber} • {item.quantity} шт. • {item.price.toLocaleString()}₽
                  </Text>
                </View>
              </View>
            </View>

            {/* Events Timeline */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
              <View style={{ paddingHorizontal: 16 }}>
                <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
                  📋 История изменений ({events.length})
                </Text>

                {events.map((event, index) => {
                  const eventStyle = getEventIcon(event.type);
                  const isLast = index === events.length - 1;
                  
                  return (
                    <View key={event.id} style={{ flexDirection: 'row', marginBottom: 16 }}>
                      {/* Timeline line */}
                      <View style={{ alignItems: 'center', marginRight: 16 }}>
                        <View style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: eventStyle.color + '20',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 2,
                          borderColor: eventStyle.color,
                        }}>
                          <Text style={{ fontSize: 14 }}>{eventStyle.icon}</Text>
                        </View>
                        {!isLast && (
                          <View style={{
                            width: 2,
                            height: 40,
                            backgroundColor: colors.border,
                            marginTop: 8,
                          }} />
                        )}
                      </View>

                      {/* Event Details */}
                      <View style={{
                        flex: 1,
                        backgroundColor: colors.card,
                        borderRadius: 12,
                        padding: 16,
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}>
                          <Text style={[commonStyles.text, { 
                            fontWeight: '600',
                            color: eventStyle.color,
                          }]}>
                            {getEventTypeLabel(event.type)}
                          </Text>
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            {formatEventTime(event.timestamp)}
                          </Text>
                        </View>

                        <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                          {event.description}
                        </Text>

                        {/* Additional metadata */}
                        {event.metadata && (
                          <View style={{
                            backgroundColor: colors.background,
                            borderRadius: 8,
                            padding: 12,
                            marginTop: 8,
                          }}>
                            {event.fromLocation && event.toLocation && (
                              <Text style={[commonStyles.textSecondary, { fontSize: 12, marginBottom: 4 }]}>
                                📍 {event.fromLocation} → {event.toLocation}
                              </Text>
                            )}
                            {event.metadata.loanedTo && (
                              <Text style={[commonStyles.textSecondary, { fontSize: 12, marginBottom: 4 }]}>
                                👤 Выдано: {event.metadata.loanedTo}
                              </Text>
                            )}
                            {event.metadata.changes && (
                              <View>
                                <Text style={[commonStyles.textSecondary, { fontSize: 12, marginBottom: 4 }]}>
                                  📝 Изменения:
                                </Text>
                                {Object.entries(event.metadata.changes).map(([field, change]: [string, any]) => (
                                  <Text key={field} style={[commonStyles.textSecondary, { fontSize: 11, marginLeft: 8 }]}>
                                    • {field}: {change.from} → {change.to}
                                  </Text>
                                ))}
                              </View>
                            )}
                            {event.metadata.serialNumber && (
                              <Text style={[commonStyles.textSecondary, { fontSize: 12, marginBottom: 4 }]}>
                                🔢 Серийный номер: {event.metadata.serialNumber}
                              </Text>
                            )}
                            {event.metadata.price && (
                              <Text style={[commonStyles.textSecondary, { fontSize: 12, marginBottom: 4 }]}>
                                💰 Цена: {event.metadata.price.toLocaleString()}₽
                              </Text>
                            )}
                            {event.metadata.quantity && (
                              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                                📊 Количество: {event.metadata.quantity}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </>
  );
}
