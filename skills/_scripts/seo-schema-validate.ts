// seo-schema-validate.ts
// Deterministic JSON-LD + GEO citability checker for HELIX skills.
// Pure TypeScript, zero external deps, runnable under Deno.
// Parses HTML with regex/string ops only (no DOM, no network).

export interface JsonLdResult {
  blocks: number;
  valid: boolean;
  issues: string[];
}

export interface GeoCheck {
  name: string;
  pass: boolean;
}

export interface GeoResult {
  score: number;
  checks: GeoCheck[];
}

/**
 * Extract raw inner text of every <script type="application/ld+json"> block.
 * Case-insensitive on tag/attribute, tolerant of attribute order and extra
 * whitespace. Returns the raw JSON strings (not parsed).
 */
export function extractJsonLdBlocks(html: string): string[] {
  const blocks: string[] = [];
  // Match opening <script ...> then capture until </script>.
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = m[1] ?? "";
    const body = m[2] ?? "";
    // Only keep blocks whose type attribute is application/ld+json.
    const typeMatch = attrs.match(/\btype\s*=\s*("|')?\s*application\/ld\+json\s*\1?/i);
    if (typeMatch) {
      blocks.push(body.trim());
    }
  }
  return blocks;
}

/**
 * Validate every JSON-LD block: parseable, has @context, has @type,
 * @context points at schema.org, and object is non-empty.
 * Handles a top-level array or a @graph array of nodes.
 */
export function validateJsonLd(html: string): JsonLdResult {
  const raw = extractJsonLdBlocks(html);
  const issues: string[] = [];

  if (raw.length === 0) {
    return { blocks: 0, valid: false, issues: ["no JSON-LD script blocks found"] };
  }

  raw.forEach((text, i) => {
    const label = `block ${i + 1}`;
    if (text.length === 0) {
      issues.push(`${label}: empty script block`);
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      issues.push(`${label}: invalid JSON (${(e as Error).message})`);
      return;
    }

    // Empty object or empty array carries no schema.
    if (
      (isRecord(parsed) && Object.keys(parsed).length === 0) ||
      (Array.isArray(parsed) && parsed.length === 0)
    ) {
      issues.push(`${label}: empty object`);
      return;
    }

    // A block may carry @context at top level plus a @graph of nodes.
    const topContext = isRecord(parsed) ? parsed["@context"] : undefined;
    const nodes = collectNodes(parsed);

    if (nodes.length === 0) {
      issues.push(`${label}: empty object`);
      return;
    }

    nodes.forEach((node, j) => {
      const nodeLabel = nodes.length > 1 ? `${label} node ${j + 1}` : label;
      if (!isRecord(node)) {
        issues.push(`${nodeLabel}: not a JSON object`);
        return;
      }
      const ctx = node["@context"] ?? topContext;
      if (ctx === undefined) {
        issues.push(`${nodeLabel}: missing @context`);
      } else if (!mentionsSchemaOrg(ctx)) {
        issues.push(`${nodeLabel}: @context is not schema.org`);
      }
      if (node["@type"] === undefined) {
        issues.push(`${nodeLabel}: missing @type`);
      }
    });
  });

  return { blocks: raw.length, valid: issues.length === 0, issues };
}

/**
 * Score GEO (generative-engine optimization) citability heuristics.
 * Each check is a boolean; score is percentage of checks that pass.
 */
export function geoChecklist(html: string): GeoResult {
  const text = stripTags(html);
  const head = text.slice(0, 600); // "near the top" window

  const h1Count = countMatches(html, /<h1\b[^>]*>/gi);

  const checks: GeoCheck[] = [
    { name: "single H1", pass: h1Count === 1 },
    {
      name: "TL;DR or summary near top",
      pass: /\b(tl;?dr|in summary|key takeaways?)\b/i.test(head) ||
        /(בקצרה|לסיכום|תקציר|שורה תחתונה)/.test(head),
    },
    {
      name: "FAQ or Q&A structure",
      pass: /\b(faq|frequently asked|q&a|q:\s|question:)\b/i.test(text) ||
        /(שאלות ותשובות|שאלות נפוצות|שאלה:)/.test(text) ||
        /"@type"\s*:\s*"(FAQPage|Question)"/i.test(html),
    },
    {
      name: "numbers with context",
      // A digit adjacent to a unit / percent / currency / word context.
      pass: /\d+(\.\d+)?\s*(%|percent|אחוז|₪|\$|€|users?|customers?|days?|years?|hours?|x\b|k\b|m\b|משתמשים|לקוחות|ימים|שנים)/i
        .test(text),
    },
    {
      name: "canonical link present",
      pass: /<link\b[^>]*rel\s*=\s*("|')?canonical\1?[^>]*>/i.test(html),
    },
    {
      name: "meta description present",
      pass: hasNonEmptyMetaDescription(html),
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return { score, checks };
}

// ---------- helpers ----------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Flatten a parsed JSON-LD value into a list of schema nodes. */
function collectNodes(parsed: unknown): unknown[] {
  if (Array.isArray(parsed)) return parsed;
  if (isRecord(parsed)) {
    const graph = parsed["@graph"];
    if (Array.isArray(graph)) return graph;
    return [parsed];
  }
  return [];
}

function mentionsSchemaOrg(ctx: unknown): boolean {
  if (typeof ctx === "string") return /schema\.org/i.test(ctx);
  if (Array.isArray(ctx)) return ctx.some(mentionsSchemaOrg);
  if (isRecord(ctx)) return Object.values(ctx).some(mentionsSchemaOrg);
  return false;
}

function stripTags(html: string): string {
  // Drop script/style bodies, then strip remaining tags.
  const noScript = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ");
  return noScript.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countMatches(s: string, re: RegExp): number {
  const m = s.match(re);
  return m ? m.length : 0;
}

function hasNonEmptyMetaDescription(html: string): boolean {
  const re = /<meta\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    if (/\bname\s*=\s*("|')?\s*description\s*\1?/i.test(tag)) {
      const content = tag.match(/\bcontent\s*=\s*("|')([\s\S]*?)\1/i);
      if (content && content[2].trim().length > 0) return true;
    }
  }
  return false;
}
