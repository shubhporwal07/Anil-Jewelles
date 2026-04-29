import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const imageFallback = 'https://via.placeholder.com/1200x900?text=Jewellery+Image';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      {/* Full-width layout */}
      <main className="w-full">
        {/* Header */}
        <div className="w-full px-6 md:px-12 pt-12 pb-8 text-center border-b border-black/10 bg-[#f5f5f5]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-wide text-gray-900">
            OUR JOURNEY &amp; VALUES
          </h1>
        </div>

        {/* Journey section */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="bg-gray-200">
            <img
              src="/images/about_hero.png"
              alt="Crafting jewellery"
              className="w-full h-full object-cover min-h-[380px] md:min-h-[520px]"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = imageFallback;
              }}
            />
          </div>

          <div className="p-10 md:p-14 bg-[#f5f5f5] flex items-center">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900 leading-snug">
                CRAFTING ELEGANCE
                <br />
                SINCE 2010
              </h2>

              <p className="mt-4 text-gray-700 leading-relaxed text-sm">
                ANIL JEWELLER&apos;S is an artisanal jewellery brand established in 2010, built on an unwavering commitment
                to quality and craftsmanship. Every creation is shaped with precision, care, and an eye for timeless
                beauty.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed text-sm">
                We are passionate about creating timeless pieces and heirlooms—crafted to be worn with pride and
                cherished for generations.
              </p>

              <div className="mt-8 text-gray-900/60 font-serif italic">— Anil</div>
            </div>
          </div>
        </section>

        {/* Commitment section */}
        <section className="w-full px-6 md:px-12 py-12 bg-[#f5f5f5] border-t border-black/10">
          <h3 className="text-center text-2xl md:text-3xl font-serif text-gray-900 tracking-wide">
            OUR COMMITMENT TO QUALITY
          </h3>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="mx-auto w-14 h-14 rounded-full border border-black/15 flex items-center justify-center text-gray-700">
                <span className="text-2xl font-serif">◇</span>
              </div>
              <p className="mt-4 text-sm font-semibold tracking-wide text-gray-900">ETHICAL SOURCING</p>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                We source only conflict-free diamonds and responsibly mined precious metals.
              </p>
            </div>

            <div>
              <div className="mx-auto w-14 h-14 rounded-full border border-black/15 flex items-center justify-center text-gray-700">
                <span className="text-2xl font-serif">⌁</span>
              </div>
              <p className="mt-4 text-sm font-semibold tracking-wide text-gray-900">ARTISANAL CRAFTSMANSHIP</p>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                Every piece is meticulously handcrafted by experienced artisans in our workshop.
              </p>
            </div>

            <div>
              <div className="mx-auto w-14 h-14 rounded-full border border-black/15 flex items-center justify-center text-gray-700">
                <span className="text-2xl font-serif">∞</span>
              </div>
              <p className="mt-4 text-sm font-semibold tracking-wide text-gray-900">TIMELESS DESIGN</p>
              <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                Our designs are created to transcend trends and be cherished for generations.
              </p>
            </div>
          </div>

          {/* Supporting images row (like screenshot bottom) */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-200 overflow-hidden">
              <img
                src="/images/ethical_sourcing.png"
                alt="Ethical sourcing"
                className="w-full h-56 md:h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imageFallback;
                }}
              />
            </div>
            <div className="bg-gray-200 overflow-hidden">
              <img
                src="/images/artisanal_craftsmanship.png"
                alt="Artisanal craftsmanship"
                className="w-full h-56 md:h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imageFallback;
                }}
              />
            </div>
            <div className="bg-gray-200 overflow-hidden">
              <img
                src="/images/timeless_design.png"
                alt="Timeless design"
                className="w-full h-56 md:h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = imageFallback;
                }}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;