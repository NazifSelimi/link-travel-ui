import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/i18n';

const LABELS: Record<SupportedLocale, { short: string; long: string }> = {
  en:  { short: 'EN', long: 'English'    },
  mk:  { short: 'MK', long: 'Македонски' },
  shq: { short: 'AL', long: 'Shqip'      },
};

interface LocaleSwitcherProps {
  /**
   * Trigger button colour. The public Header uses a transparent background
   * on the homepage hero, so the text colour swap is delegated to the caller.
   */
  className?: string;
}

/**
 * Dropdown that switches the active i18next locale.
 *
 * Persisted via `i18next-browser-languagedetector` (localStorage key
 * `linktravel.locale`). Stage D-4 will additionally surface the active
 * locale to RTK Query via the `X-Locale` header so customer-facing data
 * refetches automatically when this switcher changes.
 */
export function LocaleSwitcher({ className }: LocaleSwitcherProps) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const current = (SUPPORTED_LOCALES as readonly string[]).includes(i18n.language)
    ? (i18n.language as SupportedLocale)
    : 'en';

  const handleChange = (locale: SupportedLocale) => {
    setOpen(false);
    if (locale !== current) {
      void i18n.changeLanguage(locale);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-muted/50',
          className,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {LABELS[current].short}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 w-40 rounded-md border border-border bg-background py-1 shadow-lg z-50"
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={locale === current}
                onClick={() => handleChange(locale)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-muted',
                  locale === current ? 'text-primary font-medium' : 'text-foreground',
                )}
              >
                <span>{LABELS[locale].long}</span>
                <span className="text-xs text-muted-foreground">{LABELS[locale].short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
