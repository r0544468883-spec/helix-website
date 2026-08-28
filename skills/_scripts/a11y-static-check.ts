// a11y-static-check.ts
// Static (no-browser) accessibility heuristics for HTML, mapped to WCAG 2.2.
// Pure TypeScript, zero external deps, parses via regex/string ops only.

export interface A11yIssue {
  rule: string;
  wcag: string;
  detail: string;
}

export interface A11yResult {
  issues: A11yIssue[];
}

interface Tag {
  name: string;
  raw: string;
  attrs: Record<string, string>;
}

const GENERIC_LINK_TEXT = [
  "click here",
  "here",
  "read more",
  "learn more",
  "more",
  "link",
  "this",
];

export function checkA11y(html: string): A11yResult {
  const issues: A11yIssue[] = [];

  // ---- document-level: lang + dir ----
  const htmlTag = firstTag(html, "html");
  const lang = htmlTag?.attrs["lang"];
  if (!htmlTag || !lang || lang.trim() === "") {
    issues.push({
      rule: "missing-lang",
      wcag: "3.1.1 Language of Page",
      detail: "<html> element has no non-empty lang attribute",
    });
  }

  // Detect Hebrew content and require dir="rtl" somewhere sensible.
  const text = stripTags(html);
  const hasHebrew = /[֐-׿]/.test(text);
  if (hasHebrew) {
    const htmlDir = htmlTag?.attrs["dir"];
    const anyRtl = /\bdir\s*=\s*("|')?\s*rtl/i.test(html);
    if (!(htmlDir && htmlDir.toLowerCase() === "rtl") && !anyRtl) {
      issues.push({
        rule: "missing-dir-rtl",
        wcag: "1.3.2 Meaningful Sequence",
        detail: "Hebrew content present but no dir=\"rtl\" found",
      });
    }
  }

  // ---- images without alt ----
  for (const img of allTags(html, "img")) {
    if (!("alt" in img.attrs)) {
      issues.push({
        rule: "img-missing-alt",
        wcag: "1.1.1 Non-text Content",
        detail: `<img> has no alt attribute: ${truncate(img.raw)}`,
      });
    }
  }

  // ---- headings: count H1, level skips ----
  const headings = allHeadings(html);
  const h1s = headings.filter((h) => h.level === 1);
  if (h1s.length === 0) {
    issues.push({
      rule: "no-h1",
      wcag: "1.3.1 Info and Relationships",
      detail: "Document has no <h1> heading",
    });
  } else if (h1s.length > 1) {
    issues.push({
      rule: "multiple-h1",
      wcag: "1.3.1 Info and Relationships",
      detail: `Document has ${h1s.length} <h1> headings (expected 1)`,
    });
  }
  for (let i = 1; i < headings.length; i++) {
    const jump = headings[i].level - headings[i - 1].level;
    if (jump > 1) {
      issues.push({
        rule: "heading-skip",
        wcag: "1.3.1 Info and Relationships",
        detail: `Heading level jumps from h${headings[i - 1].level} to h${headings[i].level}`,
      });
    }
  }

  // ---- inputs without label / aria-label ----
  const labelForIds = new Set<string>();
  for (const label of allTags(html, "label")) {
    const forId = label.attrs["for"];
    if (forId) labelForIds.add(forId.trim());
  }
  for (const input of allTags(html, "input")) {
    const type = (input.attrs["type"] ?? "text").toLowerCase();
    if (type === "hidden" || type === "submit" || type === "button" || type === "reset") continue;
    const hasAria = hasAccessibleAttr(input.attrs);
    const id = input.attrs["id"];
    const labelled = id ? labelForIds.has(id.trim()) : false;
    if (!hasAria && !labelled) {
      issues.push({
        rule: "input-missing-label",
        wcag: "1.3.1 Info and Relationships / 4.1.2 Name, Role, Value",
        detail: `Form <input> has no label, aria-label or aria-labelledby: ${truncate(input.raw)}`,
      });
    }
  }

  // ---- links: generic text + no accessible name ----
  for (const link of allElements(html, "a")) {
    // Skip anchors that are not real links (no href) unless they have text.
    const inner = stripTags(link.inner).trim().toLowerCase();
    const ariaName = link.attrs["aria-label"] ?? link.attrs["title"];
    const hasImgAlt = /<img\b[^>]*\balt\s*=\s*("|')[^"']+\1/i.test(link.inner);
    const accessibleName = inner || (ariaName ?? "").trim() || (hasImgAlt ? "image" : "");

    if (accessibleName === "") {
      issues.push({
        rule: "link-no-name",
        wcag: "2.4.4 Link Purpose / 4.1.2 Name, Role, Value",
        detail: `<a> has no accessible name (no text, aria-label, or image alt): ${truncate(link.open)}`,
      });
    } else if (inner && GENERIC_LINK_TEXT.includes(inner) && !ariaName) {
      issues.push({
        rule: "link-generic-text",
        wcag: "2.4.4 Link Purpose (In Context)",
        detail: `Link uses non-descriptive text "${inner}"`,
      });
    }
  }

  // ---- buttons: no accessible name ----
  for (const btn of allElements(html, "button")) {
    const inner = stripTags(btn.inner).trim();
    const ariaName = btn.attrs["aria-label"] ?? btn.attrs["aria-labelledby"] ?? btn.attrs["title"];
    const hasImgAlt = /<img\b[^>]*\balt\s*=\s*("|')[^"']+\1/i.test(btn.inner);
    if (inner === "" && !ariaName && !hasImgAlt) {
      issues.push({
        rule: "button-no-name",
        wcag: "4.1.2 Name, Role, Value",
        detail: `<button> has no accessible name: ${truncate(btn.open)}`,
      });
    }
  }

  return { issues };
}

// ---------- tag parsing helpers ----------

function parseAttrs(rawTag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  // Strip the leading "<tagname" and trailing ">".
  const inner = rawTag.replace(/^<\s*[a-zA-Z0-9]+/, "").replace(/\/?>$/, "");
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(inner)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[3] ?? m[4] ?? m[5] ?? "";
    attrs[name] = value;
  }
  return attrs;
}

function allTags(html: string, tagName: string): Tag[] {
  const re = new RegExp(`<${tagName}\\b[^>]*>`, "gi");
  const out: Tag[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push({ name: tagName, raw: m[0], attrs: parseAttrs(m[0]) });
  }
  return out;
}

function firstTag(html: string, tagName: string): Tag | null {
  const m = html.match(new RegExp(`<${tagName}\\b[^>]*>`, "i"));
  if (!m) return null;
  return { name: tagName, raw: m[0], attrs: parseAttrs(m[0]) };
}

interface Element {
  open: string;
  inner: string;
  attrs: Record<string, string>;
}

/** Match paired elements like <a ...>inner</a>. Non-nesting-aware (shallow). */
function allElements(html: string, tagName: string): Element[] {
  const re = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}\\s*>`, "gi");
  const out: Element[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const open = `<${tagName}${m[1]}>`;
    out.push({ open, inner: m[2], attrs: parseAttrs(open) });
  }
  return out;
}

interface Heading {
  level: number;
}

function allHeadings(html: string): Heading[] {
  const re = /<h([1-6])\b[^>]*>/gi;
  const out: Heading[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    out.push({ level: parseInt(m[1], 10) });
  }
  return out;
}

function hasAccessibleAttr(attrs: Record<string, string>): boolean {
  const aria = attrs["aria-label"];
  const labelledby = attrs["aria-labelledby"];
  const title = attrs["title"];
  return (
    (aria !== undefined && aria.trim() !== "") ||
    (labelledby !== undefined && labelledby.trim() !== "") ||
    (title !== undefined && title.trim() !== "")
  );
}

function stripTags(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, n = 80): string {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? one.slice(0, n) + "..." : one;
}
