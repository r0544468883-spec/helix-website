'use client';

import { useState, type FormEvent } from 'react';

type Field = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  inputMode?: 'tel' | 'email' | 'url' | 'text';
  placeholder?: string;
  hint?: string;
  full?: boolean;
  textarea?: boolean;
};

// שלב 1, רק מה שחייבים כדי לתפוס את הליד (חיכוך נמוך).
const STEP1: Field[] = [
  { name: 'name', label: 'שם מלא', type: 'text', autoComplete: 'name' },
  { name: 'company', label: 'שם המותג / החברה', type: 'text', autoComplete: 'organization' },
  { name: 'email', label: 'אימייל בעבודה', type: 'email', autoComplete: 'email', inputMode: 'email' },
  { name: 'phone', label: 'טלפון', type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '05X-XXX-XXXX' },
];

// שלב 2, פרטים שעוזרים לדייק את הפיילוט. הכל אופציונלי.
const STEP2: Field[] = [
  { name: 'website', label: 'אתר החברה', inputMode: 'url', placeholder: 'www.example.co.il', hint: 'נסרוק את התוכן שכבר יש לכם' },
  { name: 'role', label: 'התפקיד שלכם', placeholder: 'למשל: סמנכ״ל שיווק, VP Marketing' },
  { name: 'category', label: 'הקטגוריה שבה אתם מתחרים', placeholder: 'למשל: תוכנת HR, קוסמטיקה טבעית' },
  { name: 'competitors', label: 'מי המתחרים העיקריים', placeholder: 'שניים-שלושה מותגים שאתם נמדדים מולם' },
  { name: 'recommendFor', label: 'על איזו שאלה תרצו שה-AI ימליץ עליכם?', textarea: true, full: true, placeholder: 'איזו שאלה של לקוח הייתם רוצים שהתשובה שלה תהיה אתם?' },
  { name: 'notes', label: 'עוד משהו שכדאי שנדע', textarea: true, full: true, placeholder: 'יעדים, השקות קרובות, כל דבר שיעזור לנו לכוון' },
];

const empty = (): Record<string, string> =>
  [...STEP1, ...STEP2].reduce((a, f) => ({ ...a, [f.name]: '' }), {});

// מייל עסקי בלבד, חוסמים ספקי מייל חינמיים נפוצים.
const FREE_EMAIL = /@(gmail|googlemail|hotmail|outlook|yahoo|ymail|walla|icloud|live|aol|protonmail|me)\./i;
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneDigits = (v: string) => v.replace(/\D/g, '');

type Intent = 'call' | 'report';

export default function GeoPilotForm({
  endpoint = '/api/geo-pilot-lead',
  defaultIntent = 'call',
}: {
  endpoint?: string;
  defaultIntent?: Intent;
}) {
  const [intent, setIntent] = useState<Intent>(defaultIntent);
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState<Record<string, string>>(empty());
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(''); // honeypot
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);

  const set = (name: string, value: string) => {
    setData((d) => ({ ...d, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: false }));
  };

  function focusFirst(missing: string[]) {
    const el = document.getElementById(missing[0]);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      (el as HTMLInputElement).focus({ preventScroll: true });
    }
  }

  async function submitStep1(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (company) return; // honeypot

    const bad: Record<string, boolean> = {};
    let msg = '';
    for (const f of STEP1) if (!data[f.name].trim()) bad[f.name] = true;
    if (Object.keys(bad).length) msg = 'נא למלא את כל השדות.';
    const digits = phoneDigits(data.phone);
    if (!bad.phone && (digits.length !== 10 || digits[0] !== '0')) {
      bad.phone = true;
      msg = 'מספר הטלפון חייב לכלול 10 ספרות (למשל 0541234567).';
    }
    const emailVal = data.email.trim().toLowerCase();
    if (!bad.email && !isEmail(emailVal)) {
      bad.email = true;
      msg = 'האימייל לא נראה תקין.';
    } else if (!bad.email && FREE_EMAIL.test(emailVal)) {
      bad.email = true;
      msg = 'נא להשתמש במייל בעבודה (לא Gmail או מייל חינמי אחר).';
    }
    // לבקשת דוח נראות, כתובת האתר חובה, אנחנו בודקים אותו ידנית
    if (intent === 'report') {
      const w = data.website.trim();
      if (!w || !/\./.test(w)) {
        bad.website = true;
        msg = 'כדי לבדוק את האתר צריך כתובת תקינה (למשל www.example.co.il).';
      }
    }
    if (Object.keys(bad).length) {
      setErrors(bad);
      setFormError(msg);
      focusFirst(Object.keys(bad));
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          name: data.name.trim(),
          company: data.company.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          website: data.website.trim(),
          consent: consent ? 'true' : 'false',
          company_hp: company,
        }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (j.ok) {
        setStep(2);
      } else {
        const m: Record<string, string> = {
          invalid_email: 'האימייל לא נראה תקין.',
          free_email: 'נא להשתמש במייל בעבודה (לא Gmail או מייל חינמי אחר).',
          invalid_phone: 'מספר הטלפון חייב לכלול 10 ספרות (למשל 0541234567).',
        };
        if (j.error === 'free_email' || j.error === 'invalid_email') setErrors((e) => ({ ...e, email: true }));
        if (j.error === 'invalid_phone') setErrors((e) => ({ ...e, phone: true }));
        setFormError((j.error && m[j.error]) || 'משהו השתבש. נסו שוב.');
      }
    } catch {
      setFormError('תקלת רשת. נסו שוב.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitStep2(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrich: 'true',
          intent,
          name: data.name.trim(),
          company: data.company.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          website: data.website.trim(),
          role: data.role.trim(),
          category: data.category.trim(),
          competitors: data.competitors.trim(),
          recommendFor: data.recommendFor.trim(),
          notes: data.notes.trim(),
          consent: consent ? 'true' : 'false',
        }),
      });
    } catch {
      /* הליד כבר נתפס בשלב 1, לא מפילים את החוויה */
    } finally {
      finish();
    }
  }

  function finish() {
    setSubmitting(false);
    setDone(true);
  }

  // ── מסך הצלחה ──────────────────────────────────────────────────
  if (done) {
    return (
      <div className="vc-success">
        <h3>קיבלנו את הפרטים ✅</h3>
        <p>
          {intent === 'report'
            ? 'תודה. הצוות שלנו יבדוק את האתר שלכם ידנית מול מנועי ה-AI, ונחזור אליכם בוואטסאפ עם דוח הנראות תוך 3 ימי עסקים, עם התמונה המלאה של איפה אתם עולים היום ואיפה לא.'
            : 'תודה. נחזור אליכם בוואטסאפ לתיאום שיחת GEO קצרה תוך יום עסקים, עם ניתוח ראשוני של הנוכחות שלכם במנועי ה-AI.'}
        </p>
      </div>
    );
  }

  // ── שלב 2, פרטים אופציונליים ───────────────────────────────────
  if (step === 2) {
    return (
      <form className="vc-form matana-form" onSubmit={submitStep2} noValidate>
        <div className="matana-step-head matana-field-full">
          <span className="matana-step-badge">שלב 2 מתוך 2</span>
          <h3 className="matana-step-title">מעולה, קלטנו את הפרטים ✅</h3>
          <p className="matana-step-sub">
            רוצים שנדייק את הפיילוט למותג שלכם? ספרו לנו עוד (לא חובה, אפשר גם לדלג ונשלים בשיחה).
          </p>
        </div>

        {STEP2.filter((f) => !(intent === 'report' && f.name === 'website')).map((f) => (
          <div className={['vc-field', f.full ? 'matana-field-full' : ''].filter(Boolean).join(' ')} key={f.name}>
            <label htmlFor={f.name}>
              {f.label} <span className="vc-optional">(לא חובה)</span>
            </label>
            {f.textarea ? (
              <textarea id={f.name} name={f.name} rows={3} placeholder={f.placeholder} value={data[f.name]} onChange={(e) => set(f.name, e.target.value)} />
            ) : (
              <input id={f.name} name={f.name} type={f.type || 'text'} inputMode={f.inputMode} placeholder={f.placeholder} value={data[f.name]} onChange={(e) => set(f.name, e.target.value)} />
            )}
            {f.hint && <span className="matana-hint">{f.hint}</span>}
          </div>
        ))}

        <div className="matana-step2-actions matana-field-full">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'שולח...' : 'סיום ושליחה'}
          </button>
          <button type="button" className="matana-modal-skip" onClick={finish}>דלג, נשלים אחר כך</button>
        </div>
      </form>
    );
  }

  // ── שלב 1, מה שחייבים ──────────────────────────────────────────
  return (
    <form className="vc-form matana-form" onSubmit={submitStep1} noValidate>
      <div className="matana-step-head matana-field-full">
        <span className="matana-step-badge">שלב 1 מתוך 2</span>
        <p className="matana-step-sub">הפרטים הבסיסיים, שנדע למי לחזור. 30 שניות.</p>
      </div>

      {/* בחירת כוונה, שיחה או דוח נראות */}
      <div className="geo-intent matana-field-full" role="radiogroup" aria-label="מה הכי מעניין אתכם">
        <button
          type="button"
          role="radio"
          aria-checked={intent === 'call'}
          className={['geo-intent-opt', intent === 'call' ? 'is-active' : ''].filter(Boolean).join(' ')}
          onClick={() => setIntent('call')}
        >
          רוצה לקבוע שיחת GEO
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={intent === 'report'}
          className={['geo-intent-opt', intent === 'report' ? 'is-active' : ''].filter(Boolean).join(' ')}
          onClick={() => setIntent('report')}
        >
          רוצה דוח נראות ב-AI, חינם
        </button>
      </div>

      {STEP1.map((f) => (
        <div className={['vc-field', errors[f.name] ? 'vc-field-error' : ''].filter(Boolean).join(' ')} key={f.name}>
          <label htmlFor={f.name}>
            {f.label} <span className="matana-required" aria-hidden="true">*</span>
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type || 'text'}
            autoComplete={f.autoComplete}
            inputMode={f.inputMode}
            placeholder={f.placeholder}
            value={data[f.name]}
            onChange={(e) => set(f.name, e.target.value)}
            aria-invalid={errors[f.name] || undefined}
          />
        </div>
      ))}

      {intent === 'report' && (
        <div className={['vc-field', 'matana-field-full', errors.website ? 'vc-field-error' : ''].filter(Boolean).join(' ')}>
          <label htmlFor="website">
            כתובת האתר לבדיקה <span className="matana-required" aria-hidden="true">*</span>
          </label>
          <input
            id="website"
            name="website"
            type="text"
            inputMode="url"
            placeholder="www.example.co.il"
            value={data.website}
            onChange={(e) => set('website', e.target.value)}
            aria-invalid={errors.website || undefined}
          />
          <span className="matana-hint">נבדוק את האתר ידנית מול מנועי ה-AI ונחזור אליכם בוואטסאפ עם הדוח.</span>
        </div>
      )}

      <label className="vc-consent matana-field-full">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          אני מאשר/ת קבלת חומר שיווקי ועדכונים מ-HELIX{' '}
          <span className="muted">(אנחנו לא מספמים, אבל החוק מחייב אותנו לבקש)</span>
        </span>
      </label>

      {/* honeypot */}
      <input type="text" name="company_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="vc-honeypot" value={company} onChange={(e) => setCompany(e.target.value)} />

      {formError && <p className="vc-error vc-error-form matana-field-full">{formError}</p>}

      <button type="submit" className="btn btn-primary matana-field-full" disabled={submitting}>
        {submitting ? 'שולח...' : intent === 'report' ? 'שלחו לי דוח נראות ב-AI' : 'קבעו לי שיחת GEO'}
      </button>
    </form>
  );
}
