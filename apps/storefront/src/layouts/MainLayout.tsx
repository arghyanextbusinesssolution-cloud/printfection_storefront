import { Outlet } from 'react-router-dom';
import { Header, Footer } from '../components/layout/Header';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
