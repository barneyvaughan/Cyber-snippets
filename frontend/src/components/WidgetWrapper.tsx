import type { ReactNode } from 'react';
import type { WidgetPlacement } from '../widgets/types';

interface WidgetWrapperProps {
  placement: WidgetPlacement;
  gridGap: number;
  children: ReactNode;
}

/**
 * Wrapper component that positions a widget in the grid.
 */
export function WidgetWrapper({
  placement,
  children,
}: WidgetWrapperProps) {
  const style: React.CSSProperties = {
    gridColumn: `${placement.x + 1} / span ${placement.w}`,
    gridRow: `${placement.y + 1} / span ${placement.h}`,
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
  };

  return <div style={style}>{children}</div>;
}
