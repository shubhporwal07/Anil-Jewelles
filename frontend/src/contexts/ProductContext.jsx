import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { get, onValue, push, ref as rtdbRef, remove, set, update } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

// Create Product Context
const ProductContext = createContext(null);
const PRODUCTS_CACHE_KEY = 'apj_products_cache_v1';
const DB_TIMEOUT_MS = 10000;
const LOCAL_PRODUCTS_KEY = 'apj_local_products';

const normalizeProductData = (id, data) => ({
  id,
  ...data,
  price: typeof data.price === 'number' ? data.price : parseFloat(data.price || 0),
  diamondWeight: typeof data.diamondWeight === 'number' ? data.diamondWeight : parseFloat(data.diamondWeight || 0),
});

const readProductsCache = () => {
  try {
    const raw = sessionStorage.getItem(PRODUCTS_CACHE_KEY) || localStorage.getItem(PRODUCTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((product) => normalizeProductData(product.id, product));
  } catch {
    return [];
  }
};

const writeProductsCache = (items) => {
  try {
    const payload = JSON.stringify(items);
    sessionStorage.setItem(PRODUCTS_CACHE_KEY, payload);
    localStorage.setItem(PRODUCTS_CACHE_KEY, payload);
  } catch {
    // Cache is optional; ignore quota/private-mode failures.
  }
};

// Product Provider Component
export function ProductProvider({ children }) {
  const [initialProducts] = useState(() => readProductsCache());
  const [products, setProducts] = useState(initialProducts);
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    category: [],
    metalType: [],
    priceRange: [],
    diamondWeight: [],
    karat: [],
  });

  /** 'newest' | 'oldest' | 'price-high' | 'price-low' */
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [cartItems, setCartItems] = useState([]);
  const [cartNotice, setCartNotice] = useState(null);

  const withTimeout = (promise, timeoutMs, timeoutMessage) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
      }),
    ]);
  };

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const normalizeProduct = normalizeProductData;

  const mapProductsSnapshot = (snapshotValue) => {
    if (!snapshotValue) return [];
    return Object.entries(snapshotValue).map(([id, data]) => normalizeProduct(id, data));
  };

  const isPermissionDeniedError = (err) => {
    const msg = String(err?.message || '').toLowerCase();
    const code = String(err?.code || '').toLowerCase();
    return msg.includes('permission_denied') || msg.includes('permission denied') || code.includes('permission-denied');
  };

  const loadLocalProducts = () => {
    try {
      const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((p) => normalizeProduct(p.id, p));
    } catch {
      return [];
    }
  };

  const saveLocalProducts = (items) => {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(items));
  };

  // Fetch products from Realtime Database (one-time)
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await withTimeout(
        get(rtdbRef(realtimeDb, 'products')),
        DB_TIMEOUT_MS,
        'Product fetch timed out from Realtime Database'
      );
      const productsData = mapProductsSnapshot(snapshot.val());
      writeProductsCache(productsData);
      setProducts(productsData);
      applyFiltersAndSort(productsData);
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        const localProducts = loadLocalProducts();
        setProducts(localProducts);
        applyFiltersAndSort(localProducts);
        setError('Realtime Database permission denied. Running in local fallback mode.');
      } else {
        setError(err.message);
        console.error('Error fetching products:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const applyFiltersAndSort = (productsToFilter) => {
    let result = [...productsToFilter];

    // Apply category filter
    if (filters.category.length > 0) {
      result = result.filter((p) => filters.category.includes(p.category));
    }

    // Apply metal type filter
    if (filters.metalType.length > 0) {
      result = result.filter((p) => filters.metalType.includes(p.metalType));
    }

    // Apply karat filter
    if (filters.karat.length > 0) {
      result = result.filter((p) => filters.karat.includes(p.karat));
    }

    // Apply price range filter
    if (filters.priceRange.length > 0) {
      result = result.filter((p) => {
        return filters.priceRange.some((range) => {
          if (range === 'below-100000') return p.price < 100000;
          if (range === '100000-300000') return p.price >= 100000 && p.price <= 300000;
          if (range === '300000-500000') return p.price >= 300000 && p.price <= 500000;
          if (range === 'above-500000') return p.price > 500000;
          return true;
        });
      });
    }

    // Apply diamond weight filter
    if (filters.diamondWeight.length > 0) {
      result = result.filter((p) => {
        return filters.diamondWeight.some((range) => {
          if (range === '0.01-1.00') return p.diamondWeight >= 0.01 && p.diamondWeight <= 1.0;
          if (range === '0.11-2.00') return p.diamondWeight >= 0.11 && p.diamondWeight <= 2.0;
          return true;
        });
      });
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  };

  // Update filters
  const updateFilter = (filterType, value, isChecked) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (isChecked) {
        updated[filterType] = [...updated[filterType], value];
      } else {
        updated[filterType] = updated[filterType].filter((item) => item !== value);
      }
      return updated;
    });
  };

  /** Navbar / ?category= — maps URL slug to sidebar category values */
  const applyNavCategorySlug = useCallback((slug) => {
    const map = {
      all: [],
      fine: [],
      engagement: ['Engagement'],
      mens: ["Men's"],
      rings: ['Rings'],
      earrings: ['EarRings'],
      necklace: ['Necklace'],
      coins: ['Coins'],
    };
    const key = String(slug || 'all').toLowerCase().trim();
    const next = map[key];
    if (next === undefined) return;
    setFilters({
      category: [...next],
      metalType: [],
      priceRange: [],
      diamondWeight: [],
      karat: [],
    });
  }, []);

  // Real-time subscription on mount
  useEffect(() => {
    if (products.length === 0) {
      setLoading(true);
    }
    setError(null);

    const productsRef = rtdbRef(realtimeDb, 'products');
    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        const productsData = mapProductsSnapshot(snapshot.val());
        writeProductsCache(productsData);
        setProducts(productsData);
        applyFiltersAndSort(productsData);
        setLoading(false);
      },
      (err) => {
        if (isPermissionDeniedError(err)) {
          const localProducts = loadLocalProducts();
          setProducts(localProducts);
          applyFiltersAndSort(localProducts);
          setError('Realtime Database permission denied. Running in local fallback mode.');
        } else {
          setError(err.message);
          console.error('Error subscribing to products:', err);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Apply filters and sort when they change
  useEffect(() => {
    applyFiltersAndSort(products);
  }, [filters, sortBy]);

  // Add product to Realtime Database
  const addProduct = async (productData, imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const productsRef = rtdbRef(realtimeDb, 'products');
      const newProductRef = push(productsRef);
      const productId = newProductRef.key;

      let imageData = productData.imageData || '';
      if (imageFile) {
        imageData = await fileToDataUrl(imageFile);
      }

      const nowIso = new Date().toISOString();
      const newProduct = {
        ...productData,
        price: parseFloat(productData.price),
        diamondWeight: parseFloat(productData.diamondWeight || 0),
        imageUrl: '',
        imageStoragePath: '',
        imageDbPath: `products/${productId}/imageData`,
        imageData,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await withTimeout(
        set(newProductRef, newProduct),
        DB_TIMEOUT_MS,
        'Product create timed out. Check Realtime Database rules/network.'
      );

      // Let the real-time listener handle the state update to prevent duplicates
      // The onValue listener will automatically update the products list
      return { id: productId, ...newProduct };
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        const localProducts = loadLocalProducts();
        let imageData = productData.imageData || '';
        if (imageFile) {
          imageData = await fileToDataUrl(imageFile);
        }

        const localId = `local_${Date.now()}`;
        const nowIso = new Date().toISOString();
        const localProduct = {
          id: localId,
          ...productData,
          price: parseFloat(productData.price),
          diamondWeight: parseFloat(productData.diamondWeight || 0),
          imageUrl: '',
          imageStoragePath: '',
          imageDbPath: `products/${localId}/imageData`,
          imageData,
          createdAt: nowIso,
          updatedAt: nowIso,
          _source: 'local',
        };

        const next = [localProduct, ...localProducts];
        saveLocalProducts(next);
        setProducts(next);
        applyFiltersAndSort(next);
        setError('Realtime Database permission denied. Product saved locally in this browser.');
        return localProduct;
      }

      setError(err.message);
      console.error('Error adding product:', err);
      if (/timed out/i.test(err.message)) {
        throw new Error('Save timed out. Verify Realtime Database is enabled and rules allow write access.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Edit product in Realtime Database
  const editProduct = async (productId, productData, imageFile) => {
    setLoading(true);
    setError(null);
    try {
      const existing = products.find((p) => p.id === productId);

      let imageData = existing?.imageData || productData.imageData || '';
      if (imageFile) {
        imageData = await fileToDataUrl(imageFile);
      }

      const updateData = {
        ...productData,
        price: parseFloat(productData.price),
        diamondWeight: parseFloat(productData.diamondWeight || 0),
        imageUrl: '',
        imageStoragePath: '',
        imageDbPath: `products/${productId}/imageData`,
        imageData,
        updatedAt: new Date().toISOString(),
      };

      await withTimeout(
        update(rtdbRef(realtimeDb, `products/${productId}`), updateData),
        DB_TIMEOUT_MS,
        'Product update timed out. Check Realtime Database rules/network.'
      );

      const updatedProduct = { id: productId, ...updateData };
      const updatedProducts = products.map((p) => (p.id === productId ? updatedProduct : p));
      setProducts(updatedProducts);
      applyFiltersAndSort(updatedProducts);

      return updatedProduct;
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        const localProducts = loadLocalProducts();
        const existingLocal = localProducts.find((p) => p.id === productId) || products.find((p) => p.id === productId);

        let imageData = existingLocal?.imageData || productData.imageData || '';
        if (imageFile) {
          imageData = await fileToDataUrl(imageFile);
        }

        const localUpdated = {
          ...existingLocal,
          ...productData,
          id: productId,
          price: parseFloat(productData.price),
          diamondWeight: parseFloat(productData.diamondWeight || 0),
          imageUrl: '',
          imageStoragePath: '',
          imageDbPath: `products/${productId}/imageData`,
          imageData,
          updatedAt: new Date().toISOString(),
          _source: 'local',
        };

        const next = localProducts.some((p) => p.id === productId)
          ? localProducts.map((p) => (p.id === productId ? localUpdated : p))
          : [localUpdated, ...localProducts];

        saveLocalProducts(next);
        setProducts(next);
        applyFiltersAndSort(next);
        setError('Realtime Database permission denied. Product updated locally in this browser.');
        return localUpdated;
      }

      setError(err.message);
      console.error('Error editing product:', err);
      if (/timed out/i.test(err.message)) {
        throw new Error('Update timed out. Verify Realtime Database is enabled and rules allow write access.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete product from Realtime Database
  const deleteProduct = async (productId) => {
    setLoading(true);
    setError(null);
    try {
      await withTimeout(
        remove(rtdbRef(realtimeDb, `products/${productId}`)),
        DB_TIMEOUT_MS,
        'Product delete timed out. Check Realtime Database rules/network.'
      );

      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);
      applyFiltersAndSort(updatedProducts);
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        const localProducts = loadLocalProducts();
        const next = localProducts.filter((p) => p.id !== productId);
        saveLocalProducts(next);
        setProducts(next);
        applyFiltersAndSort(next);
        setError('Realtime Database permission denied. Product deleted locally in this browser.');
        return;
      }

      setError(err.message);
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cart functions
  const addToCart = (product) => {
    setCartNotice({
      id: `${product.id}-${Date.now()}`,
      name: product.name || 'Product',
    });

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const clearCartNotice = () => {
    setCartNotice(null);
  };

  // Get pagination info
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const value = {
    products,
    filteredProducts,
    paginatedProducts,
    loading,
    error,
    filters,
    updateFilter,
    applyNavCategorySlug,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    cartItems,
    cartNotice,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    clearCartNotice,
    fetchProducts,
    addProduct,
    editProduct,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

// Custom hook to use Product Context
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
