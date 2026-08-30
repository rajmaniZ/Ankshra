import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";

import MobileMenu from "../MobileMenu/MobileMenu";
import Navbar from "../Navbar/Navbar";

import styles from "./Header.module.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.topBar}>
          <div className={styles.container}>
            <p className={styles.message}>
              Discover jewellery made for every occasion
            </p>
          </div>
        </div>

        <div className={styles.mainHeader}>
          <div className={styles.container}>
            <div className={styles.content}>
              <button
                type="button"
                className={styles.menuButton}
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
              >
                <FiMenu size={21} />
              </button>

              <Link
                to="/"
                className={styles.logo}
                aria-label="Jewellery Store home"
              >
                Jewellery Store
              </Link>

              <div className={styles.actions}>
                <Link
                  to="/search"
                  className={styles.action}
                >
                  <FiSearch size={18} />
                  <span>Search</span>
                </Link>

                <Link
                  to="/account"
                  className={styles.action}
                >
                  <FiUser size={18} />
                  <span>Account</span>
                </Link>

                <Link
                  to="/wishlist"
                  className={styles.action}
                >
                  <FiHeart size={18} />
                  <span>Wishlist</span>
                </Link>

                <Link
                  to="/cart"
                  className={styles.action}
                >
                  <FiShoppingBag size={18} />
                  <span>Cart</span>
                </Link>
              </div>

              <div className={styles.mobileActions}>
                <Link
                  to="/search"
                  className={styles.mobileAction}
                  aria-label="Search"
                >
                  <FiSearch size={20} />
                </Link>

                <Link
                  to="/cart"
                  className={styles.mobileAction}
                  aria-label="Cart"
                >
                  <FiShoppingBag size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.desktopNavigation}>
          <Navbar />
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}

export default Header;