'use client';

import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import type { ReportListItem } from '@/lib/geo-report-store';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('he-IL', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDwell(ms: number): string {
  if (!ms || ms <= 0) return '-';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec} שניות`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem ? `${min} דק׳ ${rem} שנ׳` : `${min} דק׳`;
}

interface ReportStats {
  views: number;
  uniqueVisitors: number;
  firstView: string | null;
  lastView: string | null;
  avgDwellMs: number;
  maxSectionReached: string | null;
  sectionReach: Record<string, number>;
  likelyShared: boolean;
}

// Short Hebrew labels for the report's section keys.
const SECTION_HE: Record<string, string> = {
  hero: 'פתיח',
  scorecard: 'כרטיס ניקוד',
  engines: 'מנוע מול מנוע',
  heatmap: 'מפת שאלות',
  competitors: 'מתחרים',
  sources: 'מקורות',
  plan: 'תוכנית פעולה',
};

function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked, ignore
    }
  }
  return (
    <button type="button" className={styles.btnGhost} onClick={copy}>
      {copied ? 'הועתק' : 'העתק לינק'}
    </button>
  );
}

function ReportRow({ report, cols }: { report: ReportListItem; cols: number }) {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/geo-reports/${report.token}/stats`);
        if (!res.ok) throw new Error('bad');
        const data = (await res.json()) as { ok?: boolean; stats?: ReportStats };
        if (alive && data?.ok && data.stats) setStats(data.stats);
      } catch {
        // leave stats null, show a dash
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [report.token]);

  const views = stats?.views ?? 0;
  const people = stats?.uniqueVisitors ?? 0;

  return (
    <>
      <tr>
        <td className={styles.brandCell}>{report.brand}</td>
        <td className={styles.scoreCell}>{Math.round(report.score)}%</td>
        <td>{formatDate(report.date)}</td>
        <td>
          {loading ? (
            <span className={styles.viewsMuted}>טוען…</span>
          ) : stats ? (
            <span className={styles.viewsCell}>
              {views} צפיות · {people} אנשים
              {stats.likelyShared && <span className={styles.sharedTag}>שותף</span>}
            </span>
          ) : (
            <span className={styles.viewsMuted}>-</span>
          )}
        </td>
        <td>
          <div className={styles.actionsCell}>
            <a className={styles.btnGhost} href={`/r/${report.token}`} target="_blank" rel="noreferrer">
              פתח
            </a>
            <CopyLinkButton token={report.token} />
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              {open ? 'סגור' : 'פרטים'}
            </button>
          </div>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={cols} className={styles.detailsTd}>
            <div className={styles.detailsPanel}>
              {!stats || stats.views === 0 ? (
                <p className={styles.viewsMuted}>עדיין אין נתוני צפייה לדוח הזה.</p>
              ) : (
                <>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>צפייה ראשונה</span>
                      <span className={styles.detailValue}>{formatDateTime(stats.firstView)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>צפייה אחרונה</span>
                      <span className={styles.detailValue}>{formatDateTime(stats.lastView)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>זמן שהייה ממוצע</span>
                      <span className={styles.detailValue}>{formatDwell(stats.avgDwellMs)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>הגיעו הכי רחוק עד</span>
                      <span className={styles.detailValue}>
                        {stats.maxSectionReached
                          ? SECTION_HE[stats.maxSectionReached] ?? stats.maxSectionReached
                          : '-'}
                      </span>
                    </div>
                  </div>
                  {Object.keys(stats.sectionReach).length > 0 && (
                    <div className={styles.reachRow}>
                      <span className={styles.detailLabel}>כמה הגיעו לכל חלק:</span>
                      <div className={styles.reachChips}>
                        {Object.entries(stats.sectionReach)
                          .sort((a, b) => b[1] - a[1])
                          .map(([key, count]) => (
                            <span key={key} className={styles.reachChip}>
                              {SECTION_HE[key] ?? key}: {count}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  {stats.likelyShared && (
                    <p className={styles.sharedNote}>
                      נראה שהדוח שותף הלאה: נספרו {stats.uniqueVisitors} צופים שונים.
                    </p>
                  )}
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ReportsTable({ reports }: { reports: ReportListItem[] }) {
  if (reports.length === 0) {
    return <div className={styles.empty}>עדיין אין דוחות</div>;
  }
  const COLS = 5;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.tbl}>
        <thead>
          <tr>
            <th scope="col">מותג</th>
            <th scope="col">נתח שיחה</th>
            <th scope="col">תאריך</th>
            <th scope="col">צפיות</th>
            <th scope="col">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <ReportRow key={r.token} report={r} cols={COLS} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
