'use client';

import { useState } from 'react';
import RevealOnScroll from './RevealOnScroll';

interface Addon { name: string; price: string }

interface Props {
  addons: Addon[];
}

export default function AddonsSection({ addons }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="sp2-section sp2-section-alt">
      <div className="container">
        <RevealOnScroll>
          <h2 className="sp2-section-title">אפשר להוסיף</h2>
          <p className="sp2-lead">כל אחד מהשירותים הבאים זמין כתוספת לחבילה.</p>
        </RevealOnScroll>
        <div className="sp2-addons-wrapper">
          <button className={`sp2-addons-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
            {open ? 'הסתר תוספות' : `הצג ${addons.length} תוספות זמינות`}
            <span className="sp2-addons-arrow">{open ? '▲' : '▼'}</span>
          </button>
          <div className={`sp2-addons-list ${open ? 'sp2-addons-open' : ''}`}>
            {addons.map((addon) => (
              <div key={addon.name} className="sp2-addon-row">
                <span>{addon.name}</span>
                <b>{addon.price}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
