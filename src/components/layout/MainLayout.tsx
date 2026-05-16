import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout() {
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={isHomePage ? 'flex-1' : 'flex-1 pt-16 lg:pt-20'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
