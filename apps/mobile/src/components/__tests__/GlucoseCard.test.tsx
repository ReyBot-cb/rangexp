import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GlucoseCard } from '../GlucoseCard';

// Mock the Rex component
jest.mock('../Rex', () => ({
  Rex: () => {
    const { Text } = require('react-native');
    return <Text testID="mocked-rex">MockedRex</Text>;
  },
}));

describe('GlucoseCard', () => {
  const defaultProps = {
    value: 120,
    status: 'normal' as const,
    timestamp: '10:30 AM',
  };

  describe('rendering', () => {
    it('should render glucose value', () => {
      const { getByText } = render(<GlucoseCard {...defaultProps} />);

      expect(getByText('120')).toBeTruthy();
    });

    it('should render timestamp', () => {
      const { getByText } = render(<GlucoseCard {...defaultProps} />);

      expect(getByText('10:30 AM')).toBeTruthy();
    });

    it('should render default unit mg/dL', () => {
      const { getByText } = render(<GlucoseCard {...defaultProps} />);

      expect(getByText('mg/dL')).toBeTruthy();
    });

    it('should render custom unit mmol/L', () => {
      const { getByText } = render(<GlucoseCard {...defaultProps} unit="mmol/L" />);

      expect(getByText('mmol/L')).toBeTruthy();
    });

    it('should render notes when provided', () => {
      const { getByText } = render(
        <GlucoseCard {...defaultProps} notes="After lunch" />
      );

      expect(getByText('After lunch')).toBeTruthy();
    });

    it('should not render notes when not provided', () => {
      const { queryByText } = render(<GlucoseCard {...defaultProps} />);

      // No specific notes text should be present
      expect(queryByText('After lunch')).toBeNull();
    });
  });

  describe('status labels', () => {
    it('should render "En rango" for normal status', () => {
      const { getByText } = render(
        <GlucoseCard {...defaultProps} status="normal" />
      );

      expect(getByText('En rango')).toBeTruthy();
    });

    it('should render "Bajo" for low status', () => {
      const { getByText } = render(
        <GlucoseCard {...defaultProps} value={65} status="low" />
      );

      expect(getByText('Bajo')).toBeTruthy();
    });

    it('should render "Alto" for high status', () => {
      const { getByText } = render(
        <GlucoseCard {...defaultProps} value={200} status="high" />
      );

      expect(getByText('Alto')).toBeTruthy();
    });
  });

  describe('trend indicators', () => {
    it('should render up trend arrow', () => {
      const { getByText } = render(
        <GlucoseCard {...defaultProps} trend="up" />
      );

      expect(getByText('↑')).toBeTruthy();
    });

    it('should render down trend arrow', () => {
      const { getByText } = render(
        <GlucoseCard {...defaultProps} trend="down" />
      );

      expect(getByText('↓')).toBeTruthy();
    });

    it('should render stable trend arrow', () => {
      const { getByText } = render(
        <GlucoseCard {...defaultProps} trend="stable" />
      );

      expect(getByText('→')).toBeTruthy();
    });

    it('should not render trend when not provided', () => {
      const { queryByText } = render(<GlucoseCard {...defaultProps} />);

      expect(queryByText('↑')).toBeNull();
      expect(queryByText('↓')).toBeNull();
      expect(queryByText('→')).toBeNull();
    });
  });

  describe('interactions', () => {
    it('should call onPress when tapped', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <GlucoseCard {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByText('120'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not crash when onPress is not provided', () => {
      const { getByText } = render(<GlucoseCard {...defaultProps} />);

      expect(() => fireEvent.press(getByText('120'))).not.toThrow();
    });
  });

  describe('Rex display', () => {
    it('should not show Rex by default', () => {
      const { queryByTestId } = render(<GlucoseCard {...defaultProps} />);

      expect(queryByTestId('mocked-rex')).toBeNull();
    });

    it('should show Rex when showRex is true', () => {
      const { getByTestId } = render(
        <GlucoseCard {...defaultProps} showRex={true} />
      );

      expect(getByTestId('mocked-rex')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should accept custom style prop', () => {
      const { getByText } = render(
        <GlucoseCard {...defaultProps} style={{ marginTop: 20 }} />
      );

      expect(getByText('120')).toBeTruthy();
    });
  });
});
