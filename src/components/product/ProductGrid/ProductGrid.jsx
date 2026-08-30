import ProductCard from "../ProductCard/ProductCard";
import styles from "./ProductGrid.module.css";

function ProductGrid({ products = [] }) {
  if (!products.length) {
    return null;
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard
          key={product.id || product._id}
          product={product}
        />
      ))}
    </div>
  );
}

export default ProductGrid;