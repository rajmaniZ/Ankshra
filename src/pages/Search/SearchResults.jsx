import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import SearchBar from "../../components/search/SearchBar/SearchBar";
import SearchFilters from "../../components/search/SearchFilters/SearchFilters";
import SearchResultsList from "../../components/search/SearchResults/SearchResults";
import EmptyState from "../../components/common/EmptyState/EmptyState";

import {
  getProducts,
} from "../../services/productService";

import {
  getCategories,
} from "../../services/categoryService";

import styles from "./SearchResults.module.css";

function getCategoryId(category) {
  return (
    category?._id ||
    category?.id ||
    ""
  );
}

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  const image =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image ||
    "";

  const category =
    product.category;

  return {
    ...product,

    id:
      product._id ||
      product.id ||
      "",

    image,

    images:
      Array.isArray(product.images)
        ? product.images
        : image
          ? [image]
          : [],

    category:
      category?.name ||
      category ||
      "",

    categoryId:
      category?._id ||
      category?.id ||
      "",

    categorySlug:
      category?.slug ||
      "",

    rating:
      product.rating?.average ??
      product.rating ??
      0,

    reviewCount:
      product.reviewCount ??
      product.rating?.count ??
      0,
  };
}

function getProductsFromResponse(
  response,
) {
  const products =
    response?.data?.products;

  return Array.isArray(products)
    ? products
    : [];
}

function getCategoriesFromResponse(
  response,
) {
  const categories =
    response?.data?.categories ||
    response?.categories ||
    response?.data;

  return Array.isArray(categories)
    ? categories
    : [];
}

function SearchResults() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const query =
    searchParams.get("q") || "";

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("");

  const [
    minPrice,
    setMinPrice,
  ] = useState("");

  const [
    maxPrice,
    setMaxPrice,
  ] = useState("");

  const [sort, setSort] =
    useState("featured");

  const [categories, setCategories] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response =
          await getCategories();

        const data =
          getCategoriesFromResponse(
            response,
          );

        if (active) {
          setCategories(data);
        }
      } catch (requestError) {
        console.error(
          "Failed to load categories:",
          requestError,
        );

        if (active) {
          setCategories([]);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const params = {};

        const trimmedQuery =
          query.trim();

        if (trimmedQuery) {
          params.search =
            trimmedQuery;
        }

        if (selectedCategory) {
          const selected =
            categories.find(
              (category) =>
                category.slug ===
                  selectedCategory ||
                String(
                  category._id,
                ) ===
                  String(
                    selectedCategory,
                  ) ||
                String(
                  category.id,
                ) ===
                  String(
                    selectedCategory,
                  ),
            );

          if (selected) {
            const categoryId =
              getCategoryId(
                selected,
              );

            if (categoryId) {
              params.category =
                categoryId;
            }
          }
        }

        if (minPrice !== "") {
          params.minPrice =
            minPrice;
        }

        if (maxPrice !== "") {
          params.maxPrice =
            maxPrice;
        }

        if (
          sort &&
          sort !== "featured"
        ) {
          params.sort = sort;
        }

        params.limit = 100;

        const response =
          await getProducts(
            params,
          );

        const data =
          getProductsFromResponse(
            response,
          );

        if (!active) {
          return;
        }

        setProducts(
          data
            .map(normalizeProduct)
            .filter(Boolean),
        );
      } catch (requestError) {
        console.error(
          "Failed to search products:",
          requestError,
        );

        if (!active) {
          return;
        }

        setProducts([]);
        setError(requestError);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [
    query,
    selectedCategory,
    minPrice,
    maxPrice,
    sort,
    categories,
  ]);

  const handleClear = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("featured");
  };

  const handleSearch = (
    value,
  ) => {
    const trimmedValue =
      value.trim();

    if (trimmedValue) {
      setSearchParams({
        q: trimmedValue,
      });

      return;
    }

    setSearchParams({});
  };

  return (
    <div
      className={styles.page}
    >
      <div
        className={styles.container}
      >
        <div
          className={styles.heading}
        >
          <span
            className={
              styles.eyebrow
            }
          >
            Find Your Jewellery
          </span>

          <h1
            className={styles.title}
          >
            Search
          </h1>
        </div>

        <SearchBar
          autoFocus={!query}
          onSearch={handleSearch}
        />

        <div
          className={styles.filters}
        >
          <SearchFilters
            categories={
              categories
            }
            selectedCategory={
              selectedCategory
            }
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            onCategoryChange={
              setSelectedCategory
            }
            onMinPriceChange={
              setMinPrice
            }
            onMaxPriceChange={
              setMaxPrice
            }
            onSortChange={
              setSort
            }
            onClear={
              handleClear
            }
          />
        </div>

        {loading && (
          <div
            className={
              styles.loading
            }
          >
            Loading products...
          </div>
        )}

        {!loading && error && (
          <div
            className={
              styles.error
            }
          >
            Unable to load search
            results.
          </div>
        )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <SearchResultsList
              products={products}
              query={query}
            />
          )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <EmptyState
              title="No products found"
              message={
                query
                  ? `We couldn't find anything matching "${query}". Try another search.`
                  : "Try searching for necklaces, earrings, rings, or bracelets."
              }
            />
          )}
      </div>
    </div>
  );
}

export default SearchResults;