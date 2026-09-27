import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiFilter,
  FiGrid,
  FiList,
  FiX,
} from "react-icons/fi";

import ProductCard from "../../components/product/ProductCard/ProductCard";
import SearchFilters from "../../components/search/SearchFilters/SearchFilters";

import useCategories from "../../hooks/useCategories";
import useDebounce from "../../hooks/useDebounce";

import {
  getProducts,
} from "../../services/productService";

import styles from "./CategoryProducts.module.css";

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  const id =
    product._id ||
    product.id ||
    "";

  const images =
    Array.isArray(product.images)
      ? product.images
      : [];

  const image =
    images.length > 0
      ? typeof images[0] === "object"
        ? images[0]?.url ||
          images[0]?.secure_url ||
          ""
        : images[0] || ""
      : product.image || "";

  const category =
    product.category;

  return {
    ...product,

    id,

    image,

    images,

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

function formatCategoryName(slug) {
  if (!slug) {
    return "Products";
  }

  return slug
    .split("-")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
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

function getPaginationFromResponse(
  response,
) {
  return (
    response?.data?.pagination ||
    null
  );
}

function CategoryProducts() {
  const {
    slug = "",
  } = useParams();

  const navigate =
    useNavigate();

  const {
    categories = [],
    loading: categoriesLoading,
  } = useCategories();

  const [
    minPrice,
    setMinPrice,
  ] = useState("");

  const [
    maxPrice,
    setMaxPrice,
  ] = useState("");

  const [
    sortBy,
    setSortBy,
  ] = useState("featured");

  const [
    view,
    setView,
  ] = useState("grid");

  const [
    showFilters,
    setShowFilters,
  ] = useState(false);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const debouncedMinPrice =
    useDebounce(
      minPrice,
      350,
    );

  const debouncedMaxPrice =
    useDebounce(
      maxPrice,
      350,
    );

  const normalizedSlug =
    String(slug)
      .trim()
      .toLowerCase();

  const categoryName =
    formatCategoryName(
      normalizedSlug,
    );

  const selectedCategory =
    categories.find(
      (category) =>
        String(
          category?.slug || "",
        )
          .trim()
          .toLowerCase() ===
        normalizedSlug,
    );

  const selectedCategoryId =
    selectedCategory?._id ||
    selectedCategory?.id ||
    "";

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      if (!normalizedSlug) {
        setProducts([]);
        setPagination(null);
        setLoading(false);
        return;
      }

      if (
        debouncedMinPrice !== "" &&
        debouncedMaxPrice !== "" &&
        Number(debouncedMinPrice) >
          Number(debouncedMaxPrice)
      ) {
        setProducts([]);
        setPagination(null);
        setError(
          "Minimum price cannot be greater than maximum price.",
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const params = {
          categorySlug:
            normalizedSlug,

          limit: 100,
        };

        if (
          debouncedMinPrice !== ""
        ) {
          params.minPrice =
            debouncedMinPrice;
        }

        if (
          debouncedMaxPrice !== ""
        ) {
          params.maxPrice =
            debouncedMaxPrice;
        }

        if (
          sortBy &&
          sortBy !== "featured"
        ) {
          params.sort = sortBy;
        }

        const response =
          await getProducts(
            params,
          );

        if (!active) {
          return;
        }

        const data =
          getProductsFromResponse(
            response,
          );

        const normalized =
          data
            .map(
              normalizeProduct,
            )
            .filter(
              Boolean,
            );

        setProducts(
          normalized,
        );

        setPagination(
          getPaginationFromResponse(
            response,
          ),
        );
      } catch (requestError) {
        console.error(
          "Failed to load category products:",
          requestError,
        );

        if (!active) {
          return;
        }

        setProducts([]);
        setPagination(null);

        setError(
          requestError?.message ||
            "Unable to load products.",
        );
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
    normalizedSlug,
    debouncedMinPrice,
    debouncedMaxPrice,
    sortBy,
  ]);

  useEffect(() => {
    if (!showFilters) {
      document.body.style.overflow =
        "";
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event,
    ) {
      if (
        event.key === "Escape"
      ) {
        setShowFilters(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [showFilters]);

  function handleCategoryChange(
    categoryId,
  ) {
    const value =
      String(
        categoryId || "",
      );

    setShowFilters(false);

    if (!value) {
      navigate("/shop");
      return;
    }

    const category =
      categories.find(
        (item) =>
          String(
            item?._id ||
              item?.id ||
              "",
          ) === value,
      );

    if (!category?.slug) {
      return;
    }

    navigate(
      `/category/${encodeURIComponent(
        category.slug,
      )}`,
    );
  }

  function handleClearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setSortBy("featured");
  }

  const total =
    pagination?.total ??
    products.length;

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
              Category{" "}
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
            {total}{" "}
            {total === 1
              ? "item"
              : "items"}
          </span>
        </header>

        <div
          className={styles.toolbar}
        >
          <div
            className={
              styles.toolbarLeft
            }
          >
            <button
              type="button"
              className={`${styles.collectionButton} ${
                sortBy ===
                "featured"
                  ? styles.active
                  : ""
              }`}
              onClick={() =>
                setSortBy(
                  "featured",
                )
              }
            >
              Featured
            </button>

            <button
              type="button"
              className={`${styles.collectionButton} ${
                sortBy === "rating"
                  ? styles.active
                  : ""
              }`}
              onClick={() =>
                setSortBy(
                  "rating",
                )
              }
            >
              Rating
            </button>

            <button
              type="button"
              className={
                styles.filterButton
              }
              onClick={() =>
                setShowFilters(true)
              }
            >
              <FiFilter
                size={15}
              />

              <span>
                Filter
              </span>
            </button>
          </div>

          <div
            className={
              styles.toolbarRight
            }
          >
            <div
              className={
                styles.sort
              }
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
            </div>

            <div
              className={
                styles.viewOptions
              }
            >
              <button
                type="button"
                className={
                  view === "grid"
                    ? styles.active
                    : ""
                }
                onClick={() =>
                  setView("grid")
                }
                aria-label="Grid view"
                aria-pressed={
                  view === "grid"
                }
              >
                <FiGrid
                  size={17}
                />
              </button>

              <button
                type="button"
                className={
                  view === "list"
                    ? styles.active
                    : ""
                }
                onClick={() =>
                  setView("list")
                }
                aria-label="List view"
                aria-pressed={
                  view === "list"
                }
              >
                <FiList
                  size={17}
                />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div
            className={
              styles.filterOverlay
            }
            onMouseDown={() =>
              setShowFilters(false)
            }
          >
            <aside
              className={
                styles.filterPanel
              }
              onMouseDown={(
                event,
              ) =>
                event.stopPropagation()
              }
              aria-label="Product filters"
            >
              <div
                className={
                  styles.filterHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.filterEyebrow
                    }
                  >
                    Refine
                  </span>

                  <h2
                    className={
                      styles.filterTitle
                    }
                  >
                    Filters
                  </h2>
                </div>

                <button
                  type="button"
                  className={
                    styles.filterClose
                  }
                  onClick={() =>
                    setShowFilters(
                      false,
                    )
                  }
                  aria-label="Close filters"
                >
                  <FiX
                    size={20}
                  />
                </button>
              </div>

              <div
                className={
                  styles.filterContent
                }
              >
                <SearchFilters
                  categories={
                    categories
                  }
                  selectedCategory={
                    selectedCategoryId
                  }
                  minPrice={
                    minPrice
                  }
                  maxPrice={
                    maxPrice
                  }
                  sort={
                    sortBy
                  }
                  onCategoryChange={
                    handleCategoryChange
                  }
                  onMinPriceChange={
                    setMinPrice
                  }
                  onMaxPriceChange={
                    setMaxPrice
                  }
                  onSortChange={
                    setSortBy
                  }
                  onClear={
                    handleClearFilters
                  }
                  showCategoryInClear={
                    false
                  }
                />

                {categoriesLoading && (
                  <p
                    className={
                      styles.filterLoading
                    }
                  >
                    Loading categories...
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}

        {loading && (
          <div
            className={
              styles.empty
            }
          >
            <div
              className={
                styles.loadingIndicator
              }
            />

            <p>
              Loading products...
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            className={
              styles.empty
            }
          >
            <h2>
              Unable to load products
            </h2>

            <p>
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          products.length ===
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
                matching the current
                filters.
              </p>

              {(minPrice ||
                maxPrice) && (
                <button
                  type="button"
                  className={
                    styles.clearButton
                  }
                  onClick={
                    handleClearFilters
                  }
                >
                  Clear price filters
                </button>
              )}
            </div>
          )}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div
              className={
                view === "list"
                  ? styles.productList
                  : styles.productGrid
              }
            >
              {products.map(
                (product) => (
                  <ProductCard
                    key={
                      product.id
                    }
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