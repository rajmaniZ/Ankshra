import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import {
  FiChevronDown,
} from "react-icons/fi";

import styles from "./SearchFilters.module.css";

function getCategoryValue(category) {
  return (
    category?._id ||
    category?.id ||
    ""
  );
}

function getCategoryName(category) {
  return (
    category?.name ||
    category?.title ||
    category?.slug ||
    "Unnamed Category"
  );
}

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

  showCategoryInClear = true,
}) {
  const categoryId = useId();
  const sortId = useId();

  const [
    categoryOpen,
    setCategoryOpen,
  ] = useState(false);

  const [
    sortOpen,
    setSortOpen,
  ] = useState(false);

  const categoryRef =
    useRef(null);

  const sortRef =
    useRef(null);

  const safeCategories =
    Array.isArray(categories)
      ? categories.filter(Boolean)
      : [];

  const normalizedSelectedCategory =
    String(
      selectedCategory ?? "",
    );

  const selectedCategoryObject =
    safeCategories.find(
      (category) =>
        String(
          getCategoryValue(category),
        ) ===
        normalizedSelectedCategory,
    );

  const selectedCategoryName =
    selectedCategoryObject
      ? getCategoryName(
          selectedCategoryObject,
        )
      : "All Categories";

  const sortOptions = [
    {
      value: "featured",
      label: "Featured",
    },
    {
      value: "price-low",
      label: "Price: Low to High",
    },
    {
      value: "price-high",
      label: "Price: High to Low",
    },
    {
      value: "rating",
      label: "Top Rated",
    },
  ];

  const selectedSort =
    sortOptions.find(
      (option) =>
        option.value === sort,
    ) || sortOptions[0];

  const hasCategoryFilter =
    showCategoryInClear &&
    Boolean(
      normalizedSelectedCategory,
    );

  const hasFilters =
    hasCategoryFilter ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    sort !== "featured";

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(
          event.target,
        )
      ) {
        setCategoryOpen(false);
      }

      if (
        sortRef.current &&
        !sortRef.current.contains(
          event.target,
        )
      ) {
        setSortOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key !== "Escape") {
        return;
      }

      setCategoryOpen(false);
      setSortOpen(false);
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  function handleCategorySelect(
    value,
  ) {
    setCategoryOpen(false);

    onCategoryChange?.(
      value,
    );
  }

  function handleSortSelect(value) {
    setSortOpen(false);

    onSortChange?.(
      value,
    );
  }

  function handleClear() {
    setCategoryOpen(false);
    setSortOpen(false);

    onClear?.();
  }

  return (
    <div className={styles.filters}>
      <div className={styles.field}>
        <label
          htmlFor={categoryId}
          className={styles.label}
        >
          Category
        </label>

        <div
          ref={categoryRef}
          className={styles.selectWrapper}
        >
          <button
            id={categoryId}
            type="button"
            className={`${styles.selectButton} ${
              categoryOpen
                ? styles.selectButtonOpen
                : ""
            }`}
            onClick={() => {
              setCategoryOpen(
                (current) =>
                  !current,
              );

              setSortOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={
              categoryOpen
            }
          >
            <span
              className={
                styles.selectValue
              }
            >
              {selectedCategoryName}
            </span>

            <FiChevronDown
              className={`${styles.chevron} ${
                categoryOpen
                  ? styles.chevronOpen
                  : ""
              }`}
              size={17}
              aria-hidden="true"
            />
          </button>

          {categoryOpen && (
            <div
              className={
                styles.dropdown
              }
              role="listbox"
              aria-labelledby={
                categoryId
              }
            >
              <button
                type="button"
                role="option"
                aria-selected={
                  !normalizedSelectedCategory
                }
                className={`${styles.dropdownOption} ${
                  !normalizedSelectedCategory
                    ? styles.dropdownOptionActive
                    : ""
                }`}
                onClick={() =>
                  handleCategorySelect(
                    "",
                  )
                }
              >
                All Categories
              </button>

              {safeCategories.map(
                (category) => {
                  const value =
                    getCategoryValue(
                      category,
                    );

                  if (!value) {
                    return null;
                  }

                  const valueString =
                    String(value);

                  const isSelected =
                    valueString ===
                    normalizedSelectedCategory;

                  return (
                    <button
                      key={
                        valueString
                      }
                      type="button"
                      role="option"
                      aria-selected={
                        isSelected
                      }
                      className={`${styles.dropdownOption} ${
                        isSelected
                          ? styles.dropdownOptionActive
                          : ""
                      }`}
                      onClick={() =>
                        handleCategorySelect(
                          valueString,
                        )
                      }
                    >
                      {getCategoryName(
                        category,
                      )}
                    </button>
                  );
                },
              )}

              {safeCategories.length ===
                0 && (
                <div
                  className={
                    styles.emptyOption
                  }
                >
                  No categories
                  available
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={
          styles.priceGroup
        }
      >
        <label
          className={styles.label}
        >
          Price
        </label>

        <div
          className={
            styles.priceInputs
          }
        >
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={minPrice ?? ""}
            onChange={(event) =>
              onMinPriceChange?.(
                event.target.value.replace(
                  /\D/g,
                  "",
                ),
              )
            }
            placeholder="Min"
            aria-label="Minimum price"
            autoComplete="off"
          />

          <span
            className={
              styles.priceDash
            }
            aria-hidden="true"
          >
            –
          </span>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={maxPrice ?? ""}
            onChange={(event) =>
              onMaxPriceChange?.(
                event.target.value.replace(
                  /\D/g,
                  "",
                ),
              )
            }
            placeholder="Max"
            aria-label="Maximum price"
            autoComplete="off"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label
          htmlFor={sortId}
          className={styles.label}
        >
          Sort by
        </label>

        <div
          ref={sortRef}
          className={styles.selectWrapper}
        >
          <button
            id={sortId}
            type="button"
            className={`${styles.selectButton} ${
              sortOpen
                ? styles.selectButtonOpen
                : ""
            }`}
            onClick={() => {
              setSortOpen(
                (current) =>
                  !current,
              );

              setCategoryOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={
              sortOpen
            }
          >
            <span
              className={
                styles.selectValue
              }
            >
              {selectedSort.label}
            </span>

            <FiChevronDown
              className={`${styles.chevron} ${
                sortOpen
                  ? styles.chevronOpen
                  : ""
              }`}
              size={17}
              aria-hidden="true"
            />
          </button>

          {sortOpen && (
            <div
              className={
                styles.dropdown
              }
              role="listbox"
              aria-labelledby={sortId}
            >
              {sortOptions.map(
                (option) => {
                  const isSelected =
                    option.value ===
                    sort;

                  return (
                    <button
                      key={
                        option.value
                      }
                      type="button"
                      role="option"
                      aria-selected={
                        isSelected
                      }
                      className={`${styles.dropdownOption} ${
                        isSelected
                          ? styles.dropdownOptionActive
                          : ""
                      }`}
                      onClick={() =>
                        handleSortSelect(
                          option.value,
                        )
                      }
                    >
                      {option.label}
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          className={styles.clear}
          onClick={handleClear}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default SearchFilters;