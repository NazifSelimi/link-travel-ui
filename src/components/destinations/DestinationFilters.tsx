import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Select, Slider, Drawer } from 'antd';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { DestinationFilters as FiltersType } from '@/types';

const countryKeys = [
  'greece',
  'croatia',
  'turkey',
  'montenegro',
  'albania',
  'northMacedonia',
  'slovenia',
] as const;

const tagKeys = [
  'beach',
  'mountains',
  'historic',
  'adventure',
  'romantic',
  'family',
  'culture',
  'nature',
] as const;

interface DestinationFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  resultCount?: number;
}

export function DestinationFilters({
  filters,
  onFiltersChange,
  resultCount = 0,
}: DestinationFiltersProps) {
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
      sortBy: 'popular',
      sortOrder: 'desc',
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  const activeFilterCount = [
    filters.country,
    filters.priceMin,
    filters.priceMax,
    filters.rating,
    filters.tags?.length,
  ].filter(Boolean).length;

  // Country labels: localized display strings, but value sent to the API is the English name
  // (the backend's `country` column stores the canonical English name).
  const countryOptions = [
    { value: '', label: t('destinations.filters.allCountries') },
    ...countryKeys.map((key) => ({
      value: t(`destinations.filters.countries.${key}`, { lng: 'en' }),
      label: t(`destinations.filters.countries.${key}`),
    })),
  ];

  // Tag values are persisted in the database as English. Display labels are localized.
  const tagOptions = tagKeys.map((key) => ({
    value: t(`destinations.filters.tags.${key}`, { lng: 'en' }),
    label: t(`destinations.filters.tags.${key}`),
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
            placeholder={t('destinations.filters.searchPlaceholder')}
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-11 bg-background"
          />
        </div>

        {/* Sort */}
        <Select
          value={`${filters.sortBy || 'popular'}-${filters.sortOrder || 'desc'}`}
          onChange={handleSortChange}
          className="w-full sm:w-[180px]"
          options={[
            { value: 'popular-desc', label: t('destinations.filters.sort.popular') },
            { value: 'rating-desc', label: t('destinations.filters.sort.highestRated') },
            { value: 'price-asc', label: t('destinations.filters.sort.priceAsc') },
            { value: 'price-desc', label: t('destinations.filters.sort.priceDesc') },
            { value: 'name-asc', label: t('destinations.filters.sort.nameAsc') },
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
          title={t('destinations.filters.title')}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          size="default"
        >
          <div className="space-y-6">
            {/* Country */}
            <div>
              <label className="text-sm font-medium text-foreground">{t('destinations.filters.country')}</label>
              <Select
                value={localFilters.country || ''}
                onChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    country: value === '' ? undefined : value,
                  })
                }
                className="w-full mt-2"
                options={countryOptions}
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-foreground">
                {t('destinations.filters.priceRangeFrom')}
              </label>
              <div className="mt-4 px-2">
                <Slider
                  range
                  value={[localFilters.priceMin || 0, localFilters.priceMax || 1000]}
                  min={0}
                  max={1000}
                  step={50}
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

            {/* Minimum Rating */}
            <div>
              <label className="text-sm font-medium text-foreground">{t('destinations.filters.minimumRating')}</label>
              <div className="mt-2 flex gap-2">
                {[0, 3, 3.5, 4, 4.5].map((rating) => (
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

            {/* Tags */}
            <div>
              <label className="text-sm font-medium text-foreground">{t('destinations.filters.experienceType')}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tagOptions.map((tagOption) => {
                  const isSelected = localFilters.tags?.includes(tagOption.value);
                  return (
                    <button
                      key={tagOption.value}
                      type="button"
                      onClick={() => {
                        const currentTags = localFilters.tags || [];
                        const newTags = isSelected
                          ? currentTags.filter((t) => t !== tagOption.value)
                          : [...currentTags, tagOption.value];
                        setLocalFilters({
                          ...localFilters,
                          tags: newTags.length > 0 ? newTags : undefined,
                        });
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-transparent border-border hover:bg-muted'
                      )}
                    >
                      {tagOption.label}
                    </button>
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
          {t('destinations.filters.resultsFound', { count: resultCount })}
        </span>
        {filters.country && (
          <button
            type="button"
            className="inline-flex items-center h-7 px-2 gap-1 rounded-md bg-secondary text-secondary-foreground text-xs"
            onClick={() => onFiltersChange({ ...filters, country: undefined })}
          >
            {filters.country}
            <X className="h-3 w-3" />
          </button>
        )}
        {(filters.priceMin || filters.priceMax) && (
          <button
            type="button"
            className="inline-flex items-center h-7 px-2 gap-1 rounded-md bg-secondary text-secondary-foreground text-xs"
            onClick={() => onFiltersChange({ ...filters, priceMin: undefined, priceMax: undefined })}
          >
            ${filters.priceMin || 0} - ${filters.priceMax || 1000}
            <X className="h-3 w-3" />
          </button>
        )}
        {filters.rating && (
          <button
            type="button"
            className="inline-flex items-center h-7 px-2 gap-1 rounded-md bg-secondary text-secondary-foreground text-xs"
            onClick={() => onFiltersChange({ ...filters, rating: undefined })}
          >
            {t('destinations.filters.ratingSuffix', { rating: filters.rating })}
            <X className="h-3 w-3" />
          </button>
        )}
        {filters.tags?.map((tag) => (
          <button
            key={tag}
            type="button"
            className="inline-flex items-center h-7 px-2 gap-1 rounded-md bg-secondary text-secondary-foreground text-xs"
            onClick={() =>
              onFiltersChange({
                ...filters,
                tags: filters.tags?.filter((t) => t !== tag),
              })
            }
          >
            {tag}
            <X className="h-3 w-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
