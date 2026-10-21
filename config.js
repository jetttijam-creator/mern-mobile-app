import { Platform } from 'react-native';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is missing. Create a .env file in the project root (Module 6, Phase 1).'
  );
}

// Inside the Android emulator, "localhost" means the emulator itself, not your Mac.
// 10.0.2.2 is the emulator's alias for the host computer. Real addresses (HTTPS, a Wi-Fi IP) pass through untouched.
export function resolveApiUrl(url, os = Platform.OS) {
  if (os !== 'android') return url;
  return url.replace(/\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/, '//10.0.2.2');
}

export const API_URL = resolveApiUrl(apiUrl);
