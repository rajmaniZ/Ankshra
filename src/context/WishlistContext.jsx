import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getWishlist,
  toggleWishlist as toggleWishlistRequest,
  removeFromWishlist as removeFromWishlistRequest,
} from "../services/wishlistService";

const WishlistContext =
  createContext(null);

function getProductId(item) {
  if (!item) {
    return "";
  }

  if (typeof item === "string") {
    return item;
  }

  if (typeof item === "object") {
    if (item._id) {
      return String(item._id);
    }

    if (item.id) {
      return String(item.id);
    }

    if (item.productId) {
      if (typeof item.productId === "object") {
        return String(
          item.productId._id ||
            item.productId.id ||
            "",
        );
      }

      return String(item.productId);
    }

    if (item.product) {
      return getProductId(item.product);
    }
  }

  return "";
}

function getProduct(item) {
  if (!item) {
    return null;
  }

  if (
    typeof item === "object" &&
    item.product &&
    typeof item.product === "object"
  ) {
    return item.product;
  }

  if (
    typeof item === "object" &&
    item.productId &&
    typeof item.productId === "object"
  ) {
    return item.productId;
  }

  if (typeof item === "object") {
    return item;
  }

  return null;
}

function normalizeWishlistItem(item) {
  const product =
    getProduct(item);

  const productId =
    getProductId(item);

  if (!productId) {
    return null;
  }

  if (!product) {
    return {
      _id: productId,
    };
  }

  return {
    ...product,
    _id:
      product._id ||
      product.id ||
      productId,
  };
}

function getWishlistFromResponse(
  response,
) {
  const wishlist =
    response?.data?.wishlist ??
    response?.wishlist ??
    response?.data ??
    null;

  return wishlist;
}

function getWishlistItems(
  wishlist,
) {
  let rawItems = [];

  if (
    Array.isArray(wishlist)
  ) {
    rawItems = wishlist;
  } else if (
    Array.isArray(
      wishlist?.products,
    )
  ) {
    rawItems = wishlist.products;
  } else if (
    Array.isArray(
      wishlist?.items,
    )
  ) {
    rawItems = wishlist.items;
  }

  return rawItems
    .map(normalizeWishlistItem)
    .filter(Boolean);
}

export function WishlistProvider({
  children,
}) {
  const [
    wishlist,
    setWishlist,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const items = useMemo(
    () =>
      getWishlistItems(
        wishlist,
      ),
    [wishlist],
  );

  const loadWishlist =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          "accessToken",
        );

      if (!token) {
        setWishlist(null);
        return null;
      }

      setLoading(true);

      try {
        const response =
          await getWishlist();

        const nextWishlist =
          getWishlistFromResponse(
            response,
          );

        if (
          nextWishlist
        ) {
          setWishlist(
            nextWishlist,
          );
        } else {
          setWishlist({
            products: [],
          });
        }

        return nextWishlist;
      } catch (error) {
        if (
          error?.status === 401 ||
          error?.response?.status === 401
        ) {
          setWishlist(null);
        } else if (
          error?.status === 404 ||
          error?.response?.status === 404
        ) {
          setWishlist({
            products: [],
          });
        } else {
          console.error(
            "Failed to load wishlist:",
            error,
          );
        }

        return null;
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  useEffect(() => {
    const handleUserUpdated =
      () => {
        loadWishlist();
      };

    const handleLogout =
      () => {
        setWishlist(null);
      };

    window.addEventListener(
      "auth:user-updated",
      handleUserUpdated,
    );

    window.addEventListener(
      "auth:logout",
      handleLogout,
    );

    return () => {
      window.removeEventListener(
        "auth:user-updated",
        handleUserUpdated,
      );

      window.removeEventListener(
        "auth:logout",
        handleLogout,
      );
    };
  }, [loadWishlist]);

  const toggleWishlist =
    async (product) => {
      const productId =
        getProductId(product);

      if (!productId) {
        throw new Error(
          "Product ID is required",
        );
      }

      const response =
        await toggleWishlistRequest(
          productId,
        );

      const nextWishlist =
        getWishlistFromResponse(
          response,
        );

      if (
        nextWishlist
      ) {
        setWishlist(
          nextWishlist,
        );
      } else {
        await loadWishlist();
      }

      return response;
    };

  const removeFromWishlist =
    async (productId) => {
      const id =
        getProductId(productId);

      if (!id) {
        throw new Error(
          "Product ID is required",
        );
      }

      const response =
        await removeFromWishlistRequest(
          id,
        );

      const nextWishlist =
        getWishlistFromResponse(
          response,
        );

      if (
        nextWishlist
      ) {
        setWishlist(
          nextWishlist,
        );
      } else {
        await loadWishlist();
      }

      return response;
    };

  const clearWishlist =
    async () => {
      const currentItems =
        getWishlistItems(
          wishlist,
        );

      if (
        !currentItems.length
      ) {
        return;
      }

      for (
        const product of currentItems
      ) {
        const productId =
          getProductId(product);

        if (!productId) {
          continue;
        }

        try {
          await removeFromWishlistRequest(
            productId,
          );
        } catch (error) {
          console.error(
            "Failed to remove wishlist item:",
            error,
          );
        }
      }

      setWishlist({
        ...(wishlist || {}),
        products: [],
      });
    };

  const isWishlisted =
    (productId) => {
      if (!productId) {
        return false;
      }

      const id =
        String(productId);

      return items.some(
        (product) =>
          String(
            getProductId(product),
          ) === id,
      );
    };

  const count =
    items.length;

  const value = useMemo(
    () => ({
      wishlist,

      items,

      count,

      loading,

      loadWishlist,

      isWishlisted,

      toggleWishlist,

      removeFromWishlist,

      clearWishlist,

      toggle: toggleWishlist,
    }),
    [
      wishlist,
      items,
      count,
      loading,
      loadWishlist,
    ],
  );

  return (
    <WishlistContext.Provider
      value={value}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context =
    useContext(
      WishlistContext,
    );

  if (!context) {
    throw new Error(
      "useWishlistContext must be used inside WishlistProvider",
    );
  }

  return context;
}

export default WishlistContext;