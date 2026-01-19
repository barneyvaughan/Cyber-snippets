import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';

interface TimeData {
  timestamp: number;
  formatted: string;
  hour: number;
  minute: number;
  second: number;
}

interface GPIOChangeData {
  pin: number;
  state: boolean;
  name: string;
}

interface ChimeData {
  hour: number;
  enabled: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  time: TimeData | null;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [time, setTime] = useState<TimeData | null>(null);

  useEffect(() => {
    const socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      }
    );

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('time:tick', (data: TimeData) => {
      setTime(data);
    });

    socketInstance.on('gpio:change', (data: GPIOChangeData) => {
      console.log('GPIO change:', data);
    });

    socketInstance.on('chime:trigger', (data: ChimeData) => {
      console.log('Chime triggered:', data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emit = useCallback(
    (event: string, data?: unknown) => {
      if (socket) {
        socket.emit(event, data);
      }
    },
    [socket]
  );

  const on = useCallback(
    (event: string, callback: (data: unknown) => void) => {
      if (socket) {
        socket.on(event, callback);
      }
    },
    [socket]
  );

  const off = useCallback(
    (event: string, callback: (data: unknown) => void) => {
      if (socket) {
        socket.off(event, callback);
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider value={{ socket, connected, time, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function useTime() {
  const { time } = useSocket();
  return time;
}
