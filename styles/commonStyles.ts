import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#007AFF',    // iOS Blue
  secondary: '#5856D6',  // iOS Purple
  accent: '#34C759',     // iOS Green
  background: '#F2F2F7', // iOS Light Background
  backgroundAlt: '#FFFFFF', // White
  text: '#000000',       // Black text
  textSecondary: '#8E8E93', // iOS Secondary text
  grey: '#C7C7CC',       // iOS Grey
  card: '#FFFFFF',       // White card background
  border: '#C6C6C8',     // iOS Border
  destructive: '#FF3B30', // iOS Red
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    maxWidth: 800,
    width: '100%',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    width: '100%',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    width: '100%',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  listItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 1,
  },
  searchBar: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(0, 122, 255, 0.3)',
    elevation: 8,
  },
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 8,
    paddingTop: 8,
  },
});
