# מדריכים חינם (Free-Guide series) — התבנית

כל המדריכים החינמיים של HELIX (`/guides/*`) בנויים על אותה תבנית: דף נחיתה אחיד עם טופס לכידת ליד והורדת PDF ממותג. המדריך על פרסום ב-ChatGPT הוא הראשון, והתבנית שלו היא התבנית לכולם.

## איך זה בנוי

| רכיב | קובץ | תפקיד |
|---|---|---|
| מקור אמת | `lib/guides.ts` | אובייקט `GuideConfig` לכל מדריך + metadata |
| דף גנרי | `app/guides/GuidePage.tsx` | הירו + טופס + "מה יש בפנים" + "מי אנחנו" |
| טופס | `app/guides/GuideLeadClient.tsx` | שם+תחום+מייל → `/api/content-lead` → הורדת PDF |
| עיצוב | `app/guides/guides.css` | סגנון משותף, נטען פעם אחת ב-`layout.tsx` |
| דף ספציפי | `app/guides/<slug>/page.tsx` | 3 שורות: metadata + `<GuidePage config={...} />` |
| רובריקה בתפריט | `lib/site.ts` → `NAV_GUIDES` | פריט "מדריכים חינם" |
| הורדת PDF | `next.config.mjs` → `DOWNLOAD_PDFS` | Content-Disposition + שם קובץ עברי |

## עקרונות (חובה, לא לשבור)

- **מסירה בהורדה ישירה**, לא במייל. הטופס מיידע את HELIX על הליד (Resend), אבל ה-PDF יורד ישירות. אין רצף מיילים, אין ספאם. (לכן אילוץ המייל האמיתי לא חוסם השקת מדריך.)
- **צילומי מסך אמיתיים בלבד** ב-PDF. לא ממוצאים. זה חוק.
- **הפקת PDF דרך helix-pptx** (pipeline של HTML→תמונה→PPTX/PDF). זה מה שפותר RTL עברית.
- **קישור לקהילה** בכל מדריך (כבר בתוך `GuidePage`).
- בלי קו מפריד ארוך (—) בשום טקסט.

## להוסיף מדריך חדש (5 שלבים)

1. **PDF**: הפקה דרך helix-pptx (רקע שחור-ירוק, לוגו, צילומי מסך אמיתיים, כפתור וואטסאפ לחיץ). שמירה ל-`public/guides/<slug>-guide.pdf` (+ אופציונלי `<slug>-cover.png`).
2. **Config**: הוספת אובייקט `GuideConfig` ל-`GUIDES` ב-`lib/guides.ts`.
3. **הורדה**: הוספת שורה ל-`DOWNLOAD_PDFS` ב-`next.config.mjs` (path + שם עברי).
4. **דף**: יצירת `app/guides/<slug>/page.tsx` (להעתיק מ-`chatgpt-ads`, לשנות את ה-slug ב-`getGuide`).
5. **תפריט**: הוספת פריט ל-`NAV_GUIDES` ב-`lib/site.ts`.

זהו. אין CSS חדש, אין רכיב חדש, רק config + PDF.

## בהמשך (לכל מדריך)
גרסה מוקלטת/מוסברת (וידאו/אודיו) של המדריך.
