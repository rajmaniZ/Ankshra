import { Link } from "react-router-dom";
import styles from "./HeroSection.module.css";

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrapper}>
        <div className={styles.imagePlaceholder} />
      </div>

      <div className={styles.content}>
        <span className={styles.eyebrow}>New Collection</span>

        <h1 className={styles.title}>
          Jewellery that completes your look
        </h1>

        <p className={styles.description}>
          Discover elegant fashion jewellery designed for everyday moments,
          celebrations, and everything in between.
        </p>

        <div className={styles.actions}>
          <Link to="/shop" className={styles.primaryButton}>
            Shop Collection
          </Link>

          <Link
            to="/shop?collection=new-arrivals"
            className={styles.secondaryButton}
          >
            New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;