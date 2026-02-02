import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AchievementBadge } from '../AchievementBadge';

describe('AchievementBadge', () => {
  const defaultProps = {
    icon: '🏆',
    name: 'First Achievement',
    rarity: 'common' as const,
    unlocked: true,
  };

  describe('rendering', () => {
    it('should render achievement name', () => {
      const { getByText } = render(<AchievementBadge {...defaultProps} />);

      expect(getByText('First Achievement')).toBeTruthy();
    });

    it('should render icon when unlocked', () => {
      const { getByText } = render(<AchievementBadge {...defaultProps} />);

      expect(getByText('🏆')).toBeTruthy();
    });

    it('should render lock icon when locked', () => {
      const { getByText } = render(
        <AchievementBadge {...defaultProps} unlocked={false} />
      );

      expect(getByText('🔒')).toBeTruthy();
    });

    it('should render description when provided and unlocked', () => {
      const { getByText } = render(
        <AchievementBadge {...defaultProps} description="Complete your first task" />
      );

      expect(getByText('Complete your first task')).toBeTruthy();
    });

    it('should not render description when locked', () => {
      const { queryByText } = render(
        <AchievementBadge
          {...defaultProps}
          unlocked={false}
          description="Complete your first task"
        />
      );

      expect(queryByText('Complete your first task')).toBeNull();
    });
  });

  describe('rarity labels', () => {
    it('should render "Común" for common rarity', () => {
      const { getByText } = render(
        <AchievementBadge {...defaultProps} rarity="common" />
      );

      expect(getByText('Común')).toBeTruthy();
    });

    it('should render "Raro" for rare rarity', () => {
      const { getByText } = render(
        <AchievementBadge {...defaultProps} rarity="rare" />
      );

      expect(getByText('Raro')).toBeTruthy();
    });

    it('should render "Épico" for epic rarity', () => {
      const { getByText } = render(
        <AchievementBadge {...defaultProps} rarity="epic" />
      );

      expect(getByText('Épico')).toBeTruthy();
    });

    it('should render "Legendario" for legendary rarity', () => {
      const { getByText } = render(
        <AchievementBadge {...defaultProps} rarity="legendary" />
      );

      expect(getByText('Legendario')).toBeTruthy();
    });
  });

  describe('sizes', () => {
    it('should render small size', () => {
      const { toJSON } = render(
        <AchievementBadge {...defaultProps} size="small" />
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render medium size (default)', () => {
      const { toJSON } = render(
        <AchievementBadge {...defaultProps} size="medium" />
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render large size', () => {
      const { toJSON } = render(
        <AchievementBadge {...defaultProps} size="large" />
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('progress indicator', () => {
    it('should show progress when locked and progress provided', () => {
      const { getByText } = render(
        <AchievementBadge {...defaultProps} unlocked={false} progress={75} />
      );

      expect(getByText('75%')).toBeTruthy();
    });

    it('should not show progress when unlocked', () => {
      const { queryByText } = render(
        <AchievementBadge {...defaultProps} unlocked={true} progress={75} />
      );

      expect(queryByText('75%')).toBeNull();
    });

    it('should not show progress when not provided', () => {
      const { queryByText } = render(
        <AchievementBadge {...defaultProps} unlocked={false} />
      );

      // No percentage should be shown
      expect(queryByText('%')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onPress when unlocked and tapped', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <AchievementBadge {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByText('🏆'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when locked', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <AchievementBadge {...defaultProps} unlocked={false} onPress={onPress} />
      );

      fireEvent.press(getByText('🔒'));

      // Disabled should prevent the call
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('animations', () => {
    it('should render with showAnimation prop', () => {
      const { toJSON } = render(
        <AchievementBadge {...defaultProps} showAnimation={true} />
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render without animation', () => {
      const { toJSON } = render(
        <AchievementBadge {...defaultProps} showAnimation={false} />
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should accept custom style prop', () => {
      const { toJSON } = render(
        <AchievementBadge {...defaultProps} style={{ marginTop: 20 }} />
      );

      expect(toJSON()).toBeTruthy();
    });
  });
});
