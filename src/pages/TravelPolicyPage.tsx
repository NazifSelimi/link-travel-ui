import { Download, FileText, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  agencyContact,
  localizedPolicySummaries,
  reservationPolicySummary,
  travelPolicyPdfPath,
} from '@/lib/policy';

export default function TravelPolicyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-slate-950 py-16 text-white lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.22),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(30,41,59,0.98))]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/75">
              {t('policy.badge')}
            </span>
            <h1 className="mt-6 font-serif text-4xl font-bold md:text-5xl">
              {t('policy.heroTitle')}
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/75">
              {t('policy.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={travelPolicyPdfPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <FileText className="mr-2 h-4 w-4" />
                {t('policy.openPdf')}
              </a>
              <a
                href={travelPolicyPdfPath}
                download
                className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('policy.downloadPdf')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.35fr_0.65fr] lg:px-8">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{t('policy.noticeTitle')}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t('policy.noticeBody')}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {reservationPolicySummary.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {localizedPolicySummaries.map((summary) => (
                <article key={summary.language} className="rounded-2xl border border-border bg-card p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {summary.language}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{summary.title}</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    {summary.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-muted/40 p-6">
            <h2 className="text-lg font-semibold text-foreground">{t('policy.needHelp')}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t('policy.needHelpBody')}
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <a href={`tel:${agencyContact.phone.replaceAll(' ', '')}`} className="flex items-center gap-2 text-foreground hover:text-primary">
                <Phone className="h-4 w-4" />
                {agencyContact.phone}
              </a>
              <a href={`mailto:${agencyContact.email}`} className="flex items-center gap-2 text-foreground hover:text-primary">
                <Mail className="h-4 w-4" />
                {agencyContact.email}
              </a>
              <p className="flex items-center gap-2 text-foreground">
                <MapPin className="h-4 w-4" />
                {agencyContact.address}
              </p>
            </div>
            <Link
              to="/contact"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('policy.contactAgency')}
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}
