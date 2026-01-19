"""GrandClock Pi - Main Flask Application with WebSocket support."""

import os
import time
from datetime import datetime
from threading import Thread
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from config import config
from gpio_handler import GPIOHandler

# Initialize Flask app
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "grandclock-secret-key")
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

# Initialize SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins=["http://localhost:3000", "http://localhost:5173"],
    async_mode="eventlet",
)

# State management
state = {
    "chime_enabled": config.get("chime.enabled", True),
    "night_mode": config.get("night_mode.enabled", False),
    "current_theme": config.get("theme.active", "grandfather-oak"),
    "current_layout": config.get("layout.active", "grandfather-default"),
}

# Available themes for cycling
THEMES = ["grandfather-oak", "modern-minimal", "art-deco"]


def handle_gpio_event(event_name: str) -> None:
    """Handle GPIO button events."""
    global state

    if event_name == "chime_toggle":
        state["chime_enabled"] = not state["chime_enabled"]
        gpio.set_indicator("chime", state["chime_enabled"])
        socketio.emit("gpio:change", {
            "pin": 17,
            "state": state["chime_enabled"],
            "name": "chime_toggle"
        })
        config.set("chime.enabled", state["chime_enabled"])

    elif event_name == "night_mode":
        state["night_mode"] = not state["night_mode"]
        gpio.set_indicator("night", state["night_mode"])
        socketio.emit("gpio:change", {
            "pin": 27,
            "state": state["night_mode"],
            "name": "night_mode"
        })
        config.set("night_mode.enabled", state["night_mode"])

    elif event_name == "theme_cycle":
        current_idx = THEMES.index(state["current_theme"]) if state["current_theme"] in THEMES else 0
        next_idx = (current_idx + 1) % len(THEMES)
        state["current_theme"] = THEMES[next_idx]
        socketio.emit("config:update", {
            "config": {"theme": {"active": state["current_theme"]}}
        })
        config.set("theme.active", state["current_theme"])


# Initialize GPIO handler
gpio = GPIOHandler(event_callback=handle_gpio_event)


def time_ticker() -> None:
    """Background thread to emit time updates."""
    while True:
        now = datetime.now()
        socketio.emit("time:tick", {
            "timestamp": int(now.timestamp() * 1000),
            "formatted": now.strftime("%H:%M:%S"),
            "hour": now.hour,
            "minute": now.minute,
            "second": now.second,
        })

        # Check for chime (on the hour)
        if now.minute == 0 and now.second == 0:
            if state["chime_enabled"] and not (state["night_mode"] and config.get("night_mode.disable_chime")):
                socketio.emit("chime:trigger", {
                    "hour": now.hour,
                    "enabled": True
                })

        time.sleep(1)


# Start time ticker thread
time_thread = Thread(target=time_ticker, daemon=True)
time_thread.start()


# ============== REST API Endpoints ==============

@app.route("/api/config", methods=["GET"])
def get_config() -> Any:
    """Get full configuration."""
    return jsonify(config.to_dict())


@app.route("/api/config", methods=["PUT"])
def update_config() -> Any:
    """Update configuration."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    for key, value in data.items():
        config.set(key, value)

    config.save()
    socketio.emit("config:update", {"config": data})

    return jsonify({"success": True, "config": config.to_dict()})


@app.route("/api/themes", methods=["GET"])
def get_themes() -> Any:
    """List available themes."""
    return jsonify({
        "themes": THEMES,
        "active": state["current_theme"]
    })


@app.route("/api/layouts", methods=["GET"])
def get_layouts() -> Any:
    """List available layouts."""
    layouts = ["grandfather-default", "modern-grid", "minimal"]
    return jsonify({
        "layouts": layouts,
        "active": state["current_layout"]
    })


@app.route("/api/widgets", methods=["GET"])
def get_widgets() -> Any:
    """List registered widgets."""
    widgets = [
        {"id": "clock-analogue", "name": "Analogue Clock", "version": "1.0.0"},
        {"id": "clock-digital", "name": "Digital Clock", "version": "1.0.0"},
        {"id": "calendar-upcoming", "name": "Upcoming Events", "version": "1.0.0"},
        {"id": "weather-current", "name": "Current Weather", "version": "1.0.0"},
        {"id": "status-bar", "name": "Status Bar", "version": "1.0.0"},
    ]
    return jsonify({"widgets": widgets})


@app.route("/api/gpio/<int:pin>/toggle", methods=["POST"])
def toggle_gpio(pin: int) -> Any:
    """Manual GPIO toggle for testing."""
    pin_map = {17: "chime", 27: "night", 22: "theme"}
    if pin in pin_map:
        gpio.simulate_button(pin_map[pin])
        return jsonify({"success": True, "pin": pin})
    return jsonify({"error": "Invalid pin"}), 400


@app.route("/api/state", methods=["GET"])
def get_state() -> Any:
    """Get current application state."""
    return jsonify(state)


@app.route("/api/health", methods=["GET"])
def health_check() -> Any:
    """Health check endpoint."""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})


# ============== WebSocket Events ==============

@socketio.on("connect")
def handle_connect() -> None:
    """Handle client connection."""
    print(f"Client connected: {request.sid}")
    # Send current state to new client
    emit("config:update", {"config": config.to_dict()})


@socketio.on("disconnect")
def handle_disconnect() -> None:
    """Handle client disconnection."""
    print(f"Client disconnected: {request.sid}")


@socketio.on("config:set")
def handle_config_set(data: dict) -> None:
    """Handle configuration update from client."""
    key = data.get("key")
    value = data.get("value")
    if key and value is not None:
        config.set(key, value)
        config.save()
        emit("config:update", {"config": {key: value}}, broadcast=True)


@socketio.on("theme:change")
def handle_theme_change(data: dict) -> None:
    """Handle theme change request."""
    global state
    theme_id = data.get("themeId")
    if theme_id and theme_id in THEMES:
        state["current_theme"] = theme_id
        config.set("theme.active", theme_id)
        config.save()
        emit("config:update", {"config": {"theme": {"active": theme_id}}}, broadcast=True)


@socketio.on("layout:change")
def handle_layout_change(data: dict) -> None:
    """Handle layout change request."""
    global state
    layout_id = data.get("layoutId")
    if layout_id:
        state["current_layout"] = layout_id
        config.set("layout.active", layout_id)
        config.save()
        emit("config:update", {"config": {"layout": {"active": layout_id}}}, broadcast=True)


@socketio.on("chime:test")
def handle_chime_test(data: dict) -> None:
    """Trigger a test chime."""
    emit("chime:trigger", {"hour": datetime.now().hour, "enabled": True}, broadcast=True)


if __name__ == "__main__":
    print("Starting GrandClock Pi server...")
    print(f"Configuration loaded from: {config.config_path}")
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
