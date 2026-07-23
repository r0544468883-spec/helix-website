# HELIX — מאגר רעיונות מוצר (IDEAS)

> נוצר: 2026-07-22 · מקור השראה עיקרי: סקירת הריפוזיטוריז הפומביים של Ram Walastal (github.com/ramqa211-1)
> מסמך חי. כל רעיון כולל: מה זה · התאמה ל-HELIX · נכסים לשאיבה · מאמץ · סטטוס.

---

## איך לקרוא את המסמך

מהסקירה של 14 הריפו של ram עלתה תובנה אחת גדולה: הוא בנה **את אותו דפוס AI שלוש פעמים** (צ'אט חכם על נתונים אישיים — פגישות, כספים, ילדים). זה לא שלושה מוצרים — זו **תבנית אחת** שאפשר להלביש על כל vertical. זה עומד בבסיס הרעיון הראשון למטה.

מבחינת **קוד** — כמעט אין מה לשאוב ממנו (שכבת המסרים שלו נחותה מזו של HELIX; הוא על WPPConnect לא-רשמי, אנחנו על Cloud API רשמי). היוצא-מהכלל היחיד: **agentPlaywright** (resilient selectors, ראה נספח).

מבחינת **רעיונות מוצר** — יש כאן חומר אמיתי, מרוכז למטה.

---

## 1. Personal Data Copilot — תבנית "שאל את הנתונים שלך" ⭐ ROADMAP CORE

**מה זה:** שכבת צ'אט-AI רוחבית שיושבת על גבי כל דאטה של המשתמש ומאפשרת לשאול שאלות בשפה טבעית, לקבל תובנות, ולבצע פעולות — עם **הרשאות לפי תפקיד** (read-only למשתמש רגיל, read/write לאדמין).

**מקור ההשראה:** ram מימש את הדפוס הזהה ב-3 מוצרים נפרדים (meetingcalculate, my-financial-compass, watch-my-kid). ההישנות היא ההוכחה שזו פרימיטיבה, לא פיצ'ר נקודתי.

**התאמה ל-HELIX:** מתחבר ישירות ל-**HELIX Dashboards**. במקום שהמשתמש יקרא גרפים — הוא שואל אותם. "כמה לידים נכנסו החודש מול הקודם?", "תראה לי איפה ה-funnel דולף". זה הופך דאשבורד פסיבי ל-copilot אקטיבי, ומייצר בידול מול Metabase/Looker.

**נכסים לשאיבה מ-ram:** דפוס ההרשאות read/write לפי role (מ-meetingcalculate), ומנוע הדוחות התקופתיים (feeds ל-bot digest שכבר קיים).

**מאמץ:** בינוני. תשתית ה-AI וה-channels כבר קיימת בכל מוצרי HELIX. העבודה: שכבת RBAC + tool-calling מעל schema הנתונים.

**סטטוס:** מומלץ כ-core של roadmap ה-Dashboards.

---

## 2. Meeting Cost / ROI Calculator — Lead Magnet ויראלי

**מה זה:** כלי B2B קטן וממוקד: מזינים משתתפי פגישה + משכורות (או תפקידים) → מקבלים את **העלות בזמן-אמת של הפגישה** ("הפגישה הזו עולה לחברה ₪X"). אופציונלי: דוח חודשי "כמה שרפתם על פגישות".

**מקור ההשראה:** meetingcalculate של ram (מערכת ניהול פגישות מלאה בעברית עם דוחות ו-AI). הגרסה הוויראלית היא ה"קרח השובר" — כלי בודד וחינמי.

**התאמה ל-HELIX:** **Lead magnet מושלם** ל-Marketing Ops Hub / למוצרי הסוכנויות. זה תוכן שאיטרים אוהבים לשתף (social currency + practical value), מזרים לידים לרשימה, ומדגים את יכולות ה-AI של HELIX בזעיר-אנפין.

**נכסים לשאיבה:** מודל הנתונים והדוחות מ-meetingcalculate; העיצוב העברי RTL.

**מאמץ:** נמוך. עמוד יחיד + חישוב + capture form. אפשר לבנות תוך ימים.

**סטטוס:** מועמד מהיר ל-growth. משתלב עם skill `contagious` / `landing-page-generator`.

---

## 3. Personal Finance Copilot — vertical פיננסי

**מה זה:** מרכז פיננסי אישי/משפחתי: דאשבורד כספים, ביטוחים, השקעות, נכסים, מסמכים, **התראות תפוגה** (ביטוחים/פוליסות), צ'אט AI פיננסי, ושיתוף עם בני משפחה בהרשאות.

**מקור ההשראה:** my-financial-compass של ram — כבר בנוי, עברית מלאה, offline-first + Supabase sync.

**התאמה ל-HELIX:** vertical חדש (consumer/fintech-lite) או instance של תבנית #1 (Personal Data Copilot על דאטה פיננסי). ה-offline-first + sync שלו הוא דפוס ארכיטקטוני שכדאי לאמץ ל-widget engine של Dashboards בכל מקרה.

**נכסים לשאיבה:** ארכיטקטורת offline-first (localStorage → Supabase), מנוע התראות תפוגה, מודל הרשאות-משפחתי → team sharing.

**מאמץ:** בינוני-גבוה כמוצר עצמאי; נמוך אם רק שואבים את דפוסי הארכיטקטורה.

**סטטוס:** לשקילה. הערך הבטוח = דפוסי הארכיטקטורה, לא בהכרח המוצר.

---

## 4. Watch My Kid — ניטור בטיחות ילדים (consumer)

**מה זה:** שירות הגנה על ילדים ברשת: ניטור AI של הודעות (WhatsApp), זיהוי תוכן פוגעני/מסוכן, והתראות להורים בזמן אמת.

**מקור ההשראה:** watch-my-kid-sign-up של ram — כרגע בשלב validation (רק landing + טופס הרשמה ל-Google Sheets). כלומר יש כבר אינדיקציית ביקוש התחלתית.

**התאמה ל-HELIX:** vertical **חדש לגמרי** — קהל הורים, לא B2B. שונה מהותית משאר תיק HELIX (שהוא B2B/marketing). מצד שני: תשתית ה-AI-classification-of-messages + ה-channels כבר קיימת אצלנו, כך ש-time-to-market קצר יחסית.

**נכסים לשאיבה:** ה-validation/landing כ-proof-of-demand; דפוס classification של הודעות (כבר קיים אצלנו ב-classify-email של PLUG).

**מאמץ:** גבוה (מוצר consumer + רגישות פרטיות/רגולציה סביב קטינים). דורש validation אמיתי לפני build.

**סטטוס:** vertical ספקולטיבי. להחליט אם HELIX רוצה בכלל קו consumer.

---

## 5. AI QA Agent — QA-as-a-Service (dev tools)

**מה זה:** אג'נט שמקבל הוראת בדיקה בשפה טבעית ("תיכנס לאתר, תתחבר, תוודא שהצ'קאאוט עובד") → **מייצר ומריץ טסטים** לבד, עם סלקטורים חסינים ו-self-healing, ומחזיר דוח + screenshots.

**מקור ההשראה:** **agentPlaywright** של ram (DOM → LLM → resilient selectors → הרצת Playwright) + הרקע החזק שלו ב-QA (Appium/Selenium/TestNG בשאר הריפו). הצירוף הזה הוא בדיוק מוצר QA-agent.

**התאמה ל-HELIX:** כיוון עתידי אם HELIX נכנס ל-**dev tools**. גם משרת פנימית — אותו מנוע resilient-selectors הוא בדיוק מה שה-PLUG Extension צריך לזיהוי כפתורי Easy Apply (ראה נספח — כבר מיושם).

**נכסים לשאיבה:** דפוס resilient-selectors המלא (ראה נספח); הידע ב-Playwright/Appium.

**מאמץ:** גבוה כמוצר; נמוך כרכיב פנימי (כבר נשאב ל-extension).

**סטטוס:** רעיון מוצר עתידי. הרכיב הפנימי — בוצע.

---

## טבלת עדיפויות

| # | רעיון | קהל | מאמץ | ROI מיידי | סטטוס |
|---|-------|-----|------|-----------|-------|
| 1 | Personal Data Copilot | B2B (Dashboards) | בינוני | גבוה | ⭐ roadmap core |
| 2 | Meeting Cost Calculator | B2B (lead-gen) | נמוך | גבוה | מועמד מהיר |
| 3 | Finance Copilot | Consumer / vertical | בינוני-גבוה | בינוני | דפוסים בטוחים |
| 4 | Watch My Kid | Consumer (הורים) | גבוה | נמוך | ספקולטיבי |
| 5 | AI QA Agent | Dev tools | גבוה | נמוך (מוצר) / גבוה (רכיב) | רכיב בוצע |

**המלצה:** להתחיל מ-#2 (מהיר, ויראלי, lead magnet) במקביל ל-#1 (הליבה האסטרטגית ל-Dashboards). #3-5 לפי החלטת אסטרטגיה.

---

## נספח: agentPlaywright — הרכיב היחיד ששווה קוד

הדפוס: snapshot של DOM → LLM מחזיר **סלקטורים חסינים עם fallback chains** → הרצה עם retries (`tryClick`/`tryFill`/`tryPress`) ו-`tryClickSmart` fallback ויזואלי.

**יושם ב-PLUG Extension** כמודול `src/lib/resilient-selectors.ts` (מותאם ל-Claude דרך ai-proxy, לא OpenAI). נותן שכבת self-healing מתחת לסלקטורים הקשיחים של Easy Apply/כרטיסי משרות — בלי לגעת בזרימת זיהוי הכרטיסים הקיימת.
