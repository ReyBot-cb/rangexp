import { AchievementCategory } from '../types/condition.types';

// Triggers that can cause achievement evaluation
export enum AchievementTrigger {
  GLUCOSE_LOGGED = 'GLUCOSE_LOGGED',
  STREAK_UPDATED = 'STREAK_UPDATED',
  LEVEL_UP = 'LEVEL_UP',
  FRIEND_ADDED = 'FRIEND_ADDED',
  STREAK_RECOVERED = 'STREAK_RECOVERED',
  PREMIUM_ACTIVATED = 'PREMIUM_ACTIVATED',
  SHARE_COMPLETED = 'SHARE_COMPLETED',
  ENCOURAGEMENT_SENT = 'ENCOURAGEMENT_SENT',
}

// Map of triggers to achievement categories that should be evaluated
export const TRIGGER_CATEGORIES: Record<AchievementTrigger, AchievementCategory[]> = {
  [AchievementTrigger.GLUCOSE_LOGGED]: [
    'REGISTROS',
    'CONTEXTOS',
    'CONTROL',
    'ESPECIALES',
  ],
  [AchievementTrigger.STREAK_UPDATED]: [
    'RACHAS',
  ],
  [AchievementTrigger.LEVEL_UP]: [
    'NIVELES',
  ],
  [AchievementTrigger.FRIEND_ADDED]: [
    'SOCIAL',
  ],
  [AchievementTrigger.STREAK_RECOVERED]: [
    'ESPECIALES',
  ],
  [AchievementTrigger.PREMIUM_ACTIVATED]: [
    'ESPECIALES',
  ],
  [AchievementTrigger.SHARE_COMPLETED]: [
    'SOCIAL',
  ],
  [AchievementTrigger.ENCOURAGEMENT_SENT]: [
    'SOCIAL',
  ],
};

// Category display names (Spanish)
export const CATEGORY_NAMES: Record<AchievementCategory, string> = {
  REGISTROS: 'Registros',
  RACHAS: 'Rachas',
  NIVELES: 'Niveles',
  SOCIAL: 'Social',
  CONTEXTOS: 'Contextos',
  CONTROL: 'Control Glucémico',
  ESPECIALES: 'Especiales',
};

// Category descriptions (Spanish)
export const CATEGORY_DESCRIPTIONS: Record<AchievementCategory, string> = {
  REGISTROS: 'Logros por registrar glucemias',
  RACHAS: 'Logros por mantener rachas de registro',
  NIVELES: 'Logros por subir de nivel',
  SOCIAL: 'Logros por interactuar con amigos',
  CONTEXTOS: 'Logros por registrar en diferentes contextos',
  CONTROL: 'Logros por mantener buen control glucémico',
  ESPECIALES: 'Logros únicos y eventos especiales',
};

// Category order for display
export const CATEGORY_ORDER: AchievementCategory[] = [
  'REGISTROS',
  'RACHAS',
  'NIVELES',
  'CONTROL',
  'CONTEXTOS',
  'SOCIAL',
  'ESPECIALES',
];
