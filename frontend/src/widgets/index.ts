/**
 * Widget registry for GrandClock Pi.
 */

import type { Widget } from './types';
import { clockAnalogueWidget } from './clock-analogue/config';
import { calendarUpcomingWidget } from './calendar-upcoming/config';
import { statusBarWidget } from './status-bar/config';

export * from './types';

/**
 * Widget registry - all available widgets.
 */
export const widgetRegistry: Record<string, Widget> = {
  'clock-analogue': clockAnalogueWidget,
  'calendar-upcoming': calendarUpcomingWidget,
  'status-bar': statusBarWidget,
};

/**
 * Get a widget by ID.
 */
export function getWidget(widgetId: string): Widget | undefined {
  return widgetRegistry[widgetId];
}

/**
 * List all available widget IDs.
 */
export function getWidgetIds(): string[] {
  return Object.keys(widgetRegistry);
}

/**
 * List all widgets with their metadata.
 */
export function getWidgetList(): Array<{ id: string; name: string; version: string }> {
  return Object.values(widgetRegistry).map((widget) => ({
    id: widget.id,
    name: widget.name,
    version: widget.version,
  }));
}
