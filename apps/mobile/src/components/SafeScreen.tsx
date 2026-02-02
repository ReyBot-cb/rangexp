import { ReactNode } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets, Edge } from 'react-native-safe-area-context';
import { theme } from '@rangexp/theme';

type SafeScreenVariant = 'scroll' | 'static' | 'keyboard';

interface SafeScreenProps {
  children: ReactNode;
  /** Screen variant: 'scroll' for scrollable, 'static' for fixed, 'keyboard' for forms */
  variant?: SafeScreenVariant;
  /** Which edges to apply safe area insets */
  edges?: Edge[];
  /** Background color override */
  backgroundColor?: string;
  /** Additional style for the container */
  style?: StyleProp<ViewStyle>;
  /** Additional style for the content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Horizontal padding (defaults to theme.spacing.lg) */
  horizontalPadding?: number;
  /** ScrollView props for scroll variant */
  scrollViewProps?: React.ComponentProps<typeof ScrollView>;
}

/**
 * SafeScreen - A consistent wrapper for all screens that handles safe area insets
 *
 * Usage:
 * - For scrollable screens: <SafeScreen variant="scroll">...</SafeScreen>
 * - For static screens: <SafeScreen variant="static">...</SafeScreen>
 * - For screens with forms: <SafeScreen variant="keyboard">...</SafeScreen>
 *
 * By default applies safe area to top edge. For screens with tab bars,
 * the bottom is handled by the tab bar itself.
 */
export function SafeScreen({
  children,
  variant = 'scroll',
  edges = ['top'],
  backgroundColor = theme.colors.background.light.primary,
  style,
  contentContainerStyle,
  horizontalPadding = theme.spacing.lg,
  scrollViewProps,
}: SafeScreenProps) {
  const insets = useSafeAreaInsets();

  // Calculate padding based on edges
  const edgePadding: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: horizontalPadding,
    ...edgePadding,
  };

  if (variant === 'static') {
    return (
      <View style={[containerStyle, contentStyle, style]}>
        {children}
      </View>
    );
  }

  if (variant === 'keyboard') {
    return (
      <KeyboardAvoidingView
        style={[containerStyle, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[contentStyle, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Default: scroll variant
  return (
    <View style={[containerStyle, style]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[contentStyle, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/**
 * Hook to get safe area values for custom implementations
 */
export function useSafeArea() {
  const insets = useSafeAreaInsets();
  return {
    insets,
    // Convenience values for common use cases
    topPadding: insets.top,
    bottomPadding: insets.bottom,
    // For screens with tab bar (tab bar height + home indicator)
    tabBarBottomPadding: Math.max(insets.bottom, 20),
  };
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
