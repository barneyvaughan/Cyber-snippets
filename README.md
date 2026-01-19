# GrandClock Pi

A 30cm × 30cm touchscreen clock interface running on Raspberry Pi, combining grandfather clock aesthetics with modern functionality. Built with a modular widget architecture and skinnable theming system.

## Features

- **Analogue Clock** - Beautiful grandfather clock aesthetic with customizable hands and numerals
- **Widget Architecture** - Extensible widget system for adding new functionality
- **Skinnable Themes** - Swap entire visual styles with comprehensive theming
- **GPIO Integration** - Physical button controls for chime, night mode, and theme switching
- **Google Calendar** - Upcoming events display
- **Chime System** - Westminster chimes with automatic night mode

## Hardware Requirements

| Component | Specification | Est. Cost |
|-----------|---------------|-----------|
| Display | 10.1" IPS 1280×800 or 1024×768 | £70-100 |
| Pi | Raspberry Pi 4 (2GB sufficient) | £35-50 |
| Switches | 3× momentary push buttons (GPIO) | £5 |
| Speaker | 3W USB or GPIO PWM speaker for chimes | £10-15 |
| Frame | Custom 3D printed / wood bezel | DIY |

## Quick Start

### Prerequisites

- Raspberry Pi 4 with Raspberry Pi OS (64-bit recommended)
- Node.js 18+ and npm
- Python 3.9+

### Installation on Raspberry Pi

```bash
# Clone the repository
git clone https://github.com/your-username/grandclock-pi.git
cd grandclock-pi

# Run the installation script
chmod +x scripts/install.sh
./scripts/install.sh
```

---

## Running & Accessing from Another Device

The Pi runs the server; any device on the same network can view the clock in a browser.

### Option 1: Development Mode (with Hot Reload)

**On the Raspberry Pi:**

```bash
cd ~/grandclock

# Terminal 1: Start the backend
cd backend
source venv/bin/activate
python app.py

# Terminal 2: Start the frontend (expose to network)
cd frontend
npm run dev -- --host 0.0.0.0
```

**On your laptop/phone browser:**

1. Find your Pi's IP: `hostname -I` (on the Pi)
2. Navigate to `http://<pi-ip>:5173`

Example: `http://192.168.1.42:5173`

### Option 2: Docker (Production)

```bash
cd ~/grandclock
docker-compose up -d
```

Access at `http://<pi-ip>:3000`

---

## Remote Development via SSH

You can SSH into the Pi, edit code, and see changes instantly in your laptop's browser. Vite's Hot Module Replacement (HMR) updates the UI in real-time without refreshing.

### Workflow

```
┌─────────────────┐         SSH          ┌─────────────────┐
│     Laptop      │ ───────────────────▶ │  Raspberry Pi   │
│                 │                      │                 │
│  Browser at     │ ◀─── WebSocket ───── │  Vite Dev       │
│  Pi-IP:5173     │      (HMR)           │  Server         │
│                 │                      │                 │
│  Code Editor    │ ───── SSH/SFTP ────▶ │  Project Files  │
│  (VS Code, vim) │                      │                 │
└─────────────────┘                      └─────────────────┘
```

### Setup with VS Code Remote SSH

1. Install the "Remote - SSH" extension in VS Code
2. Connect to Pi: `Ctrl+Shift+P` → "Remote-SSH: Connect to Host"
3. Enter `pi@<pi-ip>` (e.g., `pi@192.168.1.42`)
4. Open the project folder `/home/pi/grandclock`
5. Edit files directly - changes appear instantly in your browser!

### Setup with Terminal SSH

```bash
# From your laptop
ssh pi@192.168.1.42

# On the Pi, start the servers (use tmux or screen for persistence)
tmux new -s grandclock

# Start backend in one pane
cd ~/grandclock/backend
source venv/bin/activate
python app.py

# Split pane (Ctrl+B, %) and start frontend
cd ~/grandclock/frontend
npm run dev -- --host 0.0.0.0

# Detach with Ctrl+B, D (servers keep running)
# Reattach later with: tmux attach -t grandclock
```

Now edit files via SSH and watch your browser update live!

### What Updates in Real-Time?

| Change | Hot Reload? |
|--------|-------------|
| React components (widgets) | ✅ Instant |
| CSS/styles | ✅ Instant |
| Theme files | ✅ Instant |
| Layout JSON | ✅ Instant |
| TypeScript types | ✅ Instant |
| Backend Python | ❌ Restart required |
| config.yaml | ❌ Restart required |

---

## Auto-Start on Boot

### Using systemd (Recommended)

```bash
# Create the service file
sudo tee /etc/systemd/system/grandclock.service << 'EOF'
[Unit]
Description=GrandClock Pi
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/grandclock
ExecStart=/usr/bin/docker-compose up
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable grandclock
sudo systemctl start grandclock

# Check status
sudo systemctl status grandclock
```

### Without Docker (Development Mode Auto-Start)

```bash
sudo tee /etc/systemd/system/grandclock.service << 'EOF'
[Unit]
Description=GrandClock Pi
After=network.target

[Service]
Type=forking
User=pi
WorkingDirectory=/home/pi/grandclock
ExecStart=/home/pi/grandclock/scripts/start-dev.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

Create the start script:

```bash
cat > ~/grandclock/scripts/start-dev.sh << 'EOF'
#!/bin/bash
cd /home/pi/grandclock

# Start backend
cd backend
source venv/bin/activate
python app.py &

# Start frontend
cd ../frontend
npm run dev -- --host 0.0.0.0 &
EOF

chmod +x ~/grandclock/scripts/start-dev.sh
```

---

## Kiosk Mode (Fullscreen on Pi Display)

To run fullscreen on the Pi's own touchscreen:

```bash
./scripts/kiosk.sh
```

This launches Chromium in kiosk mode pointing to the local server.

### Auto-Start Kiosk on Boot

Add to `/etc/xdg/lxsession/LXDE-pi/autostart`:

```
@/home/pi/grandclock/scripts/kiosk.sh
```

---

## Network Requirements

- Pi and viewing device must be on the same local network
- Required ports:
  - `5173` - Vite dev server (development)
  - `3000` - Nginx (Docker/production)
  - `5000` - Flask backend API

### Firewall (if enabled)

```bash
sudo ufw allow 5173/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp
```

---

## Troubleshooting

### Can't connect from laptop

1. Check Pi's IP: `hostname -I`
2. Verify servers are running: `curl http://localhost:5173`
3. Check firewall: `sudo ufw status`
4. Ensure `--host 0.0.0.0` flag is used with Vite

### HMR not working

1. Check WebSocket connection in browser dev tools
2. Ensure port 5173 is accessible
3. Try disabling browser extensions

### GPIO not working

1. Ensure running as user with GPIO access: `groups` (should show `gpio`)
2. Check if running on actual Pi vs development machine
3. Backend falls back to mock GPIO on non-Pi systems

## Project Structure

```
/grandclock/
├── backend/                  # Flask + WebSocket server
│   ├── app.py               # Main application
│   ├── config.py            # Configuration loader
│   ├── gpio_handler.py      # GPIO abstraction
│   ├── services/            # Business logic services
│   └── config.yaml          # Application configuration
│
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── widgets/         # Widget components
│   │   ├── themes/          # Theme definitions
│   │   ├── layouts/         # Layout configurations
│   │   └── context/         # React contexts
│   └── public/              # Static assets
│
├── scripts/                  # Utility scripts
├── assets/                   # Source assets
└── docker-compose.yml        # Optional containerization
```

## Configuration

Edit `backend/config.yaml` to customize:

- Display settings
- Active theme and layout
- Chime behavior
- Night mode schedule
- Calendar integration
- Weather settings

## GPIO Wiring

```
Raspberry Pi GPIO
─────────────────
GPIO 17 (Pin 11) ─── Chime Toggle Button ─── GND
GPIO 27 (Pin 13) ─── Night Mode Button  ─── GND
GPIO 22 (Pin 15) ─── Theme Cycle Button ─── GND
GPIO 23 (Pin 16) ─── 330Ω ─── Chime LED (+) ─── GND
GPIO 24 (Pin 18) ─── 330Ω ─── Night LED (+) ─── GND
```

## Creating Custom Themes

See `frontend/src/themes/types.ts` for the full theme interface. Create a new theme file in `frontend/src/themes/` and register it in `frontend/src/themes/index.ts`.

## Creating Custom Widgets

1. Create a new folder in `frontend/src/widgets/`
2. Implement the Widget interface from `frontend/src/widgets/types.ts`
3. Register in `frontend/src/widgets/index.ts`

## License

MIT

## Acknowledgments

- [gpiozero](https://gpiozero.readthedocs.io/) - GPIO library
- [Flask-SocketIO](https://flask-socketio.readthedocs.io/) - WebSocket support
- [CSS Clock Tutorial](https://cssanimation.rocks/clocks/) - Inspiration for clock hands
