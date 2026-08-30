import type { ReactNode } from 'react';

interface FAQItemProps {
  question: string;
  children: ReactNode;
}

export default function FAQItem({ question, children }: FAQItemProps) {
  return (
    <details className="faq-item">
      <summary>
        <span>{question}</span>
        <span className="faq-icon" aria-hidden="true">+</span>
      </summary>
      <div className="faq-answer">{children}</div>
    </details>
  );
}
