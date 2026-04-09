import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';

export type RootStackParamList = {
  MainTabs: undefined;
  Emergency: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  ShoeMonitor: undefined;
  History: undefined;
  Settings: undefined;
  Manual: undefined;
};

export type TabNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  StackNavigationProp<RootStackParamList>
>;
