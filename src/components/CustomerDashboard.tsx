import React, { useState } from 'react';
import {
  Package,
  Heart,
  MapPin,
  Clock,
  RotateCcw,
  Ban,
  Truck,
  Building2,
  ExternalLink,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { requestOrderCancellation, requestOrderReturn } from '../services/storage';

export const CustomerDashboard: React.FC = () => {
  const {
    orders,
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    setIsCartOpen,
    setSelectedProductDetail,
    currentUser,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');
  const [returnModalOrder, setReturnModalOrder] = useState<{
    orderId: string;
    wholesalerId: string;
    wholesalerName: string;
  } | null>(null);
  const [returnReason, setReturnReason] = useState('Size fit issue (need smaller/larger size)');

  // Filter orders for the logged-in customer
  const myOrders = orders.filter(
    (o) => o.customerId === currentUser.id || o.customerEmail === currentUser.email
  );

  // Wishlisted products
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    if (window.confirm(`Are you sure you want to cancel order ${orderNumber}? Inventory will be released back to the wholesaler.`)) {
      const ok = requestOrderCancellation(orderId, 'Customer cancelled before dispatch');
      if (ok) {
        addToast(`Order ${orderNumber} has been cancelled.`, 'info');
      } else {
        addToast('Cannot cancel order. It has already been shipped.', 'error');
      }
    }
  };

  const handleConfirmReturn = () => {
    if (!returnModalOrder) return;
    const ok = requestOrderReturn(returnModalOrder.orderId, returnModalOrder.wholesalerId, returnReason);
    if (ok) {
      addToast(`Return requested for package from ${returnModalOrder.wholesalerName}. Pickup will be scheduled.`, 'success');
      setReturnModalOrder(null);
    } else {
      addToast('Unable to request return. Package must be delivered first.', 'error');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="bg-blue-100 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Truck className="w-3 h-3" /> In Transit
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="bg-amber-100 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> Packing by Wholesaler
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-rose-100 text-rose-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'RETURN_REQUESTED':
        return (
          <span className="bg-orange-100 text-orange-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Return Requested
          </span>
        );
      default:
        return (
          <span className="bg-stone-100 text-stone-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Customer Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-md">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {currentUser.email} • {currentUser.phone || '+91 98450 91823'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-stone-100 p-1 rounded-2xl text-xs font-bold text-stone-600">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4 text-rose-600" />
            My Orders ({myOrders.length})
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wishlist' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-600" />
            Wishlist ({wishlist.length})
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            <MapPin className="w-4 h-4 text-stone-600" />
            Addresses
          </button>
        </div>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-stone-900 text-lg">Order History & Split Dispatches</h2>
            <span className="text-xs text-stone-500">
              Orders from multiple wholesalers are tracked independently
            </span>
          </div>

          {myOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">No Clothing Orders Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore our catalog for sarees, kurtas, denim, t-shirts and ethnic wear direct from verified wholesalers.
              </p>
            </div>
          ) : (
            myOrders.map((order) => {
              const canCancel =
                order.orderStatus !== 'SHIPPED' &&
                order.orderStatus !== 'DELIVERED' &&
                order.orderStatus !== 'CANCELLED';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs"
                >
                  {/* Order Top Bar */}
                  <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase">
                          Order Number
                        </span>
                        <span className="font-mono font-extrabold text-stone-900 text-sm">
                          {order.orderNumber}
                        </span>
                      </div>
                      <span className="text-stone-300 hidden sm:inline">|</span>
                      <div>
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase">
                          Date Placed
                        </span>
                        <span className="font-bold text-stone-700">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="text-stone-300 hidden sm:inline">|</span>
                      <div>
                        <span className="text-stone-400 font-semibold block text-[10px] uppercase">
                          Total Amount
                        </span>
                        <span className="font-extrabold text-stone-900">
                          ₹{order.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.orderStatus)}
                      {canCancel && (
                        <button
                          onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                          className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-700 font-bold border border-rose-200 rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Multi-Wholesaler Packages Breakdown */}
                  <div className="p-5 sm:p-6 space-y-6">
                    {order.sellerOrders.map((so) => (
                      <div
                        key={so.id}
                        className="rounded-2xl border border-stone-200/90 p-4 bg-stone-50/40 space-y-4"
                      >
                        {/* Wholesaler Package Status Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-amber-600" />
                            <div>
                              <p className="font-bold text-stone-900 text-xs">
                                Dispatched by: {so.wholesalerName}
                              </p>
                              <p className="text-[10px] text-stone-500">
                                Package subtotal: ₹{so.subtotal.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            {so.courierPartner && (
                              <span className="text-stone-600 font-medium flex items-center gap-1 text-[11px]">
                                <Truck className="w-3.5 h-3.5 text-blue-600" />
                                {so.courierPartner} (AWB: <span className="font-mono font-bold text-stone-900">{so.trackingNumber}</span>)
                              </span>
                            )}
                            {getStatusBadge(so.fulfillmentStatus)}

                            {/* Return Button if Delivered */}
                            {so.fulfillmentStatus === 'DELIVERED' && (
                              <button
                                onClick={() =>
                                  setReturnModalOrder({
                                    orderId: order.id,
                                    wholesalerId: so.wholesalerId,
                                    wholesalerName: so.wholesalerName,
                                  })
                                }
                                className="px-2.5 py-1 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg cursor-pointer"
                              >
                                Request Return / Size Exchange
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Garment Items in this package */}
                        <div className="space-y-3">
                          {so.items.map((item) => (
                            <div key={item.itemId} className="flex items-center gap-4">
                              <img
                                src={item.productImage}
                                alt={item.productTitle}
                                className="w-16 h-20 rounded-xl object-cover border border-stone-200"
                              />
                              <div className="flex-1">
                                <h4 className="font-bold text-stone-900 text-sm">
                                  {item.productTitle}
                                </h4>
                                <div className="flex flex-wrap gap-3 text-xs text-stone-500 mt-1">
                                  <span>
                                    Size: <strong className="text-stone-800">{item.variantSize}</strong>
                                  </span>
                                  <span>
                                    Color: <strong className="text-stone-800">{item.variantColor}</strong>
                                  </span>
                                  <span>
                                    Fabric: <strong className="text-stone-800">{item.fabric}</strong>
                                  </span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-stone-900 text-sm">
                                  ₹{item.totalPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Delivery Address footer */}
                    <div className="pt-2 text-xs text-stone-500 flex items-center justify-between border-t border-stone-100">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        Shipping to: {order.shippingAddress.fullName}, {order.shippingAddress.streetAddress}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-400">
                        Paid via {order.paymentMethod === 'RAZORPAY_ONLINE' ? 'Razorpay Online' : 'Cash on Delivery'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <h2 className="font-extrabold text-stone-900 text-lg">My Saved Garments ({wishlist.length})</h2>

          {wishlistedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
              <Heart className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">Your Wishlist is Empty</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Tap the heart on any apparel item to save it for later review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div
                    className="aspect-3/4 relative cursor-pointer"
                    onClick={() => setSelectedProductDetail(product)}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full text-rose-600 shadow-md"
                    >
                      <Heart className="w-4 h-4 fill-rose-600" />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm line-clamp-1">
                        {product.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Fabric: {product.fabric}
                      </p>
                      <p className="text-sm font-black text-stone-900 mt-2">
                        ₹{product.retailPrice.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedProductDetail(product)}
                      className="mt-3 w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Select Size & Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Address Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
          <h2 className="font-extrabold text-stone-900 text-lg">Default Delivery Address</h2>
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 max-w-md space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-900 text-sm">{currentUser.name}</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                Primary
              </span>
            </div>
            <p className="text-stone-600">
              Flat 402, Green Glen Layout, Outer Ring Road
            </p>
            <p className="text-stone-600">
              Near EcoSpace Tech Park, Bellandur, Bengaluru, Karnataka - 560103
            </p>
            <p className="text-stone-700 font-semibold pt-1">
              Phone: {currentUser.phone || '+91 98450 91823'}
            </p>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-stone-900 text-base">Request Clothing Return</h3>
            </div>
            <p className="text-xs text-stone-500">
              Returning items from <strong>{returnModalOrder.wholesalerName}</strong> under our 10-day clothing exchange policy.
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-stone-700 block">Reason for return:</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs bg-white font-medium"
              >
                <option value="Size fit issue (need smaller/larger size)">Size fit issue (need smaller/larger size)</option>
                <option value="Fabric quality differs from description">Fabric quality differs from description</option>
                <option value="Defective stitching or missing button">Defective stitching or missing button</option>
                <option value="Wrong color or pattern received">Wrong color or pattern received</option>
              </select>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
              Pickup will be arranged at your address by the wholesaler's courier partner. Refunds are processed to the original payment mode within 48 hours of inspection.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReturnModalOrder(null)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                Submit Return Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
