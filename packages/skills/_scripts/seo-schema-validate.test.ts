import { assertEquals, assert } from "jsr:@std/assert@1";
import { validateJsonLd, geoChecklist, extractJsonLdBlocks } from "./seo-schema-validate.ts";

Deno.test("extractJsonLdBlocks finds only ld+json scripts", () => {
  const html = `
    <script type="application/ld+json">{"a":1}</script>
    <script type="text/javascript">var x = 1;</script>
    <script type='application/ld+json'>{"b":2}</script>
  `;
  const blocks = extractJsonLdBlocks(html);
  assertEquals(blocks.length, 2);
  assertEquals(blocks[0], '{"a":1}');
});

Deno.test("validateJsonLd: valid single block passes", () => {
  const html = `<script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Article","headline":"Hi"}
  </script>`;
  const r = validateJsonLd(html);
  assertEquals(r.blocks, 1);
  assertEquals(r.valid, true);
  assertEquals(r.issues.length, 0);
});

Deno.test("validateJsonLd: no blocks", () => {
  const r = validateJsonLd("<html><body>no schema</body></html>");
  assertEquals(r.blocks, 0);
  assertEquals(r.valid, false);
  assert(r.issues[0].includes("no JSON-LD"));
});

Deno.test("validateJsonLd: invalid JSON flagged", () => {
  const html = `<script type="application/ld+json">{not valid}</script>`;
  const r = validateJsonLd(html);
  assertEquals(r.valid, false);
  assert(r.issues.some((i) => i.includes("invalid JSON")));
});

Deno.test("validateJsonLd: missing @type and non-schema.org context", () => {
  const html = `<script type="application/ld+json">
    {"@context":"https://example.com","headline":"x"}
  </script>`;
  const r = validateJsonLd(html);
  assertEquals(r.valid, false);
  assert(r.issues.some((i) => i.includes("missing @type")));
  assert(r.issues.some((i) => i.includes("not schema.org")));
});

Deno.test("validateJsonLd: empty object flagged", () => {
  const html = `<script type="application/ld+json">{}</script>`;
  const r = validateJsonLd(html);
  assertEquals(r.valid, false);
  assert(r.issues.some((i) => i.includes("empty object")));
});

Deno.test("validateJsonLd: @graph nodes validated, top @context inherited", () => {
  const html = `<script type="application/ld+json">
    {"@context":"https://schema.org","@graph":[
      {"@type":"Organization","name":"HELIX"},
      {"name":"no type here"}
    ]}
  </script>`;
  const r = validateJsonLd(html);
  assertEquals(r.valid, false);
  assert(r.issues.some((i) => i.includes("node 2") && i.includes("missing @type")));
  // node 1 fully valid, so no issue mentioning node 1
  assert(!r.issues.some((i) => i.includes("node 1")));
});

Deno.test("geoChecklist: strong page scores high", () => {
  const html = `<!doctype html><html lang="en"><head>
    <link rel="canonical" href="https://helix.co.il/x">
    <meta name="description" content="A clear description of the page.">
    </head><body>
    <h1>The Guide</h1>
    <p>TL;DR: this covers everything in 3 steps.</p>
    <p>We grew 45% in 30 days with 1200 users.</p>
    <h2>FAQ</h2><p>Q: How? A: Like this.</p>
    </body></html>`;
  const r = geoChecklist(html);
  assertEquals(r.checks.length, 6);
  assertEquals(r.score, 100);
  assert(r.checks.every((c) => c.pass));
});

Deno.test("geoChecklist: Hebrew summary + numbers recognized", () => {
  const html = `<html lang="he" dir="rtl"><head>
    <meta name="description" content="תיאור">
    <link rel="canonical" href="/a"></head><body>
    <h1>מדריך</h1>
    <p>בקצרה: הגדלנו 30% תוך 14 ימים.</p>
    <h2>שאלות נפוצות</h2>
    </body></html>`;
  const r = geoChecklist(html);
  const byName = Object.fromEntries(r.checks.map((c) => [c.name, c.pass]));
  assertEquals(byName["single H1"], true);
  assertEquals(byName["TL;DR or summary near top"], true);
  assertEquals(byName["FAQ or Q&A structure"], true);
  assertEquals(byName["numbers with context"], true);
});

Deno.test("geoChecklist: weak page scores low", () => {
  const html = `<html><body><h1>a</h1><h1>b</h1><p>words only</p></body></html>`;
  const r = geoChecklist(html);
  const single = r.checks.find((c) => c.name === "single H1")!;
  assertEquals(single.pass, false); // two H1s
  assert(r.score < 50);
});

Deno.test("geoChecklist: empty meta description does not count", () => {
  const html = `<html><head><meta name="description" content="  "></head>
    <body><h1>x</h1></body></html>`;
  const r = geoChecklist(html);
  const meta = r.checks.find((c) => c.name === "meta description present")!;
  assertEquals(meta.pass, false);
});
