# HELIX CRM — SPEC (CRM חינמי לעסקים וסטארטאפים)

מסמך אפיון. מבוסס על: הכללת ה-CRM הקיים של PLUG (מודול `clients`) + מתודולוגיית HubSpot (מחקר 06.08.2026). עודכן: 2026-08-06.

## 1. חזון בשורה
CRM חינמי, HubSpot-shaped, לעסקים ולסטארטאפים ישראלים. **הרשמה רק דרך STAGE**, גישה מהאיזור האישי, **כל כלי HELIX מתחבר אליו**, ו-**API פשוט ומאובטח** לכלים חיצוניים.

## 2. מתודולוגיית HubSpot שאנחנו מאמצים (מבוסס-ראיות)
- **4 אובייקטים:** Contacts · Companies · Deals · Tickets. + Properties (שדות) + **Associations** דו-כיווניות עם **labels** (מקבל-החלטה/champion/מעריך).
  [knowledge.hubspot.com/records/understand-objects]
- **Lifecycle stages** (על contact/company): Subscriber → Lead → MQL → SQL → **Opportunity** (משויך לעסקה) → **Customer** (עסקה סגורה) → Evangelist. "Lead Status" = פירוט MQL/SQL; **Deal pipeline** = פירוט ה-Opportunity. הרבה SMB מדלגים על SQL.
  [knowledge.hubspot.com/records/use-lifecycle-stages]
- **Flywheel** (במקום funnel): Attract → Engage → Delight — הלקוח במרכז, מייצר מומנטום.
- **Freemium:** CRM חינם כשער; מונטיזציה דרך שכבות מתקדמות (אוטומציה/דיווח). מגבלות free ל-HubSpot: 1,000 אנשי-קשר, 2 משתמשים, pipeline אחד, 10 שדות מותאמים.
  [hubspot.com/products/crm · spotdev.co.uk/blog/is-hubspot-free]

## 3. מודל הנתונים הסופי (פורט מ-PLUG + התאמות + חדש)
**נשמר מ-PLUG (rename `recruiter_id`→`owner_id`):**
- `companies` — name, description, industry, size, website, logo_url, metadata, **lifecycle_stage**, owner_id
- `contacts` (מ-`client_contacts`) — full_name, role_title, email, phone, linkedin_url, notes, is_primary, company_id, **lifecycle_stage**, **lead_status**, source, owner_id, custom (jsonb)
- `activities` (מ-`client_timeline`) — parent (company/contact/deal), type (email/call/meeting/note/…), title, description, metadata, occurred_at, owner_id
- `tasks` (מ-`client_tasks`) — parent, title, priority, status, due_date, owner_id
- `reminders` (מ-`client_reminders`) — parent, remind_at, type
- `documents` (מ-`client_vault`) — parent, file, category

**חדש (הליבה החסרה):**
- `deals` — company_id, primary_contact_id, title, value, currency, pipeline, **stage**, close_date, status (open/won/lost), source, owner_id
- `deal_contacts` — deal_id, contact_id, **role** (decision_maker/champion/evaluator/…) — Associations עם labels
- `api_keys` — owner_id, key_hash, name, **scopes[]**, last_used, created_at, revoked

**מוסר (מוטה-גיוס):** `client_contact_projects`(→jobs), VacancyCalculator, PlacementRevenue, SLAMonitor. reframe: recruiter→owner · placement→won · job→deal · candidate→(יורד).

**Pipeline דיפולט (SMB-simplified):** ליד → מוסמך → פגישה → הצעה → מו״מ → נסגר-זכה / נסגר-הפסד. (ניתן להתאמה.)

## 4. ארכיטקטורה
- **הרשמה רק דרך STAGE** — ל-CRM אין signup עצמאי. כניסה = STAGE OAuth (Google/LinkedIn). בכניסה ראשונה מוקצה workspace CRM.
- **גישה מהאיזור האישי** (my.helix.co.il / Account Portal) — ה-CRM מודול שם. ([[helix-account-portal]])
- **כל הכלים מתחברים:** STAGE waitlist → contact (lifecycle=lead) · SDR enrichment → שדות contact · OPS engagement → activity · Rank/Dashboards → CRM. פנימי: אותו Supabase / service token.
- **בידוד:** RLS לפי owner_id בכל טבלה.

## 5. ה-API המאוחד המאובטח
- **REST:** `/api/v1/crm/{contacts,companies,deals,activities}` — CRUD + upsert.
- **אימות:** `Authorization: Bearer <api_key>` — מפתח **per-workspace**, נשמר כ-hash בלבד (`api_keys.key_hash`).
- **Scopes:** קריאה/כתיבה per-object (למשל `contacts:read`, `deals:write`).
- **אבטחה:** HTTPS-only, rate-limit per key, revocable, ניהול מפתחות מהאיזור האישי, לוג `last_used`.
- **מטרה:** מי שכבר יש לו כלים ורוצה להשתמש רק בחלק מ-HELIX — מחבר בקלות ובבטחה.
- Webhooks (שלב 2): event → URL של הלקוח (contact.created, deal.stage_changed).

## 6. מה חשוב ב-CRM לסטארטאפ (ומה להימנע)
**חובה:** contacts+companies, **deals pipeline** עם שלבים, **activity timeline** (כל נגיעה), **tasks+reminders** (פולואפ — מה שמייסדים הכי מפספסים), **לכידת לידים** (waitlist/טופס→contact), email-tracking (יש ב-STAGE!), lead scoring/סגמנטים, reporting (ערך pipeline, המרה), quick-add, **API/אינטגרציות**.
**להימנע (anti-patterns מסקיל המכירות):** vanity pipeline (עסקאות-זומבי), happy-ears, single-threaded deals, sandbagged forecasts, discounting addiction. **פשטות מעל הכל** — SMB לא צריך את המורכבות של Salesforce.

## 7. תוכנית בנייה מדורגת
- **Phase 1 — פורט הליבה:** העתקת companies/contacts/activities/tasks/reminders/documents (owner_id) + הסרת רכיבי-גיוס + reframe. איפה: STAGE (או shared).
- **Phase 2 — Deals pipeline:** טבלת deals + deal_contacts + תצוגת Kanban + דף עסקה.
- **Phase 3 — לכידת לידים:** waitlist/טופס → contact (lifecycle=lead) + import.
- **Phase 4 — API + מפתחות:** `api_keys` + endpoints + scopes + ניהול מהפורטל.
- **Phase 5 — אינטגרציות פנימיות:** SDR/OPS/STAGE דוחפים ל-CRM.

## מקורות (HubSpot)
- knowledge.hubspot.com/records/understand-objects · use-lifecycle-stages
- hubspot.com/products/crm · developers.hubspot.com/docs/guides/crm/understanding-the-crm
- spotdev.co.uk/blog/is-hubspot-free
