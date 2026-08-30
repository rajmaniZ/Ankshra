import styles from "./RatingStars.module.css";

function RatingStars({
  value = 0,
  onChange,
  size = "medium",
  readOnly = false,
}) {
  const rating = Math.min(5, Math.max(0, Number(value)));

  const handleChange = (nextValue) => {
    if (!readOnly && onChange) {
      onChange(nextValue);
    }
  };

  return (
    <div
      className={`${styles.stars} ${styles[size]}`}
      role={readOnly ? undefined : "radiogroup"}
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= rating ? styles.filled : styles.empty}
          onClick={() => handleChange(star)}
          disabled={readOnly}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default RatingStars;