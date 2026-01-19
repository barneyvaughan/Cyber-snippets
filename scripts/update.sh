#!/bin/bash

# GrandClock Pi Update Script
# Updates the application from git and rebuilds

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "================================"
echo "  GrandClock Pi Update"
echo "================================"

# Stop services
echo "Stopping services..."
sudo systemctl stop grandclock-frontend || true
sudo systemctl stop grandclock-backend || true

# Pull latest changes
echo "Pulling latest changes..."
cd "$PROJECT_DIR"
git pull origin main

# Update backend dependencies
echo "Updating backend dependencies..."
cd "$PROJECT_DIR/backend"
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# Update frontend and rebuild
echo "Updating frontend..."
cd "$PROJECT_DIR/frontend"
npm ci
npm run build

# Restart services
echo "Restarting services..."
sudo systemctl start grandclock-backend
sudo systemctl start grandclock-frontend

echo ""
echo "================================"
echo "  Update Complete!"
echo "================================"
