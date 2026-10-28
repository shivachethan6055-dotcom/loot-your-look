import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Building2,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CartItem } from '../types';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQty,
    removeFromCart,
    setIsCheckoutOpen,
    addToast,
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  if (!isCartOpen) return null;

  // Group cart items by Wholesaler for transparent multi-wholesaler fulfillment
  const itemsByWholesaler = cart.reduce((groups, item) => {
    const wsName = item.product.wholesalerBusinessName;
    if (!groups[wsName]) groups[wsName] = [];
    groups[wsName].push(item);
    return groups;
  }, {} as Record<string, CartItem[]>);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.retailPrice * item.quantity,
    0
  );

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.code === 'LOOT100') {
      discount = 100;
    } else if (appliedCoupon.code === 'FASHION20') {
      discount = Math.round(subtotal * 0.2);
    }
  }

  const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 49;
  const tax = Math.round((subtotal - discount) * 0.05); // 5% GST on apparel
  const total = Math.max(0, subtotal - discount + deliveryCharge + tax);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'LOOT100') {
      if (subtotal < 500) {
        addToast('LOOT100 requires minimum order value of ₹500', 'error');
        return;
      }
      setAppliedCoupon({ code: 'LOOT100', discount: 100 });
      addToast('Coupon LOOT100 applied! Saved ₹100', 'success');
      setCouponCode('');
    } else if (clean === 'FASHION20') {
      if (subtotal < 1000) {
        addToast('FASHION20 requires minimum order value of ₹1,000', 'error');
        return;
      }
      setAppliedCoupon({ code: 'FASHION20', discount: Math.round(subtotal * 0.2) });
      addToast('Coupon FASHION20 applied! Saved 20%', 'success');
      setCouponCode('');
    } else {
      addToast('Invalid coupon code. Try LOOT100 or FASHION20', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h2 className="font-extrabold text-stone-900 text-base">
              Clothing Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-100 text-xs text-emerald-800">
          {subtotal >= 999 ? (
            <p className="flex items-center gap-1.5 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              You unlocked FREE Express Delivery on your clothing!
            </p>
          ) : (
            <p className="font-medium">
              Add <strong className="text-emerald-900">₹{(999 - subtotal).toLocaleString('en-IN')}</strong> more for <strong className="text-emerald-900">FREE Delivery</strong>
            </p>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-stone-800 text-base">Your Clothing Bag is Empty</h3>
              <p className="text-xs text-stone-500 max-w-xs">
                Explore handcrafted sarees, kurtas, formal shirts, heavyweight t-shirts and denim direct from India's textile wholesalers.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Browse Clothing Catalog
              </button>
            </div>
          ) : (
            Object.entries(itemsByWholesaler).map(([wholesalerName, items]) => (
              <div key={wholesalerName} className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-2xs">
                {/* Wholesaler Hub Header */}
                <div className="bg-stone-100/70 px-4 py-2 flex items-center justify-between text-xs border-b border-stone-200">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {wholesalerName}
                  </span>
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">
                    Split Dispatch
                  </span>
                </div>

                {/* Items from this wholesaler */}
                <div className="divide-y divide-stone-100 p-3 space-y-3">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="pt-2 first:pt-0 flex gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-16 h-20 rounded-xl object-cover shrink-0 border border-stone-100"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                              {item.product.title}
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.productId, item.variantId)}
                              className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Size: <strong className="text-stone-700">{item.selectedVariant.size}</strong> | Color: {item.selectedVariant.color}
                          </p>
                          <p className="text-[10px] text-stone-400">
                            Fabric: {item.product.fabric}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-stone-900">
                            ₹{(item.product.retailPrice * item.quantity).toLocaleString('en-IN')}
                          </span>

                          {/* Quantity selector */}
                          <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50 text-xs">
                            <button
                              onClick={() => updateCartQty(item.productId, item.variantId, -1)}
                              className="px-2 py-0.5 text-stone-700 font-bold hover:bg-stone-200 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 py-0.5 font-bold text-stone-900 bg-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.productId, item.variantId, 1)}
                              className="px-2 py-0.5 text-stone-700 font-bold hover:bg-stone-200 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Bill Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/80 space-y-3">
            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon: LOOT100 or FASHION20"
                  className="w-full bg-white text-stone-900 text-xs pl-8 pr-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-rose-500 uppercase font-semibold"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex items-center justify-between text-xs bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 font-semibold">
                <span>Applied: {appliedCoupon.code}</span>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-stone-500 hover:text-stone-800 text-[11px] underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Bill Details */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
              <div className="flex justify-between">
                <span>Garment Subtotal</span>
                <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Marketplace Coupon Discount</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Delivery</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Apparel GST (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Payable</span>
                <span className="text-rose-600 text-base">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Multi-Wholesaler Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified Payment & Cash on Delivery Available</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
