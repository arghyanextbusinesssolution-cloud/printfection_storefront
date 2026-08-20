import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../../services/api';
import type { Category, Product } from '../../types';


/* ─────────────────────────────────────────────────────────
   1. HERO
───────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden border-b border-[#222]">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-black">
        <div
          className="w-full h-full bg-cover bg-center opacity-35"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBmDh2F5C8IJO2XZoRIzSRLR4uw_UiNn4iQQMzMFRwbhjcdD3eu0RXCe_m9VjbIPboTzUhzDNR5GihS9ARzii76hjsoMVSJtD3NmzwKoEbUY3DisQ303c3MFiJ-bpTKsfMOShBIebmwAeUx4ign7zUJ5gzax7kyO6HcdCZHYGYyEphpp4I6UGPsJx612aTysyw_l8FNmanY-lyUmBeMm0Faxzx1zw03vdAR6ppEtwUiC1MCmo9cRK_u')`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/30 to-[#0B0B0B]/60" />
        {/* Subtle magenta glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-magenta/10 blur-[120px] rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-container mx-auto px-4 md:px-[64px] w-full text-center pt-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-magenta mb-6 fade-up">
          Custom Garment Printing&nbsp;•&nbsp;UK
        </p>

        <h1 className="font-display font-black text-[clamp(52px,9vw,100px)] leading-[1.0] uppercase tracking-tighter text-white mb-8 fade-up">
          PRINT IT.<br />
          WEAR IT.<br />
          <span className="text-magenta">MAKE IT YOURS.</span>
        </h1>

        <p className="font-sans text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 fade-up">
          Industrial-grade printing for brands that demand perfection. High-volume runs,
          premium blanks, and absolute consistency from first print to last.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-up">
          <Link to="/bulk-order" className="btn-magenta w-full sm:w-auto text-sm px-10 py-5">
            Start Bulk Order
          </Link>
          <Link to="/single-order" className="border border-[#333] hover:border-white text-white transition-all w-full sm:w-auto text-sm px-10 py-5 font-mono uppercase tracking-[0.15em] flex items-center justify-center">
            One-Off Custom
          </Link>
          <Link to="/quote" className="btn-ghost w-full sm:w-auto text-sm px-10 py-5">
            Request a Quote
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <span className="w-px h-10 bg-white block" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">Scroll</span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   2. INTRO / Brand Statement
───────────────────────────────────────────────────────── */
function IntroSection() {
  return (
    <section className="py-[120px] px-4 md:px-[64px] max-w-container mx-auto border-b border-[#222]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-display font-black text-[clamp(32px,4vw,48px)] leading-[1.1] uppercase tracking-tighter text-white mb-8">
            More Than Merch.{' '}
            <br />
            <span className="text-outline-white">We Make Your Brand Wearable.</span>
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
            We don't just print t-shirts; we manufacture brand identity. Operating from our UK
            facility, we utilize state-of-the-art screen printing, precision embroidery, and
            advanced digital techniques to deliver retail-ready garments.
          </p>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Whether you are an established streetwear label, a corporate entity seeking premium
            uniforms, or an event organizer needing massive volume, we provide the industrial
            capacity and meticulous quality control your project demands.
          </p>
        </div>
        <div className="relative h-[500px] w-full industrial-border overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqDyXuZiTLh_mpD_uibj_MQaF5EgsFzFIzVKsSxKZl_yJpRCKpzCWkoKoxYEwlCE0qK2lD2oSwwa19vG8A8oLM0NEMhvxP1fnoTsrGy5aIJnn90qDFWIQsz30ew8IY2WqPq5TF9fpkv10k7_gbiHlasMX8djbU8AdJKIpmORJkzkowkh7oSn0hg4XPYcblrj3AXby1VRl2527dQSLqz8REk9mFRIfC1EVWU_K7wFwh3w3yABq_ry2m"
            alt="High-end production detail"
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   3. HOW IT WORKS — 4-step grid
───────────────────────────────────────────────────────── */
const steps = [
  {
    num: '01',
    title: 'Choose Your Garment',
    body: 'Select from our curated range of premium blanks, heavyweights, and sustainable options from top global mills.',
  },
  {
    num: '02',
    title: 'Build Your Order',
    body: 'Mix sizes and colors freely. Scale up for significant bulk discounts. Minimum 25 units per design.',
  },
  {
    num: '03',
    title: 'Create Your Design',
    body: 'Upload artwork, define placement precisely, and review digital proofs before any ink touches fabric.',
  },
  {
    num: '04',
    title: 'We Print & Deliver',
    body: 'Industrial-grade production ensures perfect consistency. Carefully packed and delivered fast across the UK.',
  },
];

function HowItWorksSection() {
  return (
    <section className="py-[120px] px-4 md:px-[64px] max-w-container mx-auto border-b border-[#222]">
      <div className="mb-16 text-center max-w-4xl mx-auto">
        <h2 className="font-display font-black text-[clamp(32px,4vw,48px)] leading-[1.1] uppercase tracking-tighter text-white mb-4">
          From Blank to Branded<br />in Four Simple Steps.
        </h2>
        <p className="text-on-surface-variant text-lg">
          Our streamlined process takes the complexity out of custom manufacturing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 divide-x-0 md:divide-x divide-y md:divide-y-0 divide-[#333] border border-[#333]">
        {steps.map(({ num, title, body }) => (
          <div
            key={num}
            className="p-10 bg-surface-bg hover:bg-[#111] transition-colors group cursor-default"
          >
            <div className="font-display font-black text-[72px] leading-none text-[#333] group-hover:text-magenta transition-colors duration-300 mb-6">
              {num}
            </div>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white mb-3">
              {title}
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   4. PRODUCT CATEGORIES — editorial grid with real images
───────────────────────────────────────────────────────── */

// Fetch a few products from a given category and return the first image
function useCategoryImage(categoryId: string): string | null {
  const { data } = useQuery({
    queryKey: ['category-preview-image', categoryId],
    queryFn: () =>
      apiGet<{ items: Product[] }>('/products', { category: categoryId, page: '1' } as Record<string, unknown>),
    enabled: !!categoryId,
    staleTime: 300_000,
  });
  return data?.items?.find((p) => p.images?.[0])?.images[0] ?? null;
}

// Card that fetches its own category's product image
function CategoryCard({
  cat,
  large,
}: {
  cat: Category;
  large: boolean;
}) {
  const realImg = useCategoryImage(cat._id);
  const icon = cat.icon || '👕';

  return (
    <Link
      to={`/products?category=${cat._id}`}
      className={`relative group overflow-hidden industrial-border ${large ? 'h-[400px] md:h-auto' : 'flex-1 min-h-[260px]'} block`}
    >
      {/* Background image */}
      {realImg ? (
        <img
          src={realImg}
          alt={cat.name}
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-[#111] flex items-center justify-center">
          <span className="text-6xl opacity-20">{icon}</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
        <h3 className={`font-display font-black text-white uppercase mb-2 ${large ? 'text-4xl' : 'text-2xl'}`}>
          {cat.name}
        </h3>
        {cat.description && (
          <p className="text-[#e5bcc5] mb-4 text-sm line-clamp-2">{cat.description}</p>
        )}
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF007F] group-hover:text-white transition-colors">
          Shop {cat.name} ➔
        </span>
      </div>
    </Link>
  );
}

function CategoriesSection() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiGet<Category[]>('/categories'),
  });

  // Stitch editorial fallback cards (used when no API categories exist)
  const fallbackCards = [
    {
      label: 'Premium T-Shirts',
      sub: 'Heavyweight cotton, vintage washes, and modern retail fits ready for your artwork.',
      cta: 'Shop T-Shirts',
      to: '/products?category=t-shirts',
      img: '/images/products/classic_organic_t_shirt_black_1787252480190.png',
      span: 'md:col-span-7',
      large: true,
    },
    {
      label: 'Heavy Hoodies',
      sub: 'Ultra-thick fleece blends built for longevity.',
      cta: 'Shop Hoodies',
      to: '/products?category=hoodies',
      img: '/images/products/premium_hoodie_black_1787252519639.png',
      span: 'md:col-span-5',
      large: false,
    },
    {
      label: 'Headwear & Bags',
      sub: 'Complete your collection with embroidered accessories.',
      cta: 'Shop Accessories',
      to: '/products?category=bags',
      img: '/images/products/performance_polo_royal_blue_1787252543400.png',
      span: 'md:col-span-5',
      large: false,
    },
  ];

  return (
    <section className="py-[120px] px-4 md:px-[64px] max-w-container mx-auto border-b border-[#222]">
      <div className="flex justify-between items-end mb-14">
        <h2 className="font-display font-black text-[clamp(32px,4vw,48px)] leading-[1.1] uppercase tracking-tighter text-white max-w-sm">
          The Perfect Blank Canvas.
        </h2>
        <Link
          to="/products"
          className="hidden md:block font-mono text-[11px] uppercase tracking-[0.15em] text-white hover:text-magenta transition-colors"
        >
          View Full Catalog ➔
        </Link>
      </div>

      {/* API categories with real product images */}
      {categories && categories.length > 0 ? (
        categories.length >= 3 ? (
          /* Editorial 12-col grid — first category is large, rest stack right */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[560px]">
            <div className="md:col-span-7">
              <CategoryCard cat={categories[0]} large={true} />
            </div>
            <div className="md:col-span-5 flex flex-col gap-6">
              {categories.slice(1, 3).map((cat) => (
                <CategoryCard key={cat._id} cat={cat} large={false} />
              ))}
            </div>
          </div>
        ) : (
          /* Simple grid for fewer categories */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-[400px]">
            {categories.map((cat) => (
              <CategoryCard key={cat._id} cat={cat} large={false} />
            ))}
          </div>
        )
      ) : (
        /* Editorial fallback when API returns nothing */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[560px]">
          {/* Large card */}
          <Link
            to={fallbackCards[0].to}
            className="md:col-span-7 relative group overflow-hidden industrial-border h-[400px] md:h-auto"
          >
            <img
              src={fallbackCards[0].img}
              alt={fallbackCards[0].label}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
              <h3 className="font-display font-black text-4xl text-white uppercase mb-2">{fallbackCards[0].label}</h3>
              <p className="text-[#e5bcc5] mb-5 max-w-xs text-sm">{fallbackCards[0].sub}</p>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#FF007F] group-hover:text-white transition-colors">
                {fallbackCards[0].cta} ➔
              </span>
            </div>
          </Link>

          {/* Two small cards */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {fallbackCards.slice(1).map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="relative group overflow-hidden industrial-border flex-1 min-h-[260px]"
              >
                <img
                  src={card.img}
                  alt={card.label}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-7">
                  <h3 className="font-display font-black text-3xl text-white uppercase mb-2">{card.label}</h3>
                  <p className="text-[#e5bcc5] mb-3 text-sm">{card.sub}</p>
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#FF007F] group-hover:text-white transition-colors">
                    {card.cta} ➔
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   5. BULK ORDERING
───────────────────────────────────────────────────────── */
function BulkOrderSection() {
  const perks = [
    {
      icon: 'check_circle',
      title: 'Mix & Match Any Way',
      body: 'Combine different sizes, colors, and even garment styles within the same print run to hit quantity breaks.',
    },
    {
      icon: 'trending_down',
      title: 'Transparent Volume Pricing',
      body: 'Real-time unit cost updates as you adjust quantities. No hidden setup fees or surprise charges.',
    },
    {
      icon: 'inventory_2',
      title: 'Dedicated Account Management',
      body: 'Orders over 500 units receive priority routing and a dedicated production specialist.',
    },
  ];

  const orderLines = [
    { desc: "Stanley/Stella Creator – Black (M)", qty: 'x 20' },
    { desc: "Stanley/Stella Creator – Black (L)", qty: 'x 30' },
    { desc: "Stanley/Stella Creator – White (L)", qty: 'x 15' },
  ];

  return (
    <section className="py-[120px] px-4 md:px-[64px] bg-[#080808] border-b border-[#222] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-magenta/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-magenta mb-4">Volume Production</p>
          <h2 className="font-display font-black text-[clamp(32px,4vw,48px)] leading-[1.1] uppercase tracking-tighter text-white mb-8">
            Built for Scale.<br />Priced for Profit.
          </h2>
          <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
            Our bulk ordering system is engineered for brands. We've eliminated the friction of
            managing complex size runs and colorways.
          </p>

          <ul className="space-y-6 mb-10">
            {perks.map(({ icon, title, body }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="material-symbols-outlined text-magenta mt-0.5 text-xl">{icon}</span>
                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white mb-1">{title}</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/bulk-order"
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-magenta hover:text-black transition-colors font-bold"
          >
            View Bulk Pricing
          </Link>
        </div>

        {/* Right: mock order card */}
        <div className="industrial-border bg-[#111] p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#333]">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white">Order Summary</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-magenta">65 Items</span>
          </div>

          <div className="space-y-3 mb-6">
            {orderLines.map(({ desc, qty }) => (
              <div key={desc} className="flex justify-between text-sm text-on-surface-variant">
                <span>{desc}</span>
                <span>{qty}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#333] pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant text-sm">Unit Price (Discounted)</span>
              <span className="text-white">£8.45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-white uppercase font-mono text-[11px] tracking-[0.1em]">Total Estimate</span>
              <span className="font-bold text-magenta text-xl">£549.25</span>
            </div>
          </div>

          <Link
            to="/bulk-order"
            className="mt-6 w-full block text-center bg-magenta text-black px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-white transition-colors"
          >
            Build This Order
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   6. DESIGN STUDIO CTA
───────────────────────────────────────────────────────── */
function DesignStudioSection() {
  return (
    <section className="py-[120px] px-4 md:px-[64px] text-center bg-surface-bg border-b border-[#222]">
      <div className="max-w-3xl mx-auto mb-14">
        <h2 className="font-display font-black text-[clamp(32px,4vw,48px)] leading-[1.1] uppercase tracking-tighter text-white mb-6">
          Your Idea.<br />On the Garment.
        </h2>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Upload your vector artwork or high-res imagery, position it exactly where you want it, and
          approve your digital proof instantly. It's the closest thing to being in the print shop.
        </p>
      </div>

      <div className="max-w-5xl mx-auto relative h-[480px] industrial-border overflow-hidden flex items-center justify-center">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuHaaYeTFwJyYkUFDNCR8kI6fagbu4ssr7d_lJIzKvKpBQ6bCDgT8AvtEOAFWp914V5Z-H-zq7ir5PdPHq8BTPC4btOPSPE_RDixgIkypZwNIDWasbq8xEUAySO0ixR2TuC7qL2F_44Yp0MbgYN-gHochGb3FAWQWY8Q8zP55mfxLwACkXk9iwJ1-EADrZP7RdTuGtBrJ9-VhbCA7LrgUsYJP3SObFncXJebshcTMVuYXxZQCvyWe6"
          alt="Design Tool Interface"
          className="absolute w-full h-full object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="relative z-10 bg-black/60 backdrop-blur-md p-10 industrial-border flex flex-col items-center max-w-sm w-full mx-4">
          <span className="material-symbols-outlined text-magenta text-5xl mb-4">design_services</span>
          <h3 className="font-mono text-[13px] uppercase tracking-[0.2em] text-white mb-2">Launch Design Studio</h3>
          <p className="text-on-surface-variant text-sm mb-6">
            Interactive 3D previews &amp; exact placement metrics.
          </p>
          <Link
            to="/design"
            className="bg-magenta text-black px-6 py-3 font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-white transition-colors"
          >
            Start Designing
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   7. PRINTING SERVICES
───────────────────────────────────────────────────────── */
const services = [
  {
    num: '01',
    title: 'Screen Printing',
    body: 'The gold standard for high-volume, highly durable apparel decoration. We use premium plastisol and water-based inks pushed through high-tension mesh for razor-sharp edges and vibrant colors that outlast the garment itself.',
    specs: ['Best for: 50+ units, solid colors', 'Maximum durability', 'Pantone matching available'],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoNXPvdv7OZLMLUmtZ1fwYr0SDBMlI05VRBLhP1WNujrn-c9GtxtYi3Uoo7NX9EIGRuBEMhBPn2NcFtCOsFm_faTKjdJIkEcHZim_B9Wbxzm4UbCmnfbPA8ctO5oltGkjtD7s_gslZJoKN1yqrk5TlQzZpwth1a81LbpIej16CIq6RVr5gIMAl4wdzbG0tEdFyfUKs77XjifhTan-J3E0msZ6BPk4zQ8ZZpbVqU2gDVtzPIuQTDKdv',
    imageLeft: true,
  },
  {
    num: '02',
    title: 'Precision Embroidery',
    body: 'Elevate your brand with tactile, three-dimensional threading. Our multi-head industrial machines digitize your logo into thousands of precise stitches, perfect for heavy garments, headwear, and premium corporate identity.',
    specs: ['Best for: Hoodies, Hats, Workwear', 'Premium textured finish', '3D Puff options available'],
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdVfMrrBIGUwMVs-FzV4qrVD29B4k7mZwBqrWh8dhZBoxdwl6xZYphRsHCYDZH7jJhAHbpNenBDmrY9PKuV3NZjdr-Cly3V57dArwUwieJQq33GKCFNuZVuzojm3gJVK0l_Ep9KLdUml9RTbfE085X4XlXDfxwnk1-4LFP_mpbeeeAA0ZFJJ77VBu8LEJBjcKiG9zEZp7jB0uwnd0Xy5xIjmYekBmEDrfkkDhxmKENTa1LNuQYOA0K',
    imageLeft: false,
  },
];

function ServicesSection() {
  return (
    <section className="py-[120px] px-4 md:px-[64px] max-w-container mx-auto border-b border-[#222]">
      <div className="mb-16 text-center">
        <h2 className="font-display font-black text-[clamp(32px,4vw,48px)] leading-[1.1] uppercase tracking-tighter text-white">
          Industrial Techniques.<br />Artisan Attention.
        </h2>
      </div>

      <div className="space-y-24">
        {services.map(({ num, title, body, specs, img, imageLeft }) => (
          <div key={num} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className={`h-[400px] industrial-border relative overflow-hidden ${imageLeft ? '' : 'order-1 md:order-2'}`}>
              <img
                src={img}
                alt={title}
                className="w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            {/* Text */}
            <div className={imageLeft ? '' : 'order-2 md:order-1'}>
              <h3 className="font-display font-black text-4xl uppercase text-white mb-4">
                {num}. {title}
              </h3>
              <p className="text-on-surface-variant leading-relaxed mb-6">{body}</p>
              <ul className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#555] space-y-2">
                {specs.map((s) => <li key={s}>• {s}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   8. WHY PRINTFECTION
───────────────────────────────────────────────────────── */
const reasons = [
  { num: '1', title: 'UK Facility', body: 'Everything produced in-house. No outsourcing. Total control.' },
  { num: '2', title: 'Retail Quality', body: 'Garments meant to be sold on shelves, not given away.' },
  { num: '3', title: 'Strict QC', body: 'Multi-stage inspection before any box is sealed.' },
  { num: '4', title: 'Fast Turnaround', body: 'Reliable lead times that respect your launch dates.' },
  { num: '5', title: 'Eco Options', body: 'Extensive range of organic and recycled blank options.' },
];

function WhyUsSection() {
  return (
    <section className="py-[120px] px-4 md:px-[64px] bg-[#050505] border-b border-[#222]">
      <div className="max-w-container mx-auto">
        <h2 className="font-display font-black text-[clamp(32px,4vw,48px)] leading-[1.1] uppercase tracking-tighter text-white mb-16 text-center">
          Why We Lead the Line.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {reasons.map(({ num, title, body }) => (
            <div
              key={num}
              className="text-center p-8 border border-[#222] hover:border-magenta transition-colors bg-surface-bg group"
            >
              <div className="font-display font-black text-5xl text-magenta mb-4">{num}</div>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-white mb-3">{title}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   9. FINAL CTA — Full-width magenta
───────────────────────────────────────────────────────── */
function FinalCTASection() {
  return (
    <section className="py-32 px-4 md:px-[64px] bg-magenta text-black text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-display font-black text-[clamp(40px,6vw,80px)] leading-[0.95] uppercase tracking-tighter mb-8">
          Ready to Turn Blank Into Branded?
        </h2>
        <p className="text-black/80 text-lg md:text-xl font-semibold max-w-2xl mx-auto mb-10">
          Start your project today. Get instant pricing online or speak with our production team for
          custom requirements.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/bulk-order"
            className="inline-flex items-center justify-center px-10 py-5 bg-black text-white font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
          >
            Start Order Now
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-10 py-5 border-2 border-black text-black font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE ASSEMBLY
───────────────────────────────────────────────────────── */
export function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <IntroSection />
      <HowItWorksSection />
      <CategoriesSection />
      <BulkOrderSection />
      <DesignStudioSection />
      <ServicesSection />
      <WhyUsSection />
      <FinalCTASection />
    </div>
  );
}
