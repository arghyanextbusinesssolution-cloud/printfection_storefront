import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BRAND } from '@printfection/config';
import { apiGet } from '../../services/api';
import type { CartData } from '../../types';

/* ─────────────────────────────────────────────────────────
   TOP NAV
───────────────────────────────────────────────────────── */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => apiGet<CartData>('/cart'),
  });
  const itemCount = cartData?.totals.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services', to: '/services' },
    { label: 'Shop', to: '/products' },
    { label: 'Bulk Order', to: '/bulk-order' },
    { label: 'Design Studio', to: '/single-order' },
    { label: 'About', to: '/about' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-black/95 backdrop-blur-xl border-b border-neutral-900 shadow-step'
          : 'bg-black border-b border-neutral-900'
          }`}
      >
      <div className="max-w-container mx-auto px-4 md:px-[64px] flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
          aria-label="Printfection UK – Home"
        >
          <img src="/logo.webp" alt="Printfection UK" className="h-[26px] w-auto object-contain brightness-0 invert" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-200 ${isActive
                  ? 'text-magenta'
                  : 'text-neutral-400 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            to="/quote"
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-400 hover:text-magenta transition-colors duration-200"
          >
            Get a Quote
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 text-neutral-400 hover:text-magenta transition-colors duration-200"
            aria-label={`Cart (${itemCount} items)`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-magenta text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            to="/bulk-order"
            className="bg-magenta text-white px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] rounded hover:bg-white hover:text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Your Order
          </Link>
        </div>

        {/* Mobile Hamburger — always shows bars, drawer opened via transform */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Mobile cart icon */}
          <Link
            to="/cart"
            className="relative p-2 text-white hover:text-magenta transition-colors"
            aria-label={`Cart (${itemCount} items)`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-magenta text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="p-2 text-white hover:text-magenta transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>

      {/* ── SIDE DRAWER (rendered as sibling of header to avoid backdrop-filter fixed position bugs) ── */}

      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel — slides in from the right */}
      <div
        className={`fixed top-0 right-0 h-full w-[85vw] max-w-[360px] bg-black z-[70] flex flex-col lg:hidden
          transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer top bar */}
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-neutral-800 flex-shrink-0">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <img src="/logo.webp" alt="Printfection UK" className="h-[22px] w-auto brightness-0 invert" />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links — staggered slide-in via transitionDelay */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 flex flex-col">
          {navLinks.map(({ label, to }, i) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-4 border-b border-neutral-800 font-display font-black text-2xl uppercase tracking-tighter
                 transition-all duration-200 ${isActive ? 'text-magenta' : 'text-white hover:text-magenta'}`
              }
              style={{
                transitionDelay: mobileOpen ? `${80 + i * 40}ms` : '0ms',
                transform: mobileOpen ? 'translateX(0)' : 'translateX(20px)',
                opacity: mobileOpen ? 1 : 0,
              }}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom CTAs */}
        <div className="px-6 pb-8 pt-4 flex flex-col gap-3 border-t border-neutral-800 flex-shrink-0">
          <Link
            to="/quote"
            onClick={() => setMobileOpen(false)}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400 hover:text-magenta transition-colors py-2 text-center"
          >
            Get a Quote
          </Link>
          <Link
            to="/bulk-order"
            onClick={() => setMobileOpen(false)}
            className="bg-magenta text-white font-mono text-[12px] uppercase tracking-[0.2em] py-4 text-center hover:bg-white hover:text-black transition-colors font-bold"
          >
            Start Your Order
          </Link>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   FOOTER – minimal light bar matching design reference
───────────────────────────────────────────────────────── */
export function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Floating Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-black text-white flex items-center justify-center shadow-lg
          hover:bg-magenta transition-all duration-300
          ${showTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-container mx-auto px-4 md:px-[64px] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
            &copy; {new Date().getFullYear()} Printfection UK. Premium Custom Manufacturing.
          </span>
          <div className="flex items-center gap-5">
            {[
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Service', to: '/terms' },
              { label: 'Sustainability', to: '/sustainability' },
              { label: 'Contact Us', to: '/contact' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="font-mono text-[10px] uppercase tracking-[0.1em] text-on-surface-variant hover:text-magenta transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
