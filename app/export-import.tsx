
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { commonStyles, colors } from '@/styles/commonStyles';
import { storageService } from '@/services/storageService';
import { ExportData, ImportResult, Statistics } from '@/types/inventory';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ExportImportScreen() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [])
  );

  const loadStatistics = async () => {
    try {
      const stats = await storageService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.log('Error loading statistics:', error);
    }
  };

  const generateExportData = async (): Promise<ExportData> => {
    const [allItems, events, goals, notes, mindMaps, tables, reminders] = await Promise.all([
      storageService.getItems(),
      storageService.getEvents(),
      storageService.getGoals(),
      storageService.getNotes(),
      storageService.getMindMaps(),
      storageService.getTables(),
      storageService.getReminders(),
    ]);

    // Separate items and sections from unified data
    const items = allItems.filter(item => item.type !== 'section');
    const sections = allItems.filter(item => item.type === 'section') as Section[];

    const exportData: ExportData = {
      version: '2.0.0', // Updated version for unified data structure
      exportDate: new Date(),
      items,
      sections,
      events,
      goals,
      notes,
      mindMaps,
      tables,
      reminders,
      metadata: {
        appVersion: '2.0.0',
        deviceInfo: 'React Native Inventory App',
        totalItems: items.length,
        totalSections: sections.length,
        isEncrypted: false,
        checksum: generateChecksum(items.length + sections.length),
      },
    };

    return exportData;
  };

  const generateChecksum = (value: number): string => {
    return Math.abs(value * 31 + Date.now()).toString(16);
  };

  const handleExportAll = async () => {
    setLoading(true);
    try {
      const exportData = await generateExportData();
      const jsonString = JSON.stringify(exportData, null, 2);
      
      const fileName = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Экспорт данных инвентаря',
        });
      } else {
        Alert.alert('Успешно', `Файл сохранён: ${fileName}`);
      }
    } catch (error) {
      console.log('Error exporting data:', error);
      Alert.alert('Ошибка', 'Не удалось экспортировать данные');
    } finally {
      setLoading(false);
    }
  };

  const handleExportItems = async () => {
    setLoading(true);
    try {
      const items = await storageService.getItems();
      const sections = await storageService.getSections();
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date(),
        items,
        sections: sections.filter(s => items.some(i => i.sectionId === s.id)),
        metadata: {
          appVersion: '1.0.0',
          totalItems: items.length,
          isEncrypted: false,
        },
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `inventory_items_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Экспорт предметов',
        });
      } else {
        Alert.alert('Успешно', `Файл сохранён: ${fileName}`);
      }
    } catch (error) {
      console.log('Error exporting items:', error);
      Alert.alert('Ошибка', 'Не удалось экспортировать предметы');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setLoading(true);
      
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const importData = JSON.parse(fileContent);
      
      // Validate import data structure
      if (!importData.version || !importData.items || !Array.isArray(importData.items)) {
        throw new Error('Неверный формат файла');
      }

      Alert.alert(
        'Импорт данных',
        `Найдено предметов: ${importData.items.length}\nНайдено разделов: ${importData.sections?.length || 0}\n\nВыберите режим импорта:`,
        [
          {
            text: 'Заменить все данные',
            style: 'destructive',
            onPress: () => performImport(importData, 'replace'),
          },
          {
            text: 'Добавить к существующим',
            onPress: () => performImport(importData, 'merge'),
          },
          {
            text: 'Отмена',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.log('Error importing data:', error);
      Alert.alert('Ошибка', 'Не удалось импортировать данные. Проверьте формат файла.');
    } finally {
      setLoading(false);
    }
  };

  const performImport = async (importData: any, mode: 'replace' | 'merge') => {
    try {
      setLoading(true);
      
      let importResult: ImportResult = {
        success: false,
        itemsImported: 0,
        sectionsImported: 0,
        eventsImported: 0,
        goalsImported: 0,
        notesImported: 0,
        errors: [],
        warnings: [],
      };

      if (mode === 'replace') {
        // Clear existing data
        await storageService.clearAllData();
      }

      // Import sections first
      if (importData.sections && Array.isArray(importData.sections)) {
        for (const section of importData.sections) {
          try {
            await storageService.saveSection({
              name: section.name,
              emoji: section.emoji || '📦',
              color: section.color || colors.primary,
              viewType: section.viewType || 'list',
              parentSectionId: section.parentSectionId,
              childSectionIds: section.childSectionIds || [],
              isArchived: section.isArchived || false,
              sortOrder: section.sortOrder || 0,
            });
            importResult.sectionsImported++;
          } catch (error) {
            console.log('Error importing section:', error);
            importResult.errors.push(`Ошибка импорта раздела: ${section.name}`);
          }
        }
      }

      // Import items
      for (const item of importData.items) {
        try {
          await storageService.saveItem({
            name: item.name,
            description: item.description || '',
            photo: item.photo,
            video: item.video,
            price: item.price || 0,
            weight: item.weight || 0,
            locationPath: item.locationPath || [],
            quantity: item.quantity || 1,
            parentId: item.parentId,
            childrenIds: item.childrenIds || [],
            sectionId: item.sectionId,
            isOnLoan: item.isOnLoan || false,
            loanedTo: item.loanedTo,
            loanedAt: item.loanedAt ? new Date(item.loanedAt) : undefined,
            tags: item.tags || [],
            barcode: item.barcode,
            purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
            warrantyExpiry: item.warrantyExpiry ? new Date(item.warrantyExpiry) : undefined,
            condition: item.condition || 'good',
            isArchived: item.isArchived || false,
          });
          importResult.itemsImported++;
        } catch (error) {
          console.log('Error importing item:', error);
          importResult.errors.push(`Ошибка импорта предмета: ${item.name}`);
        }
      }

      // Import other data types if available
      if (importData.goals && Array.isArray(importData.goals)) {
        for (const goal of importData.goals) {
          try {
            await storageService.saveGoal({
              title: goal.title,
              description: goal.description || '',
              targetValue: goal.targetValue || 0,
              currentValue: goal.currentValue || 0,
              unit: goal.unit || '',
              type: goal.type || 'custom',
              deadline: goal.deadline ? new Date(goal.deadline) : undefined,
              completed: goal.completed || false,
              completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
              priority: goal.priority || 'medium',
              category: goal.category || 'general',
              isRecurring: goal.isRecurring || false,
              recurringInterval: goal.recurringInterval,
              linkedItemIds: goal.linkedItemIds || [],
            });
            importResult.goalsImported++;
          } catch (error) {
            console.log('Error importing goal:', error);
            importResult.errors.push(`Ошибка импорта цели: ${goal.title}`);
          }
        }
      }

      if (importData.notes && Array.isArray(importData.notes)) {
        for (const note of importData.notes) {
          try {
            await storageService.saveNote({
              title: note.title,
              content: note.content || '',
              linkedItemIds: note.linkedItemIds || [],
              linkedNoteIds: note.linkedNoteIds || [],
              tags: note.tags || [],
              color: note.color || '#FFFFFF',
              isPinned: note.isPinned || false,
              isArchived: note.isArchived || false,
              attachments: note.attachments || [],
            });
            importResult.notesImported++;
          } catch (error) {
            console.log('Error importing note:', error);
            importResult.errors.push(`Ошибка импорта заметки: ${note.title}`);
          }
        }
      }

      importResult.success = importResult.errors.length === 0;

      // Show import results
      const message = `
Импорт завершён!

Импортировано:
• Предметов: ${importResult.itemsImported}
• Разделов: ${importResult.sectionsImported}
• Целей: ${importResult.goalsImported}
• Заметок: ${importResult.notesImported}

${importResult.errors.length > 0 ? `\nОшибки: ${importResult.errors.length}` : ''}
      `.trim();

      Alert.alert(
        importResult.success ? 'Успешно' : 'Импорт завершён с ошибками',
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              loadStatistics();
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.log('Error performing import:', error);
      Alert.alert('Ошибка', 'Не удалось выполнить импорт данных');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Импорт/Экспорт',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        {statistics && (
          <View style={commonStyles.section}>
            <Text style={commonStyles.sectionTitle}>Текущие данные</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <IconSymbol name="cube.box.fill" size={24} color={colors.primary} />
                <Text style={styles.statValue}>{statistics.totalItems}</Text>
                <Text style={styles.statLabel}>Предметов</Text>
              </View>
              <View style={styles.statItem}>
                <IconSymbol name="folder.fill" size={24} color={colors.secondary} />
                <Text style={styles.statValue}>{Object.keys(statistics.itemsBySection).length}</Text>
                <Text style={styles.statLabel}>Разделов</Text>
              </View>
              <View style={styles.statItem}>
                <IconSymbol name="rublesign.circle.fill" size={24} color={colors.success} />
                <Text style={styles.statValue}>{Math.round(statistics.totalValue).toLocaleString()}</Text>
                <Text style={styles.statLabel}>₽ общая стоимость</Text>
              </View>
            </View>
          </View>
        )}

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Экспорт данных</Text>
          <Text style={styles.sectionDescription}>
            Создайте резервную копию ваших данных для безопасного хранения или переноса на другое устройство.
          </Text>
          
          <Pressable
            style={[commonStyles.button, { backgroundColor: colors.primary, marginBottom: 12 }]}
            onPress={handleExportAll}
            disabled={loading}
          >
            <IconSymbol name="square.and.arrow.up.fill" size={20} color={colors.white} />
            <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
              Экспортировать все данные
            </Text>
          </Pressable>

          <Pressable
            style={[commonStyles.button, { backgroundColor: colors.secondary }]}
            onPress={handleExportItems}
            disabled={loading}
          >
            <IconSymbol name="cube.box.fill" size={20} color={colors.white} />
            <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
              Экспортировать только предметы
            </Text>
          </Pressable>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Импорт данных</Text>
          <Text style={styles.sectionDescription}>
            Восстановите данные из ранее созданной резервной копии или импортируйте данные с другого устройства.
          </Text>
          
          <Pressable
            style={[commonStyles.button, { backgroundColor: colors.warning }]}
            onPress={handleImport}
            disabled={loading}
          >
            <IconSymbol name="square.and.arrow.down.fill" size={20} color={colors.white} />
            <Text style={[commonStyles.buttonText, { color: colors.white, marginLeft: 8 }]}>
              Импортировать данные
            </Text>
          </Pressable>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Важная информация</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <IconSymbol name="info.circle.fill" size={16} color={colors.info} />
              <Text style={styles.infoText}>
                Экспортированные файлы содержат все ваши данные в формате JSON
              </Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="exclamationmark.triangle.fill" size={16} color={colors.warning} />
              <Text style={styles.infoText}>
                При импорте с заменой все текущие данные будут удалены
              </Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="lock.fill" size={16} color={colors.success} />
              <Text style={styles.infoText}>
                Все данные хранятся локально на вашем устройстве
              </Text>
            </View>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Обработка данных...</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginLeft: 8,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
