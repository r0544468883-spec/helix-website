import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'הכלים של HELIX',
  description: 'גישה לתוכנות שכבר בנינו. תוכנה בודדת 500 ₪/חודש, חבילת 3 תוכנות 750 ₪/חודש.',
};

export default function ToolsPage() {
  return (
    <section className="service-page">
      <div className="container">
        <p className="service-tag">גישה לתוכנות</p>
        <h1 className="service-title">הכלים של HELIX</h1>
        <p className="service-subtitle">התוכנות שכבר בנינו ושנמשיך לבנות. בתשלום חודשי, בלי לפתח מאפס.</p>
        <div className="service-body">
          <p>דף השירות בבנייה. בקרוב כאן יהיה מידע מלא על התוכנות של Helix.</p>
        </div>
      </div>
    </section>
  );
}
