
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { Section } from '@/types/inventory';

const SECTION_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

const SECTION_EMOJIS = [
  '📁', '🏠', '🛏️', '🍳', '🛋️', '🚿', '🚗', '📚', '👕', '🎮',
  '💻', '📱', '🎵', '🏃‍♂️', '🍕', '☕', '🌱', '🎨', '🔧', '💊'
];

const VIEW_TYPES = [
  { key: 'list', label: 'Список', icon: 'list.bullet' },
  { key: 'grid', label: 'Сетка', icon: 'square.grid.2x2' },
  { key: 'cards', label: 'Карточки', icon: 'rectangle.stack' },
];

export default function AddSectionScreen() {
  const params = useLocalSearchParams();
  const sectionId = params.id as string;
  const isEditing = !!sectionId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📁');
  const [selectedColor, setSelectedColor] = useState(SECTION_COLORS[0]);
  const [selectedViewType, setSelectedViewType] = useState<'list' | 'grid' | 'cards'>('list');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isEditing) {
        loadSection();
      }
    }, [isEditing, sectionId])
  );

  const loadSection = async () => {
    try {
      const sections = await storageService.getSections();
      const section = sections.find(s => s.id === sectionId);
      
      if (section) {
        setName(section.name);
        setDescription(section.description);
        setSelectedEmoji(section.emoji);
        setSelectedColor(section.color);
        setSelectedViewType(section.viewType);
      }
    } catch (error) {
      console.log('Error loading section:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить данные раздела');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название раздела');
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await storageService.updateSection(sectionId, {
          name: name.trim(),
          description: description.trim(),
          emoji: selectedEmoji,
          color: selectedColor,
          viewType: selectedViewType,
        });
        Alert.alert('Успешно', 'Раздел обновлен', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await storageService.saveSection({
          name: name.trim(),
          description: description.trim(),
          emoji: selectedEmoji,
          color: selectedColor,
          viewType: selectedViewType,
          parentSectionId: undefined,
          childSectionIds: [],
          isArchived: false,
          sortOrder: 0,
          tags: [],
        });
        Alert.alert('Успешно', 'Раздел создан', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.log('Error saving section:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить раздел');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Редактировать раздел' : 'Новый раздел',
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
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Название раздела</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Введите название"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Описание (необязательно)</Text>
            <TextInput
              style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Добавьте описание раздела"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Иконка</Text>
            <View style={styles.emojiGrid}>
              {SECTION_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={[
                    styles.emojiButton,
                    selectedEmoji === emoji && styles.emojiButtonSelected
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Цвет</Text>
            <View style={styles.colorGrid}>
              {SECTION_COLORS.map((color) => (
                <Pressable
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorButtonSelected
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <IconSymbol name="checkmark" size={16} color={colors.white} />
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Тип отображения</Text>
            <View style={styles.viewTypeContainer}>
              {VIEW_TYPES.map((viewType) => (
                <Pressable
                  key={viewType.key}
                  style={[
                    styles.viewTypeButton,
                    selectedViewType === viewType.key && styles.viewTypeButtonSelected
                  ]}
                  onPress={() => setSelectedViewType(viewType.key as any)}
                >
                  <IconSymbol 
                    name={viewType.icon as any} 
                    size={20} 
                    color={selectedViewType === viewType.key ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.viewTypeText,
                    selectedViewType === viewType.key && styles.viewTypeTextSelected
                  ]}>
                    {viewType.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={commonStyles.inputGroup}>
            <Text style={commonStyles.label}>Предварительный просмотр</Text>
            <View style={[styles.preview, { backgroundColor: selectedColor + '20' }]}>
              <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
                <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewName}>{name || 'Название раздела'}</Text>
                <Text style={styles.previewDescription}>
                  {description || 'Описание раздела'}
                </Text>
                <Text style={styles.previewViewType}>
                  Вид: {VIEW_TYPES.find(vt => vt.key === selectedViewType)?.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  emojiButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  emojiText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorButtonSelected: {
    borderColor: colors.text,
    borderWidth: 3,
  },
  viewTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewTypeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewTypeButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  viewTypeText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  viewTypeTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewEmoji: {
    fontSize: 24,
  },
  previewContent: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  previewViewType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
