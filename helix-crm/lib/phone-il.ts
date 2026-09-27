// Israeli phone numbers -> the digits-only international form wa.me needs.
// Stored numbers arrive in whatever shape they were typed: 054-123-4567,
// 0541234567, +972 54-123-4567, 03-1234567. wa.me accepts none of those.
// See DESIGN.md — CRM contact comms.

const MIN_DIGITS = 11; // 97231234567 — an Israeli landline, the shortest real case
const MAX_DIGITS = 15; // E.164 ceiling

/**
 * The number to address WhatsApp with, or null when it cannot be dialled.
 * Null is the signal to hide the WhatsApp action rather than offer a broken link.
 */
export function toWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let d = raw.replace(/\D/g, '');
  if (!d) return null;

  // 00 is the international dialing prefix, the spoken form of a leading '+'.
  // Dropping it before the Israeli 0 rule matters: 00972… must not become 972972….
  if (d.startsWith('00')) d = d.slice(2);
  // A single leading 0 is the Israeli trunk prefix. Anything else already carries
  // its own country code and keeps it.
  else if (d.startsWith('0')) d = `972${d.slice(1)}`;

  if (d.length < MIN_DIGITS || d.length > MAX_DIGITS) return null;
  return d;
}

/** The wa.me link for a number, with the message pre-filled. Null when undialable. */
export function whatsAppLink(raw: string | null | undefined, text?: string): string | null {
  const num = toWhatsAppNumber(raw);
  if (!num) return null;
  const q = text?.trim() ? `?text=${encodeURIComponent(text.trim())}` : '';
  return `https://wa.me/${num}${q}`;
}
