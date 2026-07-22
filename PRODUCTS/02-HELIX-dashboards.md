# מוצר 2: HELIX DASHBOARDS — פלטפורמת דשבורדים אוניברסלית לעסק 📊

> (שם קודם: HELIX Reports.) **לא רק שיווק** — דשבורדים לכל מחלקה: שיווק, מכירות, הנהלת חשבונות, תפעול, שירות, HR, מוצר, מוניטין, והנהלה.
> **3 דרכים לדשבורד:** מובנה (Templates) · Drag-Drop מלא (בנה משלך) · המלצת-AI · או מסגמנט ספציפי.
> **מתחבר לכל מוצרי HELIX** (Rank/Shield/Ops/SDR/Books) כמקורות-דאטה + לכל מקור חיצוני.
> עברית-native · מסירה רב-ערוצית (וואטסאפ/טלגרם/מייל) · עדכונים אוטומטיים דרך **Ollama+Claude**.
> **חינם ל-SMB** (wedge) → **מודל דואלי:** מכירה ישירה תחת מותג HELIX (ערוץ ראשי) + הפצה white-label דרך שותף/סוכנות (ערוץ אופציונלי). תאריך עודכן: 2026-07-20 · סטטוס: אפיון (**טרם בנייה — לפי החלטה**).

## 0. החזון — ה-Databox/Metabase הישראלי לכל העסק
במקום "עוד כלי דוחות שיווק", **HELIX DASHBOARDS** הוא **פלטפורמת BI אוניברסלית בעברית**: מחברים כל מקור (מכל מחלקה) — כולל **מוצרי HELIX עצמם** (Rank/Shield/Ops/SDR/Books מזרימים מדדים) — ומקבלים דשבורד: מובנה, בנוי-לבד, או מומלץ-AI. כל דשבורד מורכב מ**widgets אטומיים** מספרייה אחת. **הבידול המשולש נשמר:** עברית-native + נרטיב AI אנושי + חינם — אבל עכשיו חוצה-מחלקות, וזה ה-moat: מבט-על אחד על כל העסק. **מתוכנן כאפליקציה עצמאית (`HELIX DASHBOARDS`) שמתחברת לשאר המוצרים.**

## 0.1 קטלוג הדשבורדים (per-מחלקה)
| מחלקה | דשבורד | מדדי-ליבה | מקורות |
|---|---|---|---|
| **שיווק** | Marketing | תנועה, ROAS, CPL, top content, SEO/GEO | GA4/Meta/Ads/דיוור + HELIX Rank/Shield/Ops |
| **מכירות** ⭐ | Pipeline | עסקאות, conversion, מחזור-מכירה, forecast, leaderboard | CRM (HubSpot/Pipedrive/Monday) + HELIX SDR |
| **הנהלת חשבונות** ⭐ | Finance | תזרים, הכנסות/הוצאות, **מע"מ**, AR aging, burn/runway | חשבשבת/רווחית/GreenInvoice/QuickBooks + HELIX Books |
| **תפעול** ⭐ | Operations | הזמנות, מלאי, משלוחים, SLA, ספקים | ERP/חנות |
| **שירות/CS** | Support | tickets, זמן-תגובה, CSAT/NPS, churn-risk | Zendesk/Intercom |
| **HR/גיוס** | People | headcount, משפך-גיוס, time-to-hire, נטישה | ATS + PLUG |
| **מוצר** | Product | DAU/MAU, adoption, funnels, retention | Mixpanel/Amplitude/PostHog/GA4 |
| **סטארטאפ/צמיחה** 🏴‍☠️ | **Startup — AARRR** | משפך Pirate Metrics: Acquisition · Activation · Retention · Referral · Revenue (מקצה-לקצה) | GA4/Mixpanel/PostHog + CRM + חיוב (Stripe) |
| **E-commerce** | Store | מכירות, AOV, נטישת-עגלה, top products | Shopify/Woo |
| **מוניטין** | Brand | אזכורים, סנטימנט, Reputation Score | HELIX Shield |
| **הנהלה** ⭐⭐ | **Executive Overview** | מבט-על חוצה-מחלקות (הכנסה/מזומן/לידים/גדילה/סיכונים) | הכל — ה"דשבורד-על" |

## 0.15 דשבורדים לפי סוג-עסק (Verticals) 🏢 — שכבת ה-Onboarding
המחלקות ב-§0.1 הן אבני-הבניין. אבל לקוח לא חושב "מחלקות" — הוא חושב **"אני חנות"** / "אני SaaS" / "אני רו״ח". לכן ה-onboarding שואל **"איזה סוג עסק אתה?"** → נטענת **חבילת-דשבורדים (bundle)** מותאמת עם ה-KPIs הנכונים כבר מסודרים. הלקוח בוחר מתוך החבילה, ויכול להוסיף/להסיר (drag-drop §0.2).

> כל bundle = **בחירה** מתוך אותן 11 מחלקות + סט-widgets חתום per-vertical. אותה ליבה, אריזה per-קהל.

| סוג עסק | חבילת-הדשבורדים (bundle) | ה-KPIs החתומים | מקורות-מפתח |
|---|---|---|---|
| **חנות E-commerce** 🛒 | Store · Marketing · Finance · Operations(מלאי) | AOV · נטישת-עגלה · top-products · ROAS · מלאי | Shopify/Woo · Meta/Google Ads · GA4 |
| **מערכת SaaS** ☁️ | SaaS-Metrics · Product · Marketing · Sales | **MRR/ARR · churn · NRR** · DAU/MAU · retention · CAC:LTV | Stripe · Mixpanel/PostHog/GA4 · CRM |
| **משרד רו״ח / הנהח״ש** 🧾 | Finance(רב-לקוחות) · Compliance · Practice | תזרים-per-לקוח · **מע״מ/דיווחים** · billable-hours · לקוחות באיחור | חשבשבת/GreenInvoice/רווחית · שעונים |
| **סוכנות (שיווק/דיגיטל)** 📣 | Marketing(רב-לקוחות) · Sales · Delivery · Billing | ROAS-per-לקוח · pipeline · ניצול-צוות · רווחיות-פרויקט | GA4/Meta per-לקוח · CRM · PM |
| **B2B שירותים / ייעוץ** 💼 | Sales · Delivery · Finance · CS | pipeline-velocity · win-rate · ניצול · CSAT | CRM · PM · הנהח״ש · Chatwoot |
| **מסעדה / קמעונאות פיזית** 🍽️ | Sales(POS) · Operations · Reputation · Staff | מכירות-יומיות · מלאי · **ביקורות/סנטימנט** · משמרות | POS · מלאי · Google/Yelp · שכר |
| **קליניקה / מטפל / רופא** 🩺 | Appointments · Revenue · Retention · Reputation | תפוסה · הכנסה-per-מטופל · חזרות · ביקורות | יומן · חיוב · Google reviews |
| **נדל״ן / תיווך** 🏠 | Listings · Leads · Deals · Marketing | לידים · ימים-בשוק · עסקאות · מקור-ליד | CRM · פורטלים · Meta/Google |
| **עסק-מקומי/שירות** (מוסך/מספרה) 🔧 | Bookings · Leads · Reputation · Revenue | תורים · שיחות/לידים · **ביקורות** · הכנסה | יומן/וואטסאפ · Google · POS |
| **סטארטאפ (early)** 🚀 | Startup-AARRR · Runway · Product · Fundraising | acquisition→revenue · **burn/runway** · retention · pipeline-משקיעים | GA4/Mixpanel · Stripe · בנק · CRM |

**איך זה עובד בפועל:** onboarding → בחירת vertical → HELIX טוען את ה-bundle (טעינת template per-דשבורד) → AI-Recommend (§0.2 מוד 3) מכוונן לפי המקורות שחוברו בפועל → הלקוח משכתב ב-drag-drop. **vertical נותן נקודת-פתיחה חכמה במקום דף ריק.**

## 0.2 ארכיטקטורת ה-Widgets — 3 דרכים לדשבורד
הכל בנוי על **ספריית widgets** אחת (KPI card / גרף / טבלה / מד / funnel), כל widget מושך מ-`metrics_cache`:
1. **📦 מובנה (Templates)** — דשבורד מוכן per-מחלקה, בקליק.
2. **🖱️ Drag-Drop מלא** — גרירה/שינוי-גודל/הוספה מהספרייה (react-grid-layout), layout נשמר per-workspace.
3. **🤖 המלצת HELIX** — לפי סוג העסק + המקורות המחוברים, ה-AI מציע דשבורד מותאם.
4. **🎯 מסגמנט ספציפי** — "רק אינסטגרם" / "רק חשבוניות באיחור" → widget ממוקד.
> מובנה, drag-drop, והמלצה — **כולם מרכיבים מאותם חלקים אטומיים**. ליבה אחת, אינסוף דשבורדים.

## 0.3 עדכונים אוטומטיים (Ollama) + מסירה רב-ערוצית
- **סוכן מתוזמן (Agent OS)** מושך מדדים → **Ollama** מסכם/מזהה חריגות (נפח, אפס עלות API) → **Claude+baldiga** לנרטיב עברי.
- **מסירה:** כל דשבורד/דוח → 📧 מייל · 📱 וואטסאפ · ✈️ טלגרם (מנוע ההפצה המשותף). תדירות per-נמען.
- **גישה נכנסת:** "מה המכירות החודש?" בטלגרם → הבוט מחזיר את ה-widget/סיכום.

---

## 1. האסטרטגיה — למה חינם דווקא מנצח
השוק **מסוחר לחלוטין**: עסקים קטנים וסטארטאפים משלמים היום **$44-79/חודש** על Databox/DashThis/AgencyAnalytics. במקום להתחרות במחיר → **הולכים ל-0**. חינם **מבטל** את התחרות ומושך אליך את המשתמשים שכבר משלמים.

- **המטרה האמיתית:** לא הכנסה מהכלי — **רכישת לקוחות**. כל עסק קטן שנכנס = ליד ל-HELIX ולשאר המוצרים.
- **הבידול המשולש שאף מתחרה לא נותן:** עברית-native + נרטיב AI אנושי + **חינם**.
- **ה-"red ocean" הופך ליתרון:** דווקא כי זה מסוחר, חינם שובר את השוק. לא בונים עוד מתחרה — שורפים את מודל התשלום.

## 2. קהל יעד
- **עיקרי (חינם):** עסק קטן / סטארטאפ ישראלי שהיום משלם על כלי דוחות, או עושה ידני באקסל.
- **מסחרי (בתשלום):** סוכנויות שמנהלות דוחות להרבה לקוחות.

## 3. אפיון פונקציונלי — מה המערכת עושה
### 3.1 חיבור מקורות (Onboarding) — כל המחלקות
- **שיווק:** GA4, Meta Ads, Google Ads, דיוור (Mailchimp/ActiveTrail/InforU) + HELIX Rank/Shield/Ops.
- **מכירות:** CRM — HubSpot, Pipedrive, Monday, Salesforce + HELIX SDR.
- **הנהלת חשבונות:** חשבשבת, רווחית, Green Invoice, QuickBooks, Xero + HELIX Books.
- **תפעול/מסחר:** Shopify, WooCommerce, ERP.
- **שירות/מוצר:** Zendesk, Intercom, Mixpanel, Amplitude, PostHog.
- **HR:** ATS + PLUG.
- **connector עצמי:** CSV/Google Sheets/webhook — לכל מקור בלי אינטגרציה מובנית.
- אשף פשוט: "חבר את החשבונות שלך" → 3 קליקים, בלי קוד. כל מקור → `metrics_cache` אחיד.

### 3.2 דשבורד (מבט-על) — הנתונים המוצגים
**גישה: לפי 6 השאלות שבעל עסק קטן באמת שואל** (לא להציף במאות מדדים):

| השאלה | הנתון |
|---|---|
| כמה הגיעו אליי? | תנועה (sessions/users), חדשים מול חוזרים |
| מאיפה? | פילוח ערוצים (אורגני/מדיה/סושיאל/ישיר) |
| כמה הפכו ללידים? | המרות/לידים סה"כ מכל הערוצים |
| כמה זה עלה? | הוצאת מדיה כוללת |
| **משתלם?** | **ROAS + עלות לליד (blended)** |
| מה השתנה? | מגמה מול חודש קודם (↑↓%) |

**נתונים מדויקים לפי מקור:**
- **GA4:** תנועה, משתמשים, מקורות, עמודים מובילים, engagement, המרות, גאוגרפי, מובייל/דסקטופ.
- **Google Ads:** חשיפות, קליקים, CTR, CPC, הוצאה, המרות, עלות/המרה, ROAS, קמפיינים מובילים.
- **Meta Ads:** reach, חשיפות, קליקים, הוצאה, CPM, המרות, ROAS, מודעות מובילות.
- **דיוור:** נשלחו, פתיחה, הקלקה, הסרות, גדילת רשימה.

**החלק הכי שווה — חוצה-מקורות** (שכלי בודד לא נותן): סה"כ לידים מכל הערוצים, ROAS משוקלל, השוואת ערוצים (מי מביא הכי זול), מגמות. גרפים ב-recharts, סינון תאריך/מקור.

**🖱️ דשבורד בדראג-אנד-דרופ (התאמה אישית):** המשתמש בונה את הדשבורד שלו — **גורר, משנה גודל, מוסיף ומסיר widgets** (כרטיסי KPI/גרפים). כל ה-layout **נשמר per-workspace**. מודל Databox/Grafana. בונים עם **react-grid-layout** (MIT). זה גם ה-"קסטומיזציה" של ה"גנרי + קסטומיזציה" — ליבה אחת, דשבורד שונה לכל לקוח בלי קוד.

### 3.3 דוח חודשי אוטומטי (הליבה)
- **PDF ממותג, RTL**, נשלח אוטומטית בתחילת כל חודש.
- **נרטיב AI בעברית** — "החודש הלידים עלו 22%, בעיקר מאורגני; המדיה בפייסבוק ירדה ביעילות".
- **push, לא pull** — מגיע למייל, הלקוח לא צריך להיכנס ולבנות כלום.

### 3.35 מעקב ביצועי-תוכן (Post/Asset Performance) 🆕
מעבר למדדי-מקור (GA4/Meta/Ads) — מעקב **per-פוסט per-רשת**: reach, impressions, engagement, clicks לכל תוכן שפורסם.
- **מקור הדאטה:** טבלת `post_performance` **המשותפת עם Marketing Ops (מוצר 1)** — כל פרסום דרך מנוע ההפצה מקבל מדדים, ו-Reports מציג אותם.
- **per-asset:** כל נכס מדיה (`asset_id`) נמדד חוצה-רשתות → "איזה סרטון עבד הכי טוב, ובאיזו רשת".
- **Learning Loop:** אותה דאטה מזינה את מנוע ה-`learning` (שעה מנצחת per-רשת) — מדידה שהופכת לפעולה.
- **בדשבורד:** widget "תוכן מוביל" (top posts/assets לפי engagement) + מגמת ביצועים שבועית.

### 3.4 הגדרות
- בחירת KPIs להצגה, מיתוג (לוגו/צבע), תדירות, נמענים.

### 3.5 אזור סוכנות (המסחרי)
- ריבוי workspaces (לקוח = workspace), **white-label** (מיתוג הסוכנות במקום HELIX), ניהול מרוכז, benchmark בין-לקוחות.

### 3.6 שליחה אוטומטית רב-ערוצית (Auto-Delivery)
הדוח/דשבורד נשלח ללקוח **אוטומטית**, לפי בחירה, בכל אחד מהערוצים:
- **📧 מייל** — PDF מצורף + נרטיב בגוף ההודעה.
- **📱 וואטסאפ** — נרטיב + קובץ/לינק לדוח (WhatsApp Cloud API, הודעת document).
- **✈️ טלגרם** — דרך bot, נרטיב + PDF.
- מוגדר **per-נמען + תדירות** (חודשי/שבועי), עם תזמון (cron edge function).
- **🔗 מנצל את אותו מנוע הפצה של מוצר 1** — אותם adapters (וואטסאפ/טלגרם/מייל). **תשתית משותפת**, לא בונים פעמיים.
- ⚠️ **וואטסאפ:** דורש opt-in של הלקוח + תבנית "utility" מאושרת (הודעה יזומה עסקית). לא ספאם — הלקוח בחר לקבל דוח חודשי. תואם §30A.

## 4. מסכים (Screens)
1. **Onboarding** — חיבור מקורות (כל המחלקות).
2. **Dashboard Gallery** — בחר: template per-מחלקה · בנה משלך (drag-drop) · המלצת-AI.
3. **Dashboard** — תצוגת ה-widgets (גרירה/שינוי-גודל, layout נשמר).
4. **Widget Builder** — הוסף widget מהספרייה, בחר metric + segment.
5. **Report/Delivery** — תדירות/ערוצים (מייל/וואטסאפ/טלגרם) + נרטיב AI.
6. **Settings** — מיתוג/שפה/מקורות.
7. **Agency Hub** (מסחרי) — רשימת לקוחות, white-label, benchmark.

## 5. מודל נתונים (Supabase)
| טבלה | שדות עיקריים |
|---|---|
| `workspaces` | id, name, owner_id, plan (free/agency), branding_json |
| `connected_sources` | workspace_id, provider, oauth_tokens, status, last_sync |
| `metrics_cache` | workspace_id, source, date, metric, value |
| `reports` | workspace_id, period, pdf_url, narrative, sent_at |
| `report_schedules` | workspace_id, cadence, recipients[], kpis[] |
| `agency_clients` | agency_id, workspace_id (למודל הסוכנות) |
| `dashboards` | workspace_id, name, department (marketing/sales/finance/ops/…), source (template/custom/ai), is_default |
| `dashboard_widgets` | dashboard_id, widget_type (kpi/line/bar/table/gauge/funnel), metric_key, segment_json, x, y, w, h (react-grid-layout) |
| `widget_library` | key, department, type, title, metric_source, default_config (הספרייה שממנה בונים — מובנה/drag-drop/המלצה) |
| `post_performance` 🔗 | (משותף עם מוצר 1) publication_id, asset_id, network, reach, impressions, engagement, clicks — מזין את widget "תוכן מוביל" |

## 6. ארכיטקטורה
- **Frontend:** React + shadcn (על צורת PLUG, RTL מוכן).
- **Backend:** Supabase (Auth, DB, Storage, RLS per-workspace).
- **Connectors:** edge function per-provider (OAuth + fetch → `metrics_cache`).
- **Cron:** edge function חודשי (`--no-verify-jwt`) → מייצר ושולח דוח.
- **PDF:** RTL-aware (puppeteer/react-pdf); reuse דפוס `og-share-image` מ-PLUG.
- **נרטיב:** Claude + **Hebrew Content by Helix** (+ הגהת כתיב חובה).
- **עתידי:** firecrawl למשיכת נתוני חברה/מתחרים ל-benchmark.

## 7. מונטיזציה
- **SMB/סטארטאפ: חינם לגמרי.** מגבלות עדינות שמצדיקות שדרוג-לסוכנות: מיתוג "Powered by HELIX" על הדוח, מספר מקורות/דוחות מוגבל.
- **ישיר (ערוץ ראשי):** עסקים משדרגים לתשלום ישירות מולנו תחת מותג HELIX — יותר מקורות/דוחות, הסרת מיתוג, פיצ'רים מתקדמים.
- **הפצה/שת"פ (ערוץ אופציונלי):** סוכנות בתשלום — white-label (מיתוג שלהם), ריבוי לקוחות, benchmark, ניהול. תמחור per-לקוח או flat.
- **הכלי לא חייב להרוויח בעצמו** — גם מזין את המשפך של HELIX.

## 8. GTM — איך זה עובד ככלי חדירה
1. עסק קטן מחפש "דוח שיווק" / כבר משלם על אחד → מוצא **כלי חינמי בעברית** → נכנס.
2. ברגע שהוא בפנים:
   - **חשוף למוצר 1** (ניהול תוכן + הפצה) — upsell טבעי.
   - **הדוח החודשי הממותג HELIX** = תזכורת מותג חודשית שיושבת אצלו במייל.
   - **הדאטה שלו** מזינה את ה-benchmark שמחזק את כל הלקוחות.
3. **סוכנות** שרואה את הכלי → מאמצת אותו ל-white-label בתשלום. ← ההכנסה.

### 8.1 חיבור ל-HELIX STAGE (ערוץ רכישה + אקו-סיסטם) 🔗
**HELIX STAGE** (ה-"Product Hunt הישראלי") = מאגר מובנה של **בדיוק קהל היעד** — סטארטאפים ועסקים קטנים ישראלים שמשיקים מוצרים. החיבור:
- **CTA בדשבורד-המייקר של STAGE:** "חבר את נתוני השיווק שלך → קבל דוח חודשי חינם" → מזרים משתמשי STAGE ל-HELIX Reports.
- **תשתית משותפת:** אותו Supabase + Resend + stack (Next.js/RTL) → מסירת הדוחות מנצלת את תשתית המייל הקיימת של STAGE. בונים פעם אחת.
- **משפך אקו-סיסטם:** `STAGE (השקה) → HELIX Reports (מדידה) → Marketing Ops Hub (יצירה+הפצה)` — כל מוצר מזין את הבא, הכל תחת מותג HELIX.
- **הוכחה חברתית:** פרופיל המוצר ב-STAGE יכול להציג גדילה אמיתית (מבוסס נתוני Reports) → אמינות מול משקיעים/לקוחות.

## 9. אבני בניין (להורדת עומס)
- **קונקטורים:** APIs ישירים (GA4/Meta/Google Ads/דיוור). `public-apis` catalog לחינמיים.
- **דשבורד:** `data-vision-funnel-main` המקומי (recharts כבר מחווט, אותו stack).
- **דראג-אנד-דרופ:** `react-grid-layout` (MIT) — גרירה/שינוי-גודל/הוספת widgets, layout נשמר per-workspace.
- **נרטיב:** Hebrew Content by Helix + Claude.
- **PDF/cron:** reuse דפוסי edge-functions של PLUG.

## 10. סיכונים
- **תחזוקת קונקטורים (שוברים)** — התלונה מס' 1 בקטגוריה. לתכנן resilience + התראות.
- **עלות AI-narrative per-report** — cache + זילוף; חינם צריך תקרה שלא תפיל עלויות.
- **מגבלת ה-free** צריכה להיות מכובדת מספיק שלא תבריח, אבל שתשאיר סיבה לסוכנות לשלם.

## 11. תוכנית עבודה (Roadmap)
| שלב | מה בונים |
|---|---|
| **1** | Auth + workspaces (RLS) + חיבור GA4 (OAuth) + דשבורד בסיסי (על `data-vision-funnel`) |
| **2** | קונקטורים Meta/Google Ads/דיוור → `metrics_cache` + מדדים חוצי-מקורות + נרטיב AI עברי |
| **3** | דוח PDF חודשי (RTL) + תזמון cron + **שליחה רב-ערוצית** (מייל/וואטסאפ/טלגרם — מנוע מוצר 1) |
| **4** | **🔗 חיבור ל-HELIX STAGE** — CTA בדשבורד-המייקר → onboarding ל-Reports + אזור סוכנות (white-label) |
| **5** | Benchmark בין-לקוחות (כשיש מסה קריטית) |

## 12. סטטוס בנייה בקוד (helix-dashboards) — מה נבנה ומה נשאר 🏗️
נבנה כאפליקציה **עצמאית** `Next.js 15 + TS + Tailwind + Supabase (RTL)` ב-`Desktop/helix/helix-dashboards`. **build נקי, 0 שגיאות typecheck.** גיט: רפו **`HELIX-DASHBOARDS`** (branch main, פרטי, remote = origin שלנו). Stack: **recharts + react-grid-layout**.

### ✅ נבנה (end-to-end)
| רכיב | קבצים / routes |
|---|---|
| **מנוע widgets** — ספרייה אטומית (KPI/קו/עמודות/טבלה/מד/משפך) + renderer | `components/widgets/{WidgetRenderer,WidgetCard}`, `lib/types` |
| **Drag-Drop canvas** — גרירה/שינוי-גודל/**הוספה**/הסרה, מצב-עריכה | `components/DashboardCanvas`, `DashboardView`, `AddWidgetPanel` |
| **3 דרכים לדשבורד** — Templates (11) · Drag-drop · **AI-Recommend** | `lib/templates`, `/api/recommend`, `VerticalGrid` |
| **Verticals (10)** — onboarding: סוג-עסק → הקמת חבילת-דשבורדים | `onboardVertical`, `lib/templates` VERTICALS |
| **מודל נתונים + RLS** — workspaces/connections/`metric_points`/dashboards/widgets/deals/digest_subscriptions/bot_links | `supabase/schema.sql` |
| **Auth + persist** — Supabase magic-link + שמירת layout/widgets ל-DB | `app/login`, `auth/callback`, `actions-auth`, `actions-dashboards`, `resolve-server` |
| **Connectors (חיים, 9)** — GA4 (OAuth) · Meta Ads · Stripe · Shopify · Plausible · Mailchimp · **HELIX OPS (A/B)** · **רב-מסר/Responder** 🇮🇱 · **ActiveTrail** 🇮🇱 → `metric_points` | `lib/connectors/{ga4,meta,stripe,shopify,plausible,mailchimp,helixops,ravmesser,activetrail,registry}`, `/api/connectors/*`, `/connect` |
| **Token refresh** — GA4 (auto) + Meta long-lived (60d) | `lib/google-token`, `lib/connectors/meta-token` |
| **סנכרון מתוזמן** — cron יומי לכל החיבורים (service-role) | `/api/cron/sync`, `vercel.json` |
| **הקשחת אבטחה** — הצפנת AES-256-GCM לטוקנים ב-`connections.config` | `lib/secrets` (env `SECRETS_KEY`) |
| **Sales pipeline native** (בסגנון atomic-crm) — לוח Kanban → מדדי-מכירות אמיתיים | `deals` table, `/deals`, `DealsManager`, `lib/sales`, `actions-deals` |
| **עדכון אוטומטי (Ollama) + נרטיב** — Model Router (Ollama→Claude) → digest עברי | `lib/ollama`, `lib/digest`, `lib/digest-data` |
| **מסירה רב-ערוצית + בוט** — טלגרם/וואטסאפ/מייל + webhook בוט (נתונים אמיתיים per-צ׳אט) | `lib/channels`, `/api/telegram`, `bot_links` |
| **Digest מתוזמן** — מנויים + שליחה שעתית | `digest_subscriptions`, `/api/cron/digest`, `/digest`, `actions-digest` |

### ⬜ נשאר להשלים
| מה | סטטוס | מה צריך |
|---|---|---|
| **הרצה live** | קוד מוכן | הרצת `schema.sql` ב-Supabase + env (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_OAUTH_*`, `SECRETS_KEY`, `ANTHROPIC_API_KEY`/`OLLAMA_BASE_URL`, `TELEGRAM_BOT_TOKEN`, `RESEND_API_KEY`, `CRON_SECRET`, `FB_APP_ID/SECRET`) + Deploy Vercel |
| **Connectors נוספים** | לא נבנה | CRM (HubSpot/Pipedrive) · הנהח״ש ישראלי (GreenInvoice/חשבשבת — edge-fn ייעודי, הבידול) · Zendesk/Intercom · Mixpanel/PostHog. אסטרטגיה: **Nango** כמנוע-על (ראה 02b) |
| **מדדי real-data מלאים** | חלקי | כרגע אמיתי: GA4 (sessions/conversions), **Plausible (visitors/pageviews), Mailchimp (subscribers)**, Stripe (revenue/mrr), Shopify (sales/aov), Meta (spend), deals (pipeline/win-rate). השאר — demo עד ה-connector שלו |
| **widgets funnel/table מ-real data** | demo | `metrics-db` מטפל ב-kpi/gauge/line/bar; funnel/table עדיין demo |
| **HR / מוניטין** | נבנה מאפס (אין OSS) | HR: ATS+PLUG · מוניטין: מנוע Claude sentiment (HELIX Shield) |
| **Executive aggregation (moat)** | לא נבנה | שכבת אגרגציה חוצה-מחלקתית מ-`metric_points` של כל הדשבורדים |
| **הקשחת אבטחה מלאה** | חלקי (AES) | מעבר מ-`connections.config` ל-Supabase Vault ל-production |
| **Tremor polish** | לא אומץ | נשמר עצמאי (recharts) להימנע מקונפליקט Tailwind v4; אפשר לאמץ בהמשך |

**המצב:** הליבה — **מנוע widgets + drag-drop + 3-ways-builder + verticals + auth/persist + 6 connectors חיים + Ollama/בוט + digest מתוזמן + sales pipeline** — נבנתה end-to-end. מה שנשאר בעיקר: **connectors נוספים (Nango/הנהח״ש ישראלי), Executive aggregation, והרצה live**.

### 12.1 מטריצת ניצול הגיטים שנסקרו (שקיפות)
מ-13 הגיטים ששמרנו — מה נוצל בפועל ולמה:
| ריפו | רישיון | ניצול |
|---|---|---|
| **claude-coach-kit** | MIT | ✅ נקצר → מוצר 1 (UTM/email-sequences/payment) |
| **marketing-cli** | MIT | ✅ נקצר → 64 skills (מוצרים 1/3/6) |
| **geo-aeo-tracker** | MIT | ✅ נקצר → מוצר 4 (BrightData + AEO Audit) |
| **builderz marketing-dashboard** | MIT | ✅ נקצר → **Plausible + Mailchimp connectors** (helix-dashboards) |
| **startup-metrics-dashboard** | — | ✅ רעיון → template Startup/AARRR |
| **appsmith** | Apache | 🟡 רפרנס-ארכיטקטורה (drag-drop+connectors) — מומש עם react-grid-layout+registry |
| **redash** | BSD | 🟡 רפרנס — מודל data-source→viz מומש כ-`metric_points` |
| **grafana · metabase** | **AGPL** | ❌ רפרנס-מוצר בלבד — רישוי חוסם קוד מסחרי |
| **refine** | MIT | ⚪ החלטה מודעת לא לבנות עליו (Next נקי, עקביות אקו-סיסטם) |
| **danielbayerlein/dashboard** | MIT | ⚪ status-board ל-DevOps (Jenkins/JIRA) — לא BI עסקי |
| **d2-admin** | — | ❌ Vue — stack זר |
| **open-design** | — | ❌ נכס-עיצוב, לא קוד |

**מסקנה:** 5 נוצלו לקוד/תוכן · 2 רפרנס-רעיוני (מיושם) · 2 חסומי-AGPL · 2 החלטה-מודעת · 2 stack/עיצוב. אין קוד נוסף שווה-קצירה מהרשימה.

## 13. מדריך העברה לשותף (Handoff) 🤝 — Supabase · SQL · WhatsApp · Ollama
הרפו: **`HELIX-DASHBOARDS`** (`Desktop/helix/helix-dashboards`). הקוד מוכן ומקומפל; מה שנשאר לשותף = **החיבורים החיצוניים**. הרצה: `npm install` → `npm run dev`. קובץ `.env.example` + `README.md` בתוך הרפו.

### 13.1 Supabase (הבסיס)
1. פתח פרויקט Supabase → **הרץ את `supabase/schema.sql`** (SQL Editor). זה יוצר את כל הטבלאות (`workspaces`, `memberships`, `connections`, `metric_points`, `dashboards`, `dashboard_widgets`, `widget_library`, `deals`, `digest_subscriptions`, `bot_links`), את ה-RPC `create_workspace`, ואת כל מדיניות ה-**RLS** (בידוד per-workspace).
2. env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (השירות משמש את ה-cron/בוט לעקיפת RLS).
3. **Auth** (magic-link) עובד מהקופסה — רק להגדיר ב-Supabase → Auth → URL Configuration את `NEXT_PUBLIC_SITE_URL/auth/callback` כ-redirect, ולערוך תבנית-מייל אם רוצים.

### 13.2 SQL / מודל הנתונים (הכלל שחשוב להבין)
כל widget קורא **רק** מ-`metric_points` (לא מ-API ישירות). connector = פונקציה שמחזירה שורות `{source, metric, dims, ts, value}` ו-`upsertMetrics` דוחף אותן. **להוסיף מקור נתונים חדש = לכתוב פונקציה שמזרימה ל-`metric_points`** — ה-widgets כבר יידעו לצייר. הקריאה מ-DB: `lib/metrics-db.ts` (מטפל ב-kpi/gauge/line/bar; **funnel/table עדיין demo** — נקודת-הרחבה).

### 13.3 WhatsApp (ערוץ מסירה + נכנס)
- **יוצא (מסירת דוחות)** — כבר מחווט: `lib/channels.ts → sendWhatsApp` דרך **Meta WhatsApp Cloud API**. env: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`. להרשמה ל-digest בוואטסאפ: רשומה ב-`digest_subscriptions` עם `channel='whatsapp'` + טלפון (דרך דף `/digest`).
- **צריך השותף:** אפליקציית Meta + מספר WhatsApp Business + **תבנית "utility" מאושרת** (הודעה יזומה חייבת template מאושר). **§30A ציות:** הודעה קרה = opt-in חובה.
- **נכנס (בוט WhatsApp)** — **לא נבנה** (נבנה רק בוט טלגרם). להוספה: route `/api/whatsapp` שמשכפל את `/api/telegram` (מיפוי `bot_links` → workspace → `workspaceDigest`). זו משימת-שותף ישירה.

### 13.4 Ollama (עדכון אוטומטי + נרטיב עברי, on-prem)
- מחווט ב-`lib/ollama.ts` (**Model Router**): מנסה Ollama קודם (מקומי/חינם/פרטי), נופל ל-Claude. env: `OLLAMA_BASE_URL` (למשל `http://localhost:11434`) + `OLLAMA_MODEL` (למשל `llama3.1`). אם לא מוגדר — נופל ל-`ANTHROPIC_API_KEY`.
- הנרטיב של ה-digest/בוט (`lib/digest.ts`) עובר דרך ה-router. **לפרטיות on-prem:** מריצים Ollama אצל הלקוח; אין יציאת-דאטה. (מתחבר לתפיסת "HELIX Runner" ממוצר 6.)

### 13.5 Cron + טלגרם (כבר מוכן)
- `vercel.json` מגדיר 2 crons: `/api/cron/sync` (יומי — רענון connectors) ו-`/api/cron/digest` (שעתי — שליחת מנויי-digest). env: `CRON_SECRET`.
- טלגרם: `TELEGRAM_BOT_TOKEN` + הצבעת webhook ל-`/api/telegram`. חיבור צ׳אט לנתונים אמיתיים דרך `/digest`.

### 13.6 טבלת env מלאה (מה השותף צריך למלא)
| משתנה | לְמה | חובה? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (client/auth) | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | cron/בוט (עקיפת RLS) | ✅ |
| `NEXT_PUBLIC_SITE_URL` | redirect ל-magic-link | ✅ |
| `SECRETS_KEY` | הצפנת טוקנים ב-`connections.config` | ✅ (מומלץ) |
| `GOOGLE_OAUTH_CLIENT_ID/SECRET/REDIRECT_URI` | connector GA4 | לפי צורך |
| `OLLAMA_BASE_URL` / `OLLAMA_MODEL` | נרטיב מקומי | אחד מהשניים |
| `ANTHROPIC_API_KEY` | נרטיב fallback | אחד מהשניים |
| `TELEGRAM_BOT_TOKEN` | בוט טלגרם | לפי צורך |
| `WHATSAPP_TOKEN` / `WHATSAPP_PHONE_ID` | מסירת וואטסאפ | לפי צורך |
| `RESEND_API_KEY` / `EMAIL_FROM` | מסירת מייל | לפי צורך |
| `FB_APP_ID` / `FB_APP_SECRET` | Meta long-lived token | לפי צורך |
| `CRON_SECRET` | הגנת cron | ✅ (prod) |

### 13.7 מה השותף ממשיך (רשימת-משימות ישירה)
1. הרצת `schema.sql` + מילוי env + Deploy Vercel.
2. **חיבורי Supabase** — הפעלת connectors חיים (GA4/Meta/Stripe/Shopify/Plausible/Mailchimp) דרך `/connect`.
3. **WhatsApp** — אפליקציית Meta + תבנית מאושרת + (אופציונלי) בוט-נכנס `/api/whatsapp`.
4. **Ollama** — הרצת מופע + `OLLAMA_BASE_URL`.
5. **connectors נוספים** — הנהח״ש ישראלי (edge-fn), CRM (Nango/SDK) — לפי 02b.
6. **Executive aggregation** — שכבת-על חוצה-מחלקות (ה-moat).

---
**סיכום:** לא "עוד כלי דוחות שיווק". **פלטפורמת דשבורדים אוניברסלית בעברית לכל העסק** — שיווק, מכירות, הנהלת חשבונות, תפעול, שירות, HR, מוצר, מוניטין, והנהלה. 3 דרכים לדשבורד (מובנה/drag-drop/המלצת-AI) מספריית widgets אחת, עדכונים אוטומטיים דרך Ollama+Claude, ומסירה רב-ערוצית. חינם ל-SMB (wedge), נמכר לסוכנויות (white-label). ה-**Executive Overview** החוצה-מחלקות = ה-moat + שכבת-העל של כל אקו-סיסטם HELIX.

## 🔗 חיבור לאקו-סיסטם HELIX (אינטגרציה עתידית — מיושר בכל המוצרים)
> **כל מוצרי HELIX יהיו מחוברים לכלל אחד.** תשתית אחת, חשבון אחד, דשבורד-על אחד. כל מוצר נבנה כבר עכשיו כך שיתחבר — האינטגרציה המלאה תושלם בהמשך.

- **תשתית משותפת:** אותו Supabase (Auth/DB/Storage/RLS), edge functions, cron, ומנועי נרטיב/הפצה (טלגרם/מייל/וואטסאפ). בונים פעם אחת — כל מוצר מנצל.
- **חשבון וזהות אחידים:** לקוח אחד, workspace אחד, SSO — נע בין המוצרים בלי חיכוך.
- **מוצר 2 (HELIX Reports / דשבורדים) = שכבת-העל המאחדת:** כל המוצרים מזרימים מדדים ל-Reports, שמציג **דשבורד-על אחד** חוצה-מוצרים (תוכן+SEO+GEO, מוניטין, לידים/SDR, ROI).
- **דאטה חוצה-מוצר:** פלט של מוצר אחד = קלט לאחר. דוגמאות: תוצאה שלילית שמזוהה ב-Shield → משימת תוכן ב-Rank · ליד מ-SDR → דוח ב-Reports · תוכן מ-Marketing Ops Hub → הפצה דרך אותו מנוע.
- **cross-sell מובנה:** אותו dashboard חושף את שאר המוצרים — משפך אקו-סיסטם אחד תחת מותג HELIX.
- **סטנדרטים אחידים לחיבור:** אותו stack (React+shadcn+Supabase, RTL), schema/מדדים אחידים, ומנועי נרטיב/הפצה משותפים — כדי שהחיבור בהמשך יהיה דלתא, לא בנייה מחדש.

## 📅 Daily Digest (מודול Agent OS)
> חלק מקו **HELIX Agent OS** (מוצר 6) על מנוע **"תשתית OLLAMA ל-Daily Digest"**. עבור Reports — **הדייג'סט הוא המוצר**: במקום להיכנס לדשבורד, המדדים מגיעים אליך.
- **דוגמת דייג'סט:** "בוקר טוב: תנועה +12% שבוע-על-שבוע · ROAS 3.4 · 18 לידים · הערוץ הכי משתלם: אורגני · ⚠️ פייסבוק ירד ביעילות."
- **סוכנים מתוזמנים:** איסוף מדדים per-מקור, חישוב מגמות, זיהוי חריגות, נרטיב.
- **מנוף Ollama:** אגרגציה/סיכום מספרי על מודל מקומי; Claude+baldiga לנרטיב.
- **תדירות:** יומי (brief) / שבועי / חודשי (דוח מלא), לבחירת המשתמש.

---

# נספח א׳ — ארכיטקטורת שימוש-חוזר + Connectors + Data Lineage
*(מוזג מ-02b — הבלופרינט הטכני: מאיפה הנתונים, מה קוצר, מה נבנה)*

---

## 1. שכבת UI — ליבת ה-Dashboard Builder (הפער מס' 1)
| רכיב | ריפו | רישיון | תפקיד |
|---|---|---|---|
| **Widget/Chart library** | tremorlabs/tremor-npm (16.5k★) | **MIT** ✅ | 35+ קומפוננטות KPI+charts על **recharts+Tailwind** — בדיוק ה-stack שלנו. ספריית ה-widgets המובנית (`widget_library`) |
| **Drag-drop canvas** | react-grid-layout/react-grid-layout | **MIT** ✅ | גרירה/שינוי-גודל/responsive + `onLayoutChange` → שמירת layout ל-`dashboard_widgets`. ה-canvas של ה-3-ways-builder |

**זהו הליבה:** Tremor (widgets) + react-grid-layout (canvas) = ~80% מה-builder בלי לכתוב מאפס. שניהם MIT, שניהם recharts/Tailwind/React.

## 2. תוכן per-מחלקה — מקורות לקצירה/רפרנס
| מחלקה | ריפו | רישיון | שימוש |
|---|---|---|---|
| **מכירות** ⭐ | marmelab/atomic-crm (1.1k★) | **MIT** ✅✅ | **React+shadcn/ui+Supabase+Kanban** — ה-stack המדויק. קציר: מודל pipeline/deals + Kanban → דשבורד Pipeline |
| **שיווק** | builderz-labs/marketing-dashboard | **MIT** ✅ | connectors GA4/Meta/Mailchimp/Plausible + recharts patterns (מקור-קצירה #1 ל-connectors) |
| **שיווק** | krishna-build/claude-coach-kit | **MIT** ✅ | **נקצר** → UTM attribution + email-sequences + payment (מוצר 1 §2.75) |
| **E-commerce** | NordcomInc/react-shopify-analytics | **MIT** ✅ | connector Shopify אמיתי (headless) — קציר ל-widget מכירות/AOV |
| **פיננסים** | gabedossantos/cash-flow | **MIT** ✅ | Next+TS+Prisma — cash-flow/forecast/KPIs. רפרנס-widgets פיננסי |
| **פיננסים** | actualbudget/actual | **MIT** ✅ | בוגר — רפרנס-UX (תקציב/קטגוריות). לא לאמץ שלם |
| **SaaS/הכנסות** | growth-metrics-dashboard (GMD) | לוודא | Stripe MRR/ARR/churn/CAC/LTV — רפרנס-widget SaaS |
| **שירות/CS** | chatwoot/chatwoot | **MIT** ✅ | Reports/CSAT → מזין דשבורד CS (וגם רעיון HELIX Support — IDEAS-BACKLOG) |
| **מוצר** | Openpanel-dev/openpanel | ⚠️ AGPL | funnels/retention/cohorts — **רפרנס בלבד** (AGPL), לא קוד |

## 3. שכבת Connectors — משיכת נתונים מ-SaaS חיצוני (הפער מס' 2)
הדשבורדים **חייבים למשוך** מ-GA4/Ads/Meta/CRM/הנהח"ש/Shopify/Support/תשלומים. רוב ה-templates לעיל נותנים UI+דאטה-משלהם, **לא** connectors. הפתרון — שילוב:

| שכבה | מקור | רישיון | תפקיד |
|---|---|---|---|
| **מנוע connectors ראשי** ⭐ | NangoHQ/nango (7.2k★) | ⚠️ **Elastic v2** | 800+ APIs — OAuth/refresh/proxy/functions מנוהלים, self-host, חושף MCP לסוכני HELIX. **הליבה של שכבת החיבורים** |
| **חלופת ETL נקייה** | meltano/meltano | **MIT** ✅ | Singer-based, אם נרצה נתיב-warehouse בלי מגבלת Elastic v2 |
| **SDKs רשמיים** | pipedrive/client-nodejs (+HubSpot/Salesforce/Xero/QuickBooks) | מתירני | חיבורים ספציפיים בלי תלות במנוע |
| **edge-functions שלנו** (כבר קיים) | helix-ops/helix-rank | — | GA4 (`lib/ga4`), Meta, Stripe (`payment-webhook`), Google-Sheet (`gsheet-webhook`), track-visitor |
| **הנהח"ש ישראלי** | GreenInvoice/חשבשבת/רווחית API | — | **אין OSS — נבנה edge-function ייעודי** (בול לשוק הישראלי) |

**אסטרטגיה:** Nango כמנוע-על ל-OAuth+800 APIs → ליפול ל-SDK רשמי/edge-function ל-connectors קריטיים (GA4/Meta/Stripe כבר בנויים) → הנהח"ש ישראלי = build ייעודי (הבידול המקומי).

## 3.5 מאיפה כל מספר מגיע — Data Lineage per-widget 🔑
**עיקרון-העל:** connector (Nango/edge-fn/SDK) מושך → **מנרמל** → כותב שורה ל-`metrics_cache` (Supabase). **ה-widget קורא רק מ-`metrics_cache`, לעולם לא מ-API ישירות.** כך הדשבורד מהיר, עובד offline מול cache, ומקור-אחד-לאמת. הרענון (Ollama+cron §0.3) מעדכן את ה-cache.

```
[SaaS חיצוני] → [Connector: Nango / edge-function / SDK] → [normalize] → [metrics_cache (Supabase)] → [Widget (Tremor)]
```

### מיפוי מלא — כל דשבורד → כל מדד → מקור הנתונים
| דשבורד | מדד | מאיפה הנתון (connector) | סטטוס מקור |
|---|---|---|---|
| **שיווק** | תנועה / top content | GA4 Data API | ✅ `lib/ga4` קיים |
| | ROAS / spend / CPL | Meta Ads API + Google Ads API | 🟡 builderz (Meta) + חדש (G-Ads) |
| | דיוור (open/click) | `mkt_email_log` (Resend) | ✅ נקצר (coach-kit) |
| | SEO / GEO | HELIX Rank (פנימי) | ✅ קיים |
| **מכירות** | deals / stages / conversion / forecast | CRM: HubSpot/Pipedrive (Nango/SDK) **או** atomic-crm native | 🟡 קציר atomic-crm + Nango |
| | leaderboard | אותו CRM | 🟡 |
| **פיננסים** | תזרים / הכנסות / הוצאות | GreenInvoice/חשבשבת/רווחית API | ❌ **edge-fn ייעודי (build)** |
| | **מע"מ** / AR aging | אותו מקור הנהח"ש | ❌ build (בידול ישראלי) |
| | burn / runway | הנהח"ש + Stripe balance | 🟡 Stripe קיים חלקית |
| **תפעול** | הזמנות / מלאי / משלוחים / SLA | ERP / חנות (Shopify/Woo/custom API) | 🟡 Shopify (shopify-analytics) |
| | ספקים | ERP | ❌ תלוי-לקוח |
| **שירות/CS** | tickets / זמן-תגובה / CSAT / NPS | Chatwoot API / Zendesk / Intercom (Nango) | 🟡 Chatwoot |
| | churn-risk | CS data + מודל | ❌ build |
| **HR** | headcount / attrition / time-to-hire | ATS + PLUG DB | ❌ **build** (אין OSS) |
| **מוצר** | DAU/MAU / adoption / funnels / retention | Mixpanel/Amplitude/PostHog/GA4 (Nango) | 🟡 GA4 קיים, שאר Nango |
| **E-commerce** | מכירות / AOV / נטישת-עגלה / top products | Shopify/Woo (react-shopify-analytics + Nango) | ✅ shopify-analytics |
| **מוניטין** | אזכורים / סנטימנט / Reputation Score | HELIX Shield: Google Business/Yelp/social + **Claude sentiment** | ❌ build (Shield) |
| **סטארטאפ/AARRR** | Acquisition→Revenue | GA4 + Mixpanel + CRM + Stripe (חוצה-מקורות) | 🟡 חלקי |
| **Executive** ⭐⭐ | מבט-על חוצה-מחלקות | **אגרגציה מ-`metrics_cache` של כל הדשבורדים** | ❌ **build (ה-moat)** |
| **כל דשבורד** | חיבור מוצרי HELIX | Rank/Shield/Ops/SDR מזרימים ל-`metrics_cache` | 🟡 מתהווה |

**קריאת המפה:** ✅=מקור בנוי · 🟡=OSS לקצור/Nango · ❌=נבנה מאפס. רוב ה-❌ מרוכזים ב**בידול הישראלי** (הנהח"ש/מע"מ) וב-**moat** (Executive/מוניטין/HR) — בדיוק מה שלא רוצים לקנות מבחוץ.

## 4. מה נבנה מאפס (אין OSS ראוי ב-stack שלנו)
- **HR/People** — כל ה-OSS הוא Power BI/Tableau/Streamlit. נבנה widgets: headcount/attrition/time-to-hire/diversity (מקור: ATS + PLUG).
- **מוניטין** — ה-sentiment שלנו (Claude/Haiku, עברית, רב-מחלקתי) **עדיף** על כל TF-IDF/LogReg OSS. נבנה מאפס על מנוע HELIX Shield.
- **Executive Overview (ה-moat)** — שכבת האגרגציה החוצה-מחלקתית. אין לזה מקור — זה הלב הייחודי של HELIX DASHBOARDS.
- **מנגנון 3-ways** (template / drag-drop / AI-recommend) על ספריית-widget אחת — הלוגיקה שלנו, מעל Tremor+grid.

## 5. מטריצת רישוי (סיכום)
| ✅ מותר קוד (MIT/BSD/Apache) | ⚠️ שימוש-מוגבל | ❌ רפרנס בלבד (AGPL) |
|---|---|---|
| Tremor · react-grid-layout · atomic-crm · builderz · coach-kit · shopify-analytics · cash-flow · Actual · Meltano · Chatwoot · Pipedrive SDK · Refine · danielbayerlein | **Nango (Elastic v2 — לא כ-service)** | OpenPanel · Grafana · Metabase · Superset · Redash(BSD✅ למעשה) · ToolJet |

## 6. סדר בנייה (MVP → מלא)
1. **ליבת UI** — Tremor widgets + react-grid-layout canvas + מודל `widget_library`/`dashboard_widgets` (Supabase). דשבורד ריק שאפשר לגרור אליו widgets.
2. **דשבורד ראשון end-to-end** — שיווק: חבר GA4 (edge-function קיים) + Meta (builderz) → 4 widgets אמיתיים. מוכיח את הצינור.
3. **מכירות** — קציר atomic-crm (pipeline/Kanban) → דשבורד Pipeline + connector CRM (Nango/Pipedrive SDK).
4. **Connectors scale** — הקמת Nango self-host כמנוע-על; הוספת Shopify/Stripe/תשלומים.
5. **פיננסים ישראלי** — edge-function GreenInvoice/חשבשבת (הבידול המקומי) → דשבורד Finance.
6. **3-ways builder** — template-gallery + AI-recommend מעל אותה ספריית-widget.
7. **Executive Overview** — שכבת אגרגציה חוצה-מחלקתית + נרטיב-AI עברי (baldiga) + מסירה רב-ערוצית (Ollama+WhatsApp/Telegram/email).

> **סיכום:** ~70% מ-HELIX DASHBOARDS מורכב מרכיבים MIT קיימים (UI: Tremor+grid · מכירות: atomic-crm · connectors: builderz+coach-kit+Nango+SDKs). ה-30% הייחודי שנבנה מאפס — **מנגנון 3-ways, הנהח"ש ישראלי, sentiment עברי, ו-Executive Overview** — הוא בדיוק ה-moat.
