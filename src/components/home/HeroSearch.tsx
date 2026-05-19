import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react';
import { DatePicker, Popover as AntPopover } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '@/store/hooks';
import { setSearchFilters } from '@/store/slices/uiSlice';
import type { Dayjs } from 'dayjs';
import type { Destination } from '@/types';
import {
  useGetFeaturedDestinationsQuery,
  useSearchDestinationsQuery,
} from '@/store/linktravelApi';

export function HeroSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: featuredDestinations = [] } = useGetFeaturedDestinationsQuery();

  const [destination, setDestination] = useState('');
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [guests, setGuests] = useState(2);
  const [showDestinations, setShowDestinations] = useState(false);
  const trimmedDestination = destination.trim();
  const { data: searchedDestinations = [], isFetching: searchLoading } = useSearchDestinationsQuery(
    trimmedDestination,
    { skip: trimmedDestination.length < 2 },
  );

  const fallbackSuggestions = useMemo(
    () => featuredDestinations.slice(0, 6),
    [featuredDestinations],
  );

  const suggestions = useMemo<Destination[]>(() => {
    if (trimmedDestination.length < 2) {
      return fallbackSuggestions;
    }

    return searchedDestinations.slice(0, 8);
  }, [fallbackSuggestions, searchedDestinations, trimmedDestination]);

  const buildSearchParams = () => {
    const params = new URLSearchParams();
    if (selectedDestinationId) {
      params.set('destination', selectedDestinationId);
    } else if (destination.trim()) {
      params.set('destination', destination.trim());
    }
    if (checkIn) params.set('checkIn', checkIn.format('YYYY-MM-DD'));
    if (checkOut) params.set('checkOut', checkOut.format('YYYY-MM-DD'));
    if (guests) params.set('guests', guests.toString());

    return params;
  };

  const handleSearch = () => {
    dispatch(setSearchFilters({
      destination,
      destinationId: selectedDestinationId || undefined,
      checkIn: checkIn ? checkIn.format('YYYY-MM-DD') : '',
      checkOut: checkOut ? checkOut.format('YYYY-MM-DD') : '',
      guests,
    }));

    const params = buildSearchParams();

    if (selectedDestinationId) {
      navigate(`/destinations/${selectedDestinationId}?${params.toString()}`);
      return;
    }

    navigate(`/destinations?${params.toString()}`);
  };

  const handleSuggestionSelect = (suggestion: Destination) => {
    setDestination(`${suggestion.name}, ${suggestion.country}`);
    setSelectedDestinationId(suggestion.id);
    setShowDestinations(false);
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setSelectedDestinationId(null);
    setShowDestinations(true);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          // backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80')`,
          backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium backdrop-blur-sm border border-primary-foreground/20">
            {t('home.hero.badge')}
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-background tracking-tight text-balance">
          {t('home.hero.titlePrefix')}
          <span className="block text-accent mt-2">LinkTravel</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-background/80 max-w-2xl mx-auto text-balance">
          {t('home.hero.subtitle')}
        </p>

        {/* Search Box */}
        <div className="mt-10 mx-auto max-w-4xl">
          <div className="bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Destination */}
              <div className="relative">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 text-left">
                  {t('home.hero.destination')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <input
                    type="text"
                    placeholder={t('home.hero.destinationPlaceholder')}
                    value={destination}
                    onChange={(e) => handleDestinationChange(e.target.value)}
                    onFocus={() => setShowDestinations(true)}
                    onBlur={() => setTimeout(() => setShowDestinations(false), 200)}
                    className="w-full pl-10 h-12 rounded-xl bg-muted/50 border-transparent text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary px-3"
                  />
                </div>
                {showDestinations && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background rounded-xl shadow-lg border border-border z-20 py-2">
                    <p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      {destination.trim().length >= 2 ? t('home.hero.searchResults') : t('home.hero.popularDestinations')}
                    </p>
                    {searchLoading && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">{t('common.searching')}</p>
                    )}
                    {!searchLoading && suggestions.length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">{t('common.noMatches')}</p>
                    )}
                    {!searchLoading && suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-start gap-2"
                          onMouseDown={() => handleSuggestionSelect(suggestion)}
                        >
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="flex flex-col">
                            <span className="font-medium text-foreground">{suggestion.name}</span>
                            <span className="text-xs text-muted-foreground">{suggestion.country}</span>
                          </span>
                        </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Check In */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 text-left">
                  {t('home.hero.checkIn')}
                </label>
                <DatePicker
                  value={checkIn}
                  onChange={setCheckIn}
                  placeholder={t('home.hero.selectDate')}
                  className="w-full h-12 rounded-xl"
                  format="MMM DD, YYYY"
                  suffixIcon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                />
              </div>

              {/* Check Out */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 text-left">
                  {t('home.hero.checkOut')}
                </label>
                <DatePicker
                  value={checkOut}
                  onChange={setCheckOut}
                  placeholder={t('home.hero.selectDate')}
                  className="w-full h-12 rounded-xl"
                  format="MMM DD, YYYY"
                  suffixIcon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                />
              </div>

              {/* Guests */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 text-left">
                  {t('home.hero.guests')}
                </label>
                <AntPopover
                  trigger="click"
                  content={
                    <div className="flex items-center justify-between gap-4 p-2">
                      <span className="text-sm">{t('home.hero.guests')}</span>
                      <div className="flex items-center gap-2">
                        <button
                          className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          disabled={guests <= 1}
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{guests}</span>
                        <button
                          className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                          onClick={() => setGuests(Math.min(10, guests + 1))}
                          disabled={guests >= 10}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  }
                >
                  <button
                    type="button"
                    className="w-full h-12 justify-start text-left font-normal rounded-xl bg-muted/50 hover:bg-muted px-3 flex items-center gap-2 text-sm"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {guests} {t('home.hero.guest', { count: guests })}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </button>
                </AntPopover>
              </div>
            </div>

            {/* Search Button */}
            <button
              className="w-full mt-4 h-12 rounded-xl text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
              {t('home.hero.searchButton')}
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-background/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-background">{t('home.hero.trust.destinations')}</span>
          </div>
          <div className="h-8 w-px bg-background/20" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-background">{t('home.hero.trust.stays')}</span>
          </div>
          <div className="h-8 w-px bg-background/20" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-background">{t('home.hero.trust.support')}</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-background/40 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-background/60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
