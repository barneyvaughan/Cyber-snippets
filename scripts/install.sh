#!/bin/bash

# GrandClock Pi Installation Script
# Run this on a fresh Raspberry Pi OS installation

set -e

echo "================================"
echo "  GrandClock Pi Installation"
echo "================================"

# Update system
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install system dependencies
echo "Installing system dependencies..."
sudo apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    chromium-browser \
    unclutter \
    xdotool \
    libsdl2-mixer-2.0-0 \
    libsdl2-2.0-0

# Install Node.js 20 (if not already installed)
if ! node --version | grep -q "v20"; then
    echo "Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Set up Python virtual environment and install backend dependencies
echo "Setting up Python backend..."
cd "$PROJECT_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Install frontend dependencies and build
echo "Setting up React frontend..."
cd "$PROJECT_DIR/frontend"
npm ci
npm run build

# Create systemd service for backend
echo "Creating systemd services..."
sudo tee /etc/systemd/system/grandclock-backend.service > /dev/null << EOF
[Unit]
Description=GrandClock Pi Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=$PROJECT_DIR/backend/venv/bin/python app.py
Restart=always
RestartSec=5
Environment=FLASK_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for frontend (serves via Python http.server)
sudo tee /etc/systemd/system/grandclock-frontend.service > /dev/null << EOF
[Unit]
Description=GrandClock Pi Frontend
After=network.target grandclock-backend.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/frontend/dist
ExecStart=/usr/bin/python3 -m http.server 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable grandclock-backend.service
sudo systemctl enable grandclock-frontend.service

echo ""
echo "================================"
echo "  Installation Complete!"
echo "================================"
echo ""
echo "To start services:"
echo "  sudo systemctl start grandclock-backend"
echo "  sudo systemctl start grandclock-frontend"
echo ""
echo "To run in kiosk mode:"
echo "  ./scripts/kiosk.sh"
echo ""
echo "Backend will be available at: http://localhost:5000"
echo "Frontend will be available at: http://localhost:3000"
