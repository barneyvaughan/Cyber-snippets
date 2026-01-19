import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';
import { useSocket } from '../context/SocketContext';
import { getLayout } from '../layouts';
import { getWidget, type WidgetData } from '../widgets';
import { WidgetWrapper } from './WidgetWrapper';

/**
 * Main grid component that renders all widgets in a layout.
 */
export function WidgetGrid() {
  const { theme } = useTheme();
  const { config } = useConfig();
  const { time } = useSocket();

  // Get current layout
  const layout = useMemo(() => {
    const layoutId = config?.layout?.active || 'grandfather-default';
    return getLayout(layoutId);
  }, [config?.layout?.active]);

  // Aggregate widget data
  const widgetData: WidgetData = useMemo(
    () => ({
      time: time || undefined,
      calendar: { events: [] },
      weather: undefined,
    }),
    [time]
  );

  // Grid styles
  const gridStyle: React.CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${layout.grid.columns}, 1fr)`,
      gridTemplateRows: `repeat(${layout.grid.rows}, 1fr)`,
      gap: `${layout.grid.gap}px`,
      width: '100%',
      height: '100%',
      padding: `${layout.grid.gap}px`,
    }),
    [layout]
  );

  return (
    <div style={gridStyle}>
      {layout.widgets.map((placement) => {
        const widget = getWidget(placement.widgetId);
        if (!widget) {
          console.warn(`Widget not found: ${placement.widgetId}`);
          return null;
        }

        const Component = widget.component;

        return (
          <WidgetWrapper
            key={`${placement.widgetId}-${placement.x}-${placement.y}`}
            placement={placement}
            gridGap={layout.grid.gap}
          >
            <Component
              theme={theme}
              data={widgetData}
              config={placement.config || {}}
              size={{ w: placement.w, h: placement.h }}
            />
          </WidgetWrapper>
        );
      })}
    </div>
  );
}
