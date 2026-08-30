import type { ReactNode } from 'react';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import FAQItem from './FAQItem';

// Shared article chrome for the content-machine page types (compare / use-cases).
// Both follow the same skeleton — meta, H1, lede, answer-first TL;DR, {unique
// middle via children}, FAQ accordion, related links, CTA — so it lives once here
// (methodology §4 template). Page-specific JSON-LD stays in each page.
type ArticleShellProps = {
  category: string;
  title: string;
  lede: string;
  tldr: string;
  children: ReactNode; // the page's unique middle content
  faq: { q: string; a: string }[];
  related?: { label: string; href: string }[];
  ctaTitle: string;
  ctaText: string;
  backHref: string;
  backLabel: string;
  className?: string;
};

export default function ArticleShell({
  category,
  title,
  lede,
  tldr,
  children,
  faq,
  related,
  ctaTitle,
  ctaText,
  backHref,
  backLabel,
  className = '',
}: ArticleShellProps) {
  return (
    <article className={`article-single ${className}`.trim()}>
      <div className="container container-narrow">
        <div className="article-meta">
          <span className="category">{category}</span>
        </div>
        <h1>{title}</h1>
        <p className="article-lede">{lede}</p>

        <div className="article-tldr" data-role="tldr">
          <span className="article-tldr-label">בקצרה</span>
          <p>{tldr}</p>
        </div>

        {children}

        {faq.length > 0 && (
          <div className="article-faq">
            <h2>שאלות ותשובות</h2>
            <div className="faq-list">
              {faq.map((f, i) => (
                <FAQItem key={i} question={f.q}>{f.a}</FAQItem>
              ))}
            </div>
          </div>
        )}

        {related && related.length > 0 && (
          <div className="article-related">
            <h2>להעמיק בנושא</h2>
            <ul>
              {related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href}>{r.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="article-cta" data-role="cta">
          <h2>{ctaTitle}</h2>
          <p>{ctaText}</p>
          <a href={SITE.calendlyUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            לקביעת שיחה
          </a>
          <Link href={backHref} className="article-back">{backLabel}</Link>
        </div>
      </div>
    </article>
  );
}
