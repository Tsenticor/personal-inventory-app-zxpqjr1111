
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
import { Section, InventoryItem } from '@/types/inventory';

export default function SectionsScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sectionsData, itemsData] = await Promise.all([
        storageService.getSections(),
        storageService.getItems(),
      ]);
      setSections(sectionsData);
      setItems(itemsData);
    } catch (error) {
      console.log('Error loading sections:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить разделы');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getItemCountForSection = (sectionId: string) => {
    return items.filter(item => item.sectionId === sectionId).length;
  };

  const getTotalValueForSection = (sectionId: string) => {
    return items
      .filter(item => item.sectionId === sectionId)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleDeleteSection = (section: Section) => {
    const itemCount = getItemCountForSection(section.id);
    
    if (itemCount > 0) {
      Alert.alert(
        'Невозможно удалить',
        `В разделе "${section.name}" есть ${itemCount} предметов. Сначала переместите или удалите их.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Удалить раздел',
      `Вы уверены, что хотите удалить раздел "${section.name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteSection(section.id);
              loadData();
            } catch (error) {
              console.log('Error deleting section:', error);
              Alert.alert('Ошибка', 'Не удалось удалить раздел');
            }
          },
        },
      ]
    );
  };

  const renderSection = ({ item: section }: { item: Section }) => {
    const itemCount = getItemCountForSection(section.id);
    const totalValue = getTotalValueForSection(section.id);

    return (
      <Pressable
        style={commonStyles.listItem}
        onPress={() => {
          // Navigate to section items view
          router.push({
            pathname: '/search',
            params: { sectionId: section.id }
          });
        }}
      >
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: section.color,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}>
          <Text style={{ fontSize: 24 }}>{section.emoji}</Text>
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
            {section.name}
          </Text>
          <Text style={commonStyles.textSecondary}>
            {itemCount} предметов • {totalValue.toLocaleString()}₽
          </Text>
          <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 2 }]}>
            Вид: {section.viewType === 'list' ? 'Список' : section.viewType === 'grid' ? 'Сетка' : 'Карточки'}
          </Text>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            style={{
              padding: 8,
              marginRight: 8,
            }}
            onPress={() => handleDeleteSection(section)}
          >
            <IconSymbol name="trash" size={16} color={colors.destructive} />
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
      <Text style={{ fontSize: 60, marginBottom: 16 }}>📁</Text>
      <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 8 }]}>
        Нет разделов
      </Text>
      <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 24 }]}>
        Создайте разделы для организации вашего инвентаря
      </Text>
      <Pressable
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        }}
        onPress={() => router.push('/add-section')}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Создать раздел
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSection}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
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
        onPress={() => router.push('/add-section')}
      >
        <IconSymbol name="plus" size={24} color="white" />
      </Pressable>
    </View>
  );
}
