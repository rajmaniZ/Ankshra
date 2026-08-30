import ProductCard from "../ProductCard/ProductCard";

import styles from "./ProductGrid.module.css";

function getProductId(product) {
  return (
    product?._id ||
    product?.id ||
    ""
  );
}

function ProductGrid({
  products = [],
}) {
  if (!Array.isArray(products)) {
    return null;
  }

  const validProducts =
    products.filter(
      (product) =>
        Boolean(
          getProductId(product),
        ),
    );

  if (!validProducts.length) {
    return null;
  }

  return (
    <div className={styles.grid}>
      {validProducts.map(
        (product) => (
          <ProductCard
            key={getProductId(
              product,
            )}
            product={product}
          />
        ),
      )}
    </div>
  );
}

export default ProductGrid;