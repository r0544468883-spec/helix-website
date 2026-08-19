# 15 · HELIX PIXEL — שכבת-החישה המשותפת של הסוויט (Intent & Behavior Nervous System)

> **שם המוצר:** HELIX PIXEL (System Chief פנימי מכונה "**החושים / The Senses**").
> **סטטוס:** אפיון v1.1 (2026-08-19). מקור: ניתוח מתחרה MegaPixel (go.mega-pixelai.com) + החלטת משתמש להרחיב לשכבת-חישה חוצת-סוויט. v1.1: מעוגן בקוד הקיים — `helix-tag.js` + טבלת `events` של Growth-Doctor; הוכרע בית-הפיקסל (CRM-Supabase §7.0); נוסחת-ניקוד + קריטריוני-Done + החלטות-פתוחות.
> **product_stage:** discovery (רץ דרך AI-SHIPR).
> **החלטת-אב:** זה **לא** קלון של MegaPixel. MegaPixel = ניקוד-לידים בלבד. HELIX PIXEL = **סקריפט אחד** שאוסף התנהגות, וכל מוצרי HELIX (OPS/SDR/Growth-Doctor/Rank/SHOP/CRM/Maintenance) **צורכים ממנו**. זה ה-moat: שכבת-נתונים אחת שמזינה שיווק+מכירות+שימור+SEO+איקומרס יחד.

---

## 1. המשפט האחד
פיקסל אחד (`helix.js`) שמוטמע באתר של HELIX ושל כל לקוח, לוכד את התנהגות המבקר (page/scroll/click/video/return/form/cart/exit), קושר session אנונימי → **ליד מזוהה** (Identity Resolution), הופך את זה ל**ציון כוונה בזמן-אמת**, ומזין stream אחיד ש**כל מוצרי הסוויט צורכים** — מדורג באוטונומיה (advisor → approve → autopilot), privacy-first ותואם **תיקון 13**, בעברית ו-RTL.

## 2. הבידול (מול מפת השוק, אוגוסט 2026)
| שחקן | מה עושה | הפער |
|---|---|---|
| **MegaPixel** (IL) | ניקוד-לידים למוקדי-מכירה, "למי להתקשר עכשיו" | סילו אחד (מכירות בלבד); שותקים על פרטיות; לא פועל, רק ממליץ |
| **RB2B / Vector / Clearbit Reveal** | de-anon B2B (מזהים חברה/אדם) | US-first, לא תואם תיקון 13, יקר, בלי action-layer |
| **PostHog / Amplitude / Mixpanel** | product analytics | אין intent-scoring למכירות, אין identity→CRM, אין actions |
| **Segment / RudderStack** | CDP (צינור אירועים) | תשתית בלבד — לא נותן ערך, צריך לבנות הכל מעליו |

**אף אחד לא נותן:** (א) **סקריפט אחד** שמזין 7 מוצרים שונים (מכירות+שימור+SEO+איקומרס+תחזוקה), (ב) **action-layer** מחובר למתג-אוטונומיה (סוכן שפועל, לא רק מתריע), (ג) **privacy-first תואם תיקון 13** כמסר-מכירה, (ד) עברית/RTL. **הסוויט-ספוט פנוי.**

> **ה-moat האמיתי:** מתחרה יכול לשכפל ניקוד-לידים. מה שהוא **לא** יכול לשכפל זה ששכבת-הנתונים שלנו כבר מחוברת ל-CRM חינמי + 7 מוצרים. הפיקסל הופך כל מוצר ל"חכם יותר" בלי integration נוסף.

## 2b. מה כבר קיים — הבסיס המוכח (`helix-tag.js`)
**לא בונים מאפס.** בתוך Growth-Doctor כבר רץ פיקסל עובד ומוכח: `public/helix-tag.js` (80 שורות) + endpoint `app/api/collect/route.ts`. הוא כבר עונה על "איפה המשתמש נוטש":
| מנגנון קיים | מה הוא כבר עושה |
|---|---|
| **שלבי-משפך** (`data-helix-step` + `data-helix-index`) | סימון-ידני של כל שלב; צניחת-ספירה בין שלבים = נקודת-נטישה |
| **flush-on-exit** (`visibilitychange`→hidden / `pagehide`) | שולח scroll-depth + time-on-page **ברגע העזיבה** → יודעים באיזה דף+עומק נטש |
| **rage / dead clicks** | 3+ קליקים ב-800ms = תסכול; קליק על לא-לחיץ עם cursor:pointer = dead → נקודות-חיכוך |
| **scroll depth + time** | עומק מקסימלי (0..1) + זמן, מדווח פעם אחת ביציאה |
| **return detection** | `localStorage.helix_vid` — מבקר חוזר |
| **privacy-first** | first-party, `sendBeacon`, **בלי session-replay/DOM-recording** (privacy moat כבר קיים) |

**מה חסר ב-`helix-tag.js` היום (= מה HELIX PIXEL מוסיף):** חי רק בתוך Growth-Doctor · אנונימי בלבד (אין `lead_id`) · אין intent-scoring · אין actions · אין de-anon · שלבים ידניים בלבד (בלי auto-capture) · אין שכבת-consent מפורשת. **HELIX PIXEL = קידום ה-tag הזה לשכבה משותפת + זהות + ניקוד + פעולה + תיקון-13.**

## 3. חוזה האירועים האחיד (Event Contract) — הלב הטכני
עיקרון: **event schema אחד** שכל המוצרים קוראים. הפיקסל לא יודע מי צורך — הוא רק פולט עובדות-שטח. כל מוצר בורר את הסיגנלים הרלוונטיים לו.

### 3.1 האירועים שהפיקסל לוכד (auto-capture + explicit)
| קטגוריה | אירועים | מי צורך (§8) |
|---|---|---|
| **ניווט** | `pageview`, `route_change`, `scroll_depth` (25/50/75/100%), `time_on_page`, `return_visit`, `exit_intent` | Growth-Doctor · OPS · Rank |
| **מעורבות** | `click` (CTA/link/button), `video_progress` (%), `form_start`, `form_field`, `form_submit`, `form_abandon`, `download`, `copy` | OPS · SDR · Growth-Doctor |
| **מסחר** | `product_view`, `add_to_cart`, `cart_view`, `checkout_start`, `checkout_step`, `purchase`, `cart_abandon` | SHOP · OPS |
| **כוונה** | `pricing_view`, `demo_click`, `contact_view`, `high_intent_scroll` (עמוד-מחיר עד הסוף), `repeat_pricing_visit` | OPS · SDR · CRM |
| **שימור** (in-product) | `feature_use`, `session_start`, `session_gap`, `error_seen`, `rage_click`, `dead_click`, `churn_signal` (ירידת-שימוש) | Growth-Doctor · CRM |
| **טכני/תחזוקה** | `js_error`, `broken_link_hit`, `slow_page` (LCP>threshold), `404_hit`, `mixed_content` | Website-Maintenance · Rank |
| **SEO/GEO** | `referrer` (מנוע/AI-engine), `landing_query`, `ai_crawler_hint`, `organic_entry` | Rank |

### 3.2 מבנה אירוע (JSON)
```json
{
  "event": "add_to_cart",
  "ts": "2026-08-19T10:33:00Z",
  "workspace_id": "ws_abc",          // per-tenant — מי הלקוח
  "visitor_id": "vis_anon_hash",     // אנונימי, cookieless-first (fingerprint רך + first-party)
  "lead_id": "lead_123 | null",      // מתמלא אחרי Identity Resolution
  "session_id": "sess_xyz",
  "url": "/pricing",
  "referrer": "chatgpt.com",
  "props": { "product": "OPS", "value": 490, "currency": "ILS" },
  "consent": { "analytics": true, "marketing": false },  // תיקון 13 — מצב הסכמה
  "device": { "type": "mobile", "viewport": "390x844" }
}
```
> **עיקרון תיקון 13:** כל אירוע נושא את מצב-ההסכמה. אירועים ללא הסכמת-marketing נשמרים **אנונימיים בלבד** ולא נכנסים ל-Identity Resolution.

## 4. ארכיטקטורת האייג'נטים (על גבי §4b — החוקה)
המוצר הוא **System** אחד עם **System Chief** ("**החושים / The Senses**"), שמתחתיו **Teams** (מנוע = Team), ובכל Team ארבעת ה-archetypes. פרקטלי כמו שאר מוצרי HELIX.

```
HELIX CHIEF
   └─► System Chief: "החושים" (Pixel / Senses)
         ├─► Team: Ingestion      ─► [Collector · Normalizer · Critic]
         ├─► Team: Identity        ─► [Resolver · Enricher · Critic]
         ├─► Team: Scoring         ─► [Scorer · Explainer · Critic]
         ├─► Team: Actions         ─► [Trigger · Router · Critic]
         └─► Team: Consent/Privacy ─► [Guard · Auditor · Critic]
         ── סוכנים חוצי-מחלקה ──
            Prioritizer · Verifier · Learner · Scheduler · Escalation
```

**ארבעת ה-archetypes (מיפוי §4b למונחי-פיקסל):**
1. **Scanner/Collector** (=Researcher) — קולט אירועים גולמיים, בלי דעה. עובדות-שטח בלבד ("נועה צפתה 92% מהוובינר").
2. **Maker** (=Doer) — לפי ה-Team: Resolver מקשר זהות, Scorer מנקד, Trigger יוצר פעולה. כאן הסיכון הגנרטיבי (זיהוי-שגוי, ניקוד-שווא, פעולה-שגויה).
3. **Critic** (=Adversary) — תוקף: האם הקישור-זהות ודאי מספיק? האם הציון מוצדק או false-positive? האם מותר לפעול (הסכמה קיימת)? **שער לפני כל action באוטופיילוט.**
4. **Team Chief** — מתזמר fast/team, single-interface כלפי "החושים".

**סוכנים חוצי-מחלקה:**
- **Prioritizer** — מדרג את כל הלידים החמים מכל המוצרים לפי impact ("מי הכי חם עכשיו + למה").
- **Verifier** — אחרי action: וידוא שהפעולה נשלחה/עבדה (למשל וואטסאפ יצא).
- **Learner** — לומד אילו סיגנלים ניבאו סגירה/נטישה → מכייל את מנוע-הניקוד לאורך זמן (writeback ל-CRM).
- **Scheduler** — קצב batch/real-time. **Escalation** — מתי להעביר לאדם.

**hybrid fast/team:** אירוע פשוט (pageview) → fast-path Collector יחיד. החלטת-פעולה ("להתריע למכירות?") → team מלא Scorer→Explainer→Critic.

## 5. Autonomy Switch (מתלבש על התוכנית הקיימת)
כל **פעולה** של הפיקסל (התראה, כתיבה ל-CRM, טריגר סוכן אחר) עוברת דרך `runAction()` עם `resolveMode()` fail-safe (downgrade-only):
- **advisor** (ברירת-מחדל בטוחה) — רק אוסף ומנקד. מציג "מי חם" בדשבורד. **אפס פעולה יוצאת.**
- **approve / HITL** — הפיקסל מכין התראה ("להתקשר לנועה?") → תור-אישור → אדם מאשר ✓.
- **autopilot** — פועל אוטומטית (שולח וואטסאפ/מייל/מטלת-CRM), **רק אם ה-Critic עבר** ו**רק אם יש הסכמת-marketing**. מאחורי `risk_ack` לכל פעולה שיוצאת ללקוח-קצה.
- מחלקות-סיכון (תקרה שהמתג-הגלובלי לא פורץ):
  - 🟥 **de-anonymization** → נחסם ל-**approve** מינימום (לעולם לא autopilot עיוור — רגיש משפטית).
  - 🟧 **פנייה יוצאת ללקוח-קצה** (וואטסאפ/מייל אוטומטי) → autopilot **רק** עם `risk_ack` + הסכמת-marketing.
  - 🟩 **כתיבה פנימית** (ניקוד, timeline ב-CRM, התראה למנהל-מכירות פנימי) → autopilot.
- שקיפות: כל action ל-audit-log + Verifier מוודא ביצוע. UI: `AutonomySwitch.tsx` (3-mode + risk_ack), scope פר-workspace.

## 6. אינטגרציית CHIEF (המוצר לא black-box)
- **Visibility:** CHIEF רואה את כל ה-Teams, הלידים-החמים, ונימוקי ה-Scorer/Critic.
- **Capability:** CHIEF מדבר לכל רמה ("תשאל את ה-Identity Resolver למה קישר את vis_x ל-lead_y").
- **Command modes:** אורקסטרציה דרך "החושים"; שאלת-סוכן-בודד ישירות. כל פנייה-ישירה כותבת חזרה ל-CRM/state.
- **Cross-product:** חושף `POST /api/act/trigger` (x-cross-act-secret) — כל מוצר יכול לבקש "תן לי את פרופיל-ההתנהגות של lead_123".

## 7. הארכיטקטורה הטכנית

### 7.0 ⭐ ההכרעה הארכיטקטונית: איפה הפיקסל חי (Federation)
**הבעיה (מהקוד):** כל מוצר HELIX הוא פרויקט Supabase נפרד. Growth-Doctor כותב ל-`events` ב-Supabase שלו; הלידים/CRM חיים ב-Supabase של **helix-crm** (פרויקט אחר). "פיקסל אחד שמזין את כל המוצרים" חייב להכריע מול-פני-הדבר הזה — אחרת Identity Resolution (`visitor → lead`) הוא join חוצה-פרויקטים, כלומר איטי, שביר ולא-אטומי.

**שלוש אופציות:**
| # | ארכיטקטורה | יתרון | חיסרון |
|---|---|---|---|
| A | פיקסל כותב לכל Supabase של כל מוצר | פשוט per-product | שכפול נתונים; אין timeline מאוחד לליד; Identity חוצה-DB |
| B | **פיקסל חי ב-Supabase של helix-CRM** (ה-hub הקיים) | Identity = **join באותו DB** (ליד+התנהגות יחד); timeline מאוחד; מוצרים צורכים דרך SDK | צריך CRM-Supabase כמקור-אמת |
| C | Supabase ייעודי חדש "HELIX Pixel" | מבודד | עוד פרויקט לתחזק; Identity שוב חוצה-DB מול CRM |

**ההכרעה (מומלץ): אופציה B — הפיקסל חי ב-Supabase של helix-CRM.**
- ה-CRM כבר ה-hub המשותף (ראו [[helix-ecosystem-free-crm-hub]]). הלידים כבר שם → `pixel_events.lead_id references leads(id)` הופך ל**join באותו DB**, אטומי ומהיר.
- כל מוצר לא ניגש לטבלה — הוא צורך דרך `@helix/pixel` SDK (edge functions על CRM-Supabase). כך OPS/Growth-Doctor/SHOP נשארים בפרויקטים שלהם ורק *קוראים* intent/timeline דרך API.
- Growth-Doctor ממשיך לכתוב גם ל-`events` המקומי שלו לטווח-מעבר; ה-`px-ingest` המרכזי כותב ל-CRM-Supabase. Phase 2 מאחד.
> **פעולה נדרשת מהמשתמש:** לאשר את אופציה B (CRM-Supabase כבית-הפיקסל) לפני Phase 1. זו ההחלטה היחידה שחוסמת התקדמות.

### 7.1 הסקריפט (`helix.js`) — הרחבת `helix-tag.js` הקיים
**בסיס:** מתחילים מ-`Helix-growth-doctor/public/helix-tag.js` (ראו §2b) — כבר עובד, privacy-first, sendBeacon, flush-on-exit. **לא כותבים מאפס** — מרחיבים אותו ל-`helix.js` משותף.
- **קל** (<15KB gzip), cookieless-first, first-party (כבר עומד בזה — localStorage `helix_vid`).
- מוטמע: `<script async src="https://cdn.helix.co.il/px/helix.js" data-ws="ws_abc"></script>`.
- **מה מוסיפים על ה-tag הקיים:**
  - **auto-capture** לקליקים/גלילה/pageview (היום שלבים ידניים בלבד) + **explicit API** (`helix.track('demo_click')`, `helix.identify(email)` → הזרע ל-Identity Resolution).
  - **event schema אחיד** (§3) במקום ה-`{name, step, meta}` הפשוט של היום.
  - **Consent-gated**: לפני הסכמה — רק אנונימי אגרגטיבי; אחרי הסכמת-marketing — `identify` + Identity Resolution.
  - offline queue.
- **נשמר מה-tag הקיים:** flush-on-exit (`visibilitychange`/`pagehide`), rage/dead-click, scroll-depth, return-detection, `sendBeacon`, no-session-replay.

### 7.2 Ingestion + אחסון (Supabase-native)
```
helpx.js  ─►  POST /functions/v1/px-ingest  ─►  pixel_events (append-only)
                                              └►  Realtime channel per workspace
```

**נקודת-המוצא האמיתית (Growth-Doctor):** הטבלה הקיימת היא `events (id uuid, workspace_id uuid, visitor_id text, name text, step int, meta jsonb, ts)`. `pixel_events` היא **הכללה** שלה: מוסיפה `lead_id`, `session_id`, `consent`, `referrer` (היום ב-`meta`). נתיב-הגירה בטוח: העמודות החדשות nullable → אין breaking change; `name`→`event`, `meta.page`→`url`.

**סכמת Supabase (חיה ב-CRM-Supabase §7.0, RLS פר-workspace):**
```sql
-- אירועים גולמיים (append-only, partition by day). מכליל את events הקיים.
create table pixel_events (
  id           bigint generated always as identity,
  workspace_id uuid not null references workspaces(id) on delete cascade,  -- uuid (כמו events הקיים)
  visitor_id   text not null,
  lead_id      uuid references leads(id),      -- null עד Identity Resolution (join באותו DB — §7.0)
  session_id   text,                           -- nullable — ה-tag היום לא מנהל sessions (מוסיפים)
  event        text not null,                  -- = name הקיים
  url          text,                           -- = meta.page הקיים
  referrer     text,                           -- = meta.ref הקיים
  props        jsonb default '{}',             -- = meta הקיים (x/y heatmap וכו')
  consent      jsonb default '{}',
  device       jsonb default '{}',
  ts           timestamptz not null default now()
);
create index on pixel_events (workspace_id, ts desc);
create index on pixel_events (workspace_id, visitor_id);
create index on pixel_events (workspace_id, lead_id) where lead_id is not null;

-- מבקרים (זהות + ציון)
create table pixel_visitors (
  visitor_id   text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id      uuid references leads(id),
  first_seen   timestamptz default now(),
  last_seen    timestamptz default now(),
  intent_score numeric default 0,       -- 0..100, real-time
  intent_tier  text,                     -- cold/warm/hot
  signals      jsonb default '{}',       -- אילו סיגנלים תרמו
  company      jsonb,                    -- de-anon B2B (אם רלוונטי + הסכמה)
  consent      jsonb default '{}'
);

-- מצב-הסכמה (תיקון 13 — audit trail)
create table pixel_consent (
  visitor_id   text,
  workspace_id uuid references workspaces(id) on delete cascade,
  analytics    boolean default false,
  marketing    boolean default false,
  granted_at   timestamptz,
  ip_hash      text,          -- לא IP גולמי — hash בלבד
  policy_ver   text
);

-- RLS: כל workspace רואה רק את הנתונים שלו
alter table pixel_events enable row level security;
create policy ws_isolation on pixel_events
  using (workspace_id = current_setting('app.workspace_id', true));
```

### 7.3 מנוע-הניקוד (real-time)
- edge function `px-score` מופעל על כל אירוע-כוונה → מעדכן `intent_score` (0..100).
- **נוסחה מפורשת:** `score = min(100, Σ (weight_i × e^(−λ·Δt_i)))` כאשר `Δt_i` = שעות מאז האירוע, `λ = ln(2)/48` (חצי-חיים 48ש' = "חלון-חם"). כלומר אירוע בן-יומיים תורם חצי ממשקלו.
- **משקלים** (מרחיב את ה-Bayesian scoring ב-OPS): `pricing_view`=3 · `repeat_pricing_visit`=5 · `demo_click`=8 · `video_progress>80%`=4 · `return_visit`=2 · `cart_abandon`=6 · `form_abandon`=4 · `form_submit`=10 · `high_intent_scroll`=3.
- **tiers מדידים:** cold(<30) / warm(30-70) / hot(≥70). מעבר cross-threshold ל-hot → טריגר ל-Actions Team (debounced 5דק' למניעת flap).
- **Learner** מכייל את המשקלים רבעונית מול סגירות-בפועל ב-CRM (`won`/`lost`) — logistic-regression fit, לא קבוע-לנצח.

### 7.4 Identity Resolution (ה-IP האמיתי)
עדיפות קישור (מהחזק לחלש):
1. **explicit** — `helix.identify(email)` בעת מילוי טופס/login → קישור ודאי `visitor_id ↔ lead_id`.
2. **link-decoration** — קליק ממייל/וואטסאפ עם `?hx=<hashed_lead>` → קישור ודאי.
3. **CRM match** — התאמת session ל-lead קיים ב-CRM (מייל/טלפון שהוזן).
4. **B2B de-anon** (אופציונלי, 🟥 approve-gated) — IP→חברה דרך ספק (reverse-IP), **רק ברמת-חברה**, לא אדם. **דורש הסכמת-marketing + risk_ack.**
> Critic חוסם קישור לא-ודאי. עדיף `lead_id=null` מאשר זיהוי-שגוי.

## 8. מפת Consumption — מי צורך את הפיקסל
| מוצר צורך | מה הוא מושך מהפיקסל | מה הוא עושה עם זה |
|---|---|---|
| **OPS** | intent_score, hot-tier, pricing/demo signals | "מי חם עכשיו" + scoring מוקד-מכירות + fatigue |
| **SDR** | de-anon company, B2B intent | פנייה יזומה ל-lead חם, enrichment |
| **Growth-Doctor** | scroll/exit/rage-click, funnel drop-off, churn_signal | ניתוח נטישה, שימור, CRO |
| **Rank** | referrer (AI-engine), organic_entry, 404/slow, ai_crawler_hint | GEO/SEO signals, איזה תוכן מביא AI-traffic |
| **SHOP** | add_to_cart, cart_abandon, product_view | עגלה נטושה, המלצות, intent מסחרי |
| **CRM** | full behavior timeline per lead | timeline מועשר, "מה הליד עשה לפני שהתקשר" |
| **Website-Maintenance** | js_error, broken_link_hit, mixed_content, slow_page | ניטור-תחזוקה מנתוני-אמת (real-user) |

> **עיקרון:** מוצר לא קורא את הטבלה הגולמית ישירות. הוא צורך דרך `@helix/pixel` SDK (`getIntent(lead_id)`, `subscribeHot(workspace_id)`, `getTimeline(lead_id)`) — כך שינוי סכמה לא שובר מוצרים.

## 9. פרטיות ותיקון 13 (חובה — לא אופציה, וגם מסר-מכירה)
מעקב + קישור-זהות + de-anon נופלים תחת **תיקון 13 לחוק הגנת הפרטיות** (אכיפה מאוגוסט 2025). ללא זה — קנסות + חשיפה משפטית ללקוחות.
- **Consent banner** מובנה (`helix.consent()`) — ברירת-מחדל: analytics-only. Identity Resolution + marketing רק אחרי opt-in מפורש.
- **DPA** (Data Processing Agreement) תבנית לכל לקוח (HELIX = מעבד, הלקוח = בעל-מאגר).
- **cookieless-first** — first-party בלבד, בלי third-party cookies. IP רק כ-hash.
- **מדיניות-פרטיות** גנרטור לכל workspace + זכות-מחיקה (`DELETE /px/visitor/:id`).
- **de-anon** — רק ברמת-חברה, approve-gated, מתועד.
> **המסר-מכירה:** "הפיקסל היחיד בישראל שנבנה תואם-תיקון-13 מהיסוד." MegaPixel שותקים על זה. זה הבידול (כמו ה-privacy moat של Growth-Doctor).

## 10. תמחור (לפי HELIX Pricing Master)
- **מובנה בכל מוצר** — לקוח OPS/SHOP/Growth-Doctor מקבל את הפיקסל **ללא תוספת** (זה מה שמזין את המוצר). זה מגדיל retention (שכבת-נתונים = lock-in).
- **Standalone "HELIX Pixel"** — למי שרוצה רק את שכבת-החישה + דשבורד "מי חם":
  - value-class בינונית (לפי הסולם ב-`מחירי תוכנות.md`), מדורג לפי נפח-אירועים/מבקרים.
  - de-anon B2B = add-on (עלות ספק חיצוני).
- **פנימי (HELIX עצמה)** — חינם, מזין את המשפכים שלנו (dogfooding).

## 11. תוכנית build — פאזות
> **החלטת משתמש:** פנימי + לקוחות **במקביל** מהיום הראשון (per-workspace מההתחלה).

**Phase 0 — POC (שבוע 1) — מבוסס על `helix-tag.js` הקיים:**
- **לקחת את `helix-tag.js` מ-Growth-Doctor כבסיס** (כבר לוכד pageview/click/scroll/rage/dead/return/flush-on-exit) — לא לכתוב סניפט חדש.
- להרחיב ל-`event schema` אחיד (§3) + `helix.identify()` + `data-ws`.
- `px-ingest` edge function + טבלת `pixel_events` + RLS (מכליל את `/api/collect` הקיים ל-Supabase-native multi-tenant).
- מוטמע על **מוצר פנימי אחד** (helix.co.il או PLUG) — dogfood.
- דשבורד "live: מי באתר עכשיו" (Realtime) — מרחיב את דשבורד-הנטישה שכבר קיים ב-Growth-Doctor.
- **✅ Done when:** אירוע אמיתי מ-helix.co.il מופיע ב-`pixel_events` תוך <2ש', ורואים מבקר-חי בדשבורד. אפס PII נשמר ללא consent.

**Phase 1 — MVP (שבועות 2-4):**
- Identity Resolution (explicit + link-decoration + CRM match).
- מנוע-ניקוד real-time (מרחיב OPS scoring) + tiers.
- Consent banner + תיקון-13 layer + DPA template.
- SDK `@helix/pixel` (`getIntent`, `subscribeHot`, `getTimeline`).
- חיבור ראשון: **OPS** צורך את הפיקסל ("מי חם עכשיו").
- **✅ Done when:** ליד שמילא טופס מקבל `lead_id` מקושר + `intent_score`; OPS מציג "מי חם עכשיו" מנתוני-אמת; consent-banner חוסם Identity ללא opt-in.

**Phase 2 — Consumption fan-out (חודש 2):**
- חיבור Growth-Doctor (funnel/churn), CRM (timeline), SHOP (cart).
- Actions Team + Autonomy Switch (advisor→approve→autopilot).
- דשבורד standalone + tenant onboarding (סניפט per-workspace).
- **✅ Done when:** ≥3 מוצרים צורכים מאותו `pixel_events`; ה-timeline של ליד ב-CRM מציג התנהגות-אתר; לקוח חיצוני ראשון מוטמע.

**Phase 3 — Advanced (חודש 3+):**
- de-anon B2B (approve-gated) + enrichment.
- Rank + Website-Maintenance consumption.
- Learner (כיול-ניקוד לפי סגירות בפועל).
- packaging + pricing + עמוד-מוצר (accent color ייעודי, לפי feedback_product_accent_consistency).
- **✅ Done when:** משקלי-הניקוד מכוילים מול ≥50 סגירות אמיתיות; standalone נמכר; עמוד-מוצר live ומאומת-מובייל.

## 12. כלל Reuse-Before-Build (חובה לפי CLAUDE.md)
לפני build — לשלב מוכן:
- **הבסיס הראשון והחשוב = `helix-tag.js` שלנו** (§2b): כבר עובד, מוכח, privacy-first. Phase 0 מרחיב אותו, לא מחליף. זה חוסך את כל שלב האיסוף-הבסיסי.
- **auto-capture מתקדם** — **PostHog** (open-source, self-hostable): autocapture + session recording + feature flags. שוקלים לגזור ממנו רק את ה-autocapture אם `helix-tag.js` לא מספיק — מול הרחבה עצמית (זול, בשליטתנו, כבר יש תשתית).
- **CDP** — RudderStack (OSS) אם צריך fan-out לכלים חיצוניים.
- **de-anon** — ספק חיצוני (reverse-IP) כ-add-on, לא build.
- **ה-IP שבונים מאפס:** Identity Resolution + Scoring + Actions + Consumption SDK + תיקון-13 layer. **שם הערך — לא באיסוף הגלם.**
> הוכרע (§7.0): **Supabase-native** על CRM-Supabase, מרחיב את `helix-tag.js`. PostHog נשאר fallback ל-auto-capture בלבד אם נדרש.

## 13.5 החלטות פתוחות (חוסמות build — להכריע לפני Phase 1)
| # | החלטה | ברירת-מחדל מומלצת | חוסם |
|---|---|---|---|
| D1 | בית-הפיקסל (§7.0) | **B — CRM-Supabase** (Identity = join מקומי) | Phase 1 |
| D2 | de-anon B2B — לבנות/לקנות/לדחות | **לדחות ל-Phase 3** (רגיש תיקון-13, יקר) | Phase 3 |
| D3 | ספק consent-banner | לבנות עצמאי (קל, בשליטתנו) | Phase 1 |
| D4 | נפח-אירועים צפוי → תמחור-מדרגות | לאמוד אחרי Phase 0 (dogfood נותן מספרים אמיתיים) | Phase 3 |
| D5 | PostHog auto-capture — כן/לא | לא, אלא אם `helix-tag.js` לא מספיק | Phase 2 |

> **קרוס-פרויקט (חובה לפי CLAUDE.md):** הפיקסל נוגע ב-`profiles`/`leads` המשותפים. כל שינוי-סכמה חייב בדיקה מול web-app + extension (שניהם על אותו Supabase של PLUG). ה-CRM-Supabase (helix-crm) הוא פרויקט נפרד — לוודא שאין בלבול בין `llrzeexnzgknpwcxdxpm` (PLUG) לבין ה-CRM.

## 13. סיכונים ופתרונות
| סיכון | חומרה | מיטיגציה |
|---|---|---|
| תיקון 13 / פרטיות | 🔴 גבוה | consent-first, DPA, cookieless, de-anon approve-gated, hash-IP |
| זיהוי-שגוי (Identity) | 🟠 בינוני | Critic חוסם קישור לא-ודאי; עדיף null מזיהוי-שגוי |
| ניקוד-שווא (false hot) | 🟠 בינוני | Learner מכייל לפי סגירות בפועל; decay |
| נפח-אירועים/עלות | 🟡 נמוך | batch, partition by day, aggregate cold visitors |
| מוצר תלוי-סכמה | 🟡 נמוך | SDK `@helix/pixel` מפריד מוצרים מהסכמה הגולמית |
| ad-blockers חוסמים | 🟡 נמוך | first-party proxy (cdn.helix.co.il), sendBeacon |

---

## נספח A — למה זה מנצח את MegaPixel (סיכום אסטרטגי)
| ממד | MegaPixel | HELIX PIXEL |
|---|---|---|
| היקף | מכירות בלבד | 7 מוצרים מ-stream אחד |
| פעולה | ממליץ ("למי להתקשר") | פועל (מתג-אוטונומיה) |
| פרטיות | שותקים | תואם-תיקון-13 כמסר-מכירה |
| lock-in | כלי בודד | שכבת-נתונים שמזינה את כל הסוויט |
| שפה | עברית | עברית + RTL native |

**הצעד הבא אחרי אישור המסמך:** Phase 0 POC — סניפט + `pixel_events` + דשבורד "מי חם עכשיו" על מוצר פנימי אחד.
