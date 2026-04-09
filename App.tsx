import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as KeepAwake from 'expo-keep-awake';
import { Audio } from 'expo-av';
import { useSensorFeed } from './src/hooks/useSensorFeed';
import { useEmergencyFlow } from './src/hooks/useEmergencyFlow';
import { useDataSync } from './src/hooks/useDataSync';
import { NotificationService } from './src/services/NotificationService';
import { LocationService } from './src/services/LocationService';
import RootNavigator from './src/navigation/RootNavigator';

function AppInner() {
  useSensorFeed();
  useEmergencyFlow();
  useDataSync();
  return <RootNavigator />;
}

export default function App() {
  useEffect(() => {
    KeepAwake.activateKeepAwakeAsync();
    NotificationService.requestPermissions();
    LocationService.requestPermissions();

    // Keep JS engine alive when app is backgrounded (screen off / switched away).
    // Playing silence prevents iOS from freezing setInterval timers, which
    // the sensor adapters and emergency countdown depend on.
    let silenceSound: Audio.Sound | null = null;
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync(
          require('./src/assets/sounds/silence.wav'),
          { shouldPlay: true, isLooping: true, volume: 0 }
        );
        silenceSound = sound;
      } catch (e) {
        console.warn('Background audio setup failed:', e);
      }
    })();

    return () => {
      KeepAwake.deactivateKeepAwake();
      silenceSound?.stopAsync().then(() => silenceSound?.unloadAsync());
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppInner />
    </NavigationContainer>
  );
}
