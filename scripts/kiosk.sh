#!/bin/bash

# GrandClock Pi Kiosk Mode Script
# Launches the clock in fullscreen kiosk mode

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Configuration
DISPLAY_URL="http://localhost:3000"
ROTATION=0  # 0, 90, 180, or 270

echo "Starting GrandClock Pi in kiosk mode..."

# Ensure services are running
sudo systemctl start grandclock-backend || true
sudo systemctl start grandclock-frontend || true

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Disable screen blanking
xset s off
xset -dpms
xset s noblank

# Hide mouse cursor after 3 seconds of inactivity
unclutter -idle 3 -root &

# Set display rotation if needed
if [ "$ROTATION" != "0" ]; then
    xrandr --output HDMI-1 --rotate $ROTATION 2>/dev/null || \
    xrandr --output HDMI-2 --rotate $ROTATION 2>/dev/null || true
fi

# Launch Chromium in kiosk mode
chromium-browser \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-restore-session-state \
    --disable-translate \
    --no-first-run \
    --start-fullscreen \
    --autoplay-policy=no-user-gesture-required \
    --check-for-update-interval=31536000 \
    --disable-features=TranslateUI \
    "$DISPLAY_URL"
