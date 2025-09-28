
import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { ContextMenuOptions, ContextMenuAction } from '@/types/inventory';

interface ContextMenuProps {
  visible: boolean;
  onClose: () => void;
  options: ContextMenuOptions;
  onAction: (actionId: string) => void;
  position?: { x: number; y: number };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function ContextMenu({ visible, onClose, options, onAction, position }: ContextMenuProps) {
  const handleAction = (actionId: string) => {
    onAction(actionId);
    onClose();
  };

  const menuStyle = position ? {
    position: 'absolute' as const,
    top: Math.min(position.y, screenHeight - 300),
    left: Math.min(position.x, screenWidth - 250),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.2,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menu, menuStyle]}>
          {options.title && (
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2}>{options.title}</Text>
            </View>
          )}
          
          <View style={styles.actionsContainer}>
            {options.actions.map((action, index) => (
              <Pressable
                key={action.id}
                style={[
                  styles.action,
                  index === 0 && !options.title && styles.firstAction,
                  index === options.actions.length - 1 && styles.lastAction,
                  action.destructive && styles.destructiveAction,
                ]}
                onPress={() => handleAction(action.id)}
              >
                <IconSymbol 
                  name={action.icon as any} 
                  size={18} 
                  color={action.destructive ? colors.error : (action.color || colors.text)} 
                />
                <Text style={[
                  styles.actionText,
                  action.destructive && styles.destructiveText,
                  action.color && { color: action.color }
                ]} numberOfLines={2}>
                  {action.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: colors.card,
    borderRadius: 12,
    minWidth: 220,
    maxWidth: 320,
    maxHeight: screenHeight * 0.6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    maxHeight: screenHeight * 0.4,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  firstAction: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastAction: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  destructiveAction: {
    backgroundColor: colors.errorLight,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  destructiveText: {
    color: colors.error,
  },
});
