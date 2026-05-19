import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DestinationCard } from '@/components/destinations/DestinationCard';
import { useGetFeaturedDestinationsQuery } from '@/store/linktravelApi';

export function FeaturedDestinations() {
  const { t } = useTranslation();
  const { data: featuredDestinations = [], isLoading } = useGetFeaturedDestinationsQuery();

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              {t('home.featured.kicker')}
            </span>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-foreground">
              {t('home.featured.title')}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              {t('home.featured.subtitle')}
            </p>
          </div>
          <Link
            to="/destinations"
            className="self-start sm:self-auto inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
          >
            {t('common.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-muted h-80" />
              ))
            : featuredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  variant="featured"
                />
              ))}
        </div>
      </div>
    </section>
  );
}
