# HELIX — הרשאות סוכנים (Agent Permissions) 🔐 (Spec + מקור-אמת)

> מגדיר, לכל סוכן בכל מוצר, **לאיזו מערכת חיצונית מותר לו לגעת, באיזה scope, ומאחורי איזה שער.** הכיוון: **גישה רחבה** (מודל "digital worker" של 11x/Relevance) — סוכן שבאמת מבצע מקצה-לקצה — אבל עם משמעת-הרשאות מובנית.
>
> תאריך: 2026-08-16 · לוויין ל-[[HELIX-CHIEF-AND-AGENTS-SPEC]] · [[autonomy-switch-program]] · [[intra-department-agents-architecture]]

---

## 1. מודל ההרשאות (חל על כולם)

**5 רמות-scope:**
| Scope | מה זה | שער |
|---|---|---|
| **READ** | משיכת מידע ממערכת חיצונית | פתוח (read-only, סיכון נמוך) |
| **WRITE-internal** | יצירה/עדכון ב-DB/CRM שלנו | write-back חובה לזיכרון המשותף |
| **SEND** | הודעה יוצאת בשם המשתמש (מייל/וואטסאפ/DM/SMS/קול) | 🚦 מתג-אוטונומיה + **מבקר** |
| **PUBLISH** | תוכן חי חיצוני (CMS/סושיאל) | 🚦 מתג + **מבקר** |
| **SPEND** | כסף (תקציב-מודעות/גבייה/תשלום) | 🚦 מתג + **מבקר** + סף-סכום→אדם |

**כללי-ברזל:**
1. **קריאה רחבה, כתיבה מגודרת.** כל READ פתוח לחוקרים/אנליסטים. כל SEND/PUBLISH/SPEND עובר מתג + מבקר ייעודי.
2. **קרדנציאלס לעולם לא ביד הסוכן — והסוד לעולם לא ב-context של המודל.** OAuth per-workspace, מוצפן; הקונקטור מזריק את ה-token ברמת ה-HTTP, **מחוץ לטקסט שהמודל רואה**. הסוד לא נכנס ל-prompt, ל-RAG או ללוגים — כדי שלא ידלוף בפלט/בשגיאה.
3. **Least-privilege-by-role, broad-by-need.** כל סוכן מקבל גישה **בדיוק** למערכות שתפקידו צריך — אבל אנחנו מגדירים אותן רחב.
4. **הפרדת חשיבה מביצוע.** הסוכן שמנסח ≠ הסוכן ששולח. השליחה תמיד בשכבת executor/channels נפרדת, מגודרת.
5. **הכל נרשם (audit).** כל גישה חיצונית מתועדת — לפי הסכימה ב-§3.5.
6. **Workspace-scoping ברמת ה-context, לא רק ה-credential.** כל קריאה/כתיבה נושאת `workspace_id` מאומת; ה-executor **מסרב לפעול** אם ה-target (רשומה/token/יעד) שייך ל-workspace אחר. מונע "wrong-client use" — סוכן שרץ בהקשר לקוח א' לא נוגע בנתוני/context של לקוח ב'.
7. **דאטה דלילה → אין ורדיקט.** כל מבקר/מסווג מחזיר confidence מפורש; מתחת לסף-מדגם הפלט הוא "אין מספיק מידע", לעולם לא מסקנה כפויה. חל במיוחד על SPEND ו-brand-safety.

**קטלוג המערכות החיצוניות (המלא):**
`Email(Gmail/Outlook)` · `Calendar(Google/Outlook)` · `LinkedIn` · `WhatsApp(Meta)` · `Telegram` · `SMS` · `Voice(Vapi/Retell)` · `Meta(FB/IG)` · `TikTok` · `YouTube` · `GMB` · `Google Ads` · `Meta Ads` · `Outbrain` · `CRM(HELIX/HubSpot/Salesforce/Pipedrive)` · `CMS(WordPress/Wix/Webflow)` · `Payment(Stripe)` · `Web-scrape(Firecrawl)` · `Analytics(GA4/GSC/Semrush/Ahrefs/Meta-Insights/Clarity/Stripe)` · `e-Sign` · `Slack/Teams` · `Shopify/Woo` · `Storage/DB(Supabase)`

סטטוס: ✅ בנוי · 🔵 מתוכנן

---

## 2. הרשאות פר-מוצר (סוכן × מערכת × scope × שער)

### 🤝 SDR / BDR — ה"digital worker" הרחב ביותר
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **עמנואל** (חוקר/העשרה) | Firecrawl✅, LinkedIn🔵, Semrush🔵, CRM(read)🔵 | READ | — |
| **ליה** (מאמת-מקור) | אותם מקורות✅ | READ | — |
| **אסטרטג / דן** (כתב) | LLM✅ | — | — |
| **מאיה** (עורכת) | LLM✅ | — | — |
| **בודק-Deliverability** | תשתית-מייל (spam-check)✅ | READ | — |
| **אלון** (מבקר-שליחה) | LLM✅ | — | — |
| **נעמי** (רכזת/Cadence) | Calendar(read+write)🔵, CRM(write)🔵 | WRITE-internal | write-back |
| **executor** (שליחה) | Email✅, WhatsApp✅, Telegram✅, Messenger✅, LinkedIn🔵, SMS🔵, Voice🔵 | **SEND** | 🚦 מתג + אלון |
| 🔵 **Deal-Reviewer / Proposal-Builder** | CRM(read/write), Payment(quote) | WRITE-internal | 🚦 לפרופוזל יוצא |

### 📣 OPS — הגישה הרחבה ביותר לכתיבה
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **עמנואל** (חוקר-הקשר/רדאר) | Meta/FB/IG(read)✅, LinkedIn(read)✅, web✅ | READ | — |
| **דן** (כותב-תוכן/תגובה) | LLM✅ | — | — |
| **אלון** (brand-safety+תקציב+DM) | LLM✅, Meta-Insights(read)✅ | READ | — |
| **מאיה** (עורכת) | LLM✅ | — | — |
| **distribution** (פרסום) | FB✅, IG✅, LinkedIn✅, YouTube✅, GMB✅, WordPress✅, Wix✅, Webflow✅, Email✅, WhatsApp✅, Telegram✅ | **SEND/PUBLISH** | 🚦 מתג + אלון(brand-safety) |
| **performance** (תקציב) | Meta Ads✅, Google Ads✅, TikTok🔵, Outbrain🔵 | **SPEND** | 🚦 מתג + מבקר-תקציב |
| 🔵 **נעמי** (מתזמן) | Scheduler(best-time) | READ | — |

### 🔎 Rank (SEO/GEO)
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **עמנואל** (חוקר) | GSC✅, GA4✅, Semrush✅, Ahrefs🔵, מנועי-AI(GEO)✅ | READ | — |
| **דן** (כתב) | LLM✅, gen-image✅ | READ | — |
| **אלון** (מבקר) + **מאיה** (עורכת) | LLM✅ | — | — |
| **publish** | WordPress✅, Wix✅, Webflow✅, webhook✅ | **PUBLISH** | 🚦 מתג + אלון |
| **bot** | WhatsApp✅, Telegram✅ | SEND(דייג'סט) | 🚦 מתג |
| 🔵 מקשר-פנימי / Schema / GEO-Citation | CMS(read/write) | WRITE | 🚦 |

### 📊 Dashboards
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **ליה** (אנליסטית) | GA4✅, Meta✅, Stripe✅, connectors נוספים✅ | READ | — |
| **דן** (מספר) + **אלון** (מבקר) + **מאיה** | LLM✅ | — | — |
| **bot** | WhatsApp✅, Telegram✅, Slack🔵, Teams🔵 | SEND(דייג'סט) | 🚦 מתג |

### 🩺 Growth Doctor
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **ליה** (אנליסטית) | Clarity/GA(התנהגות, read)✅ | READ | — |
| **דן** (כותב-תיקון) + **אלון** + **מאיה** | LLM✅ | — | — |
| **executor** | Landing/A-B(דרך OPS)🔵, WhatsApp(התראה)✅ | WRITE/SEND | 🚦 מתג + מבקר-ביצוע |

### 🎙️ Meeting
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **מתמלל** | ivrit-Whisper✅ | READ(אודיו) | — |
| **עמנואל** (מחלץ) + **דן** (כותב) + **אלון** (מאמת) | LLM✅ | — | — |
| **נעמי** (Actioner+Scheduler) | Calendar🔵, Calendly🔵, CRM(משימות/סיגנלים→SDR/OPS)🔵 | WRITE-internal | write-back |
| **executor** | Email(פולואפ) 🔵*(היום stub)* | **SEND** | 🚦 מתג + אלון |

### 🛍️ SHOP
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **עמנואל** (מומחה-מוצר) | Shopify/Woo(קטלוג)🔵, Supabase✅, RAG✅ | READ | — |
| **דן** (מוכר) | LLM✅, tools(מלאי/עגלה)✅ | READ/WRITE-internal | — |
| **אלון** (fact-guard) | LLM✅ | — | — |
| **channels** | Site-chat✅, WhatsApp🔵, IG🔵, Messenger🔵 | **SEND** | 🚦 מתג + אלון |
| 🔵 נציג-שירות / משחזר-עגלה | Order-system, Payment(Stripe) | READ/SEND | 🚦 |

### ✍️ Sign-Forms
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **עמנואל** (מנתח) + **דן** (מנסח) + **אלון** (מבקר) + **מאיה** | LLM✅ | — | — |
| **חתימה/תשלום** | e-Sign✅, Payment(Stripe)✅, Email/SMS(OTP+doc)✅ | SEND/SPEND | 🚦 מתג + אישור-אנושי |

### 💸 COLLECT (13, מתוכנן)
| סוכן | מערכות | scope | שער |
|---|---|---|---|
| **עמנואל** (Skip-trace) | מקורות-נתונים, CRM(חוב, read) | READ | — |
| **נעמי** (מתעדף) | CRM(read) | READ | — |
| **דן** (מנהל-מו"מ) | LLM | — | — |
| **אלון** (מבקר-ציות) | LLM | — | — |
| **ליה** (גלאי-מצוקה) | LLM(sentiment) | — | — |
| **executor** | WhatsApp, Email, SMS, **Voice** | **SEND** | 🚦🚦 מתג + מבקר-ציות + סף→אדם |
| **גובה-תשלום** | Payment(Stripe), Sign-Forms(פריסה) | **SPEND/collect** | 🚦 אישור |

### 🧠 CHIEF (המתזמר)
- **READ = הכל** (נראוּת מלאה לכל מערכת בכל מוצר — ל-Dashboards/פיקוח).
- **פקודה** = דרך System-Chief של כל מוצר (ברירת-מחדל), ויכולת לפנות ישירות לכל סוכן (override) — עם write-back.
- **אין ל-CHIEF קרדנציאלס משלו** — הוא פועל דרך ההרשאות של הסוכן/המוצר.

---

## 3. אבטחה — הבטחות
1. **כל SEND/PUBLISH/SPEND מגודר** — מתג-אוטונומיה (advisor→approve→autopilot) + מבקר ייעודי. אין נתיב סוכן→חוץ בלי שער.
2. **READ רחב, WRITE צר.** החוקרים/אנליסטים קוראים חופשי; רק ה-executor/distribution כותב החוצה.
3. **קרדנציאלס per-workspace, מוצפנים, מבודדי-RLS.** סוכן של לקוח א' לא נוגע בטוקן של לקוח ב'.
4. **סף-סכום→אדם** בכל SPEND (גבייה/תקציב/תשלום), גם ב-autopilot.
5. **audit-trail מלא** לכל גישה חיצונית — סכימה מחייבת ב-§3.5.

## 3.5 Audit — סכימה, מדיניות וחשיפה-ללקוח 🧾
> ה-audit הוא לא רק לוג-דיבאג — הוא **הוכחת-שקיפות ללקוח** (וגם דרישת ת"י 5568 / GDPR). כל SEND/PUBLISH/SPEND וכל READ חיצוני נרשם.

**טבלה: `agent_audit_log`**
| שדה | טיפוס | תיאור |
|---|---|---|
| `id` | uuid | מזהה |
| `workspace_id` | uuid | ה-workspace (מבודד-RLS) |
| `product` | text | OPS / Rank / SDR / … |
| `agent` | text | עמנואל / דן / אלון / executor / … |
| `system` | text | Email / Meta Ads / CRM / … (מהקטלוג) |
| `scope` | text | READ / WRITE-internal / SEND / PUBLISH / SPEND |
| `action` | text | תיאור קצר ("paused ad X", "sent email to Y") |
| `target_ref` | jsonb | מזהה-היעד (ad_id / contact_id / url) — לא תוכן רגיש |
| `autonomy_mode` | text | advisor / approve / autopilot |
| `approved_by` | text\|null | user_id שאישר, או `autopilot` |
| `critic` | text\|null | המבקר שחתם (אלון/מבקר-תקציב) + verdict |
| `confidence` | numeric\|null | ביטחון המסווג (0..1), כשרלוונטי |
| `amount` | numeric\|null | ל-SPEND — הסכום (₪) |
| `evidence_ref` | text\|null | קישור לטיוטה/דוח/decision שהוליד את הפעולה |
| `created_at` | timestamptz | חותמת-זמן |

**מדיניות:**
- **RLS:** קריאה רק ל-workspace שלך (owner/admin); כתיבה רק דרך service-role של הקונקטור.
- **שמירה:** 12 חודשים לפחות (SPEND/SEND); READ ניתן לדגום/לצמצם.
- **חשיפה:** מסך "יומן-פעילות" per-workspace ב-Dashboards — הלקוח רואה כל פעולה שסוכן עשה בשמו. חומר-שיווק ("כל פעולה מתועדת ונגישה") + ציות.
- **ללא-סודות:** `target_ref`/`evidence_ref` לא מכילים tokens או PII מיותר.

## 4. מפת-בנייה (מה לחבר כדי להגיע ל"גישה רחבה מלאה")
- **P0:** Gmail/Outlook (read inbound + send), LinkedIn (SDR/OPS), Calendar (Meeting/SDR).
- **P1:** Voice (Vapi/Retell) ל-SDR+COLLECT, CRM connectors (HubSpot/Salesforce), Shopify/Woo sync ל-SHOP.
- **P2:** SMS, TikTok/Outbrain ads, Slack/Teams, Meeting real-send.
- כל חיבור חדש: OAuth per-workspace + רישום בטבלה הזו + שער אם זו כתיבה.
