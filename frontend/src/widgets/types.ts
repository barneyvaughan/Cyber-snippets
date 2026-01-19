/**
 * Widget system type definitions for GrandClock Pi.
 */

import type { FC } from 'react';
import type { Theme } from '../themes/types';

/**
 * Size specification for widgets.
 */
export interface WidgetSize {
  w: number; // Grid columns
  h: number; // Grid rows
}

/**
 * Data passed to widget components.
 */
export interface WidgetData {
  time?: {
    timestamp: number;
    formatted: string;
    hour: number;
    minute: number;
    second: number;
  };
  calendar?: {
    events: Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      location?: string;
      all_day: boolean;
    }>;
  };
  weather?: {
    temperature: number;
    feels_like: number;
    humidity: number;
    description: string;
    icon: string;
    wind_speed: number;
    location: string;
  };
  [key: string]: unknown;
}

/**
 * Props passed to widget components.
 */
export interface WidgetProps {
  theme: Theme;
  data: WidgetData;
  config: Record<string, unknown>;
  size: WidgetSize;
}

/**
 * Widget definition interface.
 * All widgets must implement this interface.
 */
export interface Widget {
  // Metadata
  id: string;
  name: string;
  version: string;

  // Layout
  defaultSize: WidgetSize;
  minSize?: WidgetSize;
  resizable: boolean;

  // Data requirements
  dataSubscriptions: string[];

  // Component
  component: FC<WidgetProps>;
}

/**
 * Widget placement in a layout.
 */
export interface WidgetPlacement {
  widgetId: string;
  x: number; // Grid column start
  y: number; // Grid row start
  w: number; // Grid columns span
  h: number; // Grid rows span
  config?: Record<string, unknown>;
}

/**
 * Layout configuration.
 */
export interface LayoutConfig {
  id: string;
  name: string;
  grid: {
    columns: number;
    rows: number;
    gap: number;
  };
  widgets: WidgetPlacement[];
}
