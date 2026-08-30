import { Link } from "react-router-dom";
import styles from "./OfferSection.module.css";

function OfferSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>Special Offer</span>

          <h2 className={styles.title}>
            Something beautiful is waiting for you
          </h2>

          <p className={styles.description}>
            Explore selected jewellery pieces and discover special prices across
            our collection.
          </p>

          <Link to="/shop?collection=offers" className={styles.button}>
            Explore Offers
          </Link>
        </div>
      </div>
    </section>
  );
}

export default OfferSection;