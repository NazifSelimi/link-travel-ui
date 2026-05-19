import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            404
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            {t('notFound.title')}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {t('notFound.subtitle')}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('notFound.backHome')}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t('footer.links.contactSupport')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
