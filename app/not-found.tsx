import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — הדף לא נמצא',
  description: 'הדף שחיפשת לא קיים. נשמח לחזור איתך לדף הבית.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="notfound">
      <div className="container">
        <div className="notfound-mark">
          HELIX<span className="dot">.</span>
        </div>
        <h1 className="notfound-title">404 — הדף לא נמצא</h1>
        <p className="notfound-text">
          הדף שחיפשת לא קיים, או שאולי שינינו לו כתובת. אפשר לחזור לדף הבית ולהמשיך משם.
        </p>
        <a href="/" className="btn btn-primary">חזרה לדף הבית</a>
      </div>
    </section>
  );
}
