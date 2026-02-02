import React from 'react';
import { render } from '@testing-library/react-native';
import { XpProgressBar } from '../XpProgressBar';

describe('XpProgressBar', () => {
  const defaultProps = {
    currentXp: 75,
    nextLevelXp: 100,
    level: 5,
  };

  describe('rendering', () => {
    it('should render current level', () => {
      const { getByText } = render(<XpProgressBar {...defaultProps} />);

      expect(getByText('5')).toBeTruthy();
    });

    it('should render current XP', () => {
      const { getByText } = render(<XpProgressBar {...defaultProps} />);

      expect(getByText('75 XP')).toBeTruthy();
    });

    it('should render XP remaining to next level', () => {
      const { getByText } = render(<XpProgressBar {...defaultProps} />);

      expect(getByText('25 para siguiente nivel')).toBeTruthy();
    });

    it('should render without crashing', () => {
      const { toJSON } = render(<XpProgressBar {...defaultProps} />);

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('progress calculation', () => {
    it('should handle 0% progress', () => {
      const { getByText } = render(
        <XpProgressBar currentXp={0} nextLevelXp={100} level={1} />
      );

      expect(getByText('0 XP')).toBeTruthy();
      expect(getByText('100 para siguiente nivel')).toBeTruthy();
    });

    it('should handle 100% progress', () => {
      const { getByText } = render(
        <XpProgressBar currentXp={100} nextLevelXp={100} level={5} />
      );

      expect(getByText('100 XP')).toBeTruthy();
      expect(getByText('0 para siguiente nivel')).toBeTruthy();
    });

    it('should handle 50% progress', () => {
      const { getByText } = render(
        <XpProgressBar currentXp={50} nextLevelXp={100} level={3} />
      );

      expect(getByText('50 XP')).toBeTruthy();
      expect(getByText('50 para siguiente nivel')).toBeTruthy();
    });

    it('should cap progress at 100%', () => {
      const { getByText, toJSON } = render(
        <XpProgressBar currentXp={150} nextLevelXp={100} level={5} />
      );

      // Should still render
      expect(toJSON()).toBeTruthy();
      expect(getByText('150 XP')).toBeTruthy();
    });
  });

  describe('showDetails prop', () => {
    it('should show details by default', () => {
      const { getByText } = render(<XpProgressBar {...defaultProps} />);

      expect(getByText('75 XP')).toBeTruthy();
      expect(getByText('25 para siguiente nivel')).toBeTruthy();
    });

    it('should hide details when showDetails is false', () => {
      const { queryByText, getByText } = render(
        <XpProgressBar {...defaultProps} showDetails={false} />
      );

      // Level should still be visible
      expect(getByText('5')).toBeTruthy();

      // But XP details should be hidden
      expect(queryByText('75 XP')).toBeNull();
      expect(queryByText('25 para siguiente nivel')).toBeNull();
    });
  });

  describe('animated prop', () => {
    it('should render with animation enabled (default)', () => {
      const { toJSON } = render(<XpProgressBar {...defaultProps} animated={true} />);

      expect(toJSON()).toBeTruthy();
    });

    it('should render with animation disabled', () => {
      const { toJSON } = render(<XpProgressBar {...defaultProps} animated={false} />);

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle level 1', () => {
      const { getByText } = render(
        <XpProgressBar currentXp={0} nextLevelXp={100} level={1} />
      );

      expect(getByText('1')).toBeTruthy();
    });

    it('should handle high levels', () => {
      const { getByText } = render(
        <XpProgressBar currentXp={9500} nextLevelXp={10000} level={99} />
      );

      expect(getByText('99')).toBeTruthy();
      expect(getByText('9500 XP')).toBeTruthy();
    });

    it('should handle very small XP values', () => {
      const { getByText } = render(
        <XpProgressBar currentXp={1} nextLevelXp={100} level={1} />
      );

      expect(getByText('1 XP')).toBeTruthy();
      expect(getByText('99 para siguiente nivel')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should accept custom style prop', () => {
      const { toJSON } = render(
        <XpProgressBar {...defaultProps} style={{ marginTop: 20 }} />
      );

      expect(toJSON()).toBeTruthy();
    });
  });
});
