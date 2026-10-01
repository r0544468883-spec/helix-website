# הוראות לערן, חיבור לידים מהאתר ל-CRM (POLICYHUB)

כל ליד שמגיע מהאתר השיווקי (דף המתנה /matana, קהילת הפרגונים, כלים חינמיים,
סדנאות, אבחון AI) צריך להיכתב ישירות ל-`crm_contacts` של ה-CRM שלנו
(פרויקט Supabase `rymrafskckljgirrejqu`, סביבת העבודה HELIX).

הקוד כבר מוכן ונבדק מקצה-לקצה מקומית (ליד נכנס ל-crm_contacts עם source + כל
הפרטים). ב-`apphosting.yaml` כבר הוספתי 3 מתוך 4 המשתנים (ערכים לא-סודיים).
**נשאר לך רק להזין את המפתח הסודי ולפרוס.**

## 1. להזין את ה-service key כ-secret
המפתח הוא ה-Secret key החדש של פרויקט ה-CRM (Supabase → Settings → API →
"Publishable and secret API keys" → Secret keys → default):

```
firebase apphosting:secrets:set CRM_SUPABASE_SERVICE_KEY --project helix-fc9de
# כשיבקש ערך, הדבק את ה-Secret key (sb_secret_...) מ-Supabase של POLICYHUB:
# Project Settings → API → "Publishable and secret API keys" → Secret keys → default → Reveal
# (המפתח עצמו נשמר ב-helix/.env.local המקומי, מחוץ ל-git. אל תשים אותו כאן.)

firebase apphosting:secrets:grantaccess CRM_SUPABASE_SERVICE_KEY --project helix-fc9de --backend helix-website
```

> כבר קיים ב-apphosting.yaml:
> `CRM_SUPABASE_URL=https://rymrafskckljgirrejqu.supabase.co`,
> `CRM_LEADS_OWNER_ID=2de45d00-59cc-48fd-971d-47cf7d5e5cfd` (רון),
> `CRM_LEADS_WORKSPACE_ID=f8cde5b4-2c25-4948-91b6-18c9a08bf3ce` (HELIX).
> צריך רק את ה-secret למעלה.

## 2. (רשות, לסינון לפי קמפיין) מיגרציה ב-POLICYHUB
רק אם רוצים לסנן/לבנות אוטומציות לפי שדות הקמפיין. ב-SQL Editor של פרויקט
ה-CRM הדבק את התוכן של `helix-crm/supabase/migration-source-data.sql` ו-Run.
בלי זה הלידים עדיין נכנסים (הפרטים נשמרים ב-notes), רק בלי העמודה המובנית.

## 3. לפרוס
ודא ש-`apphosting.yaml` המעודכן נמצא ב-worktree, ואז:
```
firebase deploy --only apphosting:helix-website --project helix-fc9de --force
```

## בדיקה אחרי פריסה
שלח ליד דרך הטופס ב-/matana באתר החי, וודא שנוצר איש קשר חדש ב-CRM עם
`source = matana`. זהו.
