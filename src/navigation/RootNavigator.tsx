import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import EmergencyScreen from '../screens/EmergencyScreen';
import { useEmergencyStore } from '../store/useEmergencyStore';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

const Stack = createStackNavigator<RootStackParamList>();

// Watcher that pushes/pops the Emergency modal based on store state
function EmergencyWatcher() {
  const status = useEmergencyStore((s) => s.status);
  const nav = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (status === 'triggered' || status === 'executing') {
      nav.navigate('Emergency');
    }
  }, [status]);

  return null;
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => (
          <>
            <TabNavigator />
            <EmergencyWatcher />
          </>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: false,
          cardStyle: { backgroundColor: '#0d0d0d' },
        }}
      />
    </Stack.Navigator>
  );
}
