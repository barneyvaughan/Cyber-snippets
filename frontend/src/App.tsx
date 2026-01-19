import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { ConfigProvider } from './context/ConfigContext';
import { WidgetGrid } from './components/WidgetGrid';

function App() {
  return (
    <SocketProvider>
      <ConfigProvider>
        <ThemeProvider>
          <div className="clock-container">
            <div className="clock-viewport">
              <WidgetGrid />
            </div>
          </div>
        </ThemeProvider>
      </ConfigProvider>
    </SocketProvider>
  );
}

export default App;
