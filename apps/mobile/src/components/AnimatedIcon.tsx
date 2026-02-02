import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { Icon, IconName, IconWeight } from './Icon';

export type AnimationType = 'flicker' | 'pulse' | 'bounce' | 'shake' | 'none';

interface AnimatedIconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  animation?: AnimationType;
  style?: ViewStyle;
}

export function AnimatedIcon({
  name,
  size = 24,
  color,
  weight = 'regular',
  animation = 'none',
  style,
}: AnimatedIconProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;

    switch (animation) {
      case 'flicker':
        // Simula el parpadeo de una llama
        animationLoop = Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0.85,
                duration: 150,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 120,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0.9,
                duration: 120,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 130,
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 130,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        break;

      case 'pulse':
        // Pulso suave para iconos de gamificación
        animationLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.15,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'bounce':
        // Rebote continuo
        animationLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.2,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.delay(1000),
          ])
        );
        break;

      case 'shake':
        // Vibración sutil
        animationLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
          ])
        );
        break;
    }

    if (animationLoop) {
      animationLoop.start();
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
      rotateAnim.setValue(0);
    };
  }, [animation, scaleAnim, opacityAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }, { rotate }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Icon name={name} size={size} color={color} weight={weight} />
    </Animated.View>
  );
}

export default AnimatedIcon;
