# HELIX — מפת סוכן→סקיל (Agent → Skill Master Map)

> מטרה: להפוך כל סוכן ב-13 המוצרים מ"קריאת API חשופה עם prompt" ל**סוכן מבוסס-סקיל** — שטוען ידע-דומיין מסקיל משותף אחד במקום prompt משוכפל בכל מוצר.
> נכתב אחרי אינוונטר מלא של כל קבצי ה-`lib/agents/**` בכל הריפוזיטורים + מחקר על שיטת החיבור המומלצת של Anthropic והקהילה.

---

## עיקרון-על (חובה לקרוא לפני הטבלאות)

**סקיל לכל *יכולת/דומיין*, לא לכל *סוכן*.** כל סוכן = **ארכיטיפ** (התנהגות: חוקר/יוצר/מבקר/עורך) × **דומיין** (ידע: SEO/CRO/חוזים/מכירות). הארכיטיפ נשאר ב-prompt; **הסקיל מספק את ידע-הדומיין**. לכן ~14 סקילי-יכולת אופקיים מכסים את כל ~60 הסוכנים, במקום 60 סקילים.

שני סוגי סקילים שכל סוכן טוען:
1. **סקילים חוצי-ארגון** (כל סוכן שכותב טקסט טוען אותם): קול-מותג, כתיבה עברית, ניקוי-טקסט/בלי-מקף.
2. **סקיל-דומיין אחד** לפי תחום הסוכן.

**סוכנים דטרמיניסטיים (בלי LLM) לא צריכים סקיל בזמן-ריצה** — הם מחשבים, לא מנסחים. סקיל מתחבר אליהם רק כ"הנחיה אנושית" בדשבורד (כמו ש-website-maintenance כבר עושה ב-`lib/skills/guidance.ts`).

---

## חלק א' — ספריית הסקילים המשותפת (~14 סקילי-יכולת)

לכל סקיל: מה הוא עושה · דרישות שחייב לעמוד בהן · מאיפה לקחת אותו.

### חוצי-ארגון (נטענים ע"י כל סוכן שמנסח טקסט)

| סקיל | מה עושה | דרישות | מקור |
|---|---|---|---|
| **helix-brand-voice** | פרסונת-מותג HELIX: טון, מסגור "מוצר = צוות סוכנים", בלי ביקורת פומבית על מתחרים | דו-לשוני HE/EN · לאסור שמות מתחרים · מסגור צוות-סוכנים | **לבנות** (custom) — אין מוכן |
| **hebrew-native-writer** | כתיבה עברית שנשמעת אנושית-ישראלית, מזהה AI-tells | 95/100 בסלף-אודיט · פאס הגהה (baldiga משגה איות) | מותקן: `baldiga-skill` + `hebrew-content-writer` |
| **clean-text-no-emdash** | ניקוי Unicode-נסתר + **איסור מוחלט על מקף ארוך (—)** | לרוץ אחרי כל Maker/Editor · פסיק/נקודה במקום מקף | קיים: `lib/clean-text` בכל ריפו + feedback-no-em-dash |
| **helix-data-schema** | סכמת טבלאות Supabase (profiles/applications/jobs...) לסוכנים שקוראים/כותבים דאטה | מעודכן מול המיגרציות · read/write conventions | **לבנות** (custom) |

### סקילי-דומיין

| סקיל | מה עושה | דרישות | מקור |
|---|---|---|---|
| **seo-geo-pack** | SEO טכני + GEO/AEO citability (JSON-LD, answer-first, llms.txt) | ישויות עקביות · answer-first לציטוט מנועי-AI · schema לפי סוג-עמוד | מותקן: `seo-technical`,`seo-schema`,`seo-geo`,`geo-content-strategist`,`hebrew-seo-geo-toolkit`,`seo-god`,`seo-content` |
| **cro-conversion** | אבחון וקבלת-החלטות CRO: משמעותיות סטטיסטית, מנופי-שדרוג | לגדר ברגע-הערך · עוגן-מחיר+ROI · reversibility של פעולה | מותקן: `conversion-rate-optimization`,`paywall-upgrade-cro`,`pricing-strategy`,`growth-loops` |
| **cold-outreach-copy** | ניסוח outbound קר: זווית, hook, ללא spam/over-promise | בלי טענות מומצאות על הליד · תאימות IL (בלי WA/TG קר) | מותקן: `brand-copywriter`,`persuasion-principles`,`sales-strategist`,`referrals` |
| **social-engagement** | תגובות/DM בשם המותג ברשתות, ברגישות-הקשר | דגל פוסט-רגיש (אבל/תלונה/משבר) · ToS/spam-safe · לא מכירתי | מותקן: `linkedin-posts`,`social-content`,`community-building`,`contagious` |
| **ecommerce-sell** | מכירה+שירות בחנות: עובדות-קטלוג בלבד, upsell משלים | מחיר רק מ-tool/קטלוג · לא להמציא מוצר/מלאי · CTA אחד | מותקן: `product-page-design`,`checkout-flow-optimization`,`e-commerce-retail` |
| **contract-legal** | סקירת חוזה: סעיפים חד-צדדיים/חסרים, תאימות IL | "בדיקת נוחות לא ייעוץ משפטי" · צ'קליסט juris. IL | מותקן: `legal-advisor` (agent) + `helix-esign`,`helix-formbuilder` |
| **accessibility-a11y** | נגישות WCAG 2.2 AA + ת"י 5568 | מקלדת/focus · alt · ניגודיות ≥4.5:1 · axe-core תחילה | מותקן: `accessibility-audit` |
| **qa-verification** | QA/צ'קליסט + הבחנת שבור-אמיתי מ-transient | 403/429/503 = לא שבור · verification-before-completion | מותקן: `qa-checklist`,`verification-before-completion` |
| **finance-metrics** | יחידות-כלכלה SaaS: MRR/CAC:LTV/churn, התראות | רק מספרים מ-context · לא להמציא נתון | מותקן: `saas-revenue-growth-metrics` |
| **competitive-intel** | מודיעין תחרותי: מהלכים→תובנות/איומים/פתחים | כל תובנה עם "אז מה" · internal-only | מותקן: `strategy-and-competitive-analysis` + agent `competitive-analyst` |
| **business-strategy** | אסטרטגיה CEO-level: יעדים, KPI, bets מתועדפים | bet עם owner · סיכונים מפורשים | מותקן: `business-strategy` |
| **project-orchestration** | תכנון-משימות + הקצאה לסוכנים (Chief of Staff) | תעדוף ICE · morning-plan/evening-summary | מותקן: `helix-project-management` |
| **code-review-ship** | תוכנית-מימוש מינימלית + PR (בלי לפתוח PR לבד) | tests · risks · gated (לא deploy לבד) | מותקן: `nextjs-code-review`,`nextjs-react-typescript` |
| **comms-storytelling** | ניסוח מייל-סיכום/פולואפ ברור מבוסס-עובדות | רק מחויבויות מאומתות מהתמלול · ux-writer microcopy | מותקן: `communication-storytelling`,`ux-writer` |

---

## חלק ב' — מטריצת סוכן→סקיל לכל מוצר

עמודת "סקיל" = בנוסף לחוצי-הארגון (brand-voice + hebrew-writer + clean-text) שכל Maker/Editor/Critic טוען.
**DET** = דטרמיניסטי, אין קריאת LLM ⇒ אין סקיל בזמן-ריצה (רק guidance אנושי אופציונלי).

### 1. HELIX Rank (`helix-rank`) — LLM: `claude()`
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| roles/researcher | Researcher | **seo-geo-pack** |
| roles/orchestrator | Strategist | **seo-geo-pack** + project-orchestration |
| roles/critic | Critic | **seo-geo-pack** (+ qa-verification לטענות לא-מאומתות) |
| roles/editor | Editor | DET (בונה מחרוזת הנחיות) |
| roles/linker | Internal-Linker | DET |
| department-chief | Chief | אורקסטרציה בלבד |

### 2. HELIX Growth Doctor (`helix-growth-doctor`) — LLM: `narrate()` (Ollama/Claude)
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| roles/analyst | Analyst | **cro-conversion** + finance-metrics |
| roles/critic | Critic | **cro-conversion** |
| roles/maker | Maker | **cro-conversion** |
| roles/editor | Editor | **cro-conversion** |
| roles/experimenter | Experimenter | **cro-conversion** (A/B design) |
| roles/prioritizer | Prioritizer | DET (ICE) |
| department-chief | Chief | אורקסטרציה |

### 3. HELIX OPS (`helix-ops`) — LLM: `claude()`
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| roles/researcher | Researcher | **social-engagement** |
| roles/critic | Critic (brand-safety) | **social-engagement** |
| roles/dm-critic | Critic (DM) | **social-engagement** |
| roles/budget-critic | Verifier (budget) | **cro-conversion** + finance-metrics |
| roles/editor | Editor | **social-engagement** |
| roles/scheduler | Scheduler | DET |
| department-chief | Chief | אורקסטרציה |

### 4. HELIX SDR (`helix-sdr-bdr-bot`) — LLM: `createLLM()`
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| roles/strategist | Strategist | **cold-outreach-copy** |
| roles/verifier | Verifier (enrichment) | **qa-verification** + competitive-intel |
| roles/outreach-critic | Critic (send-gate) | **cold-outreach-copy** |
| roles/reviser | Editor | **cold-outreach-copy** |
| roles/icp-scorer | Qualifier | **competitive-intel** (ICP-fit) |
| roles/channel-selector | Router/Compliance | **cold-outreach-copy** (חוקי-תאימות IL) |
| roles/objection-handler | Classifier | **cold-outreach-copy** |
| roles/deliverability | Verifier | DET (spam-filter) |
| department-chief | Chief | אורקסטרציה |

### 5. HELIX Meeting (`helix-meeting`) — LLM: `@anthropic-ai/sdk`
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| researcher | Researcher (מחויבויות) | **comms-storytelling** |
| critic | Critic (send-gate) | **comms-storytelling** + qa-verification |
| reviser | Editor | **comms-storytelling** |
| actioner | Maker (owner/due) | **project-orchestration** |
| scheduler | Scheduler | **comms-storytelling** |
| router | Router | DET |
| department-chief | Chief | אורקסטרציה |

### 6. HELIX Dashboards (`helix-dashboards`) — LLM: `narrate()`
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| maker | Maker (narrative) | **finance-metrics** + comms-storytelling |
| verify | Verifier (fact-guard) | DET |
| editor | Editor | **finance-metrics** |
| recommender | Recommender | **business-strategy** |
| department-chief | Chief | אורקסטרציה |

### 7. HELIX Sign-Forms (`helix-sign-forms`) — LLM: `fetch` (Ollama/Claude)
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| department-chief (+ inline researcher/editor) | Chief | **contract-legal** |
| critic | Critic (חוזה) | **contract-legal** |
| compliance | Compliance | DET (צ'קליסט regex IL) |

### 8. HELIX SHOP (`helix-shop`) — LLM: `deps.complete()` (Claude, deferred)
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| roles/product-expert | Researcher (RAG) | DET (חיפוש קטלוג) |
| roles/seller | Maker | **ecommerce-sell** |
| roles/editor | Editor | **ecommerce-sell** |
| roles/upsell | Merchandiser | DET |
| roles/fact-guard | Critic/Verifier | DET (regex מול קורפוס) |
| department | Chief | אורקסטרציה |

### 9. HELIX Website-Maintenance (`helix-website-maintenance`) — LLM: `claude()` (2 צוותים בלבד)
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| teams/drift/scanner | Scanner | DET-ish (חילוץ) — **clean-text** |
| teams/drift/fixer | Maker | **comms-storytelling** (כבר מחובר: `ux-writer`) |
| teams/drift/critic | Critic | qa-verification |
| teams/links/fixer | Maker | **qa-verification** (כבר: `qa-checklist`) |
| teams/links/critic | Critic | **qa-verification** |
| 19 detectors + team-chiefs | Detector/Chief | DET — **guidance בלבד** (כבר ממופה ב-`guidance.ts`/`seo-pack.ts`) |

> ⚠️ website-maintenance כבר מחזיק מיפוי סקיל→מנוע ידני ב-`lib/skills/guidance.ts` + `seo-pack.ts`. זה הדפוס להחליף מ"טקסט מועתק ביד" לחיבור-סקיל אמיתי (חלק ג').

### 10. ai-kit — סוכנים משותפים (`_shared/ai-kit/agents/`, PLUG) — `AgentDef` דקלרטיבי
| סוכן | ארכיטיפ | סקיל-דומיין |
|---|---|---|
| finance | Analyst | **finance-metrics** |
| ads-management | Optimizer | **cro-conversion** (+ paid-ads skill — פער, לבנות) |
| competitor-research | Researcher | **competitive-intel** |
| customer-support | Maker/Editor | **comms-storytelling** + ecommerce-sell |
| strategy | Strategist | **business-strategy** |
| orchestrator | Planner | **project-orchestration** |
| code-generation | Maker | **code-review-ship** |
| deployment | Release | **qa-verification** |

> ⚠️ ל-ai-kit **אין** קובץ skill-wire (בניגוד ל-website-maintenance). כרגע ה-`AgentDef` מחזיק `rules[]` inline — זה היעד הראשון להמרה לסקיל.

---

## חלק ג' — איך מחברים סקיל לסוכן (השיטה המומלצת)

מבוסס על תיעוד Anthropic + הקהילה (2025-2026).

### מה זה סקיל טכנית
תיקייה עם `SKILL.md` (frontmatter: `name` ≤64 תווים · `description` ≤1024 — **זה מנגנון ה-triggering**) + `scripts/`/`references/`/`assets/` אופציונליים. **Progressive disclosure** ב-3 רמות:
1. מטא-דאטה (~100 טוקן/סקיל) — תמיד בזיכרון.
2. גוף SKILL.md (<500 שורות) — נטען רק כשרלוונטי.
3. references/scripts — נטענים רק כשמופנים; קוד-סקריפט מריץ ב-bash ורק ה-stdout נכנס ל-context.

### שתי דרכי-ריצה בפרודקשן
**דרך A — Messages API + Skills API (מומלצת לנו — 60 הסוכנים כבר `messages.create`):**
- מוסיפים tool `code_execution_20250825` + פרמטר `container.skills[]` (עד 20 סקילים/בקשה).
- מעלים סקיל פעם אחת: `client.skills.create(files_from_dir(...))` → מקבלים `skill_id`+`version`.
- **אין מיגרציית-תשתית** — רץ ב-sandbox של Anthropic. השינוי מול היום: (1) tool code-execution, (2) container.skills, (3) העלאת התיקייה.
- ⚠️ sandbox = **אין רשת ואין pip/npm בזמן-ריצה** — סקיל שנבדק ב-Claude Code (עם רשת) עלול להתנהג אחרת כאן. לבדוק מול ה-runtime האמיתי.

**דרך B — Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`):**
- זה harness של Claude Code כספרייה headless. סקילים = קבצים ב-`.claude/skills/` שמתגלים דרך `settingSources:["user","project"]` + `skills:"all"`.
- גישה מלאה לרשת/מקומי, אבל = החלפת מנוע-ריצה מלאה. מתאים רק לסוכן שממילא מעבירים ל-SDK.

### Best practices (חובה)
- **גרנולריות:** סקיל לכל יכולת, לא לכל סוכן (כל חלק א' בנוי על זה).
- **description = keyword-rich, גוף שלישי, "מה + מתי"** — זה כל מנגנון ה-triggering. הכי חשוב.
- **<500 שורות** לגוף; עודף → `references/*.md` **הופ אחד בלבד** מ-SKILL.md (הפניה עמוקה יותר לא נקראת מלא).
- **DRY:** ידע-ארגון משותף (קול-מותג, סכמת Supabase, חוקי-תאימות) בסקיל אחד שרבים טוענים — לא משוכפל.
- **סקריפטים ל-ops שברירי** (מיגרציות, signed-URL) — הקוד לא נכנס ל-context, רק stdout ⇒ אמין וזול יותר.
- **eval לפני docs:** מריצים סוכן בלי הסקיל, מזהים פערים, כותבים מינימום לסגור אותם.

### מלכודות (מהמחקר)
- **Skill bloat:** ככל שהספרייה גדלה, triggering שגוי אם descriptions מעורפלים ⇒ להשקיע בתיאורים מובחנים.
- **אבטחה = הרצת-קוד לא-נבדקת:** לאמץ רק סקילים ממקור-אמון. כל סקיל מ-GitHub → **קריאת-אבטחה ידנית** (תואם [[feedback-license-check-clean-room-first]]).
- **גרסאות:** סקיל custom הוא **workspace-scoped**. לנעול `version` מפורש בפרודקשן — לא `"latest"` (עדכון של מישהו משנה את כל הסוכנים בשקט).
- **בידוד multi-tenant:** אם 13 המוצרים חולקים workspace אחד — כל סוכן ניגש לכל סקיל. אם צריך בידוד → workspace נפרד למוצר.

---

## חלק ד' — מאיפה לקחת סקילים מוכנים

לפי כלל reuse-before-build ([[reuse-before-build-sources]]) — לחפש קודם, לבנות רק את הפער.

| מקור | מה יש | הערה |
|---|---|---|
| **anthropics/skills** | הרשמי — pptx/xlsx/docx/pdf + דוגמאות | מקור-אמון, בלי קריאת-אבטחה |
| **ComposioHQ/awesome-claude-skills** | 1000+ סקילים (coding/marketing/security) | כבר ברשימת CLAUDE.md |
| **travisvn / BehiSecc / GetBindu awesome-claude-skills** | רשימות קהילה נוספות | קריאת-אבטחה חובה |
| **awesomeclaude.ai** | ממשק חיפוש מעל הרשימות | — |
| **הסקילים המותקנים אצלנו** (`~/.claude/skills`) | רוב סקילי-הדומיין בחלק א' כבר קיימים | להמיר לספריית-ריצה משותפת |

### פערים לבנות (custom — אין מוכן)
1. **helix-brand-voice** — פרסונת-מותג (חוצה-ארגון, קריטי).
2. **helix-data-schema** — סכמת Supabase.
3. **paid-ads** — ניהול Google/Meta בתשלום (פער מ-[[polsia-teardown]], ל-ads-management).

---

## סדר-עבודה מומלץ (פיילוט קודם, לא הכל בבת-אחת)
1. **ai-kit** תחילה — הכי נקי (8 `AgentDef` דקלרטיביים, join key = role/goal), ואין לו skill-wire. להמיר `rules[]` → סקילי-יכולת.
2. או **SHOP** — כבר יש loop של Claude tool-use (`model/complete.ts`) + `@helix/agents` נקי.
3. לבנות את 3 סקילי-ה-custom + ספריית-ריצה משותפת מ-`~/.claude/skills`.
4. לנעול גרסאות, לבדוק מול sandbox, ואז לגלגל למוצר הבא.

_עודכן: 2026-08-28_
