import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import ProductCard from "../../components/product/ProductCard/ProductCard";

import {
  getProducts,
} from "../../services/productService";

import {
  getOffers,
} from "../../services/offerService";

import {
  getProductPricing,
} from "../../utils/pricing";

import styles from "./Shop.module.css";

function normalizeProduct(
  product,
) {
  if (!product) {
    return null;
  }

  const category =
    product.category;

  const categoryId =
    typeof category ===
    "object"
      ? category?._id ||
        category?.id ||
        ""
      : category || "";

  const categoryName =
    typeof category ===
    "object"
      ? category?.name ||
        category?.title ||
        ""
      : category || "";

  return {
    ...product,

    id:
      product._id ||
      product.id ||
      "",

    categoryId,

    categoryName,

    image:
      product.images?.[0]
        ?.url ||
      product.images?.[0]
        ?.secure_url ||
      product.images?.[0] ||
      product.image ||
      "",

    rating:
      product.rating
        ?.average ??
      product.rating ??
      0,

    reviewCount:
      product.reviewCount ??
      product.rating
        ?.count ??
      0,
  };
}

function getOfferList(
  response,
) {
  if (
    Array.isArray(
      response?.data?.offers,
    )
  ) {
    return response.data
      .offers;
  }

  if (
    Array.isArray(
      response?.offers,
    )
  ) {
    return response.offers;
  }

  if (
    Array.isArray(
      response?.data,
    )
  ) {
    return response.data;
  }

  return [];
}

function applyPricing(
  product,
  offers,
) {
  const pricing =
    getProductPricing(
      product,
      offers,
    );

  return {
    ...product,

    offerPrice:
      pricing.hasOffer
        ? pricing.price
        : null,

    offerDiscount:
      pricing.offerDiscount,

    offerDiscountPercentage:
      pricing.displayDiscountPercentage,

    offerName:
      pricing.offer?.name ||
      "",

    appliedOffer:
      pricing.offer ||
      null,

    originalPrice:
      pricing.originalPrice,

    pricing,
  };
}

function Shop() {
  const [
    searchParams,
  ] = useSearchParams();

  const collection =
    searchParams.get(
      "collection",
    ) || "all";

  const [
    sort,
    setSort,
  ] = useState(
    "featured",
  );

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const params = {
          limit: 100,
        };

        if (
          collection ===
          "new-arrivals"
        ) {
          params.newArrival =
            true;
        }

        if (
          collection ===
          "best-sellers"
        ) {
          params.bestSeller =
            true;
        }

        if (
          sort ===
          "price-low"
        ) {
          params.sort =
            "price-low";
        }

        if (
          sort ===
          "price-high"
        ) {
          params.sort =
            "price-high";
        }

        if (
          sort ===
          "rating"
        ) {
          params.sort =
            "rating";
        }

        const [
          productsResponse,
          offersResponse,
        ] = await Promise.all([
          getProducts(params),
          getOffers(),
        ]);

        if (!active) {
          return;
        }

        const productData =
          productsResponse
            ?.data?.products ||
          productsResponse
            ?.products ||
          productsResponse?.data ||
          [];

        const offers =
          getOfferList(
            offersResponse,
          );

        const normalized =
          Array.isArray(
            productData,
          )
            ? productData
                .map(
                  normalizeProduct,
                )
                .filter(Boolean)
                .map(
                  (product) =>
                    applyPricing(
                      product,
                      offers,
                    ),
                )
            : [];

        let visibleProducts =
          normalized;

        if (
          collection ===
          "offers"
        ) {
          visibleProducts =
            normalized.filter(
              (product) =>
                product.pricing
                  ?.hasOffer ===
                true,
            );
        }

        if (
          sort ===
          "price-low"
        ) {
          visibleProducts =
            [
              ...visibleProducts,
            ].sort(
              (
                first,
                second,
              ) =>
                Number(
                  first.pricing
                    ?.price ??
                    first.price ??
                    0,
                ) -
                Number(
                  second.pricing
                    ?.price ??
                    second.price ??
                    0,
                ),
            );
        }

        if (
          sort ===
          "price-high"
        ) {
          visibleProducts =
            [
              ...visibleProducts,
            ].sort(
              (
                first,
                second,
              ) =>
                Number(
                  second.pricing
                    ?.price ??
                    second.price ??
                    0,
                ) -
                Number(
                  first.pricing
                    ?.price ??
                    first.price ??
                    0,
                ),
            );
        }

        setProducts(
          visibleProducts,
        );
      } catch (
        requestError
      ) {
        if (!active) {
          return;
        }

        console.error(
          "Failed to load shop products:",
          requestError,
        );

        setError(
          requestError?.message ||
            "Unable to load products.",
        );

        setProducts([]);
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
    collection,
    sort,
  ]);

  const title =
    useMemo(() => {
      if (
        collection ===
        "new-arrivals"
      ) {
        return "New Arrivals";
      }

      if (
        collection ===
        "best-sellers"
      ) {
        return "Best Sellers";
      }

      if (
        collection ===
        "offers"
      ) {
        return "Offers";
      }

      return "Shop All";
    }, [collection]);

  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.container
        }
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

          <span>
            {title}
          </span>
        </nav>

        <header
          className={
            styles.header
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              Explore Our
              Collection
            </span>

            <h1
              className={
                styles.title
              }
            >
              {title}
            </h1>

            <p
              className={
                styles.description
              }
            >
              Discover jewellery
              designed to become
              part of your
              everyday moments.
            </p>
          </div>

          <span
            className={
              styles.count
            }
          >
            {products.length}{" "}
            {products.length ===
            1
              ? "item"
              : "items"}
          </span>
        </header>

        <div
          className={
            styles.toolbar
          }
        >
          <div
            className={
              styles.collections
            }
          >
            <Link
              to="/shop"
              className={
                collection ===
                "all"
                  ? styles.active
                  : ""
              }
            >
              All
            </Link>

            <Link
              to="/shop?collection=new-arrivals"
              className={
                collection ===
                "new-arrivals"
                  ? styles.active
                  : ""
              }
            >
              New Arrivals
            </Link>

            <Link
              to="/shop?collection=best-sellers"
              className={
                collection ===
                "best-sellers"
                  ? styles.active
                  : ""
              }
            >
              Best Sellers
            </Link>

            <Link
              to="/shop?collection=offers"
              className={
                collection ===
                "offers"
                  ? styles.active
                  : ""
              }
            >
              Offers
            </Link>
          </div>

          <div
            className={
              styles.sort
            }
          >
            <label
              htmlFor="sort"
            >
              Sort
            </label>

            <select
              id="sort"
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target
                    .value,
                )
              }
            >
              <option value="featured">
                Featured
              </option>

              <option value="price-low">
                Price: Low to
                High
              </option>

              <option value="price-high">
                Price: High to
                Low
              </option>

              <option value="rating">
                Top Rated
              </option>
            </select>
          </div>
        </div>

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
            {error}
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
                There are no
                products
                available in
                this collection
                right now.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div
              className={
                styles.productGrid
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

export default Shop;