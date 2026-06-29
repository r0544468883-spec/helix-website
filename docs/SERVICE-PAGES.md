# HELIX — מבנה דפי שירות

## מבנה סטנדרטי (סדר הסקשנים)

כל דף שירות בנוי מאותו שלד, עם תוכן מותאם לכל חבילה:

```
1.  ServiceHero          — eyebrow + כותרת + subtitle + מחיר + לוטי בצד שמאל
2.  Narrative #1         — ScrollTextHighlight + סרטון כסף נשרף (burning-money.mp4) בצד שמאל
3.  PainSection          — 3 כרטיסי כאב ספציפיים לשירות
4.  Reviews              — ציטוטי לקוחות (MarketingReviews / WebsitesReviews)
5.  LeadForm (soft)      — טופס לידים קליל #1
6.  ToolMap/Constellation — מפת כלים גלקטית עם קווי חיבור מעוגלים + pulse
7.  Timeline             — שלבי תהליך העבודה (MarketingTimeline / WebsitesTimeline)
8.  Sub-Services Grid    — 6-8 כרטיסי שירות עם אייקון + כותרת + תיאור
9.  FeaturesSection      — "מה כלול" + 3 stats + 6 פיצ'רים
10. Narrative #2         — ScrollTextHighlight: "למה המחיר הזה? מה הקאץ'?"
11. ForWhoSection        — למי מתאים / למי לא
12. PackageCard          — כרטיס חבילה + לוטי מספריים (ScissorsLottie) בצד
13. LeadForm (strong)    — טופס לידים מלא #2
14. TrustBar             — בלי חוזה, ביטול, דמי הקמה, הנחה, מתנה
15. FAQ                  — 5-6 שאלות ספציפיות לשירות
16. LeadForm (soft)      — טופס לידים #3 (אחרי FAQ, לפני CTA)
17. FinalCTA             — CTA אחרון + "הילדים הטובים מחכים לשיחה"
```

---

## Hero

| פרופ | תיאור |
|------|-------|
| `eyebrow` | "חבילה 0X · שם השירות" |
| `title` | כותרת עם `<br/>` — 2 שורות מקסימום |
| `subtitle` | 2-3 משפטים, כולל "הילדים הטובים" |
| `marketPrice` | "8,000–15,000" (מה שהשוק גובה) |
| `price` | "1,250 ₪" |
| `priceNote` | "לחודש · בלי חוזה · ביטול בכל עת · בלי דמי הקמה" |
| `ctaHref` | WhatsApp link עם הודעה מותאמת |
| children | לוטי בצד שמאל (FunnelLottie / WebsitesHeroLottie) |

### לוטי Hero — כללים:
- מוצג בצד **שמאל** של הטקסט (grid 1fr 420px)
- `align-items: start` — מיושר לראש ה-Hero
- `margin-top: -20px` — צמוד למעלה
- רקע שקוף (transparent)
- צבעים: אמרלד HELIX בלבד (#10B981, #34D399)
- מקור: קבצי JSON מ-IconScout/LottieFiles (לא בנייה ידנית)
- כשצריך לצבוע: recolor script שמחליף RGB → emerald palette

---

## לוטי לכל דף

| דף | קובץ | מקור | תיאור |
|----|-------|------|-------|
| שיווק | `funnel.json` | IconScout (free filter) | משפך עם כדורים |
| שיווק | CSS animations | — | לבבות (heart.png) נופלים + מטבעות (coin.png) יוצאים מלמטה |
| אתרים | `websites-hero.json` | IconScout (adword-digital-marketing) | ילד+ילדה עם מסכים |
| אוטומציות | TBD | — | — |
| Growth | TBD | — | — |
| SDR | TBD | — | — |

### אנימציית לבבות/מטבעות (CSS — דף שיווק בלבד):
- `FunnelLottie.tsx` → wrapper עם `position: relative; overflow: visible`
- לבבות: 6 תמונות `heart.png` + `like.png` לסירוגין, animation `fall` (top→bottom, fade out)
- מטבעות: 3 תמונות `coin.png`, animation `rise` (center→bottom, fade out)
- CSS class: `.funnel-hearts img`, `.funnel-coins img`
- Timing: staggered (0s, 0.7s, 1.4s...), duration 2.5s-4s, infinite loop

---

## ToolMap / Constellation

כל דף שירות כולל מפת כלים גלקטית (`*Constellation.tsx`):

| דף | קומפוננט | כלים |
|----|----------|------|
| שיווק | `MarketingConstellation` | Google Ads, Meta, TikTok, SEO, GA4, HubSpot, Mailchimp, ChatGPT, Canva |
| אתרים | `WebsitesConstellation` | WordPress, Shopify, Figma, React, Next.js, Vercel, WooCommerce, Elementor |
| אוטומציות | TBD | Zapier, Make, n8n, HubSpot, WhatsApp API, Twilio |
| Growth | TBD | Hotjar, Mixpanel, Optimizely, Amplitude, ChatGPT |
| SDR | TBD | LinkedIn Sales Navigator, Apollo, Lemlist, HubSpot CRM |

### סגנון Constellation:
- קווים מעוגלים (`cubic-bezier` SVG paths), לא ישרים
- אפקט `pulse` ירוק כל 3 שניות על הקווים
- רקע שקוף (FloatingLogos נראים מאחורה)
- כרטיסי כלים: `background: rgba(16,185,129,0.04)`, border emerald subtle

---

## Narrative Blocks (ScrollTextHighlight)

כל דף כולל 2 בלוקי נרטיב:

### Narrative #1 — "בוא נגיד מה כולם חושבים"
- מיקום: אחרי Hero, לפני Pain
- תוכן: מתאר את הכאב של הלקוח בגוף ראשון
- מסיים עם `sp-narrative-highlight` — "הילדים הטובים עושים X ב-1,250 ₪"
- **סרטון כסף נשרף**: `burning-money.mp4` בצד שמאל של הטקסט
  - Layout: `sp-narrative-with-video` (grid 1fr 260px)
  - Video: `<video autoPlay loop muted playsInline className="sp-burn-video" />`
  - עיצוב: opacity 0.8, radial gradient mask (fade to edges), border-radius 16px
  - בלי סאונד (muted), לולאה אינסופית, autoplay
  - **חל על כל דפי השירות**

### Narrative #2 — "למה המחיר הזה?"
- מיקום: אחרי Features, לפני ForWho
- תוכן: "AI חתך 60% משעות העבודה. הילדים הטובים העבירו את החיסכון אליכם."

---

## "הילדים הטובים" — שזירה בטקסטים

הביטוי "הילדים הטובים של עולם הדיגיטל" משולב בכל סקשן:

- **Hero subtitle**: "אנחנו הילדים הטובים של עולם הדיגיטל"
- **Pain cards**: "הילדים הטובים לא עובדים ככה / לא נעלמים / מראים מספרים אמיתיים"
- **Narrative highlight**: "הילדים הטובים גובים החל מ-1,250 ₪"
- **Features lead**: "הילדים הטובים עושים ב-1,250 ₪ מה שסוכנות גובה 8,000+"
- **ForWho yes**: "מחפש את הילדים הטובים"
- **Final CTA**: "הילדים הטובים מחכים לשיחה"

**כלל**: לא יותר מ-6-7 פעמים בדף. לא בכל משפט.

---

## PackageCard + מספריים

כרטיס חבילה **זהה לדף הבית** — מיובא מ-`Services.tsx`, עם לוטי מספריים בצד:

```tsx
<div className="sp-package-with-scissors">
  <div style={{ maxWidth: 480, margin: '0 auto' }}>
    <PackageCard pkg={corePackages[INDEX]} />
  </div>
  <div className="sp-scissors-wrap" aria-hidden="true">
    <ScissorsLottie />
  </div>
</div>
```

### CSS `.sp-package-with-scissors`:
- `display: flex; align-items: center; gap: 32px; max-width: 680px`
- `.sp-scissors-wrap`: `width: 140px` (mobile: 100px)
- מספריים: `scissors-ticket.json` — לוטי ירוק, חותכות מחיר

מיובא מ-`Services.tsx`:
```tsx
import { PackageCard, corePackages } from '../../components/sections/Services';
<PackageCard pkg={corePackages[INDEX]} />
```

| דף | Index | שם חבילה |
|----|-------|----------|
| שיווק | 0 | שיווק דיגיטלי · Hands-on |
| אתרים | 1 | אתרים ואיקומרס |
| אוטומציות | 2 | אוטומציות |
| Growth | 3 | Growth Hacking |
| SDR | 4 | תהליכי מכירה אוטומטיים |

כולל: מה כלול ✓, מתנות 🎁, אדאונים (אפשר להוסיף ▲), scratch card (גרדו כדי לגלות 🎁)

---

## טפסי לידים (3 בכל דף)

כמו בדף הבית — 3 טפסי לידים בכל דף שירות:

| # | variant | מיקום | תפקיד |
|---|---------|-------|--------|
| 1 | `soft` | אחרי Reviews (סקשן 5) | לתפוס מי שכבר שוכנע מהכאב |
| 2 | (default/strong) | אחרי PackageCard (סקשן 13) | לתפוס מי שראה את החבילה |
| 3 | `soft` | אחרי FAQ (סקשן 16) | לתפוס מי שקרא הכל ועדיין מתלבט |

```tsx
<LeadForm variant="soft" />  // soft — קליל
<LeadForm />                  // strong — מלא
```

---

## סרטון כסף נשרף (burning-money.mp4)

- **קובץ**: `public/burning-money.mp4` (2.5MB)
- **מיקום**: Narrative #1 — בצד שמאל של הטקסט
- **חל על כל דפי השירות**

### CSS `.sp-burn-video`:
- `aspect-ratio: 9/16` (פורמט portrait)
- `object-fit: cover` — חותך למילוי מלא
- `opacity: 0.85`
- `border-radius: 16px`
- `mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)` — fade שקוף למעלה ולמטה
- `autoPlay loop muted playsInline` — בלי סאונד, לולאה, autoplay

### Layout `.sp-narrative-with-video`:
- `grid-template-columns: 1fr 320px` (desktop)
- `grid-template-columns: 1fr` (mobile — stacks)
- `max-width: 1020px`

---

## TrustBar

רשימת trust items בתחתית כל דף:

**משותף לכולם:**
- בלי חוזה
- ביטול בכל עת
- בלי דמי הקמה
- 20% הנחה לסטארטאפים ועסקים קטנים

**ספציפי לדף:**
- שיווק: "שיחת אסטרטגיה ראשונה חינם"
- אתרים: "שיחת אפיון ראשונה חינם", "תחזוקה כלולה"
- אוטומציות: TBD
- Growth: "אבחון צמיחה ראשוני חינם"
- SDR: "מיפוי ICP ראשוני חינם"

---

## FAQ

5-6 שאלות ספציפיות לכל שירות. מבנה:
```tsx
<FAQItem question="שאלה?">
  <p>תשובה ישירה. בלי bullshit.</p>
</FAQItem>
```

שאלות שחוזרות בכל דף (עם תשובות מותאמות):
1. כמה עולה?
2. למה המחיר נמוך / מה הקאץ'?
3. כמה זמן עד תוצאות?
4. מי עובד מולי?
5. מה קורה אם רוצה לבטל?
6. שאלה ספציפית לשירות

---

## אפקטים

| אפקט | קומפוננט | שימוש |
|-------|----------|-------|
| ScrollReveal | `ScrollReveal` | כניסה בסקרול (fade + slide up/down) |
| ScrollTextHighlight | `ScrollTextHighlight` | טקסט שמתגלה בסקרול (blur → clear) |
| Constellation pulse | CSS `@keyframes pulse-line` | קווי חיבור במפת כלים מהבהבים ירוק |
| Funnel hearts/coins | CSS `@keyframes fall/rise` | לבבות ומטבעות סביב המשפך |
| Stagger | `stagger + staggerDelay` | כרטיסים נכנסים אחד אחרי השני |
| Counter | FeaturesSection stats | מספרים שרצים מ-0 לערך |

---

## קבצי CSS

- `app/service-pages.css` — סגנונות sp-hero, sp-narrative, sp-services-grid, constellation
- `app/globals.css` — סגנונות כלליים (faq, lead-section, pk-card, why-card)

---

## קבצי קומפוננטים משותפים

```
app/components/service/
  ServiceHero.tsx        — Hero עם לוטי
  PainSection.tsx        — 3 כרטיסי כאב
  FeaturesSection.tsx    — 6 פיצ'רים + 3 stats
  ForWhoSection.tsx      — למי מתאים / לא
  TrustBar.tsx           — רצועת אמון
  FinalCTA.tsx           — CTA אחרון
  StickyPricing.tsx      — בר תחתון דביק (לא פעיל כרגע)

app/components/
  FunnelLottie.tsx       — לוטי משפך (fetch /funnel.json)
  WebsitesHeroLottie.tsx — לוטי בניית אתרים (fetch /websites-hero.json)
  MarketingConstellation.tsx  — מפת כלי שיווק
  WebsitesConstellation.tsx   — מפת כלי בניית אתרים
  ScrollReveal.tsx       — אנימציית כניסה בסקרול
  ScrollTextHighlight.tsx — טקסט שמתגלה בסקרול
  FAQItem.tsx            — אקורדיון שאלה/תשובה
  SectionHeader.tsx      — eyebrow + כותרת סקשן
  LeadForm.tsx           — טופס לידים (soft/strong variants)

app/services/marketing/
  MarketingPageClient.tsx — דף שיווק
  MarketingReviews.tsx    — ביקורות
  MarketingTimeline.tsx   — שלבי תהליך

app/services/websites/
  WebsitesPageClient.tsx  — דף אתרים
  WebsitesReviews.tsx     — ביקורות
  WebsitesTimeline.tsx    — שלבי תהליך
```

---

## צבעי מותג (Lottie + CSS)

| צבע | HEX | Lottie RGBA |
|-----|-----|-------------|
| Emerald | #10B981 | [0.0627, 0.7255, 0.5059, 1] |
| Light Emerald | #34D399 | [0.2039, 0.8275, 0.6, 1] |
| Dark Emerald | #065F46 | [0.024, 0.373, 0.275, 1] |
| Background | #121413 | — |
| Card surface | rgba(16,185,129,0.04) | — |

---

## דפים שנבנו / TBD

- ✅ שיווק דיגיטלי (`/services/marketing`)
- ✅ בניית אתרים (`/services/websites`)
- ⬜ אוטומציות (`/services/automation`)
- ⬜ Growth Hacking (`/services/growth`)
- ⬜ תהליכי מכירה אוטומטיים (`/services/sales`)
- ⬜ הכלים של HELIX (`/services/tools`)
- ⬜ בנק שעות פיתוח (`/services/development`)
