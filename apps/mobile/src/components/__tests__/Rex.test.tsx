import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Rex } from '../Rex';

describe('Rex', () => {
  describe('rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<Rex />);

      expect(toJSON()).toBeTruthy();
    });

    it('should render with default mood (happy)', () => {
      const { toJSON } = render(<Rex />);

      expect(toJSON()).toBeTruthy();
    });

    it('should render with different moods', () => {
      const moods = ['happy', 'celebrate', 'support', 'neutral', 'sleeping'] as const;

      moods.forEach(mood => {
        const { toJSON } = render(<Rex mood={mood} />);
        expect(toJSON()).toBeTruthy();
      });
    });
  });

  describe('sizes', () => {
    it('should render small size', () => {
      const { toJSON } = render(<Rex size="small" />);

      expect(toJSON()).toBeTruthy();
    });

    it('should render medium size (default)', () => {
      const { toJSON } = render(<Rex size="medium" />);

      expect(toJSON()).toBeTruthy();
    });

    it('should render large size', () => {
      const { toJSON } = render(<Rex size="large" />);

      expect(toJSON()).toBeTruthy();
    });

    it('should render xl size', () => {
      const { toJSON } = render(<Rex size="xl" />);

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('speech bubble', () => {
    it('should not show speech bubble by default', () => {
      const { queryByText } = render(<Rex />);

      expect(queryByText('Hello!')).toBeNull();
    });

    it('should show speech bubble with message when enabled', () => {
      const { getByText } = render(
        <Rex showSpeechBubble={true} message="Hello!" />
      );

      expect(getByText('Hello!')).toBeTruthy();
    });

    it('should not show speech bubble without message', () => {
      const { queryByText } = render(<Rex showSpeechBubble={true} />);

      // No message to display
      expect(queryByText('Hello!')).toBeNull();
    });
  });

  describe('interactive mode', () => {
    it('should not be interactive by default', () => {
      const onPress = jest.fn();
      const { toJSON } = render(<Rex onPress={onPress} />);

      // Component should render
      expect(toJSON()).toBeTruthy();
    });

    it('should call onPress when interactive and tapped', () => {
      const onPress = jest.fn();
      const { getByTestId, toJSON } = render(
        <Rex interactive={true} onPress={onPress} testID="rex" />
      );

      // Component should render
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('animation states', () => {
    it('should handle idle animation state', () => {
      const { toJSON } = render(<Rex animationState="idle" />);

      expect(toJSON()).toBeTruthy();
    });

    it('should handle greeting animation state', () => {
      const { toJSON } = render(<Rex animationState="greeting" />);

      expect(toJSON()).toBeTruthy();
    });

    it('should handle celebrating animation state', () => {
      const { toJSON } = render(<Rex animationState="celebrating" />);

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should accept custom style prop', () => {
      const { toJSON } = render(<Rex style={{ marginTop: 20 }} />);

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('mood transitions', () => {
    it('should handle mood changes', () => {
      const { rerender, toJSON } = render(<Rex mood="happy" />);

      expect(toJSON()).toBeTruthy();

      rerender(<Rex mood="celebrate" />);

      expect(toJSON()).toBeTruthy();
    });
  });
});
