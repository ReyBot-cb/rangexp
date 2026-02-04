import React from 'react';
import { theme } from '@rangexp/theme';
import {
  House,
  Plus,
  PlusCircle,
  Trophy,
  Users,
  UsersFour,
  User,
  UserCircle,
  UserPlus,
  ArrowLeft,
  Gear,
  GearSix,
  Bell,
  BellRinging,
  Lock,
  LockKey,
  Syringe,
  Drop,
  Fire,
  Lightning,
  Star,
  Crown,
  CrownSimple,
  Medal,
  Target,
  ChartLine,
  ChartLineUp,
  Calendar,
  CalendarBlank,
  Clock,
  ClockAfternoon,
  Moon,
  MoonStars,
  Sun,
  SunHorizon,
  ForkKnife,
  CookingPot,
  Bed,
  MapPin,
  Note,
  Notebook,
  FloppyDisk,
  Check,
  CheckCircle,
  X,
  XCircle,
  Warning,
  WarningCircle,
  Info,
  Question,
  MagnifyingGlass,
  Heart,
  HandsClapping,
  ThumbsUp,
  ChatCircle,
  PaperPlaneTilt,
  Share,
  SignOut,
  SignIn,
  CaretRight,
  CaretDown,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeSlash,
  Envelope,
  At,
  Key,
  Shield,
  ShieldCheck,
  Sparkle,
  Gift,
  Confetti,
  GameController,
  Sword,
  FlagBanner,
  SealCheck,
  Scroll,
  Lightbulb,
  Cloud,
  type IconProps as PhosphorIconProps,
} from 'phosphor-react-native';

export type IconName =
  // Navigation
  | 'home'
  | 'plus'
  | 'plus-circle'
  | 'trophy'
  | 'users'
  | 'users-four'
  | 'user'
  | 'user-circle'
  | 'user-plus'
  | 'arrow-left'
  | 'arrow-right'
  | 'caret-right'
  | 'caret-down'
  // Settings
  | 'gear'
  | 'gear-six'
  | 'bell'
  | 'bell-ringing'
  | 'lock'
  | 'lock-key'
  // Health
  | 'syringe'
  | 'drop'
  // Gamification
  | 'fire'
  | 'lightning'
  | 'star'
  | 'crown'
  | 'crown-simple'
  | 'medal'
  | 'target'
  | 'sparkle'
  | 'gift'
  | 'confetti'
  | 'game-controller'
  | 'sword'
  | 'flag-banner'
  // Charts
  | 'chart-line'
  | 'chart-line-up'
  // Time
  | 'calendar'
  | 'calendar-blank'
  | 'clock'
  | 'clock-afternoon'
  | 'moon'
  | 'moon-stars'
  | 'sun'
  | 'sun-horizon'
  // Context
  | 'fork-knife'
  | 'cooking-pot'
  | 'bed'
  | 'map-pin'
  // Notes
  | 'note'
  | 'notebook'
  | 'floppy-disk'
  // Status
  | 'check'
  | 'check-circle'
  | 'seal-check'
  | 'x'
  | 'x-circle'
  | 'warning'
  | 'warning-circle'
  | 'info'
  | 'question'
  // Search
  | 'magnifying-glass'
  // Social
  | 'heart'
  | 'hands-clapping'
  | 'thumbs-up'
  | 'chat-circle'
  | 'paper-plane-tilt'
  | 'share'
  // Auth
  | 'sign-out'
  | 'sign-in'
  | 'eye'
  | 'eye-slash'
  | 'envelope'
  | 'at'
  | 'key'
  | 'shield'
  | 'shield-check'
  // Misc
  | 'scroll'
  | 'lightbulb'
  | 'arrow-up'
  | 'arrow-down'
  | 'cloud';

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  style?: PhosphorIconProps['style'];
}

const iconMap: Record<IconName, React.ComponentType<PhosphorIconProps>> = {
  // Navigation
  'home': House,
  'plus': Plus,
  'plus-circle': PlusCircle,
  'trophy': Trophy,
  'users': Users,
  'users-four': UsersFour,
  'user': User,
  'user-circle': UserCircle,
  'user-plus': UserPlus,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'caret-right': CaretRight,
  'caret-down': CaretDown,
  // Settings
  'gear': Gear,
  'gear-six': GearSix,
  'bell': Bell,
  'bell-ringing': BellRinging,
  'lock': Lock,
  'lock-key': LockKey,
  // Health
  'syringe': Syringe,
  'drop': Drop,
  // Gamification
  'fire': Fire,
  'lightning': Lightning,
  'star': Star,
  'crown': Crown,
  'crown-simple': CrownSimple,
  'medal': Medal,
  'target': Target,
  'sparkle': Sparkle,
  'gift': Gift,
  'confetti': Confetti,
  'game-controller': GameController,
  'sword': Sword,
  'flag-banner': FlagBanner,
  // Charts
  'chart-line': ChartLine,
  'chart-line-up': ChartLineUp,
  // Time
  'calendar': Calendar,
  'calendar-blank': CalendarBlank,
  'clock': Clock,
  'clock-afternoon': ClockAfternoon,
  'moon': Moon,
  'moon-stars': MoonStars,
  'sun': Sun,
  'sun-horizon': SunHorizon,
  // Context
  'fork-knife': ForkKnife,
  'cooking-pot': CookingPot,
  'bed': Bed,
  'map-pin': MapPin,
  // Notes
  'note': Note,
  'notebook': Notebook,
  'floppy-disk': FloppyDisk,
  // Status
  'check': Check,
  'check-circle': CheckCircle,
  'seal-check': SealCheck,
  'x': X,
  'x-circle': XCircle,
  'warning': Warning,
  'warning-circle': WarningCircle,
  'info': Info,
  'question': Question,
  // Search
  'magnifying-glass': MagnifyingGlass,
  // Social
  'heart': Heart,
  'hands-clapping': HandsClapping,
  'thumbs-up': ThumbsUp,
  'chat-circle': ChatCircle,
  'paper-plane-tilt': PaperPlaneTilt,
  'share': Share,
  // Auth
  'sign-out': SignOut,
  'sign-in': SignIn,
  'eye': Eye,
  'eye-slash': EyeSlash,
  'envelope': Envelope,
  'at': At,
  'key': Key,
  'shield': Shield,
  'shield-check': ShieldCheck,
  // Misc
  'scroll': Scroll,
  'lightbulb': Lightbulb,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'cloud': Cloud,
};

export function Icon({
  name,
  size = 24,
  color = theme.colors.text.primary.light,
  weight = 'regular',
  style,
}: IconProps) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} color={color} weight={weight} style={style} />;
}

// Preset icon configurations for common use cases
export const IconPresets = {
  // Tab bar icons
  tabHome: (focused: boolean) => ({
    name: 'home' as IconName,
    weight: (focused ? 'fill' : 'regular') as IconWeight,
    color: focused ? theme.colors.primary : theme.colors.text.secondary.light,
  }),
  tabLog: (focused: boolean) => ({
    name: 'plus-circle' as IconName,
    weight: (focused ? 'fill' : 'regular') as IconWeight,
    color: focused ? theme.colors.primary : theme.colors.text.secondary.light,
  }),
  tabTrophy: (focused: boolean) => ({
    name: 'trophy' as IconName,
    weight: (focused ? 'fill' : 'regular') as IconWeight,
    color: focused ? theme.colors.primary : theme.colors.text.secondary.light,
  }),
  tabSocial: (focused: boolean) => ({
    name: 'users' as IconName,
    weight: (focused ? 'fill' : 'regular') as IconWeight,
    color: focused ? theme.colors.primary : theme.colors.text.secondary.light,
  }),
  tabProfile: (focused: boolean) => ({
    name: 'user-circle' as IconName,
    weight: (focused ? 'fill' : 'regular') as IconWeight,
    color: focused ? theme.colors.primary : theme.colors.text.secondary.light,
  }),
  // Common actions
  back: {
    name: 'arrow-left' as IconName,
    color: theme.colors.text.primary.light,
  },
  close: {
    name: 'x' as IconName,
    color: theme.colors.text.primary.light,
  },
  save: {
    name: 'floppy-disk' as IconName,
    color: '#FFFFFF',
  },
  // Status
  success: {
    name: 'check-circle' as IconName,
    color: theme.colors.states.success,
    weight: 'fill' as IconWeight,
  },
  warning: {
    name: 'warning-circle' as IconName,
    color: theme.colors.states.warning,
    weight: 'fill' as IconWeight,
  },
  error: {
    name: 'x-circle' as IconName,
    color: theme.colors.states.error,
    weight: 'fill' as IconWeight,
  },
  // Gamification
  streak: {
    name: 'fire' as IconName,
    color: theme.colors.gamification.streak,
    weight: 'fill' as IconWeight,
  },
  xp: {
    name: 'lightning' as IconName,
    color: theme.colors.gamification.xp,
    weight: 'fill' as IconWeight,
  },
  level: {
    name: 'star' as IconName,
    color: theme.colors.gamification.xp,
    weight: 'fill' as IconWeight,
  },
  achievement: {
    name: 'medal' as IconName,
    color: theme.colors.gamification.achievement,
    weight: 'fill' as IconWeight,
  },
};

export default Icon;
