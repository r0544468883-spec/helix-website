# איזור אישי ללקוחות (/portal) — הקמה

גישה בקוד בלבד (בלי מייל). Supabase (REST + Storage), יושב על אותה תשתית של הלידים.
קוד -> אימות בצד שרת -> cookie חתום -> רשימת קבצים עם קישורי הורדה חתומים לשעה.

## הקבצים בקוד
- `lib/portal.ts` — אימות קוד, רשימת קבצים, חתימת session (server-only).
- `app/api/portal/route.ts` — POST כניסה · GET שחזור session · DELETE יציאה · rate-limit.
- `app/portal/page.tsx` + `PortalClient.tsx` + `portal.css` — העמוד וה-UI (RTL, מובייל, מצבי טעינה/שגיאה/ריק).
- `docs/portal.sql` — טבלה + bucket.
- `scripts/portal-hash.mjs` — הפקת hash לזריעת לקוח.

## שלב 1 — שני secrets (פעם אחת)
```bash
firebase apphosting:secrets:set PORTAL_CODE_SALT --project helix-fc9de
firebase apphosting:secrets:grantaccess PORTAL_CODE_SALT --project helix-fc9de --backend helix-website
firebase apphosting:secrets:set PORTAL_SESSION_SECRET --project helix-fc9de
firebase apphosting:secrets:grantaccess PORTAL_SESSION_SECRET --project helix-fc9de --backend helix-website
```
ואז להוסיף ל-`apphosting.yaml` תחת `env:` (RUNTIME; secret, לא value):
```yaml
  - variable: PORTAL_CODE_SALT
    secret: PORTAL_CODE_SALT
    availability: [RUNTIME]
  - variable: PORTAL_SESSION_SECRET
    secret: PORTAL_SESSION_SECRET
    availability: [RUNTIME]
```
(הפורטל יושב על POLICYHUB, אז CRM_SUPABASE_URL + CRM_SUPABASE_SERVICE_KEY כבר
מוגדרים — אין secret חדש ל-DB. רק שני ה-PORTAL_ שלמעלה חדשים.)
⚠ בלי grantaccess זו תקלת boot, לא undefined שקט.

## שלב 2 — טבלה + bucket (בפרויקט POLICYHUB: rymrafskckljgirrejqu)
להריץ את `docs/portal.sql` ב-SQL Editor של פרויקט ה-CRM (POLICYHUB), לא `supabase db push`.
זה יוצר את `portal_clients` (RLS חסום, עם crm_contact_id לקישור) ואת ה-bucket הפרטי `client-files`.

## שלב 3 — זריעת לקוח
```bash
PORTAL_CODE_SALT="<אותו ערך מ-Secret Manager>" \
  node scripts/portal-hash.mjs YOSSI-7X2Q brilliant-loan "משרד הייעוץ של יוסי ראובן"
```
הסקריפט מדפיס את ה-hash ואת ה-SQL של ה-insert. מריצים את ה-insert בדאשבורד.

## שלב 4 — העלאת קבצים
ל-bucket `client-files`, תחת תיקייה בשם ה-slug, **שטוח** (בלי תת-תיקיות):
```
client-files/brilliant-loan/madrich-mashkanta-rishona.docx
client-files/brilliant-loan/madrich-mashkanta-rishona.html
client-files/brilliant-loan/michzur-mashkanta.docx
...
```
(הקבצים עצמם: `helix/לקוחות/brilliant-loan/docx|html/`.)

## שלב 5 — בדיקה
`/portal` -> מקלידים `YOSSI-7X2Q` -> רואים את הקבצים -> הורדה. רענון דף שומר גישה (cookie).

## אבטחה (מה יש ומה אין)
- הקוד נשמר כ-hash (sha256 עם salt), לא גלוי. האימות והחתימה בצד שרת עם service key בלבד.
- קישורי הורדה חתומים ופגים אחרי שעה. ה-bucket פרטי.
- rate-limit: 8 נסיונות ל-10 דק' לכל IP (בזיכרון, per-instance — מספיק ל-MVP).
- מתאים לקבצים **לא רגישים** (התוצרים מיועדים להתפרסם ממילא). לפני שמחזיקים כאן חומר רגיש, לשדרג להתחברות אמיתית ([[helix-account-portal]]).
