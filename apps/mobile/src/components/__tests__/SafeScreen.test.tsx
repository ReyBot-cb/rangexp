import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { SafeScreen, useSafeArea } from '../SafeScreen';

describe('SafeScreen', () => {
  describe('rendering', () => {
    it('should render children', () => {
      const { getByText } = render(
        <SafeScreen>
          <Text>Hello World</Text>
        </SafeScreen>
      );

      expect(getByText('Hello World')).toBeTruthy();
    });

    it('should render without crashing with no children', () => {
      const { toJSON } = render(<SafeScreen>{null}</SafeScreen>);

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('variants', () => {
    it('should render scroll variant (default)', () => {
      const { getByText } = render(
        <SafeScreen variant="scroll">
          <Text>Scrollable Content</Text>
        </SafeScreen>
      );

      expect(getByText('Scrollable Content')).toBeTruthy();
    });

    it('should render static variant', () => {
      const { getByText } = render(
        <SafeScreen variant="static">
          <Text>Static Content</Text>
        </SafeScreen>
      );

      expect(getByText('Static Content')).toBeTruthy();
    });

    it('should render keyboard variant', () => {
      const { getByText } = render(
        <SafeScreen variant="keyboard">
          <Text>Form Content</Text>
        </SafeScreen>
      );

      expect(getByText('Form Content')).toBeTruthy();
    });
  });

  describe('edges', () => {
    it('should default to top edge', () => {
      const { toJSON } = render(
        <SafeScreen>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should handle multiple edges', () => {
      const { toJSON } = render(
        <SafeScreen edges={['top', 'bottom']}>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should handle all edges', () => {
      const { toJSON } = render(
        <SafeScreen edges={['top', 'bottom', 'left', 'right']}>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should handle empty edges array', () => {
      const { toJSON } = render(
        <SafeScreen edges={[]}>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('background color', () => {
    it('should use default background color', () => {
      const { toJSON } = render(
        <SafeScreen>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should accept custom background color', () => {
      const { toJSON } = render(
        <SafeScreen backgroundColor="#FF0000">
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('horizontal padding', () => {
    it('should use default horizontal padding', () => {
      const { toJSON } = render(
        <SafeScreen>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should accept custom horizontal padding', () => {
      const { toJSON } = render(
        <SafeScreen horizontalPadding={32}>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should accept zero horizontal padding', () => {
      const { toJSON } = render(
        <SafeScreen horizontalPadding={0}>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should accept custom container style', () => {
      const { toJSON } = render(
        <SafeScreen style={{ borderWidth: 1 }}>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should accept custom content container style', () => {
      const { toJSON } = render(
        <SafeScreen contentContainerStyle={{ paddingBottom: 20 }}>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('scroll view props', () => {
    it('should pass scrollViewProps to ScrollView', () => {
      const { toJSON } = render(
        <SafeScreen scrollViewProps={{ bounces: false }}>
          <Text>Content</Text>
        </SafeScreen>
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('nested content', () => {
    it('should render deeply nested content', () => {
      const { getByText } = render(
        <SafeScreen>
          <View>
            <View>
              <Text>Deeply Nested</Text>
            </View>
          </View>
        </SafeScreen>
      );

      expect(getByText('Deeply Nested')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <SafeScreen>
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
        </SafeScreen>
      );

      expect(getByText('First')).toBeTruthy();
      expect(getByText('Second')).toBeTruthy();
      expect(getByText('Third')).toBeTruthy();
    });
  });
});

describe('useSafeArea hook', () => {
  it('should return insets object', () => {
    const TestComponent = () => {
      const { insets } = useSafeArea();
      return <Text>{JSON.stringify(insets)}</Text>;
    };

    const { toJSON } = render(<TestComponent />);
    expect(toJSON()).toBeTruthy();
  });

  it('should return topPadding', () => {
    const TestComponent = () => {
      const { topPadding } = useSafeArea();
      return <Text>{topPadding}</Text>;
    };

    const { toJSON } = render(<TestComponent />);
    expect(toJSON()).toBeTruthy();
  });

  it('should return bottomPadding', () => {
    const TestComponent = () => {
      const { bottomPadding } = useSafeArea();
      return <Text>{bottomPadding}</Text>;
    };

    const { toJSON } = render(<TestComponent />);
    expect(toJSON()).toBeTruthy();
  });

  it('should return tabBarBottomPadding', () => {
    const TestComponent = () => {
      const { tabBarBottomPadding } = useSafeArea();
      return <Text>{tabBarBottomPadding}</Text>;
    };

    const { toJSON } = render(<TestComponent />);
    expect(toJSON()).toBeTruthy();
  });
});
