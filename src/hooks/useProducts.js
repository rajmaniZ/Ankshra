import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getProducts,
  getProductById,
  getProductBySlug,
} from "../services/productService";

function useProducts(params = {}) {
  const [products, setProducts] =
    useState([]);

  const [pagination, setPagination] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const loadProducts = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await getProducts(params);

        const data =
          response?.data || {};

        setProducts(
          Array.isArray(data.products)
            ? data.products
            : Array.isArray(response?.data)
              ? response.data
              : [],
        );

        setPagination(
          data.pagination || null,
        );
      } catch (requestError) {
        console.error(
          "Failed to load products:",
          requestError,
        );

        setProducts([]);
        setPagination(null);
        setError(requestError);
      } finally {
        setLoading(false);
      }
    },
    [JSON.stringify(params)],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const getProduct = async (id) => {
    const response =
      await getProductById(id);

    return (
      response?.data?.product ||
      null
    );
  };

  const getProductByProductSlug =
    async (slug) => {
      const response =
        await getProductBySlug(slug);

      return (
        response?.data?.product ||
        null
      );
    };

  return {
    products,
    pagination,
    loading,
    error,

    reload: loadProducts,

    getProduct,

    getProductBySlug:
      getProductByProductSlug,
  };
}

export default useProducts;