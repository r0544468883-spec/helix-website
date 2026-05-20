import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title?: string;
  titleHtml?: string;
  description?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  children?: ReactNode;
}

export default function SectionHeader({
  eyebrow,
  title,
  titleHtml,
  description,
  as: Tag = 'h2',
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={['section-header', className].filter(Boolean).join(' ')}>
      {eyebrow && <span className="section-tag">{eyebrow}</span>}
      {titleHtml ? (
        <Tag className="section-title" dangerouslySetInnerHTML={{ __html: titleHtml }} />
      ) : title ? (
        <Tag className="section-title">{title}</Tag>
      ) : null}
      {description && <p className="section-desc">{description}</p>}
      {children}
    </div>
  );
}
