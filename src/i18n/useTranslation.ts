import { useSettingsStore } from '../store/useSettingsStore';
import { translations, TranslationKeys } from './translations';

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  let result = str;
  Object.entries(params).forEach(([k, v]) => {
    result = result.replace(`{${k}}`, String(v));
  });
  return result;
}

export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const dict = translations[language];

  function t(key: TranslationKeys, params?: Record<string, string | number>): string {
    return interpolate(dict[key], params);
  }

  return { t, language };
}

// For use outside React components (services, etc.)
export function getTranslation(
  key: TranslationKeys,
  params?: Record<string, string | number>
): string {
  const language = useSettingsStore.getState().language;
  const dict = translations[language];
  return interpolate(dict[key], params);
}
