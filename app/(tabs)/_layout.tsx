
import { Tabs } from 'expo-router';
import React from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Инвентарь',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name={focused ? "house.fill" : "house"} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Поиск',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name={focused ? "magnifyingglass.circle.fill" : "magnifyingglass"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: 'Выдача',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name={focused ? "arrow.up.right.square.fill" : "arrow.up.right.square"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Ещё',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={24} name={focused ? "ellipsis.circle.fill" : "ellipsis.circle"} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
