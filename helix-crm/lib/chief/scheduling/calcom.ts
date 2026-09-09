// Cal.com (open-source Calendly) — the real scheduling backend for CHIEF's scheduling
// agent. Replaces the hardcoded fake slots with live availability + real bookings.
// Reuse-first: Cal.com is MIT and self-hostable, fitting the HELIX privacy/cost model.
// Degrades cleanly: when no API key is set, callers fall back to the text-only stub.
//
// API (verified vs cal.com docs, 2026-08): Bearer auth + per-endpoint cal-api-version.
//   GET  /v2/slots     cal-api-version: 2024-09-04
//   POST /v2/bookings  cal-api-version: 2024-08-13   body { start, eventTypeId, attendee:{name,email,timeZone} }
const BASE = 'https://api.cal.com/v2';
const TZ = 'Asia/Jerusalem';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function calcomConfigured(): boolean {
  return Boolean(process.env.CALCOM_API_KEY && process.env.CALCOM_EVENT_TYPE_ID);
}

function headers(version: string): Record<string, string> {
  return {
    authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
    'cal-api-version': version,
    'content-type': 'application/json',
  };
}

/** Live available slots (ISO start strings) within [from,to]. null if not configured / on error. */
export async function getSlots(from: string, to: string, timeZone = TZ): Promise<string[] | null> {
  if (!calcomConfigured()) return null;
  const params = new URLSearchParams({
    eventTypeId: String(process.env.CALCOM_EVENT_TYPE_ID),
    start: from,
    end: to,
    timeZone,
  });
  try {
    const res = await fetch(`${BASE}/slots?${params}`, { headers: headers('2024-09-04') });
    if (!res.ok) return null;
    const json: any = await res.json();
    // v2 shape: { data: { "2026-08-20": [{ start: "..." } | "..."], ... } } — parse defensively.
    const data = json?.data ?? json?.slots ?? {};
    const out: string[] = [];
    for (const day of Object.values(data)) {
      if (!Array.isArray(day)) continue;
      for (const s of day) {
        const t = typeof s === 'string' ? s : s?.start ?? s?.time;
        if (typeof t === 'string') out.push(t);
      }
    }
    return out;
  } catch {
    return null;
  }
}

/** Create a real booking. Returns the booking id, or null if not configured / on error. */
export async function createBooking(input: {
  start: string; // ISO
  name: string;
  email: string;
  timeZone?: string;
}): Promise<{ id: string } | null> {
  if (!calcomConfigured()) return null;
  try {
    const res = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: headers('2024-08-13'),
      body: JSON.stringify({
        start: input.start,
        eventTypeId: Number(process.env.CALCOM_EVENT_TYPE_ID),
        attendee: { name: input.name, email: input.email, timeZone: input.timeZone ?? TZ },
      }),
    });
    if (!res.ok) return null;
    const json: any = await res.json();
    const id = json?.data?.uid ?? json?.data?.id ?? json?.uid ?? json?.id;
    return id ? { id: String(id) } : null;
  } catch {
    return null;
  }
}
