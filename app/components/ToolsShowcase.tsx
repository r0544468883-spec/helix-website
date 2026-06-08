'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const tools = [
  {
    name: 'Datashop',
    subtitle: 'ניהול מלאי לאיקומרס עם AI',
    description: 'פלטפורמה חכמה שמנהלת מלאי, תעודות משלוח, והזמנות עם זיהוי אוטומטי של מסמכים באמצעות OCR ובינה מלאכותית.',
    features: ['זיהוי אוטומטי של תעודות משלוח', 'סנכרון מלאי Shopify + WooCommerce', 'דוחות חכמים ותחזיות מלאי', 'ממשק ניהול בעברית מלאה'],
    color: '#10B981',
  },
  {
    name: 'LeadFlow',
    subtitle: 'מנוע לידים אוטומטי',
    description: 'מערכת שמזהה לידים חמים, מעשירה אותם בנתונים, ומפזרת אותם לאנשי המכירות הנכונים בזמן אמת.',
    features: ['Data Enrichment אוטומטי', 'חיבור ל-LinkedIn Sales Navigator', 'ניקוד לידים חכם (Lead Scoring)', 'התראות בזמן אמת ל-WhatsApp'],
    color: '#059669',
  },
  {
    name: 'ContentBot',
    subtitle: 'כתיבת תוכן שיווקי עם AI',
    description: 'כלי שמייצר תוכן שיווקי בעברית: פוסטים לסושיאל, מאמרי בלוג, תיאורי מוצר, ומיילים. מותאם לטון של המותג שלך.',
    features: ['יצירת תוכן בעברית טבעית', 'התאמה לטון ולשפת המותג', 'תבניות מוכנות לכל פלטפורמה', 'אופטימיזציה ל-SEO אוטומטית'],
    color: '#10B981',
  },
  {
    name: 'BookKeep',
    subtitle: 'הנהלת חשבונות חכמה',
    description: 'מערכת שמחברת חשבוניות, קבלות, ודפי בנק למקום אחד. מסווגת הוצאות אוטומטית ומכינה דוחות לרואה חשבון.',
    features: ['סריקת חשבוניות עם OCR', 'סיווג הוצאות אוטומטי', 'חיבור לבנקים וכרטיסי אשראי', 'דוח חודשי מוכן לרו"ח'],
    color: '#059669',
  },
  {
    name: 'SiteGuard',
    subtitle: 'ניטור ותחזוקת אתרים',
    description: 'שומר על האתר שלך חי ובריא: ניטור uptime, גיבויים אוטומטיים, עדכוני אבטחה, והתראות כשמשהו נשבר.',
    features: ['ניטור 24/7 עם התראות', 'גיבויים אוטומטיים יומיים', 'עדכוני תוספים ואבטחה', 'דוח בריאות אתר חודשי'],
    color: '#10B981',
  },
];

export default function ToolsShowcase() {
  return (
    <div className="tools-showcase">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={0}
        slidesPerView={1}
        loop
        dir="rtl"
      >
        {tools.map((tool) => (
          <SwiperSlide key={tool.name}>
            <div className="tool-slide">
              <div className="tool-slide-image">
                <div className="tool-placeholder" style={{ background: `linear-gradient(135deg, ${tool.color}22, ${tool.color}44)` }}>
                  <div className="tool-placeholder-icon" style={{ color: tool.color }}>
                    {tool.name.charAt(0)}
                  </div>
                  <div className="tool-placeholder-label">{tool.name}</div>
                </div>
              </div>
              <div className="tool-slide-content">
                <div className="tool-slide-tag">HELIX Tools</div>
                <h3 className="tool-slide-name">{tool.name}</h3>
                <p className="tool-slide-subtitle">{tool.subtitle}</p>
                <p className="tool-slide-desc">{tool.description}</p>
                <ul className="tool-slide-features">
                  {tool.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="tool-slide-price">500 &#8362; <small>/ לחודש</small></div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
