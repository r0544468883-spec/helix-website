# תשתית OLLAMA ל-Daily Digest — מנוע HELIX Agent OS ⚙️🤖

> התשתית המשותפת שכל **קו מוצרי Agent OS** (מוצר 6) יושב עליה: מנוע אחד שמריץ סוכנים מתוזמנים, מנתב בין **Ollama מקומי** (נפח/עלות) ל-**Claude** (איכות/עברית), ומגיש **דייג'סט יומי אחד** דרך הבוט הרב-ערוצי.
> השראה: [freeCodeCamp — Scheduled Local AI Assistants](https://www.freecodecamp.org/news/how-to-build-and-schedule-local-ai-assistants-for-daily-tasks/), מוצרן ל-SaaS רב-דיירת.
> תאריך: 2026-07-18 · סטטוס: אפיון תשתית.

---

## 0. העיקרון
```
scheduler (cron per-tenant)
  → agent registry (איזה סוכנים פעילים ל-workspace)
    → model router (Ollama מקומי | Claude ענן)
      → agent.run() → פלט markdown
        → digest composer (מאחד את כל הפלטים לדייג'סט אחד)
          → delivery (וואטסאפ/טלגרם/מייל — מנוע ההפצה הקיים)
```
**Drop-in:** הוספת סוכן = רשומה ב-`agents` + קובץ handler. ה-scheduler לא משתנה (בדיוק כמו במדריך המקורי).

## 1. פורמט הסוכן (Agent)
כל סוכן = יחידה עם:
- `name` — מזהה (למשל `googl-stock`, `gsc-striking-distance`).
- `run(ctx)` — מקבל context (workspace, config, secrets) → מחזיר **markdown**. read-only כברירת מחדל; פעולה (write) דורשת HITL.
- `model_tier` — `'local'` (Ollama) | `'quality'` (Claude) | `'auto'`.
- `schedule` — cron (per-tenant, timezone-aware).

בקוד: כל סוג-סוכן = handler ב-`lib/agents/<name>.ts` עם `run()`; ה-registry ב-DB קובע אילו פעילים לכל workspace.

## 2. Model Router — Ollama מול Claude (מנוף העלות)
| משימה | מודל | למה |
|---|---|---|
| סיווג/תיוג, relevance, סנטימנט, סיכום קצר, extraction | **Ollama מקומי** (Qwen/Llama) | נפח גבוה, low-stakes → **אפס עלות API** |
| כתיבת תוכן, ניסוח עברי, baldiga, החלטות עדינות | **Claude** | איכות + עברית אנושית |
| ברירת מחדל (`auto`) | Ollama עם **Claude fallback** אם ציון-ביטחון נמוך | איזון עלות/איכות |
- **Ollama hosting:** (א) **שרת HELIX משותף** (Ollama על VM/GPU, כל הדיירים) — פשוט, אנחנו נושאים עלות חומרה; (ב) **מקומי אצל המשתמש** (privacy-first, אפס עלות לנו — ראה מדריך למשתמשים חיצוניים). ניתן להגדרה per-plan.
- **Ollama web_search API** (דורש `OLLAMA_API_KEY`) לסוכנים שצריכים דאטה טרי (חדשות/מתחרים).

## 3. Scheduler רב-דיירת
- **cron per-tenant** — כל workspace בוחר שעת דייג'סט (למשל 08:00 מקומי) → תזמון לפי timezone.
- ה-scheduler רץ (edge/worker/Vercel Cron), טוען את הסוכנים הפעילים של הדיירים שזמנם הגיע, מריץ, ומאחד.
- **בידוד שגיאות:** סוכן שנכשל נרשם וממשיך — לא מפיל את הדייג'סט (כמו במדריך).
- **caveat שינה:** במדריך המקורי, אם המכונה ישנה ההרצה מוחמצת. בענן/שרת HELIX אין בעיה; במקומי אצל המשתמש — צריך machine ער או catch-up.

## 4. Digest Composer + Delivery
- אוסף את פלטי כל הסוכנים של ה-workspace → מרכיב **דייג'סט אחד** (כותרת + סקשן per-agent, עברית).
- עברית עוברת **baldiga** לפני שליחה.
- **שליחה דרך מנוע ההפצה הקיים** (`HELIX-BOTS-CONVERSATION-OPS`): וואטסאפ (template utility) / טלגרם / מייל, לפי בחירת המשתמש.
- **דו-כיווני:** מהדייג'סט אפשר להשיב ("אשר את הפעולה", "ספר לי עוד על X") — מחובר למנוע השיח.

## 5. מודל נתונים (Supabase)
| טבלה | שדות עיקריים |
|---|---|
| `agents` | workspace_id, name, type, config_json, model_tier, schedule_cron, timezone, active |
| `agent_runs` | agent_id, started_at, status (ok/fail), output_md, error, model_used, tokens |
| `digests` | workspace_id, date, sections_json, channels[], sent_at |
| `agent_secrets` | workspace_id, key, value (מוצפן — טוקנים לבנק/מייל/APIs) |
| `ollama_endpoints` | workspace_id, mode (shared/local), base_url, api_key (לweb_search) |

## 6. אמינות ובטיחות
- **Anti-hallucination:** משימות עם מספרים (כסף/מדדים) — לאמת גולמי מול המקור לפני פעולה; להציג raw data בדייג'סט.
- **read-only כברירת מחדל;** פעולות (שליחת חשבונית, פרסום, הסרה) → **HITL** דרך הבוט.
- **הצפנת secrets** (טוקני בנק/מייל) — Supabase Vault / KMS.
- **פרטיות:** מצב Ollama-מקומי משאיר דאטה אצל המשתמש (זווית מכירה לארגונים רגישים).

## 7. Reuse ממה שכבר קיים
- **מנוע הפצה + שיח** — `HELIX-BOTS-CONVERSATION-OPS` (וואטסאפ/טלגרם/מייל, webhook, HITL). בונים 0 מזה מחדש.
- **cron/edge patterns** — כמו ב-helix-ops (`app/api/*/route.ts` + Vercel Cron).
- **content-agent + baldiga** — לניסוח הדייג'סט העברי.
- **rate-limiter/consent** — לסוכנים שפועלים (engagement/gray).

## 8. Roadmap תשתית
| שלב | מה בונים |
|---|---|
| **1** | `agents`/`agent_runs`/`digests` + scheduler בסיסי (Vercel Cron) + registry |
| **2** | Model Router (Claude קיים + חיבור Ollama shared) + digest composer + שליחה דרך הבוט |
| **3** | 3 סוכני-דגל (Daily brief / GSC striking-distance / mentions) — הוכחת מנוע |
| **4** | Ollama-מקומי למשתמשים חיצוניים (agent bridge) + web_search + secrets vault |
| **5** | UI ניהול סוכנים (drop-in, schedule, model tier) + HITL לפעולות |

## 8.5 סטטוס בנייה בקוד (helix-ops) 🏗️
המנוע נבנה כקוד ב-`helix-ops`, מקומפל נקי (0 שגיאות typecheck).
| רכיב | קובץ |
|---|---|
| **מיגרציה** — `agents`/`agent_runs`/`digests`/`ollama_endpoints` + RLS | `supabase/migration-v12.sql` |
| **Ollama caller** | `lib/agentos/ollama.ts` |
| **Model Router** (local/quality/auto + Claude fallback) | `lib/agentos/model-router.ts` |
| **Agent registry** (drop-in handlers: prompt/echo) | `lib/agentos/registry.ts` |
| **Digest composer** | `lib/agentos/digest.ts` |
| **Scheduler** (cron → run agents → compose → send דרך הבוט) | `app/api/agentos/route.ts` |
| **Server actions** (יצירת סוכן, toggle, חיבור Ollama) | `app/actions-agentos.ts` |
| **UI** — יצירת סוכנים + חיבור Ollama | `app/[locale]/agents`, `components/AgentsManager.tsx` |

**להרצה live:** הרצת `migration-v12.sql` · `DIGEST_SECRET` ב-env · חיבור endpoint של Ollama (מנוהל/מקומי) · Vercel Cron ל-`/api/agentos`. **חסר עדיין:** ה-HELIX Runner (כלי הלקוח למסלול B1) + handlers ייעודיים לכל agent pack (GSC/leads/reputation) + cron/timezone gating מדויק.

## 9. הפעלה דרך Ollama למשתמשים חיצוניים — מדריך תפעולי 🛠️
שתי דרכים לתת ל-Ollama לרוץ עבור לקוחות. בוחרים per-plan.

### מסלול A — HELIX-Hosted Ollama (מנוהל) — ברירת המחדל
**אנחנו** מריצים Ollama, הלקוח לא עושה כלום.
1. מקימים **VM עם GPU** (או CPU לדגמים קטנים) — למשל RunPod/Lambda/Hetzner-GPU.
2. מתקינים Ollama: `curl -fsSL https://ollama.com/install.sh | sh`.
3. מושכים דגם: `ollama pull qwen3.5:4b` (או Llama/Mistral קטן).
4. חושפים endpoint פנימי מאובטח: `OLLAMA_HOST=0.0.0.0:11434 ollama serve` מאחורי reverse-proxy עם bearer-auth (לא פתוח לאינטרנט).
5. ב-HELIX מגדירים ב-`ollama_endpoints` (mode=`shared`) את ה-base_url.
6. ה-Model Router שולח משימות `local` ל-endpoint הזה; Claude נשאר לענן.
- **יתרון:** UX מושלם, שליטה בעלות. **חיסרון:** אנחנו נושאים עלות חומרה (זול יחסית לדגמים קטנים).

### מסלול B — Bring-Your-Own Ollama (מקומי/פרטיות) — premium/ארגוני
הלקוח מריץ Ollama **אצלו** — הדאטה לא עוזבת את המכונה שלו. שתי גרסאות:

**B1 — HELIX Agent Runner (מומלץ, הדאטה נשארת מקומית):**
1. הלקוח מתקין Ollama + מושך דגם (כמו למעלה).
2. מתקין את **HELIX Runner** — כלי קטן (בהשראת ה-`scheduler.py` מהמדריך) ש: (א) מתחבר ל-HELIX cloud עם API-key אישי, (ב) מושך את חבילת-הסוכנים והתזמון שלו, (ג) מריץ אותם מקומית מול Ollama המקומי, (ד) שולח את הדייג'סט דרך הבוט. **רק הדייג'סט הסופי עוזב את המכונה, לא הדאטה הגולמית.**
3. מתזמן: cron / Task Scheduler (כמו במדריך המקורי):
   - Mac/Linux: `0 8 * * * /path/helix-runner` ב-`crontab -e`
   - Windows: `schtasks /Create /SC DAILY /TN "HELIX Runner" /TR "helix-runner.exe" /ST 08:00`

**B2 — Ollama endpoint רשום (ה-cloud קורא ללקוח):**
1. הלקוח מריץ Ollama מקומי וחושף אותו דרך **tunnel מאובטח** (Cloudflare Tunnel / ngrok עם auth) — לא IP פתוח.
2. רושם את ה-URL + bearer-token ב-HELIX (`ollama_endpoints`, mode=`local`).
3. ה-scheduler בענן קורא ל-Ollama שלו למשימות `local`.
- ⚠️ פחות מומלץ מ-B1: דורש שהמכונה תהיה ערה+חשופה. B1 עדיף לפרטיות.

### מה צריך שהלקוח יספק
| מסלול | הלקוח מספק |
|---|---|
| A (מנוהל) | כלום — רק מנוי |
| B1 (Runner) | מכונה ער + Ollama + התקנת Runner + API-key |
| B2 (endpoint) | Ollama + tunnel מאובטח + רישום URL |

### בטיחות + caveats
- **auth חובה** על כל endpoint (bearer), לעולם לא Ollama פתוח לאינטרנט.
- **caveat שינה:** במסלול מקומי, מכונה ישנה → הרצה מוחמצת (כמו במדריך). פתרון: catch-up run, או wake-schedule, או להעדיף מסלול A.
- **דגם קטן מהזה:** למכונות חלשות — דגם Qwen קטן יותר. **אימות חובה** על פלטים מספריים (הזיות).
- **fallback:** אם Ollama המקומי לא זמין → נפילה ל-Claude (או דחייה+התראה), לפי הגדרה.

### המלצת מוצר
- **ברירת מחדל = מסלול A** (מנוהל) לרוב ה-SMB — UX פשוט, אנחנו שולטים בעלות.
- **מסלול B1** כ**תוסף פרטיות/ארגוני** (עו"ד/רפואה/ממשל) — נקודת מכירה: "הדאטה לא עוזבת אותך".

---
**סיכום:** מנוע אחד — scheduler + registry + model-router (Ollama/Claude) + digest + delivery — שכל קו ה-Agent OS (מוצר 6) והמוצרים הקיימים יושבים עליו. Ollama מוריד עלות שוליים לאפס במשימות נפח; Claude שומר איכות עברית. למשתמשים חיצוניים: מסלול מנוהל (A) כברירת מחדל, או BYO-Ollama מקומי (B1) כתוסף פרטיות. בונים על התשתית הקיימת (בוט/שיח/cron/baldiga), לא מאפס.
