# HELIX CHIEF — מתזמר סוכני-AI + מצבת ה-Agents 🎯 (Spec)

> **HELIX CHIEF** = ה-orchestrator של האקוסיסטם (המקבילה ל-Maestro של Wix Symphony). ממשק-שיחה אחד שיושב מעל ה-CRM החינמי וה-Dashboards, ומנתב ל-**agent** הנכון — כל agent עובד **stand-alone** וגם **ביחד** דרך CHIEF. כפוף למתג האוטונומיה.
>
> תאריך: 2026-08-11 · לוויין ל-[[HELIX-ECOSYSTEM-FREE-CRM-HUB]] · [[HELIX-ECOSYSTEM-VS-WIX-SYMPHONY]] · [[HELIX-ECOSYSTEM-CRM-EXTENSION-MAP]] · [[autonomy-switch-program]]

---

## 1. הרעיון בשורה
Symphony הוכיחו שהמודל המנצח = **מתזמר אחד + צוות agents מתמחים על CRM אחד**. אנחנו בונים את אותו הדבר, עם המוט שלנו (עברית/WhatsApp/פרטיות/stand-alone): כל מוצר HELIX נחשף כ-**agent** שרץ לבד או מתוזמר ע"י **HELIX CHIEF**, כשה-CRM הוא הזיכרון המשותף וה-Dashboards הם שכבת הנראוּת.

---

## 2. מבנה ה-agents (מודל Symphony, מאומת)
3 סוגי agents ([wix.com/blog/symphony-wix-agents](https://www.wix.com/blog/symphony-wix-agents)):
1. **Built-in** — 6 תחומים: Outreach · Marketing · Scheduling · Research · Finance · Design.
2. **Custom** — מוגדר על הלוגיקה העסקית של הלקוח.
3. **External** — צד-שלישי (Shopify/Zendesk אצלם).

**6 ה-Built-in של Symphony (התייחסות):**
- **Outreach** — תקשורת לקוחות, follow-up לידים, אישורי/תזכורות פגישות.
- **Marketing** — קמפיינים, copy סושיאל, לוח תוכן, תוכן בכל פורמט (SEO+סושיאל).
- **Scheduling** — ניהול פגישות, מעקב booking, תזכורות + רצפי follow-up.
- **Research** — איסוף מידע, תובנות, BI.
- **Finance** — מעקב הכנסות, חשבוניות באיחור, reconciliation, תובנות פיננסיות.
- **Design** — assets ויזואליים במותג, copy למוצר, התאמת תוכן לערוצים.

---

## 3. מצבת ה-Agents של HELIX (מיפוי + פערים)

| # | HELIX Agent | מבוסס על מוצר | Symphony מקביל | סטטוס |
|---|---|---|---|---|
| 1 | **Outreach Agent** | SDR/BDR + OPS | Outreach | ✅ קיים |
| 2 | **Marketing Agent** | Rank (SEO/GEO) + OPS + כלי-תוכן | Marketing | ✅ קיים |
| 3 | **Scheduling Agent** | Calendly + MEETING | Scheduling | ✅ קיים |
| 4 | **Research Agent** | העשרה own-first (מ-SDR) | Research | 🟡 לפרמל כ-agent עצמאי |
| 5 | **Finance Agent** | *חדש* — חשבוניות/גבייה (סינרגיה [[helix-sign-forms]]) | Finance | ❌ **לבנות** |
| 6 | **Design Agent** | *חדש* — assets/קופי ויזואלי | Design | ❌ **לבנות** |
| 7 | **Meeting Agent** | MEETING (תמלול+6 סיגנלים) | (חלק מ-Scheduling אצלם) | ✅ קיים — **יתרון עלינו** |
| 8 | **Reputation/Rank Agent** | HELIX Rank (GEO/SEO+מוניטין) | (בתוך Marketing) | ✅ קיים — **יתרון עלינו** |
| — | **Custom Agent framework** | *חדש* — הגדרה לפי לוגיקת-לקוח | Custom | ❌ **לבנות** |
| — | **External/Connectors** | Dashboards connectors (GA4/Meta) + WhatsApp | External | 🟡 להרחיב |

> **מסקנה:** יש לנו כבר 4-6 agents. **הפערים לבנייה:** Finance, Design, Custom-framework, ולפרמל את Research. Meeting+Rank הם agents שלנו שאין ל-Symphony כמותם (עומק).

---

## 4. HELIX CHIEF — המתזמר 🎼
**מה הוא:** ממשק-שיחה אחד ("צ'יף") שמכיר את העסק (דרך ה-CRM) ומנתב לכל agent.

**עקרונות:**
1. **דיספָּטץ' אוטומטי** — "תמצא 20 לידים, תתאם פגישות, תכתוב תוכן" → CHIEF מפעיל Outreach + Scheduling + Marketing, מתאם ביניהם.
2. **CRM = הזיכרון המשותף** — ל-CHIEF ולכל agent יש "התמונה המלאה של הלקוח בלי סנכרון ידני" (בדיוק ה-[[HELIX-ECOSYSTEM-CRM-EXTENSION-MAP]]).
3. **Dashboards = שכבת הנראוּת** — CHIEF מציג טרנדים/pipeline חוצי-agents ב-Dashboards.
4. **מתג אוטונומיה per-action** — כל פעולת-agent כפופה ל-advisor→approve→autopilot ([[autonomy-switch-program]]). **יתרון עלינו על ה-approve/deny הפשוט של Symphony.**
5. **stand-alone תמיד** — כל agent רץ גם לבד בלי CHIEF (בודק רק את ה-entitlement שלו).

**זרימה:**
```
משתמש → HELIX CHIEF (שיחה) → מזהה כוונה → מנתב ל-agent/ים
                                    ↓
        Outreach · Marketing · Scheduling · Research · Finance · Design · Meeting · Rank
                                    ↓  (כולם קוראים/כותבים)
                    CRM חינם (זיכרון משותף)  +  Dashboards (נראוּת)
                                    ↓
                    מתג אוטונומיה — advisor / approve / autopilot per-action
```

---

## 4b. ארכיטקטורת המחלקה הפנימית — "צוות אייג'נטים" בתוך כל מוצר 🧠 (החוקה)

> **הבחנה קריטית:** §4 מגדיר תזמור ברמת-**מאקרו** (CHIEF מנתב בין מוצרים). סעיף זה מגדיר את הרמת-**מיקרו**: מה קורה *בתוך* מוצר בודד. עד היום כל מוצר = agent יחיד עם system-prompt שמגלם כמה תפקידים. מהיום כל מוצר = **מחלקה של אייג'נטים מתמחים**, שכל אחד חושב עצמאית, תחת **צ'יף-מחלקתי (Department Chief)** פנימי. זו ארכיטקטורה **פרקטלית**: אותו דפוס "מנצח + צוות + מבקר" חוזר בשתי הרמות (CHIEF↔מחלקות, Department-Chief↔תפקידים).

### ההיררכיה + כלל הגבול (הכי חשוב) 🔒
שלוש רמות תזמור, לא שתיים: **CHIEF → System Chief → Team Chief → Agents**. מוצר = **מערכת (System)** שיכולה להכיל כמה **צוותים (Teams)**, לכל צוות **Team Chief**, ומעליהם **System Chief** אחד.

```
CHIEF (ראשי) ─┬─► System Chief (Rank)          ← ברירת-מחדל: ערוץ הפיקוד (commands)
              │        ├─► Team Chief (Content)   ─► [Researcher · Maker · Critic]
              │        └─► Team Chief (Technical)  ─► [Schema · Crawl · Links]
              │
              └───► יכולת + נראוּת מלאה: יכול לדבר ישירות עם כל Team Chief וכל סוכן-עלה
```

**שלושה כללים נפרדים — אל תבלבל ביניהם:**
1. **נראוּת (visibility): CHIEF רואה הכל.** מצב כל צוות, כל סוכן, כל reasoning — זמין ל-CHIEF (ל-Dashboards/פיקוח). **לא** קופסה שחורה.
2. **יכולת (capability): CHIEF יכול לדבר עם הכל.** יש לו יכולת טכנית לפנות ל-System Chief, ל-Team Chief, **וגם לכל סוכן-עלה בצוות** — לצורך override/תיקון/בירור נקודתי. שום דלת לא נעולה בפניו.
3. **שני מצבי-פיקוד לגיטימיים (לפי סוג המשימה):**
   - **משימה מתוזמרת/רב-שלבית** ("תכתוב מאמר, תבדוק SEO, תפרסם") → דרך ה-**System Chief**, שמנתב לצוותים. זה שומר אנקפסולציה כשצריך תזמור.
   - **פנייה ישירה לסוכן בודד** ("תשאל את ה-Critic למה הוא פסל את הפסקה") → CHIEF מדבר **ישירות עם הסוכן**. זה מצב-עבודה **מלא ולגיטימי**, לא חריג — כי אחרת עבודת המשתמש תהיה מסורבלת. המשתמש רוצה לגשת לעובד הספציפי בלי לעבור את כל שרשרת הפיקוד.

   כלומר: ה-System Chief הוא ה**ברירת-מחדל לתזמור**, לא **שער חובה**. כל הדלתות פתוחות ל-CHIEF; הוא בוחר את הרמה הנכונה לפי המשימה.

> **כלל אחד קריטי לגישה הזו (אחרת היא נשברת):** גם פנייה ישירה לסוכן-עלה **חייבת להיכתב לזיכרון המשותף (CRM/state)**, כדי שה-System/Team Chief יידעו שקרה שינוי ולא יעבדו על תמונה מיושנת. "כל הדלתות פתוחות" עובד רק אם כל דלת מדווחת חזרה למצב המשותף. זה ה-tradeoff היחיד של גמישות מלאה — ומנטרלים אותו עם write-back חובה.

**למה זה נכון:**
- **אנקפסולציה גמישה** — Rank משנה את הצוותים הפנימיים → ה-contract מול CHIEF לא משתנה, אבל CHIEF עדיין *רואה* את השינוי.
- **stand-alone בחינם** — ה-System Chief חייב להתקיים ממילא כשלקוח קנה רק את המוצר. ה"מוח" של המערכת שלה, לא מושאל מ-CHIEF.
- **override חירום** — הנראוּת המלאה מאפשרת ל-CHIEF (או למשתמש דרכו) לעצור/לתקן צוות ספציפי בלי לעבור את כל המערכת.

> **הערה על גודל:** מוצר פשוט = מערכת עם **צוות אחד** (System Chief = Team Chief באותו רכיב). מוצר מורכב (Rank) = כמה צוותים. מתחילים תמיד צוות-אחד ומפצלים כשצריך.

### עקרון-על: hybrid, לא הכל-או-כלום
- **משימה פשוטה** (סטטוס/שאלה/אישור) → **fast-path**: agent יחיד, קריאה אחת. זול+מהיר.
- **משימה מורכבת** (כתיבת מאמר, אבחון CRO, קמפיין, אאוטריץ') → **team-path**: מחלקת אייג'נטים + מבקר אדוורסרי.
- ה-orchestrator הפנימי מחליט לאיזה מסלול, בדיוק כמו ש-CHIEF מחליט לאיזה מוצר.

### ה-Agent Contract הפנימי (אחיד לכל המוצרים)
כל agent-פנימי מקיים את אותו חוזה, כדי שנוכל לבנות מוצר-מוצר בלי לגלות מחדש את הגלגל:

| שדה | משמעות |
|---|---|
| `role` | תפקיד המחלקה (למשל: Keyword-Researcher, Writer, Editor, Technical-SEO) |
| `input` | ה-context הממוקד **בלבד** שהתפקיד צריך (לא כל ההיסטוריה — context קטן = reasoning נקי) |
| `reasoning` | קריאת-מודל עצמאית משלו; חושב לבד, לא חולק prompt עם אחרים |
| `tools` | ארגז-כלים ממוקד לתפקיד |
| `memory` | קורא/כותב ל-CRM המשותף (הזיכרון הארוך) + scratch מקומי למשימה |
| `handoff` | מה הוא מעביר לתפקיד הבא (schema מובנה, לא טקסט חופשי) |
| `autonomy` | כפוף למתג advisor→approve→autopilot per-action ([[autonomy-switch-program]]) |

### 4 סוגי-תפקידים שחוזרים בכל מחלקה (ה-archetypes)
1. **Researcher/Scout** — אוסף context, מגלה עובדות. בלי דעה, רק אמת-שטח.
2. **Maker/Doer** — מייצר את הפלט (טקסט/תיקון/הודעה/החלטה).
3. **Critic/Adversary** — תפקידו **לתקוף** את הפלט של ה-Maker (למצוא באגים/חולשות/סתירות). **זה החלק שהופך את זה מ-pipeline ל-צוות שחושב.** ברירת-מחדל: סקפטי.
4. **Department Chief (הצ'יף-הקטן)** — מתזמר את השלושה, מחליט fast/team, מחזיק את היעד, עושה merge סופי. **זה גם ה-single interface היחיד כלפי HELIX CHIEF** (כלל הגבול למעלה).

### מה זה **לא**
- לא pipeline של פרומפטים תחת קריאה אחת (זה ה-Rank של היום).
- לא "system-prompt שאומר לו אתה גם X גם Y" (זה Growth-Doctor/OPS של היום).
- כן: N קריאות-מודל עצמאיות, כל אחת עם context משלה, שלפעמים **חולקות על הפלט אחת של השנייה**.

### תקציב (למה hybrid חובה)
צוות אייג'נטים = יקר+איטי. לכן ה-fast-path קיים, ולכן ה-team-path נשמר למשימות שבאמת מצדיקות אותו. כל מחלקה תגדיר מפורשות **מתי** עוברים ל-team-path.

### תבנית מימוש אחידה (הכל בונים ככה)
```
lib/agents/<product>/
  contract.ts        // ה-Agent Contract המשותף (טיפוסים)
  department-chief.ts// הצ'יף-הקטן: מחליט fast/team, מתזמר, merge, ה-interface היחיד ל-CHIEF
  roles/
    researcher.ts    // role archetype 1
    maker.ts         // role archetype 2
    critic.ts        // role archetype 3 (אדוורסרי)
  memory.ts          // גשר ל-CRM המשותף
```

---

## 5. Stand-alone מול ביחד
- **Stand-alone:** לקוח קונה רק את ה-Marketing Agent → עובד לבד, מרחיב את ה-CRM עם פייפליין שיווק בלבד.
- **ביחד:** לקוח עם כמה agents → CHIEF מתזמר; סיגנל מ-Meeting Agent (buying-intent) → מפעיל Outreach Agent → מעדכן CRM → מוצג ב-Dashboards. **זה הלופ שאין למתחרים בודדים.**

---

## 6. מוט מול Symphony (לזכור בבנייה)
עברית/RTL-first · WhatsApp-native · **לא כבול ל-website-builder** (stand-alone) · on-prem/פרטיות · אוטונומיה גרגרית per-action · CRM חינם ועצמאי. (פירוט: [[HELIX-ECOSYSTEM-VS-WIX-SYMPHONY]] §5.)

---

## 7. מפת דרכים
- **P0:** לחשוף את המוצרים הקיימים (SDR/OPS/Rank/Meeting) כ-**agents** עם ממשק אחיד (agent contract: input, actions, entitlement, autonomy-hooks).
- **P0b (§4b — מחלקה פנימית):** לבנות מוצר-מוצר את **צוות-האייג'נטים הפנימי** לפי החוזה האחיד, ואחרי כל מוצר לעדכן גם את דף-המוצר שלו. סדר מוצע: **Rank** (הכי בשל — כבר מדבר על 6 מומחים) → **Growth-Doctor** → **OPS** → **SDR** → **SHOP**.
- **P1:** **HELIX CHIEF** MVP — שיחה + דיספָּטץ' ל-2-3 agents קיימים, על ה-CRM.
- **P2:** לפרמל **Research Agent** + להרחיב **External/Connectors**.
- **P3:** לבנות **Finance Agent** (חשבוניות/גבייה, סינרגיה Sign&Forms) ו-**Design Agent**.
- **P4:** **Custom Agent framework** — לקוח מגדיר agent על הלוגיקה שלו.
- **P5:** דף שיווקי **HELIX ECOSYSTEM** — "צוות סוכני-AI לעסק הישראלי", CHIEF במרכז. (ה-TODO של המשתמש.)

---

## מקורות
- [symphony-wix-agents](https://www.wix.com/blog/symphony-wix-agents) · [best-symphony-features](https://www.wix.com/blog/best-symphony-wix-features) · [business-automation](https://www.wix.com/blog/symphony-wix-business-automation) · [what-is-symphony](https://www.wix.com/blog/what-is-symphony-by-wix)
