'use client';

import { useState } from 'react';
import { requestScan } from './scanBus';

/** Compact free-check band placed under sections; routes the URL to the primary scanner. */
export default function GeoCheckBand({ label }: { label?: string }) {
  const [url, setUrl] = useState('');
  return (
    <div className="geo-band">
      <div className="container">
        <form
          className="geo-band-inner"
          onSubmit={(e) => {
            e.preventDefault();
            if (url.trim()) requestScan(url.trim());
          }}
        >
          <span className="geo-band-label">{label ?? 'בדקו את האתר שלכם בחינם'}</span>
          <div className="geo-band-row">
            <input
              type="text"
              className="geo-url-input"
              placeholder="example.co.il"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              dir="ltr"
              aria-label="כתובת האתר לבדיקה"
            />
            <button type="submit" className="btn btn-primary geo-scan-btn">בדקו בחינם</button>
          </div>
        </form>
      </div>
    </div>
  );
}
