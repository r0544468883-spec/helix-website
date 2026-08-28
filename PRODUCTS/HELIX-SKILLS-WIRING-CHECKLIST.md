# HELIX — צ'קליסט הטמעת סקילים לסוכנים

> איך לוקחים סקיל (כמו שלושת ה-custom שנבנו ב-`helix/skills/`) ומחברים אותו לסוכן אמיתי בפרודקשן.
> נלווה ל-[HELIX-AGENT-SKILLS-MAP.md](./HELIX-AGENT-SKILLS-MAP.md). הדרך המומלצת: **Messages API + Skills API** (בלי מיגרציית-תשתית).
>
> ⚠️ שמות מתודות ה-SDK מדויקים לגרסת ה-beta הנוכחית של Anthropic. לפני הרצה, לאמת מול גרסת `@anthropic-ai/sdk` המותקנת (ה-Skills API עדיין תחת beta header).

---

## שלב 0 — מבנה ספריית-הסקילים המשותפת

```
helix/skills/                      ← מקור-אמת יחיד לכל סקילי-הריצה
  helix-brand-voice/
    SKILL.md
    references/examples.md
  helix-data-schema/
    SKILL.md
  paid-ads/
    SKILL.md
  <domain-skill>/
    SKILL.md
    references/*.md                 ← הופ אחד בלבד מ-SKILL.md
    scripts/*.py|*.ts               ← ל-ops דטרמיניסטי (קוד לא נכנס ל-context)
```

כללי-תיקייה (מהמחקר):
- `SKILL.md` frontmatter: `name` (lowercase-hyphen, ≤64, בלי "claude"/"anthropic"), `description` (≤1024, "מה+מתי", keyword-rich — **זה מנגנון ה-triggering**).
- גוף SKILL.md < 500 שורות. עודף → `references/*.md` הופ אחד בלבד.
- סקריפטים ל-ops שברירי (מיגרציות, signed-URL) — רק ה-stdout נכנס ל-context.

---

## שלב 1 — העלאת הסקילים ל-workspace (פעם אחת)

סקריפט `helix/skills/upload.ts` (מריצים פעם אחת, ובכל עדכון סקיל):

```ts
import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });
const SKILLS_DIR = path.resolve('helix/skills');
const BETA = 'skills-2025-10-02'; // אמת מול התיעוד הנוכחי

function filesFromDir(dir: string) {
  const out: { path: string; content: Buffer }[] = [];
  for (const entry of fs.readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (entry.isFile()) {
      const abs = path.join(entry.path ?? dir, entry.name);
      out.push({ path: path.relative(dir, abs), content: fs.readFileSync(abs) });
    }
  }
  return out;
}

for (const name of fs.readdirSync(SKILLS_DIR)) {
  const skillDir = path.join(SKILLS_DIR, name);
  if (!fs.statSync(skillDir).isDirectory()) continue;
  const skill = await client.beta.skills.create(
    { display_title: name, files: filesFromDir(skillDir) },
    { headers: { 'anthropic-beta': BETA } },
  );
  console.log(`${name} → skill_id=${skill.id} version=${skill.latest_version}`);
  // ⚠️ שמור את הזוג (skill_id, version) בקובץ נעילה — ראה שלב 3
}
```

פלט: לכל סקיל `skill_id` + `version`. **שומרים אותם ל-`helix/skills/skills-lock.json`** (לא `"latest"` בפרודקשן).

---

## שלב 2 — חיבור סקיל לקריאת-סוכן קיימת

לפני (כל 60 הסוכנים היום):
```ts
const res = await client.messages.create({
  model: 'claude-sonnet-5',
  max_tokens: 900,
  system: SYSTEM_PROMPT,          // כל ידע-הדומיין משוכפל כאן
  messages: [{ role: 'user', content: userInput }],
});
```

אחרי (מבוסס-סקיל):
```ts
const res = await client.beta.messages.create({
  model: 'claude-sonnet-5',
  max_tokens: 900,
  system: SYSTEM_PROMPT,          // רק הארכיטיפ (תפקיד+פורמט), הדומיין עבר לסקיל
  container: {
    skills: [
      { type: 'custom', skill_id: LOCK['helix-brand-voice'].id, version: LOCK['helix-brand-voice'].version },
      { type: 'custom', skill_id: LOCK['paid-ads'].id,          version: LOCK['paid-ads'].version },
    ],
  },
  tools: [{ type: 'code_execution_20250825', name: 'code_execution' }],
  messages: [{ role: 'user', content: userInput }],
}, { headers: { 'anthropic-beta': `${BETA},code-execution-2025-08-25` } });
```

מה השתנה מול היום, בדיוק 3 דברים:
1. `client.beta.messages.create` + beta headers.
2. `container.skills[]` (עד 20 סקילים/בקשה).
3. tool `code_execution_20250825` (ה-sandbox שהסקיל רץ בתוכו).

**אין תשתית חדשה לתחזק** — רץ ב-sandbox של Anthropic.

---

## שלב 3 — נעילת גרסאות (`skills-lock.json`)

```json
{
  "helix-brand-voice": { "id": "skill_01Ab...", "version": "skver_01Cd..." },
  "helix-data-schema": { "id": "skill_01Ef...", "version": "skver_01Gh..." },
  "paid-ads":          { "id": "skill_01Ij...", "version": "skver_01Kl..." }
}
```
- פרודקשן טוען מהקובץ הזה, **לעולם לא `"latest"`** (עדכון של מישהו משנה את כל הסוכנים בשקט).
- עדכון סקיל = להריץ upload מחדש, לבדוק, ואז לעדכן את ה-version בקובץ (כמו deploy).

---

## שלב 4 — התאמות לפי runtime

| Runtime של הסוכן | מה עושים |
|---|---|
| PLUG edge functions (Deno, `@anthropic-ai/sdk`) — ai-kit finance וכו' | דרך A ישירות. ה-`AgentDef.rules[]` עוברים לסקיל; משאירים ב-prompt רק role/goal/format. |
| helix products (Node, `createLLM()`/`fetch`/`narrate()`) | ל-Claude: דרך A. ל-Ollama-first (GD/Sign-Forms/Dashboards): הסקיל רץ רק במסלול Claude; ב-Ollama נשאר fallback ל-prompt המלא. |
| website-maintenance (`lib/skills/guidance.ts` — כבר מיפוי ידני) | להחליף את הטקסט-המועתק בטעינת סקיל אמיתי; ה-mapping כבר קיים. |

⚠️ **sandbox = אין רשת ואין pip/npm בזמן-ריצה.** סקיל שנבדק ב-Claude Code (עם רשת) עלול להתנהג אחרת. לבדוק מול ה-runtime האמיתי.

---

## שלב 5 — לפני אימוץ סקיל מ-GitHub (security-read)

תואם [[feedback-license-check-clean-room-first]]:
1. לקרוא **כל** קובץ בסקיל (SKILL.md + scripts + assets) — סקיל = הרצת-קוד לא-נבדקת.
2. לחסום כל סקריפט שמושך URL חיצוני / מריץ קוד לא-מובן.
3. לבדוק רישיון (AGPL/GPL = דגל אדום).
4. רק אז להעתיק ל-`helix/skills/` ולהעלות.

---

## צ'קליסט מסכם לכל סוכן שממירים
- [ ] זיהוי סקיל-הדומיין מהמטריצה (חלק ב' ב-AGENT-SKILLS-MAP).
- [ ] הוצאת ידע-הדומיין מה-`system`/`rules[]` אל הסקיל; השארת הארכיטיפ בלבד ב-prompt.
- [ ] הוספת חוצי-הארגון אם הסוכן מנסח טקסט: `helix-brand-voice` (+ hebrew-writer + clean-text).
- [ ] מעבר ל-`beta.messages.create` + `container.skills[]` + `code_execution` tool.
- [ ] `skill_id`+`version` נעולים מ-`skills-lock.json`.
- [ ] בדיקה מול ה-runtime האמיתי (לא רק Claude Code).
- [ ] סוכן דטרמיניסטי? לדלג — אין קריאת LLM, אין סקיל.

_עודכן: 2026-08-28_
