import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { Destination } from '@/types';

interface DestinationCardProps {
  destination: Destination;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export function DestinationCard({ destination, variant = 'default', className }: DestinationCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  if (variant === 'featured') {
    return (
      <Link
        to={`/destinations/${destination.id}`}
        className={cn(
          'group relative block overflow-hidden rounded-2xl bg-card',
          'transition-all duration-500',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={destination.image || "/placeholder.svg"}
            alt={destination.name}
            className={cn(
              'h-full w-full object-cover transition-transform duration-700',
              isHovered && 'scale-110'
            )}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 text-background/80 text-sm mb-2">
            <MapPin className="h-4 w-4" />
            {destination.country}
          </div>
          <h3 className="font-serif text-2xl font-bold text-background mb-2">
            {destination.name}
          </h3>
          <p className="text-background/70 text-sm line-clamp-2 mb-4">
            {destination.shortDescription}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-background font-medium">{destination.rating}</span>
              <span className="text-background/60 text-sm">({destination.reviewCount})</span>
            </div>
            <div className="text-background">
              <span className="text-sm text-background/60">{t('common.from')} </span>
              <span className="font-bold">{formatCurrency(destination.priceFrom, destination.currency)}</span>
            </div>
          </div>
          <div className={cn(
            'mt-4 flex items-center gap-2 text-accent font-medium transition-all duration-300',
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          )}>
            {t('destinations.card.explore')} <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/destinations/${destination.id}`}
        className={cn(
          'group flex items-center gap-4 p-3 rounded-xl bg-card hover:bg-muted/50 transition-colors',
          className
        )}
      >
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={destination.image || "/placeholder.svg"}
            alt={destination.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{destination.name}</h4>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {destination.country}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">{t('common.from')}</span>
          <p className="font-bold text-foreground">{formatCurrency(destination.priceFrom, destination.currency)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/destinations/${destination.id}`}
      className={cn(
        'group block overflow-hidden rounded-2xl bg-card border border-border',
        'hover:shadow-lg hover:shadow-primary/5 transition-all duration-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[3/2] overflow-hidden">
        <img
          src={destination.image || "/placeholder.svg"}
          alt={destination.name}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500',
            isHovered && 'scale-105'
          )}
        />
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="h-4 w-4" />
          {destination.country}
        </div>
        <h3 className="font-serif text-xl font-bold text-foreground mb-2">
          {destination.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {destination.shortDescription}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium">{destination.rating}</span>
            <span className="text-muted-foreground text-sm">({destination.reviewCount})</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">{t('common.from')} </span>
            <span className="font-bold text-foreground">{formatCurrency(destination.priceFrom, destination.currency)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
