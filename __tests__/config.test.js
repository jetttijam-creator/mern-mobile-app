import { resolveApiUrl } from '../config';

test('on Android, localhost becomes the emulator alias for the host', () => {
  expect(resolveApiUrl('http://localhost:3000/api/v1', 'android')).toBe('http://10.0.2.2:3000/api/v1');
  expect(resolveApiUrl('http://127.0.0.1:3000/api/v1', 'android')).toBe('http://10.0.2.2:3000/api/v1');
});

test('on iOS, localhost stays localhost', () => {
  expect(resolveApiUrl('http://localhost:3000/api/v1', 'ios')).toBe('http://localhost:3000/api/v1');
});

test('real addresses are never rewritten, on either platform', () => {
  const live = 'https://shopfront-api-jett.onrender.com/api/v1';
  const wifi = 'http://192.168.2.61:3000/api/v1';
  expect(resolveApiUrl(live, 'android')).toBe(live);
  expect(resolveApiUrl(wifi, 'android')).toBe(wifi);
  expect(resolveApiUrl(live, 'ios')).toBe(live);
});

test('a host that merely starts with localhost is left alone', () => {
  expect(resolveApiUrl('http://localhost.example.com/api', 'android')).toBe('http://localhost.example.com/api');
});
