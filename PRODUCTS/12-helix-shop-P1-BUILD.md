# HELIX SHOP — תוכנית בנייה P1 (file-by-file) 🏗️

> נספח-בנייה ל-[12-helix-shop.md](./12-helix-shop.md). מבוסס **חקירת-קוד אמיתית** של הריפוזיטוריז החינמיים (2026-08-13).
> החלטת-על: **הכל שלנו, TS-native** (Next.js + Supabase). בלי Chatwoot / שירות נפרד.
> P1 = **הבוט-מוכר על צ׳אט-האתר בלבד** — בלי WhatsApp/IG (דורש Meta app-review, נדחה ל-P2).

---

## 1. מה כל ריפו באמת נותן (code-verified)

### Supavec / `@supavec/supabase-ai` (MIT, TypeScript) — מנוע ה-RAG
API: `EmbeddingsClient` עם `store(data)` · `search(query)` · `create(text[])` · `similarity(a,b)`.
- דורש טבלת `documents (id, content, embedding vector(1536), metadata jsonb, user_id, created_at)` + index `ivfflat` + RPC `match_documents()`.
- **⚠️ gotcha 1:** embeddings = **OpenAI-only** (`text-embedding-3-small`, 1536-dim). כלומר צריך **מפתח OpenAI רק ל-embeddings** (זול מאוד), בזמן ש-Claude עושה את הצ׳אט. שתי ספקויות — תקין.
- **⚠️ gotcha 2:** **לא מחתך (chunk) לבד** — "content should be pre-chunked". ה-chunking הוא שלנו.
- מסקנה: משתמשים בו **כמעט as-is** לאחסון+שליפה. חוסך את כל שכבת ה-pgvector/embeddings.

### insta-p8 (Next.js 16 + React 19 + Supabase + shadcn) — שלד-האפליקציה + inbox
**הגילוי הגדול:** זה בול ה-stack שלנו, וכולל הרבה מעבר ל-IG:
- **inbox מלא** — טבלאות `conversations`/`messages`, UI תיבה, שליחה ידנית (`/api/inbox`). ← זה ה-handoff של חלק 4, כבר בנוי.
- **channel pattern** — OAuth (`/api/instagram/callback`) + webhook (`/api/instagram/webhook`) + עיבוד אירועים. תבנית לכל ערוץ.
- **AI-reply proxy** — `/api/groq/chat` (Groq/OpenAI-compatible). **נחליף ל-Claude.**
- **schema idempotent + self-healing** (`lib/supabase-migrate.ts`) + RLS (`supabase-server` RLS-aware, `supabase-admin` service-role).
- מסקנה: **fork כשלד-הבסיס.** מפשיטים את ה-IG-specific ל-P1, שומרים inbox + conversations + proxy + RLS.

### Enthusiast (Python/Django, MIT) — בלו-פרינט ה-agent (לפורט, לא להריץ)
מבנה server: `agent/` (הסוכן) · `catalog/` (מוצרים) · `sync/` (סנכרון דאטה) · pgvector + Celery (async).
4 use-cases מובנים: product discovery · manual search · **order intake** · **catalog enrichment**.
- מסקנה: **לומדים את ההפרדה** agent↔catalog↔sync ואת ה-validation-to-reduce-hallucination, **כותבים ב-TS**. לא מריצים Python.

### RetailGPT — דמו מחקרי. רפרנס בלבד, לא בונים עליו.

---

## 2. ארכיטקטורת P1

```
[widget צ׳אט באתר]  ──POST──►  /api/chat  (Next.js route)
                                   │
                                   ├─ RAG: Supavec.search(query) ──► documents (pgvector)
                                   │
                                   ├─ Claude tool-loop:
                                   │     search_catalog · check_inventory · add_to_cart · get_order_status
                                   │        │
                                   │        └─► catalog/orders tables (סונכרנו מ-Shopify/Woo)
                                   │
                                   ├─ streaming תשובה ► widget (+ כרטיס מוצר)
                                   │
                                   └─ write ► conversations/messages  +  גשר CHIEF (contact/deal)

[cron sync]  Shopify/Woo API ──► catalog table ──► chunk ──► Supavec.store() ──► documents
```

---

## 3. תוכנית קובץ-קובץ (P1)

### שלד + תשתית (מ-insta-p8)
| קובץ | מקור | פעולה |
|---|---|---|
| `app/`, `next.config.mjs`, `package.json` | insta-p8 | fork — Next.js 16 + shadcn + Tailwind (RTL) |
| `lib/supabase-server.ts` · `lib/supabase-admin.ts` | insta-p8 | as-is (RLS-aware + service-role) |
| `lib/supabase-migrate.ts` | insta-p8 | as-is (self-healing migrations) |
| `supabase/schema.sql` | insta-p8 + חדש | בסיס conversations/messages + הרחבות (§4) |
| `app/api/inbox/*` + `components/inbox/*` | insta-p8 | as-is — זה ה-handoff (חלק 4) |

### RAG (מ-Supavec)
| קובץ | פעולה |
|---|---|
| `lib/rag/client.ts` | עוטף `@supavec/supabase-ai` — init EmbeddingsClient (OpenAI key) |
| `sql/documents.sql` | טבלת `documents` + ivfflat index + RPC `match_documents` (מ-Supavec `sql/`) |
| `lib/rag/chunk.ts` | **חדש** — chunking של מוצר/תקנון/בלוג (Supavec לא עושה) |

### מנוע המכירה — מחלקת-אייג'נטים (לפי [HELIX-CHIEF-AND-AGENTS-SPEC §4b](./HELIX-CHIEF-AND-AGENTS-SPEC.md))
> **החלטה ארכיטקטונית:** לא סוכן-יחיד עם system-prompt-ענק, אלא **מחלקה** תחת **System Chief** אחד. **חובה hybrid** כי זה צ׳אט חי: רוב ההודעות עוברות ב-**fast-path** (סוכן יחיד), והמסלול-הכבד רץ רק לסגירת-מכירה/התאמת-מוצר מורכבת. ה-**Critic רץ כ-guard מהיר על עובדות** בכל תשובה (לא דיבייט מלא) — כי הזיה על מחיר/מלאי = חבות.

| קובץ | פעולה |
|---|---|
| `lib/agents/shop/contract.ts` | **חדש** — ה-Agent Contract האחיד (role/input/tools/memory/handoff/autonomy) מ-§4b |
| `lib/agents/shop/system-chief.ts` | **חדש** — הצ'יף-המערכתי: מחליט fast/team, מתזמר, merge, ה-interface היחיד ל-CHIEF |
| `lib/agents/shop/roles/seller.ts` | **חדש (Maker)** — כותב את תשובת-המכירה, tool-use loop (tools + tool_result). *זה מה של-plug-chat אין.* |
| `lib/agents/shop/roles/product-expert.ts` | **חדש (Researcher)** — שולף מה-RAG/קטלוג **עובדות בלבד**, בלי דעה |
| `lib/agents/shop/roles/fact-guard.ts` | **חדש (Critic 🔴)** — תוקף כל תשובה לפני שליחה: מוצר קיים? מחיר אמיתי? מלאי לא-מומצא? הבטחה שאי-אפשר לקיים? (ה-"validation-to-reduce-hallucination" של Enthusiast) |
| `lib/agents/shop/roles/service.ts` | **חדש** — החזרות/סטטוס-הזמנה (מצב-חשיבה שונה מהמוכר) |
| `lib/agents/shop/tools.ts` | **חדש** — 4 הכלים: `search_catalog` · `check_inventory` · `add_to_cart` · `get_order_status` |
| `lib/agents/shop/system-prompt.ts` | **חדש** — persona מוכר + קול-מותג + "ענה רק מהנתון" (מאמץ prompt-cache של plug-chat) |
| `lib/agents/shop/memory.ts` | **חדש** — גשר ל-CRM המשותף; **write-back חובה** גם מפנייה ישירה לסוכן (כלל §4b) |
| `lib/agents/shop/hebrew.ts` | **חדש** — baldiga pass על פלט עברי |
| `app/api/chat/route.ts` | **חדש** — endpoint ראשי: RAG → System Chief (fast/team) → fact-guard → stream → write |

### סנכרון קטלוג (חדש — אף ריפו לא נותן)
| קובץ | פעולה |
|---|---|
| `lib/sync/shopify.ts` | **חדש** — משיכת מוצרים/מלאי מ-Shopify Admin API |
| `lib/sync/woo.ts` | **חדש** — WooCommerce REST |
| `app/api/sync/route.ts` + cron | **חדש** — sync → catalog table → chunk → Supavec.store() |

### גשר CHIEF (חדש — ה-moat)
| קובץ | פעולה |
|---|---|
| `lib/chief/bridge.ts` | **חדש** — שיחה → `shopper_conversation` + contact/deal ב-CRM (סכמת [12-helix-shop.md](./12-helix-shop.md) §5) |

### widget צ׳אט-אתר (חדש — פשוט)
| קובץ | פעולה |
|---|---|
| `public/widget.js` | **חדש** — snippet קל להטמעה (iframe/web-component) → מדבר עם `/api/chat` |
| `app/embed/page.tsx` | **חדש** — עמוד הצ׳אט המוטמע |

---

## 4. הרחבות schema ל-P1 (מעבר ל-insta-p8)
- `catalog` — product_id, title, description, price, inventory, variants jsonb, platform, external_id, updated_at
- `documents` — (Supavec) content, embedding, metadata (product_id/type), user_id
- `shopper_conversation` — channel, transcript_ref, intent, converted, abandoned, language (סכמת §5)
- `orders` (read-model) — order_id, status, items (לסנכרון get_order_status)

---

## 5. החלטות פתוחות לפני קוד
1. **מפתח OpenAI ל-embeddings** — Supavec דורש. אישור: להוסיף? (זול; חלופה: להחליף ל-embeddings אחר = יותר עבודה).
2. **ריפו חדש** `helix-shop` (origin = r0544468883-spec, כמו שאר המוצרים) — לאשר שם.
3. **חנות-בדיקה** — Shopify dev-store או Woo מקומי לפיתוח ה-sync.

## 6. מה נדחה ל-P2 (במכוון)
WhatsApp + Instagram + Messenger (Meta app-review, שבועות) · link-in-bio · multi-store · דשבורד תובנות מלא. P1 מוכיח ערך על צ׳אט-אתר בלי אף תלות חיצונית.

---
## מקורות (code-verified)
- [Supavec/supabase-ai](https://github.com/supavec/supabase-ai) · [insta-p8](https://github.com/ayuuxh2/insta-p8) · [Enthusiast](https://github.com/upsidelab/enthusiast) · [RetailGPT](https://github.com/unicamp-dl/retailGPT)
