"""Configuration loader and manager for GrandClock Pi."""

import os
from pathlib import Path
from typing import Any, Optional
import yaml


class Config:
    """Configuration manager with file loading and runtime updates."""

    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or self._find_config_file()
        self._config: dict = {}
        self._load()

    def _find_config_file(self) -> str:
        """Find the configuration file in standard locations."""
        locations = [
            Path(__file__).parent / "config.yaml",
            Path(__file__).parent / "config.local.yaml",
            Path.home() / ".config" / "grandclock" / "config.yaml",
            Path("/etc/grandclock/config.yaml"),
        ]
        for loc in locations:
            if loc.exists():
                return str(loc)
        return str(locations[0])

    def _load(self) -> None:
        """Load configuration from YAML file."""
        try:
            with open(self.config_path, "r") as f:
                self._config = yaml.safe_load(f) or {}
        except FileNotFoundError:
            self._config = self._get_defaults()
        except yaml.YAMLError as e:
            print(f"Error parsing config file: {e}")
            self._config = self._get_defaults()

    def _get_defaults(self) -> dict:
        """Return default configuration values."""
        return {
            "display": {
                "width": 800,
                "height": 800,
                "rotation": 0,
                "brightness": 100,
                "brightness_night": 30,
            },
            "theme": {"active": "grandfather-oak"},
            "layout": {"active": "grandfather-default"},
            "clock": {"timezone": "Europe/London", "show_seconds": True},
            "chime": {
                "enabled": True,
                "sound": "westminster",
                "volume": 70,
                "hours_only": True,
            },
            "night_mode": {
                "enabled": False,
                "auto": True,
                "start": "22:00",
                "end": "07:00",
                "dim_display": True,
                "disable_chime": True,
            },
            "calendar": {
                "enabled": False,
                "provider": "google",
                "calendar_ids": ["primary"],
                "refresh_interval": 300,
                "max_events": 5,
                "lookahead_hours": 24,
            },
            "weather": {
                "enabled": False,
                "provider": "openweathermap",
                "api_key": "",
                "location": "",
                "units": "metric",
            },
        }

    def save(self) -> None:
        """Save current configuration to file."""
        with open(self.config_path, "w") as f:
            yaml.dump(self._config, f, default_flow_style=False)

    def get(self, key: str, default: Any = None) -> Any:
        """Get a configuration value using dot notation (e.g., 'chime.enabled')."""
        keys = key.split(".")
        value = self._config
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default
            if value is None:
                return default
        return value

    def set(self, key: str, value: Any) -> None:
        """Set a configuration value using dot notation."""
        keys = key.split(".")
        config = self._config
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        config[keys[-1]] = value

    def to_dict(self) -> dict:
        """Return the full configuration as a dictionary."""
        return self._config.copy()

    def reload(self) -> None:
        """Reload configuration from file."""
        self._load()


# Global configuration instance
config = Config()
