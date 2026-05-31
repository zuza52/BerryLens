// app/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/theme/colors';
import { analyzeImage } from '@/services/gemini';
import { loadApiKey, saveToHistory } from '@/services/storage';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [loading, setLoading] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current || loading) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (!photo?.base64) throw new Error('Не удалось сделать снимок');

      await processImage(photo.uri, photo.base64);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset.base64) throw new Error('Не удалось загрузить изображение');

      setLoading(true);
      await processImage(asset.uri, asset.base64);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const processImage = async (uri: string, base64: string) => {
    const apiKey = await loadApiKey();
    if (!apiKey) {
      router.push('/settings');
      Alert.alert(
        'Нужен API ключ',
        'Введи Gemini API ключ в настройках для анализа фото'
      );
      return;
    }

    const analysis = await analyzeImage(base64, apiKey);

    await saveToHistory({
      imageUri: uri,
      analysis,
      timestamp: Date.now(),
    });

    router.push({
      pathname: '/result',
      params: {
        imageUri: uri,
        analysis: JSON.stringify(analysis),
      },
    });
  };

  const handleError = (err: any) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert('Ошибка', err?.message || 'Что-то пошло не так');
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={styles.permissionTitle}>Нужен доступ к камере</Text>
          <Text style={styles.permissionBody}>
            BerryLens использует камеру для фотографирования ягод и фруктов
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Разрешить доступ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.appName}>BerryLens</Text>
              <Text style={styles.appSubtitle}>Определение ягод и фруктов</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
              >
                <Ionicons name="camera-reverse-outline" size={22} color={Colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push('/settings')}
              >
                <Ionicons name="settings-outline" size={22} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Viewfinder frame */}
        <View style={styles.viewfinderContainer}>
          <View style={styles.viewfinder}>
            {/* Corner marks */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.viewfinderHint}>
            Направь камеру на ягоды или фрукты
          </Text>
        </View>

        {/* Bottom controls */}
        <SafeAreaView style={styles.bottomBar}>
          {/* Gallery */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleGallery}
            disabled={loading}
          >
            <Ionicons name="images-outline" size={26} color={Colors.onSurface} />
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity
            style={[styles.shutter, loading && styles.shutterDisabled]}
            onPress={handleCapture}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} size="large" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>

          {/* History */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/history')}
            disabled={loading}
          >
            <Ionicons name="time-outline" size={26} color={Colors.onSurface} />
          </TouchableOpacity>
        </SafeAreaView>
      </CameraView>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={styles.loadingText}>Анализирую изображение…</Text>
            <Text style={styles.loadingSubtext}>Gemini изучает ягоды</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const SHUTTER_SIZE = 80;
const FRAME_SIZE = SCREEN_W * 0.72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },
  // Header
  header: {
    paddingHorizontal: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  appName: {
    ...Typography.titleLarge,
    color: Colors.onSurface,
  },
  appSubtitle: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Viewfinder
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderRadius: BorderRadius.xl,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  viewfinderHint: {
    marginTop: Spacing.lg,
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  // Bottom bar
  bottomBar: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutter: {
    width: SHUTTER_SIZE,
    height: SHUTTER_SIZE,
    borderRadius: SHUTTER_SIZE / 2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  shutterDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  shutterInner: {
    width: SHUTTER_SIZE - 20,
    height: SHUTTER_SIZE - 20,
    borderRadius: (SHUTTER_SIZE - 20) / 2,
    backgroundColor: Colors.onPrimary,
    opacity: 0.9,
  },
  // Bottom controls wrapper (replaces SafeAreaView children)
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  // Permission
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionEmoji: { fontSize: 72, marginBottom: Spacing.lg },
  permissionTitle: {
    ...Typography.headlineSmall,
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  permissionBody: {
    ...Typography.bodyLarge,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  primaryButtonText: {
    ...Typography.labelLarge,
    color: Colors.onPrimary,
  },
  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    minWidth: 200,
  },
  loadingText: {
    ...Typography.titleMedium,
    color: Colors.onSurface,
  },
  loadingSubtext: {
    ...Typography.bodySmall,
    color: Colors.onSurfaceVariant,
  },
});
