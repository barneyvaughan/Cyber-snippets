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

- Raspberry Pi 4 with Raspberry Pi OS
- Node.js 18+ and npm
- Python 3.9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/grandclock-pi.git
cd grandclock-pi

# Run the installation script
./scripts/install.sh
```

### Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Production (Kiosk Mode)

```bash
./scripts/kiosk.sh
```

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
