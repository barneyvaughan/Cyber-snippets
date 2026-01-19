import { useMemo } from 'react';
import type { WidgetProps } from '../types';
import styles from './styles.module.css';

/**
 * Roman numeral mapping for clock face.
 */
const ROMAN_NUMERALS = [
  'XII',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
];

/**
 * Arabic numeral mapping for clock face.
 */
const ARABIC_NUMERALS = [
  '12',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
];

export function ClockAnalogue({ theme, data }: WidgetProps) {
  const time = data.time;
  const clockConfig = theme.clock;

  // Calculate hand rotations
  const { hourRotation, minuteRotation, secondRotation } = useMemo(() => {
    if (!time) {
      const now = new Date();
      return {
        hourRotation: (now.getHours() % 12) * 30 + now.getMinutes() * 0.5,
        minuteRotation: now.getMinutes() * 6 + now.getSeconds() * 0.1,
        secondRotation: now.getSeconds() * 6,
      };
    }
    return {
      hourRotation: (time.hour % 12) * 30 + time.minute * 0.5,
      minuteRotation: time.minute * 6 + time.second * 0.1,
      secondRotation: time.second * 6,
    };
  }, [time]);

  // Get numerals based on theme
  const numerals = useMemo(() => {
    switch (clockConfig.numeralStyle) {
      case 'roman':
        return ROMAN_NUMERALS;
      case 'arabic':
        return ARABIC_NUMERALS;
      case 'dots':
      case 'none':
        return null;
      default:
        return ROMAN_NUMERALS;
    }
  }, [clockConfig.numeralStyle]);

  return (
    <div className={styles.clockContainer}>
      <div
        className={styles.clockFace}
        style={{
          background: clockConfig.faceBackground,
        }}
      >
        {/* Texture overlay */}
        {clockConfig.faceTexture && (
          <div
            className={styles.texture}
            style={{
              backgroundImage: `url(${clockConfig.faceTexture})`,
            }}
          />
        )}

        {/* Hour markers */}
        <div className={styles.markers}>
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={styles.markerContainer}
              style={{
                transform: `rotate(${i * 30}deg)`,
              }}
            >
              {numerals ? (
                <span
                  className={styles.numeral}
                  style={{
                    transform: `rotate(-${i * 30}deg)`,
                    fontFamily: theme.fonts.display,
                    color: theme.colors.foreground,
                  }}
                >
                  {numerals[i]}
                </span>
              ) : clockConfig.numeralStyle === 'dots' ? (
                <div
                  className={styles.dot}
                  style={{
                    backgroundColor: theme.colors.foreground,
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>

        {/* Minute markers */}
        <div className={styles.minuteMarkers}>
          {Array.from({ length: 60 }, (_, i) => (
            <div
              key={i}
              className={`${styles.minuteMarker} ${i % 5 === 0 ? styles.majorMarker : ''}`}
              style={{
                transform: `rotate(${i * 6}deg)`,
                backgroundColor: theme.colors.foregroundMuted,
              }}
            />
          ))}
        </div>

        {/* Clock hands */}
        <div className={styles.hands}>
          {/* Hour hand */}
          <div
            className={`${styles.hand} ${styles.hourHand} ${styles[clockConfig.handStyle]}`}
            style={{
              transform: `rotate(${hourRotation}deg)`,
              backgroundColor: clockConfig.hourHandColor,
            }}
          />

          {/* Minute hand */}
          <div
            className={`${styles.hand} ${styles.minuteHand} ${styles[clockConfig.handStyle]}`}
            style={{
              transform: `rotate(${minuteRotation}deg)`,
              backgroundColor: clockConfig.minuteHandColor,
            }}
          />

          {/* Second hand */}
          {clockConfig.showSecondHand && (
            <div
              className={`${styles.hand} ${styles.secondHand}`}
              style={{
                transform: `rotate(${secondRotation}deg)`,
                backgroundColor: clockConfig.secondHandColor,
              }}
            />
          )}

          {/* Center cap */}
          <div
            className={styles.centerCap}
            style={{
              backgroundColor: clockConfig.hourHandColor,
            }}
          />
        </div>
      </div>

      {/* Pendulum */}
      {theme.decorations.pendulum && (
        <div className={styles.pendulumContainer}>
          <div
            className={`${styles.pendulum} ${styles[theme.decorations.pendulumStyle || 'brass-disc']}`}
          >
            <div className={styles.pendulumRod} />
            <div
              className={styles.pendulumBob}
              style={{
                backgroundColor: theme.colors.accent,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export { clockAnalogueWidget } from './config';
