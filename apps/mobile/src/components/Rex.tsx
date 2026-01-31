import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ViewStyle, Animated, Platform } from 'react-native';
import { theme } from '@rangexp/theme';

export type RexMood = 'happy' | 'celebrate' | 'support' | 'neutral' | 'sleeping';
export type RexSize = 'small' | 'medium' | 'large' | 'xl';

interface RexProps {
  mood?: RexMood;
  size?: RexSize;
  interactive?: boolean;
  showSpeechBubble?: boolean;
  message?: string;
  onPress?: () => void;
  style?: ViewStyle;
  animationState?: 'idle' | 'greeting' | 'celebrating';
}

const moodConfig: Record<string, { color: string; glowColor: string; eyeColor: string }> = {
  happy: { color: theme.colors.rex.body, glowColor: theme.colors.rex.happy, eyeColor: theme.colors.text.primary.light },
  celebrate: { color: '#F59E0B', glowColor: '#FCD34D', eyeColor: theme.colors.text.primary.light },
  support: { color: theme.colors.rex.support, glowColor: '#3B82F6', eyeColor: theme.colors.text.primary.light },
  neutral: { color: theme.colors.rex.neutral, glowColor: theme.colors.rex.body, eyeColor: theme.colors.text.primary.light },
  sleeping: { color: '#6366F1', glowColor: '#818CF8', eyeColor: theme.colors.text.primary.light },
};

const sizeConfig: Record<string, { width: number; height: number }> = {
  small: { width: 60, height: 80 },
  medium: { width: 80, height: 110 },
  large: { width: 120, height: 160 },
  xl: { width: 160, height: 220 },
};

export function Rex({ mood = 'happy', size = 'medium', interactive = false, showSpeechBubble = false, message, onPress, style, animationState = 'idle' }: RexProps) {
  const config = moodConfig[mood] || moodConfig.happy;
  const dimensions = sizeConfig[size];
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (mood === 'sleeping') return;
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    float.start();
    return () => float.stop();
  }, [floatAnim, mood]);

  useEffect(() => {
    if (animationState === 'greeting') {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -15, duration: 300, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: -8, duration: 200, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [animationState, bounceAnim]);

  useEffect(() => {
    if (animationState === 'celebrating' || mood === 'celebrate') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [animationState, mood, scaleAnim]);

  const handlePress = () => {
    if (!interactive || !onPress) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const getEyeContent = () => {
    switch (mood) {
      case 'happy':
        return (
          <View style={styles.eyesRow}>
            <View style={[styles.eye, styles.eyeHappy, { backgroundColor: config.eyeColor }]} />
            <View style={[styles.eye, styles.eyeHappy, { backgroundColor: config.eyeColor }]} />
          </View>
        );
      case 'celebrate':
        return (
          <View style={styles.eyesRow}>
            <View style={[styles.eye, styles.eyeCelebrate, { backgroundColor: config.eyeColor }]} />
            <View style={[styles.eye, styles.eyeCelebrate, { backgroundColor: config.eyeColor }]} />
          </View>
        );
      case 'sleeping':
        return (
          <View style={styles.eyesRow}>
            <View style={[styles.eye, styles.eyeSleeping, { backgroundColor: config.eyeColor }]} />
            <View style={[styles.eye, styles.eyeSleeping, { backgroundColor: config.eyeColor }]} />
          </View>
        );
      default:
        return (
          <View style={styles.eyesRow}>
            <View style={[styles.eye, { backgroundColor: config.eyeColor }]} />
            <View style={[styles.eye, { backgroundColor: config.eyeColor }]} />
          </View>
        );
    }
  };

  const getMouthContent = () => {
    switch (mood) {
      case 'happy':
      case 'celebrate':
        return <View style={[styles.mouth, styles.mouthHappy, { borderBottomColor: config.eyeColor }]} />;
      case 'sleeping':
        return <View style={styles.mouthSleeping} />;
      case 'support':
        return <View style={[styles.mouth, styles.mouthSupport, { borderBottomColor: config.eyeColor }]} />;
      default:
        return <View style={[styles.mouth, styles.mouthNeutral, { borderBottomColor: config.eyeColor }]} />;
    }
  };

  const Container = interactive ? TouchableOpacity : View;
  const containerStyle = interactive ? { cursor: 'pointer' as const } : {};

  return (
    <Container style={[styles.container, style]} onPress={handlePress} {...containerStyle}>
      {/* Glow effect */}
      <View style={[styles.glow, { backgroundColor: config.glowColor + '40', width: dimensions.width * 1.5, height: dimensions.width * 1.5 }]} />
      
      {/* Main body */}
      <Animated.View style={[
        styles.body,
        {
          width: dimensions.width,
          height: dimensions.height * 0.85,
          backgroundColor: config.color,
          borderRadius: dimensions.width * 0.5,
          transform: [{ scale: scaleAnim }, { translateY: floatAnim }, { translateY: bounceAnim }],
        }
      ]}>
        {/* Eyes */}
        <View style={styles.eyesContainer}>
          {getEyeContent()}
        </View>

        {/* Cheeks */}
        <View style={styles.cheeks}>
          <View style={[styles.cheek, { backgroundColor: 'rgba(236, 72, 153, 0.3)' }]} />
          <View style={[styles.cheek, { backgroundColor: 'rgba(236, 72, 153, 0.3)' }]} />
        </View>

        {/* Mouth */}
        <View style={styles.mouthContainer}>
          {getMouthContent()}
        </View>
      </Animated.View>

      {/* Speech bubble */}
      {showSpeechBubble && message && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechBubbleText}>{message}</Text>
        </View>
      )}

      {/* Z's for sleeping */}
      {mood === 'sleeping' && (
        <Animated.View style={[styles.zzz, { transform: [{ translateY: floatAnim }] }]}>
          <Text style={styles.zzzText}>z</Text>
          <Text style={[styles.zzzText, { fontSize: 14 }]}>z</Text>
        </Animated.View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.5,
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.rex,
  },
  eyesContainer: {
    position: 'absolute',
    top: '35%',
    width: '60%',
    alignItems: 'center',
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 16,
  },
  eye: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  eyeHappy: {
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '0deg' }],
  },
  eyeCelebrate: {
    width: 14,
    height: 14,
    borderRadius: 7,
    transform: [{ scaleY: 0.8 }],
  },
  eyeSleeping: {
    width: 16,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  cheeks: {
    position: 'absolute',
    bottom: '30%',
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cheek: {
    width: 12,
    height: 6,
    borderRadius: 3,
  },
  mouthContainer: {
    position: 'absolute',
    bottom: '20%',
    width: '40%',
    alignItems: 'center',
  },
  mouth: {
    width: 28,
    height: 14,
    borderBottomWidth: 3,
    borderRadius: 14,
  },
  mouthHappy: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  mouthSupport: {
    width: 24,
    height: 10,
  },
  mouthNeutral: {
    width: 20,
    height: 8,
    borderBottomWidth: 2,
  },
  mouthSleeping: {
    width: 16,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 3,
  },
  speechBubble: {
    position: 'absolute',
    top: -50,
    backgroundColor: theme.colors.background.card.light,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.soft,
  },
  speechBubbleText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary.light,
    textAlign: 'center',
  },
  zzz: {
    position: 'absolute',
    top: 0,
    right: -20,
  },
  zzzText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: 18,
    color: theme.colors.text.secondary.light,
    fontWeight: 'bold',
  },
});
