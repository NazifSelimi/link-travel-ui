import { MapPin } from 'lucide-react';
import type { Coordinates } from '@/types';

type MapEmbedProps = {
  title: string;
  subtitle?: string;
  coordinates?: Coordinates;
  query?: string;
  mapUrl?: string;
  className?: string;
};

function getGoogleMapsEmbedUrl(coordinates?: Coordinates, query?: string) {
  if (coordinates?.lat != null && coordinates?.lng != null) {
    return `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=13&output=embed`;
  }

  if (query?.trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query.trim())}&z=15&output=embed`;
  }

  return undefined;
}

function getMapLink(coordinates?: Coordinates, query?: string, mapUrl?: string) {
  if (coordinates?.lat != null && coordinates?.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
  }

  if (query?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
  }

  if (!mapUrl) {
    return undefined;
  }

  return mapUrl;
}

export function MapEmbed({ title, subtitle, coordinates, query, mapUrl, className }: MapEmbedProps) {
  const embedUrl = getGoogleMapsEmbedUrl(coordinates, query);
  const externalMapUrl = getMapLink(coordinates, query, mapUrl);
  const hasCoordinates = coordinates?.lat != null && coordinates?.lng != null;

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {embedUrl ? (
          <iframe
            title={`${title} map`}
            src={embedUrl}
            className="h-[340px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-[340px] flex-col items-center justify-center bg-muted/40 px-6 text-center">
            <MapPin className="mb-4 h-10 w-10 text-primary/60" />
            <p className="text-base font-semibold text-foreground">{title}</p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Map details are not available for this location yet.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle || 'Explore this location on the map.'}
            </p>
            {hasCoordinates ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Coordinates: {coordinates?.lat}, {coordinates?.lng}
              </p>
            ) : null}
          </div>
          {externalMapUrl ? (
            <a
              href={externalMapUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Open in Maps
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
