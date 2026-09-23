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
// unguarded) while the site's real Nav/Footer provide the chrome. The overlay is
// the mock's own 60-second popup, and the site already mounts ExitPopup globally
// on the same 60 seconds and the same 'helix-popup-dismissed-at' key, so showing
// both would put two panels on one dismissal. The mock's stays hidden.
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

// ---------------------------------------------------------------------------
// Lead capture: the mocks fake it, so we wire it here.
//
// WHY: the design mocks were never connected to a backend. Their submit handler
// hides the form, reveals the success card and fires confetti without sending
// anything, so three forms per landing, across 13 pages, dropped every visitor
// on the floor. The mocks stay as the designers wrote them; the wiring is
// applied on the way into the JSON, so the next rebuild can't quietly revert it.
// If a mock is reworked and an anchor stops matching, build() throws instead of
// shipping dead forms again.
//
// The mock's fourth form, the one inside the timed popup, is deliberately left
// alone: build() hides .xp-overlay with display:none!important, so no visitor
// ever reaches it. Wiring it would only ship code nobody can run.
// ---------------------------------------------------------------------------

// Everything the handlers below share. Injected once per landing, right before
// the first handler that uses it. Plain fetch, string concatenation, no
// imports: this text is handed to `new Function` in the browser as-is.
const leadHelpers = (slug) => String.raw`
  // /api/lead persists the lead first and mails it second. It wants a name plus
  // a phone or a mail, takes a free-form details bag, and answers {ok}.
  const LEAD_SOURCE='product:${slug}';
  async function postLead(payload){
    try{
      const r=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const d=await r.json().catch(()=>({}));
      return r.ok && d.ok===true;
    }catch(err){return false}
  }
  // A send that failed says so. The mock's habit of celebrating anyway is what
  // let 13 pages look healthy while every lead evaporated.
  function leadFail(form,html){
    let box=form.querySelector('.lead-fail');
    if(!box){
      box=document.createElement('p');
      box.className='lead-fail';
      box.style.cssText='color:#ff7a7a;font-size:12.5px;line-height:1.6;margin:12px 0 0';
      form.appendChild(box);
    }
    box.innerHTML=html||('השליחה נכשלה. נסו שוב, או <a href="'+WA+'" target="_blank" rel="noopener" style="color:var(--brand);font-weight:700">שלחו לנו וואטסאפ</a>.');
    box.hidden=false;
  }
  function leadPayload(form){
    const val=(sel)=>{const el=form.querySelector(sel);return el?el.value.trim():''};
    const consent=form.querySelector('.lead-check input[type="checkbox"]');
    return {
      name:val('input[id$="-name"]'),
      email:val('input[type="email"]'),
      phone:val('input[type="tel"]'),
      source:LEAD_SOURCE,
      // 'company' is the API honeypot and these forms carry none, so the real
      // company name travels in details, where it reaches the inbox intact.
      details:{'שם חברה':val('input[id$="-company"]'),'מוצר':PRODUCT,'הסכמה':consent&&consent.checked?'כן':'לא'}
    };
  }
`;

// The three in-page forms (hero, soft, final). The confetti call is lifted out
// of the mock so every product keeps its own palette.
const cardFormsHandler = (confettiCall) => String.raw`
  // lead forms inside cards: validate, send, and only then celebrate
  document.querySelectorAll('.lead-card form.lead-form').forEach(f=>{
    f.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!f.checkValidity()){f.reportValidity();return}
      if(!validBiz(f))return;
      const card=f.closest('.lead-card'), succ=card&&card.querySelector('.lead-success');
      const stale=f.querySelector('.lead-fail'); if(stale)stale.hidden=true;
      const btn=f.querySelector('.lead-submit'), label=btn?btn.textContent:'';
      if(btn){btn.disabled=true;btn.textContent='שולח...'}
      const ok=await postLead(leadPayload(f));
      if(btn){btn.disabled=false;btn.textContent=label}
      if(!ok){leadFail(f);return}
      f.style.display='none';
      if(succ){succ.hidden=false;
        if(typeof confetti==='function'&&!reduce){const r=succ.getBoundingClientRect();
          ${confettiCall}}}
    });
  });`;

const CARD_FORMS_RE = /^  \/\/ lead forms inside cards:.*\n  document\.querySelectorAll\('\.lead-card form\.lead-form'\)[\s\S]*?\n  \}\);/m;
const CONFETTI_RE = /confetti\(\{[\s\S]*?disableForReducedMotion:true\}\)/;

// Anchors that silently stop matching are how generated code rots, so a miss is
// a build failure, not a landing that quietly goes back to eating its leads.
function replaceOnce(js, re, slug, what, make) {
  const all = js.match(new RegExp(re.source, 'gm'));
  if (!all || all.length !== 1) {
    throw new Error(`${slug}: expected exactly one ${what} handler in the mock JS, found ${all ? all.length : 0}. Re-read the mock and fix the anchor.`);
  }
  return js.replace(re, () => make(all[0]));
}

function wireLeadForms(js, slug) {
  return replaceOnce(js, CARD_FORMS_RE, slug, 'card-form', (block) => {
    const confettiCall = block.match(CONFETTI_RE);
    if (!confettiCall) throw new Error(`${slug}: no confetti call inside the card-form handler`);
    return leadHelpers(slug) + cardFormsHandler(confettiCall[0]);
  });
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
  const js = wireLeadForms(rewriteAssets(scripts), slug);

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
