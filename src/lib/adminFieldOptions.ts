export const hotelAmenityOptions = [
  'WiFi',
  'Pool',
  'Spa',
  'Restaurant',
  'Bar',
  'Beach access',
  'Private beach',
  'Parking',
  'Airport transfer',
  'Family rooms',
  'Kids animations',
  'Fitness center',
  'Room service',
  'Air conditioning',
  'Breakfast included',
  'Half board',
  'All inclusive',
].map((value) => ({ value, label: value }));

export const roomAmenityOptions = [
  'Balcony',
  'Sea view',
  'City view',
  'Mini bar',
  'Air conditioning',
  'Private bathroom',
  'Free WiFi',
  'TV',
  'Safe',
  'Hair dryer',
  'Coffee station',
  'Family friendly',
  'Extra bed available',
].map((value) => ({ value, label: value }));

export const packageIncludeOptions = [
  'Return flight ticket',
  'Hotel accommodation',
  'Breakfast',
  'Half board',
  'All inclusive',
  'Airport taxes',
  'Airport transfer',
  'Hotel transfer',
  '20 kg baggage',
  'Travel insurance',
  'Guided tour',
  'Local assistance',
  'Beach umbrella',
  'Parking',
  'Kids animations',
].map((value) => ({ value, label: value }));

export function normalizeTagValues(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
}
