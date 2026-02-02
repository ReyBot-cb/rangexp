import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActivityFeedItem } from '../ActivityFeedItem';

describe('ActivityFeedItem', () => {
  const defaultProps = {
    type: 'glucose' as const,
    userId: 'user-1',
    userName: 'John Doe',
    content: 'Recorded a glucose reading of 120 mg/dL',
    timestamp: '2 hours ago',
  };

  describe('rendering', () => {
    it('should render user name', () => {
      const { getByText } = render(<ActivityFeedItem {...defaultProps} />);

      expect(getByText('John Doe')).toBeTruthy();
    });

    it('should render content', () => {
      const { getByText } = render(<ActivityFeedItem {...defaultProps} />);

      expect(getByText('Recorded a glucose reading of 120 mg/dL')).toBeTruthy();
    });

    it('should render timestamp', () => {
      const { getByText } = render(<ActivityFeedItem {...defaultProps} />);

      expect(getByText('2 hours ago')).toBeTruthy();
    });

    it('should render avatar placeholder with first letter when no avatar', () => {
      const { getByText } = render(<ActivityFeedItem {...defaultProps} />);

      expect(getByText('J')).toBeTruthy();
    });

    it('should render heart icon for likes', () => {
      const { getByText } = render(<ActivityFeedItem {...defaultProps} />);

      expect(getByText('❤️')).toBeTruthy();
    });

    it('should render comment icon', () => {
      const { getByText } = render(<ActivityFeedItem {...defaultProps} />);

      expect(getByText('💬')).toBeTruthy();
    });
  });

  describe('activity types', () => {
    it('should render glucose activity type icon', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} type="glucose" />
      );

      expect(getByText('🩸')).toBeTruthy();
    });

    it('should render achievement activity type icon', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} type="achievement" />
      );

      expect(getByText('🏆')).toBeTruthy();
    });

    it('should render streak activity type icon', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} type="streak" />
      );

      expect(getByText('🔥')).toBeTruthy();
    });

    it('should render level activity type icon', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} type="level" />
      );

      expect(getByText('⬆️')).toBeTruthy();
    });

    it('should render friend activity type icon', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} type="friend" />
      );

      expect(getByText('👋')).toBeTruthy();
    });
  });

  describe('likes and comments', () => {
    it('should display likes count when greater than 0', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} likes={5} />
      );

      expect(getByText('5')).toBeTruthy();
    });

    it('should not display likes count when 0', () => {
      const { queryByText } = render(
        <ActivityFeedItem {...defaultProps} likes={0} />
      );

      // '0' should not be rendered for likes
      // But heart emoji should still be present
      expect(queryByText('0')).toBeNull();
    });

    it('should display comments count when greater than 0', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} comments={3} />
      );

      expect(getByText('3')).toBeTruthy();
    });

    it('should not display comments count when 0', () => {
      const { queryAllByText } = render(
        <ActivityFeedItem {...defaultProps} comments={0} />
      );

      // Should not have '0' for comments
      expect(queryAllByText('0').length).toBe(0);
    });
  });

  describe('interactions', () => {
    it('should call onPress when item is tapped', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByText('John Doe'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should call onLike when like button is tapped', () => {
      const onLike = jest.fn();
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} onLike={onLike} />
      );

      fireEvent.press(getByText('❤️'));

      expect(onLike).toHaveBeenCalledTimes(1);
    });

    it('should call onComment when comment button is tapped', () => {
      const onComment = jest.fn();
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} onComment={onComment} />
      );

      fireEvent.press(getByText('💬'));

      expect(onComment).toHaveBeenCalledTimes(1);
    });

    it('should not crash when handlers are not provided', () => {
      const { getByText } = render(<ActivityFeedItem {...defaultProps} />);

      expect(() => fireEvent.press(getByText('❤️'))).not.toThrow();
      expect(() => fireEvent.press(getByText('💬'))).not.toThrow();
    });
  });

  describe('avatar', () => {
    it('should render avatar image when provided', () => {
      const { toJSON } = render(
        <ActivityFeedItem
          {...defaultProps}
          userAvatar="https://example.com/avatar.jpg"
        />
      );

      expect(toJSON()).toBeTruthy();
    });

    it('should render placeholder when avatar not provided', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} userAvatar={undefined} />
      );

      // First letter of name
      expect(getByText('J')).toBeTruthy();
    });

    it('should use first letter of userName for placeholder', () => {
      const { getByText } = render(
        <ActivityFeedItem {...defaultProps} userName="Alice Smith" />
      );

      expect(getByText('A')).toBeTruthy();
    });
  });

  describe('custom styles', () => {
    it('should accept custom style prop', () => {
      const { toJSON } = render(
        <ActivityFeedItem {...defaultProps} style={{ marginTop: 20 }} />
      );

      expect(toJSON()).toBeTruthy();
    });
  });
});
