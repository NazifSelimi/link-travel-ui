import { Link, useParams } from 'react-router-dom';
import { Calendar, Check, ChevronLeft, MapPin, Star, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/money';
import { useGetPackageQuery } from '@/store/linktravelApi';

export default function PackageDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: currentPackage, isLoading } = useGetPackageQuery(id ?? '', {
    skip: !id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!currentPackage) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <h1 className="font-serif text-3xl font-bold text-foreground">{t('detail.packageNotFound')}</h1>
            <p className="mt-3 text-muted-foreground">
              {t('detail.packageNotFoundBody')}
            </p>
            <Link
              to="/packages"
              className="mt-6 inline-flex items-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t('detail.backToPackages')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const heroImage = currentPackage.images?.[0] || currentPackage.image || '/placeholder.svg';

  return (
    <div className="min-h-screen bg-background py-8 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/packages"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('detail.backToPackages')}
        </Link>

        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <img
            src={heroImage}
            alt={currentPackage.name}
            className="h-80 w-full object-cover lg:h-[28rem]"
          />
          <div className="grid gap-10 p-8 lg:grid-cols-[2fr_1fr]">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  {t('detail.reviewsLabel', { rating: currentPackage.rating, count: currentPackage.reviewCount })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {currentPackage.destinationName || currentPackage.destination?.name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {currentPackage.duration}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {currentPackage.groupSize}
                </span>
              </div>

              <h1 className="font-serif text-4xl font-bold text-foreground">
                {currentPackage.name}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                {currentPackage.description}
              </p>

              <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground">{t('detail.whatsIncluded')}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {currentPackage.includes.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4"
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-background p-6">
              <p className="text-sm text-muted-foreground">{t('detail.packagePrice')}</p>
              {currentPackage.originalPrice && (
                <p className="mt-2 text-sm text-muted-foreground line-through">
                  {formatCurrency(currentPackage.originalPrice, currentPackage.destination?.currency || 'EUR')}
                </p>
              )}
              <p className="mt-1 text-4xl font-bold text-foreground">
                {formatCurrency(currentPackage.price, currentPackage.destination?.currency || 'EUR')}
              </p>
              <p className="text-sm text-muted-foreground">{t('detail.perPerson')}</p>

              <Link
                to={`/booking?package=${currentPackage.id}`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('detail.bookPackage')}
              </Link>
              <Link
                to="/contact"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {t('detail.askQuestion')}
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
