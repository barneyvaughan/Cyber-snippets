"""Chime scheduler and audio playback service."""

import os
from datetime import datetime, time
from pathlib import Path
from threading import Thread
from typing import Callable, Optional

try:
    import pygame
    PYGAME_AVAILABLE = True
except ImportError:
    PYGAME_AVAILABLE = False

import schedule


class ChimeScheduler:
    """Scheduler for hourly chimes with night mode support."""

    CHIME_SOUNDS = {
        "westminster": "westminster.wav",
        "simple": "simple_chime.wav",
        "bell": "bell.wav",
        "cuckoo": "cuckoo.wav",
    }

    def __init__(
        self,
        sounds_dir: str = "sounds",
        enabled: bool = True,
        sound: str = "westminster",
        volume: int = 70,
        hours_only: bool = True,
    ):
        self.sounds_dir = Path(sounds_dir)
        self.enabled = enabled
        self.sound = sound
        self.volume = volume / 100.0
        self.hours_only = hours_only
        self._night_mode = False
        self._night_start = time(22, 0)
        self._night_end = time(7, 0)
        self._disable_during_night = True
        self._on_chime_callback: Optional[Callable[[int], None]] = None
        self._running = False

        # Initialize pygame mixer
        if PYGAME_AVAILABLE:
            try:
                pygame.mixer.init()
            except pygame.error as e:
                print(f"Could not initialize audio: {e}")

    def set_night_mode(
        self,
        enabled: bool,
        start: str = "22:00",
        end: str = "07:00",
        disable_chime: bool = True,
    ) -> None:
        """Configure night mode settings."""
        self._night_mode = enabled
        self._night_start = time.fromisoformat(start)
        self._night_end = time.fromisoformat(end)
        self._disable_during_night = disable_chime

    def is_night_time(self) -> bool:
        """Check if current time is within night mode hours."""
        if not self._night_mode:
            return False

        now = datetime.now().time()
        if self._night_start <= self._night_end:
            return self._night_start <= now <= self._night_end
        else:
            # Night spans midnight (e.g., 22:00 - 07:00)
            return now >= self._night_start or now <= self._night_end

    def should_chime(self) -> bool:
        """Check if chime should play based on current settings."""
        if not self.enabled:
            return False
        if self.is_night_time() and self._disable_during_night:
            return False
        return True

    def play_chime(self, hour: Optional[int] = None) -> bool:
        """Play the chime sound."""
        if not self.should_chime():
            return False

        hour = hour or datetime.now().hour

        # Trigger callback
        if self._on_chime_callback:
            self._on_chime_callback(hour)

        # Play audio
        if PYGAME_AVAILABLE:
            sound_file = self.sounds_dir / self.CHIME_SOUNDS.get(self.sound, "westminster.wav")
            if sound_file.exists():
                try:
                    pygame.mixer.music.load(str(sound_file))
                    pygame.mixer.music.set_volume(self.volume)
                    pygame.mixer.music.play()
                    return True
                except pygame.error as e:
                    print(f"Error playing chime: {e}")
            else:
                print(f"Chime sound not found: {sound_file}")
        else:
            print(f"[CHIME] Would play {self.sound} at hour {hour}")
            return True

        return False

    def on_chime(self, callback: Callable[[int], None]) -> None:
        """Register a callback for when chime triggers."""
        self._on_chime_callback = callback

    def _check_hourly(self) -> None:
        """Check if it's time to chime (called every minute)."""
        now = datetime.now()
        if now.minute == 0 and now.second < 2:
            self.play_chime(now.hour)

    def _check_quarter_hourly(self) -> None:
        """Check for quarter-hour chimes."""
        now = datetime.now()
        if now.minute in (0, 15, 30, 45) and now.second < 2:
            self.play_chime(now.hour)

    def start_scheduler(self) -> None:
        """Start the chime scheduler in background thread."""
        if self._running:
            return

        self._running = True

        if self.hours_only:
            schedule.every().minute.do(self._check_hourly)
        else:
            schedule.every().minute.do(self._check_quarter_hourly)

        def run_schedule():
            while self._running:
                schedule.run_pending()
                import time
                time.sleep(1)

        thread = Thread(target=run_schedule, daemon=True)
        thread.start()

    def stop_scheduler(self) -> None:
        """Stop the chime scheduler."""
        self._running = False
        schedule.clear()

    def test_chime(self) -> bool:
        """Play a test chime regardless of settings."""
        original_enabled = self.enabled
        original_night = self._night_mode
        self.enabled = True
        self._night_mode = False

        result = self.play_chime()

        self.enabled = original_enabled
        self._night_mode = original_night
        return result
