import type { ReactNode } from 'react';
import ScrollReveal from '../components/ScrollReveal';

type Widget = { label: string; kind: 'kpi' | 'line' | 'bars' | 'gauge' | 'field' | 'sign'; cls?: string };
type Props = { accent: string; title?: ReactNode; fig?: string; widgets?: Widget[] };

const DEFAULT_WIDGETS: Widget[] = [
  { label: 'הכנסות', kind: 'kpi' },
  { label: 'מגמת מכירות', kind: 'line' },
  { label: 'לפי ערוץ', kind: 'bars' },
  { label: 'המרה', kind: 'gauge' },
];

/** Retool-style builder demo: blocks "snap" into a grid on loop. Reused for
 *  the dashboard-widget builder and the form-field builder. */
export default function ProductBuilderDemo({ accent, title, fig, widgets = DEFAULT_WIDGETS }: Props) {
  return (
    <section className="pbd" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pbd-title">
          {title || (
            <>
              גוררים, משחררים, <em>הדשבורד נבנה לבד</em>
            </>
          )}
        </h2>
        <ScrollReveal className="pbd-stage">
          <span className="pbd-fig">{fig || 'FIG 0.2, Drag · Drop · Done'}</span>
          <div className="pbd-grid" aria-hidden="true">
            {widgets.map((w, i) => (
              <div className="pbd-widget" style={{ ['--i' as string]: `${i}` }} key={w.label}>
                <span className="pbd-widget-label">{w.label}</span>
                <span className={`pbd-viz pbd-${w.kind}`} />
                <span className="pbd-grip" aria-hidden="true">⠿</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
