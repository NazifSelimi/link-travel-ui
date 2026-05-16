import type { Coordinates, LocationDetails } from '@/types'

declare global {
  interface Window {
    google?: any
  }
}

let scriptPromise: Promise<any> | null = null

export function loadGooglePlaces() {
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google)
  }

  if (scriptPromise) {
    return scriptPromise
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'))
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-places-script')
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google))
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Places script')))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-places-script'
    script.async = true
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.onload = () => resolve(window.google)
    script.onerror = () => reject(new Error('Failed to load Google Places script'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

function getComponent(components: any[], type: string, mode: 'long_name' | 'short_name' = 'long_name') {
  const match = components.find((component) => component.types?.includes(type))
  return match?.[mode]
}

function buildMapUrl(placeId?: string, coordinates?: Coordinates) {
  if (placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`
  }

  if (coordinates?.lat != null && coordinates?.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
  }

  return undefined
}

export function parseGooglePlace(place: any): LocationDetails {
  const components = place.address_components ?? []
  const coordinates: Coordinates = {
    lat: typeof place.geometry?.location?.lat === 'function' ? place.geometry.location.lat() : null,
    lng: typeof place.geometry?.location?.lng === 'function' ? place.geometry.location.lng() : null,
  }

  const city =
    getComponent(components, 'locality') ||
    getComponent(components, 'postal_town') ||
    getComponent(components, 'administrative_area_level_2')

  return {
    country: getComponent(components, 'country'),
    countryCode: getComponent(components, 'country', 'short_name'),
    region: getComponent(components, 'administrative_area_level_1'),
    city,
    district:
      getComponent(components, 'sublocality_level_1') ||
      getComponent(components, 'sublocality') ||
      getComponent(components, 'neighborhood'),
    formattedAddress: place.formatted_address || place.name,
    placeId: place.place_id,
    mapUrl: buildMapUrl(place.place_id, coordinates),
    coordinates,
  }
}
