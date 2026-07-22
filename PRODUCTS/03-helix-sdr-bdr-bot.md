# HELIX SDR-BDR-BOT — מחקר איש-קשר + Data Enrichment + AI-SDR 🤖🟢🔴

> כלי מודיעין אנשים/חברות + העשרת דאטה + **agent מכירות אוטומטי מובנה** רב-ערוצי.
> Hebrew-first · **ציות-first** · **מודל דואלי:** מכירה ישירה תחת מותג HELIX (ערוץ ראשי, עצמאי או כחלק מחבילת השיווק) + הפצה white-label דרך שותף/סוכנות (ערוץ אופציונלי).
> **מבנה: מוצר STANDALONE** (repo + Supabase משלו) — מתחבר ל**מוצר 02 (HELIX Dashboards)** כשכבת-על, ומושך קוד מהמערכות/הגיטים הקיימים (helix-ops AgentOS, PLUG edge functions, fire-enrich) כדי לא לכתוב מחדש. פירוט: §4.5.
> תאריך: 2026-07-16 · עודכן 2026-07-21 · סטטוס: אפיון מתוקף → **בבנייה**.
> ⚠️ שוק צפוף + סיכון משפטי — הבידול הוא ציות + AI + מקומיות + הכל-מובנה, **לא** גודל דאטה.

---

## 🏗️ סטטוס בנייה (Build Status) — עודכן 2026-07-21
> **Repo:** `Desktop/helix/helix-sdr-bdr-bot` (standalone, git נפרד). Fork מ-[fire-enrich](https://github.com/firecrawl/fire-enrich) (MIT). `next build` עובר נקי · 3 commits.

### ✅ נבנה (V1 foundation)
| רכיב | איפה | הערות |
|---|---|---|
| **שלד האפליקציה** | Next.js 15 + React 19 + shadcn + Firecrawl + Zod + CSV/SSE | מ-fire-enrich, rebrand מלא ל-HELIX SDR-BDR-BOT |
| **Swap ל-Claude** | `lib/helix/llm.ts` (`createLLM` → Anthropic OpenAI-compat) | כל הלקוחות+מודלים; sonnet-5 + haiku-4.5; ראה `MIGRATION-CLAUDE.md` |
| **סכמת Supabase** | `supabase/schema.sql` | workspaces/accounts/contacts/enrichment_fields/enrichment_providers + pgvector + RLS |
| **חיבור מוצר-02** | `lib/helix/dashboards.ts` | metrics push (no-op עד חיבור) |
| **מנוע Waterfall (own-first)** | `lib/waterfall/orchestrator.ts` | walk providers by layer · stop-on-hit · resolved_by/confidence/source · charge-on-hit · persist+freshness |
| **ספק: scrape-company** | `lib/waterfall/providers/scrape-company.ts` | **פורט מ-PLUG** (Firecrawl+Claude), layer-1 |
| **ספק: email permutation+verify** | `lib/waterfall/providers/email-verify.ts` | **net-new §5** — 8 תבניות + MX(DNS). SMTP=future |
| **ספק: cache** | `lib/waterfall/providers/cache.ts` | לא משלמים שוב על דאטה טרייה |
| **ספק: Apollo (BYO-key)** | `lib/waterfall/providers/vendor-apollo.ts` | layer-2, pass-through, מדלג בלי מפתח |
| **API** | `app/api/waterfall/route.ts` | `POST /api/waterfall` (node runtime ל-DNS) |
| **HITL notify-and-approve (per-event)** | `lib/helix/notify.ts` + `lib/channels/*` | `enqueueApproval`→push למשתמש עם [אשר]/[דחה] בטלגרם/מייל/וואטסאפ→webhook סוגר לולאה. TG/מייל window-free; WA=חלון 24h |
| **ערוצי שליחה (port helix-ops)** | `lib/channels/{telegram,email,whatsapp}.ts` | send + כפתורי-אישור native |
| **סכמת אישורים** | `approval_queue` + `notification_prefs` + `channel_bindings` | ב-`schema.sql` |
| **Webhooks** | `app/api/webhooks/{telegram,email-approve}` | callback_query + reply-to-approve (מפעילים executor על אישור) |
| **Message agent** | `lib/agent/message.ts` | Claude → הודעה מותאמת He/En + AI-detection score |
| **Executor** | `lib/helix/executor.ts` + `/api/executor` | מריץ פריטים `approved` → שולח לליד דרך channel_bindings → executed/failed + backstop §30A |
| **Orchestration (event source)** | `app/api/outreach/route.ts` | **צינור outbound:** enrich→draft→enqueueApproval→notify |
| **Inbound auto-reply** | `lib/helix/inbound.ts` + `lib/agent/inbound.ts` | הודעה נכנסת→classify intent→draftReply→**סולם אמון** (founder/growth=אישור · pro=אוטומטי). לא עונה לספאם |
| **WhatsApp inbound webhook** | `app/api/webhooks/whatsapp` | Meta verify + הודעות נכנסות→auto-reply loop. פותח חלון 24h |
| **Unibox foundation** | `threads` + `messages` | thread per-שיחה, in/out |
| **Approval Queue UI** | `app/approvals` + `/api/approvals/decide` | מסך §7 — אשר/דחה, שולח מיד |
| **Conversation Memory RAG (§3.3.6)** | `lib/helix/{memory,embeddings}.ts` + `conversation_memory` (pgvector) | מענה מעוגן באיך שהמשתמש ענה בעבר; לומד מכל שיחה. Ollama embeddings, no-op חלק אם לא מוגדר |

### ⏳ להשלמה (לפי עדיפות)
| # | מה | reuse/מקור | סטטוס |
|---|---|---|---|
| 1 | **חיבורים בפועל** — מפתחות `.env.local` (Firecrawl/Anthropic/Supabase) + הרצת `schema.sql` + remote git | — | ידני (המשתמש) |
| 2 | **מסך Search/Research → `/api/waterfall`** (חיווט ה-UV הקיים למנוע החדש) | fire-enrich UI קיים | הבא בתור |
| 3 | **SMTP mailbox verify** (להעלות confidence מ-0.6 ל-~0.85) | net-new | — |
| 4 | **ספקי layer-2 נוספים** (Lusha/Hunter) + BYO-key UI ב-Settings | תבנית apollo קיימת | — |
| 5 | **Message agent** — Claude → הודעה מותאמת + baldiga + AI-gate | port `content-agent.ts` (helix-ops) / `plug-chat` | ✅ **בסיס נבנה** (`lib/agent/message.ts`); נותר: baldiga pass + hooks מ-`mentions` |
| 6 | **ערוצים + Unibox** — מייל(PLUG `sync-emails`)/טלגרם(helix-rank)/וואטסאפ | port + `HELIX-BOTS-CONVERSATION-OPS` | ⏳ **וואטסאפ inbound + threads/messages נבנו**; נותר: מייל/מסנג'ר/לינקדאין inbound + מסך Unibox מלא |
| 7 | **בוט וואטסאפ + Conversation Memory RAG** (§3.3.5–3.3.6) | pgvector + Ollama embeddings | ✅ **בוט WA inbound + classify+reply + RAG נבנו**; נותר: baldiga pass · learn מהתשובה המאושרת (לא הטיוטה) · success_score |
| 8 | **Signals/mentions monitoring** (§3.1/§3.3) | radar intent (helix-ops) + Tavily/Exa/RB2B | — |
| 9 | **Model Router (Ollama)** לסיווג/embeddings/dedup בנפח | port `model-router.ts` (helix-ops) | — |
| 10 | **HITL Approval Queue + Agent Activity + Learning engine** (§מסכים 7-9) | net-new + `learning.ts` | ⏳ **לולאת notify-and-approve נבנתה** (per-event, TG/מייל/WA); נותר: מסך-UI, executor שמריץ approved, מקורות-אירוע, WA inbound webhook |
| 11 | **סכמה מלאה** — signals/mentions/sequences/threads/messages/conversation_memory/suppression/consent | הרחבת `schema.sql` | — |

> **מפת ה-reuse המלאה** (מה לפורט מ-PLUG/helix-ops מול net-new) — §4.5.

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

### 3.1 מקור האיתות (Signal Layer) — הראש של המשפך 🆕
כל הצינור מתחיל ב"agent מזהה איתות" — ולכן **מקור האיתות הוא הליבה, לא הנחת-יסוד.** ההבדל בין הכלי שלנו ל-Klaus ("אתה מביא לידים") הוא ש-agent שלנו **מוצא** לידים proactive, לא רק מעבד ליד שהוזן. מקורות איתות (זולים→יקרים, כולם דרך מקורות פומביים/session):
- **גיוסים/משרות פתוחות** — סימן לצמיחה/תקציב (scrape לוחות דרושים + אתר חברה).
- **מימון/אקזיט** — חדשות, רשות התאגידים, פוסטים.
- **שינוי תפקיד/מעבר** — decision-maker חדש = חלון פנייה (דרך session לינקדאין של המשתמש).
- **טכנולוגיה חדשה באתר** — זיהוי stack (BuiltWith-style) = trigger למכירת שירות משלים.
- **אזכור/פעילות** — החברה פרסמה, השיקה מוצר, נכנסה לתחום.
- **טריגר ידני** — המשתמש מזין רשימה/CSV (ה-fallback שכולם עושים).
**מבנית:** טבלת `signals` (contact/account_id, type, source, detected_at, score) → ה-agent מתעדף לפי חוזק-איתות × התאמת-ICP. איתות בלי מקור מוגדר = הכלי reactive; זה מה שהופך אותו proactive.

### 3.2 לולאת למידה (Learning Loop) — ה-agent משתפר 🆕
**החור המוצרי הכי גדול אם לא ייכנס:** בלי feedback loop אנחנו עוד generator של טקסט (בדיוק מה ש-§3.5 מבטיח שאנחנו *לא*). המנוע לא רק שולח — הוא **לומד מה עובד**:
- כל הודעה נשמרת כ-`message_variants` (angle, playbook, נישה, ערוץ) עם ביצועים (sent/opened/replied/positive).
- בחירת נוסח **מבוססת-תוצאה** per-סגמנט: נוסח עם reply-rate גבוה מתועדף; נוסח שנשרף מודח (bandit-style, לא A/B ידני).
- למידה **per-נישה** — מה שעובד ל"מוסכים" ≠ "משרדי עו"ד". המנוע מחזיק פרופיל-ביצועים per-ICP.
- ה-`CHECK` gates של ה-playbooks (§3.5) ניזונים מהלמידה: gate שנכשל חוזר על עצמו נחסם אוטומטית.
זה מה שהופך את ספריית ה-Playbooks ממתכון סטטי ל**מנוע מסתגל** — ובידול אמיתי מול "עוד SDR שמייצר טקסט".

### ערוצים (adapters) — **כולם נכנסים**, ההבדל הוא בשיטה ובקצב, לא ב"אם"
| ערוץ | נכנס? | השיטה הבטוחה |
|---|---|---|
| **טלגרם** | ✅ | Bot API ישיר. hermes-agent כבר עושה |
| **אימייל** | ✅ | ישיר. §30A: קר=opt-in, חם—בסדר |
| **וואטסאפ** ⭐ | ✅ | Cloud API + תבניות מאושרות. **הערוץ מס' 1 בישראל — Klaus לא עושה אותו = wedge** |
| **לינקדאין** | ✅ | דרך session של המשתמש (extension) + rate-limit (~100-150/שבוע), או wrap ל-PhantomBuster/HeyReach API |
| **מסנג'ר/IG** | ✅ | נכנס=בוט (ManyChat-style); יוצא=DM מוגבל בזהירות (סיכון חסימה הכי גבוה) |
**גישה:** מנוע ניטרלי + adapters. מתחילים טלגרם+אימייל+וואטסאפ (הקלים+החוקיים), מוסיפים לינקדאין/מסנג'ר בזהירות. n8n כשכבת מסירה. **חסימת ציות מובנית per-ערוץ** (חוסם SMS/וואטסאפ קר בישראל). הפילוסופיה: **בונים הכל, מנהלים סיכון בחוכמה** כדי שלא יחסמו חשבונות/יחטפו קנס.

### 3.3.5 בוט וואטסאפ (inbound + outbound) — על מנוע השיח המשותף 🆕
**לא בונים מאפס** — יושבים על שכבת השיח של `HELIX-BOTS-CONVERSATION-OPS` (webhook→Claude agent→tools, אותו קוד ערוצים לכל בוטי HELIX). מוצר 3 מוסיף רק את ה-tools וה-system prompt של ה-SDR. שני כיוונים:
- **Outbound (יזום) — כפוף ל§30A + חלון 24h של Meta:**
  - **מחוץ לחלון = רק utility template מאושר** (לא marketing) + **opt-in חובה** ב-`channel_optin` (§30A). קר בוואטסאפ = **חסום** (§5) — לכן outbound יזום מוגבל ל-re-engagement של ליד שכבר בהסכמה.
  - templates ספציפיים ל-SDR (מעבר ל-4 הגנריים): `sdr_followup` (המשך רצף), `sdr_meeting_confirm` (אישור פגישה), `sdr_reengage` (חידוש שיחה שקפאה).
- **Inbound (ליד עונה/יוזם) — כאן הכוח:**
  - ליד כתב → נפתח **חלון שירות 24h** → שיח חופשי מלא. ה-agent **מנהל את השיחה** (עונה על שאלות, מטפל בהתנגדויות מ-Follow-Up playbook §3.5), לא רק שולח.
  - **בוט ManyChat-style** ללכידה+כשירות: ליד מפרסומת/פרופיל → בוט מזהה כוונה, שואל שאלות-כשירות, יוצר `contact` + מזין `signals`.
  - הכל נוחת ב-**Unibox** (§3.4) עם סיווג AI (interested/objection/not-now) — thread per-account.
- **HITL + opt-out:** פעולה יזומה (שליחת template ללקוח) עוברת Approval Queue (§מסך 7). "הפסק" → עצירה מיידית + `global_suppression` (WA `131050`, §30A).
> **קו-הגבול:** וואטסאפ = ערוץ **חם/inbound/opt-in**, לא פרוספקטינג קר. זה מיישב את המתח ש-§5 קובע (קר=חסום) עם ה-wedge של §6 (וואטסאפ = מס' 1 בישראל): מנצחים בוואטסאפ **אחרי** המגע הראשון החוקי, לא לפניו.

### 3.3.6 מענה מבוסס-שיחות-עבר + למידה מתמשכת (Conversation Memory) 🆕
**הבעיה עם agent גנרי:** בוט שעונה מתבניות קבועות נשמע כמו בוט. **הפתרון:** ה-agent עונה ללקוחות בוואטסאפ **על בסיס איך שהמשתמש עצמו ענה בעבר** — אותו טון, אותן תשובות, אותם proof-points — ו**משתפר עם כל שיחה**, לא נשאר גנרי.

**איך זה עובד (RAG על שיחות המשתמש):**
1. **בסיס-ידע משיחות** — כל שיחות העבר של המשתמש בוואטסאפ (מרגע החיבור והלאה, + ייבוא export ידני) מפורקות לזוגות **שאלה→תשובה** ומוטמעות (embeddings) ב-`conversation_memory` (Supabase pgvector).
2. **מענה מעוגן** — לקוח שואל שאלה חדשה → ה-agent **מאחזר** את התשובות הדומות ביותר שהמשתמש נתן בעבר → מנסח תשובה **בסגנון ובתוכן שלו**, לא מהאוויר. ("איך המשתמש ענה על 'כמה זה עולה?' בעבר?" → עונה כמוהו.)
3. **קלוני-קול (voice)** — חילוץ סגnון הכתיבה של המשתמש (אורך, טון, ביטויים, אמוג'י) → ה-agent נשמע כמוהו, לא כמו ChatGPT. מתחבר ל-baldiga (עברית אנושית) + gate AI-detection.

**הלמידה המתמשכת (לא נשאר גנרי):**
- כל שיחה **שנפתרה** (הלקוח קנה/הבין/ענה חיובי) נכנסת חזרה ל-`conversation_memory` עם `success_score` → תשובות מנצחות מתועדפות, כושלות מודחות (אותו bandit של §3.2, ברמת-תשובה).
- **תיקון אנושי = דלק ללמידה:** המשתמש ערך טיוטה של ה-agent (ב-Approval Queue §מסך 7) → ההפרש נשמר ומלמד את המודל מה המשתמש מעדיף.
- **per-נישה/per-account** — הזיכרון מפולח, כך שמה שנלמד ללקוח X לא זולג ללקוח Y (RLS per-workspace).

**מנוע (עלות):** embeddings + אחזור דמיון = **Ollama מקומי** (נפח גבוה, אפס עלות — §Model Router); ניסוח התשובה הסופית = **Claude** (איכות + עברית). מתחבר ישיר ל-Unibox (§3.4) ולבוט (§3.3.5).
> **ציות:** שיחות הלקוח הן דאטה של המשתמש (הסכמה מובנית — אלה השיחות שלו). PII של לקוחות-קצה בתוכן → RLS per-workspace + `global_suppression` על opt-out. הזיכרון לא משותף בין workspaces.

### 3.3 טביעת-הרגל המקצועית הציבורית (Public Footprint) — מנוע ההתאמה-האישית 🆕
**המנוע שהופך "עוד מייל קר" ל"הוא באמת מכיר אותי".** ה-agent חוקר את הנוכחות ה**ציבורית-מקצועית** של הליד ובונה ממנה hooks לניסוח:
- **אזכורי-תקשורת** — כתבות, ציטוטים, ראיונות (press/news).
- **הופעות/הרצאות** — כנסים, פאנלים, וובינרים, פודקאסטים.
- **תוכן שהאדם יצר** — מאמרים, פוסטים, ריאיון, ספר.
- **הישגים/הכרה** — פרסים, מינויים, גיוס/אקזיט שקושר אליו.
- **תחומי עניין מקצועיים** נגזרים — מה הוא מדבר עליו שוב ושוב.

**דוגמת שימוש (ה-AI כותב):** *"ראיתי שהשתתפת בכנס X — אשמח לשמוע מה היה החלק שלך שם"* / *"קראתי את מה שאמרת על Y ב-Z, בדיוק בגלל זה חשבתי שנתחבר."* זה בדיוק ה-**proof-point/verbatim** ש-Cold Email playbook (§3.5) דורש ("שפת הקונה, לא שלנו").

**כולל מקורות צד-שלישי:** לא משנה **מי** פרסם — נכנס גם מידע שמישהו אחר פרסם עליו (אתר כנס שמפרסם אותו כמרצה, כתבה שסיקרה אירוע, אג'נדה פומבית). זה סטנדרט התעשייה (ZoomInfo/Clay = רוב הדאטה היא צד-שלישי, לא self-published). מה שקובע: **ציבורי + מקצועי + מיוחס-למקור** — לא מי הכותב.

**מבנית:** נשמר ב-`mentions` (type, כותרת, url, תאריך, snippet, מקור, **confidence**). **הכל מקור פומבי מתועד** → שקיפות-מקור ל-GDPR. מזין גם `signals` (אזכור חדש = טריגר פנייה §3.1) וגם את ה-message composer (§מסך 5). **מנוע:** Claude research agent + firecrawl על תוצאות חיפוש/חדשות (לא OSINT אישי — קריאת זירה ציבורית בלבד).

**דיוק (הניואנס בצד-שלישי):** מידע מצד-שלישי עלול להיות שגוי (בוטל מהפאנל, בלבול בין שמות זהים) → `confidence` per-אזכור + מקור לחיץ, וה-AI מנסח בזהירות כש-confidence נמוך ("ראיתי שהיית אמור להשתתף ב-X").
> ✅ **למה זה בצד המותר:** **עובדה מקצועית ציבורית** (בין אם האדם פרסם ובין אם צד-שלישי), בשימוש להתאמת פנייה עסקית רלוונטית = legitimate interest קלאסי. הקו הוא **ציבורי-מקצועי**, לא "מי הכותב". שונה מהותית מ-OSINT אישי (כתובת-בית/משפחה/הדלפות/רשימות-דלף) שנשאר חסום (§SpiderFoot).

### 🔀 אומניצ'אנל (Unibox מאוחד) — פיצ'ר ליבה
תיבה **אחת** לכל הערוצים: כל התגובות (מייל, וואטסאפ, לינקדאין, טלגרם, מסנג'ר) נוחתות במקום אחד, עם ההקשר המלא של השיחה והליד. עקרונות:
- **זהות אחת ללקוח** על פני כל הערוצים (אותו ליד = thread אחד, גם אם ענה בשני ערוצים).
- **מעבר בין ערוצים באמצע שיחה** בלי לאבד היסטוריה (התחיל במייל → ממשיך בוואטסאפ).
- **תור אחיד** של תגובות ממתינות + סיווג AI (interested/objection/not-now) חוצה-ערוצים.
- **בחירת ערוץ חכמה (מנוע החלטה, לא הצהרה)** — ה-agent בוחר ערוץ per-ליד לפי דאטה, לא ניחוש. מנוע ההחלטה ניזון מ-`channel_performance` (reply-rate per ערוץ × סגמנט × נישה) + זמינות ערוץ per-ליד (יש טלפון? לינקדאין? אימייל מאומת?) + **כללי הציות כ-hard filter** (וואטסאפ/SMS קר בישראל = נחסם לפני הבחירה). בלי הדאטה הזו "בחירה חכמה" היא vaporware — לכן היא מבנית, לא סיסמה.
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

### 🔔 3.6 מנוע Lifecycle & תזכורות (Post-Sale / Retention) 🆕 — **נבנה בקוד ✅**
עד כאן ה-SDR עסק ב**רכישת** לקוח (prospecting→outreach→שיחה). §3.6 מוסיף את **מחזור-החיים אחרי הרכישה** — האוטומציות שמחזירות לקוח קיים: תזכורות, חידושים, רכישה-חוזרת והטבות. הפיצ'רים גזורים מבריף אמיתי (עסק וטרינרי/חיות) אבל **מופשטים לגנריים** — כל עסק עם לקוחות חוזרים (מספרה, מוסך, קליניקה, מנוי SaaS) מקבל את אותו מנוע. הנתונים מגיעים מקובץ Excel/רישום (פרטים אישיים + **ישות משנית**, למשל חיה — `fields.pet_name`, `fields.pet_birthday`).

| יכולת | מה עושה | טריגר |
|---|---|---|
| **תזכורת תור (מקדימה)** 📅 | הודעה יום/X-ימים לפני תור, עם קישור **אישור/ביטול** ציבורי | `scheduleAppointment` → 2 jobs (מקדימה + יום-התור) |
| **תזכורת יום-התור** ⏰ | תזכורת אחרונה בבוקר התור, אישור/ביטול | job שני של התור; ביטול מבטל אוטומטית את התזכורות הפתוחות |
| **חידוש מנוי** 🔄 | תזכורת לפני חידוש (למשל חודש לפני), עם קופון אופציונלי | `scheduleRenewal({ sendAt, coupon? })` |
| **רכישה-חוזרת / השלמת-מלאי** 🐾 | הודעה כעבור X ימים מרכישה (מזון/מוצר שנרכש לפני 1 או 3 חודשים) → "זמן להזמין שוב" | `scheduleReplenishment({ product, replenish_days })` — נגזר מקצב-הרכישה |
| **יום-הולדת / יום-נישואין** 🎉 | הטבה ביום-ההולדת של הלקוח **או של הישות המשנית** (חיה) | `scheduleBirthday` — מתוזמן אוטומטית ב-import כשיש תאריך |
| **קופונים** 🎁 | הזרקת קוד-הטבה לכל תבנית (`{coupon}`) | טבלת `coupons` + `meta.coupon` על ה-job |

**ארכיטקטורה (reuse-first):** מבוססת על אותו stack של המנוע הקיים — `channel_bindings` לקונפיג-הערוץ, `sendWhatsApp()` לשליחה, ותבניות עברית RTL. **קבצים:** `supabase/lifecycle.sql` (5 טבלאות: `lifecycle_customers` · `appointments` · `purchases` · `coupons` · `lifecycle_jobs`) · `lib/lifecycle/{templates,schedule,run}.ts` · `app/api/lifecycle/{cron,import,schedule}/route.ts` · `app/r/[token]/route.ts` (דף אישור/ביטול RTL). **ה-cron** (`/api/lifecycle/cron`, מוגן `EXECUTOR_SECRET`, כל ~15 דק') שולף jobs שהגיע זמנם → מרנדר תבנית → שולח בוואטסאפ → מסמן `sent/failed`. **import** מקבל CSV/JSON (מ-Excel/רישום) → מזין לקוחות → מתזמן ימי-הולדת אוטומטית.

### 📩 3.6.1 קטלוג תבניות WhatsApp (Approved Templates) 🆕 — **נבנה בקוד ✅**
פתרנו את פער-הציות מ-§3.6: כל פיצ'ר יזום מקבל **template מאושר** — הדרך התקנית לפתוח שיחה מחוץ לחלון-24ש. **קובץ:** `lib/templates/catalog.ts` — רשומת `TEMPLATES` עם template אחד לכל פיצ'ר יזום, כולל **payload רישום ל-Meta** (`message_templates`) ומיפוי-ריצה של פרמטרי `{{n}}`. הנוסח תואם ל-`lib/lifecycle/templates.ts` כך ששליחה בתוך-החלון (טקסט חופשי) ומחוץ-לחלון (template) נקראות זהה.

| Template | פיצ'ר | קטגוריה | כפתור |
|---|---|---|---|
| `sdr_appt_reminder` | תזכורת תור מקדימה | UTILITY | URL אישור/ביטול (`/r/{{token}}`) |
| `sdr_appt_sameday` | תזכורת יום-התור | UTILITY | URL אישור/ביטול |
| `sdr_renewal` | חידוש מנוי | MARKETING | — |
| `sdr_replenish` | רכישה חוזרת | MARKETING | — |
| `sdr_birthday` | יום-הולדת (לקוח/חיה) | MARKETING | — |
| `sdr_cold_opener` | פנייה קרה ראשונה לליד | MARKETING | — |
| `sdr_followup` | follow-up stage-aware | MARKETING | — |
| `sdr_reengage` | win-back / משתמש חוזר | MARKETING | — |

**שליחה:** `sendWhatsAppTemplate()` + `createWhatsAppTemplate()` נוספו ל-`lib/channels/whatsapp.ts` (Graph v21). **רישום:** `POST /api/templates/sync` (מוגן `EXECUTOR_SECRET`) יוצר את כל התבניות ב-WABA (idempotent — "already exists" נחשב OK); דורש `waba_id` בקונפיג הערוץ, ואחר-כך אישור אסינכרוני מ-Meta. **הריצה:** ה-runner מנסה קודם template מאושר, ואם לא-אושר-עדיין נופל אוטומטית לטקסט-חופשי (עובד בתוך החלון). דף `/r/[token]` מציג **בורר אישור/ביטול** כשכפתור-ה-URL של התבנית נוחת בלי פעולה.

### 🤖 3.6.2 פקודות בוט לאופרטור (Operator Commands) 🆕 — **נבנה בקוד ✅**
כל פונקציית Lifecycle נגישה לבעל-העסק **ישירות מהוואטסאפ/טלגרם** בשפה חופשית — לא רק דרך הדשבורד. **קובץ:** `lib/bot/operator.ts` — `handleOperatorCommand()` מזהה כוונה (keyword + פענוח-LLM עברית ב-Haiku) ומפעיל את אותו קוד של ה-schedule/import. **זיהוי אופרטור:** טבלת `bot_links` (channel+identifier→workspace); ה-webhooks של טלגרם/וואטסאפ מנתבים זהות-אופרטור ל-handler הזה במקום לזרימת-הליד.

| פקודה (עברית חופשית) | פעולה |
|---|---|
| "קבע תור לדנה 050… מחר ב-10:30 עבור רקסי" | יוצר/מאתר לקוח → `scheduleAppointment` |
| "תזכיר לדני לחדש מנוי בעוד שבועיים, קוד RENEW10" | `scheduleRenewal` |
| "רכישה חוזרת ליוסי — מזון לכלבים כל 30 יום" | `scheduleReplenishment` |
| "יום הולדת לרקסי בתאריך 2026-08-12" | `scheduleBirthday` |
| "ייבא לקוחות" + שורות CSV | הפניה ל-import |
| "סטטוס" / "מה יש היום" / "תזכורות היום" | דוח סטטוס / תזכורות שממתינות |

### 📊 3.6.3 ייצוא מדדים לדשבורדים 🆕 — **נבנה בקוד ✅**
כמו בשאר המוצרים: `GET /api/export/sdr-metrics?workspace=&secret=EXPORT_SECRET` מחזיר `{ points: [{metric, dims, value}] }`. מוצר Dashboards (02) מושך דרך connector `helix_sdr` אל `metric_points`. מדדים: `sdr_contacts` · `sdr_lifecycle_customers` · `sdr_appt_confirmed/cancelled/pending` · `sdr_appt_confirm_rate` · `sdr_reminders_sent/failed/due`. (קיים גם `pushMetric()` הישן — push; ה-export הוא ה-pull הקנוני התואם ל-Growth Doctor.)

> **⚠️ ציות WhatsApp (§30A):** נפתר ב-§3.6.1 — הודעות יזומות עוברות ב-templates מאושרים; free-text רק כ-fallback בתוך חלון-24ש. נותר לך: ליצור/לאשר את התבניות ב-WhatsApp Manager (או להריץ `/api/templates/sync`), ולהריץ `supabase/lifecycle.sql`.

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
| OSINT חברה/דומיין/**אדם** | **SpiderFoot** (19.7k★) | **MIT** ✅ | 200+ מודולים. **sidecar, שתי שכבות: עסקי + קשר-מקצועי-של-אדם** (ראה §SpiderFoot להלן) |
| OSINT username | Sherlock (86k★) | MIT ✅ | username→400 רשתות. **רק לאימות נוכחות מקצועית (LinkedIn/GitHub/X), לא מיפוי אישי** |
| הודעת AI מותאמת | **Claude (כבר מחווט ב-plug-chat)** | — | הבידול. structured JSON→הודעה "fuzzy". near-zero build |

### SpiderFoot — פירוט (העשרה עסקית **+ רמת-אדם**) 🆕
אפליקציית Python (**לא צריך Kali** — Kali רק מגיע ארוז עם SpiderFoot; אנחנו מריצים אותו ישיר). `docker run` → REST API. edge function שלנו מריץ סריקה ממוקדת (target = דומיין / אימייל / שם+חברה), מזין JSON ל-`enrichment_fields` + `signals`. **sidecar נפרד, seed-based** (סורק רק ליד שהוזן, לא crawling עיוור).

**למה גם רמת-אדם:** enrichment של contact הוא person-level מעצם הגדרתו — צריך אימייל-עבודה, נייד, תפקיד, ונוכחות מקצועית של **האדם**, לא רק החברה. זה בדיוק מה ש-Lusha/Apollo מספקים. ההבחנה הקריטית: **דאטת-קשר מקצועית של אדם** ✅ מול **OSINT אישי עמוק** ❌ (מה שהופך אותנו ל"סוחר נתונים" — אסור, §134).

#### שכבות המודולים — מה נכנס ומה **חסום**
| שכבה | מודולים (דוגמה) | פלט | סטטוס |
|---|---|---|---|
| **עסקי / דומיין** | WHOIS, DNS/MX, subdomains, tech-stack (BuiltWith-style), certs, company data | תשתית + `signals` (tech-stack = טריגר §3.1) | ✅ ליבה |
| **קשר-מקצועי של אדם** | email-format/permutation, email-verify, נוכחות מקצועית (LinkedIn/GitHub/X), תפקיד, נייד-עסקי ממקור פומבי | `enrichment_fields` per-contact | ✅ ליבה, עם `consent_log` |
| **טביעת-רגל ציבורית (§3.3)** | אזכורי-תקשורת, כתבות, הרצאות/כנסים, פודקאסטים, פרסים, תוכן שהאדם יצר | `mentions` → personalization + `signals` | ✅ ליבה (Claude+firecrawl, זירה ציבורית) |
| **breach / הדלפות** | HaveIBeenPwned וכו' | האם אימייל דלף | ⚠️ **עסקי בלבד** (אבטחת-דומיין), **לא** ל-profiling אישי |
| **OSINT אישי עמוק** | חשבונות אישיים (Sherlock מלא), geolocation, IP-אישי, קשרים משפחתיים, כתובת-בית, תמונות | — | 🔴 **חסום ב-config** — data-broker/פרטיות, קו אדום §5/§134 |

**איך אוכפים את הקו:** ה-sidecar רץ עם **allowlist מפורש של מודולים** (לא ברירת-מחדל "הכל דלוק"). מודולי השכבה האדומה פשוט לא מותקנים/מופעלים ב-container. כל שדה per-אדם נכתב עם `resolved_by` + מקור פומבי מתועד → שקיפות-מקור ל-GDPR + זכות מחיקה דרך `suppression_list`/`global_suppression`.

**חיבור לצינור:** SpiderFoot = ספק במנוע ה-Waterfall (§4) per-שדה (למשל תפקיד/נייד), **וגם** מזין `signals` (tech-stack חדש, subdomain חדש = איתות). הרצה seed-based per-ליד → עלות/רעש נמוכים, לא סריקת-המונים.

> **קו-הגבול המנחה:** אנחנו מעשירים **אדם בהקשר עסקי** (מי הוא, איפה עובד, איך יוצרים קשר מקצועי) — לא בונים **תיק-מודיעין אישי**. הראשון = Lusha/Apollo (חוקי, legitimate interest). השני = "סוחר נתונים" (§134) + סיכון §5/GDPR + הורס את מיצוב ה"compliant-by-default" של כל המוצר. ⚠️ אישור עו"ד על השכבה הזו לפני production בישראל.

### מנוע Waterfall (native — הבידול מול הכאב של Clay) — **own-first, vendor-fallback**
> **עיקרון-על:** אנחנו מוצר data-enrichment, **לא reseller**. אין "יצירת דאטה" — יש איסוף. מה שאפשר לאסוף בעצמנו ממקורות פומביים = **הליבה שלנו** (מרווח גבוה); ספק חיצוני נכנס **רק** לשדה שלא נפתר. סדר עדיפות מפורש per-שדה:

```
שכבה 1 — מקורות שלנו (אפס עלות שולית, רוב ה-hits):
  cache → scrape (Firecrawl) → email permutation+verify (MX/SMTP)
  → רשמי חברות (רשות התאגידים/OpenCorporates) → WHOIS/DNS
  → SpiderFoot (דומיין) → טביעת-רגל ציבורית (§3.3)
        ↓ (רק אם השדה עדיין ריק)
שכבה 2 — ספק חיצוני (charge-on-hit, אופציונלי/BYO-key):
  Apollo / Lusha / Hunter — לנייד-מאומת / direct-dial / רוחב-freshness
```

edge function מדלג בסדר, עוצר על תוצאה מאומתת, מתעד `resolved_by`+confidence, **מחייב רק על hit** (נגד שריפת הקרדיטים). cache אגרסיבי, **עלות גלויה per-row לפני הרצה**. **רוב השורות נפתרות בשכבה 1 בעלות שולית אפסית** — הספקים הם ל-20% הקשה בלבד (נייד מאומת), בדיוק ה"מוט" ש§7 אומר שאי אפשר לנצח בו.

### own-vs-vendor + BYO-key — הליבה מול ה-fallback 🆕
**למה לא להישען על ספקים:** (א) **עלות** — ספק per-row שורף מרווח (הכאב שאנחנו מבקרים ב-Clay); (ב) **סיכון "סוחר נתונים"** — אם אנחנו שולפים/שומרים/מגישים פרטים אישיים מספק, אנחנו עלולים להיכנס להגדרה הכבדה של §5/§134.
**הפתרון — BYO-key (Bring Your Own Key):** הלקוח מחבר את מפתח ה-Apollo/Lusha **שלו** (מסך Settings) → פנייה לספק נעשית **עם המפתח שלו, על חשבונו**. אנחנו **צינור (pass-through)**, לא בעלי-הדאטה. בדיוק כמו ש-PLUG כבר עושה עם מייל (`connect-email-callback` — הלקוח מחבר Gmail שלו, שולחים בשמו).
- 💰 **unit economics:** שכבה 1 = כמעט-אפס עלות שולית → מרווח גבוה. שכבה 2 = עלות הלקוח, לא שלנו.
- ⚖️ **anti-data-broker:** אנחנו "כלי שהמשתמש מפעיל בשמו" (§5), לא מאגר שאנחנו מוכרים.
- 📦 **מיצוב:** המוצר עובד **מצוין בלי אף ספק** על SMB ישראלי עם נוכחות web (wedge §155). ספק = **tier פרימיום אופציונלי**, לא עמוד-תווך.

---

## 🔁 4.5 Reuse & מקורות חיצוניים — מפת בנייה (אל תכתוב פעמיים) 🆕
> נסקר 2026-07-21. מטרה: **להימנע מכתיבת קוד שכבר קיים**. מחולק ל-3: (א) קוד פנימי לשימוש חוזר, (ב) בסיס קוד חיצוני לאימוץ, (ג) קטלוג-ספקים. **החלטת-על:** רוב שלבי 1-4 ב-roadmap מכוסים מ-reuse.

### (א) קוד פנימי קיים — reuse ראשון-בעדיפות
> ⚠️ `helix-ops` ו-PLUG הם **שני codebases + שני פרויקטי Supabase**. helix-ops = reuse **במקום** (מוצר 3 הוא מוצר HELIX). PLUG = **פורט/reference** (להעתיק edge function ולהתאים ל-Supabase של helix).

| רכיב מוצר 3 | סטטוס | מקור |
|---|---|---|
| **Model Router (Ollama/Claude)** | ✅ מוכן במקום | `helix-ops/lib/agentos/model-router.ts` + `ollama.ts` |
| **Scheduler + registry + digest + learning** | ✅ מוכן במקום | `helix-ops/lib/agentos/{registry,digest,learning}.ts` + `app/api/agentos/route.ts` + `supabase/migration-v12.sql` |
| **ניסוח Claude + הגהה עברית + AI-gate** | ✅ מוכן במקום | `helix-ops/lib/content-agent.ts` + `lib/hebrew.ts` + baldiga skill |
| **Signal scoring (intent)** | ⚠️ בסיס | `helix-ops/lib/radar/intent.ts` (`scoreIntent`) + `app/api/radar/ingest/route.ts` + `radar_configs/radar_leads` (migration-v11) |
| **שליחת ערוצים (WA/TG/מייל)** | ✅ מוכן במקום | `helix-ops/lib/distribution/{telegram,whatsapp,email}.ts` |
| **טלגרם webhook + conversational agent** | ✅ מוכן במקום | `helix-rank/app/api/telegram/route.ts` + `lib/bot/agent.ts` + `lib/bot/channels.ts` |
| **Bright Data connector** | ✅ קיים | `helix-rank/lib/geo/brightdata` |
| **GEO/firecrawl scanner** | ✅ קיים | root `helix/lib/geo-scan.ts` |
| **Scrape (firecrawl+Claude)** | ✅ פורט מ-PLUG | PLUG `supabase/functions/scrape-company` (+ `scrape-job`, `extract-job-from-url`) |
| **Cost-on-hit (waterfall billing)** | ✅ פורט מ-PLUG | PLUG `deduct-credits` / `award-credits` |
| **Dedup** | ✅ פורט מ-PLUG | PLUG `detect-duplicates` |
| **מנוע מייל (inbound+outbound, Gmail/Outlook OAuth)** | ✅ פורט מ-PLUG | PLUG `sync-emails`, `send-email-via-user`, `connect-email-callback`, `email-ai-assist` |
| **Claude proxy + chat** | ✅ פורט מ-PLUG | PLUG `ai-proxy`, `plug-chat` |
| **סיווג (Ollama-candidate)** | ✅ פורט מ-PLUG | PLUG `classify-companies`, `classify-email` |
| **Webhook גנרי (HMAC)** | ✅ פורט מ-PLUG | PLUG `webhook-handler` |
| **LinkedIn ייבוא/OAuth** | ✅ פורט מ-PLUG | PLUG `import-linkedin-profile`, `linkedin-callback` |
| **Scoring/matching** | ✅ פורט מ-PLUG | PLUG `match-candidates`, `generate-match-batch` |
| **קביעת פגישה ביומן** | ✅ פורט מ-PLUG | PLUG `google-calendar-sync`, `add-interview-to-calendar` |

**net-new אמיתי (לבנות):** מנוע ה-Waterfall (אורקסטרטור) · אימות אימייל · SpiderFoot sidecar · ניטור signals/mentions (news/press) · וואטסאפ inbound + אכיפת 24h/opt-in · סכמת מוצר-3.

### (ב) בסיס קוד חיצוני לאימוץ — לפי stack-fit
| Repo | רישוי | Verdict | מה לוקחים |
|---|---|---|---|
| 🏆 [firecrawl/fire-enrich](https://github.com/firecrawl/fire-enrich) | MIT | 🟢 **בסיס קוד** | **ה-Waterfall + UI שלנו, ב-stack שלנו** (TS/Next.js 15, Firecrawl, Zod, CSV upload, SSE). ממלא את net-new §6. רק להחליף GPT-4o→Claude |
| [vercel-labs/email-agent](https://github.com/vercel-labs/email-agent) | ⚠️ בדוק | 🟢🟡 UI/schema | patterns של מסכי-קמפיין (Next+shadcn+React Query) + ספק **Exa** |
| [iPythoning/b2b-sdr-agent-template](https://github.com/iPythoning/b2b-sdr-agent-template) + [hermes-skill](https://github.com/iPythoning/b2b-sdr-hermes-skill) | MIT | 🟡 מתודולוגיה | BANT · ICP scoring דינמי · cadence Day 1/3/7/14 · sdr-humanizer · `examples/` נישות. **קוד לא** (OpenClaw/Python) |
| [NForce-ai/SDRbot](https://github.com/NForce-ai/SDRbot) | MIT | 🟡 ספקים | קטלוג ספקי waterfall: Apollo/Lusha/Hunter/Tavily |
| [brightdata/ai-sdr-bdr-agent](https://github.com/brightdata/ai-sdr-bdr-agent) ([mirror](https://github.com/bright-cn/ai-sdr-bdr-agent)) | MIT / demo | 🟡 ספק | Bright Data MCP כספק signals/mentions/LinkedIn |
| [langchain-ai/data-enrichment](https://github.com/langchain-ai/data-enrichment) | MIT | 🟡 pattern | schema-driven research (JSON schema→web→validate) + Tavily. Python—pattern בלבד |
| [jcbdelo26/chiefaiofficer-alpha-swarm](https://github.com/jcbdelo26/chiefaiofficer-alpha-swarm) | 🔴 proprietary | 🟡 קונספט | **ICP scoring rubric** (bands 85-100/70-84/...) + ספק **RB2B**. קוד חסום |
| [matheuspimentaa/Sistema-SDR-Multiagentes](https://github.com/matheuspimentaa/Sistema-SDR-Multiagentes) | 🔴 none | 🟡 החלטה | **Evolution API** (וואטסאפ לא-רשמי) + buffering 10ש' להודעות מפוצלות |
| [heliocosta-dev/revenue-centric-design](https://github.com/heliocosta-dev/revenue-centric-design) | ⚠️ מגביל | 🟡 תוכן | 101 עקרונות SaaS (ICP/pricing/churn) — לשכבת GTM, לא ל-SDR engine |

**נדחו (לא לגעת):** [flink-orchestrator](https://github.com/thefalc/multi-agent-ai-sdr-flink-orchestrator) (demo כבד, Kafka/Flink) · [Shadowbroker](https://github.com/BigBodyCobain/Shadowbroker) (OSINT גאו, **AGPL**) · [Nemesis](https://github.com/SpecterOps/Nemesis) (red-team) · [HoloClean](https://github.com/HoloClean/holoclean) (data-cleaning אקדמי dormant) · [dadata-php](https://github.com/hflabs/dadata-php) (רוסיה בלבד) · BDR ריקים: [aleeza45](https://github.com/aleeza45/bdr-agent)/[AGENTIC-BDR](https://github.com/AbdelilahYounsi/AGENTIC-BDR)/[Facilio-ops](https://github.com/Facilio-ops/BDR-agent)/[agente-bdr](https://github.com/matheusz98/agente-bdr) · [bdr-agent-backup](https://github.com/JayZeeDesign/bdr-agent-backup) · **false-match:** [sdrf-skills](https://github.com/bigbio/sdrf-skills)/[clusterProfiler](https://github.com/YuLab-SMU/clusterProfiler)/[decoupler](https://github.com/scverse/decoupler) (ביואינפורמטיקה) · [revenue-distribution-token](https://github.com/maple-labs/revenue-distribution-token)/[web3_revenue_primitives](https://github.com/owocki/web3_revenue_primitives) (קריפטו) · [Maui.RevenueCat](https://github.com/Kebechet/Maui.RevenueCat.InAppBilling) (mobile IAP) · [revenue-yoy-backtest](https://github.com/mjib007/revenue-yoy-backtest)/[revenue-dashboard-shiny](https://github.com/amrrs/sample_revenue_dashboard_shiny) (פיננסים/demo).

### (ג) קטלוג-ספקים ל-Waterfall (§4) — **שכבה 1 = שלנו, שכבה 2 = אופציונלי/BYO**
| שכבה | קטגוריה | מקור/ספק | סטטוס |
|---|---|---|---|
| **1 — שלנו (ליבה)** | Scrape engine | **Firecrawl** (fire-enrich) · SpiderFoot (sidecar) | ✅ built-in, אפס עלות שולית |
| **1 — שלנו (ליבה)** | אימות אימייל | permutation + MX/SMTP (ספריית MIT §5) | ✅ built-in |
| **1 — שלנו (ליבה)** | רשמי/דומיין | רשות התאגידים · OpenCorporates · WHOIS/DNS | ✅ built-in |
| **1 — שלנו (ליבה)** | טביעת-רגל ציבורית (§3.3) | Claude research + Firecrawl על חדשות/חיפוש | ✅ built-in |
| **2 — אופציונלי / BYO-key** | Contact/נייד-מאומת | [Apollo.io](https://apollo.io) · [Lusha](https://lusha.com) 🇮🇱 · [Hunter.io](https://hunter.io) | ⚙️ fallback לשדה שלא נפתר בלבד |
| **2 — אופציונלי / BYO-key** | Research/mentions | [Tavily](https://tavily.com) · [Exa](https://exa.ai) · [Bright Data](https://brightdata.com) | ⚙️ העשרת §3.3 (או own) |
| **2 — אופציונלי / BYO-key** | Intent/signals (§3.1) | **RB2B** (de-anon מבקרי-אתר) · Bright Data · [Clay](https://clay.com) | ⚙️ איתותי-קנייה |
> **שכבה 2 היא fallback/פרימיום — לא ברירת-מחדל.** נכנסת per-שדה עם cost-on-hit, ורצוי **BYO-key** (הלקוח מחבר מפתח משלו → אנחנו pass-through, לא סוחר-נתונים §5/§134). המוצר עובד מלא בלי אף ספק שכבה-2. **Evolution API** לוואטסאפ = **אופציה אפורה בלבד** (לא-רשמי, סיכון חסימה); **Cloud API הרשמי נשאר default** (§3.3.5).

---

## 📱 מסכים (Screens)
1. **Search / Research** — הזנת שם/דומיין/חברה → פרופיל מועשר (אדם+חברה) + מקורות.
2. **Lists / Segments** — רשימות לידים, ייבוא CSV, פילוח.
3. **Enrichment view** — per-ליד: שדות שנמצאו, confidence, `resolved_by` (waterfall), עלות.
4. **Sequence builder** — רצף רב-ערוצי (איתות→enrich→מחקר→הודעה→follow-up).
5. **Message composer** — טיוטת הודעה מותאמת-AI per-ליד (עברית/אנגלית) + אישור. מציג **personalization hooks מ-`mentions`** (§3.3): כנס/כתבה/הרצאה שאפשר להזכיר, עם מקור לחיץ.
6. **🔀 Unibox** — תיבה מאוחדת לכל הערוצים, סיווג תגובות, thread per-**account** (buying-committee, לא רק per-ליד).
7. **✅ Approval Queue (HITL)** — הצוואר-בקבוק של המוצר, ולכן מסך ייעודי. תור אישורים עם **אישור-באצווה**, **auto-approve מעל סף confidence**, וכללי "שלח לבד אם X" (סגמנט/ערוץ/playbook). מיישם **סולם אמון** (Founder=ידני→Growth=אצווה→Pro=אוטונומי) — זה מה שהופך את ה-agent מ-scale-לכאורה ל-scale אמיתי.
8. **🛰️ Agent Activity** — "מה ה-agent עשה בזמן שישנתי". timeline/audit חי של כל פעולה (זיהה איתות · העשיר · חקר · ניסח · שלח · קיבל תגובה), עם אפשרות לתקן/לבטל בדיעבד. agent אוטונומי חי או מת על **שקיפות ואמון**.
9. **📊 Learning / Performance** — ביצועי נוסחים (`message_variants`), reply-rate per ערוץ×נישה, מה מתועדף ומה הודח (§3.2).
10. **Compliance / Suppression** — רשימת דיכוי (workspace + **גלובלית**), opt-out, LIA, הגדרות ציות per-ערוץ.
11. **Settings** — חיבורי ערוצים, ספקי enrichment (waterfall config), מיתוג/הרשאה.
12. **Agency Hub** — ריבוי workspaces, white-label.

## 🗄️ מודל נתונים (Supabase, RLS per-workspace)
| טבלה | שדות עיקריים |
|---|---|
| `workspaces` | id, name, plan, branding, compliance_config, **trust_level** (Founder/Growth/Pro) ← סולם אמון HITL |
| `accounts` | workspace_id, domain, name ← **שכבת חברה/עסקה מעל contacts (buying-committee)** 🆕 |
| `contacts` | workspace_id, **account_id**, name, company, domain, title, linkedin_url, source, status |
| `signals` | **account_id/contact_id, type (job/funding/role-change/tech/mention), source, score, detected_at** ← **מקור האיתות §3.1** 🆕 |
| `mentions` | **contact_id, type (press/article/talk/podcast/award), title, url, published_at, snippet, source, confidence** ← **טביעת-רגל ציבורית §3.3 (personalization hooks; כולל צד-שלישי)** 🆕 |
| `enrichment_fields` | contact_id, field, value, confidence, resolved_by, source, cost, **verified_at, expires_at, is_stale** ← freshness/decay |
| `enrichment_providers` | workspace_id, field, provider_order[] (waterfall config) |
| `companies` | domain, name, industry, size, data_json |
| `sequences` | workspace_id, name, trigger, steps_json |
| `sequence_enrollments` | sequence_id, contact_id, current_step, status |
| `threads` | **account_id**, contact_id, workspace_id, last_channel, classification, **stage** (new→discovery→proposal→dark→ghost→won/lost) ← **state machine §5** 🆕 |
| `thread_state_history` | **thread_id, from_stage, to_stage, reason, at** ← היסטוריית מצבים (Follow-Up stage-aware §3.5) 🆕 |
| `messages` | thread_id, channel, direction (in/out), body, status, **variant_id** ← **Unibox** |
| `message_variants` | **workspace_id, angle, playbook, niche, channel, sent, opened, replied, positive** ← **לולאת למידה §3.2** 🆕 |
| `conversation_memory` | **workspace_id, account_id?, question, answer, embedding (pgvector), source_thread_id, style_tags, success_score, times_used** ← **מענה מבוסס-שיחות-עבר + למידה §3.3.6** 🆕 |
| `channel_performance` | **workspace_id, channel, segment, niche, reply_rate, sample_n** ← **מנוע בחירת-ערוץ §3.4** 🆕 |
| `agent_activity` | **workspace_id, actor(agent/human), action, target, payload_json, reversible, at** ← **מסך Agent Activity §8** 🆕 |
| `channel_connections` | workspace_id, channel, tokens/config, **health_status, warn_count** ← ניטור בריאות-חשבון (ban-risk) |
| `suppression_list` | workspace_id, contact_key, reason ← **opt-out/מחיקה** |
| `global_suppression` | **contact_key (email/phone hash), reason, at** ← **דיכוי חוצה-workspace §5** 🆕 |
| `consent_log` | contact_id, basis, source, timestamp ← **ציות** |
| `lifecycle_customers` | **workspace_id, name, phone(E.164), email, birthday, fields jsonb (ישות משנית: pet_name/pet_birthday/plan…), source** ← **לקוחות קיימים §3.6** 🆕 |
| `appointments` | **workspace_id, customer_id, title, scheduled_at, status (pending/confirmed/cancelled), token (קישור אישור/ביטול)** ← **§3.6** 🆕 |
| `purchases` | **workspace_id, customer_id, product, purchased_at, replenish_days (קצב רכישה-חוזרת)** ← **§3.6** 🆕 |
| `coupons` | **workspace_id, code, benefit, active** ← **§3.6** 🆕 |
| `lifecycle_jobs` | **workspace_id, customer_id, kind (appt_reminder/appt_sameday/renewal/replenish/birthday/custom), channel, send_at, status (scheduled/sent/failed/cancelled), meta, external_id** ← **תור-שליחה של ה-cron §3.6** 🆕 |
| `bot_links` | **workspace_id, channel (whatsapp/telegram/email), identifier (phone/chat_id/email), role (operator/admin)** ← **זיהוי אופרטור לפקודות בוט §3.6.2** 🆕 |

## 🏗️ ארכיטקטורה (רכיבים)
- **Frontend:** React + shadcn (RTL).
- **Backend:** Supabase (Auth, DB, Storage, RLS, **pgvector** ל-Conversation Memory §3.3.6).
- **Enrichment engine:** edge function waterfall (providers config) + email-verifier + **firecrawl/SpiderFoot כ-sidecars**.
- **Signal engine:** cron sources (משרות/מימון/שינוי-תפקיד/tech/אזכור) → `signals`, תעדוף לפי score×ICP (§3.1).
- **Research + message agent:** Claude (מחקר per-ליד → JSON → הודעה מותאמת) + firecrawl על חדשות/חיפוש לבניית `mentions` (§3.3) + Hebrew Content by Helix / skills אנגלית + הגהה + גייט AI-detection. כל נוסח נכתב כ-`message_variants`.
- **Model Router (Ollama מקומי | Claude ענן):** על תשתית `OLLAMA-DAILY-DIGEST-INFRA` המשותפת (`lib/agentos/model-router.ts`) — **מנוף העלות**. משימות נפח low-stakes → Ollama מקומי (אפס עלות API); ניסוח/עברית/החלטות עדינות → Claude. מוריד עלות שוליים בדרמטיות ב-enrichment/סיווג שרצים על כל ליד. חלוקה:

| משימה במוצר 3 | מודל | למה |
|---|---|---|
| סיווג תגובות Unibox (interested/objection/not-now) | **Ollama** | נפח גבוה, החלטה פשוטה → אפס עלות |
| ניקוד relevance של `signals` + תעדוף | **Ollama** | רץ על כל איתות, low-stakes |
| dedup/נרמול enrichment + extraction מ-scrape | **Ollama** | נפח עצום per-row |
| סיכום `mentions` גולמי לפני ניסוח | **Ollama** | קלט למחקר, לא פלט ללקוח |
| **embeddings + אחזור-דמיון** (Conversation Memory §3.3.6) | **Ollama** | נפח גבוה per-הודעה → אפס עלות |
| **ניסוח הודעה מותאמת (עברית/אנגלית) + baldiga** | **Claude** | הבידול — איכות + עברית אנושית |
| מחקר per-ליד + החלטות playbook עדינות | **Claude** | stakes גבוה, פונה ללקוח |
| ברירת מחדל (`auto`) | Ollama + **Claude fallback** על confidence נמוך | איזון עלות/איכות |

- **Learning engine:** bandit על `message_variants` + `channel_performance` — בחירת נוסח/ערוץ מבוססת-תוצאה per-נישה (§3.2, §3.4).
- **Conversation Memory (RAG):** `conversation_memory` ב-Supabase **pgvector** — embeddings (Ollama מקומי) על שיחות-עבר של המשתמש → אחזור-דמיון לפני ניסוח → מענה בסגנון+תוכן של המשתמש, משתפר per-שיחה (§3.3.6). ניסוח סופי ב-Claude.
- **Channel adapters + Unibox + בוט וואטסאפ:** על שכבת השיח המשותפת `HELIX-BOTS-CONVERSATION-OPS` (webhook→Claude agent→tools; חלון 24h + utility templates + opt-in §30A) — **מוצר 3 מוסיף רק tools+system-prompt של SDR** (§3.3.5). וואטסאפ/טלגרם/מייל/לינקדאין(session)/מסנג'ר, **משותף עם מנוע ההפצה של מוצר 1**. webhooks נכנסים → `threads`/`messages` (thread per-`account`). ניטור `channel_connections.health_status` נגד חסימות.
- **HITL + audit:** Approval Queue (סולם אמון per-workspace) + `agent_activity` timeline — כל פעולת agent נרשמת והפיכה (§7, §8).
- **Compliance layer:** גייט `global_suppression`→`suppression_list` לפני כל שליחה + בדיקות §30A/GDPR.
- **Orchestration:** n8n כדבק אופציונלי.

## 5. משפטי/ציות — כפיצ'ר, לא מכשול
- **GDPR:** בסיס = legitimate interest (לא consent). public/business בלבד, שקיפות מקור, opt-out בכל הודעה, LIA per-קמפיין, זכות מחיקה → **רשימת דיכוי מרכזית מהיום הראשון**.
- **דיכוי חוצה-workspace (multi-tenant של סוכנויות):** opt-out אצל סוכנות אחת חייב לחסום את הליד על **כל** הפלטפורמה, לא רק ב-workspace שלה. `global_suppression` נבדק לפני כל שליחה מעל ה-`suppression_list` המקומי. בלי זה אנחנו מוכרים "compliant-by-default" ובונים מכונת-הפרות. **קריטי מוצרית, לא nice-to-have.**
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
| **1** | בסיס + **Search/Research** (דומיין → firecrawl scrape + company data) + `accounts`/`contacts` DB |
| **2** | **Enrichment waterfall** (email permutation+verify, providers config, cost-on-hit, freshness/decay) + enrichment view |
| **3** | **Message agent** — מחקר per-ליד (Claude) → הודעה מותאמת (עברית/אנגלית) + הגהה + גייט AI, נשמר כ-`message_variants` |
| **4** | **ערוצים + Unibox** — טלגרם+אימייל+וואטסאפ, תיבה מאוחדת (thread per-account), סיווג תגובות + **state machine**. **מנוע משותף עם מוצר 1** |
| **5** | **HITL + Compliance** — Approval Queue (סולם אמון), `agent_activity` timeline, דיכוי מקומי+גלובלי, חסימת §30A |
| **6** | **Signal + Learning engines** — מקורות איתות (§3.1), bandit על נוסחים/ערוצים (§3.2/§3.4), Follow-Up stage-aware |
| **7** | הרחבה: לינקדאין(session)/מסנג'ר, קביעת פגישה ביומן, אזור סוכנות white-label |

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
