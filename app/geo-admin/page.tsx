import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { adminToken } from '@/lib/geo-admin-auth';
import { listReports } from '@/lib/geo-report-store';
import LoginForm from './login-form';
import GenerateCard from './generate-card';
import ApiKeysCard from './api-keys-card';
import ReportsTable from './reports-table';
import styles from './admin.module.css';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Internal tool: never index.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function GeoAdminPage() {
  const want = adminToken();
  const jar = await cookies();
  const authed = Boolean(want) && jar.get('geo_admin')?.value === want;

  if (!authed) {
    return (
      <main className={styles.page}>
        <div className={styles.wrap}>
          <LoginForm />
        </div>
      </main>
    );
  }

  const reports = await listReports();

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <span className={styles.eyebrow}>כלי פנימי · HELIX</span>
        <h1 className={styles.title}>לוח בקרה · דוחות נראות ב-AI</h1>
        <p className={styles.sub}>
          הפקה וניהול של דוחות נתח השיחה (Share of Model) ללקוחות. הקישורים פרטיים ולא נאנדקסים.
        </p>

        <GenerateCard />

        <ApiKeysCard />

        <section className={styles.card}>
          <h2 className={styles.cardHead}>הדוחות שלי</h2>
          <ReportsTable reports={reports} />
        </section>
      </div>
    </main>
  );
}
