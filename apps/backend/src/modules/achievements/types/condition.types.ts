// Condition types for achievement evaluation

export type ConditionType =
  | 'count'           // Count entities (readings, friends)
  | 'user_attribute'  // User attribute (streak, level)
  | 'time_window'     // Count in time window
  | 'in_range'        // Readings in glucose range
  | 'percentage'      // Percentage (TIR)
  | 'date'            // Date-based
  | 'event'           // Specific event
  | 'consecutive';    // Consecutive days with condition

export type ComparisonOperator = 'eq' | 'gte' | 'gt' | 'lte' | 'lt';

export type CountEntity = 'glucose_readings' | 'friends' | 'shares' | 'encouragements';

export type UserAttribute = 'streak' | 'level' | 'xp' | 'isPremium';

export type TimeWindow = 'day' | 'week' | 'month' | 'year' | 'all';

export type GlucoseContext = 'FASTING' | 'BEFORE_MEAL' | 'AFTER_MEAL' | 'BEDTIME' | 'OTHER';

export type DateCheck = 'month_day' | 'before' | 'user_number';

// Base condition interface
interface BaseCondition {
  type: ConditionType;
}

// Count condition: count entities meeting criteria
export interface CountCondition extends BaseCondition {
  type: 'count';
  entity: CountEntity;
  operator: ComparisonOperator;
  value: number;
  context?: GlucoseContext;  // Optional filter for glucose readings
  inRange?: boolean;         // Optional filter for in-range readings
}

// User attribute condition: check user property
export interface UserAttributeCondition extends BaseCondition {
  type: 'user_attribute';
  attribute: UserAttribute;
  operator: ComparisonOperator;
  value: number | boolean;
}

// Time window condition: count entities in time window
export interface TimeWindowCondition extends BaseCondition {
  type: 'time_window';
  entity: CountEntity;
  window: TimeWindow;
  operator: ComparisonOperator;
  value: number;
  context?: GlucoseContext;
  uniqueContexts?: boolean;  // For checking unique contexts in a day
}

// In-range condition: consecutive or all readings in range
export interface InRangeCondition extends BaseCondition {
  type: 'in_range';
  consecutive?: number;      // Number of consecutive readings
  allInDay?: boolean;        // All readings in a day must be in range
  perfectDays?: number;      // Number of perfect days
  minReadingsPerDay?: number; // Minimum readings for a valid day
}

// Percentage condition: percentage-based metrics (TIR)
export interface PercentageCondition extends BaseCondition {
  type: 'percentage';
  metric: 'time_in_range';
  window: TimeWindow;
  operator: ComparisonOperator;
  value: number;             // Percentage value (0-100)
  minSamples?: number;       // Minimum samples required
}

// Date condition: date-based achievements
export interface DateCondition extends BaseCondition {
  type: 'date';
  check: DateCheck;
  value: string | number;    // "11-14" for month_day, date string for before, number for user_number
}

// Event condition: triggered by specific events
export interface EventCondition extends BaseCondition {
  type: 'event';
  eventName: string;
  requiresData?: Record<string, unknown>;
}

// Consecutive condition: days with specific activity
export interface ConsecutiveCondition extends BaseCondition {
  type: 'consecutive';
  days: number;
  requireContext?: GlucoseContext;
  requireInRange?: boolean;
}

// Union type for all conditions
export type AchievementCondition =
  | CountCondition
  | UserAttributeCondition
  | TimeWindowCondition
  | InRangeCondition
  | PercentageCondition
  | DateCondition
  | EventCondition
  | ConsecutiveCondition;

// Evaluation result
export interface ConditionEvaluationResult {
  met: boolean;
  progress?: number;
  target?: number;
  progressPercentage?: number;
}

// Achievement tier
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// Achievement category
export type AchievementCategory =
  | 'REGISTROS'
  | 'RACHAS'
  | 'NIVELES'
  | 'SOCIAL'
  | 'CONTEXTOS'
  | 'CONTROL'
  | 'ESPECIALES';

// Full achievement definition for seeds
export interface AchievementDefinition {
  code: string;
  name: string;
  description: string;
  xpReward: number;
  tier: AchievementTier;
  category: AchievementCategory;
  condition: AchievementCondition;
}
