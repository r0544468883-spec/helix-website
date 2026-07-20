# HELIX DASHBOARDS — מפת שימוש-חוזר + ארכיטקטורת Connectors

מסמך-אב שמקצה לכל ריפו שנסקר תפקיד קונקרטי בבניית **HELIX DASHBOARDS** (מוצר 2). משלים את [02-roi-reporting-engine.md](02-roi-reporting-engine.md). נגזר מסקירת ~45 גיטים + חיפוש-לפי-נושא (יולי 2026). **עדיין לא בונים — זו התוכנית.**

> **עקרון רישוי (קריטי):** MIT/BSD/Apache = מותר קוד מסחרי/white-label. **AGPL = רעל** (Grafana/Metabase/Superset/OpenPanel — רפרנס בלבד). **Elastic v2 (Nango)** = מותר שימוש פנימי מסחרי, **אסור** להגיש כ-managed-service לאחרים.

---

## 1. שכבת UI — ליבת ה-Dashboard Builder (הפער מס' 1)
| רכיב | ריפו | רישיון | תפקיד |
|---|---|---|---|
| **Widget/Chart library** | tremorlabs/tremor-npm (16.5k★) | **MIT** ✅ | 35+ קומפוננטות KPI+charts על **recharts+Tailwind** — בדיוק ה-stack שלנו. ספריית ה-widgets המובנית (`widget_library`) |
| **Drag-drop canvas** | react-grid-layout/react-grid-layout | **MIT** ✅ | גרירה/שינוי-גודל/responsive + `onLayoutChange` → שמירת layout ל-`dashboard_widgets`. ה-canvas של ה-3-ways-builder |

**זהו הליבה:** Tremor (widgets) + react-grid-layout (canvas) = ~80% מה-builder בלי לכתוב מאפס. שניהם MIT, שניהם recharts/Tailwind/React.

## 2. תוכן per-מחלקה — מקורות לקצירה/רפרנס
| מחלקה | ריפו | רישיון | שימוש |
|---|---|---|---|
| **מכירות** ⭐ | marmelab/atomic-crm (1.1k★) | **MIT** ✅✅ | **React+shadcn/ui+Supabase+Kanban** — ה-stack המדויק. קציר: מודל pipeline/deals + Kanban → דשבורד Pipeline |
| **שיווק** | builderz-labs/marketing-dashboard | **MIT** ✅ | connectors GA4/Meta/Mailchimp/Plausible + recharts patterns (מקור-קצירה #1 ל-connectors) |
| **שיווק** | krishna-build/claude-coach-kit | **MIT** ✅ | **נקצר** → UTM attribution + email-sequences + payment (מוצר 1 §2.75) |
| **E-commerce** | NordcomInc/react-shopify-analytics | **MIT** ✅ | connector Shopify אמיתי (headless) — קציר ל-widget מכירות/AOV |
| **פיננסים** | gabedossantos/cash-flow | **MIT** ✅ | Next+TS+Prisma — cash-flow/forecast/KPIs. רפרנס-widgets פיננסי |
| **פיננסים** | actualbudget/actual | **MIT** ✅ | בוגר — רפרנס-UX (תקציב/קטגוריות). לא לאמץ שלם |
| **SaaS/הכנסות** | growth-metrics-dashboard (GMD) | לוודא | Stripe MRR/ARR/churn/CAC/LTV — רפרנס-widget SaaS |
| **שירות/CS** | chatwoot/chatwoot | **MIT** ✅ | Reports/CSAT → מזין דשבורד CS (וגם רעיון HELIX Support — IDEAS-BACKLOG) |
| **מוצר** | Openpanel-dev/openpanel | ⚠️ AGPL | funnels/retention/cohorts — **רפרנס בלבד** (AGPL), לא קוד |

## 3. שכבת Connectors — משיכת נתונים מ-SaaS חיצוני (הפער מס' 2)
הדשבורדים **חייבים למשוך** מ-GA4/Ads/Meta/CRM/הנהח"ש/Shopify/Support/תשלומים. רוב ה-templates לעיל נותנים UI+דאטה-משלהם, **לא** connectors. הפתרון — שילוב:

| שכבה | מקור | רישיון | תפקיד |
|---|---|---|---|
| **מנוע connectors ראשי** ⭐ | NangoHQ/nango (7.2k★) | ⚠️ **Elastic v2** | 800+ APIs — OAuth/refresh/proxy/functions מנוהלים, self-host, חושף MCP לסוכני HELIX. **הליבה של שכבת החיבורים** |
| **חלופת ETL נקייה** | meltano/meltano | **MIT** ✅ | Singer-based, אם נרצה נתיב-warehouse בלי מגבלת Elastic v2 |
| **SDKs רשמיים** | pipedrive/client-nodejs (+HubSpot/Salesforce/Xero/QuickBooks) | מתירני | חיבורים ספציפיים בלי תלות במנוע |
| **edge-functions שלנו** (כבר קיים) | helix-ops/helix-rank | — | GA4 (`lib/ga4`), Meta, Stripe (`payment-webhook`), Google-Sheet (`gsheet-webhook`), track-visitor |
| **הנהח"ש ישראלי** | GreenInvoice/חשבשבת/רווחית API | — | **אין OSS — נבנה edge-function ייעודי** (בול לשוק הישראלי) |

**אסטרטגיה:** Nango כמנוע-על ל-OAuth+800 APIs → ליפול ל-SDK רשמי/edge-function ל-connectors קריטיים (GA4/Meta/Stripe כבר בנויים) → הנהח"ש ישראלי = build ייעודי (הבידול המקומי).

## 3.5 מאיפה כל מספר מגיע — Data Lineage per-widget 🔑
**עיקרון-העל:** connector (Nango/edge-fn/SDK) מושך → **מנרמל** → כותב שורה ל-`metrics_cache` (Supabase). **ה-widget קורא רק מ-`metrics_cache`, לעולם לא מ-API ישירות.** כך הדשבורד מהיר, עובד offline מול cache, ומקור-אחד-לאמת. הרענון (Ollama+cron §0.3) מעדכן את ה-cache.

```
[SaaS חיצוני] → [Connector: Nango / edge-function / SDK] → [normalize] → [metrics_cache (Supabase)] → [Widget (Tremor)]
```

### מיפוי מלא — כל דשבורד → כל מדד → מקור הנתונים
| דשבורד | מדד | מאיפה הנתון (connector) | סטטוס מקור |
|---|---|---|---|
| **שיווק** | תנועה / top content | GA4 Data API | ✅ `lib/ga4` קיים |
| | ROAS / spend / CPL | Meta Ads API + Google Ads API | 🟡 builderz (Meta) + חדש (G-Ads) |
| | דיוור (open/click) | `mkt_email_log` (Resend) | ✅ נקצר (coach-kit) |
| | SEO / GEO | HELIX Rank (פנימי) | ✅ קיים |
| **מכירות** | deals / stages / conversion / forecast | CRM: HubSpot/Pipedrive (Nango/SDK) **או** atomic-crm native | 🟡 קציר atomic-crm + Nango |
| | leaderboard | אותו CRM | 🟡 |
| **פיננסים** | תזרים / הכנסות / הוצאות | GreenInvoice/חשבשבת/רווחית API | ❌ **edge-fn ייעודי (build)** |
| | **מע"מ** / AR aging | אותו מקור הנהח"ש | ❌ build (בידול ישראלי) |
| | burn / runway | הנהח"ש + Stripe balance | 🟡 Stripe קיים חלקית |
| **תפעול** | הזמנות / מלאי / משלוחים / SLA | ERP / חנות (Shopify/Woo/custom API) | 🟡 Shopify (shopify-analytics) |
| | ספקים | ERP | ❌ תלוי-לקוח |
| **שירות/CS** | tickets / זמן-תגובה / CSAT / NPS | Chatwoot API / Zendesk / Intercom (Nango) | 🟡 Chatwoot |
| | churn-risk | CS data + מודל | ❌ build |
| **HR** | headcount / attrition / time-to-hire | ATS + PLUG DB | ❌ **build** (אין OSS) |
| **מוצר** | DAU/MAU / adoption / funnels / retention | Mixpanel/Amplitude/PostHog/GA4 (Nango) | 🟡 GA4 קיים, שאר Nango |
| **E-commerce** | מכירות / AOV / נטישת-עגלה / top products | Shopify/Woo (react-shopify-analytics + Nango) | ✅ shopify-analytics |
| **מוניטין** | אזכורים / סנטימנט / Reputation Score | HELIX Shield: Google Business/Yelp/social + **Claude sentiment** | ❌ build (Shield) |
| **סטארטאפ/AARRR** | Acquisition→Revenue | GA4 + Mixpanel + CRM + Stripe (חוצה-מקורות) | 🟡 חלקי |
| **Executive** ⭐⭐ | מבט-על חוצה-מחלקות | **אגרגציה מ-`metrics_cache` של כל הדשבורדים** | ❌ **build (ה-moat)** |
| **כל דשבורד** | חיבור מוצרי HELIX | Rank/Shield/Ops/SDR מזרימים ל-`metrics_cache` | 🟡 מתהווה |

**קריאת המפה:** ✅=מקור בנוי · 🟡=OSS לקצור/Nango · ❌=נבנה מאפס. רוב ה-❌ מרוכזים ב**בידול הישראלי** (הנהח"ש/מע"מ) וב-**moat** (Executive/מוניטין/HR) — בדיוק מה שלא רוצים לקנות מבחוץ.

## 4. מה נבנה מאפס (אין OSS ראוי ב-stack שלנו)
- **HR/People** — כל ה-OSS הוא Power BI/Tableau/Streamlit. נבנה widgets: headcount/attrition/time-to-hire/diversity (מקור: ATS + PLUG).
- **מוניטין** — ה-sentiment שלנו (Claude/Haiku, עברית, רב-מחלקתי) **עדיף** על כל TF-IDF/LogReg OSS. נבנה מאפס על מנוע HELIX Shield.
- **Executive Overview (ה-moat)** — שכבת האגרגציה החוצה-מחלקתית. אין לזה מקור — זה הלב הייחודי של HELIX DASHBOARDS.
- **מנגנון 3-ways** (template / drag-drop / AI-recommend) על ספריית-widget אחת — הלוגיקה שלנו, מעל Tremor+grid.

## 5. מטריצת רישוי (סיכום)
| ✅ מותר קוד (MIT/BSD/Apache) | ⚠️ שימוש-מוגבל | ❌ רפרנס בלבד (AGPL) |
|---|---|---|
| Tremor · react-grid-layout · atomic-crm · builderz · coach-kit · shopify-analytics · cash-flow · Actual · Meltano · Chatwoot · Pipedrive SDK · Refine · danielbayerlein | **Nango (Elastic v2 — לא כ-service)** | OpenPanel · Grafana · Metabase · Superset · Redash(BSD✅ למעשה) · ToolJet |

## 6. סדר בנייה (MVP → מלא)
1. **ליבת UI** — Tremor widgets + react-grid-layout canvas + מודל `widget_library`/`dashboard_widgets` (Supabase). דשבורד ריק שאפשר לגרור אליו widgets.
2. **דשבורד ראשון end-to-end** — שיווק: חבר GA4 (edge-function קיים) + Meta (builderz) → 4 widgets אמיתיים. מוכיח את הצינור.
3. **מכירות** — קציר atomic-crm (pipeline/Kanban) → דשבורד Pipeline + connector CRM (Nango/Pipedrive SDK).
4. **Connectors scale** — הקמת Nango self-host כמנוע-על; הוספת Shopify/Stripe/תשלומים.
5. **פיננסים ישראלי** — edge-function GreenInvoice/חשבשבת (הבידול המקומי) → דשבורד Finance.
6. **3-ways builder** — template-gallery + AI-recommend מעל אותה ספריית-widget.
7. **Executive Overview** — שכבת אגרגציה חוצה-מחלקתית + נרטיב-AI עברי (baldiga) + מסירה רב-ערוצית (Ollama+WhatsApp/Telegram/email).

> **סיכום:** ~70% מ-HELIX DASHBOARDS מורכב מרכיבים MIT קיימים (UI: Tremor+grid · מכירות: atomic-crm · connectors: builderz+coach-kit+Nango+SDKs). ה-30% הייחודי שנבנה מאפס — **מנגנון 3-ways, הנהח"ש ישראלי, sentiment עברי, ו-Executive Overview** — הוא בדיוק ה-moat.
