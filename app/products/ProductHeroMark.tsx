'use client';

import { useEffect, useRef } from 'react';

/** Glowing 3D HELIX emblem (Three.js + Bloom) in the product accent color. */
export default function ProductHeroMark({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf = 0, disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      if (disposed) return;

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const AC = new THREE.Color(accent);
      const NEON = AC.clone().lerp(new THREE.Color('#ffffff'), 0.35);

      const parent = canvas.parentElement as HTMLElement;
      const W = () => Math.max(parent.clientWidth, 320);
      const H = () => Math.max(parent.clientHeight, 320);

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W(), H());

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
      camera.position.set(0, 0, 7);

      const crystal = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.05, 0),
        new THREE.MeshStandardMaterial({ color: AC, metalness: 0.55, roughness: 0.15, emissive: AC, emissiveIntensity: 0.3, flatShading: true })
      );
      scene.add(crystal);
      const wire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.5, 1),
        new THREE.MeshBasicMaterial({ color: NEON, wireframe: true, transparent: true, opacity: 0.22 })
      );
      scene.add(wire);
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(3.2, 0.045, 16, 120),
        new THREE.MeshBasicMaterial({ color: NEON, transparent: true, opacity: 0.4 })
      );
      ring.rotation.x = 1.2;
      scene.add(ring);

      const pc = 220, pos = new Float32Array(pc * 3);
      for (let i = 0; i < pc; i++) {
        const r = 3.3 + Math.random() * 2.6, a = Math.random() * 6.28, b = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(b) * Math.cos(a);
        pos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
        pos[i * 3 + 2] = r * Math.cos(b);
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const sparks = new THREE.Points(pg, new THREE.PointsMaterial({ color: NEON, size: 0.05, transparent: true, opacity: 0.6 }));
      scene.add(sparks);

      scene.add(new THREE.AmbientLight(0x223344, 0.9));
      const l1 = new THREE.PointLight(NEON, 55, 40); l1.position.set(5, 4, 6); scene.add(l1);
      const l2 = new THREE.PointLight(0x66aaff, 18, 40); l2.position.set(-6, -3, 4); scene.add(l2);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.9, 0.6, 0.2));

      let t = 0;
      const tick = () => {
        if (disposed) return;
        t += reduce ? 0 : 0.006;
        crystal.rotation.y = t * 0.9; crystal.rotation.x = t * 0.5;
        wire.rotation.y = -t * 0.6; wire.rotation.z = t * 0.3;
        ring.rotation.z = t * 0.7; sparks.rotation.y = t * 0.25;
        composer.render();
        if (!reduce) raf = requestAnimationFrame(tick);
      };
      tick();

      const onResize = () => {
        camera.aspect = W() / H(); camera.updateProjectionMatrix();
        renderer.setSize(W(), H()); composer.setSize(W(), H());
      };
      window.addEventListener('resize', onResize);
      cleanup = () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(raf);
        renderer.dispose();
      };
    })();

    return () => { disposed = true; cancelAnimationFrame(raf); cleanup(); };
  }, [accent]);

  return <canvas ref={canvasRef} className="ph-mark-canvas" aria-hidden="true" />;
}
