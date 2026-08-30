// import { FiStar } from "react-icons/fi";

// import styles from "./ProductRating.module.css";

// function ProductRating({
//   rating = 0,
//   reviewCount = 0,
// }) {
//   const normalizedRating = Math.min(
//     5,
//     Math.max(0, Number(rating) || 0),
//   );

//   const normalizedReviewCount = Math.max(
//     0,
//     Math.floor(Number(reviewCount) || 0),
//   );

//   if (
//     normalizedRating <= 0 ||
//     normalizedReviewCount <= 0
//   ) {
//     return null;
//   }

//   return (
//     <div className={styles.rating}>
//       <div
//         className={styles.stars}
//         aria-label={`Rated ${normalizedRating.toFixed(
//           1,
//         )} out of 5`}
//       >
//         {[1, 2, 3, 4, 5].map((star) => {
//           const filled =
//             star <= normalizedRating;

//           return (
//             <FiStar
//               key={star}
//               size={14}
//               className={
//                 filled
//                   ? styles.filled
//                   : styles.empty
//               }
//               fill={
//                 filled
//                   ? "currentColor"
//                   : "none"
//               }
//             />
//           );
//         })}
//       </div>

//       <span className={styles.value}>
//         {normalizedRating.toFixed(1)}
//       </span>

//       <span className={styles.count}>
//         ({normalizedReviewCount})
//       </span>
//     </div>
//   );
// }

// export default ProductRating;

import styles from "./ProductRating.module.css";

function ProductRating({
  rating = 0,
  reviewCount = 0,
}) {
  const numericRating = Number(rating);
  const numericCount = Number(reviewCount);

  const normalizedRating = Number.isFinite(numericRating)
    ? Math.min(5, Math.max(0, numericRating))
    : 0;

  const normalizedCount = Number.isFinite(numericCount)
    ? Math.max(0, Math.floor(numericCount))
    : 0;

  if (normalizedRating <= 0 || normalizedCount <= 0) {
    return null;
  }

  return (
    <div className={styles.rating}>
      <span
        className={styles.stars}
        aria-label={`Rated ${normalizedRating.toFixed(1)} out of 5`}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = normalizedRating >= star;

          return (
            <span
              key={star}
              className={
                filled
                  ? styles.filled
                  : styles.empty
              }
              aria-hidden="true"
            >
              ★
            </span>
          );
        })}
      </span>

      <span className={styles.average}>
        {normalizedRating.toFixed(1)}
      </span>

      <span className={styles.count}>
        ({normalizedCount})
      </span>
    </div>
  );
}

export default ProductRating;