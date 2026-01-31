import { Theme, theme } from './index';

declare global {
  namespace NativeWind {
    namespace Theme {
      interface ThemeColors extends Record<string, string> {
        // Add custom colors here if needed
      }
    }
  }
}

export { theme };
export type { Theme };
export default theme;
