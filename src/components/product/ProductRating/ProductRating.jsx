import styles from "./ProductRating.module.css";

function ProductRating({ rating = 0, reviewCount = 0 }) {
  const normalizedRating = Math.min(5, Math.max(0, Number(rating)));

  return (
    <div className={styles.rating}>
      <div
        className={styles.stars}
        aria-label={`Rated ${normalizedRating} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= normalizedRating ? styles.filled : styles.empty}
          >
            ★
          </span>
        ))}
      </div>

      {reviewCount > 0 && (
        <span className={styles.count}>({reviewCount})</span>
      )}
    </div>
  );
}

export default ProductRating;