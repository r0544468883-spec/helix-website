// Proves the lead-notification pipeline actually delivers, before anyone trusts it.
//
// WHY: every form on the site answered ok for months while Resend was rejecting
// the send. Two failure modes produce that silence and neither is visible from
// the site: the sandbox sender 'onboarding@resend.dev' delivers ONLY to the
// address owning the Resend account and 403s the request for anyone else, and a
// RESEND_FROM on a domain that is not yet "Verified" is refused outright. So
// this talks to the REST API directly (no dependency, no build step) and sends
// one real message PER RECIPIENT, the only way to learn which address is
// refused.
//
// Run:  npm run check:resend                    one real mail per recipient
//       npm run check:resend -- --domains-only  prints the domain table and stops
//
// --domains-only exists because the only question people actually ask ("is the
// domain verified yet?") used to cost everyone on RESEND_NOTIFY_TO an inbox.
//
// Exit codes, identical in both modes so a CI step or an && chain can trust them:
//   0  the sender domain can send (and in full-send mode every recipient was
//      accepted by the API). A pending Return-Path record still exits 0: it
//      costs bounce tracking, not delivery, and it is printed as a warning.
//   1  nothing would arrive: RESEND_API_KEY missing, RESEND_NOTIFY_TO missing in
//      full-send mode, GET /domains failed, the sender domain cannot
//      authenticate, the sandbox sender is in use, or a recipient was refused.

const API = 'https://api.resend.com';
const key = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM || 'HELIX <onboarding@resend.dev>';
const to = (process.env.RESEND_NOTIFY_TO || '').split(',').map((s) => s.trim()).filter(Boolean);
const domainsOnly = process.argv.includes('--domains-only');

// State on 2026-09-20, after helix.co.il was registered: the APEX is on the
// account, its DKIM record is verified, and a send from leads@helix.co.il was
// accepted and delivered. What is still pending is the CNAME at
// send.helix.co.il, because stale Amazon SES era records (a TXT SPF and an MX
// to feedback-smtp.eu-west-1.amazonses.com) sit alongside it, and a CNAME
// cannot share a name with any other record. That subdomain is only Resend's
// Return-Path, so the cost is bounce tracking, not delivery.
const FIX = [
  'Fix: at resend.com/domains open helix.co.il, the APEX, and read the record table.',
  '     Put each record it lists into Cloudflare exactly as shown, then re-run this.',
  '     A record stuck on "pending" is usually a CNAME sharing its name with an old',
  '     TXT or MX. DNS forbids that, so the leftovers have to go.',
  '     The APEX MX is Google Workspace. Never touch it.',
].join('\n');

const RETURN_PATH_FIX = [
  '     This is the Return-Path subdomain, so mail still delivers, but bounces and',
  '     complaints are not attributed back to helix.co.il.',
  '     Delete the stale Amazon SES records at send.helix.co.il (the',
  '     "v=spf1 include:amazonses.com" TXT and the feedback-smtp MX) and leave only',
  '     the CNAME. A CNAME cannot coexist with other records at the same name.',
].join('\n');

function fail(msg) {
  console.error(`\n${msg}`);
  process.exit(1);
}

async function api(path, init) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

if (!key) fail('RESEND_API_KEY is not set. Put it in .env.local, which npm run check:resend reads, or export it.');
// Only a real send needs recipients, and --domains-only is the mode people reach
// for before the env is fully filled in.
if (!domainsOnly && !to.length) fail('RESEND_NOTIFY_TO is not set. Comma-separated, e.g. a@x.com,b@y.com');

// The sending domain as Resend sees it: the part after @ inside "Name <addr>".
const sender = (from.match(/<([^>]+)>/)?.[1] || from).trim();
const senderDomain = sender.split('@')[1] || '';

const domains = await api('/domains');
if (!domains.ok) fail(`GET /domains failed (${domains.status}): ${JSON.stringify(domains.body)}`);
const list = domains.body.data || [];

console.log(`from:       ${from}`);
console.log(`recipients: ${domainsOnly ? '(--domains-only, nothing will be sent)' : to.join(', ')}`);
console.log(list.length ? 'domains on this account:' : 'no domains on this account (sandbox only)');
for (const d of list) console.log(`  ${d.name}  ${d.status}`);

// Both branches below mean the same thing: nothing this account sends reaches
// anyone. --domains-only is the mode people (and CI) reach for to ask exactly
// that, so it has to answer in the exit code and not only in the text, or a
// green tick says "verified" while every notification goes nowhere.
let blocked = false;

const domain = list.find((d) => d.name === senderDomain);

// Per-record status is the only view that says WHICH record is holding things
// up. The domain-level status collapses to "partially_verified" and tells you
// nothing about whether that matters.
let pending = [];
if (domain) {
  const detail = await api(`/domains/${domain.id}`);
  const records = detail.ok ? detail.body.records || [] : [];
  for (const r of records) {
    console.log(`  ${(r.status || '?').padEnd(10)} ${(r.record || '?').padEnd(5)} ${r.type} ${r.name}`);
  }
  pending = records.filter((r) => r.status !== 'verified');
}

// Authentication is what gates sending, and that is DKIM. A domain can sit on
// "partially_verified" and still deliver, which is exactly the case here, so
// keying the verdict on the domain-level status would report a false blocker.
const canSend =
  domain &&
  (domain.status === 'verified' ||
    (domain.records || []).length === 0 ||
    !pending.some((r) => r.record === 'DKIM'));

if (senderDomain !== 'resend.dev' && !canSend) {
  blocked = true;
  console.warn(`\n${senderDomain} cannot authenticate on this account. Every send is refused until it can.`);
  console.warn(FIX);
} else if (pending.length) {
  const names = pending.map((r) => `${r.type} ${r.name}`).join(', ');
  console.warn(`\n${senderDomain} sends, but these records are still pending: ${names}`);
  console.warn(pending.some((r) => r.name === 'send') ? RETURN_PATH_FIX : FIX);
}
if (senderDomain === 'resend.dev') {
  blocked = true;
  console.warn('\nSandbox sender in use. Only the Resend account owner can receive anything.');
  console.warn(FIX);
}

if (domainsOnly) process.exit(blocked ? 1 : 0);

// One send per recipient. A single multi-recipient call fails as a whole, which
// hides which address Resend refused, and that is the exact case here: the
// sandbox sender rejects the request because of ONE non-owner recipient.
let failures = 0;
for (const addr of to) {
  const r = await api('/emails', {
    method: 'POST',
    body: JSON.stringify({
      from,
      to: [addr],
      subject: 'HELIX · בדיקת מסירה',
      text: `בדיקה מ-scripts/check-resend.mjs\nfrom: ${from}\n${new Date().toISOString()}`,
    }),
  });
  if (r.ok) {
    console.log(`OK    ${addr}  id=${r.body.id || 'unknown'}`);
    continue;
  }
  failures++;
  const msg = r.body?.message || JSON.stringify(r.body);
  console.error(`FAIL  ${addr}  (${r.status}) ${msg}`);
  if (/testing emails|own email address/i.test(msg)) {
    console.error('      Sandbox sender reaches only the Resend account owner.');
    console.error(FIX);
  } else if (/verif|domain/i.test(msg)) {
    console.error(`      Sending domain not verified: ${senderDomain}.`);
    console.error(FIX);
  }
}

if (failures) {
  fail(`${failures}/${to.length} recipients failed. Every form on the site is dropping notifications right now.`);
}
console.log(`\n${to.length}/${to.length} accepted by the API. Now open both inboxes, spam folder included.`);
