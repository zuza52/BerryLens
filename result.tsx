// app/result.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme/colors';
import type { BerryAnalysis } from '@/services/gemini';

const { width: SCREEN_W } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_W * 0.75;

export default function ResultScreen() {
  const params = useLocalSearchParams<{ imageUri: string; analysis: string }>();
  const analysis: BerryAnalysis = JSON.parse(params.analysis || '{}');
  const isFound = analysis.name !== 'not_found';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌿 BerryLens определил: ${analysis.nameRu} ${analysis.emoji}\n\n${analysis.description}\n\n🍽 Вкус: ${analysis.taste}\n💊 Польза: ${analysis.nutrition}`,
      });
    } catch {}
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const confidenceColor =
    analysis.confidence > 80
      ? Colors.primary
      : analysis.confidence > 50
      ? Colors.warning
      : Colors.error;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: params.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Gradient overlay on image */}
          <View style={styles.imageOverlay} />

          {/* Back button */}
          <SafeAreaView style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color={Colors.onSurface} />
            </TouchableOpacity>
            {isFound && (
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={Colors.onSurface} />
              </TouchableOpacity>
            )}
          </SafeAreaView>

          {/* Emoji + Name over image */}
          {isFound && (
            <View style={styles.imageCaption}>
              <Text style={styles.emojiLarge}>{analysis.emoji}</Text>
              <Text style={styles.berryName}>{analysis.nameRu}</Text>
              <Text style={styles.berryNameEn}>{analysis.name}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!isFound ? (
            <View style={styles.notFoundCard}>
              <Text style={styles.notFoundEmoji}>🔍</Text>
              <Text style={styles.notFoundTitle}>Ничего не найдено</Text>
              <Text style={styles.notFoundBody}>{analysis.description}</Text>
              <TouchableOpacity style={styles.tryAgainBtn} onPress={handleBack}>
                <Text style={styles.tryAgainText}>Попробовать снова</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Confidence chip */}
              <View style={styles.confidenceRow}>
                <View style={[styles.confidenceChip, { borderColor: confidenceColor }]}>
                  <View style={[styles.confidenceDot, { backgroundColor: confidenceColor }]} />
                  <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                    Уверенность: {analysis.confidence}%
                  </Text>
                </View>

                {/* Edible badge */}
                <View
                  style={[
                    styles.edibleChip,
                    {
                      backgroundColor: analysis.edible
                        ? Colors.primaryContainer
                        : Colors.errorContainer,
                    },
                  ]}
                >
                  <Ionicons
                    name={analysis.edible ? 'checkmark-circle' : 'warning'}
                    size={14}
                    color={analysis.edible ? Colors.onPrimaryContainer : Colors.onErrorContainer}
                  />
                  <Text
                    style={[
                      styles.edibleText,
                      {
                        color: analysis.edible
                          ? Colors.onPrimaryContainer
                          : Colors.onErrorContainer,
                      },
                    ]}
                  >
                    {analysis.edible ? 'Съедобная' : 'Несъедобная'}
                  </Text>
                </View>
              </View>

              {/* Description card */}
              <InfoCard icon="leaf-outline" title="Описание">
                <Text style={styles.cardBody}>{analysis.description}</Text>
              </InfoCard>

              {/* Warning */}
              {analysis.warning && (
                <View style={styles.warningCard}>
                  <View style={styles.warningHeader}>
                    <Ionicons name="warning" size={20} color={Colors.warning} />
                    <Text style={styles.warningTitle}>Внимание</Text>
                  </View>
                  <Text style={styles.warningBody}>{analysis.warning}</Text>
                </View>
              )}

              {/* Grid: taste + season */}
              <View style={styles.grid}>
                <InfoCard icon="restaurant-outline" title="Вкус" style={styles.gridCard}>
                  <Text style={styles.cardBody}>{analysis.taste}</Text>
                </InfoCard>
                <InfoCard icon="calendar-outline" title="Сезон" style={styles.gridCard}>
                  <Text style={styles.cardBody}>{analysis.season}</Text>
                </InfoCard>
              </View>

              {/* Nutrition */}
              <InfoCard icon="fitness-outline" title="Польза для здоровья">
                <Text style={styles.cardBody}>{analysis.nutrition}</Text>
              </InfoCard>

              {/* Scan again */}
              <TouchableOpacity style={styles.scanAgainBtn} onPress={handleBack}>
                <Ionicons name="camera-outline" size={20} color={Colors.onPrimary} />
                <Text style={styles.scanAgainText}>Сканировать снова</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({
  icon,
  title,
  children,
  style,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon as any} size={16} color={Colors.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  // Image
  imageContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
    // Bottom gradient effect via shadow
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCaption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    alignItems: 'flex-start',
  },
  emojiLarge: {
    fontSize: 40,
    marginBottom: Spacing.xs,
  },
  berryName: {
    ...Typography.headlineMedium,
    color: Colors.onSurface,
    fontWeight: '700',
  },
  berryNameEn: {
    ...Typography.bodyMedium,
    color: Colors.onSurfaceVariant,
    textTransform: 'capitalize',
  },
  // Content
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  confidenceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  confidenceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1.5,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    ...Typography.labelMedium,
  },
  edibleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  edibleText: {
    ...Typography.labelMedium,
  },
  // Card
  card: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardTitle: {
    ...Typography.labelLarge,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardBody: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
    lineHeight: 22,
  },
  // Warning
  warningCard: {
    backgroundColor: Colors.warningContainer,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  warningTitle: {
    ...Typography.labelLarge,
    color: Colors.warning,
  },
  warningBody: {
    ...Typography.bodyMedium,
    color: Colors.onSurface,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  gridCard: {
    flex: 1,
  },
  // Scan again
  scanAgainBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  scanAgainText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
  },
  // Not found
  notFoundCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  notFoundEmoji: { fontSize: 64 },
  notFoundTitle: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
  },
  notFoundBody: {
    ...Typography.bodyLarge,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  tryAgainBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  tryAgainText: {
    ...Typography.labelLarge,
    color: Colors.onPrimaryContainer,
  },
});
