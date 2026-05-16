import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DestinationCard, DestinationFilters } from '@/components/destinations';
import type { DestinationFilters as FiltersType } from '@/types';
import { useGetDestinationsQuery } from '@/store/linktravelApi';

export default function DestinationsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<FiltersType>({
    search: searchParams.get('destination') || '',
    sortBy: 'popular',
    sortOrder: 'desc',
  });

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      search: searchParams.get('destination') || '',
    }));
  }, [searchParams]);

  const { data, isLoading } = useGetDestinationsQuery({
    search: filters.search || undefined,
    country: filters.country || undefined,
    min_price: filters.priceMin,
    max_price: filters.priceMax,
    rating: filters.rating,
    sort_by:
      filters.sortBy === 'price'
        ? filters.sortOrder === 'asc'
          ? 'price_asc'
          : 'price_desc'
        : filters.sortBy === 'popular'
          ? 'popular'
          : 'rating',
  });

  const destinations = data?.items ?? [];

  return (
    <>
      {/* Hero Section */}
      <section className="py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground">
              Explore Destinations
            </h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From ancient cities to pristine beaches, discover your perfect getaway 
              from our curated collection of extraordinary destinations.
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DestinationFilters
            filters={filters}
            onFiltersChange={setFilters}
            resultCount={destinations.length}
          />
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-8 pb-20 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-muted h-80" />
              ))}
            </div>
          ) : destinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                No destinations found matching your criteria.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
