import React from 'react';
import { Heart, ShoppingBag, Eye, Star, MapPin } from 'lucide-react';
import { ClothingProduct } from '../types';
import { useApp } from '../context/AppContext';

interface ProductCardProps {
  product: ClothingProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, toggleWishlist, setSelectedProductDetail, addToCart, setIsCartOpen } = useApp();

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = Math.round(((product.mrp - product.retailPrice) / product.mrp) * 100);
  const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const isOutOfStock = totalStock <= 0;

  // Default first available variant for quick add
  const firstAvailableVariant = product.variants.find((v) => v.stock > 0) || product.variants[0];

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-3/4 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => setSelectedProductDetail(product)}>
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.featured && (
            <span className="bg-stone-900/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider">
              Featured
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 shadow-md scale-110'
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-rose-600 shadow-xs'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Out of stock banner */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-stone-900 font-extrabold text-xs px-3 py-1.5 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View Hover Pill */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProductDetail(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-stone-900 font-bold text-xs py-2 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Wholesaler location badge */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
            <span className="flex items-center gap-1 font-semibold text-stone-600 truncate">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              {product.wholesalerCity} Hub
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => setSelectedProductDetail(product)}
            className="font-bold text-stone-900 text-sm line-clamp-2 hover:text-rose-600 transition-colors cursor-pointer mb-1.5"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Fabric */}
          <p className="text-[11px] font-medium text-stone-500 mb-2 truncate">
            Fabric: <span className="text-stone-700 font-semibold">{product.fabric}</span>
          </p>

          {/* Sizes available preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.variants.map((v) => (
              <span
                key={v.id}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                  v.stock > 0
                    ? 'border-stone-200 text-stone-700 bg-stone-50'
                    : 'border-stone-100 text-stone-300 line-through'
                }`}
              >
                {v.size}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-stone-900">
                ₹{product.retailPrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.retailPrice && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">
              Direct Wholesale Price
            </span>
          </div>

          <button
            onClick={() => {
              if (product.variants.length > 1) {
                // If multiple variants, open detail modal for size picking
                setSelectedProductDetail(product);
              } else {
                addToCart(product, firstAvailableVariant, 1);
                setIsCartOpen(true);
              }
            }}
            disabled={isOutOfStock}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.variants.length > 1 ? 'Select Size' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
