// HELIX mockups — light/dark toggle. Auto-injects a sun/moon button into .top-right.
(function () {
  var root = document.documentElement;
  var KEY = 'helix-mock-theme';
  var SUN = '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg class="i" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function apply(t) {
    root.setAttribute('data-theme', t);
    var b = document.getElementById('themeBtn');
    if (b) { b.innerHTML = t === 'light' ? MOON : SUN; b.title = t === 'light' ? 'עבור למצב כהה' : 'עבור למצב בהיר'; }
  }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  var forced = (location.search.match(/[?&]theme=(light|dark)/) || [])[1];
  var initial = forced || saved || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  apply(initial);
  function init() {
    var tr = document.querySelector('.top-right');
    if (!tr) return;
    var btn = document.createElement('button');
    btn.id = 'themeBtn'; btn.className = 'theme-toggle';
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
    tr.insertBefore(btn, tr.firstChild);
    apply(root.getAttribute('data-theme') || 'dark');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
