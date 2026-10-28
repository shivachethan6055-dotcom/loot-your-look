import React, { useState, useMemo } from 'react';
import {
  Filter,
  SlidersHorizontal,
  Sparkles,
  Search,
  RotateCcw,
  Tag,
  Building2,
  ChevronDown,
  Ruler,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { ClothingDepartment, ClothingCategory } from '../types';
import { ALLOWED_CLOTHING_CATEGORIES } from '../services/clothingValidation';

export const ClothingCatalog: React.FC = () => {
  const {
    products,
    searchQuery,
    setSearchQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedCategory,
    setSelectedCategory,
    setIsSizeChartOpen,
  } = useApp();

  const [selectedFabric, setSelectedFabric] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [selectedWholesaler, setSelectedWholesaler] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'>('featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Extract distinct fabrics and wholesalers from catalog
  const fabricList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.fabric) {
        // e.g. "Pure Cotton", "Silk", "Linen"
        if (p.fabric.toLowerCase().includes('cotton')) set.add('Cotton');
        if (p.fabric.toLowerCase().includes('silk')) set.add('Silk');
        if (p.fabric.toLowerCase().includes('linen')) set.add('Linen');
        if (p.fabric.toLowerCase().includes('wool') || p.fabric.toLowerCase().includes('cashmere')) set.add('Wool & Cashmere');
        if (p.fabric.toLowerCase().includes('georgette')) set.add('Georgette');
        if (p.fabric.toLowerCase().includes('denim')) set.add('Denim');
      }
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const wholesalerList = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.wholesalerId, p.wholesalerBusinessName));
    return ['All', ...Array.from(map.values())];
  }, [products]);

  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Public catalog shows approved clothing products only
        if (p.status !== 'APPROVED') return false;

        // Department filter
        if (selectedDepartment !== 'All' && p.department !== selectedDepartment) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Fabric filter
        if (selectedFabric !== 'All') {
          if (!p.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) {
            return false;
          }
        }

        // Size filter
        if (selectedSize !== 'All') {
          const hasSize = p.variants.some((v) => v.size === selectedSize && v.stock > 0);
          if (!hasSize) return false;
        }

        // Wholesaler filter
        if (selectedWholesaler !== 'All' && p.wholesalerBusinessName !== selectedWholesaler) {
          return false;
        }

        // Max price filter
        if (p.retailPrice > maxPrice) {
          return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchFabric = p.fabric.toLowerCase().includes(q);
          const matchHub = p.wholesalerCity.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchCat && !matchFabric && !matchHub) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.retailPrice - b.retailPrice;
        if (sortBy === 'price_desc') return b.retailPrice - a.retailPrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [
    products,
    selectedDepartment,
    selectedCategory,
    selectedFabric,
    selectedSize,
    selectedWholesaler,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedDepartment('All');
    setSelectedCategory('All');
    setSelectedFabric('All');
    setSelectedSize('All');
    setSelectedWholesaler('All');
    setMaxPrice(6000);
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedDepartment !== 'All' ||
    selectedCategory !== 'All' ||
    selectedFabric !== 'All' ||
    selectedSize !== 'All' ||
    selectedWholesaler !== 'All' ||
    maxPrice < 6000 ||
    searchQuery.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Hero Banner with Tagline */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-stone-900 via-stone-900 to-stone-950 text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-stone-800">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INDIA'S PREMIER CLOTHING-ONLY MARKETPLACE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Your Style. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-amber-500">
              Your Choice. Your Look.
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Shop authentic handloom Banarasi silk sarees, Tirupur combed cotton tees, Sanganeri handblock kurtas, and Ludhiana cashmere jackets directly from approved wholesale textile mills in India.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedDepartment('Women')}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Shop Sarees & Kurtis
            </button>
            <button
              onClick={() => setSelectedDepartment('Men')}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-extrabold text-xs rounded-xl border border-stone-700 transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Shop Shirts & Ethnic Wear
            </button>
            <button
              onClick={() => setIsSizeChartOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-stone-200 font-bold text-xs rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              Size Guide
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Department Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Men', 'Women', 'Kids'] as const).map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDepartment === dept
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {dept === 'All' ? 'All Clothing' : `${dept}'s Clothing`}
            </button>
          ))}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 bg-stone-50"
          >
            <option value="All">All Clothing Categories</option>
            {ALLOWED_CLOTHING_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-800 bg-stone-50"
          >
            <option value="featured">Sort: Featured First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Customer Rated</option>
            <option value="newest">Newest Arrivals</option>
          </select>

          {/* More Filters Toggle */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFilterDrawerOpen || hasActiveFilters
                ? 'border-rose-300 bg-rose-50 text-rose-700'
                : 'border-stone-200 hover:bg-stone-100 text-stone-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-rose-600 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isFilterDrawerOpen && (
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 shadow-inner grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs animate-in fade-in duration-150">
          {/* Fabric Filter */}
          <div>
            <label className="font-bold text-stone-900 block mb-2">Garment Fabric:</label>
            <div className="flex flex-wrap gap-1.5">
              {fabricList.map((fab) => (
                <button
                  key={fab}
                  onClick={() => setSelectedFabric(fab)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedFabric === fab
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {fab}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-stone-900">Garment Size:</label>
              <button
                onClick={() => setIsSizeChartOpen(true)}
                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Size Chart
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    selectedSize === s
                      ? 'bg-rose-600 text-white'
                      : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Wholesaler Hub */}
          <div>
            <label className="font-bold text-stone-900 block mb-2">Wholesale Mill / Hub:</label>
            <select
              value={selectedWholesaler}
              onChange={(e) => setSelectedWholesaler(e.target.value)}
              className="w-full p-2 rounded-xl bg-white border border-stone-200 font-medium"
            >
              {wholesalerList.map((ws) => (
                <option key={ws} value={ws}>
                  {ws}
                </option>
              ))}
            </select>
          </div>

          {/* Max Price Slider */}
          <div>
            <div className="flex justify-between font-bold text-stone-900 mb-2">
              <span>Max Price:</span>
              <span className="text-rose-600 font-black">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="500"
              max="6000"
              step="200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>₹500</span>
              <span>₹6,000+</span>
            </div>
          </div>

          {/* Reset button inside drawer */}
          <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2 border-t border-stone-200">
            <button
              onClick={resetFilters}
              className="text-stone-500 hover:text-stone-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Pills Bar */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 font-semibold">Active Filters:</span>
          {selectedDepartment !== 'All' && (
            <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-bold border border-rose-200 flex items-center gap-1">
              {selectedDepartment}'s Clothing
              <button onClick={() => setSelectedDepartment('All')} className="cursor-pointer">×</button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-bold border border-rose-200 flex items-center gap-1">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} className="cursor-pointer">×</button>
            </span>
          )}
          {selectedFabric !== 'All' && (
            <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-bold border border-rose-200 flex items-center gap-1">
              Fabric: {selectedFabric}
              <button onClick={() => setSelectedFabric('All')} className="cursor-pointer">×</button>
            </span>
          )}
          {selectedSize !== 'All' && (
            <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-bold border border-rose-200 flex items-center gap-1">
              Size: {selectedSize}
              <button onClick={() => setSelectedSize('All')} className="cursor-pointer">×</button>
            </span>
          )}
          {selectedWholesaler !== 'All' && (
            <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-bold border border-rose-200 flex items-center gap-1">
              Hub: {selectedWholesaler}
              <button onClick={() => setSelectedWholesaler('All')} className="cursor-pointer">×</button>
            </span>
          )}
          {searchQuery && (
            <span className="bg-stone-100 text-stone-800 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="cursor-pointer">×</button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-stone-400 hover:text-stone-700 underline text-[11px] ml-2 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Catalog Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
        <span>
          Showing <strong className="text-stone-900">{filteredProducts.length}</strong> verified clothing products
        </span>
        <span className="hidden sm:inline text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
          ✓ Verified 100% Clothing Only
        </span>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
          <Search className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-extrabold text-stone-900 text-base">No Matching Clothing Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your department, fabric, or price filters to see more verified apparel.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
