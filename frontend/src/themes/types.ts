/**
 * Theme type definitions for GrandClock Pi.
 * All themes must implement this interface.
 */

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  foreground: string;
  foregroundMuted: string;
  accent: string;
  accentSecondary: string;
  border: string;
  shadow: string;
}

export interface ThemeFonts {
  primary: string;
  display: string;
  mono: string;
}

export interface ThemeClockConfig {
  faceBackground: string;
  faceTexture?: string;
  numeralStyle: 'roman' | 'arabic' | 'dots' | 'none';
  handStyle: 'classic' | 'modern' | 'ornate' | 'minimal';
  hourHandColor: string;
  minuteHandColor: string;
  secondHandColor: string;
  showSecondHand: boolean;
  frameStyle: 'grandfather' | 'mantle' | 'wall' | 'minimal' | 'none';
  frameSvg?: string;
}

export interface ThemeDecorations {
  pendulum: boolean;
  pendulumStyle?: string;
  cornerOrnaments: boolean;
  cornerOrnamentsStyle?: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  clock: ThemeClockConfig;
  decorations: ThemeDecorations;
  borderRadius: string;
  spacing: ThemeSpacing;
}
