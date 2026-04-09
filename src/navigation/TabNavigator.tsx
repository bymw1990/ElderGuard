import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import ShoeMonitorScreen from '../screens/ShoeMonitorScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ManualScreen from '../screens/ManualScreen';
import { useTranslation } from '../i18n/useTranslation';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#1a1a2e', borderTopColor: '#333' },
        tabBarActiveTintColor: '#00b4d8',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('tab_dashboard'), tabBarLabel: t('tab_dashboard') }} />
      <Tab.Screen name="ShoeMonitor" component={ShoeMonitorScreen} options={{ title: t('tab_shoes'), tabBarLabel: t('tab_shoes') }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: t('tab_history'), tabBarLabel: t('tab_history') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tab_settings'), tabBarLabel: t('tab_settings') }} />
      <Tab.Screen name="Manual" component={ManualScreen} options={{ title: t('tab_manual'), tabBarLabel: t('tab_manual') }} />
    </Tab.Navigator>
  );
}
