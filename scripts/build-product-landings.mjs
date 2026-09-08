// Build real, SSR-able product-landing data from the standalone design mocks.
//
// WHY: /products/<slug> used to render an <iframe> of /_mock/<slug>-landing.html.
// The whole /_mock/ path 404s in production, so every product page was an empty
// shell (nav + footer, blank middle). Iframes also hide the content from Google.
//
// This transform turns each design mock into three strings the site renders as
// REAL server-side DOM (no iframe): scoped CSS, body HTML, and the interaction
// JS. The CSS is namespaced under `#plv3` (via PostCSS) so the mock's global
// resets (`*`, `body`, `:root`) can't collide with or leak into the site.
// The mock's own header/footer/partner/overlay are kept in the DOM but hidden
// (display:none) so the mock's JS still finds them (it queries `header`/`.burger`
// unguarded) while the site's real Nav/Footer provide the chrome.
//
// Run:  node scripts/build-product-landings.mjs
// Output: app/products/_landings/<slug>.json  ({ css, html, js })  — committed.
// Re-run whenever a *-landing.html design changes.

import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const ROOT = process.cwd();
const MOCK = path.join(ROOT, 'public/_mock');
const OUT = path.join(ROOT, 'app/products/_landings');
const SCOPE = '#plv3';

// Only slugs that have both a mock file and a real product route.
const SLUGS = [
  'assistant', 'dashboards', 'forms', 'geo', 'growth-doctor', 'marketing-ops',
  'meeting', 'reputation', 'sdr', 'shop', 'store-maintenance',
  'website-maintenance', 'whatsapp',
];

// Prefix a single selector with the scope, replacing a leading root/html/body
// token (the mock's document-level rules) with the scope element itself.
function scopeSelector(sel) {
  const s = sel.trim();
  if (!s) return s;
  const m = s.match(/^(:root|html|body)\b/);
  if (m) return SCOPE + s.slice(m[0].length);
  return `${SCOPE} ${s}`;
}

const scopePlugin = () => ({
  postcssPlugin: 'scope-landing',
  Rule(rule) {
    // Leave @keyframes step selectors (0%, 50%, to, ...) untouched.
    for (let p = rule.parent; p; p = p.parent) {
      if (p.type === 'atrule' && /keyframes$/i.test(p.name)) return;
    }
    rule.selectors = rule.selectors.map(scopeSelector);
  },
});
scopePlugin.postcss = true;

// Relative mock assets -> real served paths.
//   shots/<slug>-N.jpg  ->  /product-shots/<slug>-N.jpg   (already served)
//   steps.json / rocket-mail.json / media/*  ->  /product-landings/*  (relocated)
function rewriteAssets(s) {
  return s
    .replace(/(["'(=])shots\//g, '$1/product-shots/')
    .replace(/(["'(=])steps\.json/g, '$1/product-landings/steps.json')
    .replace(/(["'(=])rocket-mail\.json/g, '$1/product-landings/rocket-mail.json')
    .replace(/(["'(=])media\//g, '$1/product-landings/media/');
}

async function build(slug) {
  const file = path.join(MOCK, `${slug}-landing.html`);
  if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, 'utf8');

  const styles = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1]).join('\n');
  // Inline scripts only (skip <script src="..."> CDN tags — loaded by the client).
  const scripts = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1]).join('\n;\n');

  const bodyMatch = src.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let html = bodyMatch ? bodyMatch[1] : src;
  html = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');

  let css = (await postcss([scopePlugin()]).process(styles, { from: undefined })).css;
  css += `\n${SCOPE}{box-sizing:border-box}`;
  css += `\n${SCOPE} header,${SCOPE} footer,${SCOPE} .partner,${SCOPE} .xp-overlay{display:none!important}\n`;

  css = rewriteAssets(css);
  html = rewriteAssets(html).trim();
  const js = rewriteAssets(scripts);

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify({ css, html, js }));
  return { slug, cssKB: +(css.length / 1024).toFixed(1), htmlKB: +(html.length / 1024).toFixed(1), jsKB: +(js.length / 1024).toFixed(1) };
}

const results = [];
for (const slug of SLUGS) {
  const r = await build(slug);
  if (r) results.push(r);
  else console.warn(`skip (no mock): ${slug}`);
}
console.table(results);
console.log(`\n✓ wrote ${results.length} landings to app/products/_landings/`);
