'use client';

// An open book whose page keeps turning — the glossary's visual in the blog,
// the counterpart to each article's ArticleChart tile. HELIX-green book with a
// black frame, spine and text-lines. Pure CSS 3D, slow calm pace, faster on
// hover, still for reduced-motion users.
export default function GlossaryBook() {
  return (
    <div className="gb-scene" aria-hidden>
      <div className="gb-book">
        <div className="gb-page gb-left" />
        <div className="gb-page gb-right" />
        <div className="gb-flip" />
        <div className="gb-spine" />
      </div>
      <style>{`
        .gb-scene{ perspective:1200px; width:min(78%,340px); aspect-ratio:16/10; display:grid; place-items:center; }
        .gb-book{ position:relative; width:100%; height:80%; transform-style:preserve-3d; transform:rotateX(14deg); }
        .gb-page{ position:absolute; top:0; height:100%; width:50%;
          background-image: repeating-linear-gradient(transparent 0 9px, rgba(0,0,0,.5) 9px 10px), linear-gradient(150deg, var(--brand,#10b981), color-mix(in srgb, var(--brand,#10b981) 60%, #000));
          background-size:100% 13px,100% 100%;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.7); }
        .gb-left{ left:0; border-radius:7px 2px 2px 7px; }
        .gb-right{ right:0; border-radius:2px 7px 7px 2px; }
        .gb-spine{ position:absolute; top:-3px; bottom:-3px; left:50%; width:4px; transform:translateX(-50%);
          background:#050505; border-radius:4px; box-shadow:0 4px 16px -4px rgba(0,0,0,.7); }
        .gb-flip{ position:absolute; top:0; right:0; height:100%; width:50%;
          transform-origin:left center; backface-visibility:hidden; border-radius:2px 7px 7px 2px;
          background-image: repeating-linear-gradient(transparent 0 9px, rgba(0,0,0,.5) 9px 10px), linear-gradient(150deg, color-mix(in srgb, var(--brand,#10b981) 82%, #000), color-mix(in srgb, var(--brand,#10b981) 52%, #000));
          background-size:100% 13px,100% 100%;
          box-shadow:-2px 0 18px -8px rgba(0,0,0,.6); border:1px solid rgba(0,0,0,.7);
          animation: gbflip 7s cubic-bezier(.5,0,.5,1) infinite; }
        @keyframes gbflip{ 0%,20%{ transform:rotateY(0deg);} 55%,72%{ transform:rotateY(-168deg);} 100%{ transform:rotateY(0deg);} }
        .article-featured:hover .gb-flip{ animation-duration:3.4s; }
        @media (prefers-reduced-motion:reduce){ .gb-flip{ animation:none; transform:rotateY(-30deg); } }
      `}</style>
    </div>
  );
}
