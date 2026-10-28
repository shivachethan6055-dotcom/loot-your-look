export type UserRole = 'customer' | 'wholesaler' | 'admin';

export type WholesalerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type PaymentMethod = 'RAZORPAY_ONLINE' | 'CASH_ON_DELIVERY';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

export interface CustomerProfile {
  userId: string;
  addresses: Address[];
  defaultAddressId?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface WholesalerProfile {
  id: string;
  userId: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessAddress: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  status: WholesalerStatus;
  rejectionReason?: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  commissionRate: number; // e.g. 10% marketplace commission
  totalSales: number;
  totalOrders: number;
  createdAt: string;
}

export type ClothingDepartment = 'Men' | 'Women' | 'Kids' | 'Unisex';

export type ClothingCategory =
  | 'Shirts'
  | 'T-Shirts'
  | 'Jeans & Trousers'
  | 'Sarees'
  | 'Kurtas & Kurtis'
  | 'Dresses & Gowns'
  | 'Jackets & Hoodies'
  | 'Ethnic & Festive Wear'
  | 'Kids Clothing'
  | 'Sweaters & Cardigans'
  | 'Shorts & Trackpants';

export interface ProductVariant {
  id: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'Free Size';
  color: string;
  colorHex?: string;
  stock: number;
  sku: string;
}

export interface ClothingProduct {
  id: string;
  wholesalerId: string;
  wholesalerBusinessName: string;
  wholesalerCity: string;
  title: string;
  description: string;
  department: ClothingDepartment;
  category: ClothingCategory;
  fabric: string; // e.g. Pure Cotton, Chanderi Silk, Khadi, Denim, Georgette
  careInstructions?: string;
  brand?: string;
  images: string[];
  retailPrice: number; // In INR ₹
  mrp: number; // In INR ₹
  wholesaleCost: number; // Confidential supplier cost
  variants: ProductVariant[];
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  featured?: boolean;
  trending?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
  product: ClothingProduct;
  selectedVariant: ProductVariant;
}

export interface SellerOrderItem {
  itemId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  variantSize: string;
  variantColor: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  fabric: string;
}

export interface SellerOrder {
  id: string;
  parentOrderId: string;
  wholesalerId: string;
  wholesalerName: string;
  items: SellerOrderItem[];
  subtotal: number;
  commissionAmount: number; // 10% marketplace fee
  wholesalerPayable: number;
  fulfillmentStatus: OrderStatus;
  courierPartner?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  returnReason?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  itemsCount: number;
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  taxAmount: number; // 5% GST on clothing
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentReference?: string;
  orderStatus: OrderStatus;
  sellerOrders: SellerOrder[];
  createdAt: string;
  updatedAt: string;
}

export interface WholesalerSettlement {
  id: string;
  wholesalerId: string;
  wholesalerName: string;
  gstin: string;
  period: string;
  grossSales: number;
  commissionDeducted: number;
  taxDeducted: number;
  netPayout: number;
  status: 'SETTLED' | 'PENDING' | 'ON_HOLD';
  payoutReference?: string;
  settledAt?: string;
}

export interface GoogleSheetsSyncLog {
  sheetId: string;
  sheetUrl: string;
  title: string;
  rowCount: number;
  syncedAt: string;
  exportedBy: string;
  type: 'orders' | 'settlements' | 'inventory';
}
