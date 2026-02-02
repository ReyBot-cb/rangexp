import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { theme } from '@rangexp/theme';

export type RexMood = 'happy' | 'celebrate' | 'support' | 'neutral' | 'sleeping';
export type RexSize = 'small' | 'medium' | 'large' | 'xl';
export type SpeechBubblePosition = 'top' | 'bottom' | 'left';

interface RexProps {
  mood?: RexMood;
  size?: RexSize;
  interactive?: boolean;
  showSpeechBubble?: boolean;
  speechBubblePosition?: SpeechBubblePosition;
  message?: string;
  onPress?: () => void;
  style?: ViewStyle;
  animationState?: 'idle' | 'greeting' | 'celebrating';
}

const videoSources: Record<RexMood, any> = {
  happy: require('../../../../assets/happy.mp4'),
  celebrate: require('../../../../assets/celebration.mp4'),
  support: require('../../../../assets/supportive.mp4'),
  neutral: require('../../../../assets/iddle.mp4'),
  sleeping: require('../../../../assets/sleep.mp4'),
};

const sizeConfig: Record<RexSize, { width: number; height: number }> = {
  small: { width: 60, height: 80 },
  medium: { width: 80, height: 110 },
  large: { width: 120, height: 160 },
  xl: { width: 160, height: 220 },
};

export function Rex({
  mood = 'happy',
  size = 'medium',
  interactive = false,
  showSpeechBubble = false,
  speechBubblePosition = 'top',
  message,
  onPress,
  style,
  animationState = 'idle',
}: RexProps) {
  const dimensions = sizeConfig[size];

  const [currentMood, setCurrentMood] = useState(mood);
  const [nextMood, setNextMood] = useState<RexMood | null>(null);

  const currentOpacity = useRef(new Animated.Value(1)).current;
  const nextOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Handle mood transitions with crossfade
  useEffect(() => {
    if (mood !== currentMood && !nextMood) {
      setNextMood(mood);

      Animated.parallel([
        Animated.timing(currentOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(nextOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentMood(mood);
        setNextMood(null);
        currentOpacity.setValue(1);
        nextOpacity.setValue(0);
      });
    }
  }, [mood, currentMood, nextMood, currentOpacity, nextOpacity]);

  // Greeting animation (bounce)
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

  // Celebrating animation (pulse)
  useEffect(() => {
    if (animationState === 'celebrating' || mood === 'celebrate') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 400, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      scaleAnim.setValue(1);
    }
  }, [animationState, mood, scaleAnim]);

  const handlePress = () => {
    if (!interactive || !onPress) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const Container = interactive ? TouchableOpacity : View;
  const containerProps = interactive ? { onPress: handlePress, activeOpacity: 0.9 } : {};

  return (
    <Container style={[styles.container, style]} {...containerProps}>
      {/* Video container with animations */}
      <Animated.View
        style={[
          styles.videoContainer,
          {
            width: dimensions.width,
            height: dimensions.height,
            transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
          },
        ]}
      >
        {/* Current mood video */}
        <Animated.View style={[styles.videoWrapper, { opacity: currentOpacity }]}>
          <Video
            source={videoSources[currentMood]}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            isMuted
          />
        </Animated.View>

        {/* Next mood video (for crossfade) */}
        {nextMood && (
          <Animated.View style={[styles.videoWrapper, styles.videoOverlay, { opacity: nextOpacity }]}>
            <Video
              source={videoSources[nextMood]}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              isMuted
            />
          </Animated.View>
        )}
      </Animated.View>

      {/* Speech bubble */}
      {showSpeechBubble && message && (
        <View
          style={[
            styles.speechBubble,
            speechBubblePosition === 'top' && { bottom: dimensions.height + 10 },
            speechBubblePosition === 'bottom' && { top: dimensions.height + 10 },
            speechBubblePosition === 'left' && {
              right: dimensions.width + 10,
              top: dimensions.height / 2 - 20,
            },
          ]}
        >
          <Text style={styles.speechBubbleText}>{message}</Text>
          <View
            style={[
              styles.speechBubbleArrow,
              speechBubblePosition === 'top' && styles.speechBubbleArrowBottom,
              speechBubblePosition === 'bottom' && styles.speechBubbleArrowTop,
              speechBubblePosition === 'left' && styles.speechBubbleArrowRight,
            ]}
          />
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  speechBubble: {
    position: 'absolute',
    backgroundColor: theme.colors.background.light.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.soft,
    maxWidth: 200,
  },
  speechBubbleText: {
    fontFamily: theme.typography.fontFamily.body,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary.light,
    textAlign: 'center',
  },
  speechBubbleArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  speechBubbleArrowBottom: {
    bottom: -8,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.background.light.card,
  },
  speechBubbleArrowTop: {
    top: -8,
    alignSelf: 'center',
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: theme.colors.background.light.card,
  },
  speechBubbleArrowRight: {
    right: -8,
    top: '50%',
    marginTop: -8,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.background.light.card,
  },
});
