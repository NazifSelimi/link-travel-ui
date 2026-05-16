function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const envValue = trimTrailingSlash(import.meta.env.VITE_API_URL || '/api/v1');

  if (import.meta.env.DEV) {
    try {
      const parsed = new URL(envValue, window.location.origin);
      const isLocalBackend = ['localhost', '127.0.0.1'].includes(parsed.hostname);

      if (isLocalBackend) {
        return parsed.pathname || '/api/v1';
      }
    } catch {
      // Fall through to the normalized env value below.
    }
  }

  return envValue;
}
