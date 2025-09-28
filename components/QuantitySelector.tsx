
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';

interface QuantitySelectorProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, loanedTo: string) => void;
  maxQuantity: number;
  itemName: string;
}

export function QuantitySelector({ 
  visible, 
  onClose, 
  onConfirm, 
  maxQuantity, 
  itemName 
}: QuantitySelectorProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [loanedTo, setLoanedTo] = useState('');

  const handleConfirm = () => {
    if (!loanedTo.trim()) {
      Alert.alert('Ошибка', 'Укажите, кому выдается предмет');
      return;
    }
    
    if (selectedQuantity < 1 || selectedQuantity > maxQuantity) {
      Alert.alert('Ошибка', `Количество должно быть от 1 до ${maxQuantity}`);
      return;
    }

    onConfirm(selectedQuantity, loanedTo.trim());
    onClose();
    setSelectedQuantity(1);
    setLoanedTo('');
  };

  const handleClose = () => {
    onClose();
    setSelectedQuantity(1);
    setLoanedTo('');
  };

  const incrementQuantity = () => {
    if (selectedQuantity < maxQuantity) {
      setSelectedQuantity(selectedQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity(selectedQuantity - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Выдача предмета</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.itemName}>{itemName}</Text>
            <Text style={styles.subtitle}>
              Доступно: {maxQuantity} шт.
            </Text>

            <View style={commonStyles.inputGroup}>
              <Text style={commonStyles.label}>Кому выдается</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Введите имя или описание"
                value={loanedTo}
                onChangeText={setLoanedTo}
                autoCapitalize="words"
              />
            </View>

            <View style={commonStyles.inputGroup}>
              <Text style={commonStyles.label}>Количество</Text>
              <View style={styles.quantitySelector}>
                <Pressable
                  style={[styles.quantityButton, selectedQuantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={decrementQuantity}
                  disabled={selectedQuantity <= 1}
                >
                  <IconSymbol 
                    name="minus" 
                    size={20} 
                    color={selectedQuantity <= 1 ? colors.textSecondary : colors.primary} 
                  />
                </Pressable>
                
                <Text style={styles.quantityText}>{selectedQuantity}</Text>
                
                <Pressable
                  style={[styles.quantityButton, selectedQuantity >= maxQuantity && styles.quantityButtonDisabled]}
                  onPress={incrementQuantity}
                  disabled={selectedQuantity >= maxQuantity}
                >
                  <IconSymbol 
                    name="plus" 
                    size={20} 
                    color={selectedQuantity >= maxQuantity ? colors.textSecondary : colors.primary} 
                  />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[commonStyles.button, { backgroundColor: colors.textSecondary, flex: 1, marginRight: 8 }]}
              onPress={handleClose}
            >
              <Text style={[commonStyles.buttonText, { color: colors.white }]}>
                Отмена
              </Text>
            </Pressable>
            
            <Pressable
              style={[commonStyles.button, { backgroundColor: colors.primary, flex: 1, marginLeft: 8 }]}
              onPress={handleConfirm}
            >
              <Text style={[commonStyles.buttonText, { color: colors.white }]}>
                Выдать
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quantityButtonDisabled: {
    backgroundColor: colors.backgroundSecondary,
    borderColor: colors.textSecondary,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
  },
});
