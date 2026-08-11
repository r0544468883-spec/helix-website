# HELIX CRM — Extension-Package Map + Multi-Tenant 🧩 (Spec)

> מסמך-לוויין ל-[[HELIX-ECOSYSTEM-FREE-CRM-HUB]]. ממפה **בדיוק** מה כל מוצר בתשלום מוסיף ל-CRM המשותף (pipeline + properties + objects), ואיך עובד המודל הרב-דיירי (multi-tenant). ה-blueprint = ה-Hubs וה-objects של HubSpot, מותאם לעברית ולמוצרי HELIX.
>
> תאריך: 2026-08-11 · מקורות מצוטטים בתחתית.

---

## 0. ה-blueprint מ-HubSpot (מה למדנו, מדויק)

### א. Default Deal Pipeline — 7 שלבים עם משקל-הסתברות
כל שלב נושא **win-probability** → זה מה שמאפשר forecasting. זה התבנית לכל פייפליין שלנו.

| שלב | הסתברות |
|---|---|
| Appointment scheduled | 20% |
| Qualified to buy | 40% |
| Presentation scheduled | 60% |
| Decision maker bought-in | 80% |
| Contract sent | 90% |
| **Closed won** | 100% |
| **Closed lost** | 0% |

([forecastio.ai/hubspot-pipeline-stages](https://forecastio.ai/blog/hubspot-sales-pipeline-stages), [knowledge.hubspot.com/pipelines](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines))

### ב. Default Properties לפי קטגוריה (המפתח למיפוי)
מ-[KB רשמי contact properties](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties) ו-[lead properties](https://knowledge.hubspot.com/properties/hubspots-default-lead-properties):

- **שיווק/אנליטיקה:** Original/Latest Traffic Source (+drill-down), First/Last page seen, First/Last referring site, First/Recent conversion, Number of form submissions, Number of page views, Number of sessions.
- **מייל:** Marketing emails opened/clicked, Sends since last engagement.
- **מכירות:** Lifecycle stage, Lead status, Last activity date, Next activity date, Number of sales activities, HubSpot score, Likelihood to close.
- **prospecting (Lead object):** Lead Label (status), Lead Type, Pipeline Stage, Call/Email/Meeting/Outreach **Activity Count**, **Message Thread Count (SMS/LinkedIn/WhatsApp)**, First Outreach Date, Primary Contact Enrolled in Sequence, Lead Owner.
- **engagement/סושיאל:** Currently in sequence, Number of sequences enrolled, LinkedIn URL.

> **תובנה:** HubSpot כבר מחזיקים property מובנה **Message Thread Count (SMS/LinkedIn/WhatsApp)** — מתלבש מושלם על תשתית ה-WhatsApp שלנו ([[whatsapp-bot-linking]]).

---

## 1. HELIX Rank (SEO/GEO) → **חבילת שיווק** 🔍
מקבילה ל-Marketing Hub: מקורות תנועה, המרות, תוכן.

**Pipeline שנפתח — "תוכן/SEO":** (משקל-הסתברות בסגנון deal)
`רעיון → Brief → טיוטה → פורסם → אינדוקס → מדורג (top-10) → ממיר`
ענף מקביל: `GEO-cited` (צוטט ב-ChatGPT/Perplexity/Gemini).

**Contact properties שנוספים** (מראה את קטגוריית השיווק של HubSpot):
- Original/Latest Traffic Source · First/Last page seen · First/Last referring site
- Recent conversion · Number of form submissions · Number of page views · Number of sessions
- **חדש-HELIX (GEO):** `ai_engine_referrer` (איזה מנוע-תשובות הפנה), `geo_citation_status`

**Company properties:** domain authority, indexed pages, organic sessions/mo.

**Objects חדשים:**
- `content_piece` — target_keyword, serp_position, geo_citation_status, url, word_count, published_at, converting(bool)
- `keyword` — volume, difficulty, current_rank, intent(informational/commercial/…)

---

## 2. HELIX OPS → **חבילת engagement** 💬
OPS = gray-path auto-comment ב-FB/IG/LinkedIn ([[helix-ops-engagement-agent]]). מקבילה חלקית ל-Sales/Social.

**Pipeline שנפתח — "engagement":**
`זוהה → הוגב → הגיב-בחזרה → DM → ליד/פגישה`

**Contact properties שנוספים:**
- LinkedIn URL (default) · social_channel · engagement_score · last_engagement_date · number_of_engagements
- **חדש-HELIX:** `graypath_status`, `comment_sentiment`, `autonomy_mode_used` (מתג האוטונומיה — [[autonomy-switch-program]])

**Objects חדשים:**
- `engagement` — channel, post_url, comment_text, sentiment, autonomy_mode, created_at
- `social_account` — platform, handle, connected_at

---

## 3. HELIX SDR/BDR → **חבילת prospecting** 🎯
המיפוי הישיר ביותר: HubSpot כבר יש להם **Lead object** — מאמצים כמעט 1:1.

**Pipeline שנפתח — "prospecting/lead":**
`New → Enriched → Sequenced → Engaged → Qualified` → (מוסר ל-Deal pipeline של ה-CRM)

**מאמצים את ה-Lead object של HubSpot** (שמות מדויקים):
- Lead Label (status) · Lead Type · Pipeline Stage · Lead Owner · Owner Assigned Date
- **Activity counts:** Call Count · Email Count · Meeting Count · Outreach Activity Count · **Message Thread Count (SMS/LinkedIn/WhatsApp)**
- First Outreach Date · Next Activity Date · Primary Contact Enrolled in Sequence

**Contact properties שנוספים:**
- העשרה (own-first, fire-enrich — [[helix-sdr-bdr-bot]]): company, role_title, company_size, industry
- `icp_score` · Currently in sequence · Number of sequences enrolled

**Objects חדשים:**
- `lead` — בסגנון HubSpot (לעיל)
- `sequence` — steps[], channel, stop_on_reply(bool)

---

## 4. טבלת-על: כל מוצר → מה נפתח ב-CRM

| מוצר | Pipeline | Objects חדשים | Signature properties |
|---|---|---|---|
| **Rank (SEO/GEO)** | תוכן/SEO | content_piece, keyword | traffic source, serp_position, geo_citation_status |
| **OPS** | engagement | engagement, social_account | engagement_score, graypath_status, autonomy_mode |
| **SDR/BDR** | prospecting/lead | lead, sequence | Lead Label, Outreach counts, Message Thread Count |
| **MEETING** (freemium) | פגישות | meeting | 6 סיגנלים, promise-ledger |
| **כנסים/GRAIN** (חינם) | כנסים | conference, card_scan | temperature (חם/פושר/קר) |

> כל חבילה = schema/config שנטען **מותנה-entitlement** על אותו Supabase. לקוח עם 3 מוצרים = CRM אחד עם 3 פייפליינים, לא 3 מערכות.

---

## 5. מודל רב-דיירי (Multi-Tenant) 🏢
שלוש רמות — שאובות מהמודל של HubSpot (Business Units מול Separate Portals):

### רמה 1 — Workspace = דייר (כבר קיים)
ה-CRM שלנו כבר רב-דיירי: RLS לפי `owner_id`/workspace ([[HELIX-CRM-SPEC]] §4). כל לקוח = workspace מבודד. זה הבסיס.

### רמה 2 — "Business Units" לסוכנויות (עתידי)
המקבילה ל-**HubSpot Business Units**: *חשבון אחד, מספר מותגים/לקוחות, DB משותף עם partitioning*. סוכנות שמנהלת כמה לקוחות תחת חשבון HELIX אחד:
- מותג לכל לקוח (לוגו/דומיין/צוות/מטריקות נפרדים)
- **partitioning של contacts** — לידים של לקוח A לא מקבלים outreach של לקוח B
- CRM-DB משותף → אפשר cross-sell ומדידה per-מותג
- ([pixcell.io/hubspot-business-units](https://www.pixcell.io/blog/hubspot-account-hierarchy-business-units-vs.-teams), [smartbugmedia](https://www.smartbugmedia.com/blog/multiple-business-units-domains-and-accounts-your-hubspot-customer-portal))

### רמה 3 — Separate Portals (בידוד מלא)
כשאין קשר בין הדיירים (סיבות משפטיות/צוותים עצמאיים) → workspaces נפרדים לגמרי, אין שיתוף. זה כבר מה שקורה בין לקוחות שונים אצלנו.

> **החלטה:** רמה 1 קיימת. רמה 2 (Business Units לסוכנויות) — פיצ'ר-על עתידי; לתעדף כשיהיו לקוחות-סוכנות. לא לחסום את P1–P3 של האקוסיסטם.

---

## 6. איך זה מתחבר לתמחור
- **חינם:** CRM ליבה + פייפליין אחד + כנסים + Calendly (בהשראת free-tier של HubSpot: 1,000 contacts, pipeline אחד).
- **טריגר-שדרוג מרכזי:** **multi-pipeline** — הרגע שלקוח רוצה פייפליין שני (SEO נפרד ממכירות) = חבילת-הרחבה בתשלום. HubSpot הוכיחו שזו נקודת-מונטיזציה. → ליישר עם [[helix-pricing-master]].

---

## מקורות
- [hubspot.com/products/crm](https://www.hubspot.com/products/crm) · [products/sales](https://www.hubspot.com/products/sales)
- [Default contact properties (KB)](https://knowledge.hubspot.com/properties/hubspots-default-contact-properties) · [Default lead properties (KB)](https://knowledge.hubspot.com/properties/hubspots-default-lead-properties)
- [Default pipeline stages](https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines) · [forecastio pipeline stages](https://forecastio.ai/blog/hubspot-sales-pipeline-stages)
- [Business Units guide](https://www.pixcell.io/blog/hubspot-account-hierarchy-business-units-vs.-teams) · [SmartBug BU/portals](https://www.smartbugmedia.com/blog/multiple-business-units-domains-and-accounts-your-hubspot-customer-portal)
