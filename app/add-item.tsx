
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { Stack, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { TreePlacementMenu } from '@/components/TreePlacementMenu';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { InventoryItem, CreateInventoryItemData } from '@/types/inventory';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function AddItemScreen() {
  const params = useLocalSearchParams();
  const parentId = params.parentId as string;

  const [allItems, setAllItems] = useState<InventoryItem[]>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<InventoryItem | null>(null);
  const [showPlacementMenu, setShowPlacementMenu] = useState(false);
  const [formData, setFormData] = useState<CreateInventoryItemData>({
    name: '',
    description: '',
    photo: undefined,
    video: undefined,
    price: 0,
    weight: 0,
    locationPath: [],
    quantity: 1,
    parentId: parentId || undefined,
    childrenIds: [],
    sectionId: '',
    isOnLoan: false,
    tags: [],
    condition: 'good',
    isArchived: false,
  });
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const itemsData = await storageService.getItems();
      setAllItems(itemsData.filter(item => !item.isArchived));
      
      // Set initial placement if parentId is provided
      if (parentId) {
        const parentItem = itemsData.find(item => item.id === parentId);
        if (parentItem) {
          setSelectedPlacement(parentItem);
          setFormData(prev => ({
            ...prev,
            parentId: parentItem.type === 'section' ? undefined : parentId,
            sectionId: parentItem.type === 'section' ? parentId : parentItem.sectionId,
          }));
        }
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const handlePlacementSelect = (itemId: string) => {
    const selectedItem = allItems.find(item => item.id === itemId);
    if (selectedItem) {
      setSelectedPlacement(selectedItem);
      setFormData(prev => ({
        ...prev,
        parentId: selectedItem.type === 'section' ? undefined : itemId,
        sectionId: selectedItem.type === 'section' ? itemId : selectedItem.sectionId,
      }));
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setFormData(prev => ({ ...prev, photo: manipulatedImage.uri }));
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const handleCameraCapture = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Необходимо разрешение для доступа к камере');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 400, height: 400 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        setFormData(prev => ({ ...prev, photo: manipulatedImage.uri }));
      }
    } catch (error) {
      console.log('Error capturing image:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Добавить фото',
      'Выберите способ добавления фотографии',
      [
        { text: 'Камера', onPress: handleCameraCapture },
        { text: 'Галерея', onPress: handleImagePicker },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Ошибка', 'Введите название предмета');
      return;
    }

    if (!selectedPlacement) {
      Alert.alert('Ошибка', 'Выберите размещение для предмета');
      return;
    }

    setLoading(true);
    try {
      const newItem = await storageService.saveItem({
        ...formData,
        type: 'item',
        containedItems: [],
      });

      // If placing inside another item, add to its contained items
      if (formData.parentId) {
        await storageService.addItemToContainer(formData.parentId, newItem.id);
      }

      Alert.alert('Успешно', 'Предмет добавлен', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log('Error saving item:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить предмет');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Добавить предмет',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <Pressable
              onPress={handleSave}
              disabled={loading}
              style={[commonStyles.button, { backgroundColor: colors.primary, paddingHorizontal: 16 }]}
            >
              <Text style={[commonStyles.buttonText, { color: colors.white }]}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Text>
            </Pressable>
          ),
        }}
      />
      
      <ScrollView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Основная информация</Text>
          
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Название *</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Введите название предмета"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Описание</Text>
            <TextInput
              style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Введите описание предмета"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Размещение *</Text>
            <Pressable
              style={styles.placementSelector}
              onPress={() => setShowPlacementMenu(true)}
            >
              {selectedPlacement ? (
                <View style={styles.selectedPlacement}>
                  <IconSymbol 
                    name={selectedPlacement.type === 'section' ? "folder.fill" : "cube.box.fill"} 
                    size={20} 
                    color={selectedPlacement.type === 'section' ? (selectedPlacement.color || colors.primary) : colors.textSecondary} 
                  />
                  <View style={styles.placementInfo}>
                    <Text style={styles.placementName} numberOfLines={1}>
                      {selectedPlacement.type === 'section' && selectedPlacement.emoji} {selectedPlacement.name}
                    </Text>
                    <Text style={styles.placementType}>
                      {selectedPlacement.type === 'section' ? 'Раздел' : 'Контейнер'}
                    </Text>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                </View>
              ) : (
                <View style={styles.placementPlaceholder}>
                  <IconSymbol name="folder" size={20} color={colors.textSecondary} />
                  <Text style={styles.placementPlaceholderText}>Выберите размещение</Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Фотография</Text>
          
          {formData.photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: formData.photo }} style={styles.photo} />
              <Pressable
                style={styles.removePhotoButton}
                onPress={() => setFormData(prev => ({ ...prev, photo: undefined }))}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.error} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.addPhotoButton} onPress={showImageOptions}>
              <IconSymbol name="camera.fill" size={32} color={colors.textSecondary} />
              <Text style={styles.addPhotoText}>Добавить фото</Text>
            </Pressable>
          )}
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Детали</Text>
          
          <View style={styles.row}>
            <View style={[commonStyles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={commonStyles.label}>Цена (₽)</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.price.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: parseFloat(text) || 0 }))}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
            
            <View style={[commonStyles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={commonStyles.label}>Вес (кг)</Text>
              <TextInput
                style={commonStyles.input}
                value={formData.weight.toString()}
                onChangeText={(text) => setFormData(prev => ({ ...prev, weight: parseFloat(text) || 0 }))}
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Количество</Text>
            <TextInput
              style={commonStyles.input}
              value={formData.quantity.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: parseInt(text) || 1 }))}
              placeholder="1"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Состояние</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.conditionSelector}>
              {[
                { value: 'new', label: 'Новое', emoji: '✨' },
                { value: 'excellent', label: 'Отличное', emoji: '🌟' },
                { value: 'good', label: 'Хорошее', emoji: '👍' },
                { value: 'fair', label: 'Удовлетворительное', emoji: '👌' },
                { value: 'poor', label: 'Плохое', emoji: '👎' },
              ].map((condition) => (
                <Pressable
                  key={condition.value}
                  style={[
                    styles.conditionOption,
                    formData.condition === condition.value && styles.conditionOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, condition: condition.value as any }))}
                >
                  <Text style={styles.conditionEmoji}>{condition.emoji}</Text>
                  <Text style={[
                    styles.conditionLabel,
                    formData.condition === condition.value && styles.conditionLabelSelected
                  ]}>
                    {condition.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Теги</Text>
          
          <View style={styles.tagsContainer}>
            {formData.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <Pressable onPress={() => removeTag(tag)}>
                  <IconSymbol name="xmark" size={14} color={colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>
          
          <TextInput
            style={commonStyles.input}
            placeholder="Добавить тег (нажмите Enter)"
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={(e) => {
              addTag(e.nativeEvent.text);
              e.target.clear();
            }}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Tree Placement Menu */}
      <TreePlacementMenu
        visible={showPlacementMenu}
        onClose={() => setShowPlacementMenu(false)}
        onSelect={handlePlacementSelect}
        items={allItems}
        selectedItemId={selectedPlacement?.id}
        title="Выберите размещение"
        maxLevels={20}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placementSelector: {
    marginTop: 8,
  },
  selectedPlacement: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  placementPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  placementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  placementName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  placementType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  placementPlaceholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  photoContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.card,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  addPhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 16,
    color: colors.textSecondary,
  },
  conditionSelector: {
    marginTop: 8,
  },
  conditionOption: {
    alignItems: 'center',
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
  },
  conditionOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  conditionEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  conditionLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  conditionLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 6,
  },
});
