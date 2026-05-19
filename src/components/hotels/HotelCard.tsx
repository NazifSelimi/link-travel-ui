import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, UtensilsCrossed, Waves, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { Hotel } from '@/types';

const amenityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  parking: Car,
  restaurant: UtensilsCrossed,
  pool: Waves,
};

interface HotelCardProps {
  hotel: Hotel;
  variant?: 'default' | 'featured' | 'horizontal';
  className?: string;
}

export function HotelCard({ hotel, variant = 'default', className }: HotelCardProps) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          'h-3.5 w-3.5',
          i < count ? 'fill-accent text-accent' : 'text-muted-foreground/30'
        )}
      />
    ));
  };

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/hotels/${hotel.id}`}
        className={cn(
          'group flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-card border border-border',
          'hover:shadow-lg hover:shadow-primary/5 transition-all duration-300',
          className
        )}
      >
        <div className="relative sm:w-72 flex-shrink-0">
          <div className="aspect-[4/3] sm:aspect-auto sm:h-full overflow-hidden">
            <img
              src={hotel.image || "/placeholder.svg"}
              alt={hotel.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Heart className={cn('h-5 w-5', isFavorite ? 'fill-destructive text-destructive' : 'text-foreground')} />
          </button>
        </div>
        <div className="flex-1 p-5 sm:p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">{renderStars(hotel.stars)}</div>
            <span className="text-xs text-muted-foreground">{t('hotels.card.starHotel', { count: hotel.stars })}</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-foreground mb-1">
            {hotel.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-3.5 w-3.5" />
            {hotel.address || hotel.formattedAddress || hotel.destination?.name || t('hotels.card.locationUnavailable')}
          </p>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
            {hotel.shortDescription}
          </p>
          <div className="flex items-center gap-3 mb-4">
            {hotel.amenities.slice(0, 4).map((amenity) => {
              const Icon = amenityIcons[amenity.toLowerCase()] || Wifi;
              return (
                <div key={amenity} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline capitalize">{amenity}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-bold text-primary">{hotel.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {hotel.reviewCount} {t('common.review', { count: hotel.reviewCount })}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t('common.from')}</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(hotel.pricePerNight, hotel.currency)}
                <span className="text-sm font-normal text-muted-foreground">{t('hotels.card.perNight')}</span>
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/hotels/${hotel.id}`}
      className={cn(
        'group block overflow-hidden rounded-2xl bg-card border border-border',
        'hover:shadow-lg hover:shadow-primary/5 transition-all duration-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
          className={cn(
            'h-full w-full object-cover transition-transform duration-500',
            isHovered && 'scale-105'
          )}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
        >
          <Heart className={cn('h-5 w-5', isFavorite ? 'fill-destructive text-destructive' : 'text-foreground')} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="text-sm font-bold">{hotel.rating}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          {renderStars(hotel.stars)}
        </div>
        <h3 className="font-serif text-lg font-bold text-foreground mb-1 line-clamp-1">
          {hotel.name}
        </h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
          <MapPin className="h-3.5 w-3.5" />
          {hotel.address || hotel.formattedAddress || hotel.destination?.name || 'Location unavailable'}
        </p>
        <div className="flex items-center gap-2 mb-4">
          {hotel.amenities.slice(0, 3).map((amenity) => {
            const Icon = amenityIcons[amenity.toLowerCase()] || Wifi;
            return (
              <div key={amenity} className="p-1.5 rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          })}
          {hotel.amenities.length > 3 && (
            <span className="text-xs text-muted-foreground">+{hotel.amenities.length - 3}</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground">{hotel.reviewCount} {t('common.review', { count: hotel.reviewCount })}</span>
          <div className="text-right">
            <span className="text-xl font-bold text-foreground">{formatCurrency(hotel.pricePerNight, hotel.currency)}</span>
            <span className="text-sm text-muted-foreground">{t('hotels.card.perNight')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
