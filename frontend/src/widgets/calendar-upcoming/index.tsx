import { useMemo } from 'react';
import type { WidgetProps } from '../types';
import styles from './styles.module.css';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  all_day: boolean;
}

/**
 * Format a time string for display.
 */
function formatTime(dateStr: string, allDay: boolean): string {
  if (allDay) return 'All day';

  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time description.
 */
function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 0) return 'Now';
  if (diffMins < 60) return `In ${diffMins}m`;
  if (diffHours < 24) return `In ${diffHours}h`;
  return 'Tomorrow';
}

export function CalendarUpcoming({ theme, data }: WidgetProps) {
  const events = (data.calendar?.events || []) as CalendarEvent[];

  // Mock events for demo
  const displayEvents = useMemo(() => {
    if (events.length > 0) return events;

    // Demo events
    const now = new Date();
    return [
      {
        id: 'demo-1',
        title: 'Team Standup',
        start: new Date(now.getTime() + 30 * 60000).toISOString(),
        end: new Date(now.getTime() + 45 * 60000).toISOString(),
        location: 'Zoom',
        all_day: false,
      },
      {
        id: 'demo-2',
        title: 'Project Review',
        start: new Date(now.getTime() + 120 * 60000).toISOString(),
        end: new Date(now.getTime() + 180 * 60000).toISOString(),
        all_day: false,
      },
      {
        id: 'demo-3',
        title: 'Lunch',
        start: new Date(now.getTime() + 240 * 60000).toISOString(),
        end: new Date(now.getTime() + 300 * 60000).toISOString(),
        location: 'Cafeteria',
        all_day: false,
      },
    ];
  }, [events]);

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: theme.colors.backgroundSecondary,
        borderColor: theme.colors.border,
      }}
    >
      <h3
        className={styles.title}
        style={{
          fontFamily: theme.fonts.display,
          color: theme.colors.foreground,
        }}
      >
        Upcoming
      </h3>

      <div className={styles.eventsList}>
        {displayEvents.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className={styles.event}
            style={{
              borderLeftColor: theme.colors.accent,
            }}
          >
            <div className={styles.eventTime}>
              <span
                className={styles.time}
                style={{
                  fontFamily: theme.fonts.mono,
                  color: theme.colors.accent,
                }}
              >
                {formatTime(event.start, event.all_day)}
              </span>
              <span
                className={styles.relative}
                style={{
                  color: theme.colors.foregroundMuted,
                }}
              >
                {getRelativeTime(event.start)}
              </span>
            </div>
            <div className={styles.eventDetails}>
              <span
                className={styles.eventTitle}
                style={{
                  fontFamily: theme.fonts.primary,
                  color: theme.colors.foreground,
                }}
              >
                {event.title}
              </span>
              {event.location && (
                <span
                  className={styles.eventLocation}
                  style={{
                    color: theme.colors.foregroundMuted,
                  }}
                >
                  {event.location}
                </span>
              )}
            </div>
          </div>
        ))}

        {displayEvents.length === 0 && (
          <div
            className={styles.noEvents}
            style={{
              color: theme.colors.foregroundMuted,
            }}
          >
            No upcoming events
          </div>
        )}
      </div>
    </div>
  );
}

export { calendarUpcomingWidget } from './config';
