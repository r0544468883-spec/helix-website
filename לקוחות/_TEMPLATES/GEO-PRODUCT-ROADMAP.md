# GEO Product Roadmap (מנוע + דוח + דף מתארח)

רשימת הבנייה המאוחדת למוצר ה-GEO של HELIX. **סטטוס: לא בונים עדיין, אוספים קלט.**

## החזון
GEO **כן, רב-מנופי, ואמיתי פר-מנוע.** לנצח את ReddGrow (מנוף יחיד, טענות לא-מאומתות) על כנות ורוחב, ולהשתוות/לעלות על הרגורוזיות של TapasSEO.

## מקורות השראה (teardowns)
- **הפוסט של רון** = המפרט (6 הפערים מהדוח האמיתי).
- **מחקר Share of Model + Code of Conduct** (4 חוקרים, אוקטובר 2026).
- **ReddGrow** (reddgrow.ai), teardown של רון + INSTINCT: GEO מבוסס-Reddit בלבד, ממותג "AI Visibility".
- **TapasSEO** (tapasseo.com/geo-audit), דוח GEO בוגר, $397 fixed-scope, 15 עמודים + developer bundle.

---

## רשימת הבנייה המאוחדת

לכל פריט מצוין המקור. 🟢 = נבנה · 🏗️ = בתהליך · ⬜ = מתוכנן.

### מנוע / מדידה
- 🟢 **Share of Model אמיתי** (סט שאלות × 3 מנועים × 3 הרצות, פר-מנוע). [פוסט #1] (TapasSEO ו-ReddGrow שניהם מריצים **3x פר-מנוע**, אימות שהבחירה נכונה)
- ⬜ **לוח פר-שאלה + עמדה**, כ-**Query × Engine heatmap** (נוכחות ציטוט פר-שאלה פר-מנוע). [פוסט #2 + TapasSEO]
- ⬜ **אילו מקורות המנוע ציטט** (דומיינים). [פוסט #4 + ReddGrow + TapasSEO]
- ⬜ **רשימת מקורות בני-טיפול (15-20), עם פעולה לכל אחד** (אילו עמודי צד-שלישי ה-AI כבר מצטט בקטגוריה: Reddit, listicles, G2, ביקורות, ואיך נכנסים לכל אחד). **הפיצ'ר המנצח של TapasSEO, הכי אקשנבילי.** [TapasSEO]
- ⬜ **בדיקת הזיות / עובדות** ("האם מה שה-AI אומר עליך נכון, או המציא מחיר/פיצ'ר"). [פוסט #5 + ReddGrow + TapasSEO fact-check layer]
- ⬜ **סנטימנט פר-מנוע** (איך ה-AI מדבר עליך, לא רק אם). [ReddGrow]
- ⬜ **Perplexity + AI Overviews** (5 מנועים במקום 3). [פוסט #3 + ReddGrow + TapasSEO]
- ⬜ **מגמה חודשית** (ציר זמן פר-מנוע). [פוסט #6 + ReddGrow]

### בסיס / אתר (רוב כבר קיים ב-geo-scan)
- 🟢 נגישות AI, bot_fetch, SSR, סכמה, ציטוטיביות (stats/citations/freshness), ישות, נוכחות חיצונית (LinkedIn/YouTube/רשתות).
- ⬜ **Crawler access matrix פר-בוט** (טבלה: GPTBot/ClaudeBot/PerplexityBot/Google-Extended, מותר/חסום לכל אחד). [TapasSEO] (יש לנו ai_access כללי, להפוך למטריצה ויזואלית)
- ⬜ FAQ schema signal (כבר נבדק; להדגיש בתוצר).

### תוצר / דוח / דף מתארח
- 🟢 תבנית דוח ממוקדת מנכ"ל/סמנכ"ל-שיווק + סעיף נוכחות חיצונית + הסבר 3-הרצות.
- ⬜ **Scorecard** (ציון GEO 0-100 + תתי-ציונים), **query×engine heatmap**, **טבלת addressable sources**, **תוכנית 30/60/90** עם impact/effort/owner. [TapasSEO]
- ⬜ **Implementation bundle**: סכמת JSON-LD מוכנה להדבקה, שורות robots.txt, תבניות אאוטריץ' למקורות. done-with-you. [TapasSEO]
- ⬜ **דף דוח מתארח** `/r/[token]`, לפי ה-Code of Conduct (noindex, opt-out, גילוי AI, WCAG). [בקשת רון]
- ⬜ **White-label / client portal** לחבילת סוכנויות (דוחות ממותגים ללקוח). [ReddGrow Agency + תוכנית השותפים]

### פוזישנינג / מודל עסקי
- ⬜ **כנות כיתרון מכירה:** כל מספר מצוטט+מתוארך, תוויות ביטחון, "מופיע מול הומלץ", מול הטענות הלא-מאומתות של ReddGrow ("פי 2/5/10", "68%", "200+ צוותים"). [Code of Conduct + INSTINCT]
- ⬜ **שקלול מנופים לפי שוק (היתרון הישראלי):** Reddit גבוה לחו"ל/אנגלית, נמוך לישראל-מקומי. ReddGrow (גלובלי-אנגלית) לא יכולים. [מחקר + תיקון של רון]
- ⬜ **מוצר fixed-scope אופציונלי:** "דוח GEO ב-₪X, היקף קבוע, 5-7 ימים", לצד הפיילוט החודשי. [TapasSEO model]

---

## מה TapasSEO עושה שאנחנו לא (לשאוב)
1. **Addressable sources list** (15-20 עמודי צד-שלישי שה-AI מצטט + פעולה לכל אחד). הכי אקשנבילי.
2. **Implementation bundle** (schema/robots/תבניות אאוטריץ' מוכנים). done-with-you.
3. **Query × Engine heatmap** (ויזואליזציה).
4. **Crawler access matrix** פר-בוט.
5. **Fact-check layer** (מאמת את פער ההזיות שלנו).
6. מודל fixed-scope + תמחור שקוף + "senior experts".

## מה ReddGrow עושה שאנחנו לא (לשאוב)
1. סנטימנט + מגמות 7/30 יום.
2. White-label exports + client portals (Agency).
3. Slack digest יומי.
(וזה מה **לא** לחקות: מנוף יחיד, וטענות שיווק לא-מאומתות.)

## הערות
- שתי הבדיקות החיות הוכיחו: GEO טכני באתר הכרחי אבל לא מספיק. המנצחים נכנסים דרך קונצנזוס חיצוני (listicles, G2, Reddit). הדוח חייב להפוך את זה לאקשן (addressable sources).
- ממתינים לעוד קלט מרון לפני תחילת בנייה.
