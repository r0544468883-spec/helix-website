'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  locale: string;
  googleLabel: string;
  errorLabel: string;
};

export default function AuthButtons({ locale, googleLabel, errorLabel }: Props) {
  const [failed, setFailed] = useState(false);

  // LinkedIn (linkedin_oidc) מושהה בכוונה עד שתאושר אפליקציה ב-LinkedIn
  // Developers. המחרוזות t.auth.linkedin נשארו ב-he.ts וב-en.ts, אז ההחזרה היא
  // כפתור נוסף כאן והרחבת ה-union ל-'google' | 'linkedin_oidc'.
  async function signIn(provider: 'google') {
    setFailed(false);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}`,
      },
    });
    // קודם הערך הוחזר ונזרק. provider שלא הופעל בדשבורד של Supabase מחזיר
    // validation_failed ("Unsupported provider"), והלחיצה פשוט לא עשתה כלום —
    // בלי הודעה ובלי ניווט. הסיבה האמיתית נכתבת לקונסול; למשתמש מוצגת ההודעה
    // הגנרית, כי "ההגדרה בצד השרת חסרה" הוא לא מידע שהוא יכול לפעול לפיו.
    if (error) {
      console.error('[AuthButtons] signInWithOAuth', provider, error.code ?? error.name, error.message);
      setFailed(true);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <button
        onClick={() => signIn('google')}
        className="bg-surface border border-border hover:border-brand text-ink font-semibold px-5 py-3 rounded-[10px] transition-colors"
      >
        {googleLabel}
      </button>
      {failed && (
        <p role="alert" className="text-red-400 text-[13px] text-center">
          {errorLabel}
        </p>
      )}
    </div>
  );
}
