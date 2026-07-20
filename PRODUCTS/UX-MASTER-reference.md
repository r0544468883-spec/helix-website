# HELIX — מסמך UX מאסטר (Reference + Checklist)

> מסמך-על שמלווה **כל פרויקט** שנבנה. מבוסס על טקסונומיית **pageflows.com** (ספריית ~100k הקלטות user-flows מאפליקציות מובילות) + סטנדרטי ה-UX של HELIX (CLAUDE.md).
> תאריך: 2026-07-17. שימוש: לכל מוצר יורד ממנו **מסמך UX ייעודי** — עוברים על כל flow/screen/element ומסמנים "נדרש / קיים / חסר".

---

## 0. איך משתמשים במסמך הזה
1. לכל מוצר חדש → פותחים מסמך UX ייעודי (`<product>-UX.md`).
2. עוברים על 4 החלקים (Flows · Screens · Elements · Emails) ומסמנים לכל פריט: **נדרש? · קיים? · חסר?**
3. מוודאים את **הסטנדרטים החוצי-מערכת** (חלק ה' — states, נגישות, RTL, מובייל, היוריסטיקות).
4. מתמקדים ב-**Onboarding** (חלק ו') — הכי קריטי לאימוץ.

**4 הצירים של pageflows:** פלטפורמה (iOS · Android · Web · Email) × סוג תוכן (Flows · Screens · Elements · Emails), עם תיוג לפי מוצר/תעשייה/צבע.

---

## חלק א' — FLOW types (מסעות משתמש) ✅ צ'קליסט
לכל flow: האם המוצר צריך אותו? האם הוא מעוצב?

### ניהול חשבון (Account Management)
- [ ] הרשמה (Signing Up) · [ ] התחברות (Logging In) · [ ] התנתקות (Logging Out)
- [ ] איפוס סיסמה (Resetting Password) · [ ] אימות (Verifying)
- [ ] עריכת פרופיל (Editing Profile) · [ ] החלפת חשבון (Switching Account)
- [ ] שדרוג (Upgrading) · [ ] הורדת דרגה/ביטול מנוי (Downgrading & Canceling)
- [ ] השבתה/מחיקה (Deactivating & Deleting) · [ ] שחזור (Reactivating & Restoring)

### אונבוארדינג ולמידה
- [ ] **Onboarding** (חוויית משתמש ראשון) · [ ] Tutorials/הדרכות

### תוכן (Content) — הפעולות המרכזיות של המוצר
- [ ] יצירה והוספה · [ ] עריכה ועדכון · [ ] מחיקה והסרה · [ ] ניהול (Managing)
- [ ] חיפוש ומציאה · [ ] סינון ומיון · [ ] בחירה
- [ ] העלאה/הורדה · [ ] ייבוא/ייצוא · [ ] שמירה למועדפים/אוסף
- [ ] הגדרות והתאמה · [ ] שליחה והגשה (Submitting) · [ ] בקשה (Requesting)
- [ ] התחלה והשלמה (Starting & Completing) · [ ] תיעוד ומעקב · [ ] ניתוח נתונים (Stats)
- [ ] שכפול · [ ] העברה · [ ] נעיצה · [ ] ארכוב · [ ] סריקה

### חברתי (Social)
- [ ] הזמנה/הוספת חברים · [ ] הצטרפות · [ ] שיתוף
- [ ] תגובות ותשובות · [ ] צ'אט והודעות · [ ] שיחות
- [ ] מעקב/הרשמה (Following) · [ ] דירוג וביקורת · [ ] דיווח · [ ] חסימה · [ ] משוב

### עסקאות ורכישות (Transactions)
- [ ] רכישה והזמנה · [ ] Checkout · [ ] הזמנת מקום (Booking)
- [ ] ביטול/החזר · [ ] העברה/הפקדה · [ ] מימוש (Redeeming) · [ ] המרה

### שונות
- [ ] דפדוף כללי · [ ] צפייה · [ ] הסכמה לתנאים · [ ] הגדרה ראשונית (Setting Up)
- [ ] הפעלה/כיבוי (Enabling) · [ ] חיבור/קישור (Connecting) · [ ] עזרה ותמיכה

**Popular flows (pageflows):** Onboarding · Signup · Login · Password reset · Checkout · Search · Booking · Chat · Buying · Adding.

---

## חלק ב' — SCREEN types (מסכים)
- [ ] **Authentication & Security** — הרשמה, התחברות, שכחתי סיסמה, אימות
- [ ] **User Profile & Settings** — פרופיל, הגדרות, העדפות
- [ ] **Content Creation & Management** — יצירה/עריכה של נכסי המוצר
- [ ] **Search & Discovery** — חיפוש, תוצאות, סינון
- [ ] **Navigation & Organization** — ניווט, מבנה, ארגון
- [ ] **Communication & Messaging** — הודעות, צ'אט
- [ ] **Notifications & Alerts** — התראות
- [ ] **Analytics & Reporting** — דשבורדים, דוחות
- [ ] **Management & Administration** — ניהול, אדמין
- [ ] **Commerce & Payments** — תשלום, מחירים, checkout
- [ ] **Media & Entertainment** — תצוגת מדיה

**Popular screens:** Dashboard · Pricing/Plans · Signup · Login · Forgot Password · Checkout · Upgrade · Settings · Profile · **Empty State** · Error page · Landing.

---

## חלק ג' — ELEMENT / UI-pattern categories (15 קבוצות)
לוודא שכל רכיב עוצב עם כל המצבים (default/hover/active/disabled/loading/error).

### תצוגה ומשוב (Display & Feedback)
- [ ] **Feedback & State Indicators** — toast, alert, badge, loader/spinner, progress, skeleton, **empty state**, error state
- [ ] **Content Blocks** — card, list, table, accordion, timeline
- [ ] **Media & Display** — image, video, avatar, gallery
- [ ] **Charts & Visualization** — גרפים, KPI tiles

### קלט (Input Components)
- [ ] **Textual Input** — text field, textarea, search box
- [ ] **Selectors** — dropdown, select, radio, checkbox, toggle, chips
- [ ] **Date & Time** — date picker, time picker, calendar
- [ ] **Numerical Input** — stepper, slider, rating
- [ ] **Specialized Input** — file upload, OTP, tags, rich-text

### שיפורי אינטראקציה (Interaction Enhancers)
- [ ] **Actionable UI** — button (primary/secondary/ghost/icon), FAB, link
- [ ] **Interactive Enhancements** — tooltip, popover, hover card, drag-and-drop
- [ ] **Smart/AI/Logic** — רכיבי AI, הצעות, autocomplete

### ניווט ומבנה (Navigation & Structure)
- [ ] **Navigation & Flow** — navbar, sidebar, tabs, breadcrumbs, pagination, stepper/wizard, bottom sheet
- [ ] **Structural Containers** — modal, drawer, sheet, layout grid, sections
- [ ] **Utility Elements** — search, filter bar, settings, menu

**רכיבים ספציפיים בולטים:** Text Field · Button · Card · Bottom Sheet · Tabs · **Empty State** · Animation.
**Browse by Color** — pageflows מתייג לפי צבע (רלוונטי לעקביות מותג/פלטה).

---

## חלק ד' — EMAIL / Notification lifecycle
לוודא שכל אימייל/התראה בתהליך קיים, עם subject + preheader + body + CTA:
- [ ] **Welcome / Onboarding series** — ברוכים הבאים, first steps
- [ ] **Transactional** — אישורים, קבלות, איפוס סיסמה, אימות
- [ ] **Product updates** — הודעות על פיצ'רים
- [ ] **Marketing / Promotional**
- [ ] **Newsletters**
- [ ] **Re-engagement / Retention** — החזרת משתמש רדום
- [ ] **Trial expiration** — סיום תקופת ניסיון
- [ ] **Payment reminders** — תזכורות תשלום

---

## חלק ה' — סטנדרטי UX חוצי-מערכת (חובה בכל מסך)
מתוך CLAUDE.md + best practices:

### 3 מצבי הנתונים (חובה בכל תצוגת דאטה)
- [ ] **Loading** — skeleton/spinner, לא מסך קפוא
- [ ] **Error** — הודעה ברורה + פעולת שחזור
- [ ] **Empty** — מצב ריק מזמין (לא רק "אין נתונים") + CTA להתחלה

### 10 היוריסטיקות של נילסן (על כל רכיב)
1. נראות סטטוס המערכת · 2. התאמה לעולם האמיתי · 3. שליטה וחופש למשתמש · 4. עקביות וסטנדרטים · 5. מניעת שגיאות · 6. זיהוי במקום זיכרון · 7. גמישות ויעילות · 8. עיצוב מינימליסטי · 9. עזרה בזיהוי ותיקון שגיאות · 10. עזרה ותיעוד

### RTL / עברית (קריטי ל-HELIX)
- [ ] `dir="rtl"` ברמת ה-root · [ ] אייקונים שמתהפכים (חצים) · [ ] יישור טקסט/מספרים נכון · [ ] `dir="auto"` בשדות תוכן מעורב (עברית+אנגלית)

### מובייל ונגישות
- [ ] יעדי מגע ≥ 44px · [ ] אין scroll אופקי · [ ] רספונסיבי בכל breakpoint
- [ ] ניגודיות (WCAG AA) · [ ] focus indicators · [ ] aria-labels · [ ] ניווט מקלדת

---

## חלק ו' — Onboarding (הכי קריטי לאימוץ) 🚀
מבוסס skills: `onboarding-ux` + `guiding-users` + `onboarding-cro`.

### עקרונות
- **Time-to-value** — כמה מהר המשתמש מגיע ל"aha moment"?
- **Progressive disclosure** — לא להציף; לחשוף פיצ'רים בהדרגה.
- **אדם בשליטה** — אפשר לדלג, לא לכפות.

### מרכיבים לתכנן
- [ ] **מסך פתיחה / welcome** — מה המוצר עושה במשפט
- [ ] **Setup wizard** — שלבי הקמה ראשוניים (חיבור מקורות/חשבון)
- [ ] **Empty states מזמינים** — כל מסך ריק = הזדמנות הכוונה + CTA
- [ ] **Product tour / tooltips** — הכוונה בהקשר לפיצ'רים מרכזיים
- [ ] **Checklist / getting-started** — "3 צעדים כדי להתחיל"
- [ ] **Contextual help** — עזרה נקודתית איפה שנתקעים
- [ ] **First-run vs returning** — חוויה שונה למשתמש חדש מול חוזר
- [ ] **Activation metric** — מה מגדיר "משתמש שהופעל"?

### מדדים
Time-to-value · Activation rate · Completion של ה-onboarding · Drop-off per step.

---

## חלק ח' — Motion & Effects (אפקטים ותנועה) ✨
מקורות: skills (`framer-motion-animator` · `micro-interactions` · `scroll-experience` · `premium-frontend-ui` · `playfulness-fun`) + ספריות (Framer Motion · CSS · **Lottie** — יש לך setup). pageflows = השראה בלבד (רואים תנועה בהקלטות + תג Animation), לא מקור קוד.

### עיקרון: תנועה משרתת, לא מקשטת
כל אפקט צריך לעשות אחד מ: **לתקשר מצב · להנחות תשומת לב · לתת feedback · לרכך מעבר.** אם לא — מורידים אותו.

### סוגי אפקטים לתכנן (צ'קליסט)
- [ ] **מעברי עמוד/מסך** (page transitions) — Framer Motion
- [ ] **Micro-interactions** — כפתור (hover/press), toggle, checkbox, chips
- [ ] **Loading / skeleton** — shimmer, spinner, progressive reveal
- [ ] **Feedback** — הצלחה (וי מונפש/Lottie), שגיאה (shake), toast slide-in
- [ ] **Empty states מונפשים** — Lottie illustration שמזמין פעולה
- [ ] **Drag-and-drop feedback** — לוח התור (dnd-kit — ליטוש תנועה: lift/drop/ghost)
- [ ] **Scroll-driven** — parallax / reveal-on-scroll (בעיקר דפי נחיתה/שיווק)
- [ ] **Hover / focus states** — עקביים בכל אלמנט אינטראקטיבי
- [ ] **Number/counter animations** — KPI עולה בדשבורדים
- [ ] **Onboarding spotlight/pulse** — הדגשת אלמנט שמכוונים אליו

### כלים
**Framer Motion** (מעברים/gestures/orchestration) · **CSS transitions** (micro קלים) · **Lottie** (אנימציות וקטוריות עשירות — empty/onboarding/success; יש לך lottie-player + text-to-lottie) · **dnd-kit** (גרירה, כבר בשימוש).

### ⚠️ נגישות תנועה (חובה)
- [ ] `prefers-reduced-motion` — לכבד משתמשים שביקשו פחות תנועה (להשבית/לרכך)
- [ ] משך קצר (≈150-300ms) — מהיר, לא מעצבן
- [ ] לא להסתמך רק על תנועה להעברת מידע

---

## חלק ט' — עקביות ל-HELIX Design System (EFFECTS.md)
`C:\Users\User\Desktop\helix\EFFECTS.md` = ה-single-source-of-truth של HELIX (24 חלקים). מה **למשוך ממנו לכל תוכנה** (ומה לא):

| אלמנט (EFFECTS.md) | לתוכנה? | סטטוס ב-HELIX OPS |
|---|---|---|
| טוקני צבע (§1) bg/surface/ink/brand/neon | ✅ | ✅ בשימוש |
| טיפוגרפיה (§2) Heebo/Rubik/JetBrains | ✅ | ✅ |
| **תנועת לוגו ב-hover** (§9 `.nav-logo`+`.dot`) | ✅ | ✅ הוחזר |
| **Neon glow על CTA** (§22) | ✅ | ✅ `.glow` על ראשיים |
| **card hover-lift** translateY (§8) | ✅ | ✅ כספת |
| Glassmorphism `.glass` (§22) | 🟡 | Nav blur קיים; אפשר גם modals/toasts |
| **typing dots** (§20.7 ai-dot-bounce) | ✅ | ✅ "הסוכן כותב" |
| animated counter (§13) | ✅ | ✅ CountUp |
| skip-nav/focus/reduced-motion/44px/aria (§23) | ✅ | ✅ |
| FAQ `<details>` (+→×) (§15) | ✅ (עזרה) | ⬜ כשנוסיף עזרה/FAQ |
| ScrollReveal / ScrollTextHighlight (§20) | 🟡 דפי שיווק | ⬜ לדף נחיתה |
| Floating CTA · WhatsApp float · Hero · Carousels · Service pages (§10-18,21) | ❌ שיווק | לא לאפליקציות פנימיות |

**הכלל:** כל תוכנה חדשה **יורשת את טוקני העיצוב + חתימות התנועה** של HELIX (לוגו · glow · card-lift · typing · counters) לעקביות מותג. **אלמנטי דף-שיווק** (hero/carousel/floating-CTA) **לא** עוברים לאפליקציות. הפניה מלאה: `helix\EFFECTS.md`.

## חלק ז' — מקורות
- **pageflows.com** — טקסונומיית flows/screens/elements/emails (נסרק 2026-07-17).
- **CLAUDE.md** — סטנדרטי HELIX (נילסן, RTL, states, מובייל, נגישות).
- **Skills:** onboarding-ux · guiding-users · ux-review · ux-writer · accessibility-audit · mobile-responsiveness · ui-ux-pro-max.
- מדריכי pageflows: User Onboarding · Best Signup Flows · Checkout Best Practices · Dark Patterns · Email Design Principles.
