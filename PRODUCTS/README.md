# מוצרי תוכנה למחלקות שיווק — אינדקס

מקור: שיחה עם בעל חברת בניית אתרים (מאות לקוחות, רבים במחלקות שיווק) שמבקשים המלצות על כלים **מחוץ ל-scope** שלו. המטרה: מוצרים **גנריים + קסטומיזציה per-לקוח**, שנמכרים דרך בסיס הלקוחות הקיים שלו.

תאריך ניתוח: 2026-07-16. סטאק יעד: React 18 + TS + Vite + Tailwind + shadcn/ui + Supabase (זהה ל-PLUG).

## התובנה המכוננת
נבחנה פלטפורמת **RICHKID** כ-baseline: כל מה שסוכנות בניית אתרים מציעה קשור ל**בניית נכס ללקוח** (אתר/חנות) — אף פריט אינו **תוכנה עצמאית שמחלקת שיווק קונה ומשתמשת בה בפני עצמה**. שם הפער. מחלקות שיווק כבר יש להן אתר; מה שחסר להן זה **תוכנה שיושבת מעל הסטאק הקיים** — פנימית, תפעולית.

## מודל ההפצה (GTM דואלי)
**כל המוצרים בסל דואליים:**
1. **ערוץ ראשי — מכירה ישירה למשתמש תחת מותג HELIX.** אנחנו הבעלים של הקשר ושל המותג. זה ברירת המחדל לכל מוצר.
2. **ערוץ אופציונלי — הפצה / שיתופי פעולה.** כשמזדמן שותף עם בסיס לקוחות (כמו הקולגה מחברת בניית האתרים, מאות מחלקות שיווק) — המוצר נמכר גם white-label / כ-line-item בריטיינר. זה CAC-אפס שאף סטארטאפ ממומן לא משיג — אבל **תוספת**, לא הנחת היסוד.

הנכס הסודי אינו הטכנולוגיה אלא **גישת ההפצה הכפולה** — יכולת למכור ישירות *וגם* למנף בסיסי-לקוחות של שותפים.

## הפרויקטים
1. **[Marketing Ops Hub](01-marketing-ops-hub.md)** 🟢 — ה-wedge הראשי. intake → approval → proofing. פער שוק אמיתי, אספקה מקומית דלילה.
2. **[HELIX Reports — דוחות שיווק](02-roi-reporting-engine.md)** 🎯 — **חינם לעסקים קטנים/סטארטאפים = כלי חדירה** ששובר את מודל התשלום של המתחרים ($44-79/חודש). **מודל דואלי:** מכירה ישירה תחת מותג HELIX + הפצה white-label דרך שותפים כערוץ אופציונלי. מונטיזציה = רכישת לקוחות למותג HELIX.
3. **[מחקר איש-קשר + Enrichment + AI-SDR](03-contact-research-enrichment.md)** 🟢🔴 — כלי מודיעין+העשרה+agent מכירות רב-ערוצי. מתחרה ישיר: Klaus/CloserClaus. wedge: עברית+וואטסאפ+ציות+enrichment-מובנה. סיכון משפטי גבוה.
4. **[HELIX Rank — סוכן SEO + GEO](04-seo-agent.md)** 🚀 — בוט אוטומטי **דו-לשוני (עברית-first + אנגלית)** (מחקר→תוכן→פרסום→מעקב) עם **SEO + GEO שווי-ערך** (מדרג בגוגל וגם ב-ChatGPT/Gemini/Perplexity), **מנוע Citation-Gap→Patch אגנטי** (השראת enso/Hermes), **פרסום לכל CMS** (וורדפרס/אלמנטור/Wix/Webflow/headless), ו**גישה מרובת-ערוצים** (web/טלגרם/מייל + תשתית וואטסאפ). מתחרים: seo-agent.io (עברית) + enso.bot (אנגלית). נמכר בתשלום ישיר תחת מותג HELIX.
5. **[HELIX Shield — סוכן ניקוי שם ומוניטין](05-reputation-agent.md)** 🛡️ — אותו בסיס כמו HELIX Rank, **מטרה הפוכה:** שליטה ב-SERP ובתשובות ה-AI על *שם הלקוח*. ניטור→הסרה→דחיקה→תוכן חיובי→AI-Reputation. **דו-לשוני, 2 מצבים** (אדם/עסק), **מנוע הסרה מלא בלי שירות משפטי**, gates אתיים מובנים. מתחרים: scoopim/Monitin (סוכנויות ישראליות), BrandYourself/DeleteMe (גלובלי). נמכר בתשלום ישיר תחת מותג HELIX.
6. **פאזה 2 (בתוך קובץ 1):** Brand Vault + לינטר מותג. פער SMB+עברית אמיתי.
7. **[HELIX Digital Sign & Forms](07-helix-sign-forms.md)** ✍️ — כלי **טפסים דיגיטליים + חתימה B2B לעסקים קטנים** (חוזים/הסכמים/NDA). בונים מסמך → שולחים לחתימה (מייל/**וואטסאפ**) → מקבלים חוזה חתום. בידול: **עברית-native + מחיר שקוף + וואטסאפ + AI ליצירת חוזים** (3 מהם תשתיות HELIX). moat תוכני: ספריית חוזים ישראליים. חתימה מדורגת (רגילה→KYC→QES דרך ComSign). **מחוץ ל-scope: טפסים ממשלתיים.** מתחרים: tofsy/iForms/Easydo (IL), DocuSign/PandaDoc/Jotform Sign (גלובלי). מודל דואלי.

## קו מוצרי Agent OS
- **[HELIX Agent OS — קו מוצרי עובדי-AI מתוזמנים](06-agent-os-product-line.md)** 🤖📅 — מתודיקת "סוכן מתוזמן + דייג'סט יומי" (השראת freeCodeCamp). מוצרים חדשים מעבר לשיווק: **HELIX Daily** (עוזר אישי/hub), **HELIX Books** (ראיית חשבון/מע"מ), **HELIX Desk** (מזכירה אוטומטית), **HELIX Sentinel** (דדליינים/מכרזים), Recruiting Radar, Churn Radar, Competitor/Tenders Watch ועוד. כולם על מנוע אחד.

## תשתית משותפת (Cross-cutting)
- **[תשתית OLLAMA ל-Daily Digest](OLLAMA-DAILY-DIGEST-INFRA.md)** ⚙️ — מנוע HELIX Agent OS: scheduler + folder-of-agents + model-router (**Ollama מקומי** לנפח/עלות, **Claude** לאיכות/עברית) + digest composer + שליחה דרך הבוט. כל קו ה-Agent OS + Daily Digest למוצרים הקיימים יושבים עליו.
- **[SEO GSC Prompts reference](SEO-GSC-PROMPTS-reference.md)** — 7 הפרומפטים ל-GSC Intelligence של HELIX Rank.
- **[HELIX Bots — שיח ותפעול](HELIX-BOTS-CONVERSATION-OPS.md)** 🤖💬 — שכבת שיח **משותפת לכל הבוטים** (Rank/Shield/אקו-סיסטם) על טלגרם/וואטסאפ/מייל. חלק א' הקמה (Bot API, Cloud API, webhooks, utility templates, חלון 24 ש', opt-in §30A); חלק ב' כתיבה+סדר-עבודה (אוצר פקודות, ספריית microcopy עברית, מבנה תור Trigger→Notify→Ask→Confirm→Log, guardrails). מבוסס סקילים `whatsapp-cloud-api` + `ux-writer`.

## עבודה נלווית שבוצעה
- **דף GEO (helix/ai-checker):** הוטמע **FireCrawl** ב-`helix/lib/geo-scan.ts` (fetch מרונדר + זיהוי ודאי של תוכן מוסתר מאחורי JS). מופעל ע"י `FIRECRAWL_API_KEY` (אופ' `FIRECRAWL_BASE_URL` ל-self-host); בלי מפתח — התנהגות ישנה. אומת: 0 שגיאות typecheck בקוד ה-app.

## תמחור (משותף)
מנוי **שטוח per-workspace** (נגד ה-nickel-and-diming ששוֹנא השוק), נמכר **ישירות ללקוח תחת מותג HELIX** (ערוץ ראשי) + **wholesale לשותף/סוכנות** (ערוץ אופציונלי) + Request Desk חינם כפיתיון כניסה. WTP ישראלי: ~₪150-600/חודש/צוות.

## סטטוס
- ✅ שלב 1: תיקוף שוק (product-analysis) + תמחור (monetization-strategy)
- ✅ שלב 2: חיפוש OSS + מקומי (אבני בניין לצמצום פיתוח)
- ⬜ שלב 3: החלטת GO/NO-GO אחרי ניסויי תיקוף (fake-door / concierge pilot)
