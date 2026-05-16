function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function getApiOrigin() {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    try {
      return trimTrailingSlash(new URL(configuredUrl, window.location.origin).origin);
    } catch {
      return trimTrailingSlash(window.location.origin);
    }
  }

  return trimTrailingSlash(window.location.origin);
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return url ?? undefined;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return undefined;
  }

  const apiOrigin = getApiOrigin();

  if (trimmed.startsWith('/')) {
    return `${apiOrigin}${trimmed}`;
  }

  try {
    const parsed = new URL(trimmed);
    const isLocalHost = ['localhost', '127.0.0.1'].includes(parsed.hostname);
    const apiParsed = new URL(apiOrigin);
    const shouldRewriteLocalOrigin =
      isLocalHost &&
      (parsed.port === '' || parsed.port === '80' || parsed.port !== apiParsed.port);

    if (shouldRewriteLocalOrigin) {
      return `${apiOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
}

export function resolveMediaUrls(urls?: Array<string | null | undefined>) {
  if (!urls?.length) {
    return [];
  }

  return urls
    .map((url) => resolveMediaUrl(url))
    .filter((url): url is string => Boolean(url));
}
