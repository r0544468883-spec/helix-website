import { getDict } from '@/lib/i18n';

// An unknown code or a draft: nothing about any business or amount, in Hebrew and
// English (a not-found page has no locale param to read).
export default function QuoteNotFound() {
  const he = getDict('he').crm;
  const en = getDict('en').crm;
  return (
    <main id="main-content" className="min-h-screen bg-bg">
      <div className="max-w-[560px] mx-auto px-4 py-16 text-center">
        <p className="font-bold text-[18px]" dir="rtl">{he.docNotFound}</p>
        <p className="text-ink-secondary text-[14px] mt-1" dir="rtl">{he.docNotFoundHint}</p>
        <p className="font-bold text-[16px] mt-8" dir="ltr" lang="en">{en.docNotFound}</p>
        <p className="text-ink-secondary text-[14px] mt-1" dir="ltr" lang="en">{en.docNotFoundHint}</p>
      </div>
    </main>
  );
}
