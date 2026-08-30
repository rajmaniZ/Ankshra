import styles from "./SearchFilters.module.css";

function SearchFilters({
  categories = [],
  selectedCategory = "",
  minPrice = "",
  maxPrice = "",
  sort = "featured",
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onClear,
}) {
  const hasFilters =
    selectedCategory || minPrice || maxPrice || sort !== "featured";

  return (
    <div className={styles.filters}>
      <div className={styles.field}>
        <label htmlFor="category">Category</label>

        <select
          id="category"
          value={selectedCategory}
          onChange={(event) =>
            onCategoryChange?.(event.target.value)
          }
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option
              key={category.slug || category.id}
              value={category.slug || category.id}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.priceGroup}>
        <span className={styles.priceLabel}>Price</span>

        <div className={styles.priceInputs}>
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) =>
              onMinPriceChange?.(event.target.value)
            }
            placeholder="Min"
            aria-label="Minimum price"
          />

          <span>–</span>

          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) =>
              onMaxPriceChange?.(event.target.value)
            }
            placeholder="Max"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="search-sort">Sort by</label>

        <select
          id="search-sort"
          value={sort}
          onChange={(event) =>
            onSortChange?.(event.target.value)
          }
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          className={styles.clear}
          onClick={onClear}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default SearchFilters;