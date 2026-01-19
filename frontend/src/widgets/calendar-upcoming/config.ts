import type { Widget } from '../types';
import { CalendarUpcoming } from './index';

export const calendarUpcomingWidget: Widget = {
  id: 'calendar-upcoming',
  name: 'Upcoming Events',
  version: '1.0.0',
  defaultSize: { w: 6, h: 3 },
  minSize: { w: 4, h: 2 },
  resizable: true,
  dataSubscriptions: ['calendar', 'time'],
  component: CalendarUpcoming,
};
