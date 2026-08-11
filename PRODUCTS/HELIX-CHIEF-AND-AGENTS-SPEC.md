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

## 5. Stand-alone מול ביחד
- **Stand-alone:** לקוח קונה רק את ה-Marketing Agent → עובד לבד, מרחיב את ה-CRM עם פייפליין שיווק בלבד.
- **ביחד:** לקוח עם כמה agents → CHIEF מתזמר; סיגנל מ-Meeting Agent (buying-intent) → מפעיל Outreach Agent → מעדכן CRM → מוצג ב-Dashboards. **זה הלופ שאין למתחרים בודדים.**

---

## 6. מוט מול Symphony (לזכור בבנייה)
עברית/RTL-first · WhatsApp-native · **לא כבול ל-website-builder** (stand-alone) · on-prem/פרטיות · אוטונומיה גרגרית per-action · CRM חינם ועצמאי. (פירוט: [[HELIX-ECOSYSTEM-VS-WIX-SYMPHONY]] §5.)

---

## 7. מפת דרכים
- **P0:** לחשוף את המוצרים הקיימים (SDR/OPS/Rank/Meeting) כ-**agents** עם ממשק אחיד (agent contract: input, actions, entitlement, autonomy-hooks).
- **P1:** **HELIX CHIEF** MVP — שיחה + דיספָּטץ' ל-2-3 agents קיימים, על ה-CRM.
- **P2:** לפרמל **Research Agent** + להרחיב **External/Connectors**.
- **P3:** לבנות **Finance Agent** (חשבוניות/גבייה, סינרגיה Sign&Forms) ו-**Design Agent**.
- **P4:** **Custom Agent framework** — לקוח מגדיר agent על הלוגיקה שלו.
- **P5:** דף שיווקי **HELIX ECOSYSTEM** — "צוות סוכני-AI לעסק הישראלי", CHIEF במרכז. (ה-TODO של המשתמש.)

---

## מקורות
- [symphony-wix-agents](https://www.wix.com/blog/symphony-wix-agents) · [best-symphony-features](https://www.wix.com/blog/best-symphony-wix-features) · [business-automation](https://www.wix.com/blog/symphony-wix-business-automation) · [what-is-symphony](https://www.wix.com/blog/what-is-symphony-by-wix)
