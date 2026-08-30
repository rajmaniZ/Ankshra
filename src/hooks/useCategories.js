import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCategories,
} from "../services/categoryService";

function getCategoriesFromResponse(
  response,
) {
  const categories =
    response?.data?.categories ||
    response?.categories ||
    response?.data ||
    [];

  return Array.isArray(categories)
    ? categories
    : [];
}

function useCategories() {
  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const loadCategories =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getCategories();

        setCategories(
          getCategoriesFromResponse(
            response,
          ),
        );
      } catch (requestError) {
        console.error(
          "Failed to load categories:",
          requestError,
        );

        setCategories([]);
        setError(requestError);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
  };
}

export default useCategories;