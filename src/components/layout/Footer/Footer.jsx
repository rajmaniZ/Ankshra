import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              Jewellery Store
            </Link>

            <p className={styles.description}>
              Discover jewellery designed to complement every occasion.
            </p>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Shop</h3>

            <Link to="/shop">All Jewellery</Link>
            <Link to="/category/necklaces">Necklaces</Link>
            <Link to="/category/earrings">Earrings</Link>
            <Link to="/category/rings">Rings</Link>
            <Link to="/category/bracelets">Bracelets</Link>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Customer Care</h3>

            <Link to="/account/orders">Orders</Link>
            <Link to="/shipping-policy">Shipping</Link>
            <Link to="/refund-policy">Returns & Refunds</Link>
            <Link to="/contact">Contact Us</Link>
          </div>

          <div className={styles.column}>
            <h3 className={styles.title}>Information</h3>

            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/about">About Us</Link>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Jewellery Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;