import { useMemo } from 'react';
import type { WidgetProps } from '../types';
import styles from './styles.module.css';

/**
 * Format date for display.
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function StatusBar({ theme, data }: WidgetProps) {
  const time = data.time;
  const weather = data.weather;

  const currentDate = useMemo(() => {
    return formatDate(new Date());
  }, []);

  const digitalTime = useMemo(() => {
    if (!time) {
      const now = new Date();
      return now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }
    return time.formatted;
  }, [time]);

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.border,
      }}
    >
      {/* Digital Time */}
      <div className={styles.timeSection}>
        <span
          className={styles.digitalTime}
          style={{
            fontFamily: theme.fonts.mono,
            color: theme.colors.foreground,
          }}
        >
          {digitalTime}
        </span>
        <span
          className={styles.date}
          style={{
            fontFamily: theme.fonts.primary,
            color: theme.colors.foregroundMuted,
          }}
        >
          {currentDate}
        </span>
      </div>

      {/* Weather (if available) */}
      {weather && (
        <div className={styles.weatherSection}>
          <span
            className={styles.temperature}
            style={{
              fontFamily: theme.fonts.display,
              color: theme.colors.accent,
            }}
          >
            {Math.round(weather.temperature)}°
          </span>
          <span
            className={styles.weatherDesc}
            style={{
              color: theme.colors.foregroundMuted,
            }}
          >
            {weather.description}
          </span>
        </div>
      )}

      {/* Status Icons */}
      <div className={styles.statusIcons}>
        <div
          className={styles.statusIcon}
          title="Connected"
          style={{
            backgroundColor: theme.colors.accent,
          }}
        />
      </div>
    </div>
  );
}

export { statusBarWidget } from './config';
