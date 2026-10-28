import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  ClothingProduct,
  WholesalerProfile,
  Order,
  CartItem,
  WholesalerSettlement,
  ClothingDepartment,
  ProductVariant,
} from '../types';
import {
  getProducts,
  getWholesalers,
  getOrders,
  getSettlements,
  getCart,
  saveCart,
  getWishlist,
  saveWishlist,
  getCurrentUser,
  saveCurrentUser,
  STORAGE_CHANGE_EVENT,
} from '../services/storage';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../services/firebaseAuth';
import { User as FirebaseUser } from 'firebase/auth';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  portal: UserRole;
  setPortal: (role: UserRole) => void;
  currentUser: User;
  setCurrentUser: (u: User) => void;
  products: ClothingProduct[];
  wholesalers: WholesalerProfile[];
  orders: Order[];
  settlements: WholesalerSettlement[];
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: ClothingProduct, variant: ProductVariant, quantity?: number) => void;
  updateCartQty: (productId: string, variantId: string, delta: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  activeWholesalerId: string;
  setActiveWholesalerId: (id: string) => void;
  activeWholesaler: WholesalerProfile | undefined;
  
  // Search & Navigation Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDepartment: ClothingDepartment | 'All';
  setSelectedDepartment: (d: ClothingDepartment | 'All') => void;
  selectedCategory: string | 'All';
  setSelectedCategory: (c: string | 'All') => void;

  // Modals
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  selectedProductDetail: ClothingProduct | null;
  setSelectedProductDetail: (p: ClothingProduct | null) => void;
  isSizeChartOpen: boolean;
  setIsSizeChartOpen: (open: boolean) => void;
  isGoogleSheetsModalOpen: boolean;
  setIsGoogleSheetsModalOpen: (open: boolean) => void;
  activePolicyModal: 'terms' | 'privacy' | 'shipping' | 'return' | 'cancellation' | 'contact' | 'backend-docs' | null;
  setActivePolicyModal: (modal: any) => void;
  lastPlacedOrder: Order | null;
  setLastPlacedOrder: (o: Order | null) => void;

  // Google OAuth for Workspace / Sheets
  googleUser: FirebaseUser | null;
  googleToken: string | null;
  handleGoogleSignIn: () => Promise<void>;
  handleGoogleSignOut: () => Promise<void>;
  isGoogleConnecting: boolean;

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portal, setPortal] = useState<UserRole>('customer');
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser());
  const [products, setProducts] = useState<ClothingProduct[]>(getProducts());
  const [wholesalers, setWholesalers] = useState<WholesalerProfile[]>(getWholesalers());
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [settlements, setSettlements] = useState<WholesalerSettlement[]>(getSettlements());
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const [wishlist, setWishlist] = useState<string[]>(getWishlist());

  // Wholesaler portal active wholesaler selector (defaulting to Surat Heritage)
  const [activeWholesalerId, setActiveWholesalerId] = useState<string>('ws_surat_01');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<ClothingDepartment | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ClothingProduct | null>(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<
    'terms' | 'privacy' | 'shipping' | 'return' | 'cancellation' | 'contact' | 'backend-docs' | null
  >(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Google Workspace / Sheets OAuth
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshData = () => {
    setProducts(getProducts());
    setWholesalers(getWholesalers());
    setOrders(getOrders());
    setSettlements(getSettlements());
    setCart(getCart());
    setWishlist(getWishlist());
    setCurrentUserState(getCurrentUser());
  };

  useEffect(() => {
    const handleStorageChange = () => {
      refreshData();
    };
    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleConnecting(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        addToast(`Connected to Google Sheets as ${res.user.email}`, 'success');
      }
    } catch (err: any) {
      console.error(err);
      addToast(err?.message || 'Google authentication failed', 'error');
    } finally {
      setIsGoogleConnecting(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setGoogleToken(null);
      addToast('Disconnected Google account', 'info');
    } catch (err: any) {
      addToast('Sign out error', 'error');
    }
  };

  const setCurrentUser = (u: User) => {
    setCurrentUserState(u);
    saveCurrentUser(u);
    setPortal(u.role);
    addToast(`Switched active profile to ${u.name} (${u.role.toUpperCase()})`, 'info');
  };

  const addToCart = (product: ClothingProduct, variant: ProductVariant, quantity: number = 1) => {
    if (variant.stock <= 0) {
      addToast(`Sorry, size ${variant.size} in ${variant.color} is currently out of stock.`, 'error');
      return;
    }

    const currentCart = getCart();
    const existingIndex = currentCart.findIndex(
      (item) => item.productId === product.id && item.variantId === variant.id
    );

    let updatedCart: CartItem[];
    if (existingIndex >= 0) {
      const existing = currentCart[existingIndex];
      const newQty = existing.quantity + quantity;
      if (newQty > variant.stock) {
        addToast(`Only ${variant.stock} units available in stock.`, 'error');
        return;
      }
      updatedCart = [...currentCart];
      updatedCart[existingIndex] = { ...existing, quantity: newQty };
    } else {
      updatedCart = [
        ...currentCart,
        {
          productId: product.id,
          variantId: variant.id,
          quantity,
          product,
          selectedVariant: variant,
        },
      ];
    }

    setCart(updatedCart);
    saveCart(updatedCart);
    addToast(`Added "${product.title} (${variant.size})" to cart!`, 'success');
  };

  const updateCartQty = (productId: string, variantId: string, delta: number) => {
    const currentCart = getCart();
    const itemIndex = currentCart.findIndex(
      (item) => item.productId === productId && item.variantId === variantId
    );
    if (itemIndex < 0) return;

    const item = currentCart[itemIndex];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }

    if (newQty > item.selectedVariant.stock) {
      addToast(`Max available stock is ${item.selectedVariant.stock} units.`, 'error');
      return;
    }

    const updated = [...currentCart];
    updated[itemIndex] = { ...item, quantity: newQty };
    setCart(updated);
    saveCart(updated);
  };

  const removeFromCart = (productId: string, variantId: string) => {
    const updated = getCart().filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    setCart(updated);
    saveCart(updated);
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    saveCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const currentWishlist = getWishlist();
    let updated: string[];
    if (currentWishlist.includes(productId)) {
      updated = currentWishlist.filter((id) => id !== productId);
      addToast('Removed garment from wishlist', 'info');
    } else {
      updated = [...currentWishlist, productId];
      addToast('Saved garment to wishlist!', 'success');
    }
    setWishlist(updated);
    saveWishlist(updated);
  };

  const activeWholesaler = wholesalers.find((w) => w.id === activeWholesalerId);

  return (
    <AppContext.Provider
      value={{
        portal,
        setPortal,
        currentUser,
        setCurrentUser,
        products,
        wholesalers,
        orders,
        settlements,
        cart,
        wishlist,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        toggleWishlist,
        activeWholesalerId,
        setActiveWholesalerId,
        activeWholesaler,
        searchQuery,
        setSearchQuery,
        selectedDepartment,
        setSelectedDepartment,
        selectedCategory,
        setSelectedCategory,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        selectedProductDetail,
        setSelectedProductDetail,
        isSizeChartOpen,
        setIsSizeChartOpen,
        isGoogleSheetsModalOpen,
        setIsGoogleSheetsModalOpen,
        activePolicyModal,
        setActivePolicyModal,
        lastPlacedOrder,
        setLastPlacedOrder,
        googleUser,
        googleToken,
        handleGoogleSignIn,
        handleGoogleSignOut,
        isGoogleConnecting,
        toasts,
        addToast,
        removeToast,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
