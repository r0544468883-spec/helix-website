'use client';

import { useEffect, useRef } from 'react';

export default function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);
    syncSize();

    const vs = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `
precision highp float;
varying vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec4(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw), 0.0), 0.0).xyz;
  m = m*m; m = m*m;
  vec3 x2 = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x2) - 0.5;
  vec3 a0 = x2 - floor(x2 + 0.5);
  vec3 g = a0 * vec3(m.x) + h * vec3(m.y, x12.xz);
  return 130.0 * dot(m, vec3(dot(g.x, x0), dot(g.y, x12.xy), dot(g.z, x12.zw)));
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;

  vec2 mouse = u_mouse / u_resolution * 2.0 - 1.0;
  mouse.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.18;

  // Very dark base — HELIX dark
  vec3 color = vec3(0.071, 0.078, 0.075);

  // Noise layers — slow organic movement
  float n1 = snoise(p * 0.7 + vec2(t * 0.4, t * 0.25) + mouse * 0.15);
  float n2 = snoise(p * 1.1 - vec2(t * 0.3, t * 0.5));
  float n3 = snoise(p * 0.45 + vec2(sin(t * 0.7), cos(t * 0.5)) * 0.6);
  float n4 = snoise(p * 0.9 + vec2(t * 0.2, -t * 0.35));

  // HELIX emerald palette
  vec3 emerald     = vec3(0.063, 0.725, 0.506); // #10B981
  vec3 neon        = vec3(0.086, 1.0,   0.671); // #16FFAB
  vec3 darkTeal    = vec3(0.02,  0.25,  0.18);
  vec3 deepGreen   = vec3(0.01,  0.15,  0.10);

  float shape1 = smoothstep(0.05, 0.45, n1);
  float shape2 = smoothstep(0.15, 0.55, n2);
  float shape3 = smoothstep(0.0,  0.6,  n3);
  float shape4 = smoothstep(0.1,  0.5,  n4);

  // Stronger intensities so the effect is clearly visible on dark bg
  color = mix(color, darkTeal,   shape1 * 0.85);
  color = mix(color, deepGreen,  shape2 * 0.6);
  color = mix(color, emerald,    shape3 * 0.28);
  color = mix(color, neon,       (shape1 * shape3) * 0.14);
  color = mix(color, emerald,    shape4 * 0.18);

  // Vignette — darker edges
  float vignette = 1.0 - smoothstep(0.4, 1.3, length(p * 0.65));
  color *= vignette * 0.85 + 0.15;

  gl_FragColor = vec4(color, 1.0);
}`;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime  = gl.getUniformLocation(prog, 'u_time');
    const uRes   = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width  * canvas.width;
      mouse.y = (1 - (e.clientY - rect.top) / rect.height) * canvas.height;
    };
    window.addEventListener('mousemove', onMouseMove);

    let rafId: number;
    function render(t: number) {
      syncSize();
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime,  t * 0.001);
      gl!.uniform2f(uRes,   canvas!.width, canvas!.height);
      gl!.uniform2f(uMouse, mouse.x, mouse.y);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafId = requestAnimationFrame(render);
    }
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
      }}
    />
  );
}
