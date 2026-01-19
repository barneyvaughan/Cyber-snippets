import type { Theme } from './types';

export const grandfatherOak: Theme = {
  id: 'grandfather-oak',
  name: 'Grandfather Oak',
  colors: {
    background: '#1a1612',
    backgroundSecondary: '#2d251f',
    foreground: '#e8dcc8',
    foregroundMuted: '#9a8b7a',
    accent: '#c9a456',
    accentSecondary: '#8b6914',
    border: '#3d3328',
    shadow: 'rgba(0,0,0,0.5)',
  },
  fonts: {
    primary: '"Libre Baskerville", serif',
    display: '"Cinzel", serif',
    mono: '"JetBrains Mono", monospace',
  },
  clock: {
    faceBackground:
      'radial-gradient(circle, #f5f0e6 0%, #e8dcc8 70%, #d4c4a8 100%)',
    faceTexture: '/textures/paper-grain.png',
    numeralStyle: 'roman',
    handStyle: 'ornate',
    hourHandColor: '#1a1612',
    minuteHandColor: '#1a1612',
    secondHandColor: '#8b6914',
    showSecondHand: true,
    frameStyle: 'grandfather',
    frameSvg: '/frames/grandfather-ornate.svg',
  },
  decorations: {
    pendulum: true,
    pendulumStyle: 'brass-disc',
    cornerOrnaments: true,
    cornerOrnamentsStyle: 'victorian-flourish',
  },
  borderRadius: '4px',
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
};
