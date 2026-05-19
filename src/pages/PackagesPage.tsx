import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, MapPin, Star, Clock, Check, ChevronRight } from 'lucide-react';
import { Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/money';
import { useGetPackagesQuery } from '@/store/linktravelApi';

const categoryKeys = ['all', 'beach', 'cultural', 'adventure'] as const;
const whyBookKeys = ['bestValue', 'noHiddenFees', 'clearConditions', 'support'] as const;

export default function PackagesPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const destinationId = searchParams.get('destination') || undefined;
  const search = searchParams.get('search') || undefined;

  useEffect(() => {
    setActiveCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  const { data, isLoading } = useGetPackagesQuery({
    destination_id: destinationId,
    search,
    sort_by: 'rating',
  });

  const packages = (data?.items ?? []).filter((pkg) =>
    activeCategory === 'all' ? true : pkg.category.toLowerCase().includes(activeCategory),
  );

  const featuredPkg = packages.find((p) => p.featured) || packages[0];
  const categories = categoryKeys.map((key) => ({
    key,
    label: t(`packages.page.categories.${key}`),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              {t('packages.page.title')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('packages.page.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Package */}
      {featuredPkg && (
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={featuredPkg.image || 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1920'}
              alt={t('packages.page.featuredPackage')}
              className="h-[400px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-xl px-8 md:px-12">
                <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold mb-4">
                  {t('packages.page.featuredPackage')}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-background">
                  {featuredPkg.name}
                </h2>
                <p className="mt-4 text-background/80">
                  {featuredPkg.description}
                </p>
                <div className="mt-6 flex items-center gap-6">
                  {featuredPkg.originalPrice && (
                  <div>
                    <p className="text-background/60 line-through">{formatCurrency(featuredPkg.originalPrice, featuredPkg.destination?.currency || 'EUR')}</p>
                    <p className="text-3xl font-bold text-background">{formatCurrency(featuredPkg.price, featuredPkg.destination?.currency || 'EUR')}</p>
                  </div>
                  )}
                  <Link
                    to={`/packages/${featuredPkg.id}`}
                    className="inline-flex items-center px-6 py-3 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    {t('packages.page.viewPackage')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Packages Grid */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <Tabs
            activeKey={activeCategory}
            onChange={setActiveCategory}
            items={categories}
            className="mb-8"
          />

          {destinationId && (
            <p className="mb-6 text-sm text-muted-foreground">
              {t('packages.page.showingForDestination')}
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-muted h-96" />
                ))
              : packages.map((pkg) => (
              <div key={pkg.id} className="overflow-hidden rounded-2xl border border-border bg-card group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.image || '/placeholder.svg'}
                    alt={pkg.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {pkg.featured && (
                    <span className="absolute top-3 left-3 inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                      {t('packages.page.bestSeller')}
                    </span>
                  )}
                  {pkg.originalPrice && (
                  <div className="absolute top-3 right-3 rounded-full bg-background/90 px-2 py-1 text-xs font-medium">
                    {t('packages.page.saveAmount', { amount: formatCurrency(pkg.originalPrice - pkg.price, pkg.destination?.currency || 'EUR') })}
                  </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium text-foreground">{pkg.rating}</span>
                    <span>({pkg.reviewCount} {t('common.review', { count: pkg.reviewCount })})</span>
                  </div>

                  <h3 className="font-semibold text-lg text-foreground">{pkg.name}</h3>

                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {pkg.destinationName}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {pkg.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {pkg.groupSize}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">{t('packages.page.includes')}</p>
                    <div className="flex flex-wrap gap-1">
                      {pkg.includes.slice(0, 4).map((item) => (
                        <span key={item} className="inline-block px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">
                          {item}
                        </span>
                      ))}
                      {pkg.includes.length > 4 && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs">
                          {t('packages.page.moreCount', { count: pkg.includes.length - 4 })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      {pkg.originalPrice && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatCurrency(pkg.originalPrice, pkg.destination?.currency || 'EUR')}
                      </p>
                      )}
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(pkg.price, pkg.destination?.currency || 'EUR')}
                        <span className="text-sm font-normal text-muted-foreground">{t('packages.page.perPerson')}</span>
                      </p>
                    </div>
                    <Link
                      to={`/packages/${pkg.id}`}
                      className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      {t('packages.page.viewDetails')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book Package */}
      <section className="py-16 lg:py-24 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {t('packages.page.whyBook.title')}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              {t('packages.page.whyBook.subtitle')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyBookKeys.map((key) => (
              <div key={key} className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{t(`packages.page.whyBook.${key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`packages.page.whyBook.${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
