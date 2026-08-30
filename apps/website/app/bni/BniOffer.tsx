"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------------- Scratch-to-reveal price card (BNI: 1,499 + 349) ---------------- */
function ScratchReveal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const drawing = useRef(false);

  const doReveal = useCallback(() => {
    setRevealed((r) => (r ? r : true));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, "#12352a");
    g.addColorStop(1, "#0b1a22");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#8fd7bf";
    ctx.font = "700 16px var(--font-heebo, sans-serif)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = "rtl";
    ctx.fillText("גרדו כאן לחשיפת מחיר חברי BNI", rect.width / 2, rect.height / 2);

    let scratched = 0;
    const total = rect.width * rect.height;
    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
      scratched += Math.PI * 26 * 26;
      if (scratched / total > 0.4) doReveal();
    };
    const down = (e: PointerEvent) => {
      drawing.current = true;
      const { x, y } = pos(e);
      scratch(x, y);
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      const { x, y } = pos(e);
      scratch(x, y);
    };
    const up = () => (drawing.current = false);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [doReveal]);

  return (
    <div className="fr-scratch-wrap" ref={wrapRef}>
      <div className={"fr-price-face" + (revealed ? " is-revealed" : "")}>
        <span className="fr-price-was">15,000 ₪ בשוק</span>
        <div className="fr-price-nums">
          <div className="fr-price-col">
            <span className="fr-price-now">
              1,499 <span className="fr-price-cur">₪</span>
            </span>
            <span className="fr-price-label">הקמה חד-פעמית</span>
          </div>
          <div className="fr-price-div" aria-hidden="true" />
          <div className="fr-price-col">
            <span className="fr-price-now fr-price-now-sm">
              349 <span className="fr-price-cur">₪</span>
            </span>
            <span className="fr-price-label">לחודש</span>
          </div>
        </div>
      </div>
      {!revealed && (
        <canvas ref={canvasRef} className="fr-scratch-canvas" aria-hidden="true" />
      )}
      {!revealed && (
        <button type="button" className="fr-scratch-btn" onClick={doReveal}>
          או לחצו לחשיפה
        </button>
      )}
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function BniOffer() {
  const [entered, setEntered] = useState(false);
  const [opening, setOpening] = useState(false);
  const [inviteRef, setInviteRef] = useState<string | null>(null);

  // capture the inviter's signature from the link (?ref= / ?sig= / ?s=)
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const r = (p.get("ref") || p.get("sig") || p.get("s") || "").trim().slice(0, 40);
      if (r) setInviteRef(r);
    } catch {
      /* ignore */
    }
  }, []);

  const enterDoor = useCallback(() => {
    setOpening(true);
    if (typeof window !== "undefined") {
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.setTimeout(() => setEntered(true), reduce ? 0 : 900);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

  // reveal-on-scroll, with two safety nets so nothing stays hidden
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    const nearFold = window.setTimeout(() => {
      els.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
      });
    }, 1000);
    const lastResort = window.setTimeout(() => els.forEach((el) => el.classList.add("in")), 9000);
    return () => {
      clearTimeout(nearFold);
      clearTimeout(lastResort);
      io.disconnect();
    };
  }, []);

  const automations = [
    { t: "קליטה אוטומטית", d: "פנייה חדשה נכנסת, ומקבלת מיד הודעה, טופס פרטים ותיאום ראשוני. בלי מרדף." },
    { t: "תזכורות ופגישות", d: "תיאום פגישות ותזכורות אוטומטיות, כדי שאף פגישה ואף לקוח לא ייפלו." },
    { t: "שמירה על קשר", d: "נגיעות תקופתיות, ברכות ויום הולדת, שמחזירות לקוחות ושומרות אתכם בראש." },
    { t: "טפסים ואיסוף מידע", d: "שאלונים וטפסים דיגיטליים בוואטסאפ, והתשובות נכנסות ישר למערכת שלכם." },
  ];

  const ladder = [
    { n: "2 מהצ'פטר", r: "נועלים 349 ₪ לתמיד", hot: false },
    { n: "3 חברים", r: "המנוי יורד ל-249 ₪", hot: false },
    { n: "4 חברים", r: "המנוי יורד ל-149 ₪", hot: false },
    { n: "5 חברים", r: "המנוי עלינו, 0 ₪", hot: true },
    { n: "6 ומעלה", r: "מרוויחים כ-100 ₪ בחודש על כל חבר פעיל", hot: false },
  ];

  const faq = [
    { q: "מה עם ה-CRM שלנו?", a: "נשאר שלכם, בדיוק כמו שהוא. אנחנו מתחברים אליו, לא מחליפים אותו." },
    { q: "איך זה מתחבר להפניות שאני מקבל בצ'פטר?", a: "ברגע שאתם מזינים הפניה, יוצאת אוטומטית הודעת וואטסאפ חמה ללקוח, כדי שלא תאבדו אותה. אפשר לחבר את זה גם לטופס או לאפליקציה שאתם כבר עובדים איתם." },
    { q: "מה זה עלויות צד שלישי?", a: "תשתית הוואטסאפ (heyy.io, MAKE) משולמת על ידכם ישירות לספקים, כמו שאתם רגילים. לא חלק מהמחיר שלנו." },
    { q: "ומה אם לא נביא חברים מהצ'פטר?", a: "אחרי 3 חודשים המחיר עולה ל-450 ₪ בחודש. עדיין זול בהרבה מהשוק." },
    { q: "כמה זמן ההקמה לוקחת?", a: "5 עד 6 שבועות מהאפיון ועד עלייה לאוויר, כולל בדיקות והדרכה." },
    { q: "מי מתחזק את זה?", a: "אנחנו. המנוי החודשי כולל תחזוקה שוטפת וטיפול בתקלות בעדיפות." },
  ];

  const timeline = [
    "אפיון והקמת וואטסאפ עסקי רשמי מול Meta",
    "אוטומציית פולואפ מיידי לכל הפניה שנכנסת",
    "קליטה אוטומטית, תיאום פגישות ותזכורות",
    "שמירה על קשר, ברכות וטפסים לאיסוף מידע",
    "בדיקות מקצה לקצה, הדרכה ועלייה לאוויר",
  ];

  const waText =
    "היי, הגענו דרך הדלת הסודית של הליקס לחברי BNI. אנחנו רוצים לשמוע על המחיר" +
    (inviteRef ? ` (הוזמנו על ידי חבר מהצ'פטר, קוד: ${inviteRef})` : "");
  const WA = "https://wa.me/972544468883?text=" + encodeURIComponent(waText);

  return (
    <main dir="rtl" className="fr">
      {/* SECRET DOOR INTRO */}
      {!entered && (
        <div
          className={"fr-door" + (opening ? " is-open" : "")}
          role="dialog"
          aria-modal="true"
          aria-label="הכניסה לחברי BNI"
        >
          <div className="fr-door-panel fr-door-left" aria-hidden="true" />
          <div className="fr-door-panel fr-door-right" aria-hidden="true" />
          <div className="fr-door-center">
            <svg className="fr-door-lock" viewBox="0 0 24 24" width="56" height="56" fill="none" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="15.4" r="1.7" fill="currentColor" />
            </svg>
            <span className="fr-door-title">לחברי BNI בלבד</span>
            <span className="fr-door-hint">הצעה שלא תמצאו באתר (ובשום מקום אחר)</span>
            <button type="button" className="fr-door-enter" onClick={enterDoor} autoFocus>
              לחצו כדי להיכנס
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="fr-hero">
        {inviteRef && <span className="fr-invited">הוזמנתם על ידי חבר מהצ'פטר</span>}
        <span className="fr-eyebrow">הצעה סגורה · לחברי BNI</span>
        <h1 className="fr-h1">
          Givers Gain, עכשיו <span className="fr-grad">אוטומטי</span>.
        </h1>
        <p className="fr-sub">
          אוטומציות וואטסאפ שדואגות להפניות, ללקוחות ולמעקבים שלכם, מחוברות למערכות שכבר יש לכם. לא מחליפים כלום.
        </p>
        <p className="fr-sub fr-sub-why">
          ולמה במחיר כזה? כי הדרך הכי טובה שלנו לגדול היא שחברי BNI טובים ימליצו הלאה. אתם מקבלים מחיר חבר, אנחנו מקבלים חבר.
        </p>
      </section>

      {/* WE ARE BNI TOO */}
      <section className="fr-us" data-reveal>
        <div className="fr-us-grid">
          <img className="fr-us-photo" src="/about-team.png" alt="ערן ליפשטיין ורון קלי, המייסדים של הליקס" />
          <div className="fr-us-text">
            <span className="fr-us-tag">אנחנו חברי BNI · סניף הוד השרון</span>
            <h2 className="fr-h2">אנחנו חברים שלכם, לא מוכרים מבחוץ</h2>
            <p>
              שני חברים שחברים ב-BNI בעצמם, יושבים באותם מפגשי בוקר ומכירים את Givers Gain מבפנים.
              החלטנו שמגיע לעסקים קטנים בדיוק הכלים של הגדולים, בלי המחירים של הגדולים.
              אנחנו לא עוד חברת תוכנה מרוחקת, אנחנו האנשים שעונים לכם בוואטסאפ. וזה בדיוק למה ההצעה הזאת קיימת.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="fr-autos" data-reveal>
        <h2 className="fr-h2">מה אתם מקבלים</h2>
        <p className="fr-autos-lead">
          שכבה אחת של אוטומציות וואטסאפ, מחוברת ל-CRM ולכלים שכבר עובדים אצלכם.
        </p>
        <div className="fr-auto-featured">
          <span className="fr-auto-tag">חדש · לחברי BNI</span>
          <h3>פולואפ מיידי לכל הפניה</h3>
          <p>
            קיבלתם הפניה בצ'פטר? באותו רגע יוצאת הודעת וואטסאפ חמה ללקוח. אף הפניה לא מתקררת,
            ו-Givers Gain עובד בשבילכם על אוטומט.
          </p>
        </div>
        <div className="fr-autos-grid">
          {automations.map((a, i) => (
            <div key={a.t} className="fr-auto-card">
              <div className="fr-auto-num">{i + 1}</div>
              <h3>{a.t}</h3>
              <p>{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GIFTS: two CRMs */}
      <section className="fr-gift" data-reveal>
        <h2 className="fr-h2 fr-gift-intro">וזה עוד לפני המחיר, שני CRM במתנה</h2>

        {/* HELIX free CRM */}
        <div className="fr-gift-band">
          <span className="fr-gift-tag">מתנה · CRM מלא בחינם</span>
          <h3 className="fr-gift-h">ה-CRM של הליקס</h3>
          <p>ה-CRM החינמי של הליקס, בעברית מלאה ו-RTL אמיתי. כל הלקוחות, העסקאות וההפניות במקום אחד.</p>
          <ul className="fr-gift-list">
            <li><strong>CRM מלא, חינם לתמיד.</strong> אנשי קשר, עסקאות, משימות ופעילויות, בשיטת HubSpot.</li>
            <li><strong>סריקת כרטיסי ביקור.</strong> חזרתם מהמפגש עם עשרים כרטיסים? צלמו, וכל אחד הופך לליד מנוקד.</li>
            <li><strong>תיאום פגישות בעברית.</strong> דף מחובר ליומן, תזכורת בוואטסאפ, בלי Calendly נפרד.</li>
          </ul>
        </div>

        {/* GRAIN CRM */}
        <div className="fr-gift-band fr-gift-band-2">
          <span className="fr-gift-tag">מתנה · לשטח, לנטוורקינג</span>
          <h3 className="fr-gift-h">וגם GRAIN CRM</h3>
          <p>ה-CRM שבנינו במיוחד למפגשי נטוורקינג וכנסים, לנהל את הקשרים וההפניות מהצ'פטר.</p>
          <ul className="fr-gift-list">
            <li><strong>Mobile-First.</strong> נבנה לשימוש מהנייד תוך כדי המפגש, לא מהמחשב שעתיים אחרי.</li>
            <li><strong>מתחבר להכל.</strong> לכל CRM קיים, ל-Google Sheets, או ל-CRM החינמי של הליקס שלמעלה.</li>
          </ul>
        </div>
      </section>

      {/* PRICE: market check + scratch reveal */}
      <section className="fr-price" data-reveal>
        <h2 className="fr-h2">כבר בדקנו כמה זה עולה בשוק</h2>
        <p className="fr-lead">
          זו הצעת מחיר אמיתית שחבר שלנו קיבל מחברה אחרת, על בדיוק אותו מערך אוטומציות. כ-15,000 ₪ רק על ההקמה.
        </p>
        <a className="fr-quote" href="/market-quote.jpg" target="_blank" rel="noopener noreferrer">
          <img src="/market-quote.jpg" alt="הצעת מחיר שהתקבלה מחברה אחרת, סכום הקמה כ-15,000 שקל" />
          <div className="fr-quote-blur" aria-hidden="true" />
          <span className="fr-quote-tag">הצעה אמיתית שהתקבלה · לחצו להגדלה</span>
        </a>
        <p className="fr-quote-cap">ועכשיו גרדו, ותראו כמה זה עולה לחברי BNI:</p>
        <ScratchReveal />
        <p className="fr-price-note">
          עלויות הכלים (heyy.io, MAKE) משולמות על ידכם ישירות לספקים, בנפרד. הן לא חלק מהתמורה להליקס.
        </p>
      </section>

      {/* MONEY BURNING VIDEO */}
      <section className="fr-burn" data-reveal>
        <video className="fr-burn-video" src="/burning-money.mp4" autoPlay muted loop playsInline aria-hidden="true" />
        <h2 className="fr-h2">הפניה שמתקררת, נשרפת</h2>
        <p className="fr-burn-text">
          חבר מהצ'פטר נתן לכם הפניה, ולא חזרתם אליה מספיק מהר? היא כבר אצל מישהו אחר.
          Givers Gain עובד רק כשדואגים להפניה בזמן, וזה בדיוק מה שהאוטומט עושה בשבילכם.
        </p>
      </section>

      {/* WHY DIFFERENT */}
      <section className="fr-why" data-reveal>
        <p className="fr-why-line">
          כבר יש לכם מערכות ויש לכם צ'פטר. אנחנו לא מחליפים כלום, אנחנו נותנים לזה ידיים ורגליים בוואטסאפ.
          אתם לא קונים עוד תוכנה, אתם נותנים לעסק שלכם לעבוד בשבילכם.
        </p>
      </section>

      {/* VIRAL MECHANISM */}
      <section className="fr-viral" data-reveal>
        <h2 className="fr-h2">איך שומרים על המחיר הזה</h2>
        <div className="fr-viral-steps">
          <div className="fr-vs">
            <strong>נועלים ל-3 חודשים</strong>
            <span>המחיר של 349 ₪ שלכם, מובטח לתחילת הדרך.</span>
          </div>
          <div className="fr-vs">
            <strong>מביאים 2 מהצ'פטר</strong>
            <span>בתוך שלושת החודשים, שני חברים מהצ'פטר מצטרפים באותו מחיר.</span>
          </div>
          <div className="fr-vs fr-vs-hot">
            <strong>נועלים 349 לתמיד</strong>
            <span>צמוד מדד. לא הבאתם? המחיר עולה ל-450, עדיין זול.</span>
          </div>
        </div>
      </section>

      {/* LADDER */}
      <section className="fr-ladder" data-reveal>
        <h2 className="fr-h2">וזה רק מתחיל להשתלם</h2>
        <div className="fr-ladder-list">
          {ladder.map((row) => (
            <div key={row.n} className={"fr-lrow" + (row.hot ? " is-hot" : "")}>
              <span className="fr-lrow-n">{row.n}</span>
              <span className="fr-lrow-r">{row.r}</span>
            </div>
          ))}
        </div>
        <p className="fr-ladder-cap">את 2 הראשונים מביאים מהצ'פטר, ומשם כל חבר נספר, גם מחוץ ל-BNI. מהחבר החמישי המערכת משלמת על עצמה ומתחילה להכניס לכם.</p>
      </section>

      {/* TIMELINE */}
      <section className="fr-timeline" data-reveal>
        <h2 className="fr-h2">לוח זמנים, 5 עד 6 שבועות</h2>
        <ol className="fr-tl">
          {timeline.map((t, i) => (
            <li key={i}>
              <span className="fr-tl-num">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section className="fr-faq" data-reveal>
        <h2 className="fr-h2">שאלות שכדאי לשאול</h2>
        <div className="fr-faq-list">
          {faq.map((f) => (
            <details key={f.q} className="fr-faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA - WhatsApp only */}
      <section className="fr-final" data-reveal>
        <h2 className="fr-h2">רוצים להיכנס פנימה?</h2>
        <p className="fr-final-lead">שיחת וואטסאפ אחת, ואתם בפנים. בלי טפסים, בלי התחייבות.</p>
        <a className="fr-btn-primary" href={WA} target="_blank" rel="noopener noreferrer">
          דברו איתנו בוואטסאפ ←
        </a>
        <p className="fr-final-note">ההצעה סגורה לחברי BNI בלבד. הצעה מבית הליקס, ללא קשר רשמי ל-BNI.</p>
      </section>

      {/* STICKY */}
      <div className="fr-sticky">
        <span>מחיר BNI: 1,499 הקמה + 349 לחודש</span>
        <a href={WA} target="_blank" rel="noopener noreferrer">וואטסאפ, רוצים פנימה</a>
      </div>

      <style>{`
        .fr {
          --brand: #10B981; --brand-2: #34D399;
          --bg: #0d0f0e; --surface: #161918;
          --ink: #E6E8E6; --ink-2: #B7C6BC; --ink-muted: #7E8C83;
          --border: rgba(255,255,255,0.09);
          background:
            radial-gradient(1100px 520px at 50% -8%, rgba(16,185,129,0.12), transparent 60%),
            var(--bg);
          color: var(--ink);
          font-family: var(--font-heebo, system-ui, sans-serif);
          padding-bottom: 84px;
          overflow-x: clip;
        }
        .fr section { max-width: 820px; margin: 0 auto; padding: 44px 22px; }
        .fr-h1 { font-family: var(--font-display, inherit); font-size: clamp(34px, 7vw, 64px); font-weight: 900; line-height: 1.06; letter-spacing: -0.03em; margin: 0 0 16px; }
        .fr-h2 { font-family: var(--font-display, inherit); font-size: clamp(24px, 4vw, 34px); font-weight: 900; letter-spacing: -0.02em; margin: 0 0 10px; }
        .fr-grad { background: linear-gradient(120deg, var(--brand-2), var(--brand)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .fr-lead { color: var(--ink-2); font-size: 16px; max-width: 560px; margin: 0 auto 22px; line-height: 1.55; }

        /* SECRET DOOR INTRO */
        .fr-door { position: fixed; inset: 0; z-index: 200; overflow: hidden; background: #0b0d0c; }
        .fr-door-panel { position: absolute; top: 0; bottom: 0; width: 50.5%; background: linear-gradient(180deg, #12281f 0%, #0b1712 60%, #0a1310 100%); transition: transform .9s cubic-bezier(.76,0,.24,1); will-change: transform; }
        .fr-door-left { left: 0; box-shadow: inset -40px 0 80px rgba(0,0,0,.55); }
        .fr-door-right { right: 0; box-shadow: inset 40px 0 80px rgba(0,0,0,.55); }
        .fr-door-left::after, .fr-door-right::after { content: ""; position: absolute; top: 10%; bottom: 10%; width: 2px; background: linear-gradient(180deg, transparent, rgba(16,185,129,.55), transparent); }
        .fr-door-left::after { right: 0; }
        .fr-door-right::after { left: 0; }
        .fr-door.is-open .fr-door-left { transform: translateX(-100%); }
        .fr-door.is-open .fr-door-right { transform: translateX(100%); }
        .fr-door-center { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 14px; text-align: center; padding: 30vh 24px 24px; transition: opacity .4s ease, transform .4s ease; }
        .fr-door.is-open .fr-door-center { opacity: 0; transform: scale(1.08); }
        .fr-door-lock { color: var(--brand-2); filter: drop-shadow(0 0 16px rgba(16,185,129,.5)); animation: frglow 2.4s ease-in-out infinite; }
        @keyframes frglow { 0%,100%{opacity:.85} 50%{opacity:1} }
        .fr-door-title { font-family: var(--font-display, inherit); font-size: clamp(28px, 6vw, 48px); font-weight: 900; letter-spacing: -0.02em; }
        .fr-door-hint { font-size: 14px; color: var(--ink-muted); margin-top: -4px; }
        .fr-door-enter { margin-top: 8px; background: var(--brand); color: #06231A; font-weight: 800; font-size: 17px; border: 0; border-radius: 999px; padding: 15px 42px; cursor: pointer; animation: frpulse 2s ease-out infinite; min-height: 48px; }
        .fr-door-enter:hover { transform: translateY(-2px); }
        @keyframes frpulse { 0%{box-shadow:0 0 0 0 rgba(16,185,129,.45)} 70%{box-shadow:0 0 0 18px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
        @media (prefers-reduced-motion: reduce) { .fr-door-panel { transition: none; } .fr-door-enter, .fr-door-lock { animation: none; } }

        /* reveal on scroll */
        [data-reveal] { opacity: 0; transform: translateY(30px); transition: opacity .7s ease, transform .7s cubic-bezier(.2,.7,.2,1); }
        [data-reveal].in { opacity: 1; transform: none; }
        @media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1; transform: none; transition: none; } }

        /* HERO */
        .fr-hero { text-align: center; padding-top: 92px; padding-bottom: 20px; }
        .fr-invited { display: block; width: max-content; max-width: 100%; margin: 0 auto 12px; font-size: 13px; font-weight: 800; color: #06231A; background: var(--brand-2); padding: 7px 16px; border-radius: 999px; }
        .fr-eyebrow { display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: 0.03em; color: var(--brand-2); background: color-mix(in srgb, var(--brand) 14%, transparent); border: 1px solid color-mix(in srgb, var(--brand) 30%, transparent); padding: 6px 15px; border-radius: 999px; margin-bottom: 18px; }
        .fr-sub { font-size: clamp(16px, 2.2vw, 19px); color: var(--ink-2); max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .fr-sub-why { margin-top: 12px; color: var(--ink-muted); font-size: 16px; }

        /* AUTOMATIONS */
        .fr-autos { text-align: center; }
        .fr-autos-lead { color: var(--ink-2); font-size: 16px; max-width: 560px; margin: 0 auto 22px; line-height: 1.55; }
        .fr-auto-featured { text-align: start; background: color-mix(in srgb, var(--brand) 10%, var(--surface)); border: 1px solid color-mix(in srgb, var(--brand) 45%, transparent); border-radius: 16px; padding: 22px 20px; margin-bottom: 14px; }
        .fr-auto-featured h3 { font-size: 19px; font-weight: 900; margin: 8px 0 6px; }
        .fr-auto-featured p { font-size: 15px; color: var(--ink-2); line-height: 1.55; margin: 0; }
        .fr-auto-tag { display: inline-block; font-size: 11px; font-weight: 800; color: #06231A; background: var(--brand-2); padding: 4px 10px; border-radius: 999px; }
        .fr-autos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; text-align: start; }
        .fr-auto-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px 18px; transition: transform .2s ease, border-color .2s ease; }
        .fr-auto-card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--brand) 40%, transparent); }
        .fr-auto-num { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 10px; background: color-mix(in srgb, var(--brand) 16%, transparent); color: var(--brand-2); font-weight: 900; margin-bottom: 11px; }
        .fr-auto-card h3 { font-size: 17px; font-weight: 800; margin: 0 0 6px; }
        .fr-auto-card p { font-size: 14px; color: var(--ink-2); line-height: 1.5; margin: 0; }

        /* WE ARE BNI TOO */
        .fr-us-grid { display: grid; grid-template-columns: 0.85fr 1fr; gap: 26px; align-items: center; text-align: start; }
        .fr-us-photo { width: 100%; height: auto; display: block; border-radius: 18px; border: 1px solid var(--border); }
        .fr-us-tag { display: inline-block; font-size: 12px; font-weight: 800; letter-spacing: .02em; color: var(--brand-2); background: color-mix(in srgb, var(--brand) 14%, transparent); border: 1px solid color-mix(in srgb, var(--brand) 30%, transparent); padding: 6px 13px; border-radius: 999px; margin-bottom: 12px; }
        .fr-us-text p { color: var(--ink-2); font-size: 16px; line-height: 1.6; margin: 10px 0 0; }

        /* GIFTS */
        .fr-gift { text-align: center; }
        .fr-gift-intro { margin-bottom: 16px; }
        .fr-gift-band-2 { margin-top: 14px; }
        .fr-gift-band { text-align: start; background: linear-gradient(135deg, color-mix(in srgb, var(--brand) 16%, var(--surface)), var(--surface)); border: 1px solid color-mix(in srgb, var(--brand) 45%, transparent); border-radius: 18px; padding: 26px 22px; }
        .fr-gift-tag { display: inline-block; font-size: 11px; font-weight: 800; color: #06231A; background: var(--brand-2); padding: 4px 11px; border-radius: 999px; }
        .fr-gift-h { font-family: var(--font-display, inherit); font-size: clamp(22px, 4vw, 30px); font-weight: 900; margin: 10px 0 8px; }
        .fr-gift-band p { color: var(--ink-2); font-size: 15px; line-height: 1.55; margin: 0; max-width: 620px; }
        .fr-gift-list { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 10px; }
        .fr-gift-list li { position: relative; padding-inline-start: 26px; color: var(--ink-2); font-size: 15px; line-height: 1.5; }
        .fr-gift-list li::before { content: "✓"; position: absolute; inset-inline-start: 0; color: var(--brand-2); font-weight: 900; }
        .fr-gift-list strong { color: var(--ink); }

        /* PRICE + SCRATCH */
        .fr-price { text-align: center; }
        .fr-quote { display: block; position: relative; width: min(720px, 100%); margin: 0 auto 8px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 20px 55px rgba(0,0,0,0.5); transform: rotate(-0.8deg); cursor: zoom-in; transition: transform .25s ease; }
        .fr-quote:hover { transform: rotate(0deg) scale(1.02); }
        .fr-quote img { display: block; width: 100%; height: auto; }
        .fr-quote-blur { position: absolute; top: 0; inset-inline: 0; height: 17%; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); background: linear-gradient(to bottom, rgba(20,22,20,0.3), rgba(20,22,20,0)); }
        .fr-quote-tag { position: absolute; top: 9px; inset-inline-start: 9px; z-index: 2; background: rgba(6,35,26,0.85); color: var(--brand-2); font-size: 11px; font-weight: 800; padding: 5px 11px; border-radius: 999px; letter-spacing: .02em; }
        .fr-quote-cap { margin: 14px auto 18px; font-size: 15px; color: var(--ink); font-weight: 700; max-width: 460px; }
        .fr-scratch-wrap { position: relative; width: min(440px, 100%); margin: 0 auto; height: 200px; border-radius: 20px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 18px 50px rgba(0,0,0,0.4); }
        .fr-price-face { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(150deg, #12352a, #0c1a15); }
        .fr-price-was { font-size: 13px; color: var(--ink-muted); text-decoration: line-through; }
        .fr-price-nums { display: flex; align-items: center; gap: 18px; }
        .fr-price-col { display: flex; flex-direction: column; align-items: center; gap: 2px; }
        .fr-price-div { width: 1px; height: 46px; background: var(--border); }
        .fr-price-now { font-family: var(--font-display, inherit); font-size: clamp(38px, 9vw, 56px); font-weight: 900; color: var(--brand-2); line-height: 1; }
        .fr-price-now-sm { font-size: clamp(30px, 7vw, 44px); }
        .fr-price-face.is-revealed .fr-price-now { animation: frstamp .5s cubic-bezier(.2,1.4,.3,1) both; }
        @keyframes frstamp { 0%{transform:scale(1.5) rotate(-6deg);opacity:0} 60%{transform:scale(.94);opacity:1} 100%{transform:none} }
        .fr-price-cur { font-size: 0.5em; }
        .fr-price-label { font-size: 12px; color: var(--ink-2); }
        .fr-scratch-canvas { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; touch-action: none; }
        .fr-scratch-btn { position: absolute; bottom: 10px; inset-inline: 0; margin: 0 auto; width: max-content; background: rgba(0,0,0,0.4); color: var(--ink-2); border: 1px solid var(--border); border-radius: 999px; padding: 6px 15px; font-size: 12px; cursor: pointer; }
        .fr-scratch-btn:hover { color: var(--ink); }
        .fr-price-note { margin-top: 18px; font-size: 13px; color: var(--ink-muted); max-width: 600px; margin-inline: auto; line-height: 1.55; }

        /* MONEY BURNING */
        .fr-burn { text-align: center; }
        .fr-burn-video { width: min(320px, 74%); height: auto; margin: 0 auto 10px; display: block; border-radius: 14px; }
        .fr-burn-text { color: var(--ink-2); font-size: 16px; max-width: 580px; margin: 0 auto; line-height: 1.55; }

        /* WHY */
        .fr-why-line { font-size: clamp(19px, 3vw, 26px); font-weight: 700; line-height: 1.45; max-width: 700px; margin: 0 auto; letter-spacing: -0.01em; color: var(--ink); border-inline-start: 3px solid var(--brand); padding-inline-start: 20px; text-align: start; }

        /* VIRAL */
        .fr-viral { text-align: center; }
        .fr-viral-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-top: 20px; text-align: start; }
        .fr-vs { background: var(--surface); border: 1px solid var(--border); border-radius: 15px; padding: 18px 18px; display: flex; flex-direction: column; gap: 6px; }
        .fr-vs strong { font-size: 16px; }
        .fr-vs span { font-size: 13px; color: var(--ink-2); line-height: 1.5; }
        .fr-vs-hot { border-color: color-mix(in srgb, var(--brand) 50%, transparent); background: color-mix(in srgb, var(--brand) 10%, var(--surface)); }

        /* LADDER */
        .fr-ladder { text-align: center; }
        .fr-ladder-list { display: grid; gap: 8px; margin-top: 20px; max-width: 540px; margin-inline: auto; }
        .fr-lrow { display: flex; justify-content: space-between; align-items: center; gap: 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 20px; text-align: start; }
        .fr-lrow-n { font-weight: 800; font-size: 15px; white-space: nowrap; }
        .fr-lrow-r { color: var(--ink-2); font-size: 14px; }
        .fr-lrow.is-hot { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 16%, var(--surface)); }
        .fr-lrow.is-hot .fr-lrow-r { color: var(--brand-2); font-weight: 700; }
        .fr-ladder-cap { margin-top: 18px; font-size: 15px; color: var(--ink); font-weight: 600; }

        /* TIMELINE */
        .fr-tl { list-style: none; padding: 0; margin: 20px 0 0; display: grid; gap: 9px; }
        .fr-tl li { display: flex; align-items: center; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 13px 18px; font-size: 15px; color: var(--ink-2); }
        .fr-tl-num { flex: none; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 8px; background: color-mix(in srgb, var(--brand) 16%, transparent); color: var(--brand-2); font-weight: 900; font-size: 14px; }

        /* FAQ */
        .fr-faq-list { display: flex; flex-direction: column; gap: 9px; margin-top: 18px; }
        .fr-faq-item { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 2px 18px; }
        .fr-faq-item summary { cursor: pointer; font-weight: 700; font-size: 15px; padding: 14px 0; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .fr-faq-item summary::after { content: "+"; color: var(--brand-2); font-size: 22px; font-weight: 400; }
        .fr-faq-item[open] summary::after { content: "−"; }
        .fr-faq-item p { color: var(--ink-2); line-height: 1.55; margin: 0 0 14px; font-size: 14px; }

        /* FINAL */
        .fr-final { text-align: center; }
        .fr-final-lead { color: var(--ink-2); font-size: 16px; margin: 0 auto 22px; max-width: 460px; line-height: 1.55; }
        .fr-btn-primary { display: inline-block; text-decoration: none; background: var(--brand); color: #06231A; font-weight: 800; font-size: 18px; padding: 16px 40px; border: 0; border-radius: 14px; cursor: pointer; transition: transform .15s ease, box-shadow .15s ease; min-height: 48px; }
        .fr-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px color-mix(in srgb, var(--brand) 35%, transparent); }
        .fr-final-note { margin-top: 16px; font-size: 13px; color: var(--ink-muted); }

        /* STICKY */
        .fr-sticky { position: fixed; bottom: 0; inset-inline: 0; z-index: 50; background: rgba(13,15,14,0.92); backdrop-filter: blur(12px); border-top: 1px solid var(--border); display: flex; justify-content: center; align-items: center; gap: 16px; padding: 11px 18px; flex-wrap: wrap; }
        .fr-sticky span { font-size: 13px; color: var(--ink-2); font-weight: 600; }
        .fr-sticky a { background: var(--brand); color: #06231A; font-weight: 800; padding: 9px 20px; border-radius: 10px; text-decoration: none; font-size: 14px; min-height: 44px; display: inline-flex; align-items: center; }

        /* MOBILE */
        @media (max-width: 720px) {
          .fr section { padding: 34px 18px; }
          .fr-autos-grid, .fr-viral-steps, .fr-us-grid { grid-template-columns: 1fr; }
          .fr-hero { padding-top: 84px; }
        }
      `}</style>
    </main>
  );
}
