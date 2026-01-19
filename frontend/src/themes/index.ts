import type { Theme } from './types';
import { grandfatherOak } from './grandfather-oak';
import { modernMinimal } from './modern-minimal';
import { artDeco } from './art-deco';

export * from './types';

/**
 * Theme registry - all available themes.
 */
export const themes: Record<string, Theme> = {
  'grandfather-oak': grandfatherOak,
  'modern-minimal': modernMinimal,
  'art-deco': artDeco,
};

/**
 * Get a theme by ID, falling back to grandfather-oak.
 */
export function getTheme(themeId: string): Theme {
  return themes[themeId] || grandfatherOak;
}

/**
 * List all available theme IDs.
 */
export function getThemeIds(): string[] {
  return Object.keys(themes);
}

/**
 * List all themes with their names.
 */
export function getThemeList(): Array<{ id: string; name: string }> {
  return Object.values(themes).map((theme) => ({
    id: theme.id,
    name: theme.name,
  }));
}

export { grandfatherOak, modernMinimal, artDeco };
