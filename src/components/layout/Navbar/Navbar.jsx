import {
  NavLink,
  useLocation,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiChevronDown,
} from "react-icons/fi";

import useCategories from "../../../hooks/useCategories";

import styles from "./Navbar.module.css";

const VISIBLE_CATEGORY_COUNT = 4;

function Navbar() {
  const {
    categories = [],
    loading,
    error,
  } = useCategories();

  const [
    isMoreOpen,
    setIsMoreOpen,
  ] = useState(false);

  const moreRef = useRef(null);

  const location = useLocation();

  const availableCategories =
    Array.isArray(categories)
      ? categories.filter(
          (category) =>
            category?._id ||
            category?.id,
        )
      : [];

  const visibleCategories =
    availableCategories.slice(
      0,
      VISIBLE_CATEGORY_COUNT,
    );

  const moreCategories =
    availableCategories.slice(
      VISIBLE_CATEGORY_COUNT,
    );

  const searchParams =
    new URLSearchParams(
      location.search,
    );

  const collection =
    searchParams.get("collection");

  const isNewArrivalsActive =
    location.pathname === "/shop" &&
    collection === "new-arrivals";

  const isOffersActive =
    location.pathname === "/shop" &&
    collection === "offers";

  useEffect(() => {
    const handleOutsideClick = (
      event,
    ) => {
      if (
        moreRef.current &&
        !moreRef.current.contains(
          event.target,
        )
      ) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname, location.search]);

  const handleMoreToggle = () => {
    setIsMoreOpen(
      (current) => !current,
    );
  };

  const getCategoryClassName = ({
    isActive,
  }) => {
    return `${styles.link} ${
      isActive
        ? styles.active
        : ""
    }`;
  };

  return (
    <nav
      className={styles.navbar}
      aria-label="Main navigation"
    >
      <div className={styles.container}>
        <div className={styles.links}>
          <NavLink
            to="/shop?collection=new-arrivals"
            className={() =>
              `${styles.link} ${
                isNewArrivalsActive
                  ? styles.active
                  : ""
              }`
            }
          >
            New Arrivals
          </NavLink>

          {loading && (
            <span className={styles.status}>
              Loading...
            </span>
          )}

          {!loading &&
            !error &&
            visibleCategories.map(
              (category) => {
                const id =
                  category?._id ||
                  category?.id;

                const slug =
                  category?.slug;

                const name =
                  category?.name;

                if (
                  !id ||
                  !slug ||
                  !name
                ) {
                  return null;
                }

                return (
                  <NavLink
                    key={id}
                    to={`/category/${slug}`}
                    className={
                      getCategoryClassName
                    }
                  >
                    {name}
                  </NavLink>
                );
              },
            )}

          {!loading &&
            !error &&
            moreCategories.length >
              0 && (
              <div
                className={
                  styles.moreWrapper
                }
                ref={moreRef}
              >
                <button
                  type="button"
                  className={
                    styles.moreButton
                  }
                  onClick={
                    handleMoreToggle
                  }
                  aria-expanded={
                    isMoreOpen
                  }
                  aria-haspopup="menu"
                >
                  <span>
                    More
                  </span>

                  <FiChevronDown
                    size={15}
                    className={
                      isMoreOpen
                        ? styles.chevronOpen
                        : ""
                    }
                  />
                </button>

                {isMoreOpen && (
                  <div
                    className={
                      styles.dropdown
                    }
                    role="menu"
                  >
                    {moreCategories.map(
                      (category) => {
                        const id =
                          category?._id ||
                          category?.id;

                        const slug =
                          category?.slug;

                        const name =
                          category?.name;

                        if (
                          !id ||
                          !slug ||
                          !name
                        ) {
                          return null;
                        }

                        return (
                          <NavLink
                            key={id}
                            to={`/category/${slug}`}
                            className={
                              styles.dropdownLink
                            }
                            role="menuitem"
                            onClick={() =>
                              setIsMoreOpen(
                                false,
                              )
                            }
                          >
                            {name}
                          </NavLink>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            )}

          {!loading &&
            error && (
              <span
                className={styles.status}
              >
                Categories unavailable
              </span>
            )}

          <NavLink
            to="/shop?collection=offers"
            className={() =>
              `${styles.link} ${
                isOffersActive
                  ? styles.active
                  : ""
              }`
            }
          >
            Offers
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;