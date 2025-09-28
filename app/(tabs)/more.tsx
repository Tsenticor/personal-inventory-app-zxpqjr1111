
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { InventoryItem, Section, EventLog } from '@/types/inventory';

export default function MoreScreen() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    totalWeight: 0,
    sectionsCount: 0,
    loanedItems: 0,
  });
  const [recentEvents, setRecentEvents] = useState<EventLog[]>([]);

  const loadData = async () => {
    try {
      const [items, sections, events] = await Promise.all([
        storageService.getItems(),
        storageService.getSections(),
        storageService.getEvents(),
      ]);

      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      const loanedItems = items.filter(item => item.isOnLoan).length;

      setStats({
        totalItems,
        totalValue,
        totalWeight,
        sectionsCount: sections.length,
        loanedItems,
      });

      setRecentEvents(events.slice(0, 5));
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const menuItems = [
    {
      title: 'История событий',
      subtitle: 'Просмотр журнала изменений',
      icon: 'clock.fill',
      onPress: () => {
        router.push('/events');
      },
    },
    {
      title: 'Цели и задачи',
      subtitle: 'Управление целями и напоминаниями',
      icon: 'target',
      onPress: () => {
        // TODO: Navigate to goals
        Alert.alert('В разработке', 'Функция будет добавлена в следующих версиях');
      },
    },
    {
      title: 'Заметки',
      subtitle: 'Текстовые заметки и связи',
      icon: 'note.text',
      onPress: () => {
        // TODO: Navigate to notes
        Alert.alert('В разработке', 'Функция будет добавлена в следующих версиях');
      },
    },
    {
      title: 'Экспорт данных',
      subtitle: 'Резервное копирование и обмен',
      icon: 'square.and.arrow.up',
      onPress: () => {
        // TODO: Implement export
        Alert.alert('В разработке', 'Функция будет добавлена в следующих версиях');
      },
    },
    {
      title: 'Настройки',
      subtitle: 'Конфигурация приложения',
      icon: 'gearshape.fill',
      onPress: () => {
        // TODO: Navigate to settings
        Alert.alert('В разработке', 'Функция будет добавлена в следующих версиях');
      },
    },
  ];

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
    } else {
      return `${diffDays} дн назад`;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'created': return '➕';
      case 'updated': return '✏️';
      case 'moved': return '📦';
      case 'deleted': return '🗑️';
      case 'loaned': return '📤';
      case 'returned': return '📥';
      case 'archived': return '📁';
      case 'restored': return '♻️';
      case 'copied': return '📋';
      default: return '📋';
    }
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Statistics */}
      <View style={[commonStyles.card, { margin: 16 }]}>
        <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
          📊 Статистика
        </Text>
        
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <View style={{ width: '50%', marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              {stats.totalItems}
            </Text>
            <Text style={commonStyles.textSecondary}>Всего предметов</Text>
          </View>
          
          <View style={{ width: '50%', marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              {stats.totalValue.toLocaleString()}₽
            </Text>
            <Text style={commonStyles.textSecondary}>Общая стоимость</Text>
          </View>
          
          <View style={{ width: '50%', marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              {stats.totalWeight.toFixed(1)} кг
            </Text>
            <Text style={commonStyles.textSecondary}>Общий вес</Text>
          </View>
          
          <View style={{ width: '50%', marginBottom: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              {stats.sectionsCount}
            </Text>
            <Text style={commonStyles.textSecondary}>Разделов</Text>
          </View>
        </View>

        {stats.loanedItems > 0 && (
          <View style={{
            backgroundColor: '#FFF3CD',
            padding: 12,
            borderRadius: 8,
            marginTop: 12,
          }}>
            <Text style={[commonStyles.text, { fontWeight: '600' }]}>
              ⚠️ {stats.loanedItems} предметов на выдаче
            </Text>
          </View>
        )}
      </View>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <View style={[commonStyles.card, { marginHorizontal: 16, marginBottom: 16 }]}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={commonStyles.subtitle}>
              🕒 Последние события
            </Text>
            <Pressable onPress={() => router.push('/events')}>
              <Text style={[commonStyles.text, { color: colors.primary, fontSize: 14 }]}>
                Все события
              </Text>
            </Pressable>
          </View>
          
          {recentEvents.map((event, index) => (
            <Pressable
              key={event.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 8,
                borderBottomWidth: index < recentEvents.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
              onPress={() => router.push('/events')}
            >
              <Text style={{ fontSize: 16, marginRight: 12 }}>
                {getEventIcon(event.type)}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[commonStyles.text, { fontSize: 14 }]} numberOfLines={1}>
                  {event.description}
                </Text>
                <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                  {formatEventTime(event.timestamp)}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Menu Items */}
      <View style={{ paddingHorizontal: 16 }}>
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            style={[commonStyles.listItem, { marginBottom: 8 }]}
            onPress={item.onPress}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              <IconSymbol name={item.icon as any} size={20} color="white" />
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                {item.title}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {item.subtitle}
              </Text>
            </View>
            
            <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>

      {/* App Info */}
      <View style={[commonStyles.card, { margin: 16 }]}>
        <Text style={[commonStyles.subtitle, { marginBottom: 8 }]}>
          📱 О приложении
        </Text>
        <Text style={commonStyles.textSecondary}>
          Инвентаризатор v1.0.0{'\n'}
          Локальное приложение для учёта личных вещей{'\n'}
          Все данные хранятся на вашем устройстве
        </Text>
      </View>
    </ScrollView>
  );
}
