import {
  Link,
} from "react-router-dom";

import {
  FiChevronRight,
  FiHeart,
  FiHome,
  FiSearch,
  FiShoppingBag,
  FiTag,
  FiUser,
  FiX,
} from "react-icons/fi";

import useCategories from "../../../hooks/useCategories";

import styles from "./MobileMenu.module.css";

function MobileMenu({
  isOpen,
  onClose,
}) {
  const {
    categories = [],
    loading,
    error,
  } = useCategories();

  if (!isOpen) {
    return null;
  }

  const availableCategories =
    Array.isArray(categories)
      ? categories.filter(
          (category) =>
            category?._id &&
            category?.slug &&
            category?.name,
        )
      : [];

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="presentation"
    >
      <aside
        className={styles.menu}
        onClick={(event) =>
          event.stopPropagation()
        }
        aria-label="Mobile navigation"
      >
        <div className={styles.header}>
          <Link
            to="/"
            className={styles.logo}
            onClick={onClose}
          >
            ankshra jewellary
          </Link>

          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close menu"
          >
            <FiX size={21} />
          </button>
        </div>

        <nav
          className={styles.navigation}
        >
          <div className={styles.section}>
            <span
              className={styles.sectionTitle}
            >
              Shop
            </span>

            <Link
              to="/shop"
              className={styles.link}
              onClick={onClose}
            >
              <FiHome size={18} />
              <span>Shop All</span>
              <FiChevronRight
                size={16}
                className={styles.arrow}
              />
            </Link>

            <Link
              to="/shop?collection=new-arrivals"
              className={styles.link}
              onClick={onClose}
            >
              <FiTag size={18} />
              <span>New Arrivals</span>
              <FiChevronRight
                size={16}
                className={styles.arrow}
              />
            </Link>

            {!loading &&
              !error &&
              availableCategories.map(
                (category) => (
                  <Link
                    key={category._id}
                    to={`/category/${category.slug}`}
                    className={
                      styles.link
                    }
                    onClick={onClose}
                  >
                    <span
                      className={
                        styles.categoryIcon
                      }
                    >
                      {category.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </span>

                    <span>
                      {category.name}
                    </span>

                    <FiChevronRight
                      size={16}
                      className={
                        styles.arrow
                      }
                    />
                  </Link>
                ),
              )}

            {loading && (
              <div
                className={
                  styles.status
                }
              >
                Loading categories...
              </div>
            )}

            {!loading &&
              error && (
                <div
                  className={
                    styles.status
                  }
                >
                  Categories unavailable
                </div>
              )}

            {!loading &&
              !error &&
              availableCategories.length ===
                0 && (
                <div
                  className={
                    styles.status
                  }
                >
                  No categories available
                </div>
              )}

            <Link
              to="/shop?collection=offers"
              className={styles.link}
              onClick={onClose}
            >
              <FiTag size={18} />
              <span>Offers</span>
              <FiChevronRight
                size={16}
                className={styles.arrow}
              />
            </Link>
          </div>

          <div
            className={
              styles.separator
            }
          />

          <div className={styles.section}>
            <span
              className={styles.sectionTitle}
            >
              Your Account
            </span>

            <Link
              to="/search"
              className={styles.link}
              onClick={onClose}
            >
              <FiSearch size={18} />
              <span>Search</span>
              <FiChevronRight
                size={16}
                className={styles.arrow}
              />
            </Link>

            <Link
              to="/account"
              className={styles.link}
              onClick={onClose}
            >
              <FiUser size={18} />
              <span>Account</span>
              <FiChevronRight
                size={16}
                className={styles.arrow}
              />
            </Link>

            <Link
              to="/wishlist"
              className={styles.link}
              onClick={onClose}
            >
              <FiHeart size={18} />
              <span>Wishlist</span>
              <FiChevronRight
                size={16}
                className={styles.arrow}
              />
            </Link>

            <Link
              to="/cart"
              className={styles.link}
              onClick={onClose}
            >
              <FiShoppingBag size={18} />
              <span>Cart</span>
              <FiChevronRight
                size={16}
                className={styles.arrow}
              />
            </Link>
          </div>
        </nav>
      </aside>
    </div>
  );
}

export default MobileMenu;