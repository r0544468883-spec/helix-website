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
    const ballR = () => Math.max(16, Math.min(22, W() * 0.055));

    // Pre-load all logos
    if (ballsRef.current.length === 0) {
      ballsRef.current = tools.map((name) => {
        const img = new Image();
        img.src = `/logos/${name}.${getExt(name)}`;
        return { x: 0, y: 0, vx: 0, vy: 0, r: 22, img };
      });
    }

    // Place balls inside sphere on first run
    const placed = { done: false };
    setTimeout(() => {
      const w = W(); const h = H();
      const cx = w / 2; const cy = h / 2;
      const sr = Math.min(w, h) * 0.43;
      const r = ballR();
      for (const ball of ballsRef.current) {
        ball.r = r;
        let tries = 0;
        do {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * (sr - r - 4);
          ball.x = cx + Math.cos(angle) * dist;
          ball.y = cy + Math.sin(angle) * dist;
          tries++;
        } while (tries < 30);
        ball.vx = (Math.random() - 0.5) * 0.8;
        ball.vy = (Math.random() - 0.5) * 0.8;
      }
      placed.done = true;
    }, 60);

    const gravity = 0.012;
    const friction = 0.992;
    const bounce  = 0.4;
    const popChance = 0.001;

    // Hover interaction
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      return { x: cx - rect.left, y: cy - rect.top };
    };
    const popAt = (px: number, py: number) => {
      for (const b of ballsRef.current) {
        const d = Math.hypot(b.x - px, b.y - py);
        if (d < b.r + 8) {
          b.vy = -(1.6 + Math.random());
          b.vx += (Math.random() - 0.5) * 1.2;
          break;
        }
      }
    };
    const onMove  = (e: MouseEvent)  => { const p = getPos(e); popAt(p.x, p.y); };
    const onTouch = (e: TouchEvent)  => { const p = getPos(e); popAt(p.x, p.y); };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchstart', onTouch, { passive: true });
    canvas.style.cursor = 'pointer';

    const animate = () => {
      const w = W(); const h = H();
      const cx = w / 2; const cy = h / 2;
      const sr = Math.min(w, h) * 0.43; // sphere radius
      const r  = ballR();

      ctx.clearRect(0, 0, w, h);

      // === DRAW SPHERE ===

      // Outer glow ring
      const glowGrad = ctx.createRadialGradient(cx, cy, sr * 0.85, cx, cy, sr + 20);
      glowGrad.addColorStop(0, 'rgba(16,185,129,0.18)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, sr + 20, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Glass fill
      const bgGrad = ctx.createRadialGradient(cx - sr * 0.3, cy - sr * 0.3, 0, cx, cy, sr);
      bgGrad.addColorStop(0, 'rgba(240,253,244,0.10)');
      bgGrad.addColorStop(0.6, 'rgba(16,185,129,0.04)');
      bgGrad.addColorStop(1, 'rgba(4,120,87,0.08)');
      ctx.beginPath();
      ctx.arc(cx, cy, sr, 0, Math.PI * 2);
      ctx.fillStyle = bgGrad;
      ctx.fill();

      // Sphere border
      ctx.beginPath();
      ctx.arc(cx, cy, sr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16,185,129,0.50)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glass shine highlight (top-left arc)
      ctx.beginPath();
      ctx.arc(cx - sr * 0.15, cy - sr * 0.15, sr * 0.72, Math.PI * 1.1, Math.PI * 1.65);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = sr * 0.08;
      ctx.stroke();

      // === PHYSICS & DRAW BALLS ===
      for (const ball of ballsRef.current) {
        ball.r = r;

        // Gentle gravity + rare pop
        ball.vy += gravity;
        if (Math.random() < popChance) {
          ball.vy = -(1.2 + Math.random() * 0.6);
          ball.vx += (Math.random() - 0.5) * 0.5;
        }

        // Gentle swirl
        const dx = ball.x - cx; const dy = ball.y - cy;
        ball.vx += -dy * 0.0003;
        ball.vy +=  dx * 0.0003;

        ball.vx *= friction;
        ball.vy *= friction;
        ball.x  += ball.vx;
        ball.y  += ball.vy;

        // Contain inside sphere
        const dist = Math.hypot(ball.x - cx, ball.y - cy);
        const maxDist = sr - r - 2;
        if (dist > maxDist) {
          const angle = Math.atan2(ball.y - cy, ball.x - cx);
          ball.x = cx + Math.cos(angle) * maxDist;
          ball.y = cy + Math.sin(angle) * maxDist;
          const dot = ball.vx * Math.cos(angle) + ball.vy * Math.sin(angle);
          ball.vx -= (1 + bounce) * dot * Math.cos(angle);
          ball.vy -= (1 + bounce) * dot * Math.sin(angle);
          ball.vx *= 0.85; ball.vy *= 0.85;
        }

        // Ball–ball collision
        for (const other of ballsRef.current) {
          if (other === ball) continue;
          const ddx = ball.x - other.x; const ddy = ball.y - other.y;
          const d = Math.hypot(ddx, ddy);
          const minD = ball.r + other.r + 1;
          if (d < minD && d > 0.01) {
            const nx = ddx / d; const ny = ddy / d;
            const overlap = (minD - d) / 2;
            ball.x += nx * overlap; ball.y += ny * overlap;
            other.x -= nx * overlap; other.y -= ny * overlap;
            const relVx = ball.vx - other.vx; const relVy = ball.vy - other.vy;
            const dot = relVx * nx + relVy * ny;
            if (dot > 0) {
              ball.vx -= dot * nx * bounce; ball.vy -= dot * ny * bounce;
              other.vx += dot * nx * bounce; other.vy += dot * ny * bounce;
            }
          }
        }

        // Draw ball
        ctx.save();

        // Soft shadow
        ctx.beginPath();
        ctx.arc(ball.x + 1, ball.y + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fill();

        // White ball gradient
        const bGrad = ctx.createRadialGradient(
          ball.x - r * 0.28, ball.y - r * 0.28, r * 0.05,
          ball.x, ball.y, r
        );
        bGrad.addColorStop(0, '#ffffff');
        bGrad.addColorStop(1, '#e8faf2');
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        ctx.fillStyle = bGrad;
        ctx.fill();

        // Logo
        if (ball.img?.complete && ball.img.naturalWidth > 0) {
          const s = r * 1.55;
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, r - 1, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(ball.img, ball.x - s / 2, ball.y - s / 2, s, s);
        }

        // Subtle ball rim
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16,185,129,0.12)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      }

      // Sphere inner edge vignette (draw over balls at edges for depth)
      const vigGrad = ctx.createRadialGradient(cx, cy, sr * 0.55, cx, cy, sr);
      vigGrad.addColorStop(0, 'transparent');
      vigGrad.addColorStop(1, 'rgba(18,20,19,0.45)');
      ctx.beginPath();
      ctx.arc(cx, cy, sr, 0, Math.PI * 2);
      ctx.fillStyle = vigGrad;
      ctx.fill();

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
