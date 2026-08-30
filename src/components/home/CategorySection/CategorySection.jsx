import { useEffect, useState } from "react";

import CategoryGrid from "../../category/CategoryGrid/CategoryGrid";

import { getCategories } from "../../../services/categoryService";

import styles from "./CategorySection.module.css";

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

function CategorySection() {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await getCategories();

        const data =
          getCategoriesFromResponse(
            response,
          );

        if (!active) {
          return;
        }

        setCategories(
          data.slice(0, 4),
        );
      } catch (requestError) {
        console.error(
          "Failed to load categories:",
          requestError,
        );

        if (active) {
          setCategories([]);
          setError(requestError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>
            Explore
          </span>

          <h2 className={styles.title}>
            Shop by Category
          </h2>

          <p className={styles.description}>
            Find jewellery that fits your
            style and every occasion.
          </p>
        </div>

        {loading && (
          <div className={styles.message}>
            Loading categories...
          </div>
        )}

        {!loading && error && (
          <div className={styles.message}>
            Unable to load categories.
          </div>
        )}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <div className={styles.message}>
              No categories available right
              now.
            </div>
          )}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <CategoryGrid
              categories={categories}
            />
          )}
      </div>
    </section>
  );
}

export default CategorySection;