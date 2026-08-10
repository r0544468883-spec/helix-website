'use client';

// An open book whose page keeps turning — the glossary's visual in the blog,
// the counterpart to each article's ArticleChart tile. Pure CSS 3D, accent-tinted,
// speeds up on hover, and stills entirely for reduced-motion users.
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
          background-image: repeating-linear-gradient(transparent 0 9px, rgba(0,0,0,.08) 9px 10px), linear-gradient(#ffffff,#eef1f4);
          background-size:100% 13px,100% 100%;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
        .gb-left{ left:0; border-radius:7px 2px 2px 7px; }
        .gb-right{ right:0; border-radius:2px 7px 7px 2px; }
        .gb-spine{ position:absolute; top:-3px; bottom:-3px; left:50%; width:4px; transform:translateX(-50%);
          background:var(--brand,#10b981); border-radius:4px; box-shadow:0 4px 14px -4px var(--brand,#10b981); }
        .gb-flip{ position:absolute; top:0; right:0; height:100%; width:50%;
          transform-origin:left center; backface-visibility:hidden; border-radius:2px 7px 7px 2px;
          background-image: repeating-linear-gradient(transparent 0 9px, rgba(0,0,0,.07) 9px 10px), linear-gradient(#ffffff,#e7eaee);
          background-size:100% 13px,100% 100%;
          box-shadow:0 8px 22px -10px rgba(0,0,0,.45);
          animation: gbflip 3.6s cubic-bezier(.45,0,.55,1) infinite; }
        @keyframes gbflip{ 0%,16%{ transform:rotateY(0deg);} 50%,66%{ transform:rotateY(-168deg);} 100%{ transform:rotateY(0deg);} }
        .article-featured:hover .gb-flip{ animation-duration:1.7s; }
        @media (prefers-reduced-motion:reduce){ .gb-flip{ animation:none; transform:rotateY(-30deg); } }
      `}</style>
    </div>
  );
}
