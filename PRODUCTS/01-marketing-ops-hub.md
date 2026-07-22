# פרויקט 1: HELIX OPS (Marketing Ops Hub) 🟢

> כלי ניהול תוכן שיווקי מקצה-לקצה למחלקות שיווק. Hebrew-first. **מודל דואלי:** מכירה ישירה תחת מותג HELIX (ערוץ ראשי) + הפצה white-label דרך שותף/סוכנות (ערוץ אופציונלי).
> **Wedge:** creative request intake → approval workflow → proofing → הפצה אומניצ'אנל.
> תאריך: 2026-07-16 · **סטטוס: כל הליבה בנויה כקוד (שלבים 1-5 + פאזה 2 + 9 פלטפורמות), מקומפל נקי (0 שגיאות). טרם רץ live.**
> קוד: `C:\Users\User\Desktop\helix\helix-ops` (Next.js 15 + Supabase + Tailwind + RTL).

---

## 0. סקירת מוצר ומצב נוכחי

### מה בדיוק המוצר
**HELIX OPS** — מערכת אחת שמנהלת את **כל מחזור החיים של תוכן שיווקי**: מהרגע שמישהו מבקש תוכן, דרך יצירה ב-AI, אישור ובקרת מותג, ועד הפצה לכל הערוצים. עברית-first, RTL מלא.

### מה הוא עושה (הזרימה)
```
בקשה → 🤖 יצירת תוכן AI (per-ערוץ) → 📎 נכס + הערות-על-גבי + 🔍 בדיקת מותג
     → ✅ אישור → 🔀 הפצה ל-9 פלטפורמות → 🗂️ כספת נכסים
```

### קהל יעד
- **עיקרי:** מחלקות שיווק בחברות ישראליות.
- **Solo:** פרילנסרים / עסקים קטנים ("צור והפץ").
- **Agency:** סוכנויות שמנהלות שיווק להרבה לקוחות (white-label).

### למה משמש / מטרתו
להחליף את הבלגן של **WhatsApp + מיילים + אקסל + 5 כלים נפרדים** במערכת אחת — לרכז בקשות, אישורים, יצירת תוכן והפצה במקום אחד, ולתת למחלקת שיווק שליטה מלאה על מחזור החיים.

### יתרונות
- **מקצה-לקצה במקום אחד** — בקשה עד הפצה, לא 5 כלים.
- **Hebrew-first + RTL** — אף מתחרה גלובלי לא נותן.
- **AI ליצירת תוכן per-ערוץ** + הומניזציה + גייט AI-detection ("לא נשמע כמו AI").
- **לינטר מותג** (Claude vision) — בודק צבע/פונט/לוגו/דיסקליימר.
- **9 פלטפורמות הפצה כולל וואטסאפ** — הערוץ מס' 1 בישראל שאף מתחרה לא עושה.
- **native (בלי n8n)** — זול לתחזוק, בלי תלות חיצונית.
- **רב-דיירת (RLS per-workspace)** — מתאים לסוכנויות.

### חסרונות / מגבלות
- **טרם רץ live** — צריך חיבור Supabase + Claude.
- **Meta/LinkedIn/X** דורשים הקמת אפליקציית מפתחים + אישור פרסום מ-Meta (איטי, חיצוני).
- **אישור חד-שלבי** — שרשרת אישורים רב-שלבית עדיין לא ממומשת.
- **אריזות Solo/Business/Agency** — feature-flags עדיין לא ממומשים.
- **לינטר מבוסס LLM-vision** — לא דטרמיניסטי ב-100% (צבע/פונט מדויק).
- **מזהי-AI לא אמינים ב-100%** (בעברית במיוחד) — המטרה "נקרא אנושי", לא "מנצח כל detector".

### פלטפורמות מחוברות (9)
| מוכנות | פלטפורמות |
|---|---|
| 🟢 עובד מיד (token/webhook) | טלגרם · מייל · Discord · Slack |
| 🟡 צריך token מ-dev app | וואטסאפ · פייסבוק · אינסטגרם · לינקדאין · X |

### מה כבר בנוי (קוד מקומפל)
- **שלב 1:** Request Desk (טופס + לוח תור drag-drop).
- **שלב 2:** ניקוי + מיתוג HELIX OPS.
- **שלב 3:** Approval Flow (נכסים, גרסאות, הערות-על-גבי, אישור).
- **שלב 4:** Content Agent (טיוטה per-ערוץ + הומניזציה + ציון AI).
- **שלב 5:** מנוע הפצה — **29 adapters (כל הרשתות)** + תזמון (cron). ראו טבלת הערוצים בהמשך.
- **פאזה 2:** Brand Vault (כספת) + לינטר מותג (Claude vision).
- **ניהול ערוצים:** מסך `/channels` להזנת config לכל פלטפורמה.
- **🎬 Video Studio (Remotion + mediabunny):** מעלים clips/תמונות/סאונד → הסטודיו מרכיב סרטון (רצף + כתוביות עברית מהסקריפט + מעברי fade) → תצוגה מקדימה (@remotion/player) → סידור ידני → **ייצוא MP4 בדפדפן** (mediabunny/WebCodecs — canvas→MP4, אפס עלות שרת) → `video_url` זורם ל-adapters TikTok/YouTube.
- **שכבת UX + אפקטים (2026-07-17):** onboarding · toasts · confirm-dialogs · loading-skeletons · חיפוש · active-nav · מחיקה · נגישות. אפקטים: מעברי-עמוד · קונפטי · מונה מונפס · chips קפיציים · hover-lift · typing-dots · תנועת-לוגו + neon-glow (מ-EFFECTS.md) · כתוביות וידאו ממותגות · reduced-motion. ציון UX ~44/50.
- 6 קבצי SQL · ~45 קבצי קוד · 0 שגיאות typecheck.

### מה חסר / מה צריך להשלים
1. **חיבור חי (הכי דחוף):** פרויקט Supabase → הרצת 5 קבצי SQL → bucket `ops-assets` → `.env.local` (Supabase + `ANTHROPIC_API_KEY` + `RESEND_API_KEY`) → `npm run dev`.
2. **OAuth + אישור פלטפורמות (חיצוני):** אפליקציות מפתחים אצל Meta/LinkedIn/X + אישור פרסום מ-Meta (שבועות).
3. **עידונים בקוד:** שרשרת אישורים רב-שלבית · אריזות Solo/Business/Agency (feature-flags) · אזור סוכנות white-label.
4. **חיזוק לינטר (עתידי):** color-thief (צבע דטרמיניסטי) · MinerU (OCR חזק) · transformers (גיאומטריית לוגו).
5. **Engagement (חדש — סעיף 2.6):** ההפצה היום send-only. חסר: מנוע Fuzzy AI לתגובות, Comment-to-DM funnel, מענה-הודעות, ולולאה אוטונומית — לסגירת הפער מול enso. כולל בקרות בטיחות + התראת חשיפה לערוצים האפורים (LinkedIn/Meta).

### 🎯 התאמה למטרה הראשונית של המוצר
**המטרה המקורית (מהאפיון, סעיפים 1-8 למטה):** ה-**wedge הצר והחד** — `intake → approval → proofing` — כלי תפעולי פנימי למחלקת שיווק, Hebrew-first, שנמכר white-label דרך בסיס הלקוחות של הסוכנות. האסטרטגיה שנקבעה: **לבנות wedge → לתקף (fake-door/concierge) → להרחיב.**

| היבט | מקורי | נבנה | מיושר? |
|---|---|---|---|
| ליבת ה-wedge (intake+approval+proofing) | ✅ | ✅ | ✅ מיושר |
| Hebrew-first + RTL | ✅ | ✅ | ✅ |
| all-in-one זול ושקוף | ✅ | ✅ (בעיצוב) | ✅ |
| רב-דיירת / קסטומיזציה per-לקוח | ✅ | ✅ (workspaces+RLS) | ✅ |
| מכירה white-label דרך סוכנות | ✅ (מודל עסקי) | ⬜ tiers/white-label לא ממומש | 🟡 חלקי |
| **היקף** | wedge צר | **הורחב** ל-content-AI + הפצה 9 פלטפורמות + לינטר | ⚠️ הרחבה |
| **תיקוף לפני בנייה** | fake-door/concierge קודם | **דולג** — נבנה רחב לפני תיקוף | ⚠️ סטייה |

**האמת הכנה:**
- ✅ **הכיוון מיושר** — המוצר משרת בדיוק את מחלקות השיווק, בעברית, מקצה-לקצה. הליבה נאמנה למטרה.
- ⚠️ **נבנה רחב מדי, מוקדם מדי.** האסטרטגיה הייתה: wedge צר → תיקוף → הרחבה. בפועל נבנה **כל מחזור החיים** (יצירה + הפצה + לינטר) **לפני** תיקוף מול לקוח אמיתי. הרוחב הוא נכס — אבל **התיקוף עדיין חסר**, וזה הסיכון העיקרי.
- ⚠️ **המודל העסקי (white-label/tiers) עדיין לא בקוד** — ה"נמכר דרך הסוכנות" מעוצב אך לא ממומש.

**המלצה:** לפני השקעה נוספת — **לתקף מול לקוח אמיתי** (fake-door/concierge, כמפורט בסעיף 7) כפי שתוכנן במקור. הרוחב שנבנה מצוין, אך אינו מחליף את התיקוף.

---

## 1. הבעיה
מחלקת שיווק מנהלת את העבודה ב-**WhatsApp + מיילים + אקסל**. בקשות ("תעשה לי באנר", "צריך פוסט לחג") נכנסות מכל מקום; אישורים נתקעים כי המנכ"ל לא עונה; אף אחד לא יודע מה הסטטוס. זו לא בעיית "אין כלי" — יש monday/Asana — אלא שהם **גנריים מדי**: מנהלים משימות, לא נכסים שיווקיים עם תהליך אישור וברמת מותג.

## 2. הפתרון — מחזור חיים מלא של תוכן שיווקי (סדר בנייה)
1. **Request Desk** (MVP) — טופס כניסה אחד לכל בקשת שיווק → תור → סטטוס → נמסר. מחליף בלגן מיילים/וואטסאפ.
2. **Approval Flow** (הווָאו) — כל נכס עולה עם גרסאות, הערות **על גבי המקאפ**, ושרשרת אישורים לפי מבנה הארגון. כאן נשבר הצוואר-בקבוק.
3. **🔀 הפצה אומניצ'אנל** — אחרי האישור: **בלחיצה אחת מפיצים את התוכן לכל הערוצים** (פייסבוק, אינסטגרם, לינקדאין, טלגרם, וואטסאפ, מייל). זה הופך את המוצר מ"ניהול פנימי" ל**כלי שלם**: `בקשה → הפקה → אישור → הפצה`.
4. **Brand Vault + לינטר** (פאזה 2) — מאגר נכסים מאושרים + סריקה והתרעה על חריגות מ-brand-guide.

### 🤖 ה-Agent (עובד תוכן) — מתזמר skills לפי ערוץ
ה-agent של מוצר 1 הוא **agent תוכן** (לא מכירות — זה מוצר 3). נכנס בשני מקומות:
- **הפקה:** בקשה → טיוטה. **מתזמר את ה-skill המתאים לכל ערוץ** (לא ניסוח גנרי אחד): `linkedin-posts` (לינקדאין), `carousel-writer` (אינסטגרם), `whatsapp-automation` (וואטסאפ), `brand-copywriter` (מודעות/באנר), `social-content` (כללי).
- **הפצה:** מתאים per-ערוץ + בוחר זמן אופטימלי + מפרסם בכל הערוצים.
- **האדם תמיד מאשר באמצע** — ה-agent עושה טיוטה+התאמה+פרסום, לא מחליט לבד.

**⚠️ הומניזציה + בדיקת-AI + הגהה (חובה) — דו-לשוני:** ה-agent מזהה **שפה לפי הערוץ/הקהל** ומריץ את הענף המתאים:
```
בקשה → זיהוי שפה + ערוץ:
  ├─ 🇮🇱 עברית (וואטסאפ, פייסבוק/אינסטגרם/לינקדאין מקומי)
  │     → Hebrew Content by Helix (טון + זיהוי דפוסי AI, סף 95/100)
  │     → הגהת Claude (תיקון שגיאות כתיב)
  └─ 🌍 אנגלית (Reddit, Medium, Dev.to, X גלובלי, Hashnode)
        → copywriting / brand-copywriter / linkedin-posts → humanize אנגלית
   ↓ (שני הענפים)
  🚦 גייט AI-detection (בשפה המתאימה) → אישור אנושי → הפצה
```
**הגייט** מבטיח שהתוכן **לא ירגיש כמו בינה מלאכותית**. הערות: (א) מזהי-AI לא אמינים ב-100% — המטרה "נקרא אנושי", לא "מנצח כל detector"; **באנגלית הם בשלים יותר** מבעברית. (ב) הבידול נשאר **Hebrew-first**, אבל המוצר **דו-לשוני** — עברית לישראל, אנגלית לגלובלי/נישתי. ניתוב אוטומטי לפי ערוץ, או בחירה ידנית של המשתמש.

### מנוע ההפצה — לא Postiz ישירות
Postiz (OSS) עושה 30+ ערוצים + AI + agents-דרך-MCP, **אבל:** (א) רישוי **AGPL** = בעיה למכירה סגורה; (ב) **לא עושה וואטסאפ** = ה-wedge הישראלי. לכן: **מנוע הפצה עצמי** ערוץ-ערוץ — **וואטסאפ Cloud API קודם**, אז טלגרם/פייסבוק/אינסטגרם/מייל (כל ערוץ = קריאת API). בהשראת ארכיטקטורת Postiz (בנוי להיות מונע-AI דרך MCP — דפוס שנשכפל עם Claude שלנו). Postiz = רפרנס/self-host, לא בסיס למכירה.

**כל ערוץ = adapter אחד. מספר ערוצים בלתי מוגבל. סדר הרחבה:**
| Tier | ערוצים | שפה טיפוסית | מתי |
|---|---|---|---|
| **1 — ליבה ישראלית** | וואטסאפ, טלגרם, פייסבוק, אינסטגרם, לינקדאין, מייל | עברית | MVP |
| **2 — סושיאל רחב** | X/טוויטר, טיקטוק, יוטיוב, Threads, Pinterest | עברית/אנגלית | אחרי MVP |
| **3 — נישתי/מקצועי** | Reddit, Medium, Dev.to, Hashnode, WordPress, Bluesky, Mastodon, Discord, Slack, Google My Business | אנגלית | הרחבה |
| **4 — זנב ארוך** | Warpcast, Nostr, Lemmy, Twitch, Kick, VK, MeWe, Dribbble | אנגלית | לפי ביקוש |

- **התאמת תוכן per-ערוץ (לא הדבקה):** Reddit שונא קידום (טון קהילתי אותנטי או באן); Medium/Dev.to = ארוך ומעמיק; X = קצר/thread; לינקדאין = מקצועי. ה-agent כותב מחדש לפי נורמות הערוץ.
- **GitHub אינו ערוץ הפצה** (זה קוד) — קהל המפתחים מגיע דרך Dev.to/Hashnode.
- **בנייה:** Tier 1 adapters משלנו (וואטסאפ קודם). לזנב הנישתי — אפשר Postiz self-host כ"מנוע זנב-ארוך" (עם הסתייגות ה-AGPL), או adapters משלנו לפי ביקוש. **לא צריך הכל ביום 1.**

## 2.6 מנוע Engagement + Comment-to-DM + מענה-הודעות (Fuzzy AI) 💬🎯
היום ההפצה **send-only** — מפרסמת אך לא מקשיבה/מגיבה. זו ההרחבה שסוגרת את הפער מול **enso Agentic Social** ומוסיפה תגובות אוטומטיות, funnels ומענה-הודעות.

### 2.6.1 סגירת הפערים מול enso
| פער (enso יש, לנו אין) | מה בונים |
|---|---|
| **Engagement loop** (ניטור אזכורים + תגובה) | הרחבת `lib/distribution` לדו-כיווני: `listen()` + `reply()`, לא רק `send()` |
| **לולאה יומית אוטונומית** | scheduler: mine→plan→publish→engage→re-cut |
| **Mine / שאיבת סיגנל** | מושך מוצר/מכירות/לקוחות/GSC כחומר-גלם לפוסטים |
| **Re-cut / compounding wins** | לוקח פוסט מנצח (attribution) וממחזר ל-threads/carousels/short-video (`video-timeline.ts` הקיים) |

### 2.6.2 מנוע Fuzzy AI לתגובות (feed/קבוצות/קונקשנים)
מגיב בפוסטים של אחרים בצורה אנושית: **Discovery** → **ניקוד רלוונטיות fuzzy** (embedding similarity, סף ~0.72 — "קרוב מספיק") → **החלטה** (לייק/תגובה/דילוג) → **יצירה** ב-brand voice + וריאציה אנושית (עברית→baldiga) → **HITL** (אישור לפני פרסום).

| פלטפורמה | תגובה בפוסטים של אחרים | דרך | סיווג |
|---|---|---|---|
| X, Reddit, Bluesky, Mastodon, Nostr | ✅ נתמך ב-API | API רשמי | 🟢 compliant |
| טלגרם/דיסקורד/סלאק | ✅ בקבוצות שהבוט חבר | Bot API | 🟢 compliant |
| הפוסטים שלך (כל רשת) | ✅ תגובה לתגובות | API רשמי | 🟢 compliant |
| **LinkedIn / Instagram / Facebook** — פיד/קבוצות/קונקשנים | ❌ אין API | **content-script (מודל PLUG extension)** | 🔴 אפור, סיכון חסימה |

### 2.6.3 בקרות בטיחות ("מתחת לראדאר") — חובה 🛡️
| פלטפורמה | תגובות/יום (בטוח) | הערה |
|---|---|---|
| **LinkedIn** 🔴 | 8-15 (התחל 5) | הכי רגיש |
| **Instagram/Facebook** 🔴 | 10-20 (התחל 5) | חשבון חם עדיף |
| X 🟢 | 30-50 | API |
| Reddit 🟢 | 10-20 | כבד כללי סאב |
| Bluesky/Mastodon/Nostr 🟢 | 30-50 | סיכון נמוך |

- **מנגנון:** hard-cap יומי per-רשת + jitter + warm-up ramp + שעות אנושיות + פיזור.
- **התראת חשיפה** (חובה): מודל opt-in מפורש ("מנוגד ל-ToS, עלול לחסום את חשבונך, באחריותך") + **מד-חשיפה חי** (ירוק/כתום/אדום) + **kill-switch** + **auto-pause** על CAPTCHA/אזהרה.
- **מתחת ל-~10-15/יום ב-LinkedIn ו-~10-20 ב-IG/FB, עם warm-up ו-jitter → סיכון נמוך.** מעל זה, בלי jitter → שם החסימות.

### 2.6.4 Comment-to-DM Funnel — פיצ'ר דגל compliant 🎯📩
המנגנון שחברות משתמשות בו: פוסט → גולש מגיב → תגובה פומבית **+ DM פרטי עם פרטים** → ליד. **יזום על ידי הגולש → חוקי ובטוח.**
```
פרסום "כתבו 'מידע' 👇" → גולש מגיב "מידע" → Webhook → תגובה פומבית "שלחנו לך DM 📩"
   → DM פרטי עם הפרטים → חלון 24 ש' → סיווג כוונה, איסוף, הסגרת ליד
```

**איפה מגדירים את ההודעה הפרטית ואת הניסוח (במסך Comment-to-DM Funnels):** לכל funnel 3 שדות ניסוח —
1. **מילת טריגר** — מה שהגולש כותב ("מידע").
2. **תגובה פומבית** — מה שמגיב בגלוי מתחת לפוסט ("שלחנו לך הודעה בפרטי 📩").
3. **🎯 הודעה פרטית (DM) — כאן כותבים את הניסוח** — טקסט ההודעה עם משתנים (`{{שם}}`, `{{לינק}}`). ניתן **ידני** או **AI ב-brand voice** (עברית→baldiga, אישור אנושי). תומך **flow רב-שלבי** (הודעה ראשונה → מענה → שאלת המשך → איסוף פרטים). נשמר ב-`comment_funnels.dm_flow_json`.
   - ⚠️ **וואטסאפ:** DM יזום מחוץ לחלון 24 ש' דורש **template מאושר**; ב-Messenger/IG ה-Private Reply לתגובה מותר free-form תוך 7 ימים.

**דוגמאות ניסוח מוכנות (רפרנס לבנייה):**

*דוגמה 1 — לכידת ליד (מדריך/הצעה):*
```
פוסט:            "בניתי מדריך: 7 טעויות שיווק שמבזבזות לכם תקציב. כתבו 'מדריך' 👇"
מילת טריגר:      מדריך
תגובה פומבית:    "יאללה, שלחתי לך הרגע בפרטי 📩"
הודעה פרטית (DM): "היי {{שם}} 👋 הנה המדריך כמו שהבטחתי: {{לינק}}
                   תגידי לי מה הכי בער לך שם — אשמח לכוון."
מענה של הגולש → המשך: "מעולה. רוצה שנעבור על זה יחד ב-15 דק' בלי התחייבות? {{לינק_יומן}}"
```

*דוגמה 2 — קביעת שיחה (שירות):*
```
פוסט:            "מקבל 3 לקוחות חדשים החודש. מתאים לך? כתבי 'פרטים' 👇"
מילת טריגר:      פרטים
תגובה פומבית:    "שלחתי לך פרטים בפרטי 🙌"
הודעה פרטית (DM): "היי {{שם}}, כיף! ספרי לי בקצרה — מה התחום ומה היעד?
                   ({{שם_עסק}} עוזר בדיוק עם זה.)"
סיווג כוונה → אם ליד חם: "בוא נקבע שיחה קצרה. איזה יום נוח לך? {{לינק_יומן}}"
                → אם רק מתעניין: "אין לחץ 🙂 משאיר לך את זה: {{לינק}}"
```
*דוגמה 3 — מכירת מוצר (e-commerce):*
```
פוסט:            "הקולקציה החדשה עלתה 🔥 כתבו 'רוצה' ואשלח לינק + הפתעה קטנה 👇"
מילת טריגר:      רוצה
תגובה פומבית:    "שלחתי לך בפרטי 💌"
הודעה פרטית (DM): "היי {{שם}}! הנה הקולקציה: {{לינק}}
                   ובתור תודה שכתבת — {{קוד_קופון}} ל-10% הנחה, תקף 48 שעות ⏳"
מענה של הגולש → המשך: "כיף! צריכה עזרה במידה או בבחירה? אני פה 🙌"
```

*דוגמה 4 — הרשמה לוובינר:*
```
פוסט:            "וובינר חינם: איך להכפיל לידים ב-2026. כתבו 'הרשמה' 👇"
מילת טריגר:      הרשמה
תגובה פומבית:    "שלחתי לך פרטי הרשמה בפרטי 🎥"
הודעה פרטית (DM): "היי {{שם}} 👋 שמח שבאת! הוובינר ב-{{תאריך}} בשעה {{שעה}}.
                   קישור הרשמה: {{לינק}}
                   אשלח לך תזכורת יום לפני 📅"
המשך אוטומטי (תזכורת): "היי {{שם}}, מזכיר — הוובינר מחר בשעה {{שעה}}. נתראה! {{לינק}}"
```

*דוגמה 5 — קוד קופון (WhatsApp, כפתור COPY_CODE):*
```
פוסט:            "מבצע השבוע בלבד. כתבו 'קופון' וקבלו קוד אישי 👇"
מילת טריגר:      קופון
תגובה פומבית:    "הקוד בדרך אליך בפרטי 🎁"
הודעה פרטית (DM): "היי {{שם}}! הנה הקוד שלך: {{קוד_קופון}} (העתק בלחיצה)
                   ל-15% הנחה עד {{תאריך}}. קנייה מהנה! 🛍️"
                   [כפתור: העתק קוד]  [כפתור: לחנות → {{לינק}}]
```

- **משתנים זמינים:** `{{שם}}`, `{{שם_עסק}}`, `{{לינק}}`, `{{לינק_יומן}}`, `{{מוצר}}`, `{{קוד_קופון}}`, `{{תאריך}}`, `{{שעה}}` — נשלפים מהפרופיל/הקונפיג.
- **טון:** קצר, אנושי-ישראלי, אימוג'י אחד-שניים, שאלה אחת שמזמינה תגובה (פותח את חלון ה-24 ש'). עברית עוברת baldiga.
- **הערת compliance:** בוובינר/קופון עם **תזכורות יזומות** בוואטסאפ — צריך **template מאושר** (utility) + opt-in; ב-Messenger/IG ה-Private Reply הראשון free-form תוך 7 ימים, המשך בתוך חלון 24 ש'.
| שכבה | מנגנון | ערוצים | סיכון |
|---|---|---|---|
| **🟢 Compliant (דגל)** | Private Replies API רשמי | **Pages + IG creator/business** | אין |
| **🔴 Risk-accepted** | browser automation (PLUG) | פרופיל FB/IG **אישי**, LinkedIn | חסימה |
- **פרופיל אישי אין API** → או שהחשבון בעצם Page/IG-creator, או browser automation. **אסטרטגיה: לדחוף המרה ל-Page/IG-creator (חינם) → מנגנון מלא בלי סיכון.**
- **כללי Meta:** Private Reply פעם אחת/תגובה, בתוך 7 ימים; אחרי מענה → חלון 24 ש'. דורש `pages_messaging` (+`instagram_manage_messages`) + app review. טריגרי-מילים per-פוסט.

### 2.6.5 ניהול מהשיח (Chat-First) — וואטסאפ/טלגרם/מייל 💬🎛️
**את כל התהליך היומיומי מנהלים ישירות מהוואטסאפ/טלגרם/מייל** — לא חייבים להיכנס ל-web. מודל **"chat-first, web-for-depth"** (על תשתית `HELIX-BOTS-CONVERSATION-OPS`).

| פעולה | בשיח? | דוגמה |
|---|---|---|
| יצירת/עריכת funnel | ✅ | "צור funnel: 'מדריך' → שלח {{לינק}}" → הבוט מנסח, אתה מאשר |
| אישור הצעות (HITL) | ✅ | "תגובה מוצעת: … [אשר] [דחה]" |
| מענה ללידים | ✅ | הליד מגיע לוואטסאפ שלך → אתה עונה → הבוט מעביר |
| סטטוס/מדדים | ✅ | "כמה לידים היום?", "מה ה-exposure ב-LinkedIn?" |
| התראות (משבר/ליד/חשיפה) | ✅ push | "🔴 אזכור שלילי", "ליד חם מ-funnel המדריך" |
| הפעלה/עצירה + kill-switch | ✅ | "עצור engagement", "השהה הכל" |
| Proofing ויזואלי / flow רב-ענפי / דשבורדים | 🟡 web | בשיח — סיכום בלבד |

- **פקודות (משותפות עם שכבת השיח):** `/funnels`, `/leads`, `/engage`, `/pause`, `/status`, `/approve` — או שפה טבעית.
- **הכל דרך אותו מנוע conversational** (Claude + webhook per-ערוץ) — לא בונים ממשק נפרד לכל בוט.

### 2.6.6 מענה-הודעות אוטומטי (Auto-Reply DMs)
| ערוץ | מענה ל-DM | סיווג |
|---|---|---|
| וואטסאפ / טלגרם | ✅ Cloud/Bot API | 🟢 |
| Messenger (Page) / Instagram (business) | ✅ Messenger/IG Messaging API | 🟢 |
| **LinkedIn DM** | ❌ אין API — content-script | 🔴 אפור |
- Claude מנסח תשובה ב-brand voice (עברית→baldiga) + סיווג כוונה (ליד/שאלה/ספאם) + HITL אופציונלי. מנצל את אותו מנוע webhook/agent.

## 2.65 Lead Radar — גילוי לידים בזמן אמת (מול Pusher.li) 🎯📡
מודול שמזהה **לידים חמים בזמן אמת** מקבוצות פייסבוק ורשתות — ומזין אותם ישירות למנוע ה-Engagement (§2.6).

### הבעיה + המתחרה
**Pusher.li** (ישראלי) סורק **5,800+ קבוצות פייסבוק 24/7** דרך תוסף כרום, ה-AI מזהה כוונת-קנייה אמיתית, ושולח **התראה לנייד תוך <0.5 שנייה** עם לינק לפוסט. מיצוב: "לידים אורגניים ב-1% מעלות שיווק ממומן". מתחרה: **FGMP.net** (לידים מ-FB → וואטסאפ). **המגבלה שלהם: הם רק *מתריעים* — הפעולה ידנית, ורק פייסבוק.**

### מה HELIX Lead Radar עושה (ומנצח)
1. **Discovery** — סורק מקורות (קבוצות FB דרך extension; Reddit/X דרך API) לפי מילות-מפתח + ICP.
2. **זיהוי כוונת-קנייה (AI)** — ציון intent 0-1 (לא רק topic-match): "מישהו שמחפש לקנות *עכשיו*" מול "דיון כללי" מול "פרסומת".
3. **התראה בזמן אמת** — טלגרם/וואטסאפ/מייל, עם snippet + לינק.
4. **המרה לפעולה** 🔥 — הבידול מול Pusher: ליד חם → **בלחיצה יוצר פנייה** (Comment-to-DM / תגובת Fuzzy), מנוסחת ב-brand voice, לתור ה-HITL של §2.6. הם עוצרים בהתראה; אנחנו ממשיכים ל-**המרה**.

| ממד | Pusher.li | HELIX Lead Radar |
|---|---|---|
| Discovery + intent | ✅ FB בלבד | ✅ FB (extension) + Reddit/X (API) |
| התראה real-time | ✅ | ✅ טלגרם/וואטסאפ/מייל |
| **פעולה על הליד** | ❌ ידני | ✅✅ Comment-to-DM/תגובה אוטומטית |
| משולב במחזור-חיים | ❌ | ✅ חלק מ-Marketing Ops |

### מסך + נתונים
- **מסך Lead Radar** — יצירת רדאר (שם/מילות-מפתח/ICP/ערוצי-התראה) + **תיבת לידים נכנסים** (intent %, מקור, סטטוס, כפתור "צור פנייה").
- טבלאות: `radar_configs`, `radar_leads`. ה-FB דרך **תוסף** (browser automation, מודל PLUG); רשתות עם API — ישיר.

## 2.66 Media Library + Auto-Ingest + Client Profile + Learning Loop 📁🔁
מבוסס תובנות מהשטח (סוכנות שיווק שמנהלת מדיה מוכנה להרבה לקוחות). משלים את הזרימה ה-request-driven בזרימה **asset-driven**.

### Media Library + Auto-Ingest 🆕
במקום "בקש→צור", הלקוח/הסוכנות **זורקים קבצי מדיה מוכנים** (וידאו/תמונה) עם מטא-דאטה (לקוח, נושא, תיאור, רשתות-יעד, עדיפות, זמן רצוי) → **סוכן יומי (Auto-Ingest) סורק נכסים חדשים, כותב כיתוב per-רשת (בעברית אנושית), ומתזמן אוטומטית.** מנצל את Supabase Storage + 28 ה-adapters + מנוע הכתיבה.
- **מזהה ייחודי per-נכס** (`asset_ref`) — מונע כפילויות ומאפשר מעקב.
- הרעיון של "שם-קובץ שמקודד תוכן" (מהשטח) — נתמך כ-shortcut, אבל הליבה = **מטא-דאטה מובנה**.

### Client Profile 🆕
פרופיל-לקוח מובנה (קהל יעד, טון, סגנון, do/don't, שפה) ש**מותנה בו כל התוכן** — לא guide גנרי. משדרג את מנוע הכתיבה לכל לקוח.

### מעקב ביצועים (Performance Tracking) 🆕 — למה לא היה קודם?
עד עכשיו ההפצה הייתה **send-only** — פרסמנו בלי למדוד. **זה תוקן:** `post_performance` אוסף reach/impressions/engagement/clicks **per-פוסט per-רשת**. איסוף המדדים דורש טוקני-רשת (מגיע מ-collector/extension). **מחובר גם למוצר 2 (Reports)** — אותה דאטה מזינה את הדשבורד.

### Learning Loop 🔁 — למה לא היה מוכן?
היינו במצב אפיון למוצרים 2/4/5, ורק לאחרונה התחלנו לבנות; והלולאה **תלויה בדאטת-ביצועים** (downstream). **עכשיו נבנה:** מנוע `learning` מנתח את `post_performance`, מוצא את **השעה הכי מנצחת per-רשת** (לפי engagement ממוצע), ושומר ל-`learning_insights`. ה-Auto-Ingest מתזמן נכסים חדשים לשעה הזו. משתפר per-לקוח לאורך זמן.

### מנוע הכתיבה העברי — בכל הלולאות
**סקיל הכתיבה העברי (baldiga/humanize) מוזרם עכשיו לכל לולאות התוכן** — מנוע התוכן, Auto-Ingest, סוכני ה-Agent OS, וה-digest — דרך `lib/hebrew.ts` המשותף. כל פלט עברי עובר את הסקיל, תמיד.

## 2.7 סטטוס בנייה בקוד (helix-ops) — מה נבנה ומה עוד לא 🏗️
נבנה כקוד ב-`helix-ops`, מקומפל נקי (0 שגיאות typecheck), בדפוסי הפרויקט.
**גיט:** 17 קבצים (1,662 שורות) ב-commit `baf4351`, נדחפו ל-branch **`feat/engagement-engine`** (רפו `HELIX-MARKETING-OPERATION-AND-AGENTS`). טרם מוזג ל-main (main = דיפלוי Vercel).

### ✅ נבנה (מקצה-לקצה בשרת)
| רכיב | קבצים |
|---|---|
| **מיגרציה** — 8 טבלאות + RLS (`is_member`) | `supabase/migration-v10.sql` |
| **בקרות בטיחות** — מכסות per-רשת, warm-up, min-gap+jitter, מד-סיכון, kill-switch | `lib/engagement/rate-limiter.ts` |
| **Fuzzy relevance** (0-1, סף 0.72) | `lib/engagement/relevance.ts` |
| **יצירת תגובות/DM** — brand voice, humanize עברי, סיווג כוונה | `lib/engagement/engage-agent.ts` |
| **התאמת funnel + רינדור משתנים** | `lib/funnels/matcher.ts` |
| **Comment-to-DM + auto-reply** (Meta webhook) | `app/api/webhooks/meta/route.ts` |
| **מבצע HITL תחת מכסות** (cron) | `app/api/engagement/route.ts` |
| **reply-adapters לפיד** — Meta, X, Reddit, Mastodon, Bluesky, Nostr | `lib/distribution/reply.ts`, `feed-reply.ts` |
| **גשר לאקסטנשן** (מסלול אפור) | `app/api/extension/route.ts` |
| **server actions** — funnels, אישור/דחייה, kill-switch, consent | `app/actions-engagement.ts` |
| **UI** — מסך Funnels + מד-חשיפה + תור HITL | `app/[locale]/funnels`, `app/[locale]/engagement`, `components/FunnelsManager.tsx`, `ExposureMeter.tsx` |
| **Lead Radar** — מיגרציה + intent scorer + ingest API + actions + UI | `migration-v11.sql`, `lib/radar/intent.ts`, `app/api/radar/ingest`, `app/actions-radar.ts`, `app/[locale]/radar`, `components/RadarManager.tsx` |
| **HELIX Agent OS + Daily Digest** — מיגרציה + Model Router (Ollama/Claude) + registry + digest composer + scheduler + actions + UI | `migration-v12.sql`, `lib/agentos/*` (ollama/model-router/registry/digest), `app/api/agentos`, `app/actions-agentos.ts`, `app/[locale]/agents`, `components/AgentsManager.tsx` |
| **סקיל כתיבה עברי משותף** (בכל הלולאות) | `lib/hebrew.ts` (מחווט ל-registry + caption + content) |
| **Media Library + Auto-Ingest + Client Profile** | `migration-v13.sql`, `lib/content/caption.ts`, `app/api/media-ingest`, `app/actions-media.ts`, `app/[locale]/media`, `components/MediaLibrary.tsx` |
| **מעקב ביצועים + Learning Loop** | `post_performance`/`learning_insights` (v13), `lib/agentos/learning.ts`, `app/api/performance` (POST ingest + GET recompute) |
| **UTM Attribution + לולאת-ROI 🆕** — `track-visitor` (זיהוי-עיר חינם מ-Cloudflare) + טבלת `mkt_visitors` + `payment-webhook` שסוגר את הלולאה (משלם→`payment_status='paid'` על הביקור המקורי = ROI per-קמפיין אמיתי) | `supabase/functions/{track-visitor,payment-webhook}`, `migration-v14` |
| **מנוע רצפי-מייל (Sequences) 🆕** — cron שמוצא enrollments שהגיע זמנם→מרנדר merge-tags + tracking→שולח (Resend)→מקדם step; quiet-hours ב-env; תבנית RTL עברית | `supabase/functions/{email-engine,email-track}`, טבלאות `mkt_sequences/steps/enrollments/email_log` |
| **Google-Sheet inbound + auto-enroll 🆕** — שורות ליד→upsert `mkt_contacts` (רק ממלא חוסרים)→תיוג "lead"→enroll אוטומטי לרצף welcome | `supabase/functions/gsheet-webhook` |
| **UI שיווק (`/attribution`) 🆕** — 2 טאבים: **Attribution** (ROI per-קמפיין: ביקורים→המרות→הכנסה, ערים מובילות) + **רצפי-מייל** (יצירת רצף, רישום איש-קשר, השהיה/הפעלה, לוג מיילים נפתח/נלחץ). לינק "שיווק" ב-Nav | `app/[locale]/attribution`, `components/MarketingManager.tsx`, `app/actions-marketing.ts` |
| **🅰️🅱️ A/B Variants (עד 36 per-ערוץ) 🆕** — לכל פרסום **6 סגנונות-שכנוע × 6 וריאציות** (תועלת/כאב/הוכחה/דחיפות/סיפור/סקרנות), כל וריאציה humanize + ציון-אנושיות. יעיל: JSON-batched (2 קריאות per-סגנון). בחירת-מנצח + שדות ביצוע ל-A/B | `lib/content-agent.ts` (`generateChannelVariants`), `content_variants` (migration-v15) |
| **📣 Campaign Builder חוצה-ערוצים 🆕** — בריף אחד + **אפיון-לקוח + תקציב** → קמפיין מלא: פייסבוק/אינסטגרם/לינקדאין (וריאציות A/B) · Google Ads (RSA: 15 כותרות+4 תיאורים+keywords) · SEO (תוכנית מילים+outline). תקציב מחולק per-ערוץ | `lib/campaign-agent.ts`, `lib/campaign-run.ts`, `app/actions-campaigns.ts`, `app/[locale]/campaigns` (+detail), migration-v15 |
| **🤖 נגישות בוט מלאה 🆕** — webhook מאוחד `/api/bot` + router: הודעה טבעית בטלגרם/וואטסאפ/מייל → חילוץ persona+תקציב+ערוצים → **אותו** builder של ה-UI. `bot_links` ממפה צ׳אט→workspace. כל פונקציה נגישה מהבוט | `app/api/bot`, `lib/bot/{router,campaign-bot}.ts`, `bot_links` |
| **⏳ בנייה אינקרמנטלית (ערוץ-אחד-בכל-פעם) 🆕** — createCampaign יוצר shell מיידית (asset ממתין per-ערוץ), ואז `buildNextAsset` בונה **ערוץ אחד בכל קריאה** — התוכן מופיע בהדרגה במסך-הפירוט, לא 108 גרסאות בבת-אחת | `lib/campaign-run.ts` (`createCampaignShell`/`buildOneAsset`), `campaign_assets.status` |
| **📤 פרסום מרובה-גרסאות (אורגני/ממומן/סרטון) 🆕** — `publishVariants` מפרסם **כמה גרסאות בבת-אחת** (לא רק מנצח) בכל פלטפורמה: **תוכן אורגני** (`sendToChannel`) · **ממומן** (`lib/distribution/paid.ts` — Meta ad-creative, env-driven) · **סרטון** (`video_url` לאדפטרי TikTok/YouTube). בחירה מרובה ב-UI + מצב + קישור-מדיה. לוג `publications` עם `mode`/`media_url`/`variant_id` | `app/actions-campaigns.ts`, `lib/distribution/paid.ts`, `components/CampaignDetail.tsx` |
| **🎬 סרטון per-גרסה (Video Studio) 🆕** — לכל גרסה `video_url` משלה (הפקה ב-Video Studio → צירוף). פרסום-וידאו משתמש בסרטון-הגרסה (fallback לקישור-אצווה) → אדפטרי TikTok/YouTube | `content_variants.video_url`, `setVariantVideo`, `VideoAttach` |
| **📈 נתונים אמיתיים per-גרסה 🆕** — משיכת **צפיות/קליקים/חשיפות** מכל פלטפורמה per-גרסה לפי `external_id` שנשמר בפרסום (Meta Graph insights · TikTok video-query · YouTube stats). `syncCampaignMetrics` (כפתור "רענן") + cron `/api/cron/variant-metrics` (כל 6ש'). מוצג chips per-גרסה, ומזין את בחירת-המנצח | `lib/insights/*`, `app/actions-campaigns.ts`, `app/api/cron/variant-metrics` |
| **🏆 בחירת-מנצח אוטומטית 🆕** — `autoPickWinner` לפי ביצועים **אמיתיים** (conversions>clicks>views>impressions), ובהיעדר דאטה — לפי ציון-אנושיות | `app/actions-campaigns.ts` |
| **📦 Marketing Skills Pack (64 skills) 🆕** — ספריית skills agent-native (פורמט `SKILL.md` של Claude, עם `reads/writes/depends-on/triggers/env_vars`) ב-4 שכבות: Foundation·Strategy·Execution·Distribution. נטענת ע"י ה-registry של Agent OS (מוצר 6), פלט עובר `lib/hebrew.ts` לעברית + proofread | `skills-marketing/` (64 חבילות + `skills-manifest.json` + `NOTICE.md`) |

> **2.75 — מקור-קצירה (MIT):** שלושת הרכיבים לעיל נקצרו ונכתבו-מחדש נקי מ-`krishna-build/claude-coach-kit` (React+Supabase, MIT). נלקחו ה-**Edge Functions + מודל-הנתונים** (framework-agnostic); הקוד המקורי הכיל hardcoding (Razorpay/הודו/Hostinger) ו-artifacts — הוחלף ב-**Resend, Stripe-shaped, env-driven, RTL**. ה-Attribution גם מזין widget "מקורות-לידים/ROI" ל**דשבורד השיווק (מוצר 2)**.

### ⬜ עוד לא נבנה (תלוי החלטות/credentials/הקמה)
| מה חסר | למה | מה צריך |
|---|---|---|
| **הרצה live** | קוד בלבד | הרצת `migration-v10/v11/v12.sql` + `META_VERIFY_TOKEN`/`EXTENSION_SECRET`/`DIGEST_SECRET` ב-env + Vercel Cron ל-`/api/engagement`, `/api/radar`, `/api/agentos` |
| **HELIX Runner** (מסלול Ollama מקומי ללקוח) | כלי דפדפן/CLI נפרד | בניית ה-Runner (מושך agents → מריץ מול Ollama מקומי → שולח דייג'סט). ראה `OLLAMA-DAILY-DIGEST-INFRA` §9 |
| **handlers ייעודיים per agent-pack** | ה-registry גנרי (prompt/echo) | handler per-מקור (GSC/leads/reputation) — drop-in ל-`lib/agentos/registry.ts` |
| **Discovery** (מציאת פוסטים בפיד להגיב עליהם) | דורש read-API per-רשת | אינטגרציית קריאה + טוקנים per-רשת |
| **content-script אפור** (LinkedIn/IG/FB feed) | אין API — רק דפדפן | קוד אקסטנשן (מודל PLUG) שמושך מ-`/api/extension` ומדווח |
| **תגובות בפיד — הפעלה בפועל** | ה-adapters קיימים, אבל צריך טוקן+target לכל רשת | OAuth per-רשת (X בתשלום, Reddit/Mastodon/Bluesky/Nostr — מפתחות) |
| **Meta app + אישור** | חובה לפרסום/הודעות | אפליקציית Meta + `pages_messaging` + app review |
| **לולאה אוטונומית מלאה** (mine→plan→re-cut) | שלב מתקדם | scheduler + מנוע signals |
| **קמפיינים — creds חיצוניים** | קוד מוכן | Meta Ads (`FB_ADS_TOKEN`/`FB_AD_ACCOUNT_ID`/`FB_PAGE_ID`, הרשאות `ads_read`/`read_insights`) לממומן+insights · TikTok/YouTube `access_token` לצפיות · הרצת `migration-v15.sql` · `EXPORT_SECRET` לחיבור-דשבורדים |
| **קמפיינים — UX ממותג** | פונקציונלי | toasts/קונפטי/ConfirmDialog + aria-labels + מובייל (ראה `HELIX-OPS-UX` §מודול-קמפיינים) |
| **קמפיינים — יצירת-קמפיין ממומן מלאה** | creative נוצר | יצירת campaign/adset עם תקציב ב-Meta (מעבר ל-ad-creative) |

## 2.8 מנוע הקמפיינים + A/B Testing 🅰️🅱️📣 (2026-07)
מנוע שלם שהופך בריף אחד לקמפיין רב-ערוצי עם A/B מלא — **נבנה end-to-end** (typecheck נקי):
- **A/B בקנה-מידה:** לכל פרסום **6 סגנונות-שכנוע × 6 וריאציות = עד 36 גרסאות per-ערוץ** (JSON-batched — יעיל בעלויות).
- **Campaign Builder:** בריף + **אפיון-לקוח + תקציב** → פייסבוק/אינסטגרם/לינקדאין (וריאציות) · Google Ads (RSA) · SEO (תוכנית). תקציב מחולק per-ערוץ.
- **בנייה אינקרמנטלית:** ערוץ-אחד-בכל-פעם (התוכן מופיע בהדרגה, לא 108 בבת-אחת).
- **פרסום מרובה-גרסאות:** כמה גרסאות בו-זמנית, ב-**3 מצבים — אורגני · ממומן · סרטון** (Video Studio per-גרסה), בכל פלטפורמה.
- **אוטומציית-ממומן מלאה ב-Meta 🆕:** `createMetaCampaign` בונה את כל ההיררכיה — **Campaign → Ad Set (תקציב יומי + targeting + optimization) → Ad per-גרסה (A/B)**. נוצר **PAUSED** (בטיחות — HELIX לא מוציא כסף לבד; המשתמש מפעיל ב-Ads Manager). כפתור "🚀 השק קמפיין ממומן" + שדות תקציב/objective.
- **פילוח-קהלים אוטומטי (#2) 🆕:** `suggestAudiences` (AI) מציע קהלי-יעד שונים (targeting geo/גיל + זווית-מסר), וההשקה יוצרת **Ad Set נפרד per-קהל** (התקציב מתחלק) → "המסר הנכון לכל קהל". כפתור "👥 הצע קהלים".
- **לולאת-תקציב אוטונומית (#4) 🆕:** cron `/api/cron/budget-optimizer` (כל 12ש') — לכל ad-set, כשיש מספיק דאטה, **משאיר את המנצח (CTR) ומשהה את המפסידים** → התקציב מתרכז במה שעובד. לא מגדיל הוצאה מעבר לתקציב (בלתי-אפשרי לחרוג). סוגר את כרטיסי PowerAds #2+#4.
- **נתונים אמיתיים per-גרסה:** צפיות/קליקים/חשיפות מ-Meta/TikTok/YouTube → chips + cron 6ש'.
- **בחירת-מנצח אוטומטית:** לפי ביצועים אמיתיים (fallback ציון-אנושיות).
- **נגישות בוט מלאה:** webhook `/api/bot` — כל הפונקציות (כולל בניית קמפיין) דרך טלגרם/וואטסאפ/מייל בשפה טבעית.
- **חיבור ל-HELIX DASHBOARDS:** endpoint `/api/export/campaign-metrics` → connector `helix_ops` בדשבורדים → template **"קמפיינים A/B"** (חשיפות/צפיות/קליקים/גרסאות per-ערוץ). **A/B נראה בדשבורד ההנהלה.**

## 2.9 בונה דפי-נחיתה 🖥️ (2026-07)
מנוע דפי-נחיתה מלא — **נבנה end-to-end** (typecheck+build נקי):
- **15+ טמפלטים לפי תחום** (חנות/SaaS/קליניקה/נדל״ן/מסעדה/סוכנות/B2B/סטארטאפ) — ממנף את ה-verticals.
- **כל הבלוקים:** hero · יתרונות · **וידאו** (כולל אווטאר) · עדויות · FAQ · CTA · **טופס לידים**.
- **5 סגנונות UX** (מינימלי/נועז/יוקרתי/כהה/עיתונאי) — theme אחד, מבנה אחד.
- **מילוי-AI** — הבריף/persona → כל התוכן בעברית אוטומטית.
- **דף ציבורי** `/lp/[slug]` (RTL, מובייל) + **טופס→attribution** (`mkt_visitors`) → **סוגר לולאת ad→LP→conversion**.
- עורך form-based (עריכת בלוקים + סגנון + פרסום + תצוגה).
- **קוד:** `lib/landing/*`, `app/actions-landing.ts`, `app/lp/[slug]`, `app/api/lp/[slug]/lead`, `app/[locale]/landing` (+editor). **סוגר כרטיס PowerAds #5.**

## 2.10 אווטארים / וידאו-AI 🧑🎬 (2026-07)
יצירת סרטוני-אווטאר **בתוך המערכת** (לא ייבוא) — הלקוח לוחץ, HELIX קורא ל-API בשרת:
- **ספקים:** **HeyGen** (איכות) · **D-ID** (זול, + קול **ElevenLabs** לעברית). Runway/Kling ל-b-roll (עתידי).
- **Hybrid BYOK/Managed:** מפתח הלקוח (BYOK) גובר; אחרת מפתח HELIX (managed) + **ספירת שימוש לחיוב** (`avatar_usage`).
- **זרימה:** גרסה→סקריפט→API→job→`avatar-poll` (cron 2 דק')→`content_variants.video_url` → **מתחבר לפרסום-וידאו + variant-metrics שכבר קיימים**.
- **עלות מבוקרת:** מייצרים רק לגרסאות נבחרות (לא ל-36).
- **קוד:** `lib/avatar/{heygen,did,index}.ts`, `app/actions-avatar.ts`, `app/api/cron/avatar-poll`, כפתור 🧑 per-גרסה. **סוגר את פער-הווידאו מול PowerAds.**

## 2.11 סטטוס מרוכז — קמפיינים/A-B/Landing/אווטארים (2026-07) 🗂️
### ✅ נבנה (typecheck+build נקי, נדחף)
A/B 6×6 (36 גרסאות) · Campaign Builder חוצה-ערוצים · בנייה אינקרמנטלית · פרסום מרובה-גרסאות (אורגני/ממומן/סרטון) · **אוטומציית-ממומן מלאה ב-Meta** (Campaign→AdSet→Ads) · **פילוח-קהלים** (adset per-קהל) · **לולאת-תקציב** (pause-losers) · נתונים-אמיתיים per-גרסה (Meta/TikTok/YouTube insights) · בחירת-מנצח אוטומטית · **נגישות בוט מלאה** · **חיבור לדשבורדים** · **בונה-Landing (15 טמפלטים)** · **אווטארים HeyGen/D-ID/ElevenLabs (BYOK/managed)**.

### ⬜ מה נשאר להשלים (הרצה + creds + פוליש)
| # | מה | סטטוס | מה צריך |
|---|---|---|---|
| 1 | **הרצת SQL** | קוד מוכן | `migration-v15` (campaigns/variants/bot_links) + `migration-v16` (landing/avatars) ב-Supabase |
| 2 | **Meta Ads creds** | קוד מוכן | `FB_ADS_TOKEN`/`FB_AD_ACCOUNT_ID`/`FB_PAGE_ID` + הרשאות `ads_management`+`read_insights` (App Review) |
| 3 | **מפתחות אווטאר** | קוד מוכן | BYOK (מסך-הגדרות `channel_connections` channel='avatar') **או** managed (`HEYGEN_API_KEY`/`DID_API_KEY`/`ELEVENLABS_API_KEY`) — **חסר UI להזנת BYOK** |
| 4 | **insights TikTok/YouTube** | קוד מוכן | `access_token` per-ערוץ ב-config |
| 5 | **חיבור-דשבורדים** | קוד מוכן | `EXPORT_SECRET` (helix-ops) + הזנת URL/secret/workspace ב-connector של הדשבורדים |
| 6 | **cron תדיר** | vercel.json מוכן | Vercel Pro (avatar-poll כל 2 דק') |
| 7 | **UX ממותג לקמפיינים/Landing** | פונקציונלי | toasts/קונפטי/ConfirmDialog + aria-labels + מובייל (ראה `HELIX-OPS-UX`) |
| 8 | **auto-activate ממומן (#1)** | PAUSED-only | אופציה "הפעל אוטומטית" למי שרוצה (כרגע ידני ב-Ads Manager) |
| 9 | **b-roll וידאו** | לא נבנה | connector Runway/Kling ל-Video Studio (משלים אווטאר) |
| 10 | **חיבורי-אקסל** | ✅ עודכן | ראה `HELIX-external-connections.xlsx` → גיליון HELIX OPS (8 שורות חדשות: Meta Ads · HeyGen · D-ID · ElevenLabs · insights · export · Landing · crons) |

**קוד:** `lib/{content-agent,campaign-agent,campaign-run}.ts`, `lib/bot/*`, `lib/insights/*`, `lib/distribution/paid.ts`, `app/actions-campaigns.ts`, `app/[locale]/campaigns` (+detail), `app/api/{bot,export/campaign-metrics,cron/variant-metrics}`, `supabase/migration-v15-campaigns.sql`.

## 3. תיקוף שוק (product-analysis, 16+ מתחרים)
השוק **מפוצל** — וזה הפער:
- **קצה זול (proofing בלבד):** ReviewStudio (~$12/user), Filestage, Gain ($99, social-only). **אין בהם intake/PM.**
- **קצה יקר (all-in-one):** Lytho, RoboHead, Aproove ($750) — enterprise, quote-only, כבד.
- **אף אחד לא מחזיק:** all-in-one intake→approval→versioning, **זול ($49-149), שקוף, white-label, per-client**.
- **בישראל:** האספקה הכי דלילה (הכל monday+WhatsApp+Google Drive). מקומית קיים חלקית: Signature-IT Workflow Manager, Flowmatic (Telegram approvals).

### בידול מתוקף
1. **all-in-one זול ושקוף** — פער אמיתי בין הקצוות.
2. **Hebrew-first + RTL** — **אפס** מתוך 16 מתחרים תומכים (אפילו Google/Microsoft "not found"/חלש). יתרון: Hebrew Content by Helix + hebrew-rtl skills בארסנל.
3. **הפצה** — דרך בסיס לקוחות קיים. CAC-אפס.

### ⚠️ אזהרות
- **RTL הוא "נחמד" לא "חובה"** — צוותים סובלים אנגלית. הוא מוריד חיכוך אימוץ למאשרים לא-טכניים (מנכ"ל, בעל זכיינות), לא כופה מעבר. **ההפצה נושאת את המכירה, לא השפה.**
- **התלונה מס' 1 בכל הקטגוריה = תמחור מטפס/מפתיע.** לכן תמחור שטוח = בידול.

## 4. תמחור (monetization-strategy)
- **מודל ליבה:** מנוי **שטוח per-workspace** (=לקוח/מותג). משתמשים ומאשרים ללא הגבלה; מאשרים חיצוניים = guests חינם. ~₪250-450/workspace.
- **GTM דואלי:** (1) **ישיר** — מכירה ללקוח תחת מותג HELIX (~₪250-450/workspace), הערוץ הראשי; (2) **הפצה/שת"פ (אופציונלי)** — wholesale לשותף/סוכנות (~₪150) → מוכר כ-line-item בריטיינר (~₪400) או ככלי-שימור.
- **פיתיון:** Request Desk **חינם** → upgrade ל-approval (הכאב האמיתי).
- **❌ להימנע:** seat-based (מה שהשוק שונא).

### אריזה לפי קהל — אותו מוצר, פיצ'רים מדורגים
פרילאנסר לא צריך שרשרת אישורים; חברה כן. אותו codebase, **פיצ'רים כ-toggles per-workspace**:
| חבילה | קהל | מה כלול | מה מושמט |
|---|---|---|---|
| **Solo** | פרילאנס / עסק קטן | **agent תוכן + הפצה אומניצ'אנל + הגהה.** אישור-עצמי, משתמש יחיד. "צור והפץ בעברית, כולל וואטסאפ" | שרשרת אישורים, תפקידים, ממשל מותג |
| **Business** | חברה עם צוות | הפלואו המלא: בקשה→תור→**שרשרת אישורים**→הפצה→כספת מותג. ריבוי משתמשים+תפקידים+הרשאות | — |
| **Agency** | סוכנות | Business + **white-label** + ריבוי לקוחות (workspaces) | — |

**איך זה נבנה:** אותו קוד, **feature flags per-workspace** (שרשרת האישורים/תפקידים/ממשל = toggles). זו בדיוק שכבת הקונפיג הרב-דיירת שכבר תכננו → **בלי בנייה נוספת, רק gating.** ה-**Solo** הוא גם ה-wedge לכניסה (זול, ויראלי, self-serve) → upsell ל-Business/Agency. תמחור: Solo נמוך (~₪79-149), Business per-workspace (~₪250-450), Agency wholesale.

## 5. תוכנית בנייה — אבני בניין (חיפוש OSS + מקומי)

### מקומי (lift מיידי מ-PLUG)
| מה | מאיפה | תפקיד |
|---|---|---|
| RTL recipe | `plug-nexus-ai-main/src/contexts/LanguageContext.tsx` | RTL+Heebo+Radix DirectionProvider. **lift verbatim** |
| העלאת קבצים | `supabase/functions/upload-resume/index.ts` | CORS+service-role+שמות עבריים בטוחים → כל העלאות ה-proofing/נכסים |
| RLS רב-דיירת | 151 migrations ב-`supabase/migrations/` | דוגמאות access-control, presence, marketplace |
| auth | `src/contexts/AuthContext.tsx`, `src/integrations/supabase/client.ts` | חיווט מוכן |
| annotation engine | `Desktop\gits\tldraw-main.zip`, `revezone-master.zip` | קנבס אינסופי לסימון נכסים |
| approval reference | `Desktop\gits\timeoff-management-application-master.zip` | דפוס approval-flow נקי |
| kanban/pipeline | `Desktop\gits\twenty-main.zip`, `nextcrm-app-main.zip` | backbone לתור |

### GitHub (רישוי נבדק 2026-07-16)
| רכיב | ריפו | רישוי | שימוש |
|---|---|---|---|
| **proofing מלא** (הכי כבד) | **shumaiOne/shumai** (Bun/TS, 139★) | **MIT** ✅ | פורק — annotations+versioning+RBAC. מתאים ל-stack |
| חלופה | Techiebutler/freeframe (Next+FastAPI, 113★) | **MIT** ✅ | קרוב יותר ל-wedge (כולל approval) אבל backend פייתון |
| annotation תמונות | annotorious/annotorious (850★) | BSD-3 ✅ | הטמעה אם בונים shell עצמאי |
| annotation PDF | Laomai-codefee/pdfjs-annotation-extension (332★) | Apache ✅ | ממלא פער PDF (Shumai/FreeFrame לא עושים PDF) |
| workflow | statelyai/xstate (29.8k★) | MIT ✅ | state machine ל-approval (draft→review→changes→approved) |
| RTL admin | satnaing/shadcn-admin (12.6k★) | MIT ✅ | רפרנס (PLUG כבר נותן) |

### ⚠️ מלכודת רישוי
בוני-טפסים/לוחות מובילים (Plane, Formbricks, HeyForm, Focalboard, Vikunja) הם **AGPL** — **רק כ-sidecar נפרד מאחורי API**, לעולם לא בקוד. הבנייה הנקייה: לוח + טופס **native** על ה-schema שלך (React Hook Form + Zod + dnd-kit + shadcn).

### ארכיטקטורת MVP מומלצת
```
בסיס: צורת PLUG (RTL + Supabase + shadcn)
 ├─ Request Desk: טופס native (RHF+Zod) → טבלת requests (Supabase)
 ├─ Board/תור: native (dnd-kit) על ה-schema
 ├─ Approval: XState state machine + RLS per-workspace
 ├─ Proofing: הטמעת annotorious (תמונות) + pdfjs-annotation-extension (PDF)
 │            [או פורק Shumai לוידאו/תמונות אם צריך עומק]
 └─ Uploads: דפוס upload-resume (שמות עבריים בטוחים)
```
**חיסכון:** הרכיב הכי כבד (annotation+versioning) מגיע מ-OSS. שבועות, לא חודשים.

## 📱 מסכים (Screens)
1. **Request Desk** — טופס בקשת תוכן (brief, ערוצים, דדליין) + תור/לוח סטטוסים (kanban).
2. **Asset / Proofing** — נכס עם גרסאות, **הערות על-גבי המקאפ** (pins x/y), שרשרת אישורים.
3. **Content Studio (ה-agent)** — brief → טיוטות per-ערוץ (עריכה) → הגהה + גייט AI-detection.
4. **Distribution / Publish** — בחירת ערוצים + זמן + פרסום בלחיצה, תצוגה מקדימה per-ערוץ.
5. **Brand Vault** (פאזה 2) — מאגר נכסים מאושרים + לינטר.
6. **Engagement Feed** — פוסטים שהתגלו + ציון רלוונטיות + הצעות תגובה לאישור (Fuzzy AI).
7. **Exposure Meter** — מכסות/שימוש/רמת-סיכון per-רשת + kill-switch + consent.
8. **Comment-to-DM Funnels** — בניית funnel (פוסט+keyword+תגובה+DM) + לידים שנלכדו.
9. **Auto-Reply Inbox** — DMs נכנסים + תשובות מוצעות + סיווג כוונה.
10. **Lead Radar** — יצירת רדאר + תיבת לידים נכנסים (intent %, מקור, "צור פנייה").
11. **HELIX Daily — סוכנים** — יצירת סוכנים מתוזמנים + בחירת מודל (Ollama/Claude) + חיבור Ollama (מנוהל/מקומי) → דייג'סט יומי.
12. **Media Library** — פרופיל לקוח + רישום נכסי מדיה (מטא-דאטה + רשתות-יעד) → Auto-Ingest כותב ומתזמן.
13. **Settings** — workspace, תפקידים/הרשאות, שרשרת אישורים (toggles לפי חבילה), מיתוג.
14. **Agency Hub** (Agency) — ריבוי workspaces, white-label, מבט-על לקוחות.

## 🗄️ מודל נתונים (Supabase, RLS per-workspace)
| טבלה | שדות עיקריים |
|---|---|
| `workspaces` | id, name, plan (solo/business/agency), branding_json, feature_flags |
| `memberships` | workspace_id, user_id, role (admin/member/approver/guest) |
| `requests` | workspace_id, requester_id, brief, channels[], due_date, status |
| `assets` | request_id, workspace_id, type, current_version, storage_path |
| `asset_versions` | asset_id, version, storage_path, created_by |
| `comments` | asset_version_id, author_id, x, y (on-asset), body, resolved |
| `approvals` | asset_id, approver_id, stage, status, decided_at |
| `approval_chains` | workspace_id, config_json (שלבי אישור per-workspace) |
| `publications` | asset_id, channel, scheduled_at, status, external_id |
| `channel_connections` | workspace_id, channel, oauth_tokens/config |
| `brand_guides` | workspace_id, rules_json (פאזה 2 — לינטר) |
| `engagement_targets` | workspace_id, channel, source (feed/group/profile), post_url, relevance_score, decision |
| `engagement_actions` | workspace_id, channel, type (like/comment/reply), content, status (suggested/approved/posted) |
| `engagement_limits` | workspace_id, channel, daily_cap, used_today, warmup_stage, risk_level |
| `comment_funnels` | workspace_id, post_url, keyword, public_reply_text, **dm_message** (ניסוח ההודעה הפרטית + משתנים), dm_flow_json (שלבי המשך), tier (compliant/risk) |
| `funnel_leads` | funnel_id, commenter, public_replied, dm_sent, dm_status, captured_at |
| `dm_threads` | workspace_id, channel, contact, intent (lead/question/spam), auto_reply_enabled |
| `risk_consents` | workspace_id, channel, consented_at, consent_text_version (ערוצים אפורים) |
| `radar_configs` | workspace_id, name, keywords[], icp, sources_json, min_intent, alert_channels[], active |
| `radar_leads` | workspace_id, radar_id, source, post_url, content, intent_score, matched[], status, alerted |
| `client_profiles` | workspace_id, name, audience, voice, dos_donts, lang |
| `media_assets` | workspace_id, client_id, asset_ref (ייחודי), title, description, topic, storage_path, target_networks[], priority, scheduled_at, status |
| `post_performance` | workspace_id, publication_id, asset_id, network, reach, impressions, engagement, clicks, collected_at |
| `learning_insights` | workspace_id, network, insight_type (best_hour…), value, confidence |
| `agents` / `agent_runs` / `digests` / `ollama_endpoints` | (Agent OS — v12) |

## 🏗️ ארכיטקטורה (רכיבים)
- **Frontend:** React + shadcn (צורת PLUG, RTL), dnd-kit ללוח.
- **Backend:** Supabase (Auth, DB, Storage, RLS, Realtime).
- **Approval engine:** XState state machine.
- **Proofing:** annotorious (תמונות) + pdfjs-annotation-extension (PDF).
- **Content Agent:** edge functions שמתזמרים skills per-ערוץ + Claude + הגהה + גייט AI-detection.
- **Distribution engine:** adapters per-ערוץ (וואטסאפ Cloud API/טלגרם/Meta/מייל) + תזמון cron. **משותף עם מוצר 2** (מסירת דוחות).
- **Uploads:** דפוס `upload-resume` (שמות עבריים בטוחים).

## 6. פאזה 2 — Brand Vault + לינטר
- **Vault:** Supabase Storage + טבלת `assets` (tags/version) — או Directus (BSL) לשכבת admin מוכנה.
- **לינטר (ניתן להרכבה בזול):** color-thief (צבע+ΔE) + tesseract.js (OCR דיסקליימרים, תומך עברית) + imagehash + OpenCV template-matching (לוגו) + **שכבת LLM-vision** לשיפוט סובייקטיבי (פונט/סגנון).
- **פער בשוק:** לינטרים זולים קיימים (PaletteCheck, Goodeye) אבל **single-brand**. Bynder עושה סריקת-העלאות אבל ב-$30-75k/שנה, בלי עברית. **אריזת vault+לינטר רב-דיירת per-לקוח = לבנה בשוק.**
- **הפער היחיד:** זיהוי פונט אוטומטי — אין OSS תקין → עוקפים עם LLM-vision / מטא-דאטה של קובץ המקור.

## 7. ניסויי תיקוף (לפני שורת קוד)
1. **Fake-door / pre-sell:** הקולגה שולח ל-10 לקוחות דף נחיתה עברי + מחיר. הצלחה: ≥3 "כן, אני משלם ₪X". שבוע.
2. **Concierge pilot:** 3 לקוחות — intake+approval ידני (Airtable+Zapier) בתשלום מלא. הצלחה: שימוש שבועיים ברצף.
3. **Van Westendorp מקוצר:** 4 שאלות מחיר ל-15 מחלקות שיווק → טווח אופטימלי.

## 8. סיכונים
- **תלות בסוכנות אחת** → מיטיגציה: white-label לגיוס סוכנויות נוספות כמפיצות.
- **RTL לא מספיק כבידול** → ההפצה חייבת לשאת. אם הקולגה לא דוחף — אין מוצר.
- **קונברז'ן freemium נמוך** → נעקף כי הסוכנות "מדליקה" את הצוות בחינם ואז מוכרת.
- **AGPL contamination** → משמעת: sidecar בלבד.

## 🗺️ תוכנית עבודה (Roadmap)
| שלב | מה בונים |
|---|---|
| **1** | בסיס (צורת PLUG, RTL, Supabase, workspaces + RLS) + **Request Desk** (טופס + תור). ← ה-MVP/wedge |
| **2** | **Approval Flow** — גרסאות, הערות על-גבי (annotorious/pdfjs), שרשרת אישורים (XState) |
| **3** | **Content Agent** — brief → טיוטה per-ערוץ (skills) → הגהה + גייט AI-detection. ← חבילת Solo מוכנה |
| **4** | **מנוע הפצה אומניצ'אנל** Tier 1 (וואטסאפ קודם, אז טלגרם/פייסבוק/אינסטגרם/מייל) + תזמון |
| **5** | **אריזה** (Solo/Business/Agency feature-flags) + white-label + הרחבת ערוצים Tier 2-3 |
| **6** | **פאזה 2:** Brand Vault + לינטר מותג |
| **7** | **Engagement** — הרחבת adapters לדו-כיווני (compliant) + מנוע Fuzzy AI + rate-limiter/warm-up/jitter |
| **8** | **Exposure meter + התראת חשיפה + kill-switch + consent** + Auto-Reply DMs (וואטסאפ/טלגרם/Messenger/IG) |
| **9** | **Comment-to-DM Funnel** (Private Replies API — פיצ'ר דגל compliant) + Extension bridge (LinkedIn/Meta, אפור) |
| **10** | לולאה אוטונומית מלאה (mine→plan→publish→engage→re-cut) + re-cut/compounding |
| **11** | **Lead Radar** — Discovery (extension FB + API Reddit/X) + intent scoring + התראות + המרה למנוע Engagement (מנצח את Pusher.li) |
| **12** | **HELIX Agent OS + Daily Digest** — scheduler + Model Router (Ollama/Claude) + registry + digest → כל מודול שולח דייג'סט יומי בבוקר (מוצר 6 + `OLLAMA-DAILY-DIGEST-INFRA`) |
| **13** | **Media Library + Auto-Ingest + Client Profile** — זרימת asset-driven (זרוק מדיה→כיתוב per-רשת→תזמון) + סקיל כתיבה עברי בכל הלולאות |
| **14** | **מעקב ביצועים + Learning Loop** — `post_performance` (מזין גם את Reports/מוצר 2) + מנוע `learning` (שעה מנצחת per-רשת → תזמון חכם) |

## 🔗 חיבור לאקו-סיסטם HELIX (אינטגרציה עתידית — מיושר בכל המוצרים)
> **כל מוצרי HELIX יהיו מחוברים לכלל אחד.** תשתית אחת, חשבון אחד, דשבורד-על אחד. כל מוצר נבנה כבר עכשיו כך שיתחבר — האינטגרציה המלאה תושלם בהמשך.

- **תשתית משותפת:** אותו Supabase (Auth/DB/Storage/RLS), edge functions, cron, ומנועי נרטיב/הפצה (טלגרם/מייל/וואטסאפ). בונים פעם אחת — כל מוצר מנצל.
- **חשבון וזהות אחידים:** לקוח אחד, workspace אחד, SSO — נע בין המוצרים בלי חיכוך.
- **מוצר 2 (HELIX Reports / דשבורדים) = שכבת-העל המאחדת:** כל המוצרים מזרימים מדדים ל-Reports, שמציג **דשבורד-על אחד** חוצה-מוצרים (תוכן+SEO+GEO, מוניטין, לידים/SDR, ROI).
- **דאטה חוצה-מוצר:** פלט של מוצר אחד = קלט לאחר. דוגמאות: תוצאה שלילית שמזוהה ב-Shield → משימת תוכן ב-Rank · ליד מ-SDR → דוח ב-Reports · תוכן מ-Marketing Ops Hub → הפצה דרך אותו מנוע.
- **cross-sell מובנה:** אותו dashboard חושף את שאר המוצרים — משפך אקו-סיסטם אחד תחת מותג HELIX.
- **סטנדרטים אחידים לחיבור:** אותו stack (React+shadcn+Supabase, RTL), schema/מדדים אחידים, ומנועי נרטיב/הפצה משותפים — כדי שהחיבור בהמשך יהיה דלתא, לא בנייה מחדש.

## 📅 Daily Digest (מודול Agent OS) — 🏗️ נבנה בקוד
> חלק מקו **HELIX Agent OS** (מוצר 6) על מנוע **"תשתית OLLAMA ל-Daily Digest"**. המערכת הופכת גם ל-agent pack ששולח **דייג'סט יומי** בבוקר דרך הבוט (וואטסאפ/טלגרם/מייל).
> **✅ המנוע נבנה ב-helix-ops** (`migration-v12.sql` + `lib/agentos/*` + `app/api/agentos` + `app/[locale]/agents`, typecheck נקי). מסך "HELIX Daily — סוכנים" (§מסכים 11). טבלאות: `agents`, `agent_runs`, `digests`, `ollama_endpoints`. **חסר:** handlers ייעודיים per-מקור (leads/engagement) + HELIX Runner למסלול Ollama מקומי.
- **דוגמת דייג'סט:** "בוקר טוב: 5 לידים חמים מהלילה · funnel 'המדריך' תפס 12 · 2 תגובות ממתינות לאישור · engagement ב-LinkedIn: 8/15."
- **סוכנים מתוזמנים:** Lead Radar (לידים חדשים), engagement (הצעות ממתינות), funnels (המרות), publishing (מה פורסם).
- **מנוף Ollama:** סיווג/סיכום לידים על מודל מקומי (אפס עלות API); Claude+baldiga לניסוח הדייג'סט העברי.
- **דו-כיווני:** מהדייג'סט אפשר לאשר פעולה/לתשאל דרך מנוע השיח הקיים.
