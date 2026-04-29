import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../contexts/ProductContext';

export default function SidebarFilters({ className = '' }) {
  const { filters, updateFilter } = useProducts();
  const [expandedSections, setExpandedSections] = useState({
    category: false,
    metalType: false,
    priceRange: false,
    diamondWeight: false,
    karat: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCheckboxChange = (filterType, value, isChecked) => {
    updateFilter(filterType, value, isChecked);
  };

  const categories = ['Rings', 'EarRings', 'Necklace', 'Engagement', "Men's", 'Coins'];

  const metalTypes = ['Gold', 'Silver'];

  const priceRanges = [
    { id: 'below-100000', label: 'Below ₹1,00,000' },
    { id: '100000-300000', label: '₹1,00,000 - ₹3,00,000' },
    { id: '300000-500000', label: '₹3,00,000 - ₹5,00,000' },
    { id: 'above-500000', label: 'Above ₹5,00,000' },
  ];

  const diamondWeights = [
    { id: '0.01-1.00', label: '0.01 - 1.00' },
    { id: '0.11-2.00', label: '0.11 - 2.00' },
  ];

  const karats = ['18kt', '20kt', '22kt', '24kt'];

  const clearAll = () => {
    Object.keys(filters).forEach((key) => {
      filters[key].forEach((value) => updateFilter(key, value, false));
    });
  };

  const hasActive = Object.values(filters).some((arr) => arr.length > 0);

  const FilterSection = ({ title, items, filterType, isPrice = false }) => (
    <div className="border-b border-black/10 py-4 first:pt-0">
      <button
        type="button"
        onClick={() => toggleSection(filterType)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-serif text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-900">
          {title}
        </span>
        {expandedSections[filterType] ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" strokeWidth={1.5} />
        )}
      </button>

      <AnimatePresence initial={false}>
        {expandedSections[filterType] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 pb-1">
              {items.map((item) => {
                const value = isPrice ? item.id : item;
                const label = isPrice ? item.label : item;
                const isChecked = filters[filterType].includes(value);

                return (
                  <label key={String(value)} className="group flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => handleCheckboxChange(filterType, value, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="ml-3 text-sm text-slate-600 group-hover:text-slate-900">{label}</span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <aside
      className={`h-max w-full bg-[#f5f5f5] lg:sticky lg:top-[88px] lg:max-w-[280px] lg:shrink-0 lg:border-r lg:border-black/10 ${className}`}
    >
      <div className="p-6 pt-0 lg:pt-1">
        <FilterSection title="Product Category" items={categories} filterType="category" />
        <FilterSection title="Metal Type" items={metalTypes} filterType="metalType" />
        <FilterSection title="Price Range" items={priceRanges} filterType="priceRange" isPrice />
        <FilterSection title="Diamond Weight" items={diamondWeights} filterType="diamondWeight" isPrice />
        <FilterSection title="Karat" items={karats} filterType="karat" />

        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="mt-6 w-full rounded-md border border-slate-900 bg-slate-900 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
