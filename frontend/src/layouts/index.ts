/**
 * Layout registry for GrandClock Pi.
 */

import type { LayoutConfig } from '../widgets/types';
import grandfatherDefault from './grandfather-default.json';
import modernGrid from './modern-grid.json';

/**
 * Layout registry - all available layouts.
 */
export const layouts: Record<string, LayoutConfig> = {
  'grandfather-default': grandfatherDefault as LayoutConfig,
  'modern-grid': modernGrid as LayoutConfig,
};

/**
 * Get a layout by ID, falling back to grandfather-default.
 */
export function getLayout(layoutId: string): LayoutConfig {
  return layouts[layoutId] || layouts['grandfather-default'];
}

/**
 * List all available layout IDs.
 */
export function getLayoutIds(): string[] {
  return Object.keys(layouts);
}

/**
 * List all layouts with their names.
 */
export function getLayoutList(): Array<{ id: string; name: string }> {
  return Object.values(layouts).map((layout) => ({
    id: layout.id,
    name: layout.name,
  }));
}
