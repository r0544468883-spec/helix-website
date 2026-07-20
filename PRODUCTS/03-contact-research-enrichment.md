# פרויקט 3: מחקר איש-קשר + Data Enrichment + AI-SDR 🟢🔴

> כלי מודיעין אנשים/חברות + העשרת דאטה + **agent מכירות אוטומטי מובנה** רב-ערוצי.
> Hebrew-first · **ציות-first** · נמכר עצמאי **וגם** כחלק מחבילת השיווק.
> תאריך: 2026-07-16 · סטטוס: מתוקף שוק לעומק, טרם נבנה.
> ⚠️ שוק צפוף + סיכון משפטי — הבידול הוא ציות + AI + מקומיות + הכל-מובנה, **לא** גודל דאטה.

---

## 1. קהל ושימוש (לפי בחירת המשתמש: 1+3+4)
- **מכירות/פרוספקטינג** — חוקרים ליד לפני פנייה (מתחרה ל-Lusha/Apollo).
- **שיווק/משפיענים** — מחקר אאודיינס/שגרירים (מתחבר לכלים 1+2).
- **מודיעין עסקי כללי** — מחקר רחב על אדם+חברה ממקורות פומביים.
- **מבנה:** עצמאי **וגם** מודול בתוך Marketing Ops Hub.

## 2. תיקוף שוק — מה כל מתחרה עושה הכי טוב
| כלי | הכי טוב | מחיר | חולשה |
|---|---|---|---|
| **Clay** ⭐ | Waterfall enrichment (150 ספקים→80% כיסוי) + Claygent (AI חוקר+כותב per-row) | חינם→$185+ | עקומת למידה, שריפת קרדיטים |
| **ZoomInfo** | דאטה הכי מדויקת+intent עשיר | $15-60k/שנה | נעילת חוזה, יקר |
| **Apollo** | הכל-באחד זול (דאטה+רצפים+חייגן+AI) | חינם→$149/משתמש | דיוק (bounce 15-35%) |
| **Lusha** 🇮🇱 | טלפון בקליק מלינקדאין | ~$37/משתמש | **חקירת GDPR באיטליה**, דיוק מחוץ US |
| **Clearbit→HubSpot Breeze** | enrichment **מובנה ב-CRM** | נעול ל-HubSpot Pro | תלוי HubSpot |
| **Hunter** | מציאת+אימות אימייל לפי דומיין | חינם→$49 | אין טלפונים |
| **RocketReach** | רוחב חיפוש, אימיילים אישיים | $69-209 | דאטה מיושנת, billing רע |
| **Cognism** | מספרים מאומתים ידנית + **תואם GDPR** ("ציות כמוצר") | $15k+/שנה | חלש ב-US |

### התובנה המרכזית
**enrichment הופך לפיצ'ר מובנה בתוך המערכת** (HubSpot Breeze, Salesforce Agentforce), לא כלי נפרד. השאר מדביקים ידנית **Clay+n8n+LLM+כלי מייל** — וה"דבק" הזה הוא הכאב שאנחנו נבנה BUILT-IN.

### הכלי שלנו — מוסיף לרשימה
> **עושה הכי טוב:** צינור מקצה-לקצה **מובנה** (איתות→enrichment→מחקר AI→הודעה מותאמת→רצף רב-ערוצי) — עברית-first, ציות-first, נמכר דרך הסוכנות. **לא מנצחים בדאטה — מנצחים בהתאמת-AI + ציות + מקומיות + הכל-מובנה.**

## 3. ה-AI-SDR Agent המובנה (עמוד התווך)
כמו HubSpot Prospecting Agent / Salesforce Agentforce SDR: agent 24/7 שמזהה איתות→מעשיר→חוקר→כותב→שולח (עם אישור אנושי + חסימת ציות).

### ערוצים (adapters) — **כולם נכנסים**, ההבדל הוא בשיטה ובקצב, לא ב"אם"
| ערוץ | נכנס? | השיטה הבטוחה |
|---|---|---|
| **טלגרם** | ✅ | Bot API ישיר. hermes-agent כבר עושה |
| **אימייל** | ✅ | ישיר. §30A: קר=opt-in, חם—בסדר |
| **וואטסאפ** ⭐ | ✅ | Cloud API + תבניות מאושרות. **הערוץ מס' 1 בישראל — Klaus לא עושה אותו = wedge** |
| **לינקדאין** | ✅ | דרך session של המשתמש (extension) + rate-limit (~100-150/שבוע), או wrap ל-PhantomBuster/HeyReach API |
| **מסנג'ר/IG** | ✅ | נכנס=בוט (ManyChat-style); יוצא=DM מוגבל בזהירות (סיכון חסימה הכי גבוה) |
**גישה:** מנוע ניטרלי + adapters. מתחילים טלגרם+אימייל+וואטסאפ (הקלים+החוקיים), מוסיפים לינקדאין/מסנג'ר בזהירות. n8n כשכבת מסירה. **חסימת ציות מובנית per-ערוץ** (חוסם SMS/וואטסאפ קר בישראל). הפילוסופיה: **בונים הכל, מנהלים סיכון בחוכמה** כדי שלא יחסמו חשבונות/יחטפו קנס.

### 🔀 אומניצ'אנל (Unibox מאוחד) — פיצ'ר ליבה
תיבה **אחת** לכל הערוצים: כל התגובות (מייל, וואטסאפ, לינקדאין, טלגרם, מסנג'ר) נוחתות במקום אחד, עם ההקשר המלא של השיחה והליד. עקרונות:
- **זהות אחת ללקוח** על פני כל הערוצים (אותו ליד = thread אחד, גם אם ענה בשני ערוצים).
- **מעבר בין ערוצים באמצע שיחה** בלי לאבד היסטוריה (התחיל במייל → ממשיך בוואטסאפ).
- **תור אחיד** של תגובות ממתינות + סיווג AI (interested/objection/not-now) חוצה-ערוצים.
- **בחירת ערוץ חכמה** — ה-agent בוחר את הערוץ עם סיכוי המענה הגבוה ביותר per-ליד, בכפוף לכללי הציות.
זה ה-Unibox של Klaus — **פיצ'ר חובה**, ומתחבר גם ל-Marketing Ops Hub (מוצר 1) כתיבת תקשורת-לקוח מאוחדת.

### 📚 3.5 ספריית ה-Playbooks של ה-SDR (מתודולוגיית-מכירה מובנית) 🆕
מנוע ה-SDR לא רק "כותב מיילים" — הוא מריץ **playbooks מוכחים** של אופרטור-מכירות. החומר עובד ומותאם ל-HELIX (עברית-first, §30A ציות) ממאגר ה-skills של **`markster-public/markster-os` (MIT)** — 4 סקילי-ליבה + prompts מחקר. כל סקיל בנוי **CHECK → DO → VERIFY** ולא רץ אם התנאים המקדימים חסרים (מונע קמפיינים שנשרפים):

| Playbook | מה עושה | הליבה המתודולוגית |
|---|---|---|
| **Prospect Brief** 🎯 | מקלט שם/חברה/LinkedIn → **cheat-sheet קריא-בטלפון** לפני שיחה | ציון התאמת-ICP · אסטרטגיית-שיחה · 2-3 התנגדויות צפויות + מענה · proof-point רלוונטי · "דבר אחד לזכור" |
| **Cold Email** ✉️ | בונה **רצף 6-שלבים** (Research→Segment→Write→Verify→Send→Measure) | gates לפני שליחה: ICP+trigger מוגדר · offer עובר "Stranger Test" · תשתית שליחה (SPF/DKIM/DMARC+warmup) · **שימוש ב-verbatims של הקונה, לא בשפה שלנו** |
| **Sales Operator** 🤝 | discovery / proposal / close לפי stage | מבנה שיחת-גילוי 45 דק' (SPIN-style: situation→implication→solution→next-step) · qualification threshold · "9 Kill Skills" audit לבעיות המרה |
| **Follow-Up** 🔁 | follow-up **stage-aware** — לעולם לא "just checking in" | מטריצת-cadence לפי stage×ימי-שתיקה (met→post-discovery→proposal→dark→ghost→nurture) · כל נגיעה מוסיפה ערך (proof/מאמר/דאטה) · break-up אחרי 3 |

**prompts מחקר נלווים** (הזנה ל-Prospect Brief + Cold Email): buyer Jobs-to-be-Done · buying-signals/trigger-events · competitive-intelligence · first-60-seconds-messaging · pricing/value-perception. כולם מתורגמים/מותאמים לעברית ולנישות ישראליות.

**איך זה משתלב במנוע:** ה-agent (§3) מזהה איתות→מעשיר→**מריץ Prospect Brief**→בוחר ערוץ (Unibox §3.4)→**Cold Email/Follow-Up playbook** לניסוח→אישור אנושי→שליחה. ה-CHECK gates של הסקילים = שכבת-איכות שמונעת מהאוטומציה לשלוח זבל. **הבידול:** רוב ה-SDR-tools מייצרים טקסט; אנחנו מריצים **מתודולוגיה שלמה עם gates**, בעברית, עם ציות מובנה.

> מקור: `markster-public/markster-os` (MIT). נלקחו ה-playbooks/prompts (תוכן), לא הקוד (Python/CLI זר). ScaleOS trademarked — לא ממתגים כשלנו.

**תוספת — Marketing Skills Pack (MIT):** מ-`MoizIbnYousaf/marketing-cli` נקצרה ספריית **64 skills** (פורמט `SKILL.md`) ל-`helix-ops/skills-marketing/`. הרלוונטיים ל-SDR: **lead-generation · company-research · competitive-intel · competitor-alternatives · churn-prevention · direct-response-copy**. משלימים את ה-4 playbooks לעיל — ה-agent טוען אותם דרך ה-registry של Agent OS (מוצר 6).

## 4. תוכנית בנייה — אבני בניין
### דאטה (מאיפה מגיע — אין קסם)
אתרי חברה (scrape) · ניחוש+אימות אימייל · רשמי חברות (רשות התאגידים/OpenCorporates) · WHOIS/MX · חיפוש. **לא לבנות על scraping של לינקדאין** (hiQ נגמר עם צו מניעה + $500k; רק דרך session של המשתמש).

**מקור נוסף — לידים מעסקים מקומיים (🆕):** **Google Maps API + Outscraper** לגריפת עסקים לפי אזור/קטגוריה → זרם לידים ל-local-business (בול לישראל: "מספרות בת"א", "מוסכים בחיפה"). רעיון-מקור מ-`Ambitious-Concepts-Labs/LeadGenerationAPI` (Python/FastAPI, בלי license — **רק הרעיון, לא הקוד**). משלים את ה-waterfall/SpiderFoot בשכבת ה-local-business שחסרה.

### OSS (רישוי נבדק)
| רכיב | ריפו | רישוי | תפקיד |
|---|---|---|---|
| scrape→markdown | **firecrawl** (147k★) | AGPL (SDK MIT) | איסוף אתרים ל-LLM. self-host כ-sidecar |
| scrape LLM | crawl4ai (73k★) | Apache ✅ | חלופה עם רישוי נקי |
| אימות אימייל | **AfterShip/email-verifier** (1.6k★) | **MIT** ✅ | syntax+MX+SMTP. ברירת מחדל |
| אימות אימייל | reacherhq/check-if-email-exists (9k★) | AGPL/מסחרי | חזק יותר, צריך רישיון מסחרי |
| OSINT חברה/דומיין | **SpiderFoot** (19.7k★) | **MIT** ✅ | 200+ מודולים. **sidecar, מודולים עסקיים בלבד** |
| OSINT username | Sherlock (86k★) | MIT ✅ | username→400 רשתות. בזהירות (אישי) |
| הודעת AI מותאמת | **Claude (כבר מחווט ב-plug-chat)** | — | הבידול. structured JSON→הודעה "fuzzy". near-zero build |

### SpiderFoot — פירוט
אפליקציית Python (לא צריך Kali — Kali רק מגיע איתה). `docker run` → REST API. edge function שלנו קורא ל-API, מריץ סריקה על דומיין, מזין JSON לצינור. **sidecar נפרד, מודולים עסקיים בלבד** (לא OSINT אישי עמוק).

### מנוע Waterfall (native — הבידול מול הכאב של Clay)
מערך ספקים per-שדה ב-Supabase config → edge function מדלג בסדר, עוצר על תוצאה מאומתת, מתעד `resolved_by`+confidence, **מחייב רק על hit** (נגד שריפת הקרדיטים). זול→יקר, cache אגרסיבי, **עלות גלויה per-row לפני הרצה**.

## 📱 מסכים (Screens)
1. **Search / Research** — הזנת שם/דומיין/חברה → פרופיל מועשר (אדם+חברה) + מקורות.
2. **Lists / Segments** — רשימות לידים, ייבוא CSV, פילוח.
3. **Enrichment view** — per-ליד: שדות שנמצאו, confidence, `resolved_by` (waterfall), עלות.
4. **Sequence builder** — רצף רב-ערוצי (איתות→enrich→מחקר→הודעה→follow-up).
5. **Message composer** — טיוטת הודעה מותאמת-AI per-ליד (עברית/אנגלית) + אישור.
6. **🔀 Unibox** — תיבה מאוחדת לכל הערוצים, סיווג תגובות, thread per-ליד.
7. **Compliance / Suppression** — רשימת דיכוי, opt-out, LIA, הגדרות ציות per-ערוץ.
8. **Settings** — חיבורי ערוצים, ספקי enrichment (waterfall config), מיתוג/הרשאה.
9. **Agency Hub** — ריבוי workspaces, white-label.

## 🗄️ מודל נתונים (Supabase, RLS per-workspace)
| טבלה | שדות עיקריים |
|---|---|
| `workspaces` | id, name, plan, branding, compliance_config |
| `contacts` | workspace_id, name, company, domain, title, linkedin_url, source, status |
| `enrichment_fields` | contact_id, field, value, confidence, resolved_by, source, cost |
| `enrichment_providers` | workspace_id, field, provider_order[] (waterfall config) |
| `companies` | domain, name, industry, size, data_json |
| `sequences` | workspace_id, name, trigger, steps_json |
| `sequence_enrollments` | sequence_id, contact_id, current_step, status |
| `threads` | contact_id, workspace_id, last_channel, classification |
| `messages` | thread_id, channel, direction (in/out), body, status ← **Unibox** |
| `channel_connections` | workspace_id, channel, tokens/config |
| `suppression_list` | workspace_id, contact_key, reason ← **opt-out/מחיקה** |
| `consent_log` | contact_id, basis, source, timestamp ← **ציות** |

## 🏗️ ארכיטקטורה (רכיבים)
- **Frontend:** React + shadcn (RTL).
- **Backend:** Supabase (Auth, DB, Storage, RLS).
- **Enrichment engine:** edge function waterfall (providers config) + email-verifier + **firecrawl/SpiderFoot כ-sidecars**.
- **Research + message agent:** Claude (מחקר per-ליד → JSON → הודעה מותאמת) + Hebrew Content by Helix / skills אנגלית + הגהה + גייט AI-detection.
- **Channel adapters + Unibox:** וואטסאפ/טלגרם/מייל/לינקדאין(session)/מסנג'ר — **משותף עם מנוע ההפצה של מוצר 1**. webhooks נכנסים → `threads`/`messages`.
- **Compliance layer:** גייט `suppression_list` לפני כל שליחה + בדיקות §30A/GDPR.
- **Orchestration:** n8n כדבק אופציונלי.

## 5. משפטי/ציות — כפיצ'ר, לא מכשול
- **GDPR:** בסיס = legitimate interest (לא consent). public/business בלבד, שקיפות מקור, opt-out בכל הודעה, LIA per-קמפיין, זכות מחיקה → **רשימת דיכוי מרכזית מהיום הראשון**.
- **ישראל — תיקון 13** (בתוקף אוג' 2025, מיושר ל-GDPR): רישום מאגר מצומצם. **לא להיות "סוחר נתונים"** (למכור מאגר = חובות כבדות) — להיות **כלי** שהמשתמש מפעיל בשמו.
- **חוק הספאם §30A (תיקון 40):** **opt-in!** קנס עד ₪1,000/הודעה בלי הוכחת נזק. **SMS/וואטסאפ קר בישראל = חסום.** הכלי **חוסם/מזהיר** על קר → הופכים ציות ליתרון מכירה ("compliant-by-default").
- ⚠️ לפני שליחה בישראל — אישור עו"ד על פרשנות §30A.

## 6. CloserClaus / "Klaus" — **מתחרה ישיר + בלופרינט** (תוקן 2026-07-16)
> תיקון: מחקר קודם שגה. Klaus הוא **AI SDR**, בדיוק המוצר שלנו — לא marketplace אנושי (זה רק ה-tier "Omega+" שלו).

**מה Klaus עושה:** מעלים לידים → כותב מיילים, שולח DM בלינקדאין, מטפל בכל תגובה, קובע פגישות ביומן, 24/7. 70+ סוכנויות. תמחור שטוח $49/$99/$149.
**פיצ'רים ללמוד ממנו:** Unibox (תיבה מאוחדת) · סיווג תגובות (interested/objection/not-now/not-interested) · טיפול בהתנגדויות מאומן על proof-points · תזמון follow-up · קביעת פגישה · "אימון" על ההצעה+טון · **סולם אמון** (Founder=ידני→Pro=אוטונומי).

**איפה מנצחים אותו:**
| | Klaus | אנחנו |
|---|---|---|
| שפה | אנגלית | **עברית-first** |
| ערוצים | מייל+לינקדאין | **+וואטסאפ (מס' 1 בישראל!)**, טלגרם, מסנג'ר |
| לידים | "אתה מביא" | **enrichment מובנה** |
| ציות | — | **§30A ישראלי מובנה** |

לגנוב ממנו גם: **תמחור מבוסס-תוצאה**, **מודול הרשאה/ייצוג** (ה-agent שולח בשם לקוח), **מסגור reseller** לסוכנות.

## 7. פסק דין ריאלי (build vs buy)
**כן לבנות — מוצר ממוקד, לא clone של ZoomInfo/Clay.** אי אפשר לנצח בגודל דאטה (המוט האמיתי). מנצחים ב: **שכבת התאמת-AI מוצדקת ומקומית + ציות-first + הכל-מובנה + עברית**. כיסוי ריאלי: חזק על חברה+תפקיד+אימייל-מאומת ל-SMB עם נוכחות web; חלש על מובייל/enterprise/freshness — וזה wedge מכיר.

## 8. סיכונים
- **משפטי (הכי גבוה)** — עיצוב ציות מהיום הראשון, לא בדיעבד.
- **שוק צפוף + Lusha ישראלית** — הבידול חייב להיות עברית+ציות+מובנה, לא "עוד מאגר".
- **דאטה מוט** — לא להתחרות בגודל; להתחרות בחוויה.
- **AGPL (firecrawl/reacher)** — sidecar/רישיון מסחרי.

## 9. ניסויי תיקוף
1. **דיוק דאטה ישראלי** — לדגום 50 אנשי קשר ישראלים, להשוות כיסוי מול Lusha. (לפני התחייבות!)
2. **fake-door** — דף עברי "AI SDR תואם חוק ספאם" ל-10 לקוחות.
3. **concierge** — enrichment+הודעה ידני ל-3 לקוחות.

## 🗺️ תוכנית עבודה (Roadmap)
| שלב | מה בונים |
|---|---|
| **1** | בסיס + **Search/Research** (דומיין → firecrawl scrape + company data) + `contacts` DB |
| **2** | **Enrichment waterfall** (email permutation+verify, providers config, cost-on-hit) + enrichment view |
| **3** | **Message agent** — מחקר per-ליד (Claude) → הודעה מותאמת (עברית/אנגלית) + הגהה + גייט AI |
| **4** | **ערוצים + Unibox** — טלגרם+אימייל+וואטסאפ, תיבה מאוחדת, סיווג תגובות. **מנוע משותף עם מוצר 1** |
| **5** | **Sequences + Compliance** — רצפים אוטומטיים, רשימת דיכוי, חסימת §30A, follow-up |
| **6** | הרחבה: לינקדאין(session)/מסנג'ר, קביעת פגישה ביומן, אזור סוכנות white-label |

---
## נספח — דף ה-GEO (helix/ai-checker) — לא אחד מ-3 הכלים, אבל FireCrawl רלוונטי
כלי GEO עובד ב-`helix/lib/geo-scan.ts`: סורק עמוד (fetch+regex) + שואל מודלי AI + ציון + לכידת ליד. **FireCrawl מחליף את הסורק השביר** (מרנדר JS, markdown נקי, קרול רב-עמודים) = תיקון נקודת העיוורון + דוח עשיר יותר. שיפור עתידי נפרד.

## 🔗 חיבור לאקו-סיסטם HELIX (אינטגרציה עתידית — מיושר בכל המוצרים)
> **כל מוצרי HELIX יהיו מחוברים לכלל אחד.** תשתית אחת, חשבון אחד, דשבורד-על אחד. כל מוצר נבנה כבר עכשיו כך שיתחבר — האינטגרציה המלאה תושלם בהמשך.

- **תשתית משותפת:** אותו Supabase (Auth/DB/Storage/RLS), edge functions, cron, ומנועי נרטיב/הפצה (טלגרם/מייל/וואטסאפ). בונים פעם אחת — כל מוצר מנצל.
- **חשבון וזהות אחידים:** לקוח אחד, workspace אחד, SSO — נע בין המוצרים בלי חיכוך.
- **מוצר 2 (HELIX Reports / דשבורדים) = שכבת-העל המאחדת:** כל המוצרים מזרימים מדדים ל-Reports, שמציג **דשבורד-על אחד** חוצה-מוצרים (תוכן+SEO+GEO, מוניטין, לידים/SDR, ROI).
- **דאטה חוצה-מוצר:** פלט של מוצר אחד = קלט לאחר. דוגמאות: תוצאה שלילית שמזוהה ב-Shield → משימת תוכן ב-Rank · ליד מ-SDR → דוח ב-Reports · תוכן מ-Marketing Ops Hub → הפצה דרך אותו מנוע.
- **cross-sell מובנה:** אותו dashboard חושף את שאר המוצרים — משפך אקו-סיסטם אחד תחת מותג HELIX.
- **סטנדרטים אחידים לחיבור:** אותו stack (React+shadcn+Supabase, RTL), schema/מדדים אחידים, ומנועי נרטיב/הפצה משותפים — כדי שהחיבור בהמשך יהיה דלתא, לא בנייה מחדש.

## 📅 Daily Digest (מודול Agent OS)
> חלק מקו **HELIX Agent OS** (מוצר 6) על מנוע **"תשתית OLLAMA ל-Daily Digest"**. ה-SDR הופך לסוכן מתוזמן ששולח **דייג'סט לידים** בבוקר.
- **דוגמת דייג'סט:** "בוקר טוב: 5 חשבונות נכנסו לשוק · 2 מוכנים לפנייה (הכנתי נוסח) · 3 אזכורי-איתות · רצף follow-up ל-X ממתין."
- **סוכנים מתוזמנים:** ניטור איתותי-קנייה, enrichment, תעדוף חשבונות, תזכורות רצף.
- **מנוף Ollama:** סיווג/enrichment ראשוני על מודל מקומי; Claude לניסוח פנייה.
- **דו-כיווני:** "שלח את הפנייה ל-X" מהדייג'סט → HITL.
