import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Banknote,
  MapPin,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Address,
  Order,
  PaymentMethod,
  SellerOrder,
  SellerOrderItem,
} from '../types';
import { createOrder } from '../services/storage';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi NCR', 'Jammu & Kashmir', 'Chandigarh'
];

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    clearCart,
    currentUser,
    setLastPlacedOrder,
    addToast,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY_ONLINE');
  const [onlineTab, setOnlineTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  // Address Form State
  const [address, setAddress] = useState<Address>({
    id: 'addr_new_' + Date.now(),
    fullName: currentUser.name || 'Shiva Chethan',
    phone: currentUser.phone || '+91 98450 91823',
    streetAddress: 'Flat 402, Green Glen Layout, Outer Ring Road',
    landmark: 'Near EcoSpace Tech Park, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
  });

  // Test card state
  const [testUpiId, setTestUpiId] = useState('shiva@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('918');

  if (!isCheckoutOpen) return null;

  // Server-side price recalculation
  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.retailPrice * item.quantity,
    0
  );
  const discountAmount = subtotal >= 1000 ? 100 : 0;
  const deliveryCharge = subtotal >= 999 ? 0 : 49;
  const taxAmount = Math.round((subtotal - discountAmount) * 0.05); // 5% GST on clothing
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge + taxAmount);

  // Group cart items by Wholesaler for multi-seller fulfillment
  const wholesalerGroups = cart.reduce((acc, item) => {
    const wsId = item.product.wholesalerId;
    if (!acc[wsId]) {
      acc[wsId] = {
        wholesalerId: wsId,
        wholesalerName: item.product.wholesalerBusinessName,
        items: [],
        subtotal: 0,
      };
    }
    acc[wsId].items.push(item);
    acc[wsId].subtotal += item.product.retailPrice * item.quantity;
    return acc;
  }, {} as Record<string, { wholesalerId: string; wholesalerName: string; items: typeof cart; subtotal: number }>);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.fullName || !address.phone || !address.streetAddress || !address.city || !address.pincode) {
      addToast('Please complete all shipping address fields', 'error');
      return;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      addToast('Please enter a valid 6-digit Indian PIN Code', 'error');
      return;
    }

    // Verify stock availability on the server/store
    for (const item of cart) {
      if (item.selectedVariant.stock < item.quantity) {
        addToast(
          `Insufficient stock for "${item.product.title}" (${item.selectedVariant.size}). Only ${item.selectedVariant.stock} left.`,
          'error'
        );
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simulate Razorpay signature verification & backend transaction processing
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const orderNumber = 'LYL-2026-' + Math.floor(100000 + Math.random() * 900000);
      const paymentRef =
        paymentMethod === 'RAZORPAY_ONLINE'
          ? 'pay_rzp_' + Math.random().toString(36).substring(2, 12).toUpperCase()
          : undefined;

      // Construct individual SellerOrders for each wholesaler
      const sellerOrders: SellerOrder[] = Object.values(wholesalerGroups).map((group, idx) => {
        const commissionAmount = Math.round(group.subtotal * 0.1); // 10% platform fee
        const wholesalerPayable = group.subtotal - commissionAmount;

        const sellerItems: SellerOrderItem[] = group.items.map((item) => ({
          itemId: 'itm_' + Math.random().toString(36).substring(2, 9),
          productId: item.productId,
          productTitle: item.product.title,
          productImage: item.product.images[0],
          variantSize: item.selectedVariant.size,
          variantColor: item.selectedVariant.color,
          sku: item.selectedVariant.sku,
          quantity: item.quantity,
          unitPrice: item.product.retailPrice,
          totalPrice: item.product.retailPrice * item.quantity,
          fabric: item.product.fabric,
        }));

        return {
          id: `so_${orderNumber}_${idx + 1}`,
          parentOrderId: orderNumber,
          wholesalerId: group.wholesalerId,
          wholesalerName: group.wholesalerName,
          items: sellerItems,
          subtotal: group.subtotal,
          commissionAmount,
          wholesalerPayable,
          fulfillmentStatus: 'CONFIRMED',
        };
      });

      const newOrder: Order = {
        id: 'ord_' + Date.now(),
        orderNumber,
        customerId: currentUser.id,
        customerName: address.fullName,
        customerEmail: currentUser.email,
        customerPhone: address.phone,
        shippingAddress: { ...address },
        itemsCount: cart.reduce((a, b) => a + b.quantity, 0),
        subtotal,
        discountAmount,
        deliveryCharge,
        taxAmount,
        totalAmount,
        paymentMethod,
        paymentStatus: paymentMethod === 'RAZORPAY_ONLINE' ? 'PAID' : 'PENDING',
        paymentReference: paymentRef,
        orderStatus: 'CONFIRMED',
        sellerOrders,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Persist order in store & deduct inventory
      createOrder(newOrder);

      clearCart();
      setIsCheckoutOpen(false);
      setLastPlacedOrder(newOrder);
      addToast(`Order ${orderNumber} placed successfully!`, 'success');
    } catch (err) {
      addToast('Order placement failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="font-extrabold text-stone-900 text-lg">
                Secure Multi-Wholesaler Checkout
              </h2>
              <p className="text-xs text-stone-500">
                Encrypted 256-Bit SSL • India Standard Delivery
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Indian Shipping Address */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-rose-600" />
              1. Delivery Address (India)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  placeholder="Receiver's Name"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Mobile Number (for delivery updates) *
                </label>
                <input
                  type="tel"
                  required
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+91 98450 12345"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-stone-700 block mb-1">
                  Flat, House No., Building, Street *
                </label>
                <input
                  type="text"
                  required
                  value={address.streetAddress}
                  onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                  placeholder="e.g. Flat 402, Green Glen Layout, Outer Ring Road"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={address.landmark || ''}
                  onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                  placeholder="Near EcoSpace Tech Park"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">
                  PIN Code (6 Digits) *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  placeholder="560103"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Bengaluru / Mumbai / Delhi"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">State *</label>
                <select
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:border-rose-500 font-medium bg-white"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Split Wholesaler Fulfillment Breakdown */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <h4 className="font-bold text-stone-900 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-600" />
                Multi-Wholesaler Dispatch Packages ({Object.keys(wholesalerGroups).length})
              </span>
              <span className="text-[11px] text-stone-500 font-normal">
                Direct from verified textile hubs
              </span>
            </h4>

            <div className="space-y-2">
              {Object.values(wholesalerGroups).map((g) => (
                <div key={g.wholesalerId} className="bg-white p-3 rounded-xl border border-stone-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-800">{g.wholesalerName}</span>
                    <p className="text-stone-500 text-[11px]">
                      {g.items.map((i) => `${i.product.title} (${i.selectedVariant.size} x ${i.quantity})`).join(', ')}
                    </p>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">
                    ₹{g.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Payment Method */}
          <div>
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              2. Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Razorpay Online */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY_ONLINE')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'RAZORPAY_ONLINE'
                    ? 'border-rose-600 bg-rose-50/40 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl mt-0.5">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-xs">
                      Razorpay Gateway
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards & Netbanking.
                  </p>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-amber-600 bg-amber-50/40 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl mt-0.5">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-stone-900 text-xs">
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Pay in cash upon doorstep delivery by courier agent.
                  </p>
                </div>
              </div>
            </div>

            {/* Razorpay Test Simulator Details */}
            {paymentMethod === 'RAZORPAY_ONLINE' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold text-stone-700">
                  <button
                    type="button"
                    onClick={() => setOnlineTab('upi')}
                    className={`px-3 py-1 rounded-lg cursor-pointer ${
                      onlineTab === 'upi' ? 'bg-white text-rose-600 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    UPI / QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineTab('card')}
                    className={`px-3 py-1 rounded-lg cursor-pointer ${
                      onlineTab === 'card' ? 'bg-white text-rose-600 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlineTab('netbanking')}
                    className={`px-3 py-1 rounded-lg cursor-pointer ${
                      onlineTab === 'netbanking' ? 'bg-white text-rose-600 shadow-xs' : 'text-stone-500'
                    }`}
                  >
                    NetBanking
                  </button>
                </div>

                {onlineTab === 'upi' && (
                  <div className="space-y-2 text-xs">
                    <label className="font-semibold text-stone-700 block">
                      Enter UPI ID (Google Pay / PhonePe / BHIM)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={testUpiId}
                        onChange={(e) => setTestUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 p-2 bg-white rounded-xl border border-stone-200 font-mono text-xs"
                      />
                      <span className="px-3 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                  </div>
                )}

                {onlineTab === 'card' && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <label className="font-semibold text-stone-700 block mb-1">
                        Card Number (Test Simulation)
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full p-2 bg-white rounded-xl border border-stone-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full p-2 bg-white rounded-xl border border-stone-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-2 bg-white rounded-xl border border-stone-200 font-mono"
                      />
                    </div>
                  </div>
                )}

                {onlineTab === 'netbanking' && (
                  <div className="text-xs text-stone-600">
                    <p className="mb-2 font-semibold">Select Indian Bank for Instant Debit:</p>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
                      <span className="p-2 bg-white rounded-lg border border-stone-200 text-center text-stone-800">
                        HDFC Bank
                      </span>
                      <span className="p-2 bg-white rounded-lg border border-stone-200 text-center text-stone-800">
                        ICICI Bank
                      </span>
                      <span className="p-2 bg-white rounded-lg border border-stone-200 text-center text-stone-800">
                        State Bank of India
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Final Summary & Authorization */}
          <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-stone-300">
              <span>Garments Total ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Applied Discount</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-300">
              <span>Shipping & Logistics</span>
              <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>GST on Clothing (5%)</span>
              <span>₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold pt-2 border-t border-stone-800 text-white">
              <span>Total Payable</span>
              <span className="text-rose-400 text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying Payment & Allocating Inventory...
              </span>
            ) : (
              <span>
                Confirm Order & Pay ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
