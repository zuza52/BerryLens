// app/settings.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme/colors';
import { loadApiKey, saveApiKey, clearApiKey } from '@/services/storage';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    loadApiKey().then(k => {
      if (k) {
        setApiKey(k);
        setHasKey(true);
      }
    });
  }, []);

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed || trimmed.length < 20) {
      Alert.alert('Ошибка', 'Введи корректный API ключ (начинается с AIza...)');
      return;
    }
    await saveApiKey(trimmed);
    setHasKey(true);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 1200);
  };

  const handleClear = () => {
    Alert.alert('Удалить ключ?', 'Тебе придётся ввести его заново для работы приложения', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          await clearApiKey();
          setApiKey('');
          setHasKey(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>Настройки</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* API Key section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Gemini API Ключ</Text>
            {hasKey && (
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
                <Text style={styles.activeBadgeText}>Активен</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionBody}>
            Для анализа фото нужен бесплатный ключ от Google AI Studio. 1500 запросов в день бесплатно.
          </Text>

          {/* Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={showKey ? apiKey : apiKey ? '•'.repeat(Math.min(apiKey.length, 24)) : ''}
              onChangeText={setApiKey}
              placeholder="AIzaSy..."
              placeholderTextColor={Colors.onSurfaceVariant}
              secureTextEntry={false}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setShowKey(true)}
              onBlur={() => setShowKey(false)}
            />
            <TouchableOpacity
              style={styles.inputAction}
              onPress={() => setShowKey(s => !s)}
            >
              <Ionicons
                name={showKey ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Ionicons
              name={saved ? 'checkmark' : 'save-outline'}
              size={18}
              color={Colors.onPrimary}
            />
            <Text style={styles.saveBtnText}>
              {saved ? 'Сохранено!' : 'Сохранить ключ'}
            </Text>
          </TouchableOpacity>

          {hasKey && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Ionicons name="trash-outline" size={16} color={Colors.error} />
              <Text style={styles.clearBtnText}>Удалить ключ</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* How to get key */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.secondary} />
            <Text style={styles.sectionTitle}>Как получить ключ</Text>
          </View>

          {[
            { step: '1', text: 'Открой Google AI Studio' },
            { step: '2', text: 'Войди через Google аккаунт' },
            { step: '3', text: 'Нажми «Get API key» → «Create API key»' },
            { step: '4', text: 'Скопируй и вставь ключ выше' },
          ].map(item => (
            <View key={item.step} style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>{item.step}</Text>
              </View>
              <Text style={styles.stepText}>{item.text}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}
          >
            <Ionicons name="open-outline" size={16} color={Colors.primary} />
            <Text style={styles.linkBtnText}>Открыть Google AI Studio</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.tertiary} />
            <Text style={styles.sectionTitle}>О приложении</Text>
          </View>
          <Text style={styles.sectionBody}>
            BerryLens использует Gemini Vision от Google для определения ягод и фруктов на фотографиях. Ключ хранится только на твоём устройстве.
          </Text>
          <Text style={[styles.sectionBody, { marginTop: Spacing.sm, color: Colors.outlineVariant + 'ff' }]}>
            Версия 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
  },
  // Section
  section: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
    flex: 1,
  },
  sectionBody: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    lineHeight: 22,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  activeBadgeText: {
    ...Typography.labelSmall,
    color: Colors.onPrimaryContainer,
  },
  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.outline,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputAction: {
    padding: Spacing.md,
  },
  // Buttons
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  saveBtnSuccess: {
    backgroundColor: '#2E7D52',
  },
  saveBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
  },
  clearBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  clearBtnText: {
    ...Typography.labelMedium,
    color: Colors.error,
  },
  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumber: {
    ...Typography.labelMedium,
    color: Colors.onPrimaryContainer,
  },
  stepText: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    flex: 1,
    paddingTop: 4,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryContainer,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  linkBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimaryContainer,
  },
});

// Fix missing Platform import
import { Platform } from 'react-native';
