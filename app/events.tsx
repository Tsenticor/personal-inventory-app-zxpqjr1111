
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { router, useFocusEffect, Stack } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { EventLog } from '@/types/inventory';

export default function EventsScreen() {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await storageService.getEvents();
      setEvents(allEvents);
      setFilteredEvents(allEvents);
    } catch (error) {
      console.log('Error loading events:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить события');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = useCallback(() => {
    let filtered = events;

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(event => event.type === selectedFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.itemName.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [events, selectedFilter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  React.useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const formatEventTime = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return 'Только что';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays < 7) {
      return `${diffDays} дн назад`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
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

  const filterOptions = [
    { key: 'all', label: 'Все события', count: events.length },
    { key: 'created', label: 'Создание', count: events.filter(e => e.type === 'created').length },
    { key: 'updated', label: 'Изменения', count: events.filter(e => e.type === 'updated').length },
    { key: 'moved', label: 'Перемещения', count: events.filter(e => e.type === 'moved').length },
    { key: 'loaned', label: 'Выдача', count: events.filter(e => e.type === 'loaned').length },
    { key: 'returned', label: 'Возврат', count: events.filter(e => e.type === 'returned').length },
    { key: 'deleted', label: 'Удаления', count: events.filter(e => e.type === 'deleted').length },
  ];

  const clearEventHistory = () => {
    Alert.alert(
      'Очистить историю',
      'Вы уверены, что хотите удалить всю историю событий? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear events from storage
              await storageService.clearEvents();
              setEvents([]);
              setFilteredEvents([]);
              Alert.alert('Успешно', 'История событий очищена');
            } catch (error) {
              console.log('Error clearing events:', error);
              Alert.alert('Ошибка', 'Не удалось очистить историю');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'История событий',
          headerRight: () => (
            <Pressable onPress={clearEventHistory}>
              <IconSymbol name="trash" size={20} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      
      <View style={commonStyles.container}>
        {/* Search */}
        <View style={[commonStyles.card, { margin: 16, marginBottom: 8 }]}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
            <TextInput
              style={[commonStyles.text, { flex: 1, marginLeft: 8 }]}
              placeholder="Поиск по событиям..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {filterOptions.map((option) => (
            <Pressable
              key={option.key}
              style={{
                backgroundColor: selectedFilter === option.key ? colors.primary : colors.card,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: 1,
                borderColor: selectedFilter === option.key ? colors.primary : colors.border,
              }}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text style={{
                color: selectedFilter === option.key ? 'white' : colors.text,
                fontSize: 14,
                fontWeight: selectedFilter === option.key ? '600' : '400',
              }}>
                {option.label} ({option.count})
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Events List */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          {loading ? (
            <View style={[commonStyles.card, { margin: 16, alignItems: 'center', padding: 32 }]}>
              <Text style={commonStyles.textSecondary}>Загрузка событий...</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={[commonStyles.card, { margin: 16, alignItems: 'center', padding: 32 }]}>
              <IconSymbol name="clock" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.subtitle, { marginTop: 16, marginBottom: 8 }]}>
                {searchQuery || selectedFilter !== 'all' ? 'Событий не найдено' : 'История пуста'}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {searchQuery || selectedFilter !== 'all' 
                  ? 'Попробуйте изменить фильтры или поисковый запрос'
                  : 'События будут появляться здесь при работе с инвентарём'
                }
              </Text>
            </View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {filteredEvents.map((event, index) => {
                const eventStyle = getEventIcon(event.type);
                const isLastInDay = index === filteredEvents.length - 1 || 
                  filteredEvents[index + 1].timestamp.toDateString() !== event.timestamp.toDateString();
                
                return (
                  <View key={event.id}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      marginBottom: 8,
                    }}>
                      {/* Event Icon */}
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: eventStyle.color + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}>
                        <Text style={{ fontSize: 18 }}>{eventStyle.icon}</Text>
                      </View>

                      {/* Event Details */}
                      <View style={{ flex: 1 }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}>
                          <Text style={[commonStyles.text, { 
                            fontWeight: '600',
                            color: eventStyle.color,
                            marginRight: 8,
                          }]}>
                            {getEventTypeLabel(event.type)}
                          </Text>
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            {formatEventTime(event.timestamp)}
                          </Text>
                        </View>

                        <Text style={[commonStyles.text, { marginBottom: 4 }]} numberOfLines={2}>
                          {event.description}
                        </Text>

                        <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                          Предмет: {event.itemName}
                        </Text>

                        {/* Additional metadata */}
                        {event.metadata && (
                          <View style={{ marginTop: 8 }}>
                            {event.fromLocation && event.toLocation && (
                              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                                {event.fromLocation} → {event.toLocation}
                              </Text>
                            )}
                            {event.metadata.loanedTo && (
                              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                                Выдано: {event.metadata.loanedTo}
                              </Text>
                            )}
                            {event.metadata.changes && (
                              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]} numberOfLines={1}>
                                Изменения: {Object.keys(event.metadata.changes).join(', ')}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Date separator */}
                    {isLastInDay && index < filteredEvents.length - 1 && (
                      <View style={{
                        alignItems: 'center',
                        marginVertical: 16,
                      }}>
                        <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                          {filteredEvents[index + 1].timestamp.toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
