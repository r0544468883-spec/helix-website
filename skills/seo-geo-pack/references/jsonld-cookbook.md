# JSON-LD Cookbook

Ready-to-adapt JSON-LD. Rules: serve in the INITIAL HTML (not JS-injected), keep entities identical to the visible page, use only real data (no fabricated `aggregateRating`), and combine multiple types on one URL with a single `@graph`. IL defaults: `+972` phone, `addressCountry: IL`, `priceCurrency: ILS`.

## Article / BlogPosting

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "כמה עולה בניית אתר לעסק קטן",
  "description": "מדריך מחירים 2026 לאתרי תדמית ואיקומרס בישראל.",
  "author": {
    "@type": "Person",
    "name": "רון קלי",
    "url": "https://example.co.il/about",
    "jobTitle": "מייסד HELIX"
  },
  "publisher": {
    "@type": "Organization",
    "name": "HELIX",
    "logo": { "@type": "ImageObject", "url": "https://example.co.il/logo.png" }
  },
  "datePublished": "2026-08-01",
  "dateModified": "2026-08-28",
  "image": "https://example.co.il/cover.jpg",
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://example.co.il/article/website-cost" }
}
```

## LocalBusiness (Israeli, Shabbat-aware, kosher)

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "מסעדת הדוגמה",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "רחוב יפו 42",
    "addressLocality": "ירושלים",
    "postalCode": "9100000",
    "addressCountry": "IL"
  },
  "telephone": "+972-2-123-4567",
  "priceRange": "₪₪",
  "geo": { "@type": "GeoCoordinates", "latitude": 31.78, "longitude": 35.21 },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Sunday","Monday","Tuesday","Wednesday","Thursday"], "opens": "09:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "09:00", "closes": "14:00" }
  ],
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "kosher", "value": "בד\"ץ" }
  ]
}
```

Saturday is simply omitted (closed). Never invent a Saturday block.

## Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "חבילת אתר תדמית",
  "image": "https://example.co.il/product.jpg",
  "description": "אתר תדמית מלא כולל SEO בסיסי.",
  "brand": { "@type": "Brand", "name": "HELIX" },
  "offers": {
    "@type": "Offer",
    "price": "4900",
    "priceCurrency": "ILS",
    "availability": "https://schema.org/InStock",
    "url": "https://example.co.il/product/website"
  }
}
```

Add `aggregateRating` / `review` ONLY when real reviews exist. Fabricated ratings are a spam-policy risk.

## FAQPage (AEO structure) and QAPage

FAQPage no longer produces Google FAQ rich results, but it is still a clean answer-first structure signal for AI extraction. Use QAPage only for genuine user-asked Q&A.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "כמה זמן לוקח לבנות אתר?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "אתר תדמית לוקח בדרך כלל 2-4 שבועות, לפי היקף התוכן. חנות איקומרס לוקחת 4-8 שבועות."
      }
    }
  ]
}
```

## HowTo

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "איך מגישים אתר ל-Google Search Console",
  "step": [
    { "@type": "HowToStep", "name": "אימות בעלות", "text": "הוסיפו רשומת DNS או תג meta." },
    { "@type": "HowToStep", "name": "הגשת sitemap", "text": "שלחו את /sitemap.xml בלשונית Sitemaps." }
  ]
}
```

## SpeakableSpecification (voice + AI extraction hint)

Attach to Article/WebPage to mark the passages best suited for spoken answers.

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".summary", ".faq-answer"]
  }
}
```

## Combined @graph (Organization + WebPage + Article + Breadcrumb)

One script tag, cross-referenced by `@id`. This is the preferred pattern for a real content page.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.co.il/#org",
      "name": "HELIX",
      "url": "https://example.co.il",
      "logo": "https://example.co.il/logo.png",
      "sameAs": [
        "https://www.linkedin.com/company/helix",
        "https://he.wikipedia.org/wiki/HELIX"
      ]
    },
    {
      "@type": "WebPage",
      "@id": "https://example.co.il/article/website-cost#page",
      "url": "https://example.co.il/article/website-cost",
      "inLanguage": "he-IL",
      "isPartOf": { "@id": "https://example.co.il/#org" }
    },
    {
      "@type": "Article",
      "headline": "כמה עולה בניית אתר לעסק קטן",
      "author": { "@type": "Person", "name": "רון קלי" },
      "publisher": { "@id": "https://example.co.il/#org" },
      "datePublished": "2026-08-01",
      "dateModified": "2026-08-28",
      "mainEntityOfPage": { "@id": "https://example.co.il/article/website-cost#page" }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "בית", "item": "https://example.co.il" },
        { "@type": "ListItem", "position": 2, "name": "מדריכים", "item": "https://example.co.il/articles" },
        { "@type": "ListItem", "position": 3, "name": "מחיר אתר" }
      ]
    }
  ]
}
```

Validate every block with Google Rich Results Test. Common IL failures: phone not `+972`, missing `addressCountry: IL`, currency not `ILS`.
