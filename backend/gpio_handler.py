"""GPIO handler for physical button and LED control."""

import os
from dataclasses import dataclass
from typing import Callable, Optional

# Mock GPIO for development on non-Pi systems
try:
    from gpiozero import Button, LED
    from gpiozero.pins.mock import MockFactory
    GPIO_AVAILABLE = True
except ImportError:
    GPIO_AVAILABLE = False


@dataclass
class GPIOConfig:
    """GPIO pin configuration."""

    pins = {
        "chime_toggle": 17,  # Momentary button - toggles chime on/off
        "night_mode": 27,  # Momentary button - toggles night mode
        "theme_cycle": 22,  # Momentary button - cycles themes
        "chime_led": 23,  # LED indicator - chime enabled
        "night_led": 24,  # LED indicator - night mode active
    }


class MockButton:
    """Mock button for development."""

    def __init__(self, pin: int, bounce_time: float = 0.1):
        self.pin = pin
        self.bounce_time = bounce_time
        self.when_pressed: Optional[Callable] = None


class MockLED:
    """Mock LED for development."""

    def __init__(self, pin: int):
        self.pin = pin
        self._state = False

    def on(self) -> None:
        self._state = True

    def off(self) -> None:
        self._state = False

    @property
    def is_lit(self) -> bool:
        return self._state


class GPIOHandler:
    """Handler for GPIO buttons and LEDs."""

    def __init__(
        self,
        config: Optional[GPIOConfig] = None,
        event_callback: Optional[Callable[[str], None]] = None,
        mock: bool = False,
    ):
        self.config = config or GPIOConfig()
        self.event_callback = event_callback
        self._mock = mock or not GPIO_AVAILABLE or not self._is_raspberry_pi()

        if self._mock:
            print("GPIO: Running in mock mode")
            ButtonClass = MockButton
            LEDClass = MockLED
        else:
            ButtonClass = Button
            LEDClass = LED

        # Initialize buttons
        self.chime_btn = ButtonClass(
            self.config.pins["chime_toggle"], bounce_time=0.1
        )
        self.night_btn = ButtonClass(
            self.config.pins["night_mode"], bounce_time=0.1
        )
        self.theme_btn = ButtonClass(
            self.config.pins["theme_cycle"], bounce_time=0.1
        )

        # Initialize LEDs
        self.chime_led = LEDClass(self.config.pins["chime_led"])
        self.night_led = LEDClass(self.config.pins["night_led"])

        # Set up button callbacks
        if event_callback:
            self.chime_btn.when_pressed = lambda: self._handle_event("chime_toggle")
            self.night_btn.when_pressed = lambda: self._handle_event("night_mode")
            self.theme_btn.when_pressed = lambda: self._handle_event("theme_cycle")

    def _is_raspberry_pi(self) -> bool:
        """Check if running on a Raspberry Pi."""
        try:
            with open("/proc/device-tree/model", "r") as f:
                return "raspberry pi" in f.read().lower()
        except FileNotFoundError:
            return False

    def _handle_event(self, event_name: str) -> None:
        """Handle a button press event."""
        if self.event_callback:
            self.event_callback(event_name)

    def set_indicator(self, name: str, state: bool) -> None:
        """Set an LED indicator state."""
        led = getattr(self, f"{name}_led", None)
        if led:
            if state:
                led.on()
            else:
                led.off()

    def get_indicator(self, name: str) -> bool:
        """Get an LED indicator state."""
        led = getattr(self, f"{name}_led", None)
        if led:
            return led.is_lit
        return False

    def simulate_button(self, button_name: str) -> None:
        """Simulate a button press (for testing/API)."""
        callback = getattr(getattr(self, f"{button_name}_btn", None), "when_pressed", None)
        if callback:
            callback()

    def cleanup(self) -> None:
        """Clean up GPIO resources."""
        if not self._mock and GPIO_AVAILABLE:
            # gpiozero handles cleanup automatically
            pass
