'use client';

import Image from 'next/image';

const images = [
  '/testimonials/anon_2.png',
  '/testimonials/anon_3.png',
  '/testimonials/anon_4.png',
  '/testimonials/anon_5.png',
  '/testimonials/anon_6.png',
];

const doubled = [...images, ...images];

export default function TestimonialsMarquee() {
  return (
    <div className="testimonials-section">
      <div className="container">
        <p className="testimonials-label">זה מה שקורה בשוק. בדקנו.</p>
      </div>
      <div className="testimonials-marquee">
        <div className="testimonials-track">
          {doubled.map((src, i) => (
            <div key={i} className="testimonial-card">
              <Image
                src={src}
                alt="צילום מסך של תגובה מטושטשת"
                width={320}
                height={200}
                className="testimonial-img"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
