type SelectOption = {
  value: string;
  label: string;
};

type CountryDefaults = {
  language?: string;
  timezone?: string;
  bestTimeToVisit?: string;
  tags?: string[];
  highlights?: string[];
};

export const bestTimeToVisitOptions: SelectOption[] = [
  { value: 'Year round', label: 'Year round' },
  { value: 'Spring', label: 'Spring' },
  { value: 'Summer', label: 'Summer' },
  { value: 'Autumn', label: 'Autumn' },
  { value: 'Winter', label: 'Winter' },
  { value: 'Spring & Autumn', label: 'Spring & Autumn' },
  { value: 'Summer & Autumn', label: 'Summer & Autumn' },
  { value: 'Winter sun', label: 'Winter sun' },
  { value: 'Peak summer', label: 'Peak summer' },
  { value: 'Festive season', label: 'Festive season' },
];

export const languageOptions: SelectOption[] = [
  { value: 'Albanian', label: 'Albanian' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Bosnian', label: 'Bosnian' },
  { value: 'Bulgarian', label: 'Bulgarian' },
  { value: 'Croatian', label: 'Croatian' },
  { value: 'English', label: 'English' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Macedonian', label: 'Macedonian' },
  { value: 'Montenegrin', label: 'Montenegrin' },
  { value: 'Serbian', label: 'Serbian' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Turkish', label: 'Turkish' },
];

export const timezoneOptions: SelectOption[] = [
  { value: 'GMT', label: 'GMT' },
  { value: 'GMT+1', label: 'GMT+1' },
  { value: 'GMT+2', label: 'GMT+2' },
  { value: 'GMT+3', label: 'GMT+3' },
  { value: 'GMT+4', label: 'GMT+4' },
  { value: 'GMT+5', label: 'GMT+5' },
  { value: 'GMT-1', label: 'GMT-1' },
  { value: 'GMT-2', label: 'GMT-2' },
  { value: 'GMT-3', label: 'GMT-3' },
  { value: 'GMT-4', label: 'GMT-4' },
  { value: 'GMT-5', label: 'GMT-5' },
];

export const destinationTagOptions: SelectOption[] = [
  { value: 'beach', label: 'Beach' },
  { value: 'city-break', label: 'City Break' },
  { value: 'family', label: 'Family' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'all-inclusive', label: 'All Inclusive' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'culture', label: 'Culture' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'island', label: 'Island' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'summer', label: 'Summer' },
  { value: 'winter', label: 'Winter' },
];

export const destinationHighlightOptions: SelectOption[] = [
  { value: 'Beachfront access', label: 'Beachfront access' },
  { value: 'Historic old town', label: 'Historic old town' },
  { value: 'Luxury hotels', label: 'Luxury hotels' },
  { value: 'Family-friendly resorts', label: 'Family-friendly resorts' },
  { value: 'Nightlife and dining', label: 'Nightlife and dining' },
  { value: 'Guided excursions', label: 'Guided excursions' },
  { value: 'Spa and wellness', label: 'Spa and wellness' },
  { value: 'Shopping districts', label: 'Shopping districts' },
  { value: 'Scenic viewpoints', label: 'Scenic viewpoints' },
  { value: 'Cultural landmarks', label: 'Cultural landmarks' },
  { value: 'Airport transfers available', label: 'Airport transfers available' },
  { value: 'Ideal for couples', label: 'Ideal for couples' },
  { value: 'Ideal for families', label: 'Ideal for families' },
];

const countryDefaults: Record<string, CountryDefaults> = {
  AL: {
    language: 'Albanian',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Summer',
    tags: ['beach', 'family', 'summer'],
    highlights: ['Beachfront access', 'Family-friendly resorts'],
  },
  DE: {
    language: 'German',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Year round',
    tags: ['city-break', 'culture'],
    highlights: ['Historic old town', 'Cultural landmarks'],
  },
  EG: {
    language: 'Arabic',
    timezone: 'GMT+2',
    bestTimeToVisit: 'Winter sun',
    tags: ['culture', 'luxury', 'winter'],
    highlights: ['Cultural landmarks', 'Guided excursions'],
  },
  ES: {
    language: 'Spanish',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Spring & Autumn',
    tags: ['beach', 'city-break', 'culture'],
    highlights: ['Beachfront access', 'Nightlife and dining'],
  },
  FR: {
    language: 'French',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Spring & Autumn',
    tags: ['city-break', 'culture', 'romantic'],
    highlights: ['Historic old town', 'Shopping districts'],
  },
  GB: {
    language: 'English',
    timezone: 'GMT',
    bestTimeToVisit: 'Year round',
    tags: ['city-break', 'shopping', 'culture'],
    highlights: ['Historic old town', 'Shopping districts'],
  },
  GR: {
    language: 'Greek',
    timezone: 'GMT+2',
    bestTimeToVisit: 'Summer',
    tags: ['beach', 'island', 'romantic'],
    highlights: ['Scenic viewpoints', 'Beachfront access'],
  },
  IT: {
    language: 'Italian',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Spring & Autumn',
    tags: ['culture', 'romantic', 'city-break'],
    highlights: ['Historic old town', 'Luxury hotels'],
  },
  MK: {
    language: 'Macedonian',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Year round',
    tags: ['weekend', 'culture'],
    highlights: ['Guided excursions', 'Historic old town'],
  },
  ME: {
    language: 'Montenegrin',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Summer',
    tags: ['beach', 'luxury', 'summer'],
    highlights: ['Scenic viewpoints', 'Luxury hotels'],
  },
  RS: {
    language: 'Serbian',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Year round',
    tags: ['city-break', 'culture'],
    highlights: ['Nightlife and dining', 'Historic old town'],
  },
  TN: {
    language: 'Arabic',
    timezone: 'GMT+1',
    bestTimeToVisit: 'Summer',
    tags: ['all-inclusive', 'beach', 'family'],
    highlights: ['Beachfront access', 'Airport transfers available'],
  },
  TR: {
    language: 'Turkish',
    timezone: 'GMT+3',
    bestTimeToVisit: 'Spring & Autumn',
    tags: ['city-break', 'shopping', 'culture'],
    highlights: ['Historic old town', 'Shopping districts'],
  },
  US: {
    language: 'English',
    timezone: 'GMT-5',
    bestTimeToVisit: 'Year round',
    tags: ['city-break', 'family', 'shopping'],
    highlights: ['Nightlife and dining', 'Shopping districts'],
  },
  AE: {
    language: 'Arabic',
    timezone: 'GMT+4',
    bestTimeToVisit: 'Winter sun',
    tags: ['luxury', 'shopping', 'family'],
    highlights: ['Luxury hotels', 'Shopping districts'],
  },
};

export function getDestinationDefaultsForCountry(countryCode?: string | null) {
  if (!countryCode) {
    return {};
  }

  return countryDefaults[countryCode] ?? {};
}
