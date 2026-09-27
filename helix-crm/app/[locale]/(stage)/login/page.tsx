import { getDict } from '@/lib/i18n';
import AuthButtons from '@/components/AuthButtons';
import MagicLinkForm from '@/components/MagicLinkForm';

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const t = getDict(locale);

  // ?error= מגיע מ-/auth/callback, שקודם בלע כל כשל והפנה כאילו ההתחברות
  // הצליחה — המשתמש נחת מנותק בלי לדעת למה.
  const errorMessage =
    error === 'same_browser'
      ? t.auth.errorSameBrowser
      : error === 'expired'
        ? t.auth.errorExpired
        : error === 'denied'
          ? t.auth.errorDenied
          : error
            ? t.auth.errorGeneric
            : null;

  return (
    <div className="max-w-[480px] mx-auto px-5 pt-24 pb-10 flex flex-col items-center text-center">
      <h1 className="font-display text-[clamp(26px,5vw,36px)] font-extrabold tracking-tight">
        {t.auth.title}
      </h1>
      <p className="text-ink-secondary text-[16px] mt-2 mb-10">{t.auth.subtitle}</p>

      {errorMessage && (
        <p
          role="alert"
          className="w-full max-w-xs mb-6 rounded-[10px] border border-red-400/40 bg-red-400/10 px-4 py-3 text-[13px] text-red-400"
        >
          {errorMessage}
        </p>
      )}

      <MagicLinkForm
        locale={locale}
        labels={{
          emailPlaceholder: t.auth.emailPlaceholder,
          button: t.auth.magicButton,
          sending: t.auth.magicSending,
          sent: t.auth.magicSent,
          error: t.auth.magicError,
          notInvited: t.auth.magicNotInvited,
        }}
      />

      <div className="flex items-center gap-3 w-full max-w-xs my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-ink-muted text-[13px]">{t.auth.or}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <AuthButtons
        locale={locale}
        googleLabel={t.auth.google}
        errorLabel={t.auth.errorGeneric}
      />
    </div>
  );
}
