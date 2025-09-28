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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});Fimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});iimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});limport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});eimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
}); import React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});dimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});oimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});eimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});simport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
}); import React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});nimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});oimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});timport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
}); import React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});eimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});ximport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});iimport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});simport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});timport React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});.import React from 'react';
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
    top: Math.min(position.y, screenHeight - 200),
    left: Math.min(position.x, screenWidth - 200),
  } : {
    alignSelf: 'center' as const,
    marginTop: screenHeight * 0.3,
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
              <Text style={styles.title}>{options.title}</Text>
            </View>
          )}
          
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
                size={20} 
                color={action.destructive ? colors.error : (action.color || colors.text)} 
              />
              <Text style={[
                styles.actionText,
                action.destructive && styles.destructiveText,
                action.color && { color: action.color }
              ]}>
                {action.title}
              </Text>
            </Pressable>
          ))}
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
    minWidth: 200,
    maxWidth: 280,
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
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: colors.error,
  },
});