// services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE = '@berrylens_api_key';
const HISTORY_STORAGE = '@berrylens_history';

export async function saveApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(API_KEY_STORAGE, key);
}

export async function loadApiKey(): Promise<string | null> {
  return AsyncStorage.getItem(API_KEY_STORAGE);
}

export async function clearApiKey(): Promise<void> {
  await AsyncStorage.removeItem(API_KEY_STORAGE);
}

export interface HistoryItem {
  id: string;
  imageUri: string;
  analysis: import('./gemini').BerryAnalysis;
  timestamp: number;
}

export async function saveToHistory(item: Omit<HistoryItem, 'id'>): Promise<void> {
  const existing = await loadHistory();
  const newItem: HistoryItem = {
    ...item,
    id: Date.now().toString(),
  };
  const updated = [newItem, ...existing].slice(0, 20); // Хранить последние 20
  await AsyncStorage.setItem(HISTORY_STORAGE, JSON.stringify(updated));
}

export async function loadHistory(): Promise<HistoryItem[]> {
  const data = await AsyncStorage.getItem(HISTORY_STORAGE);
  return data ? JSON.parse(data) : [];
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_STORAGE);
}
