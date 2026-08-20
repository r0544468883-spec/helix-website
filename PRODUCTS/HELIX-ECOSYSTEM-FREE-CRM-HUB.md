# HELIX Ecosystem — Free CRM Hub 🧲 (Spec)

> **מודל HubSpot להליקס.** ליבה חינמית אחת שתופסת את כל המשתמשים — **CRM + מצב כנסים (GRAIN) + Calendly** — וכל שאר מוצרי HELIX (בתשלום) מתחברים אליה. כל מוצר עובד גם **stand-alone**. שתי אריזות-חינם: ה-CRM המלא, ו-**GRAIN+Calendly** לבד למי שכבר יש CRM.
>
> תאריך: 2026-08-11 · סטאק: Next.js 15 + Supabase + Stripe · קושר: [[HELIX-CRM-SPEC]] · [[HELIX-ACCOUNT-PORTAL-SPEC]] · [[10-helix-meeting]] · GRAIN (`grain-conftracker`)

---

## 1. חזון בשורה
ה-**CRM חינם לתמיד** ומהווה את ה-land-grab. הוא כולל בתוכו, בחינם, גם **מצב כנסים** (סריקת כרטיסי ביקור/OCR, חם-פושר-קר) וגם **Calendly** (דף `/book` בעברית מלאה). כל מוצרי HELIX האחרים — SDR, OPS, Rank, Dashboards, Growth Doctor — הם **בתשלום** ומתחברים לליבה החינמית. **HELIX MEETING הוא freemium** (הרשמה חינם + 400 דק' תמלול → שדרוג). ה-usage בליבה (אנשי קשר חמים, פגישות, סיגנלים) הוא ההזמנה לשדרג.

**למה זה עובד:** התיאום והCRM חינם ותופסים לקוחות; ה-AI שהופך פגישה/ליד ל**פעולה** — זה מה שמוכר.

---

## 2. שכבות האקוסיסטם

```
                    ┌─────────────────────────────────────────┐
                    │   HELIX ACCOUNT PORTAL  (my.helix.co.il) │  ← השדרה
                    │   זהות אחת · Stripe · entitlements · usage │    [[HELIX-ACCOUNT-PORTAL-SPEC]]
                    └───────────────────┬─────────────────────┘
                                        │  session משותף + entitlement query
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
┌───────▼─────────────────────┐         │              ┌────────────────▼──────────────┐
│   HELIX CRM  —  חינם 🆓       │         │              │   מוצרים בתשלום 💳              │
│   ─────────────────────────  │◄────────┴──────────────│   (כל אחד גם STAND-ALONE)       │
│   • Contacts/Companies/Deals │  /api/v1/crm/*  (API)  │   ──────────────────────────   │
│   • מצב כנסים (GRAIN)  🎪     │  קריאה+כתיבה דו-כיוונית │   MEETING · SDR · OPS · Rank   │
│   • Calendly  /book  📅       │─────────────────────► │   Dashboards · Growth · Guard  │
│   • OCR כרטיסי ביקור          │  תיאום→אירוע→פגישה     │                                │
└──────────────┬───────────────┘                        └────────────────────────────────┘
               │
               └──►  אריזה עצמאית חינם:  "GRAIN + Calendly"
                     למי שכבר יש CRM ולא רוצה עוד אחד
```

**שלוש שכבות:**
1. **שדרה (Account Portal):** זהות + חיוב + entitlements. מקור-אמת אחד. כבר מתוכנן.
2. **ליבה חינמית (CRM Hub):** CRM + כנסים + Calendly. תופס את כולם.
3. **פריפריה בתשלום:** כל מוצר בודק entitlement, נותן/חוסם — ולכן גם רץ stand-alone.

---

## 3. מה חינם ומה בתשלום

| רכיב | חינם 🆓 | בתשלום 💳 |
|---|---|---|
| **CRM** (contacts/companies/deals/activities) | ✅ ליבה מלאה | אוטומציה/דיווח מתקדם, מכסות גבוהות |
| **מצב כנסים (GRAIN)** — OCR, temperature, conferences | ✅ | — |
| **Calendly** (`/book`, Google Calendar, Meet, תזכורת) | ✅ | ברנדינג מותאם / כמות מתקדמת |
| **MEETING** — תמלול, 6 סיגנלים, מתג אוטונומיה | ✅ **הרשמה חינם + 400 דק' תמלול** (freemium) | דקות מעבר ל-400, סיגנלים/אוטונומיה מתקדמים |
| **SDR / OPS / Rank / Dashboards / Growth / Guard** | — | ✅ |

> **MEETING הוא freemium, לא נעול מאחורי תשלום:** נרשמים בחינם ומקבלים 400 דקות תמלול (חד-פעמי, top-of-funnel). ה-usage מזמין לשדרג. זה עצמו land-grab שני לצד ה-CRM.
>
> מגבלות free (בהשראת HubSpot, [[HELIX-CRM-SPEC]]): נקבעות ב-Account Portal דרך entitlements, לא בקוד המוצר.

---

## 4. איך Calendly עובר מ-MEETING ל-CRM החינמי
היום דף ה-`/book` מאופיין **בתוך** [[10-helix-meeting]]. באקוסיסטם הוא **מחולץ לליבה החינמית**:

- **`/book/[user]`** חי ב-CRM (או ב-Account Portal כמודול משותף) — זמינות מ-Google Calendar, בחירת slot, יצירת אירוע + Google Meet, **עברית/RTL מלא** (היתרון על Calendly), תזכורת וואטסאפ.
- **HELIX MEETING = שכבת ה-AI בתשלום מעל התיאום:** פגישה שנקבעה דרך `/book` → הבוט של MEETING מצטרף, מתמלל, מזהה 6 סיגנלים, ומריץ פעולות במתג האוטונומיה.
- **סגירת לופ:** תיאום (חינם) → פגישה → תמלול+סיגנלים (בתשלום) → פעולה ב-SDR/CRM. התיאום מזמין; ה-AI מוכר.

---

## 5. מנגנון ה-entitlements (הלב הטכני)
אותו קוד רץ תמיד; מה שחינם/בתשלום/stand-alone נקבע ב-Account Portal.

```
כל מוצר:  קורא session משותף (cookie על .helix.co.il)
       →  query entitlement:  { crm: 'free', meeting: 'paid', sdr: 'none' }
       →  נותן/חוסם/מציע-שדרוג
```
- **חינם:** ל-`crm` תמיד entitlement (כברירת מחדל בהרשמה). ל-`meeting` — entitlement `free` עם מכסת 400 דק' (freemium, נרשמים בחינם).
- **בתשלום:** entitlement `paid` נדלק אחרי checkout ב-Stripe (או כשמכסת ה-freemium נגמרת ומשדרגים).
- **Stand-alone:** מוצר שנקנה לבד לא דורש שאר ה-entitlements — בודק רק את שלו.
- **חיבור לליבה:** מוצר בתשלום קורא ל-CRM דרך `/api/v1/crm/*` (כבר בנוי, per-workspace, scoped api_keys — [[HELIX-CRM-SPEC]] §4).

---

## 5א. כל מוצר **מרחיב** את ה-CRM (מודל HubSpot Hubs) 🧩
זו הנקודה המרכזית: לא רק ש-MEETING מתחבר — **כל מוצר בתשלום מזריק פיצ'רים משלו לתוך ה-CRM המשותף.** בדיוק כמו ש-HubSpot בונה Hubs (Marketing/Sales/Service/Content/Ops) **על אותו Smart CRM אחד** — רכישת Hub פותחת objects/properties/pipelines חדשים על אותו dataset, בלי הגירה. ([hubspot.com/products/crm](https://www.hubspot.com/products/crm) — *"built on what you already have. No disruption, no data migration"*.)

**המנגנון אצלנו:**
```
רכישת מוצר  →  entitlement נדלק  →  ה-CRM טוען את "חבילת ההרחבה" של אותו מוצר:
                                     • pipeline ייעודי (stages)
                                     • properties חדשים על contact/company/deal
                                     • object חדש (אם צריך)   • views/דוחות
```
כל הרחבה = הגדרה (schema/config) שנטענת מותנה-entitlement על **אותו** בסיס-נתונים. אין CRM נפרד לכל מוצר — יש CRM אחד שגדל.

### מיפוי: מה כל מוצר מוסיף ל-CRM כשקונים אותו

| מוצר (בתשלום) | Pipeline שנפתח ב-CRM | Properties / Objects שנוספים |
|---|---|---|
| **HELIX Rank (SEO/GEO)** | פייפליין שיווק-SEO/GEO: רעיון → טיוטה → פורסם → מדורג → ממיר | keyword-יעד, מיקום SERP, סטטוס ציטוט-GEO, מקור אורגני על contact; object `content_piece` |
| **HELIX OPS** | פייפליין engagement/סושיאל: זיהוי → תגובה → שיחה → ליד | ערוץ, engagement-score, סטטוס gray-path על contact; object `engagement` |
| **HELIX SDR** | פייפליין prospecting: ICP → enriched → sequenced → replied | העשרה (חברה/תפקיד/גודל), ICP-score, מקור-ליד; sequences |
| **HELIX MEETING** | פייפליין פגישות: תואמה → התקיימה → סוכמה → follow-up | 6 סיגנלים (buying-intent/התנגדות/הבטחה…), promise-ledger על contact; object `meeting` |
| **HELIX Growth Doctor** | — (שכבת retention) | cohort, סטטוס churn-risk, LTV על contact/company |
| **HELIX Dashboards** | — (שכבת דיווח) | קורא את כל אובייקטי ה-CRM ומרנדר BI |
| **מצב כנסים (GRAIN)** — *חינם* | פייפליין כנסים: נסרק → chased → פגישה | temperature (חם/פושר/קר), conference-source; objects `conference`,`card-scan` |

> העיקרון: ה-CRM החינמי הוא הקנבס; כל מוצר בתשלום מצייר עליו את הפייפליין שלו. לקוח שקונה 3 מוצרים מקבל CRM אחד עשיר עם 3 פייפליינים — לא 3 מערכות.

### ראיות מ-HubSpot (המודל עובד)
- **מבנה:** Sales Hub הוא שמכניס multi-pipeline/forecasting/playbooks; Marketing Hub מכניס אוטומציית קמפיינים — **שניהם על אותו CRM ו-dataset**, אותו UI. ([HubSpot Sales](https://www.hubspot.com/products/sales), [Smart CRM explained](https://intuvio.com/en/learning-center/topics/this-is-hubspot-smart-crm))
- **תוצאה מצרפית:** אחרי שנה לקוחות HubSpot מייצרים **129% יותר לידים, סוגרים 36% יותר עסקאות**. ([hubspot.com/case-studies](https://www.hubspot.com/case-studies))
- **Case studies רלוונטיים:**
  - *Online Computers* — CRM חינם → Marketing+Sales Hub → **+167% צמיחת pipeline** עם משווק אחד. ([case](https://www.hubspot.com/case-studies/online-computers))
  - *GrowthLab Financial* — יישור מכירות+שיווק על אותו CRM → **הכפילו הכנסות**. ([case](https://www.hubspot.com/case-studies/growthlabfinancial))
  - *Ceros* — Sales Hub → **+180% ייצור עסקאות** ב-5 שנים. ([case](https://www.hubspot.com/case-studies/ceros-sales-hub))
  - *Huify* — CRM חינם כבסיס → **פי-6 הכנסות ב-12 חודשים**. ([case](https://www.hubspot.com/case-studies/huify))

**המיפוי המדויק בוצע** → ראה מסמך-לוויין [[HELIX-ECOSYSTEM-CRM-EXTENSION-MAP]]: pipeline+properties+objects מדויקים לכל מוצר (Rank/OPS/SDR), מבוסס על ה-default properties וה-Lead-object של HubSpot, + מודל multi-tenant (Business Units).

---

## 6. שתי אריזות-החינם
1. **HELIX CRM המלא** — CRM + כנסים + Calendly. למי שרוצה CRM חדש.
2. **GRAIN + Calendly (עצמאי)** — אותם רכיבי כנסים+תיאום, בלי שכבת ה-CRM המלא. למי ש**כבר יש CRM** (HubSpot/Salesforce/monday) ולא רוצה עוד אחד — משתמש רק בסריקת כרטיסים+תיאום, ומייצא/מסנכרן ל-CRM שלו.

> שתיהן חולקות את אותו קוד; ההבדל הוא אריזה + entitlement, לא בסיס-קוד נפרד.

---

## 7. הפער הטכני להכרעה: Prisma מול Supabase
GRAIN רץ על **Prisma (DB משלו)**; HELIX CRM על **Supabase**. כדי שמצב-הכנסים+OCR יחיו *בתוך* ה-CRM החינמי:

- **מסלול A — מיזוג לנתון-אמת אחד (מומלץ לטווח ארוך):** לבנות מחדש מצב-כנסים+OCR על סכמת Supabase של ה-CRM. נקי, מקור-אמת אחד, אבל בנייה מחדש.
- **מסלול B — GRAIN כ-service נפרד (מהיר):** GRAIN נשאר על Prisma, מתחבר ל-CRM דרך API. שתי אריזות-החינם באוויר תוך שבוע, אבל שני מסדי-נתונים.

**המלצה:** להתחיל ב-**B** כדי להעלות מהר לאוויר ולתקף, ולתכנן הגירה ל-**A** כשהמודל מוכח.

---

## 8. מפת דרכים מוצעת
- **P0 — שדרה:** לוודא Account Portal מחזיר entitlements ל-`crm`/`meeting` (POC קיים → [[HELIX-ACCOUNT-PORTAL-SPEC]]).
- **P1 — Calendly בליבה:** לחלץ `/book` לליבה החינמית (Google Calendar + Meet + RTL). *מוצר שמיש: CRM+תיאום חינם.*
- **P2 — GRAIN בליבה:** לחבר מצב-כנסים+OCR (מסלול B), + לפרסם אריזת "GRAIN+Calendly" עצמאית.
- **P3 — MEETING freemium מעל:** בוט תמלול+6 סיגנלים+מתג אוטונומיה שיושב על פגישות מ-`/book`. הרשמה חינם + 400 דק' → שדרוג בתשלום.
- **P4 — חבילות-הרחבה per-מוצר:** לכל מוצר בתשלום (Rank/OPS/SDR/Growth/Dashboards) — להגדיר את "חבילת ההרחבה" שלו ל-CRM (pipeline + properties + objects, §5א), נטענת מותנה-entitlement. blueprint = מיפוי HubSpot Hubs.
- **P5 — CRM extension framework:** להפוך את טעינת-ההרחבה לגנרית (schema/config per-מוצר) כדי שהוספת מוצר עתידי = הוספת חבילה, לא קוד-CRM.

---

## 9. סיכונים / פתוחים
- **כפל CRM:** לוודא שהמסר "GRAIN+Calendly למי שכבר יש CRM" לא מתחרה בבלבול עם ה-CRM המלא. → מסך בחירה בהרשמה.
- **מכסת תמלול חינם (400 דק'):** לאכוף דרך Usage Engine, אחרת דליפת עלות. → [[HELIX-ACCOUNT-PORTAL-SPEC]] §usage.
- **הגירת Prisma→Supabase (A):** לתזמן רק אחרי תיקוף. לא לחסום את P1-P2.
- **תמחור:** להתאים ל-[[מחירי תוכנות]] — CRM/כנסים/Calendly ב-value-class החינמי; MEETING/SDR/OPS בתשלום.
