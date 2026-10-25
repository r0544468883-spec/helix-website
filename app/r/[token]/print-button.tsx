'use client';

import styles from '../report.module.css';

/**
 * "Download PDF" button for the hosted report. Uses the browser's native
 * print-to-PDF (window.print()); a `@media print` stylesheet trims the report to a
 * compact teaser (hero + scorecard + engines + competitors + Israeli gaps + CTA)
 * and hides the long 90-day plan, the developer section, and the button itself.
 * No dependency, no server render. The user picks "Save as PDF" in the dialog.
 */
export default function PrintButton() {
  return (
    <button
      type="button"
      className={styles.printBtn}
      onClick={() => window.print()}
      aria-label="הורד את הדוח כ-PDF"
    >
      הורד PDF
    </button>
  );
}
