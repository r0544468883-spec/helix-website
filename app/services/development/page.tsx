import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'בנק שעות פיתוח ואפיון',
  description: 'פיתוח תוכנה ואפליקציות בהתאמה אישית. MVP, פיצ׳רים, אינטגרציות. תמחור לפי הצעה.',
};

export default function DevelopmentPage() {
  return (
    <section className="service-page">
      <div className="container">
        <p className="service-tag">פיתוח בהתאמה</p>
        <h1 className="service-title">בנק שעות פיתוח ואפיון</h1>
        <p className="service-subtitle">לתוכנות ואפליקציות בהתאמה אישית. גמיש לפי הצורך שלכם.</p>
        <div className="service-body">
          <p>דף השירות בבנייה. בקרוב כאן יהיה מידע מלא על שירותי הפיתוח בהתאמה.</p>
        </div>
      </div>
    </section>
  );
}
