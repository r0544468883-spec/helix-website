'use client';

import { useState, type ReactNode } from 'react';

// עוטף תוכן ומציג אותו מטושטש עם כיסוי "מתנה סודית". בלחיצה הטשטוש נמחק
// והתוכן נחשף. מטרה: לעורר סקרנות אצל מי שמגיע לדף.
export default function SecretReveal({ children }: { children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={`matana-secret${revealed ? ' is-revealed' : ''}`}>
      <div className="matana-secret-content" aria-hidden={!revealed}>
        {children}
      </div>
      {!revealed && (
        <button
          type="button"
          className="matana-secret-overlay"
          onClick={() => setRevealed(true)}
          aria-label="חשיפת המתנה הסודית"
        >
          <span className="matana-secret-emoji" aria-hidden="true">🚀</span>
          <span className="matana-secret-title">הצעת החג לממשיכים</span>
          <span className="matana-secret-sub">לחצו כדי למחוק את הטשטוש ולגלות מה אפשר לעשות הלאה</span>
          <span className="matana-secret-cta">גלו את ההצעה</span>
        </button>
      )}
    </div>
  );
}
