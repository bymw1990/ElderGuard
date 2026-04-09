import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export const AlarmService = {
  async play() {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: s } = await Audio.Sound.createAsync(
        require('../assets/sounds/alarm.mp3'),
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      sound = s;
    } catch (e) {
      console.warn('AlarmService: could not play alarm', e);
    }
  },

  async stop() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      sound = null;
    }
  },
};
