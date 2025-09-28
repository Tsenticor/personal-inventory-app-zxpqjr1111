
import { commonStyles, colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { storageService } from '@/services/storageService';
import { router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useCallback } from 'react';
import { InventoryItem, Section, EventLog, Statistics } from '@/types/inventory';

export default function MoreScreen() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, events] = await Promise.all([
        storageService.getStatistics(),
        storageService.getEvents(),
      ]);
      
      setStatistics(stats);
      setRecentEvents(events.slice(0, 5)); // Show only last 5 events
    } catch (error) {
      console.log('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEventTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
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

  const handleClearAllData = () => {
    Alert.alert(
      'Очистить все данные',
      'Это действие удалит все предметы, разделы, события и другие данные. Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить все',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert('Успешно', 'Все данные удалены', [
                { text: 'OK', onPress: () => loadData() }
              ]);
            } catch (error) {
              console.log('Error clearing data:', error);
              Alert.alert('Ошибка', 'Не удалось очистить данные');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[commonStyles.container, { backgroundColor: colors.background }]}>
      {/* Statistics Overview */}
      {statistics && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Статистика</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <IconSymbol name="cube.box.fill" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{statistics.totalItems}</Text>
              <Text style={styles.statLabel}>Предметов</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="rublesign.circle.fill" size={24} color={colors.success} />
              <Text style={styles.statValue}>{Math.round(statistics.totalValue).toLocaleString()}</Text>
              <Text style={styles.statLabel}>₽ стоимость</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="scalemass.fill" size={24} color={colors.secondary} />
              <Text style={styles.statValue}>{statistics.totalWeight.toFixed(1)}</Text>
              <Text style={styles.statLabel}>кг вес</Text>
            </View>
            <View style={styles.statCard}>
              <IconSymbol name="arrow.up.right.square.fill" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{statistics.loanedItems}</Text>
              <Text style={styles.statLabel}>На выдаче</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Activity */}
      <View style={commonStyles.section}>
        <View style={styles.sectionHeader}>
          <Text style={commonStyles.sectionTitle}>Последние события</Text>
          <Pressable onPress={() => router.push('/events')}>
            <Text style={styles.seeAllText}>Все события</Text>
          </Pressable>
        </View>
        
        {recentEvents.length > 0 ? (
          <View style={styles.eventsContainer}>
            {recentEvents.map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <IconSymbol 
                  name={getEventIcon(event.type)} 
                  size={20} 
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

      {/* Main Actions */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Основные действия</Text>
        
        <Pressable
          style={[commonStyles.button, styles.actionButton]}
          onPress={() => router.push('/add-item')}
        >
          <IconSymbol name="plus.circle.fill" size={24} color={colors.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Добавить предмет</Text>
            <Text style={styles.actionDescription}>Создать новый предмет в инвентаре</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[commonStyles.button, styles.actionButton]}
          onPress={() => router.push('/sections')}
        >
          <IconSymbol name="folder.fill" size={24} color={colors.secondary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Управление разделами</Text>
            <Text style={styles.actionDescription}>Создать и настроить разделы</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[commonStyles.button, styles.actionButton]}
          onPress={() => router.push('/export-import')}
        >
          <IconSymbol name="square.and.arrow.up.fill" size={24} color={colors.info} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Импорт/Экспорт</Text>
            <Text style={styles.actionDescription}>Резервное копирование и восстановление данных</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Tools & Features */}
      <View style={commonStyles.section}>
        <Text style={commonStyles.sectionTitle}>Инструменты</Text>
        
        <Pressable
          style={[commonStyles.button, styles.actionButton]}
          onPress={() => router.push('/events')}
        >
          <IconSymbol name="clock.fill" size={24} color={colors.warning} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>История событий</Text>
            <Text style={styles.actionDescription}>Просмотр всех изменений в инвентаре</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[commonStyles.button, styles.actionButton]}
          onPress={() => router.push('/search')}
        >
          <IconSymbol name="magnifyingglass.circle.fill" size={24} color={colors.success} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Расширенный поиск</Text>
            <Text style={styles.actionDescription}>Найти предметы по различным критериям</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Danger Zone */}
      <View style={commonStyles.section}>
        <Text style={[commonStyles.sectionTitle, { color: colors.error }]}>Опасная зона</Text>
        
        <Pressable
          style={[commonStyles.button, styles.dangerButton]}
          onPress={handleClearAllData}
        >
          <IconSymbol name="trash.fill" size={24} color={colors.error} />
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.error }]}>Очистить все данные</Text>
            <Text style={styles.actionDescription}>Удалить все предметы и разделы</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
    marginLeft: 12,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dangerButton: {
    borderColor: colors.errorLight,
    backgroundColor: colors.errorLight,
  },
});
