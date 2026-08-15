import { integrationsFor } from './integrations-data';

/** Explicit "which external tools this system integrates with" chip list.
 *  Rendered on every product page; accent-driven via --pac. */
export default function ProductIntegrations({ slug, accent }: { slug: string; accent: string }) {
  const items = integrationsFor(slug);
  if (items.length === 0) return null;

  return (
    <section className="pint" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pint-title">🔗 מתחבר לכלים שאתם כבר עובדים איתם</h2>
        <p className="pint-lead">
          המערכת יודעת להתחבר באמצעות אינטגרציה למערכות החיצוניות הבאות, דרך API רשמי או n8n:
        </p>
        <ul className="pint-chips" dir="rtl">
          {items.map((name) => (
            <li key={name} className="pint-chip">{name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
