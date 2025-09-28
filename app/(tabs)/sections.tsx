
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
import { Section, InventoryItem } from '@/types/inventory';
import { ContextMenu } from '@/components/ContextMenu';

export default function SectionsScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

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

  const handleLongPress = (section: Section) => {
    setSelectedSection(section);
    setShowContextMenu(true);
  };

  const handleContextAction = (actionId: string) => {
    if (!selectedSection) return;

    switch (actionId) {
      case 'edit':
        router.push(`/add-section?id=${selectedSection.id}`);
        break;
      case 'delete':
        handleDeleteSection(selectedSection);
        break;
      case 'view':
        router.push({
          pathname: '/search',
          params: { sectionId: selectedSection.id }
        });
        break;
    }
  };

  const renderSection = ({ item: section }: { item: Section }) => {
    const itemCount = getItemCountForSection(section.id);
    const totalValue = getTotalValueForSection(section.id);
    const sectionItems = searchService.getItemsBySection(items, section.id);
    const recentItems = sectionItems.slice(0, 3);

    return (
      <Pressable
        style={styles.sectionCard}
        onPress={() => {
          router.push({
            pathname: '/search',
            params: { sectionId: section.id }
          });
        }}
        onLongPress={() => handleLongPress(section)}
      >
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: section.color }]}>
            <Text style={styles.sectionEmoji}>{section.emoji}</Text>
          </View>
          
          <View style={styles.sectionInfo}>
            <Text style={styles.sectionName}>{section.name}</Text>
            <Text style={styles.sectionStats}>
              {itemCount} предметов • {totalValue.toLocaleString()}₽
            </Text>
            <Text style={styles.sectionViewType}>
              Вид: {section.viewType === 'list' ? 'Список' : section.viewType === 'grid' ? 'Сетка' : 'Карточки'}
            </Text>
          </View>
          
          <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
        </View>

        {/* Recent Items Preview */}
        {recentItems.length > 0 && (
          <View style={styles.itemsPreview}>
            <Text style={styles.itemsPreviewTitle}>Последние предметы:</Text>
            <View style={styles.itemsPreviewGrid}>
              {recentItems.map((item) => (
                <View key={item.id} style={styles.previewItem}>
                  {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.previewItemImage} />
                  ) : (
                    <View style={[styles.previewItemImage, styles.previewItemImagePlaceholder]}>
                      <IconSymbol name="cube.box.fill" size={12} color={colors.textSecondary} />
                    </View>
                  )}
                  <Text style={styles.previewItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              ))}
              {itemCount > 3 && (
                <View style={styles.previewMore}>
                  <Text style={styles.previewMoreText}>+{itemCount - 3}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {section.description && (
          <Text style={styles.sectionDescription} numberOfLines={2}>
            {section.description}
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

      {/* Context Menu */}
      <ContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        options={{
          title: selectedSection?.name,
          actions: [
            {
              id: 'view',
              title: 'Просмотреть предметы',
              icon: 'eye.fill',
              color: colors.primary,
            },
            {
              id: 'edit',
              title: 'Редактировать',
              icon: 'pencil',
              color: colors.info,
            },
            {
              id: 'delete',
              title: 'Удалить',
              icon: 'trash.fill',
              destructive: true,
            },
          ]
        }}
        onAction={handleContextAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionEmoji: {
    fontSize: 24,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionStats: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  sectionViewType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemsPreview: {
    marginBottom: 8,
  },
  itemsPreviewTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  itemsPreviewGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 50,
  },
  previewItemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 4,
  },
  previewItemImagePlaceholder: {
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewItemName: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  previewMore: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  previewMoreText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
