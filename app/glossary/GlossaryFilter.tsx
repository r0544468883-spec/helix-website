'use client';

import { useEffect, useRef, useState } from 'react';

type Cat = { slug: string; label: string; count: number };

// Client search + category jump for the glossary. Term cards are server-rendered
// inside category sections and passed as children. Each section carries
// data-cat; each term carries data-search (lowercased term + english +
// definition). Choosing a category shows only that section; typing filters terms
// across all sections and hides sections that end up empty. No JS -> everything
// shows, grouped by category.
export default function GlossaryFilter({
  categories,
  total,
  children,
}: {
  categories: Cat[];
  total: number;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = query.trim().toLowerCase();
    let shown = 0;
    root.querySelectorAll<HTMLElement>('.glossary-group').forEach((group) => {
      const catOk = active === 'all' || group.dataset.cat === active;
      let groupShown = 0;
      group.querySelectorAll<HTMLElement>('.glossary-item').forEach((item) => {
        const text = item.dataset.search || '';
        const show = catOk && (q === '' || text.includes(q));
        item.style.display = show ? '' : 'none';
        if (show) groupShown += 1;
      });
      group.style.display = groupShown > 0 ? '' : 'none';
      shown += groupShown;
    });
    setVisible(shown);
  }, [active, query, children]);

  return (
    <div ref={rootRef}>
      <div className="glossary-search">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="article-search-icon">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מונח, למשל ׳קוהורט׳, ׳ICP׳, ׳לולאה׳"
          aria-label="חיפוש במילון"
        />
        {query && (
          <button type="button" className="article-search-clear" onClick={() => setQuery('')} aria-label="ניקוי חיפוש">
            ×
          </button>
        )}
      </div>

      <div className="glossary-index" role="tablist" aria-label="קפיצה לפי נושא">
        <button
          type="button"
          role="tab"
          aria-selected={active === 'all'}
          className={active === 'all' ? 'active' : ''}
          onClick={() => setActive('all')}
        >
          הכל <span className="glossary-index-count">{total}</span>
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
            {c.label} <span className="glossary-index-count">{c.count}</span>
          </button>
        ))}
      </div>

      {children}

      {visible === 0 && (
        <p className="article-no-results">
          לא נמצא מונח ל{query ? `״${query}״` : 'נושא הזה'}.{' '}
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
    </div>
  );
}
