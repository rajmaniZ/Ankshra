import ProductGrid from "../ProductGrid/ProductGrid";

import styles from "./RelatedProducts.module.css";

function RelatedProducts({
  products = [],
}) {
  if (
    !Array.isArray(products) ||
    products.length === 0
  ) {
    return null;
  }

  return (
    <section
      className={styles.section}
    >
      <div className={styles.heading}>
        <span
          className={styles.eyebrow}
        >
          You May Also Like
        </span>

        <h2 className={styles.title}>
          Related Products
        </h2>
      </div>

      <ProductGrid
        products={products}
      />
    </section>
  );
}

export default RelatedProducts;