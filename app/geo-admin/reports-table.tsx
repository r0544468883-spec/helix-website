'use client';

import { useState } from 'react';
import styles from './admin.module.css';
import type { ReportListItem } from '@/lib/geo-report-store';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}

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

export default function ReportsTable({ reports }: { reports: ReportListItem[] }) {
  if (reports.length === 0) {
    return <div className={styles.empty}>עדיין אין דוחות</div>;
  }
  return (
    <div className={styles.tableWrap}>
      <table className={styles.tbl}>
        <thead>
          <tr>
            <th scope="col">מותג</th>
            <th scope="col">נתח שיחה</th>
            <th scope="col">תאריך</th>
            <th scope="col">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.token}>
              <td className={styles.brandCell}>{r.brand}</td>
              <td className={styles.scoreCell}>{Math.round(r.score)}%</td>
              <td>{formatDate(r.date)}</td>
              <td>
                <div className={styles.actionsCell}>
                  <a
                    className={styles.btnGhost}
                    href={`/r/${r.token}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    פתח
                  </a>
                  <CopyLinkButton token={r.token} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
