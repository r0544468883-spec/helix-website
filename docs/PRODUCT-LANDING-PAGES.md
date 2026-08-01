# HELIX Software — Product Landing Page Playbook

**מטרה:** מדריך אחד ואחיד לבניית דף נחיתה לכל אחת מ-8 תוכנות HELIX (OPS, SDR, RANK, DASHBOARDS, SIGN, REPUTATION, ASSISTANT, GROWTH DOCTOR). כל דף מוכר מוצר אחד, נראה יוקרתי (Linear/Vercel/Spline level), ושומר על אחידות מוחלטת בין המוצרים — עם אקסנט צבע ייחודי לכל אחד.

> קרא לצד זה: `docs/SYSTEM-MOCKUPS.md` (שפת המוקאפים), `EFFECTS.md` (מערכת העיצוב של האתר), `docs/SERVICE-PAGES.md` (שלד 17 הסקשנים של דפי שירות).

---

## 1. איפה הדפים חיים
- **ייצור (production):** `app/products/<slug>/page.tsx` → `<XPageClient/>` (Next.js, React). זה מה שעולה לאתר.
- **תצוגה מקדימה / פיתוח מהיר:** `public/_mock/landing-<slug>.html` — HTML עצמאי, נצפה ב-`localhost:3000/_mock/landing-<slug>.html`. **בונים ומכווננים כאן קודם**, ואחרי אישור מפורטים ל-Next.js.
- **נכסים מוכנים:** צילומי המערכות ב-`product-demos/<slug>-1..5.jpg` + `public/_mock/shots/` (מוגש חי) + `PRODUCTS/HELIX SOFTWARES DEMOS/` (ארכיון עם שמות בעברית).
- **מקור הקופי:** `PRODUCTS/0X-*.md` (ספק לכל מוצר).

## 2. מיפוי מוצר → סלאג → אקסנט
| מוצר | slug (מוקאפ/דף) | אקסנט `--ac` | עולם |
|------|------|------|------|
| HELIX OPS | `marketing-ops` | `#A78BFA` סגול | יצירה/תוכן |
| HELIX SDR | `sdr` | `#38BDF8` תכלת | outbound |
| HELIX RANK | `geo` | `#FBBF24` זהב | דירוג/חיפוש |
| HELIX DASHBOARDS | `dashboards` | `#60A5FA` כחול | דאטה/BI |
| HELIX SIGN | `forms` | `#2DD4BF` טורקיז | אמון/מסמכים |
| HELIX REPUTATION | `reputation` | `#FB7185` ורוד | מוניטין |
| HELIX ASSISTANT | `assistant` | `#10B981` אמרלד | שיחה |
| HELIX GROWTH DOCTOR | `growth-doctor` | `#34D399` ירוק (+אדום דליפות) | בריאות/אבחון |

הבסיס הכהה זהה לכולם (מ-`SYSTEM-MOCKUPS.md`): canvas `#080A09/#101312`, ink `#E6E7E5`, אמרלד+ניאון כחתימת מותג. האקסנט הוא ~10% שנותן זהות.

## 3. מבנה הדף (סדר הסקשנים)
כל דף מורכב מהלבנים האלה, בסדר הזה:

1. **Hero תלת-מימדי** — אובייקט Three.js (גביש בצבע האקסנט + מעטפת wireframe ניאון + טבעת + חלקיקים + Bloom), מסך המערכת במסגרת דפדפן מרחף בפרספקטיבה 3D, כותרת-תובנה + תת-כותרת + CTA. (מתכון §5).
2. **Trust bar** — לוגואים/מספרים ("מאות עסקים", "9 ערוצים", דירוג).
3. **Pain / הבעיה** — 2-3 כאבים שהמוצר פותר, בטון של המותג.
4. **How it works** — 3 צעדים (טריגר → פעולה → תוצאה) עם אייקוני SVG.
5. **Showcase המסכים** — 5 המסכים של המוצר בקרוסלה עם פרספקטיבה 3D + זוהר, מתחלפים אוטומטית + thumbnails. (מתכון §6).
6. **פיצ׳רים לעומק** — כרטיסי **flip** (חובה בשני סקשני הכרטיסים, לפי חוק האתר — ראה `SERVICE-PAGES.md` §8-9).
7. **למי זה מתאים** — 3 פרסונות.
8. **תמחור / חבילה** — כרטיס מחיר + בונוסים.
9. **FAQ** — 5-6 שאלות (בלי אפקט עמעום-גלילה; ראה `feedback` על faq-list).
10. **CTA סופי** — חזרה ל-3D/זוהר + כפתור.

מותר לקצר לדף רזה (הירו + showcase + פיצ׳רים + מחיר + CTA) למוצר עם פחות קופי, אבל הסדר נשמר.

## 4. עקרונות קופי (מ-3 סקילי העיצוב)
- **כותרות = תובנה, לא תווית.** "142 פריטי תוכן פורסמו — 80% פחות תיאום", לא "לוח בקשות".
- **מוקד אחד לכל סקשן.** דבר אחד שהמשתמש צריך להבין/לעשות.
- היררכיה דרך **משקל+צבע**, לא רק גודל. מספרים ב-`tabular-nums`, Rubik למספרים גדולים.
- **אייקוני SVG בלבד** (Lucide sprite `_mock/icons.svg`) — אפס אימוג׳י כאייקון.
- 60% ניטרלי / 30% אמרלד / 10% אקסנט מוצר. אקסנט אחד עם כוונה.

## 5. מתכון ה-Hero התלת-מימדי (Three.js — חינם, קוד פתוח)
מקור עובד: `public/_mock/showcase-3d.html`.
- ספרייה: `three@0.160.0` דרך importmap (unpkg) בלוקאל; ב-production מתקינים `npm i three` ומייבאים כקומפוננטה.
- אובייקטים: `IcosahedronGeometry` (גביש, `MeshStandardMaterial` בצבע האקסנט, `emissive` על) + מעטפת `wireframe` בניאון + `TorusGeometry` (טבעת) + `Points` (חלקיקים).
- תאורה: `AmbientLight` עמום + 2× `PointLight` (ניאון + כחלחל).
- **Bloom** (זה ה"וואו"): `EffectComposer` + `RenderPass` + `UnrealBloomPass(strength≈.9, radius≈.6, threshold≈.2)`.
- הגביש בצבע `--ac` של המוצר. סיבוב איטי ב-`requestAnimationFrame`. `resize` handler.
- מעליו: מסך המערכת ב-`.frame` (מסגרת דפדפן: 3 נקודות + URL) עם `transform: rotateY(-19deg) rotateX(7deg)`, `box-shadow` עמוק.
- `prefers-reduced-motion`: לעצור סיבוב / להציג פריים סטטי.

## 6. מתכון showcase המסכים (CSS 3D — חינם)
מקור עובד: `public/_mock/showcase.html`.
- `perspective:2200px` על ה-stage; `.rig` עם `rotateY(-16deg) rotateX(6deg)` + פרלקס לפי העכבר (`mousemove`).
- מסגרת דפדפן + זוהר רדיאלי (`--ac`) מאחור (`filter:blur`) + השתקפות (`img` הפוך עם `mask-image` דועך).
- 5 המסכים מתחלפים ב-`setInterval` (~3.2s), thumbnails ללחיצה, מחליף `--ac` בין מוצרים.

## 7. ערכת אפקטים (הכל בקוד, אפס עלות)
| אפקט | איך | קובץ ייחוס |
|------|-----|-----------|
| פרספקטיבה 3D | `transform: perspective() rotateX/Y` | showcase.html |
| זוהר אמרלד | `radial-gradient` + `filter:blur` + `box-shadow` צבעוני | showcase.html |
| מסגרת דפדפן | bar עם 3 נקודות + URL pill | showcase*.html |
| השתקפות | `img scaleY(-1)` + `mask-image:linear-gradient` | showcase.html |
| אובייקט 3D אמיתי + Bloom | Three.js + UnrealBloomPass | showcase-3d.html |
| חלקיקים/ניצוצות | `THREE.Points` | showcase-3d.html |
| Grain/mesh רקע (אופציונלי) | Haikei/CSS grain | — |

**כלים חיצוניים חינמיים (לא חובה):** Three.js (בקוד), Blender, Womp, Vectary, Spline (מסלול חינם). אסטים 3D חינם: Shapefest, 3dicons.co, Poly Pizza. אנחנו מעדיפים **בקוד** לשליטה ואחידות.

## 8. נגישות ורספונסיביות
- קונטרסט טקסט 4.5:1; אקסנט-על-כהה מוסט ל-300/400.
- 44px יעדי מגע; ללא גלילה אופקית ב-375/768/1024/1440.
- מובייל: ה-Hero עובר לסטאק אנכי, הגביש קטן/מאחור, המסך מעל.
- `prefers-reduced-motion` מכובד בכל אנימציה.

## 9. Checklist לפני פרסום דף מוצר
- [ ] אקסנט נכון (`--ac`) לפי §2, עקבי בכל הדף.
- [ ] Hero 3D עם הגביש בצבע המוצר + Bloom.
- [ ] כל 5 המסכים ב-showcase, מתחלפים.
- [ ] שני סקשני הכרטיסים עם **flip**.
- [ ] כותרות-תובנה, אייקוני SVG, tabular-nums.
- [ ] קופי מ-`PRODUCTS/0X`.
- [ ] מתג בהיר/כהה (אם רלוונטי לדף) / לפחות כהה מלוטש.
- [ ] רספונסיבי 375→1440, ללא גלילה אופקית.
- [ ] נבדק חי ב-`localhost` ב-Playwright (דסקטופ+מובייל), אפס שגיאות קונסול.
- [ ] פורט ל-`app/products/<slug>` ונדחף ל-remote `vercel`.

## 10. תהליך העבודה
1. בנה `_mock/landing-<slug>.html` (HTML עצמאי) → כוונן חי מול המשתמש.
2. אישור → פורט ל-Next.js (`app/products/<slug>/XPageClient.tsx`), Three.js כקומפוננטה, תמונות ל-`public/`.
3. עדכן ניווט (`lib/site.ts`) ובדוק בנייה (`npm run build`).
4. דחוף ל-remote **`vercel`** (לא origin — ראה memory על helix remotes).
