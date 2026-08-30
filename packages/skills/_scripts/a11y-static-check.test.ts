import { assert, assertEquals } from "jsr:@std/assert@1";
import { checkA11y } from "./a11y-static-check.ts";

function rules(html: string): string[] {
  return checkA11y(html).issues.map((i) => i.rule);
}

Deno.test("clean document produces no issues", () => {
  const html = `<!doctype html><html lang="en"><head>
    <title>t</title></head><body>
    <h1>Title</h1>
    <h2>Section</h2>
    <img src="a.png" alt="a chart">
    <label for="email">Email</label>
    <input id="email" type="email">
    <a href="/pricing">See the pricing page</a>
    <button>Save</button>
    </body></html>`;
  assertEquals(checkA11y(html).issues.length, 0);
});

Deno.test("image without alt flagged 1.1.1", () => {
  const r = checkA11y(`<html lang="en"><body><h1>x</h1><img src="a.png"></body></html>`);
  const issue = r.issues.find((i) => i.rule === "img-missing-alt")!;
  assert(issue);
  assert(issue.wcag.startsWith("1.1.1"));
});

Deno.test("missing lang flagged", () => {
  assert(rules(`<html><body><h1>x</h1></body></html>`).includes("missing-lang"));
});

Deno.test("zero and multiple H1", () => {
  assert(rules(`<html lang="en"><body><p>no heading</p></body></html>`).includes("no-h1"));
  assert(
    rules(`<html lang="en"><body><h1>a</h1><h1>b</h1></body></html>`).includes("multiple-h1"),
  );
});

Deno.test("heading level skip flagged", () => {
  const html = `<html lang="en"><body><h1>a</h1><h4>skipped</h4></body></html>`;
  assert(rules(html).includes("heading-skip"));
});

Deno.test("input without label flagged; labelled input passes", () => {
  const bad = `<html lang="en"><body><h1>x</h1><input type="text" name="q"></body></html>`;
  assert(rules(bad).includes("input-missing-label"));

  const good = `<html lang="en"><body><h1>x</h1>
    <input type="text" aria-label="Search"></body></html>`;
  assert(!rules(good).includes("input-missing-label"));

  const forLabel = `<html lang="en"><body><h1>x</h1>
    <label for="q">Q</label><input id="q" type="text"></body></html>`;
  assert(!rules(forLabel).includes("input-missing-label"));
});

Deno.test("generic link text flagged", () => {
  const html = `<html lang="en"><body><h1>x</h1><a href="/a">click here</a></body></html>`;
  const issue = checkA11y(html).issues.find((i) => i.rule === "link-generic-text")!;
  assert(issue);
  assert(issue.wcag.startsWith("2.4.4"));
});

Deno.test("link with no accessible name flagged", () => {
  const html = `<html lang="en"><body><h1>x</h1><a href="/a"></a></body></html>`;
  assert(rules(html).includes("link-no-name"));
});

Deno.test("link with image alt is fine", () => {
  const html = `<html lang="en"><body><h1>x</h1>
    <a href="/a"><img src="i.png" alt="Home"></a></body></html>`;
  const rs = rules(html);
  assert(!rs.includes("link-no-name"));
  assert(!rs.includes("link-generic-text"));
});

Deno.test("button without accessible name flagged", () => {
  const html = `<html lang="en"><body><h1>x</h1><button></button></body></html>`;
  const issue = checkA11y(html).issues.find((i) => i.rule === "button-no-name")!;
  assert(issue);
  assert(issue.wcag.startsWith("4.1.2"));
});

Deno.test("button with aria-label passes", () => {
  const html = `<html lang="en"><body><h1>x</h1>
    <button aria-label="Close"><svg></svg></button></body></html>`;
  assert(!rules(html).includes("button-no-name"));
});

Deno.test("Hebrew content without dir=rtl flagged", () => {
  const html = `<html lang="he"><body><h1>שלום עולם</h1></body></html>`;
  assert(rules(html).includes("missing-dir-rtl"));
});

Deno.test("Hebrew content with dir=rtl is fine", () => {
  const html = `<html lang="he" dir="rtl"><body><h1>שלום עולם</h1></body></html>`;
  assert(!rules(html).includes("missing-dir-rtl"));
});
