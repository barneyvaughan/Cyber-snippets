import type { Widget } from '../types';
import { ClockAnalogue } from './index';

export const clockAnalogueWidget: Widget = {
  id: 'clock-analogue',
  name: 'Analogue Clock',
  version: '1.0.0',
  defaultSize: { w: 10, h: 9 },
  minSize: { w: 4, h: 4 },
  resizable: true,
  dataSubscriptions: ['time'],
  component: ClockAnalogue,
};
