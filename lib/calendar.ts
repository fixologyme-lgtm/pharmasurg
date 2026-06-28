// ─────────────────────────────────────────────────────────────
// GOOGLE CALENDAR INTEGRATION POINT
// When ready: supply GOOGLE_CALENDAR_ID and GOOGLE_SERVICE_ACCOUNT_KEY
// environment variables, then implement createCalendarEvent() below.
// ─────────────────────────────────────────────────────────────

export interface CalendarEventPayload {
  patientName: string
  symptom: string
  notes?: string
  preferredDate?: string // ISO date string
}

export interface CalendarEventResult {
  eventId: string | null
  eventLink: string | null
}

export async function createCalendarEvent(
  payload: CalendarEventPayload
): Promise<CalendarEventResult> {
  // TODO: Replace stub with Google Calendar API call
  // Example implementation:
  // const auth = new google.auth.JWT(SERVICE_ACCOUNT_EMAIL, null, PRIVATE_KEY, SCOPES)
  // const calendar = google.calendar({ version: 'v3', auth })
  // const event = await calendar.events.insert({
  //   calendarId: process.env.GOOGLE_CALENDAR_ID,
  //   requestBody: {
  //     summary: `GP Referral: ${payload.patientName} — ${payload.symptom}`,
  //     description: payload.notes,
  //     start: { dateTime: ..., timeZone: 'Europe/London' },
  //     end:   { dateTime: ..., timeZone: 'Europe/London' },
  //   },
  // })
  // return { eventId: event.data.id, eventLink: event.data.htmlLink }

  console.log('[CALENDAR STUB] Would create event for:', payload.patientName)
  return { eventId: null, eventLink: null }
}
