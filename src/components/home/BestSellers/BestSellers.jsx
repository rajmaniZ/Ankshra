import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import ProductGrid from "../../product/ProductGrid/ProductGrid";

import { getProducts } from "../../../services/productService";

import styles from "./BestSellers.module.css";

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  const image =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.thumbnail ||
    product.image ||
    "";

  return {
    ...product,

    id:
      product._id ||
      product.id ||
      "",

    image,

    images: Array.isArray(product.images)
      ? product.images
      : image
        ? [image]
        : [],

    category:
      product.category?.name ||
      product.category ||
      "",

    rating:
      product.rating?.average ??
      product.rating ??
      0,

    reviewCount:
      product.rating?.count ??
      product.reviewCount ??
      0,

    compareAtPrice:
      product.compareAtPrice ?? null,

    isNew:
      Boolean(product.isNewArrival),
  };
}

function BestSellers() {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    let active = true;

    async function loadBestSellers() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await getProducts({
            bestSeller: true,
            limit: 4,
            sort: "rating",
          });

        const data =
          response?.data?.products || [];

        if (!active) {
          return;
        }

        setProducts(
          Array.isArray(data)
            ? data
                .map(normalizeProduct)
                .filter(Boolean)
            : [],
        );
      } catch (requestError) {
        console.error(
          "Failed to load best sellers:",
          requestError,
        );

        if (active) {
          setProducts([]);
          setError(requestError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBestSellers();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              Customer Favourites
            </span>

            <h2 className={styles.title}>
              Best Sellers
            </h2>
          </div>

          <Link
            to="/shop?collection=best-sellers"
            className={styles.link}
          >
            View All
          </Link>
        </div>

        {loading && (
          <div className={styles.message}>
            Loading best sellers...
          </div>
        )}

        {!loading && error && (
          <div className={styles.message}>
            Unable to load best sellers.
          </div>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className={styles.message}>
              No best sellers available right
              now.
            </div>
          )}

        {!loading &&
          !error &&
          products.length > 0 && (
            <ProductGrid
              products={products}
            />
          )}
      </div>
    </section>
  );
}

export default BestSellers;