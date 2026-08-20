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
    queryKey: ['cart-header'],
    queryFn: () => apiGet<CartData>('/cart'),
    staleTime: 30000,
  });
  const itemCount = cartData?.totals.itemCount ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services',      to: '/services' },
    { label: 'Shop',          to: '/products' },
    { label: 'Bulk Order',    to: '/bulk-order' },
    { label: 'Single Custom', to: '/single-order' },
    { label: 'About',         to: '/about' },
    { label: 'Blog',          to: '/blog' },
    { label: 'Help',          to: '/help' },
  ];

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface-bg/80 backdrop-blur-xl border-b border-outline-variant/30'
          : 'bg-surface-bg/40 backdrop-blur-xl border-b border-outline-variant/20'
      }`}
    >
      <div className="max-w-container mx-auto px-4 md:px-[64px] flex items-center justify-between h-[72px]">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-xl font-black uppercase tracking-tighter text-white hover:text-magenta transition-colors"
          aria-label="Printfection UK – Home"
        >
          {BRAND.name}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `font-mono text-[11px] uppercase tracking-[0.15em] transition-colors ${
                  isActive
                    ? 'text-magenta'
                    : 'text-on-surface-variant hover:text-on-surface'
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
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-on-surface hover:text-magenta transition-colors"
          >
            Request a Quote
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 text-on-surface-variant hover:text-magenta transition-colors"
            aria-label={`Cart (${itemCount} items)`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-magenta text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          <Link
            to="/bulk-order"
            className="bg-magenta text-black px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-white transition-colors duration-300"
          >
            Start Your Order
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 text-on-surface"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileOpen}
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface-bg border-t border-outline-variant/30 px-4 py-6 flex flex-col gap-4">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-on-surface-variant hover:text-white py-1"
            >
              {label}
            </NavLink>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-outline-variant/30">
            <Link
              to="/quote"
              onClick={() => setMobileOpen(false)}
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-on-surface hover:text-magenta"
            >
              Request a Quote
            </Link>
            <Link
              to="/bulk-order"
              onClick={() => setMobileOpen(false)}
              className="bg-magenta text-black px-5 py-3 font-mono text-[11px] uppercase tracking-[0.15em] text-center hover:bg-white transition-colors"
            >
              Start Your Order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────────────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="bg-[#050505] w-full pt-24 pb-12 border-t border-[#1a1a1a]">
      {/* Giant watermark */}
      <div className="max-w-container mx-auto px-4 md:px-[64px] mb-16 overflow-hidden">
        <p className="font-display font-black text-[12vw] leading-none text-white opacity-[0.04] text-center tracking-tighter select-none">
          PRINTFECTION
        </p>
      </div>

      {/* Links grid */}
      <div className="max-w-container mx-auto px-4 md:px-[64px] border-t border-[#222] pt-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <p className="font-display text-2xl font-black uppercase tracking-tighter text-white mb-2">{BRAND.name}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#555] mb-4">Industrial Grade Branding.</p>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Premium custom clothing and merchandise manufacturing based in the United Kingdom.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white mb-5">Services</h4>
          <ul className="space-y-3 text-sm text-on-surface-variant">
            {['Screen Printing', 'Embroidery', 'DTG / DTF', 'Relabeling & Finishing'].map((s) => (
              <li key={s}><Link to="/services" className="hover:text-magenta transition-colors">{s}</Link></li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white mb-5">Support</h4>
          <ul className="space-y-3 text-sm text-on-surface-variant">
            {[
              { label: 'Help Center / FAQ', to: '/help' },
              { label: 'Artwork Guidelines', to: '/guidelines' },
              { label: 'Shipping & Returns', to: '/shipping' },
              { label: 'Contact Us', to: '/contact' },
            ].map(({ label, to }) => (
              <li key={to}><Link to={to} className="hover:text-magenta transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white mb-5">Company</h4>
          <ul className="space-y-3 text-sm text-on-surface-variant">
            {[
              { label: 'About Us', to: '/about' },
              { label: 'Sustainability', to: '/sustainability' },
              { label: 'Terms of Service', to: '/terms' },
              { label: 'Privacy Policy', to: '/privacy' },
            ].map(({ label, to }) => (
              <li key={to}><Link to={to} className="hover:text-magenta transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-container mx-auto px-4 md:px-[64px] mt-14 pt-8 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#444]">
          © {new Date().getFullYear()} Printfection UK. All Rights Reserved.
        </span>
        <div className="flex gap-5">
          {['Instagram', 'LinkedIn', 'Twitter'].map((s) => (
            <a
              key={s}
              href="#"
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#444] hover:text-white transition-colors"
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
