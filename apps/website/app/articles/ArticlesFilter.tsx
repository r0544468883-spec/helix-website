'use client';

import { useState } from 'react';

type Cat = { slug: string; label: string };

// Client filter for the /articles feed. Cards are rendered on the server and
// passed as children, so ArticleChart / graphics never run on the client.
// Filtering is CSS-only (see globals.css): the wrapper carries data-filter and
// each card carries data-cat. Without JS, data-filter stays "all" and every
// article shows, so the failure mode is graceful.
export default function ArticlesFilter({
  categories,
  children,
}: {
  categories: Cat[];
  children: React.ReactNode;
}) {
  const [active, setActive] = useState('all');

  return (
    <>
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
      <div className="article-list" data-filter={active}>
        {children}
      </div>
    </>
  );
}
