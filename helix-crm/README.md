# HELIX STAGE

הבמה של הסטארטאפים הישראלים — פלטפורמת השקות, הצבעות ופידבק. חלק ממשפחת HELIX.

מסמך האפיון המלא: `Desktop/helix/HELIX STAGE/אפיון HELIX STAGE.md`

## סטאק

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (טוקנים של מותג HELIX)
- Supabase — DB (Postgres), Auth (Google + LinkedIn), Storage (לוגואים)
- דו-לשוני: עברית (RTL, ברירת מחדל) ואנגלית — `/he/...` ו-`/en/...`
- יום השקות שבועי: יום שלישי (אפשר לשנות ב-`lib/launch-week.ts`)

## הקמה — 4 שלבים

### 1. Supabase

> **הפרויקט הנכון:** ה-CRM רץ על Supabase משלו — `rymrafskckljgirrejqu`.
> זה **לא** הפרויקט של אתר השיווק. לפני שמריצים SQL, לוודא שזה הפרויקט בכתובת.

1. נכנסים ל-[supabase.com](https://supabase.com) → New Project (או פרויקט קיים).
2. SQL Editor → New query → מריצים **לפי הסדר**. `schema.sql` לבדו הוא רק
   הבסיס הישן של STAGE ולא מספיק ל-CRM:
   1. `supabase/setup-all.sql` — בסיס + כל התוספות בבלוק אחד
   2. `supabase/migration-v10.sql` … `supabase/migration-v17-automations.sql` לפי הסדר
   3. `supabase/autonomy.sql`
   4. `supabase/pixel-schema.sql`
   5. `supabase/migration-v18-auth-hardening.sql` — הרשמה בהזמנה בלבד + סגירת RLS
3. בדיקה שהכל נחת בפרויקט הנכון:
   ```sql
   select count(*) from public.crm_contacts;   -- לא אמור להחזיר 404
   ```
4. Authentication → Providers:
   - מפעילים **Google** (צריך Client ID + Secret מ-Google Cloud Console).
   - מפעילים **LinkedIn (OIDC)** (צריך אפליקציה ב-LinkedIn Developers).
   - ב-Redirect URLs (Authentication → URL Configuration) מוסיפים:
     - `http://localhost:3000/auth/callback`
     - `https://crm.helix.co.il/auth/callback`
   - **Allow new users to sign up: להשאיר דלוק.** הדגל הזה חוסם יצירת
     משתמשים לגמרי, כולל OAuth — כלומר גם מוזמנים לגיטימיים לא היו נכנסים.
     האכיפה של "בהזמנה בלבד" היא בטריגר `public.handle_new_user` (v18),
     שדוחה כל מייל שאין לו שורה ב-`crm_invites` או ב-`auth_allowlist`.
     זה מה שתופס גם את מסלול ה-OAuth, ש-`shouldCreateUser:false` בטופס
     לא חל עליו.

### הזמנת משתמש

מהאפליקציה: `/he/dashboard/crm/team` (admin בלבד). `crmInviteMember` כותב
שורה ל-`crm_invites` **ואז** קורא ל-`inviteUserByEmail`, בסדר הזה — הטריגר
בודק מול הטבלה, אז הזמנה שנוצרת אחרי יצירת המשתמש תידחה.

הקמת המשתמש הראשון (אין עדיין admin שיזמין): `supabase/bootstrap-owner.sql`.
מריצים אותו, נכנסים, ומריצים אותו שוב — הריצה השנייה מדליקה את `is_admin`,
שלא ניתן לעדכון מצד הלקוח מ-v18.

### 2. משתני סביבה

```bash
cp .env.example .env.local
```

ממלאים מ-Supabase → Project Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. הרצה מקומית

```bash
npm install
npm run dev
```

פותחים http://localhost:3000 (מפנה אוטומטית ל-`/he`).

### 4. Vercel

1. דוחפים את הריפו ל-GitHub.
2. ב-Vercel: Add New Project → בוחרים את הריפו `helix-stage` (פרויקט נפרד מאתר HELIX).
3. מוסיפים את שלושת משתני הסביבה (עם `NEXT_PUBLIC_SITE_URL` = כתובת ה-Vercel).
4. Deploy. אחרי שיש כתובת — מעדכנים אותה גם ב-Redirect URLs של Supabase.

## מבנה הפרויקט

```
app/[locale]/              עמודים דו-לשוניים (he/en)
  page.tsx                 פיד ההשקות (עמוד הבית)
  products/[slug]/         עמוד מוצר: הצבעות, תגובות, waitlist
  submit/                  טופס השקת מוצר
  categories/              קטגוריות
  profile/[username]/      פרופיל משתמש
  login/ newsletter/ about/
app/auth/callback/         OAuth callback
app/actions.ts             Server Actions: הצבעה, תגובה, waitlist, יצירת מוצר
components/                Nav, LaunchCard, VoteButton, טפסים...
lib/i18n/                  מילוני עברית/אנגלית
lib/launch-week.ts         לוגיקת יום ההשקות השבועי
lib/supabase/              קליינטים ל-server/browser
supabase/schema.sql        הסכמה המלאה — מריצים פעם אחת ב-SQL Editor
```

## מה בשלבים הבאים (לפי האפיון)

- שלב 2: Build in Public, ערוץ Show IL, תגים ו-badges להטמעה
- שלב 3: ביקורות מאומתות (LinkedIn), אינדקס "חלופה ישראלית ל-X", השוואות
- ניוזלטר: חיבור Resend לשליחת דייג'סט שבועי (הרשמות כבר נשמרות ב-DB)
