// app/history.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme/colors';
import { loadHistory, clearHistory, type HistoryItem } from '@/services/storage';

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setItems);
    }, [])
  );

  const handleClear = () => {
    Alert.alert('Очистить историю?', 'Все записи будут удалены', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Очистить',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setItems([]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  const handleItem = (item: HistoryItem) => {
    router.push({
      pathname: '/result',
      params: {
        imageUri: item.imageUri,
        analysis: JSON.stringify(item.analysis),
      },
    });
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>История</Text>
        {items.length > 0 ? (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🍃</Text>
          <Text style={styles.emptyTitle}>История пуста</Text>
          <Text style={styles.emptyBody}>
            Сфотографируй ягоды или фрукты — результаты появятся здесь
          </Text>
          <TouchableOpacity style={styles.scanBtn} onPress={() => router.back()}>
            <Ionicons name="camera-outline" size={18} color={Colors.onPrimary} />
            <Text style={styles.scanBtnText}>Сканировать</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleItem(item)} activeOpacity={0.8}>
              <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardEmoji}>{item.analysis.emoji}</Text>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>
                      {item.analysis.nameRu}
                    </Text>
                    <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
                  </View>
                </View>
                <View style={styles.cardBadges}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: item.analysis.edible
                          ? Colors.primaryContainer
                          : Colors.errorContainer,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color: item.analysis.edible
                            ? Colors.onPrimaryContainer
                            : Colors.onErrorContainer,
                        },
                      ]}
                    >
                      {item.analysis.edible ? 'Съедобная' : 'Несъедобная'}
                    </Text>
                  </View>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{item.analysis.confidence}%</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
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
  clearBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.errorContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    gap: Spacing.md,
    paddingRight: Spacing.md,
  },
  cardImage: {
    width: 80,
    height: 80,
  },
  cardContent: {
    flex: 1,
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cardEmoji: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardName: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
  },
  cardDate: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  cardBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    ...Typography.labelSmall,
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  confidenceText: {
    ...Typography.labelSmall,
    color: Colors.onSurfaceVariant,
  },
  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyEmoji: { fontSize: 72 },
  emptyTitle: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
  },
  emptyBody: {
    ...Typography.bodyLarge,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  scanBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  scanBtnText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
  },
});
