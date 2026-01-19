#!/bin/bash
# Start GrandClock Pi in development mode
# Both backend and frontend run with hot reload enabled

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Starting GrandClock Pi (Development Mode)..."
echo "Project directory: $PROJECT_DIR"

# Start backend
echo "Starting backend server..."
cd "$PROJECT_DIR/backend"
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi
python app.py &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
sleep 2

# Start frontend
echo "Starting frontend dev server..."
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

# Get IP address
IP_ADDR=$(hostname -I | awk '{print $1}')
echo ""
echo "============================================"
echo "GrandClock Pi is running!"
echo "============================================"
echo "Local:   http://localhost:5173"
echo "Network: http://$IP_ADDR:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "============================================"

# Handle shutdown
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for processes
wait
