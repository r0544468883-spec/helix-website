# HELIX — רשימת רעיונות למוצרים (Backlog)

מוצרים פוטנציאליים שעלו תוך כדי סקירת גיטים חיצוניים. לא מאושרים לבנייה — ממתינים להחלטה.

---

## 💡 רעיון: HELIX Support (Desk) — מבוסס Chatwoot

- **מקור**: `chatwoot-develop` (נשמר בתיקיית הגיטים שלנו)
- **License**: MIT ✅ (מותר white-label מלא)
- **מה זה**: פלטפורמת תמיכת-לקוחות open-source, אלטרנטיבה ל-Intercom/Zendesk/Salesforce Service Cloud.
- **Stack**: Ruby on Rails + Vue (זר ל-HELIX — יופעל כמוצר נפרד, חיבור דרך API/Supabase, לא שילוב-קוד ישיר).

### נכסים מוכנים
- **Omnichannel inbox** — WhatsApp / Telegram / Instagram / Facebook / Email / Live-chat / SMS.
- **Captain** — סוכן AI לתמיכה (אוטומציית תשובות, שאלות נפוצות). מתיישב עם ה-DNA של HELIX.
- **Help Center portal** — FAQ / KB (מודול מכיר).
- **CSAT + Reports** — Conversation / Agent / Inbox / Label / Team reports.

### נקודת חיבור ל-HELIX DASHBOARDS
דוחות ה-CS (CSAT, זמני תגובה, עומס-סוכנים) יכולים לזרום כ**מקור-נתונים לדשבורד "שירות לקוחות"** ב-HELIX DASHBOARDS.

### אזהרות
1. Stack זר (Rails+Vue) — להריץ כמוצר נפרד, לא לשלב בקוד.
2. מוצר-ענק, לא רכיב — אימוץ = התחייבות לתחזק פלטפורמת-תמיכה שלמה. שווה רק אם "HELIX Support" באמת בקטלוג.

**סטטוס**: רעיון שמור. לא מאושר לבנייה.

---

## 💡 רפרנס: תשתית email עצמית — QingChenMail (אם נצא מ-Resend)

- **מקור**: [`1186258278/QingChenMail`](https://github.com/1186258278/QingChenMail) — MIT.
- **מה זה**: מערכת EDM self-hosted עם **שרת-מייל משלה** — SMTP Relay + Direct Send + **DKIM/SPF אוטומטי** + subdomain isolation + IP rate-limiting + Let's Encrypt.
- **Stack**: Go + Gin + GORM + SQLite (זר — לא לקצירת-קוד).

### מתי רלוונטי
כרגע HELIX על **Resend** (managed sender — deliverability/DKIM/SPF מטופלים). QingChenMail רלוונטי **רק אם נצא מ-Resend**: הוזלת עלות ב-scale, או **on-prem/פרטיות** (קו Ollama). אז הוא **בלופרינט-deliverability מצוין** ללמוד ממנו (גם ב-Go).

**סטטוס**: רפרנס עתידי בלבד. לא לקצור עכשיו — חופף ל-email-sequences שכבר נקצר מ-claude-coach-kit (§2.75 במוצר 1).
