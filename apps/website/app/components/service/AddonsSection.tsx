'use client';

import { useState } from 'react';
import RevealOnScroll from './RevealOnScroll';

interface Addon { name: string; price: string }

interface Props {
  addons: Addon[];
}

export default function AddonsSection({ addons }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? addons : addons.slice(0, 4);

  return (
    <section className="sp2-section">
      <div className="container">
        <RevealOnScroll>
          <h2 className="sp2-section-title">אפשר להוסיף</h2>
          <p className="sp2-lead">כל אחד מהשירותים הבאים זמין כתוספת לחבילה.</p>
        </RevealOnScroll>
        <div className="pk-addons-table">
          {visible.map((addon) => (
            <div key={addon.name} className="pk-addon-row">
              <span>{addon.name}</span>
              <b>{addon.price}</b>
            </div>
          ))}
          {addons.length > 4 && !showAll && (
            <button className="pk-addons-toggle" onClick={() => setShowAll(true)}>
              הצג עוד {addons.length - 4} תוספות ▼
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
