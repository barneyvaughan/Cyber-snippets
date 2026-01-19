"""Google Calendar integration service."""

import os
from datetime import datetime, timedelta
from typing import Any, Optional
from dataclasses import dataclass

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False


@dataclass
class CalendarEvent:
    """Represents a calendar event."""
    id: str
    title: str
    start: datetime
    end: datetime
    location: Optional[str] = None
    description: Optional[str] = None
    all_day: bool = False

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
            "location": self.location,
            "description": self.description,
            "all_day": self.all_day,
        }


class CalendarService:
    """Service for fetching calendar events from Google Calendar."""

    SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

    def __init__(
        self,
        credentials_path: str = "credentials.json",
        token_path: str = "token.json",
    ):
        self.credentials_path = credentials_path
        self.token_path = token_path
        self._service = None
        self._credentials = None
        self._events_cache: list[CalendarEvent] = []
        self._last_fetch: Optional[datetime] = None

    def _get_credentials(self) -> Optional[Any]:
        """Get or refresh OAuth credentials."""
        if not GOOGLE_API_AVAILABLE:
            print("Google API libraries not available")
            return None

        creds = None

        # Load existing token
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, self.SCOPES)

        # Refresh or create new credentials
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            elif os.path.exists(self.credentials_path):
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_path, self.SCOPES
                )
                creds = flow.run_local_server(port=0)

                # Save credentials for next run
                with open(self.token_path, "w") as token:
                    token.write(creds.to_json())
            else:
                print(f"Credentials file not found: {self.credentials_path}")
                return None

        return creds

    def _get_service(self) -> Optional[Any]:
        """Get or create the Calendar API service."""
        if not GOOGLE_API_AVAILABLE:
            return None

        if self._service is None:
            creds = self._get_credentials()
            if creds:
                self._service = build("calendar", "v3", credentials=creds)

        return self._service

    def fetch_events(
        self,
        calendar_ids: list[str],
        max_events: int = 5,
        lookahead_hours: int = 24,
    ) -> list[CalendarEvent]:
        """Fetch upcoming events from specified calendars."""
        service = self._get_service()
        if not service:
            return self._get_mock_events()

        events = []
        now = datetime.utcnow()
        time_min = now.isoformat() + "Z"
        time_max = (now + timedelta(hours=lookahead_hours)).isoformat() + "Z"

        for calendar_id in calendar_ids:
            try:
                events_result = (
                    service.events()
                    .list(
                        calendarId=calendar_id,
                        timeMin=time_min,
                        timeMax=time_max,
                        maxResults=max_events,
                        singleEvents=True,
                        orderBy="startTime",
                    )
                    .execute()
                )

                for event in events_result.get("items", []):
                    start = event["start"].get("dateTime", event["start"].get("date"))
                    end = event["end"].get("dateTime", event["end"].get("date"))

                    # Parse dates
                    all_day = "date" in event["start"]
                    if all_day:
                        start_dt = datetime.fromisoformat(start)
                        end_dt = datetime.fromisoformat(end)
                    else:
                        start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
                        end_dt = datetime.fromisoformat(end.replace("Z", "+00:00"))

                    events.append(
                        CalendarEvent(
                            id=event["id"],
                            title=event.get("summary", "No title"),
                            start=start_dt,
                            end=end_dt,
                            location=event.get("location"),
                            description=event.get("description"),
                            all_day=all_day,
                        )
                    )

            except Exception as e:
                print(f"Error fetching calendar {calendar_id}: {e}")

        # Sort by start time and limit
        events.sort(key=lambda e: e.start)
        self._events_cache = events[:max_events]
        self._last_fetch = datetime.now()

        return self._events_cache

    def _get_mock_events(self) -> list[CalendarEvent]:
        """Return mock events for development/demo."""
        now = datetime.now()
        return [
            CalendarEvent(
                id="mock-1",
                title="Team Meeting",
                start=now + timedelta(hours=2),
                end=now + timedelta(hours=3),
                location="Conference Room A",
            ),
            CalendarEvent(
                id="mock-2",
                title="Lunch with Sarah",
                start=now + timedelta(hours=5),
                end=now + timedelta(hours=6),
                location="The Green Cafe",
            ),
            CalendarEvent(
                id="mock-3",
                title="Project Review",
                start=now + timedelta(days=1, hours=2),
                end=now + timedelta(days=1, hours=4),
            ),
        ]

    def get_cached_events(self) -> list[CalendarEvent]:
        """Get cached events without fetching."""
        return self._events_cache

    def should_refresh(self, refresh_interval: int = 300) -> bool:
        """Check if events should be refreshed."""
        if self._last_fetch is None:
            return True
        elapsed = (datetime.now() - self._last_fetch).total_seconds()
        return elapsed >= refresh_interval
