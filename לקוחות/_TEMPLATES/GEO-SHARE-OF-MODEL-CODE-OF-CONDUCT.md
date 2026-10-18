# Share of Model: תקן המדידה וההתנהלות (Code of Conduct)

המסמך המנחה של דוח ה-GEO ושל דף הדוח המתארח בלינק. הוא קובע: מה מודדים (Share of Model), עם אילו נתונים, ותחת אילו כללים. מבוסס על מחקר רשת (אוקטובר 2026), עם הפרדה בין מוצק (SOLID) למפוקפק (SHAKY). כל טענה מספרית בדוח ללקוח חייבת להישען על החלק הזה.

כלל-על: אם נתון מסומן SHAKY או "פער ראיות", לא מציגים אותו כעובדה ללקוח.

---

## חלק 1: Share of Model, המדד

**מה זה.** האחוז מתוך תשובות ה-AI בקטגוריה שבהן המותג מוזכר או מומלץ, ביחס למתחרים. זו האבולוציה של Share of Voice ו-Share of Search לעידן ה-AI: לא נוכחות במדיה בתשלום ולא נפח חיפוש, אלא נוכחות בתוך התשובות של המודל.

**מקור.** המונח נטבע ומותג על ידי סוכנות Jellyfish (ג'ק סמית', Chief Solutions Officer), שהשיקה פלטפורמת "Share of Model™" ב-4.12.2024. מקור: [Martech Record](https://martechrecord.com/press-releases/jellyfish-launches-share-of-model-platform-first-to-market-solution-to-track-how-llms-perceive-brands-products-services/).

**הנוסחה (קונצנזוס בין ספקים, אין תקן יחיד):**
> Share of Model (%) = (אזכורי המותג שלך בתשובות הקטגוריה ÷ סך אזכורי כל המתחרים באותן תשובות) × 100

**שתי רמות (חובה להפריד, זה סטנדרט מקצועי מבוסס):**
- **מופיע (Mention):** המותג הוזכר בכלל.
- **מומלץ (Recommendation):** המודל ממליץ עליו, לא רק מזכיר ברשימה. זו הרמה היקרה.

**הקשר למונחים אחרים (אף אחד לא "ניצח" כסטנדרט ב-2026):**
- מה שקראנו לו עד עכשיו **"Share of Answer" הוא בפועל Share of Model**. נשתמש ב-Share of Model כשם הראשי, ו"נתח התשובות" כתרגום בעברית.
- Share of Voice = מדיה (ישן). Share of Search = נפח חיפוש בגוגל (ישן). Share of Model = נוכחות בתוך תשובות ה-AI (חדש).

**איך מודדים (תהליך מסונתז, לא תקן רשמי):**
1. **סט שאלות** קטגוריה (לא ממותגות), 5-10 להתחלה ועד מאות. שאלות קנייה אמיתיות.
2. **מריצים בכל המנועים** בנפרד: ChatGPT, Gemini, Claude, Perplexity, Copilot. **לא לאחד למספר אחד**, לדווח פר-מנוע (מותג יכול להיות חזק באחד וחלש באחר).
3. **לכל תשובה עוקבים אחרי:** מופיע / מומלץ / מיקום ברשימה / סנטימנט / ציטוט.
4. **דגימה חוזרת:** תשובות AI לא דטרמיניסטיות. להריץ כל שאלה כמה פעמים ולמצע, עם temperature 0 איפה שאפשר, ולחזור על המדידה בלוח זמנים.
5. **חישוב:** לציין תמיד איזה כלי/שיטה הפיקו את המספר. מספר Share of Model מכלי אחד לא ניתן להשוואה לכלי אחר (דנומינטורים שונים).

**הסתייגות קפדנות (חובה):** מחקר Sielinski (arXiv 2603.08924, 2026) מראה ששונות בין הרצות גבוהה, ולכן מספר-נקודה בודד הוא רעש. **לדווח טווח/תאריך-מדידה, לא דיוק-שווא.** Share of Model הוא מדד שיווקי, לא מדד אקדמי מאומת.

**כלים שמודדים את זה היום:** Jellyfish (Share of Model™), Profound (טוען שמודד מתנועת-משתמשים אמיתית ולא פרומפטים מדומים), Peec AI (עד 11 מנועים), Scrunch.

---

## חלק 2: מה הדוח מודד (framework, מתויג לפי ביטחון)

| נושא | מה מודדים | ביטחון בראיות |
|---|---|---|
| Share of Model | מופיע + מומלץ, פר-מנוע | שיטה מבוססת, מספרי-בנצ'מרק של ספקים = כיווני בלבד |
| ציטוט לדומיין | האם ה-AI מקשר לאתר שלך | כיוון מבוסס (ChatGPT מצטט הרבה פחות מ-Perplexity), אחוזים משתנים |
| העדפת מקורות פר-מנוע | מה כל מנוע אוהב לצטט | כיוון מבוסס, אחוזים סותרים בין ספקים |
| סכמה / FAQPage | נוכחות סימון מובנה | מעובד ע"י המנועים. סיבתיות (שהוא לבד מעלה ציטוט) לא מוכחת |
| **llms.txt** | נוכחות הקובץ | **כמעט לא מכובד בפועל. משקל נמוך, לא אות אמיתי** |
| גישת בוטי AI (robots) | GPTBot/ClaudeBot/PerplexityBot מותרים | מבוסס. אזהרה: חלק מהבוטים מתעלמים מחסימות |
| ציטוטיביות תוכן | סטטיסטיקות, ציטוטים, מקורות, רעננות | פרינסטון KDD 2024, המקור היחיד שעבר ביקורת עמיתים. **מ-2024 על GPT-3.5 מדומה, המספרים התיישנו, לצטט בזהירות** |
| ישות (Wikidata/ויקיפדיה) | נוכחות ישות מאומתת | מנגנון מקובל, אחוזים סותרים |

**נוכחות חוץ-אתרית (off-site), עם הקשר שוק (חשוב):**
- **לינקדאין: אות חזק, בעדיפות גבוהה, במיוחד ב-B2B ובישראל.** לינקדאין הוא הרשת המקצועית הדומיננטית פה, וה-LLM קורא ממנו. אין מספר ציבורי מדויק (אין מחקר ממותג כמו של Reddit), אבל זה מבוסס-מנגנון ומאומת-שטח. **לא להציג את היעדר-המחקר כאילו לינקדאין לא עובד.** לתעדף אותו.
- **Reddit: מקור הציטוט הכי גדול של ה-AI גלובלית** (~40%, Semrush יוני 2025), אבל **תלוי-שוק.** משמעותי בעיקר ללקוחות שעובדים מול חו"ל / קהל דובר אנגלית. בישראל השימוש ב-Reddit נמוך, אז למותג מקומי-בלבד זה אות חלש. **לשקלל לפי שוק היעד של הלקוח.**
- **יוטיוב:** אות חזק, מאושש, רלוונטי בשני השווקים.

---

## חלק 3: נתונים מעודכנים לציטוט (2026)

**מוצק (SOLID), לעגן עליהם את הדוח:**
- **G2 (סקר מרץ 2026, 1,076 מקבלי החלטה):** 51% מקוני B2B מתחילים מחקר ב-chatbot AI (עלה מ-29% באפריל 2025). 71% משתמשים ב-AI בשלב כלשהו. **69% בחרו ספק אחר מהמתוכנן בגלל ה-AI, 33% קנו ממותג שלא הכירו.** [מקור](https://www.prnewswire.com/news-releases/new-g2-research-half-of-b2b-software-buyers-now-start-their-research-with-ai-chatbots-302742807.html). זה האנקור הכי משכנע למנכ"ל.
- **Pew (יולי 2025, פאנל אמיתי של 900 משתמשים):** ~18% מחיפושי גוגל מציגים AI Overview, עד 60% בשאלות "מי/מה/למה". המקור הכי אמין בכל הסט. [מקור](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/).
- **Similarweb (2026):** פלטפורמות AI = 9.5 מיליארד ביקורים חודשיים, +70% בשנה, 655 מיליון משתמשים ייחודיים.

**בזהירות (לציין תאריך/מגזר, לא מספר שטוח):** Semrush Sensor (AI Overview 13%-50% תלוי מגזר), Seer (שאילתות מסחריות 8%, עולה מהר), שיעורי AI Overview מקומיים (40%-68%, מדגמים קטנים).

**לא לצטט כעובדה:** תחזית Gartner "ירידה של 25% בחיפוש עד 2026" (תחזית מ-2024, לא תוצאה שנמדדה), "60% zero-click", "ירידת CTR 61%", ורוב אחוזי הצרכנים (45%-64%, מקורות משניים שמצטטים זה את זה). פער ידוע: אין מקבילה צרכנית (B2C) מאומתת ל-69% של G2.

---

## חלק 4: Code of Conduct, כללי התנהלות (לדוח + ללינק המתארח)

### פרטיות
- **לינק לא ניתן לניחוש הוא לא הגנה.** חובה `noindex, nofollow, noarchive` + `X-Robots-Tag`, בלי קישור מעמוד מאונדקס ובלי sitemap. (OWASP, security-through-obscurity).
- **נתיב הסרה גלוי** בכל דוח ("זה עליך ואתה רוצה להסיר? צור קשר"), מחיקה תוך ~5 ימי עסקים.
- **דאטה אישית:** ברגע שמוזכר אדם בשם (מייסד) זו דאטה אישית לפי תיקון 13 לחוק הישראלי (בתוקף 14.8.2025) ו-GDPR. להעדיף "המייסד/ההנהלה" גנרי, ולהשתמש בשם רק אם זה כבר המיתוג הפומבי שלהם. בסיס חוקי: legitimate interest (שיווק B2B), עם הערכה שמורה.
- **מינימיזציה + מחיקה:** לשמור מינימום, למחוק דוח + לוגים אחרי ~90 יום אם הליד לא הפך ללקוח.

### תנאי שימוש של פלטפורמות
- **רק דרך API רשמי, לא סקרייפינג** של ה-UI של ChatGPT/Gemini, ולא של לינקדאין (הפרת §8.2, בתוקף 3.11.2025) או יוטיוב (רק YouTube Data API).
- **זכויות פלט:** OpenAI מקצה את הפלט ללקוח (אסור לאמן מודל מתחרה). Anthropic מאשר שימוש מסחרי מלא. Google לא תובע בעלות אבל אוסר שימוש לבניית מודל מתחרה.
- **לוגים:** OpenAI שומר קלט/פלט עד 30 יום כברירת מחדל. לבקש retention קצר/אפס אם יש רגישות.

### כנות וגילוי
- **אפס המצאות.** כל אזכור מתחרה, דירוג או ציטוט = פלט אמיתי של מודל, מצוטט מדויק.
- **גילוי שהדוח נוצר ב-AI** (EU AI Act סעיף 50, חובת שקיפות מ-2.8.2026): "הדוח הופק בעזרת ChatGPT/Gemini/Claude שנשאלו בתאריך X, ונבדק ע"י HELIX."
- **מקור + תאריך + מודל לכל נתון.** תוויות ביטחון (ודאי/סביר/הערכה), לא ודאות שקרית.
- **דיסקליימר "לא התחייבות":** פלט AI לא מובטח כמדויק/עדכני/יציב, זה תמונת-רגע, כלי שיווקי ולא אודיט.
- **מתחרים:** רק מה שה-AI אמר, מצוטט ומתוארך, בלי ביקורת או דירוג משלנו (בטיחות מפני לשון הרע + תואם את כלל HELIX "לא לבקר מתחרים פומבית").

### נגישות (WCAG 2.2 AA)
- ניגודיות טקסט 4.5:1 (גדול 3:1), אלמנטים לא-טקסטואליים 3:1.
- כותרת H1 אחת + היררכיית H2/H3 בלי דילוגים.
- alt משמעותי לכל גרף/לוגו/צילום.
- Reflow לעמודה אחת ב-320px בלי גלילה אופקית, יעדי מגע 24x24px, פוקוס גלוי + מקלדת.

---

## חלק 5: מה זה משנה במוצר שלנו (פעולות)
1. **לאמץ "Share of Model" כשם הראשי** (עם "נתח התשובות" כתרגום). זה המונח המקצועי המקובל, Jellyfish, 12/2024.
2. **להוריד את המשקל של llms.txt** במנוע. הבוטים לא מכבדים אותו בפועל.
3. **לינקדאין = אות בעדיפות גבוהה** (B2B + ישראל, הרשת המקצועית הדומיננטית). לשמור, לתעדף ולהדגיש. לא להציג כ"לא מוכח".
4. **להוסיף בדיקת נוכחות ב-Reddit, משוקללת לפי שוק:** גבוה ללקוחות שעובדים מול חו"ל ודוברי אנגלית, נמוך למותג מקומי-ישראלי בלבד.
5. **לדווח פר-מנוע, לא מספר אחד מאוחד** + תאריך מדידה + הערת שונות.
6. **דגימה חוזרת** (כמה הרצות לשאלה) כדי שה-Share of Model יהיה יציב ולא רעש.

---

## נספח: מקורות עיקריים
- Share of Model: [Jellyfish launch, Martech Record](https://martechrecord.com/press-releases/jellyfish-launches-share-of-model-platform-first-to-market-solution-to-track-how-llms-perceive-brands-products-services/) · [Hallam, הסבר](https://hallam.agency/blog/share-of-model-a-key-metric-for-ai-powered-search/) · [Amplio, SoM מול SoA](https://www.ampliodata.io/blog/what-is-share-of-answer)
- אי-ודאות במדידה: [Sielinski, arXiv 2603.08924](https://arxiv.org/pdf/2603.08924)
- נתוני שוק: [G2 2026](https://www.prnewswire.com/news-releases/new-g2-research-half-of-b2b-software-buyers-now-start-their-research-with-ai-chatbots-302742807.html) · [Pew יולי 2025](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/)
- ציטוטיביות: Princeton GEO KDD 2024 (Aggarwal et al.) · [ביקורת](https://blckalpaca.at/en/knowledge-base/seo-geo/geo-generative-engine-optimization/the-princeton-geo-study-methodology-results-and-critique)
- Reddit כמקור ציטוט: [Semrush via soar.sh](https://www.soar.sh/blog/how-reddit-became-the-biggest-llm-citation-source)
- פרטיות: [תיקון 13, Herzog](https://herzoglaw.co.il/en/news-and-insights/amendment-no-13-to-the-israeli-privacy-protection-law/) · [GDPR Art 5](https://gdpr-text.com/read/article-5/)
- AI disclosure: [EU AI Act Art 50](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act)
- מתחרים: [FTC comparative advertising](https://www.ftc.gov/legal-library/browse/statement-policy-regarding-comparative-advertising)
- נגישות: [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- ToS: [OpenAI](https://openai.com/policies/services-agreement/) · [Anthropic](https://www.anthropic.com/legal/commercial-terms) · [Gemini](https://ai.google.dev/gemini-api/terms) · [LinkedIn §8.2](https://www.revenueflow.com/blog/linkedin-web-scraping) · [YouTube API](https://developers.google.com/youtube/terms/api-services-terms-of-service)
