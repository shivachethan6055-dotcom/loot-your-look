import React, { useState } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Zap,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  MapPin,
  Check,
} from 'lucide-react';
import { ClothingProduct, ProductVariant } from '../types';
import { useApp } from '../context/AppContext';

interface ProductDetailModalProps {
  product: ClothingProduct | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { wishlist, toggleWishlist, addToCart, setIsCartOpen, setIsCheckoutOpen, setIsSizeChartOpen } = useApp();

  if (!product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants.find((v) => v.stock > 0) || product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);

  const isWishlisted = wishlist.includes(product.id);
  const discountPercent = Math.round(((product.mrp - product.retailPrice) / product.mrp) * 100);
  const isSelectedOutOfStock = selectedVariant.stock <= 0;

  const handleAddToCart = () => {
    if (isSelectedOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (isSelectedOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    onClose();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="p-6 bg-stone-50 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden shadow-inner bg-white mb-4">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover object-center"
              />
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-2 justify-center w-full">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-rose-600 shadow-md scale-105'
                        : 'border-stone-200 hover:border-stone-400 opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Verified Wholesaler Card */}
            <div className="w-full mt-4 p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Indian Wholesaler
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Approved
                </span>
              </div>
              <p className="text-stone-700 font-semibold">{product.wholesalerBusinessName}</p>
              <p className="text-stone-500 flex items-center gap-1 mt-0.5 text-[11px]">
                <MapPin className="w-3 h-3 text-rose-500" />
                {product.wholesalerCity} Textile Hub
              </p>
            </div>
          </div>

          {/* Right Column: Garment Specs & Purchase Options */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-600 tracking-wider uppercase bg-rose-50 px-2 py-0.5 rounded-md">
                  {product.department}'s {product.category}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-stone-400 font-normal">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight mb-2">
                {product.title}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-black text-stone-900">
                  ₹{product.retailPrice.toLocaleString('en-IN')}
                </span>
                {product.mrp > product.retailPrice && (
                  <span className="text-sm sm:text-base text-stone-400 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  Save ₹{(product.mrp - product.retailPrice).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Fabric Specs */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mb-5 text-xs space-y-1">
                <p>
                  <strong className="text-stone-900">Garment Fabric:</strong>{' '}
                  <span className="text-stone-700 font-medium">{product.fabric}</span>
                </p>
                {product.careInstructions && (
                  <p>
                    <strong className="text-stone-900">Wash & Care:</strong>{' '}
                    <span className="text-stone-600">{product.careInstructions}</span>
                  </p>
                )}
              </div>

              {/* Size Selector with Size Chart trigger */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Select Size
                  </label>
                  <button
                    onClick={() => setIsSizeChartOpen(true)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Size Guide (Inches / CM)
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    const outOfStock = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        disabled={outOfStock}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col items-center ${
                          isSelected
                            ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-xs ring-2 ring-rose-500/30'
                            : outOfStock
                            ? 'border-stone-100 bg-stone-50 text-stone-300 line-through cursor-not-allowed'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                        }`}
                      >
                        <span>{v.size}</span>
                        <span className="text-[9px] font-normal text-stone-500">
                          {outOfStock ? 'Sold out' : `${v.stock} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color details */}
              <div className="mb-5">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-1.5">
                  Garment Color / Shade
                </label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-stone-300 shadow-2xs"
                    style={{ backgroundColor: selectedVariant.colorHex || '#475569' }}
                  />
                  <span className="text-xs font-semibold text-stone-700">
                    {selectedVariant.color}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    (SKU: {selectedVariant.sku})
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Quantity:
                </label>
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-stone-700 font-bold hover:bg-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-stone-900 min-w-8 text-center bg-white">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= selectedVariant.stock}
                    onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                    className="px-3 py-1 text-stone-700 font-bold hover:bg-stone-200 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-500">
                  ({selectedVariant.stock} units available)
                </span>
              </div>
            </div>

            {/* CTAs & Trust Badges */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isSelectedOutOfStock}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelectedOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-stone-800 text-white shadow-md'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isSelectedOutOfStock ? 'Variant Sold Out' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isSelectedOutOfStock}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelectedOutOfStock
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-md'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Buy Now
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isWishlisted
                      ? 'border-rose-300 bg-rose-50 text-rose-600'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                  title={isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-600 pt-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Free shipping on orders above ₹999</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>10-Day Easy Clothing Return & Refund</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
