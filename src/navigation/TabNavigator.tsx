import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useMasterState } from '../context/MasterStateContext';

export default function TabNavigator() {
  const { theme } = useMasterState();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.theme.primary,
        tabBarInactiveTintColor: theme.theme.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.theme.tabBar,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 