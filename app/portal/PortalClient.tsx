'use client';

import { useEffect, useState, type FormEvent } from 'react';

interface PortalFile {
  name: string;
  url: string;
  size: number;
  updatedAt?: string;
}

type View = 'checking' | 'locked' | 'authed';

function prettyName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  return base.replace(/[-_]+/g, ' ').trim();
}
function ext(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toUpperCase() : 'קובץ';
}
function sizeKb(bytes: number): string {
  if (!bytes) return '';
  const kb = bytes / 1024;
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function PortalClient() {
  const [view, setView] = useState<View>('checking');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [files, setFiles] = useState<PortalFile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function loadFiles(list: PortalFile[]) {
    setFiles(list);
    setSelected(list.map((f) => f.name)); // ברירת מחדל: הכל מסומן
  }

  // שחזור session קיים בעת טעינת הדף.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/portal', { method: 'GET' });
        if (!alive) return;
        if (res.ok) {
          const data = await res.json();
          loadFiles(data.files || []);
          setView('authed');
          return;
        }
      } catch {
        /* ignore */
      }
      if (alive) setView('locked');
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('נא להזין קוד גישה.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        loadFiles(data.files || []);
        setName(data.name || '');
        setView('authed');
      } else if (res.status === 429) {
        setError('יותר מדי נסיונות. נסו שוב בעוד כמה דקות.');
      } else {
        setError('הקוד שגוי. בדקו שוב, או פנו אלינו.');
      }
    } catch {
      setError('תקלה זמנית. נסו שוב בעוד רגע.');
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    try {
      await fetch('/api/portal', { method: 'DELETE' });
    } catch {
      /* ignore */
    }
    setFiles([]);
    setSelected([]);
    setCode('');
    setName('');
    setView('locked');
  }

  const allSelected = files.length > 0 && selected.length === files.length;

  function toggleAll() {
    setSelected(allSelected ? [] : files.map((f) => f.name));
  }
  function toggleOne(fileName: string) {
    setSelected((prev) => (prev.includes(fileName) ? prev.filter((n) => n !== fileName) : [...prev, fileName]));
  }

  function downloadSelected() {
    if (!selected.length) return;
    // ZIP אחד בצד שרת: הורדה אחת, בלי חסימת ריבוי-הורדות של הדפדפן.
    const q = encodeURIComponent(selected.join('|'));
    window.location.href = `/api/portal/download?files=${q}`;
  }

  if (view === 'checking') {
    return (
      <section className="portal-card" aria-busy="true">
        <div className="portal-spinner" aria-hidden="true" />
        <p className="portal-muted">רגע, בודקים גישה…</p>
      </section>
    );
  }

  if (view === 'locked') {
    return (
      <section className="portal-card">
        <h1 className="portal-title">האיזור האישי שלך</h1>
        <p className="portal-muted">הזינו את קוד הגישה שקיבלתם מ-HELIX כדי לראות ולהוריד את הקבצים שלכם.</p>
        <form onSubmit={submit} className="portal-form">
          <label htmlFor="code" className="portal-label">קוד גישה</label>
          <input
            id="code"
            type="text"
            inputMode="text"
            autoComplete="off"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="portal-input"
            placeholder="הקוד שקיבלתם"
            disabled={submitting}
            aria-invalid={!!error}
          />
          {error && <p className="portal-error" role="alert">{error}</p>}
          <button type="submit" className="portal-btn" disabled={submitting}>
            {submitting ? 'נכנסים…' : 'כניסה'}
          </button>
        </form>
      </section>
    );
  }

  // authed
  return (
    <section className="portal-card portal-wide">
      <div className="portal-head">
        <div>
          <h1 className="portal-title">{name ? `שלום, ${name}` : 'הקבצים שלך'}</h1>
          <p className="portal-muted">הקבצים האישיים שלך מ-HELIX. סמנו והורידו.</p>
        </div>
        <button type="button" className="portal-logout" onClick={logout}>יציאה</button>
      </div>

      {files.length === 0 ? (
        <div className="portal-empty">
          <p>עדיין אין כאן קבצים.</p>
          <p className="portal-muted">הם יופיעו ברגע שנעלה אותם. אם אתם מצפים לקבצים ולא רואים, פנו אלינו.</p>
        </div>
      ) : (
        <>
          <div className="portal-toolbar">
            <label className="portal-selectall">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>סמן הכל</span>
            </label>
            <button type="button" className="portal-download portal-download-all" onClick={downloadSelected} disabled={downloading || selected.length === 0}>
              <DownloadIcon />
              <span>{downloading ? 'מוריד…' : `הורד נבחרים (${selected.length})`}</span>
            </button>
          </div>

          <ul className="portal-files">
            {files.map((f) => (
              <li key={f.name} className="portal-file">
                <label className="portal-file-info">
                  <input type="checkbox" checked={selected.includes(f.name)} onChange={() => toggleOne(f.name)} />
                  <span className="portal-badge">{ext(f.name)}</span>
                  <span className="portal-file-name">{prettyName(f.name)}</span>
                  {f.size > 0 && <span className="portal-file-size">{sizeKb(f.size)}</span>}
                </label>
                <a className="portal-download" href={f.url} download={f.name}>
                  <DownloadIcon />
                  <span>הורדה</span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
