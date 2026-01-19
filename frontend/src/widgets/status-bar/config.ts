import type { Widget } from '../types';
import { StatusBar } from './index';

export const statusBarWidget: Widget = {
  id: 'status-bar',
  name: 'Status Bar',
  version: '1.0.0',
  defaultSize: { w: 6, h: 3 },
  minSize: { w: 4, h: 2 },
  resizable: true,
  dataSubscriptions: ['time', 'weather'],
  component: StatusBar,
};
