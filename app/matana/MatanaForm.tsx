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
  { name: 'phone', label: 'טלפון', type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '05X-XXX-XXXX' },
  { name: 'email', label: 'אימייל', type: 'email', autoComplete: 'email', inputMode: 'email' },
  { name: 'business', label: 'שם העסק', type: 'text', autoComplete: 'organization' },
];

// שלב 2, פרטים שעוזרים לדייק את הכתבות. הכל אופציונלי.
const STEP2: Field[] = [
  { name: 'website', label: 'אתר / דומיין', inputMode: 'url', placeholder: 'www.example.co.il', hint: 'סורקים את התוכן שכבר יש לכם' },
  { name: 'field', label: 'תחום העיסוק', placeholder: 'למשל: קליניקת שיניים, ייעוץ משכנתאות' },
  { name: 'area', label: 'אזור גיאוגרפי', placeholder: 'למשל: גוש דן, כל הארץ, אונליין' },
  { name: 'audience', label: 'קהל היעד', placeholder: 'למי אתם מוכרים?' },
  { name: 'recommendFor', label: 'במה תרצו שה-AI ימליץ עליכם?', textarea: true, full: true, placeholder: 'איזו שאלה של לקוח הייתם רוצים שהתשובה שלה תהיה אתם?' },
  { name: 'notes', label: 'עוד משהו שכדאי שנדע', textarea: true, full: true, placeholder: 'מבדילים, יתרונות, כל דבר שיעזור לנו לכוון' },
];

const WA_PACKAGE = 'https://wa.me/972544468883?text=%D7%94%D7%99%D7%99%2C%20%D7%A8%D7%90%D7%99%D7%AA%D7%99%20%D7%90%D7%AA%20%D7%94%D7%A6%D7%A2%D7%AA%20%D7%94%D7%94%D7%9E%D7%A9%D7%9A%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%95%D7%93';

const empty = (): Record<string, string> =>
  [...STEP1, ...STEP2].reduce((a, f) => ({ ...a, [f.name]: '' }), {});

// מייל עסקי בלבד, חוסמים ספקי מייל חינמיים נפוצים.
const FREE_EMAIL = /@(gmail|googlemail|hotmail|outlook|yahoo|ymail|walla|icloud|live|aol|protonmail|me)\./i;
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneDigits = (v: string) => v.replace(/\D/g, '');

export default function MatanaForm({ endpoint = '/api/matana-lead' }: { endpoint?: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState<Record<string, string>>(empty());
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState(''); // honeypot
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [done, setDone] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

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
    // שדות ריקים
    for (const f of STEP1) if (!data[f.name].trim()) bad[f.name] = true;
    if (Object.keys(bad).length) msg = 'נא למלא את כל השדות.';
    // טלפון, 10 ספרות
    const digits = phoneDigits(data.phone);
    if (!bad.phone && (digits.length !== 10 || digits[0] !== '0')) {
      bad.phone = true;
      msg = 'מספר הטלפון חייב לכלול 10 ספרות (למשל 0541234567).';
    }
    // אימייל תקין ועסקי (לא Gmail/חינמי)
    const emailVal = data.email.trim().toLowerCase();
    if (!bad.email && !isEmail(emailVal)) {
      bad.email = true;
      msg = 'האימייל לא נראה תקין.';
    } else if (!bad.email && FREE_EMAIL.test(emailVal)) {
      bad.email = true;
      msg = 'נא להשתמש במייל עסקי (לא Gmail או מייל חינמי אחר).';
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
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
          business: data.business.trim(),
          consent: consent ? 'true' : 'false',
          company,
        }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (j.ok) {
        setStep(2);
      } else {
        const m: Record<string, string> = {
          invalid_email: 'האימייל לא נראה תקין.',
          free_email: 'נא להשתמש במייל עסקי (לא Gmail או מייל חינמי אחר).',
          invalid_phone: 'מספר הטלפון חייב לכלול 10 ספרות (למשל 0541234567).',
        };
        if (j.error === 'free_email') setErrors((e) => ({ ...e, email: true }));
        if (j.error === 'invalid_email') setErrors((e) => ({ ...e, email: true }));
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
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
          business: data.business.trim(),
          website: data.website.trim(),
          field: data.field.trim(),
          area: data.area.trim(),
          audience: data.audience.trim(),
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
    setModalOpen(true);
  }

  // ── מסך הצלחה + פופאפ הצעת ההמשך ──────────────────────────────
  if (done) {
    return (
      <>
        <div className="vc-success">
          <h3>קיבלנו את הפרטים 🎁</h3>
          <p>
            תודה! הצוות שלנו יעבור על העסק שלכם, יכין את שלושת התוצרים תומכי ה-GEO/AEO,
            ונחזור אליכם עם המתנה המוכנה עד 7 ימי עסקים (לרוב הרבה יותר מהר).
          </p>
        </div>

        {modalOpen && (
          <div className="matana-modal" role="dialog" aria-modal="true" aria-label="הצעת ההמשך">
            <button type="button" className="matana-modal-backdrop" aria-label="סגירה" onClick={() => setModalOpen(false)} />
            <div className="matana-modal-card">
              <button type="button" className="matana-modal-close" aria-label="סגירה" onClick={() => setModalOpen(false)}>×</button>
              <span className="matana-modal-emoji" aria-hidden="true">🚀</span>
              <h3 className="matana-modal-title">רוצים להמשיך את הכוח של GEO?</h3>
              <p className="matana-modal-intro">
                המתנה היא התחלה. <strong>חבילת דיגיטל ובינה מלאכותית</strong> היא ההמשך שגורם לזה לעבוד חודש אחרי חודש:
              </p>
              <ul className="matana-modal-list">
                <li>4 כתבות GEO בחודש (המשך ישיר של המתנה)</li>
                <li>פגישה שבועית בשיווק, פיתוח עסקי ו-AI</li>
                <li>2 אוטומציות וואטסאפ עם תמיכה חודשית</li>
                <li>תחזוקת אתר אינטרנטי</li>
                <li>מערכת CRM, כלולה בלי עלות</li>
              </ul>
              <p className="matana-modal-agency">
                סוכנויות גובות על זה ₪6,000-8,000 בחודש, ומול כמה ספקים. אצלכם, הכל במקום אחד:
              </p>
              <div className="matana-modal-price">
                <span className="matana-modal-was">₪8,000</span>
                <span className="matana-modal-now">₪2,000</span>
                <span className="matana-modal-per">לחודש</span>
              </div>
              <p className="matana-modal-free">🎁 החודש הראשון עלינו, מתחילים ב-₪0.</p>
              <p className="matana-modal-spots">המחיר הזה שמור ל-20 העסקים הראשונים שמצטרפים.</p>
              <a href={WA_PACKAGE} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                ספרו לי עוד על החבילה
              </a>
              <button type="button" className="matana-modal-skip" onClick={() => setModalOpen(false)}>אולי אחר כך</button>
            </div>
          </div>
        )}
      </>
    );
  }

  // ── שלב 2, פרטים אופציונליים ───────────────────────────────────
  if (step === 2) {
    return (
      <form className="vc-form matana-form" onSubmit={submitStep2} noValidate>
        <div className="matana-step-head matana-field-full">
          <span className="matana-step-badge">שלב 2 מתוך 2</span>
          <h3 className="matana-step-title">מעולה, המתנה שלכם משוריינת ✅</h3>
          <p className="matana-step-sub">
            רוצים שנדייק את הכתבות לעסק שלכם? ספרו לנו עוד (לא חובה, אפשר גם לדלג ונשלים בוואטסאפ).
          </p>
        </div>

        {STEP2.map((f) => (
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
        <p className="matana-step-sub">רק הפרטים הבסיסיים, שנדע למי לשלוח את המתנה. 30 שניות.</p>
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

      <label className="vc-consent matana-field-full">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          אני מאשר/ת קבלת חומר שיווקי ועדכונים מ-HELIX{' '}
          <span className="muted">(אנחנו לא מספמים, אבל החוק מחייב אותנו לבקש)</span>
        </span>
      </label>

      {/* honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="vc-honeypot" value={company} onChange={(e) => setCompany(e.target.value)} />

      {formError && <p className="vc-error vc-error-form matana-field-full">{formError}</p>}

      <button type="submit" className="btn btn-primary matana-field-full" disabled={submitting}>
        {submitting ? 'שולח...' : 'שריינו לי את המתנה 🎁'}
      </button>
    </form>
  );
}
