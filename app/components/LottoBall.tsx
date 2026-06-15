'use client';

import { useEffect, useRef } from 'react';

const tools = [
  'google-ads', 'meta', 'tiktok', 'linkedin', 'shopify', 'woocommerce',
  'wordpress', 'react', 'nodejs', 'python', 'nextjs', 'aws', 'gcp',
  'docker', 'figma', 'hubspot', 'ahrefs', 'n8n', 'make', 'zapier',
  'claude', 'openai', 'gemini', 'apollo', 'cursor', 'hotjar', 'canva',
  'stripe', 'perplexity', 'semrush', 'github',
];

function getExt(name: string) {
  if (['docker', 'perplexity', 'react', 'stripe'].includes(name)) return 'svg';
  return 'png';
}

interface Ball {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  img: HTMLImageElement | null;
}

export default function LottoBall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    // Ball size — BIG so logos are clearly visible
    const ballR = () => W() < 350 ? 16 : 21;

    // Machine layout — percentages of canvas
    const M = {
      padX: 0.08,      // side padding
      topBar: 0.08,    // top bar height
      glassTop: 0.12,  // glass starts
      glassBot: 0.80,  // glass ends
      midBar: 0.04,    // bar between glass and base
      baseBot: 0.98,   // base bottom
      pillar: 0.035,   // pillar width
    };

    // Initialize balls — spread inside glass area
    if (ballsRef.current.length === 0) {
      ballsRef.current = tools.map((name) => {
        const img = new Image();
        img.src = `/logos/${name}.${getExt(name)}`;
        return { x: 0, y: 0, vx: 0, vy: 0, r: 26, img };
      });
      setTimeout(() => {
        const w = W(); const h = H(); const r = ballR();
        const gL = w * (M.padX + M.pillar) + r + 4;
        const gR = w * (1 - M.padX - M.pillar) - r - 4;
        const gT = h * M.glassTop + r + 4;
        const gB = h * M.glassBot - r - 4;
        for (const ball of ballsRef.current) {
          ball.r = r;
          ball.x = gL + Math.random() * (gR - gL);
          ball.y = gT + Math.random() * (gB - gT);
        }
      }, 60);
    }

    // SLOW, gentle physics
    const gravity = 0.018;
    const friction = 0.988;
    const bounce = 0.25;
    const popChance = 0.0015;
    const popForce = 1.4;

    const emerald = '#10B981';
    const emeraldMid = '#059669';
    const emeraldDark = '#047857';

    // Mouse/touch interaction — pop ball on hover/touch
    const getCanvasPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const popBallAt = (px: number, py: number) => {
      for (const ball of ballsRef.current) {
        const dx = ball.x - px;
        const dy = ball.y - py;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < ball.r + 5) {
          ball.vy = -(1.5 + Math.random() * 0.8);
          ball.vx += (Math.random() - 0.5) * 0.6;
          break;
        }
      }
    };

    const onMove = (e: MouseEvent) => { const p = getCanvasPos(e); popBallAt(p.x, p.y); };
    const onTouch = (e: TouchEvent) => { const p = getCanvasPos(e); popBallAt(p.x, p.y); };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchstart', onTouch, { passive: true });
    canvas.style.cursor = 'pointer';

    const animate = () => {
      const w = W(); const h = H(); const r = ballR();
      ctx.clearRect(0, 0, w, h);

      // Machine coordinates
      const mL = w * M.padX;              // machine left
      const mR = w * (1 - M.padX);        // machine right
      const mW = mR - mL;                 // machine width
      const pW = w * M.pillar;            // pillar width
      const topY = 0;
      const topBarBot = h * M.topBar;
      const glassT = h * M.glassTop;
      const glassB = h * M.glassBot;
      const midBarBot = glassB + h * M.midBar;
      const baseBot = h * M.baseBot;

      // Glass inner bounds (where balls live)
      const gL = mL + pW + r + 3;
      const gR = mR - pW - r - 3;
      const gT = glassT + r + 3;
      const gB = glassB - r - 3;

      // === DRAW MACHINE ===

      // Top bar
      ctx.fillStyle = emeraldMid;
      const topRad = Math.min(10, mW * 0.03);
      ctx.beginPath();
      ctx.roundRect(mL - 3, topY, mW + 6, topBarBot, [topRad, topRad, 0, 0]);
      ctx.fill();
      ctx.fillStyle = emeraldDark;
      ctx.fillRect(mL - 3, topBarBot * 0.7, mW + 6, topBarBot * 0.12);

      // Left pillar
      ctx.fillStyle = emerald;
      ctx.fillRect(mL, topBarBot, pW, glassB - topBarBot);
      // Right pillar
      ctx.fillRect(mR - pW, topBarBot, pW, glassB - topBarBot);

      // Glass background
      ctx.fillStyle = 'rgba(240, 253, 244, 0.25)';
      ctx.fillRect(mL + pW, glassT, mW - pW * 2, glassB - glassT);

      // Glass reflections
      ctx.save();
      ctx.globalAlpha = 0.07;
      ctx.fillStyle = '#fff';
      ctx.fillRect(mL + pW + mW * 0.06, glassT, mW * 0.08, glassB - glassT);
      ctx.globalAlpha = 0.04;
      ctx.fillRect(mL + pW + mW * 0.2, glassT, mW * 0.04, glassB - glassT);
      ctx.restore();

      // Middle bar
      ctx.fillStyle = emeraldMid;
      ctx.fillRect(mL - 2, glassB, mW + 4, midBarBot - glassB);

      // Base
      ctx.fillStyle = emeraldDark;
      ctx.beginPath();
      ctx.roundRect(mL - 10, midBarBot, mW + 20, baseBot - midBarBot, [0, 0, 8, 8]);
      ctx.fill();

      // HELIX. on base
      const lblSize = Math.max(12, mW * 0.07);
      ctx.font = `900 ${lblSize}px Heebo, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('HELIX.', w / 2, midBarBot + (baseBot - midBarBot) * 0.62);

      // Dispense bucket
      const bW = mW * 0.16;
      ctx.fillStyle = emeraldDark;
      ctx.beginPath();
      ctx.moveTo(w / 2 - bW / 2 + 3, topBarBot + 2);
      ctx.lineTo(w / 2 + bW / 2 - 3, topBarBot + 2);
      ctx.lineTo(w / 2 + bW / 2 + 1, topBarBot + 14);
      ctx.lineTo(w / 2 - bW / 2 - 1, topBarBot + 14);
      ctx.closePath();
      ctx.fill();

      // === PHYSICS ===
      for (const ball of ballsRef.current) {
        ball.r = r;

        // Gravity — gentle
        ball.vy += gravity;

        // Rare gentle pop
        if (Math.random() < popChance) {
          ball.vy = -(popForce * (0.4 + Math.random() * 0.4));
          ball.vx += (Math.random() - 0.5) * 0.3;
        }

        ball.vx *= friction;
        ball.vy *= friction;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Strict containment — NEVER escape glass area
        if (ball.x < gL) { ball.x = gL; ball.vx = Math.abs(ball.vx) * bounce; }
        if (ball.x > gR) { ball.x = gR; ball.vx = -Math.abs(ball.vx) * bounce; }
        if (ball.y < gT) { ball.y = gT; ball.vy = Math.abs(ball.vy) * bounce; }
        if (ball.y > gB) { ball.y = gB; ball.vy = -Math.abs(ball.vy) * bounce * 0.15; ball.vx *= 0.9; }

        // Ball-ball collision — gentle
        for (const other of ballsRef.current) {
          if (other === ball) continue;
          const dx = ball.x - other.x;
          const dy = ball.y - other.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const minD = ball.r + other.r + 1;
          if (d < minD && d > 0.1) {
            const nx = dx / d; const ny = dy / d;
            const overlap = (minD - d) / 2;
            ball.x += nx * overlap; ball.y += ny * overlap;
            other.x -= nx * overlap; other.y -= ny * overlap;
            const dvx = ball.vx - other.vx; const dvy = ball.vy - other.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              ball.vx -= dot * nx * bounce; ball.vy -= dot * ny * bounce;
              other.vx += dot * nx * bounce; other.vy += dot * ny * bounce;
            }
          }
        }

        // === DRAW BALL ===
        ctx.save();

        // Soft shadow
        ctx.beginPath();
        ctx.arc(ball.x + 1, ball.y + 1.5, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fill();

        // White ball with emerald tint
        const bGrad = ctx.createRadialGradient(ball.x - r * 0.25, ball.y - r * 0.25, 0, ball.x, ball.y, r);
        bGrad.addColorStop(0, '#ffffff');
        bGrad.addColorStop(1, '#f0fdf4');
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(16,185,129,0.1)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Logo — LARGE, fills most of the ball
        if (ball.img && ball.img.complete && ball.img.naturalWidth > 0) {
          const s = r * 1.5;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, r - 1, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(ball.img, ball.x - s / 2, ball.y - s / 2, s, s);
        }
        ctx.restore();
      }

      // Glass overlay tint
      ctx.save();
      ctx.globalAlpha = 0.03;
      ctx.fillStyle = emerald;
      ctx.fillRect(mL + pW, glassT, mW - pW * 2, glassB - glassT);
      ctx.restore();

      // Glass border
      ctx.strokeStyle = 'rgba(16,185,129,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(mL + pW, glassT, mW - pW * 2, glassB - glassT);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
    };
  }, []);

  return (
    <section className="lotto-section">
      <div className="container">
        <h2 className="lotto-title">הכלים שעובדים בשבילנו</h2>
        <p className="lotto-subtitle">31 כלים. מערכת אחת. הכל תחת קורת גג אחת.</p>
      </div>
      <div className="popcorn-canvas-only">
        <canvas ref={canvasRef} className="lotto-canvas" />
      </div>
    </section>
  );
}
