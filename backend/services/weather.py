"""Weather service for fetching current weather data."""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
import requests


@dataclass
class WeatherData:
    """Represents current weather data."""
    temperature: float
    feels_like: float
    humidity: int
    description: str
    icon: str
    wind_speed: float
    location: str
    timestamp: datetime

    def to_dict(self) -> dict:
        return {
            "temperature": self.temperature,
            "feels_like": self.feels_like,
            "humidity": self.humidity,
            "description": self.description,
            "icon": self.icon,
            "wind_speed": self.wind_speed,
            "location": self.location,
            "timestamp": self.timestamp.isoformat(),
        }


class WeatherService:
    """Service for fetching weather data from OpenWeatherMap."""

    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

    def __init__(self, api_key: str = "", location: str = "", units: str = "metric"):
        self.api_key = api_key
        self.location = location
        self.units = units
        self._cache: Optional[WeatherData] = None
        self._last_fetch: Optional[datetime] = None

    def fetch_weather(self, location: Optional[str] = None) -> Optional[WeatherData]:
        """Fetch current weather data."""
        loc = location or self.location
        if not loc or not self.api_key:
            return self._get_mock_weather()

        try:
            params = {
                "q": loc,
                "appid": self.api_key,
                "units": self.units,
            }
            response = requests.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            weather = WeatherData(
                temperature=data["main"]["temp"],
                feels_like=data["main"]["feels_like"],
                humidity=data["main"]["humidity"],
                description=data["weather"][0]["description"],
                icon=data["weather"][0]["icon"],
                wind_speed=data["wind"]["speed"],
                location=data["name"],
                timestamp=datetime.now(),
            )

            self._cache = weather
            self._last_fetch = datetime.now()
            return weather

        except requests.RequestException as e:
            print(f"Error fetching weather: {e}")
            return self._cache or self._get_mock_weather()

    def _get_mock_weather(self) -> WeatherData:
        """Return mock weather for development/demo."""
        return WeatherData(
            temperature=12.5,
            feels_like=10.2,
            humidity=75,
            description="partly cloudy",
            icon="02d",
            wind_speed=5.2,
            location="Wirral, UK",
            timestamp=datetime.now(),
        )

    def get_cached_weather(self) -> Optional[WeatherData]:
        """Get cached weather without fetching."""
        return self._cache

    def should_refresh(self, refresh_interval: int = 600) -> bool:
        """Check if weather should be refreshed."""
        if self._last_fetch is None:
            return True
        elapsed = (datetime.now() - self._last_fetch).total_seconds()
        return elapsed >= refresh_interval
