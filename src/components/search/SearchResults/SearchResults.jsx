import ProductGrid from "../../product/ProductGrid/ProductGrid";
import styles from "./SearchResults.module.css";

function SearchResults({ products = [], query = "" }) {
  return (
    <section className={styles.results}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {query ? `Results for "${query}"` : "Search Results"}
        </h2>

        <span className={styles.count}>
          {products.length}{" "}
          {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      <ProductGrid products={products} />
    </section>
  );
}

export default SearchResults;