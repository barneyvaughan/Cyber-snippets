import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useSocket } from './SocketContext';

interface DisplayConfig {
  width: number;
  height: number;
  rotation: number;
  brightness: number;
  brightness_night: number;
}

interface ClockConfig {
  timezone: string;
  show_seconds: boolean;
}

interface ChimeConfig {
  enabled: boolean;
  sound: string;
  volume: number;
  hours_only: boolean;
}

interface NightModeConfig {
  enabled: boolean;
  auto: boolean;
  start: string;
  end: string;
  dim_display: boolean;
  disable_chime: boolean;
}

interface CalendarConfig {
  enabled: boolean;
  provider: string;
  calendar_ids: string[];
  refresh_interval: number;
  max_events: number;
  lookahead_hours: number;
}

interface WeatherConfig {
  enabled: boolean;
  provider: string;
  api_key: string;
  location: string;
  units: string;
}

interface AppConfig {
  display: DisplayConfig;
  theme: { active: string };
  layout: { active: string };
  clock: ClockConfig;
  chime: ChimeConfig;
  night_mode: NightModeConfig;
  calendar: CalendarConfig;
  weather: WeatherConfig;
}

interface ConfigContextType {
  config: AppConfig | null;
  loading: boolean;
  setConfig: (key: string, value: unknown) => void;
  refreshConfig: () => Promise<void>;
}

const defaultConfig: AppConfig = {
  display: {
    width: 800,
    height: 800,
    rotation: 0,
    brightness: 100,
    brightness_night: 30,
  },
  theme: { active: 'grandfather-oak' },
  layout: { active: 'grandfather-default' },
  clock: { timezone: 'Europe/London', show_seconds: true },
  chime: { enabled: true, sound: 'westminster', volume: 70, hours_only: true },
  night_mode: {
    enabled: false,
    auto: true,
    start: '22:00',
    end: '07:00',
    dim_display: true,
    disable_chime: true,
  },
  calendar: {
    enabled: false,
    provider: 'google',
    calendar_ids: ['primary'],
    refresh_interval: 300,
    max_events: 5,
    lookahead_hours: 24,
  },
  weather: {
    enabled: false,
    provider: 'openweathermap',
    api_key: '',
    location: '',
    units: 'metric',
  },
};

const ConfigContext = createContext<ConfigContextType | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfigState] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const { on, off, emit } = useSocket();

  const refreshConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        setConfigState(data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  useEffect(() => {
    const handleConfigUpdate = (data: { config: Partial<AppConfig> }) => {
      setConfigState((prev) => ({
        ...prev,
        ...data.config,
      }));
    };

    on('config:update', handleConfigUpdate as (data: unknown) => void);

    return () => {
      off('config:update', handleConfigUpdate as (data: unknown) => void);
    };
  }, [on, off]);

  const setConfig = useCallback(
    (key: string, value: unknown) => {
      emit('config:set', { key, value });
    },
    [emit]
  );

  return (
    <ConfigContext.Provider
      value={{ config, loading, setConfig, refreshConfig }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
