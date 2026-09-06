'use client';

import { useEffect, useRef, useState } from 'react';

type Cat = { slug: string; label: string };

// Client filter + search for the /articles feed. Cards are rendered on the
// server and passed as children, so ArticleChart / graphics never run on the
// client. Each card carries data-cat (space-separated category slugs, so an
// article can live under several) and data-search (lowercased title + excerpt +
// category labels). Filtering runs in JS over the rendered DOM: a card shows
// when it matches the active category AND the search query. Without JS every
// card stays visible, so the failure mode is graceful.
export default function ArticlesFilter({
  categories,
  children,
}: {
  categories: Cat[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<number | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const q = query.trim().toLowerCase();
    const cards = list.querySelectorAll<HTMLElement>('.article-item');
    let shown = 0;
    cards.forEach((card) => {
      const cats = (card.dataset.cat || '').split(' ');
      const text = card.dataset.search || '';
      const catOk = active === 'all' || cats.includes(active);
      const searchOk = q === '' || text.includes(q);
      const show = catOk && searchOk;
      card.style.display = show ? '' : 'none';
      if (show) shown += 1;
    });
    setVisible(shown);
  }, [active, query, children]);

  return (
    <>
      <div className="article-search">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="article-search-icon">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מאמר לפי מילת מפתח או נושא"
          aria-label="חיפוש מאמרים"
        />
        {query && (
          <button type="button" className="article-search-clear" onClick={() => setQuery('')} aria-label="ניקוי חיפוש">
            ×
          </button>
        )}
      </div>

      <div className="article-filters" role="tablist" aria-label="סינון מאמרים לפי נושא">
        <button
          type="button"
          role="tab"
          aria-selected={active === 'all'}
          className={active === 'all' ? 'active' : ''}
          onClick={() => setActive('all')}
        >
          הכל
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            role="tab"
            aria-selected={active === c.slug}
            className={active === c.slug ? 'active' : ''}
            onClick={() => setActive(c.slug)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="article-list" ref={listRef}>
        {children}
      </div>

      {visible === 0 && (
        <p className="article-no-results">
          לא נמצאו מאמרים ל{query ? `״${query}״` : 'סינון הזה'}.{' '}
          <button
            type="button"
            className="article-no-results-reset"
            onClick={() => {
              setQuery('');
              setActive('all');
            }}
          >
            לאיפוס
          </button>
        </p>
      )}
    </>
  );
}
