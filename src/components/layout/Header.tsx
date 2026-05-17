import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setMobileMenuOpen } from '@/store/slices/uiSlice';
import { clearSession } from '@/store/slices/authSlice';
import { useLogoutMutation } from '@/store/linktravelApi';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

// Navigation labels are i18n keys; the actual strings come from
// src/i18n/locales/<lng>.json via useTranslation below.
const navigation = [
  { i18nKey: 'nav.home',         href: '/' },
  { i18nKey: 'nav.destinations', href: '/destinations' },
  { i18nKey: 'nav.hotels',       href: '/hotels' },
  { i18nKey: 'nav.packages',     href: '/packages' },
  { i18nKey: 'nav.about',        href: '/about' },
  { i18nKey: 'nav.contact',      href: '/contact' },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { mobileMenuOpen } = useAppSelector((state) => state.ui);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await logout().unwrap();
    } catch {
      // Clear local session even if the backend request fails.
    }
    dispatch(clearSession());
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
  }, [pathname, dispatch]);

  const isHomePage = pathname === '/';
  const headerBg = scrolled || !isHomePage
    ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
    : 'bg-transparent';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        headerBg
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo-linktravel.png"
              alt="LinkTravel"
              className="h-10 w-auto lg:h-11"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.i18nKey}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? scrolled || !isHomePage ? 'text-primary' : 'text-primary-foreground'
                    : scrolled || !isHomePage ? 'text-muted-foreground' : 'text-primary-foreground/80'
                )}
              >
                {t(item.i18nKey)}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            <LocaleSwitcher
              className={scrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'}
            />

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-muted/50',
                    scrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'
                  )}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user?.firstName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                  {user?.firstName || t('nav.myAccount')}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-background py-1 shadow-lg z-50">
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t('nav.adminPanel')}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('auth.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={cn(
                  'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border transition-colors',
                  scrolled || !isHomePage
                    ? 'border-border text-foreground hover:bg-muted'
                    : 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10'
                )}
              >
                {t('auth.signIn')}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden"
            onClick={() => dispatch(setMobileMenuOpen(!mobileMenuOpen))}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className={cn(
                'h-6 w-6 transition-colors',
                scrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'
              )} />
            ) : (
              <Menu className={cn(
                'h-6 w-6 transition-colors',
                scrolled || !isHomePage ? 'text-foreground' : 'text-primary-foreground'
              )} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'lg:hidden transition-all duration-300 overflow-hidden',
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-background border-b border-border px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.i18nKey}
              to={item.href}
              className={cn(
                'block rounded-lg px-4 py-3 text-base font-medium transition-colors',
                pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              {t(item.i18nKey)}
            </Link>
          ))}
          <div className="pt-4 space-y-2 border-t border-border">
            <div className="flex justify-center pb-2">
              <LocaleSwitcher className="text-foreground border border-border" />
            </div>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    {t('nav.adminPanel')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                >
                  {t('auth.signOut')}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 rounded-md text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
              >
                {t('auth.signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
