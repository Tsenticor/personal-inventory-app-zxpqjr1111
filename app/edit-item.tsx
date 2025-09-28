
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
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { InventoryItem, Section } from '@/types/inventory';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const CONDITIONS = [
  { key: 'new', label: 'Новое', color: colors.success },
  { key: 'excellent', label: 'Отличное', color: colors.info },
  { key: 'good', label: 'Хорошее', color: colors.primary },
  { key: 'fair', label: 'Удовлетворительное', color: colors.warning },
  { key: 'poor', label: 'Плохое', color: colors.error },
];

export default function EditItemScreen() {
  const params = useLocalSearchParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<InventoryItem['condition']>('good');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const loadItemData = useCallback(async () => {
    try {
      const [items, sectionsData] = await Promise.all([
        storageService.getItems(),
        storageService.getSections(),
      ]);

      const foundItem = items.find(i => i.id === itemId);
      if (!foundItem) {
        Alert.alert('Ошибка', 'Предмет не найден', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      setItem(foundItem);
      setSections(sectionsData);

      // Populate form fields
      setName(foundItem.name);
      setDescription(foundItem.description);
      setPhoto(foundItem.photo);
      setPrice(foundItem.price.toString());
      setWeight(foundItem.weight.toString());
      setQuantity(foundItem.quantity.toString());
      setSelectedSectionId(foundItem.sectionId);
      setSelectedCondition(foundItem.condition);
      setTags(foundItem.tags);
    } catch (error) {
      console.log('Error loading item data:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные предмета');
    }
  }, [itemId]);

  useFocusEffect(
    useCallback(() => {
      if (itemId) {
        loadItemData();
      }
    }, [itemId, loadItemData])
  );

  const handleImagePicker = async () => {
    try {
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
        setPhoto(manipulatedImage.uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const handleCameraCapture = async () => {
    try {
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
        setPhoto(manipulatedImage.uri);
      }
    } catch (error) {
      console.log('Error capturing image:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Выберите изображение',
      'Откуда вы хотите выбрать изображение?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Камера', onPress: handleCameraCapture },
        { text: 'Галерея', onPress: handleImagePicker },
        ...(photo ? [{ text: 'Удалить фото', onPress: () => setPhoto(undefined), style: 'destructive' as const }] : []),
      ]
    );
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название предмета');
      return;
    }

    if (!selectedSectionId) {
      Alert.alert('Ошибка', 'Выберите раздел');
      return;
    }

    try {
      setLoading(true);

      const updatedItem = await storageService.updateItem(itemId, {
        name: name.trim(),
        description: description.trim(),
        photo,
        price: parseFloat(price) || 0,
        weight: parseFloat(weight) || 0,
        quantity: parseInt(quantity) || 1,
        sectionId: selectedSectionId,
        condition: selectedCondition,
        tags,
      });

      if (updatedItem) {
        Alert.alert('Успешно', 'Предмет обновлен', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Ошибка', 'Не удалось обновить предмет');
      }
    } catch (error) {
      console.log('Error updating item:', error);
      Alert.alert('Ошибка', 'Не удалось обновить предмет');
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Редактировать предмет',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <Pressable onPress={handleSave} disabled={loading}>
              <Text style={[
                commonStyles.text,
                { color: colors.primary, fontWeight: '600' },
                loading && { color: colors.textSecondary }
              ]}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView style={commonStyles.container}>
        <View style={commonStyles.section}>
          {/* Photo */}
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Фотография</Text>
            <Pressable style={styles.photoContainer} onPress={showImageOptions}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <IconSymbol name="camera.fill" size={32} color={colors.textSecondary} />
                  <Text style={styles.photoPlaceholderText}>Добавить фото</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Name */}
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Название *</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Введите название предмета"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Description */}
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Описание</Text>
            <TextInput
              style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Добавьте описание предмета"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Section */}
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Раздел *</Text>
            <View style={styles.sectionSelector}>
              {sections.map((section) => (
                <Pressable
                  key={section.id}
                  style={[
                    styles.sectionOption,
                    selectedSectionId === section.id && styles.sectionOptionSelected
                  ]}
                  onPress={() => setSelectedSectionId(section.id)}
                >
                  <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                  <Text style={[
                    styles.sectionText,
                    selectedSectionId === section.id && styles.sectionTextSelected
                  ]}>
                    {section.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Price and Weight */}
          <View style={styles.row}>
            <View style={[commonStyles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={commonStyles.label}>Цена (₽)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={[commonStyles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={commonStyles.label}>Вес (кг)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="0"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Quantity */}
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Количество</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="1"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>

          {/* Condition */}
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Состояние</Text>
            <View style={styles.conditionSelector}>
              {CONDITIONS.map((condition) => (
                <Pressable
                  key={condition.key}
                  style={[
                    styles.conditionOption,
                    selectedCondition === condition.key && [
                      styles.conditionOptionSelected,
                      { borderColor: condition.color }
                    ]
                  ]}
                  onPress={() => setSelectedCondition(condition.key as any)}
                >
                  <Text style={[
                    styles.conditionText,
                    selectedCondition === condition.key && { color: condition.color }
                  ]}>
                    {condition.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Теги</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <Pressable onPress={() => removeTag(tag)} style={styles.tagRemove}>
                    <IconSymbol name="xmark" size={12} color={colors.primary} />
                  </Pressable>
                </View>
              ))}
            </View>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[commonStyles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Добавить тег"
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={() => addTag(newTag)}
                returnKeyType="done"
              />
              <Pressable
                style={[commonStyles.button, { paddingHorizontal: 16 }]}
                onPress={() => addTag(newTag)}
              >
                <IconSymbol name="plus" size={16} color={colors.white} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  photoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  sectionEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  sectionText: {
    fontSize: 14,
    color: colors.text,
  },
  sectionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  conditionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conditionOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
  },
  conditionText: {
    fontSize: 14,
    color: colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
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
    marginRight: 4,
  },
  tagRemove: {
    padding: 2,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
