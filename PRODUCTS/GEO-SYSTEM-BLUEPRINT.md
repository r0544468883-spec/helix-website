# HELIX GEO — בלופרינט המערכת (מכונת ה-GEO לניהול לקוחות)

מסמך-אב. המערכת המלאה לניהול GEO ללקוחות, כמו מכונת הסרטונים אבל ל-GEO: **onboard → מדידה → ביצוע → מעקב → דיווח**, לכל לקוח, בקנה מידה.

עוגן: המערכת היא ~80% קיימת ומפוזרת. הבנייה = **לאחד + לפרוס + לסגור פערים**, לא לבנות מאפס.

---

## 1. היעד (ספק מהשוק)

ממחקר השוק (Scrunch, Peec, Profound, Goodie, Rankscale, Trakkr, AthenaHQ), פלטפורמת GEO של סוכנות מכילה 6 שכבות:
1. **מדידה** — פרומפטים/ציטוטים/share-of-voice/תדירות-המלצה/סנטימנט × מנועים.
2. **מעקב לאורך זמן** — יומי, טרנדים, benchmark מתחרים, AI-traffic (GA4).
3. **אודיט** — מוכנות AI, בדיקות טכניות, פערי ציטוט, query-fanouts.
4. **ביצוע** — יצירת תיקונים + **פרסום ישיר ל-CMS** + off-site (אתר/Reddit/GBP/PR).
5. **רב-לקוחי** — דשבורדים, פורטלים white-label, workspaces, seats.
6. **אינטגרציות** — GSC/GA4/CMS/Slack/MCP/דוחות PDF/API.

נקודת עניין: ל-Trakkr יש tier "Managed 2,500$/חודש" (צוות שמבצע) + פרסום ישיר ל-CMS. זה בדיוק המיצוב והשכבה שלנו.

### המיצוב שלנו: הפערים בשוק = היתרונות שלנו
ממחקר ~15 פלטפורמות (Profound, Scrunch, Peec, Otterly, Goodie, Rankscale, Trakkr, AthenaHQ, Evertune, Brandlight, Semrush AIO, Ahrefs Brand Radar, rocketblue, Velut):
1. **רובן מודדות בלבד.** רק מעטות (Profound, rocketblue, Evertune) עושות **ביצוע** אמיתי. אנחנו שירות **done-for-you** מנוהל, זה היתרון המרכזי.
2. **GSC/GA4/CRM/Slack חסרים כמעט בכולן.** ל-Rank יש GSC+GA4 = יתרון.
3. **דוחות PDF white-label ללקוח חלשים בכולן** (כולן נשענות על Looker). ל-helix-pdf + פורטל = יתרון.
4. **White-label דק** (רק Peec נקי). הזדמנות.
5. **Velut הוא שירות בלי כלי** (כמונו), ו-Trakkr Managed = 2,500$/חודש. זה מאמת: לא "עוד tracker", אלא **פלטפורמת שירות GEO מנוהל** שהבידול שלה = ביצוע + אינטגרציות + דוח white-label. המדידה = table-stakes (יש לנו).

---

## 2. מה כבר יש לנו (מיפוי מול היעד)

| שכבה / פיצ'ר | יש? | מאיפה / reuse |
|---|---|---|
| מדידה (Share of Model, 4 מנועים) | ✅ | `lib/share-of-model.ts` + סקילים seo-geo, aeo-visibility-tracking, ai-visibility-sampling |
| הקשחת מדידה (Wilson CI, re-ask) | ✅ | limelit + ai-visibility-sampling |
| אודיט (AEO/פרינסטון/Entity) | ✅ | `lib/aeo-audit`, `geo-methods`, `entity/audit` + seo-schema/seo-technical |
| query-fanouts | ❌ פער | Rankscale יש; net-new |
| מעקב לאורך זמן (GSC/GA4/striking-distance) | ✅ מנוע | **HELIX Rank** (לא פרוס); צריך Google OAuth |
| ביצוע: מנוע תוכן | ✅ | Rank `content-engine` + playbook הביצוע |
| ביצוע: פרסום ישיר ל-CMS | חלקי | Rank WordPress adapter; רוחב CMS = פער (Trakkr-parity) |
| off-site: ציטוטים/מדרגים/PR/Reddit | ✅ סקילים | citation-gap-outreach, media-pr-outreach, seo-local/maps, quora/reddit |
| מסירה ללקוח (פורטל) | ✅ | `/portal` + client-files |
| CRM / לידים | ✅ | CRM + משפך ai-checker |
| **דשבורד רב-לקוחי (agency)** | ❌ פער | Rank `/sites` per-site בלבד; gtm-command-center + בנייה |
| **דוחות white-label** | חלקי | helix-pdf/xlsx; מיתוג-לקוח = פער |
| **ChatGPT Business Hub** (תביעה/agent/analytics) | ❌ חדש | תוצר ביצוע + מקור אנליטיקס net-new |
| פלייבוק הביצוע (SOP) | ✅ | `GEO-EXECUTION-PLAYBOOK.md` |

**הפערים לבנייה:** (1) לפרוס את Rank, (2) לאחד check+Rank+portal+CRM לזרימה אחת, (3) דשבורד רב-לקוחי, (4) דוחות white-label, (5) ChatGPT Business Hub, (6) רוחב CMS + crawler-block detection, (7) Google OAuth app.

---

## 3. ארכיטקטורה (מערכת אחת, 3 שכבות)

- **שכבת מדידה (קיימת, באתר helix):** share-of-model + 3 הביקורות + הדוח `/r` + geo-admin. גם מזין את משפך הלידים `/ai-checker`.
- **שכבת ביצוע+מעקב (HELIX Rank, לפרוס):** sites, GSC/GA4 OAuth, content-engine, distribution, entity-write, autonomy, act-loop, striking-distance.
- **שכבת ניהול (לבנות מעל):** דשבורד רב-לקוחי + onboarding + דוחות white-label + הפורטל הקיים + CRM.

הדבק בין השכבות: Supabase (reports/sessions/portal) + הפלייבוק (ה-SOP שמתרגם דוח→תוצרים).

---

## 4. הרכבה מסקילים מוכנים (לא לקודד)

רוב הרלוונטי כבר מותקן מקומית (`~/.claude/skills/`). להרכיב מהם:
- מדידה: `seo-geo` + `aeo-visibility-tracking` + `ai-visibility-sampling` + `aeo-score-audit`
- ישות/schema: `seo-schema`
- מדרגים/ביקורות: `seo-local` + `seo-maps` + `review-monitoring`
- תוכן: `geo-content-strategist` + `seo-content-brief` + `hebrew-seo-geo-toolkit` (סקריפטים), דרך `baldiga`/`ron-voice`
- ציטוטים/לינקים: `citation-gap-outreach` + `media-pr-outreach` + `brand-mention-monitor` + `quora-authority-answering`
- דאטה: `seo-dataforseo`/`seo-firecrawl`/`hebrew-seo-geo-toolkit` (לא לממש API מחדש)
- דיווח: `gtm-command-center` + `weekly-performance-advisor` + `helix-pdf`/`helix-xlsx`
- כל השאר ב-gtmskills.com: `npx skills add swan-gtm/gtm-skills --skill <name>` (MIT).

---

## 5. Roadmap (פאזות)

- **פאזה 0 (עכשיו):** לסקור את ה-branches של ערן (`geo-service-offering`, `geo-seo-optimization`) כדי לא לשכפל. להחליט היכן המערכת חיה (המלצה: לפרוס Rank).
- **פאזה 1 — הלולאה המלאה ללקוח אחד:** לפרוס Rank + Google OAuth + לחבר את הבדיקה → חתוקה מקצה לקצה: מדידה → תוכנית → ביצוע (תוצרי הפלייבוק) → מעקב → דוח לפורטל.
- **פאזה 2 — שכבת הסוכנות:** דשבורד רב-לקוחי + דוחות white-label + onboarding.
- **פאזה 3 — עומק:** ChatGPT Business Hub, רוחב CMS, autopilot (מתג האוטונומיה), עוד מנועים, query-fanouts.

---

## 6. מה צריך מרון (חוסמים)

**החלטות:** מודל תפעול (autopilot מול human-in-loop) · קנה מידה (כמה לקוחות) · מי מפעיל (white-label?) · מה אוטומטי מול ידני.
**פריסה:** Rank פרוס / אפליקציה חדשה / מכונה מקומית.
**Credentials:** Google OAuth app (GSC+GA4) · Semrush/DataForSEO · Supabase ל-Rank · דומיין מאומת ב-Resend · ChatGPT Business Hub+Persona. (יש: Anthropic, SerpAPI×3.)
**גישה:** branches של ערן · אתרי לקוחות · GSC/GA4/Business Hub per-client.
**עדיפויות:** לקוח ראשון (חתוקה) · פיצ'ר ראשון (הלולאה המלאה).
