'use client';

import { useEffect, useRef } from 'react';

const tools = [
  'Google Ads', 'Meta', 'TikTok', 'LinkedIn', 'Shopify', 'WooCommerce',
  'WordPress', 'React', 'Node.js', 'Python', 'Next.js', 'AWS', 'GCP',
  'Docker', 'Figma', 'HubSpot', 'Ahrefs', 'GA4', 'n8n', 'Make',
  'Zapier', 'Claude', 'OpenAI', 'Gemini', 'Apollo', 'Cursor', 'Hotjar',
  'SendPulse', 'Canva', 'Stripe',
];

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  label: string;
  hue: number;
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

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.getBoundingClientRect().width;
    const H = () => canvas.getBoundingClientRect().height;

    // Sphere center and radius
    const cx = () => W() / 2;
    const cy = () => H() / 2;
    const sphereR = () => Math.min(W(), H()) * 0.42;

    // Init balls
    if (ballsRef.current.length === 0) {
      ballsRef.current = tools.map((label, i) => {
        const angle = (i / tools.length) * Math.PI * 2;
        const dist = Math.random() * 80 + 20;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          r: W() < 500 ? 18 : 26,
          label,
          hue: 155 + (i * 7) % 40,
        };
      });
    }

    const gravity = 0.15;
    const friction = 0.997;
    const bounce = 0.7;

    const animate = () => {
      const w = W();
      const h = H();
      const cxv = cx();
      const cyv = cy();
      const sR = sphereR();

      ctx.clearRect(0, 0, w, h);

      // Draw sphere
      ctx.beginPath();
      ctx.arc(cxv, cyv, sR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      const grad = ctx.createRadialGradient(cxv, cyv, 0, cxv, cyv, sR);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.03)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Slight rotation force
      const rotSpeed = 0.002;

      for (const ball of ballsRef.current) {
        ball.r = w < 500 ? 18 : 26;

        // Add slight circular motion
        const dx = ball.x;
        const dy = ball.y;
        ball.vx += -dy * rotSpeed + (Math.random() - 0.5) * 0.1;
        ball.vy += dx * rotSpeed + gravity * 0.3 + (Math.random() - 0.5) * 0.1;

        ball.vx *= friction;
        ball.vy *= friction;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Contain within sphere
        const dist = Math.sqrt(ball.x * ball.x + ball.y * ball.y);
        const maxDist = sR - ball.r - 4;
        if (dist > maxDist) {
          const nx = ball.x / dist;
          const ny = ball.y / dist;
          ball.x = nx * maxDist;
          ball.y = ny * maxDist;
          const dot = ball.vx * nx + ball.vy * ny;
          ball.vx -= 2 * dot * nx * bounce;
          ball.vy -= 2 * dot * ny * bounce;
        }

        // Ball-ball collision
        for (const other of ballsRef.current) {
          if (other === ball) continue;
          const ddx = ball.x - other.x;
          const ddy = ball.y - other.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          const minD = ball.r + other.r;
          if (d < minD && d > 0) {
            const nx = ddx / d;
            const ny = ddy / d;
            const overlap = (minD - d) / 2;
            ball.x += nx * overlap;
            ball.y += ny * overlap;
            other.x -= nx * overlap;
            other.y -= ny * overlap;
            const dvx = ball.vx - other.vx;
            const dvy = ball.vy - other.vy;
            const dot = dvx * nx + dvy * ny;
            ball.vx -= dot * nx * bounce;
            ball.vy -= dot * ny * bounce;
            other.vx += dot * nx * bounce;
            other.vy += dot * ny * bounce;
          }
        }

        // Draw ball
        const bx = cxv + ball.x;
        const by = cyv + ball.y;

        // Shadow
        ctx.beginPath();
        ctx.arc(bx + 2, by + 2, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fill();

        // Ball gradient
        const bGrad = ctx.createRadialGradient(bx - ball.r * 0.3, by - ball.r * 0.3, 0, bx, by, ball.r);
        bGrad.addColorStop(0, `hsla(${ball.hue}, 60%, 95%, 1)`);
        bGrad.addColorStop(1, `hsla(${ball.hue}, 50%, 88%, 1)`);
        ctx.beginPath();
        ctx.arc(bx, by, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.strokeStyle = `hsla(${ball.hue}, 40%, 78%, 0.6)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        const fontSize = ball.r < 22 ? 7 : 9;
        ctx.font = `600 ${fontSize}px Heebo, sans-serif`;
        ctx.fillStyle = '#1A1A1A';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Split long names
        const words = ball.label.split(' ');
        if (words.length > 1 && ball.r >= 22) {
          ctx.fillText(words[0], bx, by - fontSize * 0.45);
          ctx.fillText(words.slice(1).join(' '), bx, by + fontSize * 0.55);
        } else {
          ctx.fillText(ball.label, bx, by);
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="lotto-section">
      <div className="container">
        <h2 className="lotto-title">הכלים שעובדים בשבילנו</h2>
        <p className="lotto-subtitle">30 כלים. מערכת אחת. הכל תחת קורת גג אחת.</p>
      </div>
      <div className="lotto-container">
        <canvas ref={canvasRef} className="lotto-canvas" />
      </div>
    </section>
  );
}
