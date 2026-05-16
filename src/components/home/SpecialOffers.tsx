import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Percent, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/money';
import { cn } from '@/lib/utils';
import { useGetDiscountedPackagesQuery } from '@/store/linktravelApi';

export function SpecialOffers() {
  const { data: offers = [], isLoading, isError } = useGetDiscountedPackagesQuery();
  const visibleOffers = offers.slice(0, 3);

  if (isError || (!isLoading && visibleOffers.length === 0)) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Exclusive Deals
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Special Offers
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Take advantage of our limited-time offers and make your dream vacation a reality.
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isLoading && (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'animate-pulse overflow-hidden rounded-2xl bg-muted aspect-[16/9]',
                  index === 0 ? 'lg:col-span-2 lg:row-span-2 lg:aspect-auto lg:h-full' : '',
                )}
              />
            ))
          )}
          {visibleOffers.map((offer, index) => (
            <Link
              key={offer.id}
              to={`/packages/${offer.id}`}
              className={cn(
                'group relative overflow-hidden rounded-2xl',
                index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              )}
            >
              <div className={cn(
                'aspect-[16/9]',
                index === 0 && 'lg:aspect-auto lg:h-full'
              )}>
                <img
                  src={offer.image}
                  alt={offer.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
              
              {/* Tag */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                  <Tag className="h-3 w-3" />
                  {offer.category || 'Featured'}
                </span>
              </div>

              {/* Content */}
              <div className={cn(
                'absolute bottom-0 left-0 right-0 p-6',
                index === 0 && 'lg:p-8'
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-sm font-bold">
                    <Percent className="h-3.5 w-3.5" />
                    {offer.originalPrice
                      ? `Save ${formatCurrency(Math.max(0, offer.originalPrice - offer.price), offer.destination?.currency || 'EUR')}`
                      : formatCurrency(offer.price, offer.destination?.currency || 'EUR')}
                  </span>
                  <span className="inline-flex items-center gap-1 text-background/70 text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {offer.duration || 'Limited availability'}
                  </span>
                </div>
                <h3 className={cn(
                  'font-serif font-bold text-background mb-2',
                  index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'
                )}>
                  {offer.name}
                </h3>
                <p className={cn(
                  'text-background/80 mb-4',
                  index === 0 ? 'text-base' : 'text-sm',
                  index !== 0 && 'line-clamp-2'
                )}>
                  {offer.description}
                </p>
                <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all">
                  View Details <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
