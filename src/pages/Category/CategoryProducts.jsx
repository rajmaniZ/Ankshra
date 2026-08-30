import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  FiFilter,
  FiGrid,
  FiList,
  FiX,
} from "react-icons/fi";

import ProductCard from "../../components/product/ProductCard/ProductCard";
import FilterSidebar from "../../components/search/SearchFilters/SearchFilters";

import {
  getProducts,
} from "../../services/productService";

import styles from "./CategoryProducts.module.css";

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  return {
    ...product,

    id:
      product._id ||
      product.id ||
      "",

    image:
      product.images?.[0]?.url ||
      product.images?.[0] ||
      product.image ||
      "",

    category:
      product.category?.name ||
      product.category ||
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

function formatCategoryName(slug) {
  if (!slug) {
    return "Products";
  }

  return slug
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function CategoryProducts() {
  const { slug } =
    useParams();

  const [sortBy, setSortBy] =
    useState("featured");

  const [view, setView] =
    useState("grid");

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const categoryName =
    formatCategoryName(slug);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      if (!slug) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = {
          categorySlug:
            slug.toLowerCase(),
          limit: 100,
        };

        if (
          sortBy !== "featured"
        ) {
          params.sort = sortBy;
        }

        const response =
          await getProducts(params);

        const data =
          response?.data?.products ||
          [];

        if (!active) {
          return;
        }

        setProducts(
          Array.isArray(data)
            ? data
                .map(
                  normalizeProduct,
                )
                .filter(Boolean)
            : [],
        );
      } catch (loadError) {
        console.error(
          "Failed to load category products:",
          loadError,
        );

        if (!active) {
          return;
        }

        setProducts([]);
        setError(loadError);
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
  }, [slug, sortBy]);

  const categoryProducts =
    useMemo(
      () => products,
      [products],
    );

  return (
    <main
      className={styles.page}
    >
      <div
        className={styles.container}
      >
        <nav
          className={
            styles.breadcrumb
          }
        >
          <Link to="/">
            Home
          </Link>

          <span>/</span>

          <Link to="/shop">
            Shop
          </Link>

          <span>/</span>

          <span>
            {categoryName}
          </span>
        </nav>

        <header
          className={styles.header}
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              Our Collection
            </span>

            <h1
              className={
                styles.title
              }
            >
              {categoryName}
            </h1>

            <p
              className={
                styles.description
              }
            >
              Discover our carefully
              selected collection of{" "}
              {categoryName.toLowerCase()}.
            </p>
          </div>

          <span
            className={styles.count}
          >
            {categoryProducts.length}{" "}
            {categoryProducts.length ===
            1
              ? "item"
              : "items"}
          </span>
        </header>

        <div
          className={styles.toolbar}
        >
          <div
            className={
              styles.collections
            }
          >
            <button
              type="button"
              onClick={() =>
                setSortBy(
                  "featured",
                )
              }
              className={
                sortBy ===
                "featured"
                  ? styles.active
                  : ""
              }
            >
              Featured
            </button>

            <button
              type="button"
              onClick={() =>
                setSortBy("rating")
              }
              className={
                sortBy === "rating"
                  ? styles.active
                  : ""
              }
            >
              Rating
            </button>

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  true,
                )
              }
            >
              <FiFilter
                size={14}
              />

              Filter
            </button>
          </div>

          <div
            className={styles.sort}
          >
            <label htmlFor="category-sort">
              Sort
            </label>

            <select
              id="category-sort"
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value,
                )
              }
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="rating">
                Rating
              </option>
            </select>

            <button
              type="button"
              onClick={() =>
                setView("grid")
              }
              className={
                view === "grid"
                  ? styles.active
                  : ""
              }
              aria-label="Grid view"
            >
              <FiGrid
                size={16}
              />
            </button>

            <button
              type="button"
              onClick={() =>
                setView("list")
              }
              className={
                view === "list"
                  ? styles.active
                  : ""
              }
              aria-label="List view"
            >
              <FiList
                size={16}
              />
            </button>
          </div>
        </div>

        {showFilters && (
          <div
            className={
              styles.filterOverlay
            }
          >
            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  false,
                )
              }
              className={
                styles.filterClose
              }
              aria-label="Close filters"
            >
              <FiX />
            </button>

            <FilterSidebar />
          </div>
        )}

        {loading && (
          <div
            className={
              styles.empty
            }
          >
            Loading products...
          </div>
        )}

        {!loading && error && (
          <div
            className={
              styles.empty
            }
          >
            Unable to load products.
          </div>
        )}

        {!loading &&
          !error &&
          categoryProducts.length ===
            0 && (
            <div
              className={
                styles.empty
              }
            >
              <h2>
                No products found
              </h2>

              <p>
                There are no products
                available in this
                collection right now.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          categoryProducts.length >
            0 && (
            <div
              className={
                view === "list"
                  ? styles.list
                  : styles.grid
              }
            >
              {categoryProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={
                      product
                    }
                  />
                ),
              )}
            </div>
          )}
      </div>
    </main>
  );
}

export default CategoryProducts;