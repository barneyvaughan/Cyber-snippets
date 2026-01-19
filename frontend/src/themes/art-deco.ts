import type { Theme } from './types';

export const artDeco: Theme = {
  id: 'art-deco',
  name: 'Art Deco',
  colors: {
    background: '#0d1117',
    backgroundSecondary: '#161b22',
    foreground: '#d4af37',
    foregroundMuted: '#8b7355',
    accent: '#d4af37',
    accentSecondary: '#b8860b',
    border: '#2d333b',
    shadow: 'rgba(0,0,0,0.4)',
  },
  fonts: {
    primary: '"Libre Baskerville", serif',
    display: '"Cinzel", serif',
    mono: '"JetBrains Mono", monospace',
  },
  clock: {
    faceBackground:
      'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f1a 100%)',
    numeralStyle: 'arabic',
    handStyle: 'classic',
    hourHandColor: '#d4af37',
    minuteHandColor: '#d4af37',
    secondHandColor: '#b8860b',
    showSecondHand: true,
    frameStyle: 'wall',
  },
  decorations: {
    pendulum: false,
    cornerOrnaments: true,
    cornerOrnamentsStyle: 'art-deco-fan',
  },
  borderRadius: '0px',
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
};
