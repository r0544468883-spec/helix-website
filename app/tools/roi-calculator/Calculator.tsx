'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';

// Pure client-side compute, so it works under static export (no API, no server action).
// Deliberately conservative: it compares the COST of the repetitive work today
// (your time, or a hire/agency) against a fixed HELIX subscription. No fabricated
// ROI multipliers, just hours × value vs a monthly fee (methodology honesty rule).

const ILS = (n: number) => `₪${Math.round(n).toLocaleString('he-IL')}`;

export default function Calculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [hourlyValue, setHourlyValue] = useState(150);
  const [helixMonthly, setHelixMonthly] = useState(699);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const weeksPerMonth = 4.3;
  const currentMonthlyCost = hoursPerWeek * hourlyValue * weeksPerMonth;
  const saving = currentMonthlyCost - helixMonthly;
  const worthIt = saving > 0;
  const hoursBack = Math.round(hoursPerWeek * weeksPerMonth);

  function sendResult(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    // Optional capture — posts to the canonical lead sink (CRM + notify). Not a gate.
    fetch('/api/content-lead', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, source: '/tools/roi-calculator',
        details: {
          'שעות בשבוע': String(hoursPerWeek),
          'שווי שעה': ILS(hourlyValue),
          'מסלול HELIX': ILS(helixMonthly),
          'חיסכון חודשי מחושב': worthIt ? ILS(saving) : 'DIY זול יותר',
        },
      }),
    }).catch(() => {});
    setSent(true);
  }

  return (
    <div className="roi-calc">
      <div className="roi-inputs">
        <label className="roi-field">
          <span className="roi-label">שעות בשבוע על עבודה חוזרת</span>
          <span className="roi-hint">תוכן, מעקב, דוחות, פרסום ידני</span>
          <input type="range" aria-label="שעות בשבוע על עבודה חוזרת" min={1} max={40} value={hoursPerWeek} onChange={(e) => setHoursPerWeek(+e.target.value)} />
          <output className="roi-value">{hoursPerWeek} שעות</output>
        </label>

        <label className="roi-field">
          <span className="roi-label">שווי שעת עבודה</span>
          <span className="roi-hint">כמה שווה שעה שלכם, או של מי שעושה את זה</span>
          <input type="range" aria-label="שווי שעת עבודה בשקלים" min={50} max={500} step={10} value={hourlyValue} onChange={(e) => setHourlyValue(+e.target.value)} />
          <output className="roi-value">{ILS(hourlyValue)} לשעה</output>
        </label>

        <label className="roi-field">
          <span className="roi-label">עלות HELIX חודשית</span>
          <span className="roi-hint">המסלול שמתאים לכם</span>
          <input type="range" aria-label="עלות HELIX חודשית בשקלים" min={199} max={1490} step={100} value={helixMonthly} onChange={(e) => setHelixMonthly(+e.target.value)} />
          <output className="roi-value">{ILS(helixMonthly)} לחודש</output>
        </label>
      </div>

      <div className="roi-result" data-worth={worthIt ? 'yes' : 'no'} role="status" aria-live="polite">
        <div className="roi-result-row">
          <span>העבודה החוזרת עולה לכם היום</span>
          <strong>{ILS(currentMonthlyCost)} לחודש</strong>
        </div>
        <div className="roi-result-row">
          <span>עלות HELIX</span>
          <strong>{ILS(helixMonthly)} לחודש</strong>
        </div>
        <div className="roi-result-headline">
          {worthIt ? (
            <>
              <span className="roi-big">{ILS(saving)}</span>
              <span className="roi-sub">חיסכון חודשי, ו-{hoursBack} שעות שחוזרות אליכם</span>
            </>
          ) : (
            <>
              <span className="roi-sub">
                בנתונים האלה, לעשות לבד עדיין זול יותר. אנחנו נגיד לכם את זה בכנות, זה לא המקרה שבו כדאי לכם מנוי.
              </span>
            </>
          )}
        </div>
        <a
          href={`${SITE.calendlyUrl}${SITE.calendlyUrl.includes('?') ? '&' : '?'}utm_source=roi-calculator&utm_content=${encodeURIComponent(`hours-${hoursPerWeek}_value-${hourlyValue}_saving-${Math.round(saving)}`)}`}
          className="btn btn-primary" target="_blank" rel="noopener noreferrer">
          {worthIt ? 'לדבר על זה' : 'בכל זאת לשיחה'}
        </a>

        {sent ? (
          <p className="roi-sub" style={{ marginTop: 10 }}>שלחנו — נהיה בקשר. 🙌</p>
        ) : (
          <form onSubmit={sendResult} style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="רוצים את החישוב במייל? (לא חובה)" aria-label="אימייל לקבלת החישוב"
              dir="ltr" style={{ flex: 1, minWidth: 180, padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'inherit', font: 'inherit' }}
            />
            <button type="submit" className="btn btn-ghost">שליחה</button>
          </form>
        )}
      </div>
    </div>
  );
}
