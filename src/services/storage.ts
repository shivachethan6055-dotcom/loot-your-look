import {
  ClothingProduct,
  WholesalerProfile,
  Order,
  CartItem,
  User,
  WholesalerSettlement,
  GoogleSheetsSyncLog,
  OrderStatus,
} from '../types';
import {
  INITIAL_CLOTHING_PRODUCTS,
  INITIAL_WHOLESALERS,
  INITIAL_ORDERS,
  INITIAL_SETTLEMENTS,
} from './mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'lyl_products_v1',
  WHOLESALERS: 'lyl_wholesalers_v1',
  ORDERS: 'lyl_orders_v1',
  SETTLEMENTS: 'lyl_settlements_v1',
  CART: 'lyl_cart_v1',
  WISHLIST: 'lyl_wishlist_v1',
  CURRENT_USER: 'lyl_current_user_v1',
  SHEETS_LOGS: 'lyl_sheets_logs_v1',
};

// Event for real-time reactivity
export const STORAGE_CHANGE_EVENT = 'lyl_storage_changed';

function notifyStorageChange(detailKey: string) {
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key: detailKey } }));
}

// Default current user
const DEFAULT_CUSTOMER: User = {
  id: 'u_cust_demo',
  name: 'Shiva Chethan',
  email: 'shivachethan6055@gmail.com',
  phone: '+91 98450 91823',
  role: 'customer',
  createdAt: '2026-10-01T10:00:00Z',
};

// Initialize LocalStorage with default seeds if empty
export function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_CLOTHING_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WHOLESALERS)) {
    localStorage.setItem(STORAGE_KEYS.WHOLESALERS, JSON.stringify(INITIAL_WHOLESALERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTLEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(INITIAL_SETTLEMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_CUSTOMER));
  }
}

// ---------------- PRODUCTS ----------------
export function getProducts(): ClothingProduct[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_CLOTHING_PRODUCTS;
  } catch (e) {
    return INITIAL_CLOTHING_PRODUCTS;
  }
}

export function saveProduct(product: ClothingProduct): void {
  const products = getProducts();
  const existingIdx = products.findIndex((p) => p.id === product.id);
  if (existingIdx >= 0) {
    products[existingIdx] = product;
  } else {
    products.unshift(product);
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  notifyStorageChange(STORAGE_KEYS.PRODUCTS);
}

export function updateProductStatus(
  productId: string,
  status: 'APPROVED' | 'REJECTED',
  rejectionReason?: string
): void {
  const products = getProducts();
  const prod = products.find((p) => p.id === productId);
  if (prod) {
    prod.status = status;
    if (rejectionReason) prod.rejectionReason = rejectionReason;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    notifyStorageChange(STORAGE_KEYS.PRODUCTS);
  }
}

// ---------------- WHOLESALERS ----------------
export function getWholesalers(): WholesalerProfile[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WHOLESALERS);
    return raw ? JSON.parse(raw) : INITIAL_WHOLESALERS;
  } catch (e) {
    return INITIAL_WHOLESALERS;
  }
}

export function saveWholesaler(wholesaler: WholesalerProfile): void {
  const wholesalers = getWholesalers();
  const existingIdx = wholesalers.findIndex((w) => w.id === wholesaler.id);
  if (existingIdx >= 0) {
    wholesalers[existingIdx] = wholesaler;
  } else {
    wholesalers.unshift(wholesaler);
  }
  localStorage.setItem(STORAGE_KEYS.WHOLESALERS, JSON.stringify(wholesalers));
  notifyStorageChange(STORAGE_KEYS.WHOLESALERS);
}

export function updateWholesalerStatus(
  wholesalerId: string,
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  rejectionReason?: string
): void {
  const wholesalers = getWholesalers();
  const target = wholesalers.find((w) => w.id === wholesalerId);
  if (target) {
    target.status = status;
    if (rejectionReason) target.rejectionReason = rejectionReason;
    localStorage.setItem(STORAGE_KEYS.WHOLESALERS, JSON.stringify(wholesalers));
    notifyStorageChange(STORAGE_KEYS.WHOLESALERS);
  }
}

// ---------------- ORDERS ----------------
export function getOrders(): Order[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  } catch (e) {
    return INITIAL_ORDERS;
  }
}

export function createOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

  // Deduct inventory for ordered clothing variants
  const products = getProducts();
  for (const sellerOrder of order.sellerOrders) {
    for (const item of sellerOrder.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(
          (v) => v.size === item.variantSize && v.color === item.variantColor
        );
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
        }
      }
    }
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

  notifyStorageChange(STORAGE_KEYS.ORDERS);
  notifyStorageChange(STORAGE_KEYS.PRODUCTS);
}

export function updateSellerOrderStatus(
  parentOrderId: string,
  wholesalerId: string,
  fulfillmentStatus: OrderStatus,
  courierPartner?: string,
  trackingNumber?: string
): void {
  const orders = getOrders();
  const parent = orders.find((o) => o.id === parentOrderId);
  if (!parent) return;

  const sellerOrder = parent.sellerOrders.find((so) => so.wholesalerId === wholesalerId);
  if (sellerOrder) {
    sellerOrder.fulfillmentStatus = fulfillmentStatus;
    if (courierPartner) sellerOrder.courierPartner = courierPartner;
    if (trackingNumber) sellerOrder.trackingNumber = trackingNumber;
    if (fulfillmentStatus === 'SHIPPED') {
      sellerOrder.shippedAt = new Date().toISOString();
    } else if (fulfillmentStatus === 'DELIVERED') {
      sellerOrder.deliveredAt = new Date().toISOString();
    }
  }

  // Update parent order status based on sub-orders
  const allDelivered = parent.sellerOrders.every((so) => so.fulfillmentStatus === 'DELIVERED');
  const anyShipped = parent.sellerOrders.some((so) => so.fulfillmentStatus === 'SHIPPED' || so.fulfillmentStatus === 'DELIVERED');
  const allCancelled = parent.sellerOrders.every((so) => so.fulfillmentStatus === 'CANCELLED');

  if (allDelivered) {
    parent.orderStatus = 'DELIVERED';
  } else if (anyShipped) {
    parent.orderStatus = 'SHIPPED';
  } else if (allCancelled) {
    parent.orderStatus = 'CANCELLED';
  } else {
    parent.orderStatus = fulfillmentStatus;
  }

  parent.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  notifyStorageChange(STORAGE_KEYS.ORDERS);
}

export function requestOrderCancellation(orderId: string, reason: string): boolean {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return false;

  // Can only cancel if not yet SHIPPED
  if (order.orderStatus === 'SHIPPED' || order.orderStatus === 'DELIVERED') {
    return false;
  }

  order.orderStatus = 'CANCELLED';
  for (const so of order.sellerOrders) {
    so.fulfillmentStatus = 'CANCELLED';
  }
  order.updatedAt = new Date().toISOString();

  // Restore inventory
  const products = getProducts();
  for (const so of order.sellerOrders) {
    for (const item of so.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const variant = prod.variants.find(
          (v) => v.size === item.variantSize && v.color === item.variantColor
        );
        if (variant) {
          variant.stock += item.quantity;
        }
      }
    }
  }
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  notifyStorageChange(STORAGE_KEYS.ORDERS);
  notifyStorageChange(STORAGE_KEYS.PRODUCTS);
  return true;
}

export function requestOrderReturn(orderId: string, wholesalerId: string, returnReason: string): boolean {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return false;

  const so = order.sellerOrders.find((s) => s.wholesalerId === wholesalerId);
  if (so && so.fulfillmentStatus === 'DELIVERED') {
    so.fulfillmentStatus = 'RETURN_REQUESTED';
    so.returnReason = returnReason;
    order.orderStatus = 'RETURN_REQUESTED';
    order.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyStorageChange(STORAGE_KEYS.ORDERS);
    return true;
  }
  return false;
}

// ---------------- SETTLEMENTS ----------------
export function getSettlements(): WholesalerSettlement[] {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    return raw ? JSON.parse(raw) : INITIAL_SETTLEMENTS;
  } catch (e) {
    return INITIAL_SETTLEMENTS;
  }
}

export function updateSettlementStatus(settlementId: string, status: 'SETTLED' | 'PENDING' | 'ON_HOLD', reference?: string) {
  const list = getSettlements();
  const target = list.find((s) => s.id === settlementId);
  if (target) {
    target.status = status;
    if (reference) target.payoutReference = reference;
    if (status === 'SETTLED') target.settledAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(list));
    notifyStorageChange(STORAGE_KEYS.SETTLEMENTS);
  }
}

// ---------------- CART & WISHLIST ----------------
export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
  notifyStorageChange(STORAGE_KEYS.CART);
}

export function getWishlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveWishlist(ids: string[]): void {
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(ids));
  notifyStorageChange(STORAGE_KEYS.WISHLIST);
}

// ---------------- USER ----------------
export function getCurrentUser(): User {
  initStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : DEFAULT_CUSTOMER;
  } catch (e) {
    return DEFAULT_CUSTOMER;
  }
}

export function saveCurrentUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  notifyStorageChange(STORAGE_KEYS.CURRENT_USER);
}

// ---------------- GOOGLE SHEETS LOGS ----------------
export function getGoogleSheetsLogs(): GoogleSheetsSyncLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_LOGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addGoogleSheetsLog(log: GoogleSheetsSyncLog): void {
  const logs = getGoogleSheetsLogs();
  logs.unshift(log);
  localStorage.setItem(STORAGE_KEYS.SHEETS_LOGS, JSON.stringify(logs));
  notifyStorageChange(STORAGE_KEYS.SHEETS_LOGS);
}
