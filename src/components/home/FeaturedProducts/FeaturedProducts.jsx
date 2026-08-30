import { useEffect, useState } from "react";

import ProductGrid from "../../product/ProductGrid/ProductGrid";

import { getProducts } from "../../../services/productService";

import styles from "./FeaturedProducts.module.css";

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

function FeaturedProducts() {
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    let active = true;

    async function loadFeaturedProducts() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await getProducts({
            featured: true,
            limit: 4,
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
          "Failed to load featured products:",
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

    loadFeaturedProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>
            Our Collection
          </span>

          <h2 className={styles.title}>
            Featured Jewellery
          </h2>

          <p className={styles.description}>
            Discover pieces selected to bring
            a refined touch to your style.
          </p>
        </div>

        {loading && (
          <div className={styles.message}>
            Loading featured jewellery...
          </div>
        )}

        {!loading && error && (
          <div className={styles.message}>
            Unable to load featured jewellery.
          </div>
        )}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className={styles.message}>
              No featured jewellery available
              right now.
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

export default FeaturedProducts;