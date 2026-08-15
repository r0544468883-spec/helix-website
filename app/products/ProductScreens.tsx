'use client';

import { useEffect, useRef, useState } from 'react';
import { EmojiIcon } from '@/lib/emoji-icon';

type Props = { slug: string; accent: string; views: string[] };

export default function ProductScreens({ slug, accent, views }: Props) {
  const [vi, setVi] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const src = (i: number) => `/product-shots/${slug}-${i + 1}.jpg`;

  const restart = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setVi((v) => (v + 1) % 5), 3400);
  };
  useEffect(() => {
    restart();
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  // cursor parallax tilt
  useEffect(() => {
    const stage = stageRef.current, rig = rigRef.current;
    if (!stage || !rig) return;
    const bx = 6, by = -15;
    const set = (rx: number, ry: number) => { rig.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotate(-1deg)`; };
    set(bx, by);
    const move = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      set(bx - dy * 9, by + dx * 11);
    };
    const leave = () => set(bx, by);
    stage.addEventListener('mousemove', move);
    stage.addEventListener('mouseleave', leave);
    return () => { stage.removeEventListener('mousemove', move); stage.removeEventListener('mouseleave', leave); };
  }, []);

  const pick = (i: number) => { setVi(i); restart(); };

  return (
    <section className="ps-screens" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <div className="ps-screens-head">
          <span className="sp-section-eyebrow">מבט מבפנים</span>
          <h2 className="ps-screens-title">המערכת ש<em>עושה את העבודה</em></h2>
          <p className="ps-screens-sub">5 מסכים, זרימה אחת. הזיזו את העכבר על המסך.</p>
        </div>

        <div className="ps-stage" ref={stageRef}>
          <div className="ps-rig" ref={rigRef}>
            <div className="ps-glow" />
            <div className="ps-frame">
              <div className="ps-bar">
                <span className="ps-dot" style={{ background: '#FF5F57' }} />
                <span className="ps-dot" style={{ background: '#FEBC2E' }} />
                <span className="ps-dot" style={{ background: '#28C840' }} />
                <span className="ps-url"><EmojiIcon e="🔒" /> app.helix.co.il/<b>{slug}</b></span>
              </div>
              <div className="ps-screen">
                {[0, 1, 2, 3, 4].map((i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src(i)} alt={views[i]} className={i === vi ? 'show' : ''} loading="lazy" />
                ))}
              </div>
            </div>
            <div className="ps-refl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(vi)} alt="" />
            </div>
          </div>
        </div>

        <div className="ps-cap">{views[vi]}</div>

        <div className="ps-thumbs">
          {views.map((v, i) => (
            <button key={v} className={`ps-thumb ${i === vi ? 'on' : ''}`} onClick={() => pick(i)} aria-label={v}>
              <span className="ps-thumb-n">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(i)} alt={v} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
