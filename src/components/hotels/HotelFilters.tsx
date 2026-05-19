import { useState } from 'react';
import { Search, SlidersHorizontal, X, Star } from 'lucide-react';
import { Input, Select, Slider, Drawer, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { HotelFilters as FiltersType } from '@/types';

const amenityKeys = [
  'wifi',
  'pool',
  'spa',
  'restaurant',
  'bar',
  'fitness',
  'parking',
  'beachAccess',
  'roomService',
  'concierge',
] as const;

interface HotelFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  resultCount?: number;
}

export function HotelFilters({
  filters,
  onFiltersChange,
  resultCount = 0,
}: HotelFiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FiltersType>(filters);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [FiltersType['sortBy'], FiltersType['sortOrder']];
    onFiltersChange({ ...filters, sortBy, sortOrder });
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: FiltersType = {
      sortBy: 'rating',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  const activeFilterCount = [
    filters.priceMin,
    filters.priceMax,
    filters.rating,
    filters.stars,
    filters.amenities?.length,
  ].filter(Boolean).length;

  // Amenities: stored canonical English lowercase values (e.g. 'wifi'); only the labels are translated.
  const amenities = amenityKeys.map((key) => ({
    value: key === 'beachAccess' ? 'beach access'
      : key === 'roomService' ? 'room service'
      : key.toLowerCase(),
    label: t(`hotels.filters.amenityList.${key}`),
  }));

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder={t('hotels.filters.searchPlaceholder')}
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 bg-background"
          />
        </div>

        {/* Sort */}
        <Select
          value={`${filters.sortBy || 'rating'}-${filters.sortOrder || 'desc'}`}
          onChange={handleSortChange}
          className="w-full sm:w-[180px]"
          options={[
            { value: 'rating-desc', label: t('hotels.filters.sort.highestRated') },
            { value: 'price-asc', label: t('hotels.filters.sort.priceAsc') },
            { value: 'price-desc', label: t('hotels.filters.sort.priceDesc') },
            { value: 'stars-desc', label: t('hotels.filters.sort.starsDesc') },
            { value: 'name-asc', label: t('hotels.filters.sort.nameAsc') },
          ]}
        />

        {/* Filter Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center h-11 px-4 gap-2 rounded-md border border-border text-sm font-medium bg-transparent hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('common.filters')}
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>

        <Drawer
          title={t('hotels.filters.title')}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          size="default"
        >
          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-foreground">
                {t('hotels.filters.pricePerNight')}
              </label>
              <div className="mt-4 px-2">
                <Slider
                  range
                  value={[localFilters.priceMin || 0, localFilters.priceMax || 1000]}
                  min={0}
                  max={1000}
                  step={25}
                  onChange={(value) => {
                    const [min, max] = value as [number, number];
                    setLocalFilters({ ...localFilters, priceMin: min, priceMax: max });
                  }}
                />
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>${localFilters.priceMin || 0}</span>
                  <span>${localFilters.priceMax || 1000}+</span>
                </div>
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium text-foreground">{t('hotels.filters.hotelClass')}</label>
              <div className="mt-2 flex gap-2">
                {[0, 3, 4, 5].map((stars) => (
                  <button
                    key={stars}
                    type="button"
                    onClick={() =>
                      setLocalFilters({
                        ...localFilters,
                        stars: stars === 0 ? undefined : stars,
                      })
                    }
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                      localFilters.stars === stars
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent border-border hover:bg-muted'
                    )}
                  >
                    {stars === 0 ? (
                      t('common.any')
                    ) : (
                      <>
                        {stars}
                        <Star className="h-3 w-3 fill-current" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Guest Rating */}
            <div>
              <label className="text-sm font-medium text-foreground">{t('hotels.filters.minimumGuestRating')}</label>
              <div className="mt-2 flex gap-2">
                {[0, 3.5, 4, 4.5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setLocalFilters({
                        ...localFilters,
                        rating: rating === 0 ? undefined : rating,
                      })
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                      localFilters.rating === rating
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent border-border hover:bg-muted'
                    )}
                  >
                    {rating === 0 ? t('common.any') : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="text-sm font-medium text-foreground">{t('hotels.filters.amenities')}</label>
              <div className="mt-3 space-y-3">
                {amenities.map((amenity) => {
                  const isChecked = localFilters.amenities?.includes(amenity.value);
                  return (
                    <div key={amenity.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => {
                          const currentAmenities = localFilters.amenities || [];
                          const newAmenities = e.target.checked
                            ? [...currentAmenities, amenity.value]
                            : currentAmenities.filter((a) => a !== amenity.value);
                          setLocalFilters({
                            ...localFilters,
                            amenities: newAmenities.length > 0 ? newAmenities : undefined,
                          });
                        }}
                      >
                        {amenity.label}
                      </Checkbox>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                className="flex-1 px-4 py-2 rounded-md border border-border text-sm font-medium bg-transparent hover:bg-muted transition-colors"
                onClick={handleResetFilters}
              >
                {t('common.resetAll')}
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={handleApplyFilters}
              >
                {t('common.applyFilters')}
              </button>
            </div>
          </div>
        </Drawer>
      </div>

      {/* Results Count & Active Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {t('hotels.filters.resultsFound', { count: resultCount })}
        </span>
        {(filters.priceMin || filters.priceMax) && (
          <button
            type="button"
            className="inline-flex items-center h-7 px-2 gap-1 rounded-md bg-secondary text-secondary-foreground text-xs"
            onClick={() => onFiltersChange({ ...filters, priceMin: undefined, priceMax: undefined })}
          >
            ${filters.priceMin || 0} - ${filters.priceMax || 1000}{t('hotels.card.perNight')}
            <X className="h-3 w-3" />
          </button>
        )}
        {filters.stars && (
          <button
            type="button"
            className="inline-flex items-center h-7 px-2 gap-1 rounded-md bg-secondary text-secondary-foreground text-xs"
            onClick={() => onFiltersChange({ ...filters, stars: undefined })}
          >
            {t('hotels.filters.starsSuffix', { count: filters.stars })}
            <X className="h-3 w-3" />
          </button>
        )}
        {filters.rating && (
          <button
            type="button"
            className="inline-flex items-center h-7 px-2 gap-1 rounded-md bg-secondary text-secondary-foreground text-xs"
            onClick={() => onFiltersChange({ ...filters, rating: undefined })}
          >
            {t('hotels.filters.ratingSuffix', { rating: filters.rating })}
            <X className="h-3 w-3" />
          </button>
        )}
        {filters.amenities?.map((amenity) => (
          <button
            key={amenity}
            type="button"
            className="inline-flex items-center h-7 px-2 gap-1 rounded-md bg-secondary text-secondary-foreground text-xs capitalize"
            onClick={() =>
              onFiltersChange({
                ...filters,
                amenities: filters.amenities?.filter((a) => a !== amenity),
              })
            }
          >
            {amenity}
            <X className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
