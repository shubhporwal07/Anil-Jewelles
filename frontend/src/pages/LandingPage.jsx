import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Search, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const collections = [
  {
    id: 'rings',
    title: 'Diamond Earrings',
    subtitle: 'Dazzling precision in every facet.',
    image: '/images/diamond_earrings_collection.png',
  },
  {
    id: 'necklaces',
    title: 'Gold & Diamond Necklaces',
    subtitle: 'Artistic expressions of light and grace.',
    image: '/images/gold_diamond_necklace_collection.png',
  },
  {
    id: 'bracelets',
    title: 'Statement Bracelets',
    subtitle: 'Refined silhouettes with a luminous finish.',
    image: '/images/statement_bracelets.png',
  },
  {
    id: 'earrings',
    title: 'Everyday Classics',
    subtitle: 'Quiet luxury for the pieces you never take off.',
    image: '/images/everyday_classics.png',
  },
];

/** Shape matches future Firebase product documents */
const bestSellers = [
  {
    id: 'bs-1',
    name: 'Solstice Diamond Ring',
    price: 124900,
    image: '/images/solstice_diamond_ring.png',
  },
  {
    id: 'bs-2',
    name: 'Aurora Pearl Strand',
    price: 89900,
    image: '/images/aurora_pearl_strand.png',
  },
  {
    id: 'bs-3',
    name: 'Celeste Gold Bracelet',
    price: 67900,
    image: '/images/celeste_gold_bracelet.png',
  },
  {
    id: 'bs-4',
    name: 'Éclat Drop Earrings',
    price: 45900,
    image: '/images/eclat_drop_earrings.png',
  },
];

const imageFallback = 'https://via.placeholder.com/900x900?text=Jewellery+Image';

const commitments = [
  { icon: Heart, label: 'Ethical sourcing' },
  { icon: Search, label: 'Artisanal craftsmanship' },
  { icon: ShoppingBag, label: 'Timeless design' },
];

function formatPriceINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-stone-900 font-sans">
      <Navbar />

      {/* HERO */}
      <section id="hero" className="relative overflow-hidden px-4 py-2 sm:py-3 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-20 sm:h-40 bg-gradient-to-b from-white/40 to-transparent" />

        <motion.div
          className="relative mx-auto grid max-w-[1440px] items-stretch gap-0 overflow-hidden rounded-2xl border border-[#d4c6b3] bg-[#f5f5f5] shadow-[0_28px_70px_-40px_rgba(0,0,0,0.35)] h-[calc(100vh-56px-1rem)] sm:h-[calc(100vh-72px-1.5rem)] grid-cols-1 lg:grid-cols-[1.18fr_0.82fr]"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-l-2xl lg:min-h-full">
            <img
              src="https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Hand wearing elegant diamond jewelry"
              className="h-full w-full object-cover object-center"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = imageFallback;
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,17,12,0.12)_0%,rgba(20,17,12,0.02)_50%,rgba(20,17,12,0)_100%)]" />
          </motion.div>

          <motion.div variants={fadeInUp} className="relative flex items-center rounded-r-2xl px-4 sm:px-6 py-5 sm:py-6 md:px-9 lg:px-10">
            <div className="max-w-xl">
              <p className="text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.38em] text-stone-600">Anil Jewellers</p>
              <h1 className="mt-3 sm:mt-4 max-w-md font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-[4.2rem] leading-[1] text-stone-900">
                Timeless
                <br />
                Elegance,
                <br />
                Unveiled.
              </h1>
              <p className="mt-2.5 sm:mt-3 max-w-sm text-sm sm:text-[0.9rem] leading-5 text-stone-700">
                Explore our curated collections of exceptional diamond artistry.
              </p>
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="border border-[#9c7a39] bg-[#3e362a] px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#d9b56a] shadow-[0_10px_24px_-16px_rgba(0,0,0,0.55)] transition hover:bg-[#4a4236]"
                >
                  Shop the New Collection
                </button>
              </div>

              <div className="mt-4 sm:mt-6 hidden sm:grid gap-3 border-t border-[#dccfbe] pt-3 sm:pt-4 sm:grid-cols-2">
                {collections.slice(0, 2).map((item, index) => (
                  <motion.article
                    key={item.id}
                    variants={fadeInUp}
                    className={`grid gap-2 ${index === 1 ? 'sm:border-l sm:border-[#dccfbe] sm:pl-4' : ''}`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-20 sm:h-24 w-full object-cover object-center shadow-[0_18px_42px_-28px_rgba(0,0,0,0.35)]"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = imageFallback;
                      }}
                    />
                    <div>
                      <h2 className="font-serif text-sm sm:text-base leading-none text-stone-900 uppercase">{item.title}</h2>
                      <p className="mt-1 max-w-xs text-[11px] leading-4 text-stone-700">{item.subtitle}</p>
                      <button
                        type="button"
                        onClick={() => scrollToId('collections')}
                        className="mt-1.5 text-xs font-medium text-[#b08c43] underline underline-offset-4"
                      >
                        Explore {item.id === 'rings' ? 'Earrings' : 'Necklaces'}
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        id="collections"
        className="mx-auto max-w-[1440px] px-4 py-4 sm:py-6 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.75fr_1.15fr]">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {collections.slice(0, 2).map((item) => (
              <motion.article
                key={item.id}
                variants={fadeInUp}
                className="grid gap-0 overflow-hidden rounded-2xl border border-[#d9ccb9] bg-[#f5f5f5] shadow-[0_14px_40px_-28px_rgba(0,0,0,0.22)] sm:grid-cols-[0.92fr_1fr]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-40 sm:h-52 w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = imageFallback;
                  }}
                />
                <div className="flex flex-col justify-center p-4 sm:p-5 md:p-6">
                  <h3 className="font-serif text-xl sm:text-3xl uppercase leading-none text-stone-900">{item.title}</h3>
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm leading-5 sm:leading-6 text-stone-700">{item.subtitle}</p>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 sm:mt-5 text-left text-xs sm:text-sm font-semibold text-[#b08c43] underline underline-offset-4"
                  >
                    Explore collections
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col justify-between rounded-2xl border border-[#d9ccb9] bg-[#f5f5f5] p-4 sm:p-6 md:p-8 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.22)]"
          >
            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 text-center">
              {commitments.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex flex-col items-center gap-2 sm:gap-3 px-1 sm:px-2">
                    <div className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-full border border-[#d6c4a5] text-[#b08c43]">
                      <Icon className="h-5 sm:h-6 w-5 sm:w-6" strokeWidth={1.6} />
                    </div>
                    <p className="text-[0.6rem] sm:text-[0.7rem] uppercase leading-4 sm:leading-5 tracking-[0.16em] text-stone-800">{item.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 sm:mt-10 text-center">
              <p className="font-serif text-xl sm:text-3xl uppercase tracking-[0.08em] text-stone-900">Our Commitment</p>
              <button
                type="button"
                onClick={() => scrollToId('about')}
                className="mt-3 sm:mt-4 border-b border-stone-900 pb-1 text-xs sm:text-sm font-medium tracking-[0.18em] text-stone-900"
              >
                Learn Our Story
              </button>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((item) => (
            <motion.article
              key={item.id}
              variants={fadeInUp}
                className="group overflow-hidden rounded-2xl border border-[#d9ccb9] bg-[#f5f5f5] shadow-[0_14px_40px_-28px_rgba(0,0,0,0.22)]"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-40 sm:h-48 lg:h-56 w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imageFallback;
                }}
              />
              <div className="p-4 sm:p-5">
                <p className="text-[0.65rem] sm:text-[0.68rem] uppercase tracking-[0.24em] text-stone-500">Best seller</p>
                <h3 className="mt-2 font-serif text-lg sm:text-2xl uppercase leading-none text-stone-900">{item.name}</h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-stone-700">{formatPriceINR(item.price)}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="about"
        className="mx-auto max-w-[1440px] px-4 pb-4 sm:pb-6 pt-2 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
      >
        <div className="grid gap-0 overflow-hidden rounded-2xl border border-[#d9ccb9] bg-[#f5f5f5] grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-4 sm:p-6 md:p-8 lg:p-12">
            <p className="text-[0.65rem] sm:text-[0.72rem] uppercase tracking-[0.38em] text-stone-600">Our Story</p>
            <h2 className="mt-3 sm:mt-4 font-serif text-2xl sm:text-4xl lg:text-5xl uppercase leading-none text-stone-900">
              Crafted with quiet confidence.
            </h2>
            <p className="mt-4 sm:mt-6 max-w-2xl text-xs sm:text-base lg:text-lg leading-6 sm:leading-8 text-stone-700">
              ANIL JEWELLER&apos;S blends precise craftsmanship with a restrained, modern aesthetic. Every piece is
              selected to feel enduring, polished, and personal.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-6 sm:mt-8 border-b border-stone-900 pb-1 text-xs sm:text-sm font-medium tracking-[0.18em] text-stone-900"
            >
              View the full collection
            </button>
          </div>
          <div className="relative min-h-[16rem] overflow-hidden rounded-r-2xl sm:min-h-[20rem] bg-[linear-gradient(180deg,#ece2d2_0%,#d9cab5_100%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.55),transparent_35%),radial-gradient(circle_at_25%_80%,rgba(255,255,255,0.25),transparent_28%)]" />
            <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
              <div className="text-center">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.45em] text-stone-700">From design to detail</p>
                <p className="mt-3 sm:mt-4 font-serif text-4xl sm:text-5xl uppercase tracking-[0.12em] text-stone-900">Luxury</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
