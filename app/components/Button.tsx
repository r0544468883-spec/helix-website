import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'text';
type Arrow = 'left' | 'down' | null;

interface ButtonProps {
  variant?: Variant;
  href?: string;
  type?: 'button' | 'submit';
  arrow?: Arrow;
  className?: string;
  children: ReactNode;
}

const arrowGlyph = (arrow: Arrow) =>
  arrow === 'down' ? '↓' : arrow === 'left' ? '←' : null;

export default function Button({
  variant = 'primary',
  href,
  type = 'button',
  arrow = null,
  className,
  children,
}: ButtonProps) {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
  const glyph = arrowGlyph(arrow);

  if (href) {
    const isHttp = href.startsWith('http');
    const external = isHttp || href.startsWith('mailto:') || href.startsWith('#');
    const Tag = external ? 'a' : Link;
    const externalProps = isHttp ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <Tag href={href} className={classes} {...externalProps}>
        {children}
        {glyph && <span className="btn-arrow">{glyph}</span>}
      </Tag>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
      {glyph && <span className="btn-arrow">{glyph}</span>}
    </button>
  );
}
