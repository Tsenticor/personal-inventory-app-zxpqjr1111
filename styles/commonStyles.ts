
import { StyleSheet } from 'react-native';

export const colors = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#E3F2FD',
  primaryDark: '#0056CC',
  
  // Secondary colors
  secondary: '#5856D6',
  secondaryLight: '#F3F2FF',
  
  // Status colors
  success: '#34C759',
  successLight: '#E8F5E8',
  warning: '#FF9500',
  warningLight: '#FFF4E6',
  error: '#FF3B30',
  errorLight: '#FFEBEA',
  info: '#5AC8FA',
  infoLight: '#E6F7FF',
  
  // Neutral colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  card: '#FFFFFF',
  border: '#E5E5EA',
  
  // Text colors
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    minHeight: 44,
  },
  
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.card,
    minHeight: 44,
  },
  
  inputGroup: {
    marginBottom: 16,
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  flex1: {
    flex: 1,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  textRight: {
    textAlign: 'right',
  },
  
  marginTop: {
    marginTop: 16,
  },
  
  marginBottom: {
    marginBottom: 16,
  },
  
  marginHorizontal: {
    marginHorizontal: 16,
  },
  
  paddingHorizontal: {
    paddingHorizontal: 16,
  },
  
  paddingVertical: {
    paddingVertical: 16,
  },
});
