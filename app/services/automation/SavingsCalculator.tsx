'use client';

import { useState } from 'react';
import SectionHeader from '../../components/SectionHeader';

const HOURLY_COST = 70; // ₪ average
const WORK_DAYS = 22;

export default function SavingsCalculator() {
  const [employees, setEmployees] = useState(5);
  const [hoursPerDay, setHoursPerDay] = useState(2);

  const monthlySavings = employees * hoursPerDay * HOURLY_COST * WORK_DAYS;
  const weeklySavings = Math.round(monthlySavings / 4.33);
  const yearlySavings = monthlySavings * 12;
  const hoursFreed = employees * hoursPerDay * WORK_DAYS;

  return (
    <section className="sp2-section">
      <div className="container">
        <SectionHeader
          eyebrow="מחשבון חיסכון"
          titleHtml="כמה כסף העסק שלך<br/>שורף על עבודה ידנית?"
          description="הזיזו את המחוונים וקבלו הערכה לחיסכון באמצעות אוטומציה וסוכני AI."
        />

        <div className="calc-grid">
          {/* Inputs */}
          <div className="calc-inputs">
            <div className="calc-input-group">
              <label className="calc-label">מספר עובדים בצוות</label>
              <input
                type="range" min="1" max="30" value={employees}
                onChange={e => setEmployees(+e.target.value)}
                className="calc-slider"
              />
              <span className="calc-value">{employees}</span>
            </div>
            <div className="calc-input-group">
              <label className="calc-label">שעות עבודה ידנית ביום (לעובד)</label>
              <input
                type="range" min="0.5" max="8" step="0.5" value={hoursPerDay}
                onChange={e => setHoursPerDay(+e.target.value)}
                className="calc-slider"
              />
              <span className="calc-value">{hoursPerDay} שעות</span>
            </div>
            <p className="calc-note">* מבוסס על עלות שעת עבודה ממוצעת של כ-₪70 ו-22 ימי עבודה בחודש.</p>
          </div>

          {/* Results */}
          <div className="calc-results">
            <h3 className="calc-results-title">פוטנציאל החיסכון שלכם</h3>
            <p className="calc-results-note">הערכה · לא הצעת מחיר</p>

            <div className="calc-result-cards">
              <div className="calc-result-card">
                <span className="calc-result-label">חיסכון שבועי משוער</span>
                <span className="calc-result-value">₪{weeklySavings.toLocaleString()}</span>
              </div>
              <div className="calc-result-card highlight">
                <span className="calc-result-label">חיסכון חודשי משוער</span>
                <span className="calc-result-value">₪{monthlySavings.toLocaleString()}</span>
              </div>
              <div className="calc-result-card">
                <span className="calc-result-label">חיסכון שנתי משוער</span>
                <span className="calc-result-value">₪{yearlySavings.toLocaleString()}</span>
              </div>
            </div>

            <ul className="calc-benefits">
              <li>🕐 שחרור כ-{hoursFreed} שעות עבודה בחודש</li>
              <li>💰 החזר השקעה (ROI) תוך 3-6 חודשים</li>
              <li>😊 שיפור שביעות רצון העובדים</li>
            </ul>

            <p className="calc-disclaimer">* ההערכה מבוססת על ממוצעי שוק ואינה מהווה הצעת מחיר. התוצאות עשויות להשתנות.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
