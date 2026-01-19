import type { Theme } from './types';

export const modernMinimal: Theme = {
  id: 'modern-minimal',
  name: 'Modern Minimal',
  colors: {
    background: '#0a0a0a',
    backgroundSecondary: '#1a1a1a',
    foreground: '#ffffff',
    foregroundMuted: '#666666',
    accent: '#3b82f6',
    accentSecondary: '#1d4ed8',
    border: '#2a2a2a',
    shadow: 'rgba(0,0,0,0.3)',
  },
  fonts: {
    primary: '"Inter", sans-serif',
    display: '"Space Grotesk", sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  clock: {
    faceBackground: '#0a0a0a',
    numeralStyle: 'dots',
    handStyle: 'minimal',
    hourHandColor: '#ffffff',
    minuteHandColor: '#ffffff',
    secondHandColor: '#3b82f6',
    showSecondHand: true,
    frameStyle: 'minimal',
  },
  decorations: {
    pendulum: false,
    cornerOrnaments: false,
  },
  borderRadius: '12px',
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
};
