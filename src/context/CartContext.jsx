import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getCart,
  addToCart as addToCartRequest,
  updateCartItem,
  removeFromCart as removeFromCartRequest,
  clearCart as clearCartRequest,
} from "../services/cartService";

const CartContext = createContext(null);

const emptyTotals = {
  itemCount: 0,
  subtotal: 0,
  offerDiscount: 0,
  finalSubtotal: 0,
};

function getCartFromResponse(response) {
  const payload =
    response?.data?.data ||
    response?.data ||
    response ||
    {};

  const cart =
    payload?.cart || {
      items: [],
    };

  const totals =
    payload?.totals || {};

  return {
    cart: {
      ...cart,
      items: Array.isArray(cart?.items)
        ? cart.items
        : [],
    },

    totals: {
      itemCount: Number(
        totals?.itemCount ?? 0,
      ),

      subtotal: Number(
        totals?.subtotal ?? 0,
      ),

      offerDiscount: Number(
        totals?.offerDiscount ?? 0,
      ),

      finalSubtotal: Number(
        totals?.finalSubtotal ?? 0,
      ),
    },
  };
}

function getItems(cart) {
  return Array.isArray(cart?.items)
    ? cart.items
    : [];
}

function getProductId(product) {
  return (
    product?._id ||
    product?.id ||
    product?.product?._id ||
    product?.product?.id ||
    ""
  );
}

function getCartItemProductId(item) {
  return (
    item?.product?._id ||
    item?.product?.id ||
    item?.product ||
    item?._id ||
    item?.id ||
    ""
  );
}

export function CartProvider({
  children,
}) {
  const [cart, setCart] = useState({
    items: [],
  });

  const [totals, setTotals] =
    useState(emptyTotals);

  const [loading, setLoading] =
    useState(false);

  const syncRequestId =
    useRef(0);

  const items = useMemo(
    () => getItems(cart),
    [cart],
  );

  const applyCartResponse = (
    response,
  ) => {
    const result =
      getCartFromResponse(
        response,
      );

    setCart(result.cart);
    setTotals(result.totals);

    return result;
  };

  const resetCart = () => {
    setCart({
      items: [],
    });

    setTotals({
      ...emptyTotals,
    });
  };

  const loadCart = async (
    showLoading = true,
  ) => {
    if (
      !localStorage.getItem(
        "accessToken",
      )
    ) {
      resetCart();
      return null;
    }

    if (showLoading) {
      setLoading(true);
    }

    const requestId =
      ++syncRequestId.current;

    try {
      const response =
        await getCart();

      /*
       * Ignore an older GET request if a
       * newer cart request has already started.
       */
      if (
        requestId !==
        syncRequestId.current
      ) {
        return response;
      }

      applyCartResponse(response);

      return response;
    } catch (error) {
      /*
       * Do not clear a valid cart because
       * an old/background request failed.
       */
      if (
        requestId !==
        syncRequestId.current
      ) {
        return null;
      }

      if (
        error?.status === 401 ||
        error?.response?.status === 401
      ) {
        resetCart();
      } else {
        console.error(
          "Failed to load cart:",
          error,
        );
      }

      throw error;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  /*
   * Refresh the canonical cart from
   * the backend without showing the
   * page-level loading state.
   */
  const syncCart = async () => {
    return loadCart(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (
    product,
    quantity = 1,
  ) => {
    const productId =
      getProductId(product);

    if (!productId) {
      throw new Error(
        "Product ID is required",
      );
    }

    const nextQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        nextQuantity,
      ) ||
      nextQuantity < 1
    ) {
      throw new Error(
        "Quantity must be a positive integer",
      );
    }

    await addToCartRequest(
      productId,
      nextQuantity,
    );

    /*
     * Never use the mutation response
     * as the final cart state.
     *
     * GET /cart is the source of truth.
     */
    await syncCart();

    return true;
  };

  const updateQuantity = async (
    productId,
    quantity,
  ) => {
    if (!productId) {
      return;
    }

    const nextQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        nextQuantity,
      ) ||
      nextQuantity < 1
    ) {
      return removeFromCart(
        productId,
      );
    }

    await updateCartItem(
      productId,
      nextQuantity,
    );

    /*
     * Re-fetch the complete populated
     * cart including current pricing.
     */
    await syncCart();

    return true;
  };

  const changeQuantity =
    updateQuantity;

  const removeFromCart = async (
    productId,
  ) => {
    if (!productId) {
      return;
    }

    await removeFromCartRequest(
      productId,
    );

    /*
     * Re-fetch the canonical cart.
     */
    await syncCart();

    return true;
  };

  const clearCart = async () => {
    await clearCartRequest();

    resetCart();

    return true;
  };

  const count = useMemo(
    () => {
      const backendCount =
        Number(
          totals?.itemCount,
        );

      if (
        Number.isFinite(
          backendCount,
        )
      ) {
        return backendCount;
      }

      return items.reduce(
        (total, item) =>
          total +
          Number(
            item?.quantity || 0,
          ),
        0,
      );
    },
    [
      totals?.itemCount,
      items,
    ],
  );

  const subtotal = Number(
    totals?.subtotal || 0,
  );

  const offerDiscount = Number(
    totals?.offerDiscount || 0,
  );

  const finalSubtotal = Number(
    totals?.finalSubtotal || 0,
  );

  const getItemQuantity = (
    productId,
  ) => {
    const item = items.find(
      (currentItem) =>
        String(
          getCartItemProductId(
            currentItem,
          ),
        ) ===
        String(productId),
    );

    return Number(
      item?.quantity || 0,
    );
  };

  const value = useMemo(
    () => ({
      cart,
      items,
      loading,

      count,
      cartCount: count,

      subtotal,
      offerDiscount,
      finalSubtotal,

      totals,

      loadCart,
      syncCart,

      addToCart,

      updateQuantity,
      changeQuantity,

      removeFromCart,

      clearCart,

      getItemQuantity,
    }),
    [
      cart,
      items,
      loading,
      count,
      subtotal,
      offerDiscount,
      finalSubtotal,
      totals,
    ],
  );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCartContext must be used inside CartProvider",
    );
  }

  return context;
}