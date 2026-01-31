import { useContext } from 'react';
import { ThemeContext } from 'react-native';
import { Theme } from './index';

export function useTheme(): Theme {
  return useContext(ThemeContext) as Theme;
}
