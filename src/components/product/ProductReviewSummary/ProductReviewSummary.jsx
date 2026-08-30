import {
  FiStar,
} from "react-icons/fi";

import ReviewCard from "../../review/ReviewCard/ReviewCard";

import styles from "./ProductReviewSummary.module.css";

function getRating(review) {
  const value =
    Number(review?.rating);

  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(1, value),
  );
}

function getAverageRating(reviews) {
  if (!reviews.length) {
    return 0;
  }

  const total =
    reviews.reduce(
      (sum, review) =>
        sum + getRating(review),
      0,
    );

  return total / reviews.length;
}

function getRatingDistribution(
  reviews,
) {
  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((review) => {
    const rating =
      Math.round(
        getRating(review),
      );

    if (
      rating >= 1 &&
      rating <= 5
    ) {
      distribution[rating] += 1;
    }
  });

  return distribution;
}

function RatingStars({
  rating,
}) {
  return (
    <div
      className={styles.stars}
      aria-label={`${rating.toFixed(
        1,
      )} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => {
          const filled =
            star <= rating;

          return (
            <FiStar
              key={star}
              size={18}
              className={
                filled
                  ? styles.starFilled
                  : styles.starEmpty
              }
              fill={
                filled
                  ? "currentColor"
                  : "none"
              }
            />
          );
        },
      )}
    </div>
  );
}

function ProductReviewSummary({
  reviews = [],
}) {
  if (!Array.isArray(reviews)) {
    return null;
  }

  const validReviews =
    reviews.filter(
      (review) =>
        getRating(review) > 0,
    );

  if (!validReviews.length) {
    return null;
  }

  const average =
    getAverageRating(
      validReviews,
    );

  const distribution =
    getRatingDistribution(
      validReviews,
    );

  return (
    <div
      className={
        styles.container
      }
    >
      <div
        className={
          styles.summary
        }
      >
        <div
          className={
            styles.overall
          }
        >
          <span
            className={
              styles.overallLabel
            }
          >
            Overall rating
          </span>

          <strong
            className={
              styles.average
            }
          >
            {average.toFixed(1)}
          </strong>

          <RatingStars
            rating={average}
          />

          <span
            className={
              styles.total
            }
          >
            Based on{" "}
            {validReviews.length}{" "}
            {validReviews.length ===
            1
              ? "review"
              : "reviews"}
          </span>
        </div>

        <div
          className={
            styles.distribution
          }
        >
          {[5, 4, 3, 2, 1].map(
            (rating) => {
              const count =
                distribution[
                  rating
                ];

              const percentage =
                validReviews.length >
                0
                  ? Math.round(
                      (count /
                        validReviews.length) *
                        100,
                    )
                  : 0;

              return (
                <div
                  key={rating}
                  className={
                    styles.ratingRow
                  }
                >
                  <span
                    className={
                      styles.ratingNumber
                    }
                  >
                    {rating}
                  </span>

                  <FiStar
                    size={13}
                    className={
                      styles.rowStar
                    }
                    fill="currentColor"
                  />

                  <div
                    className={
                      styles.progress
                    }
                  >
                    <span
                      className={
                        styles.progressValue
                      }
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <span
                    className={
                      styles.ratingCount
                    }
                  >
                    {count}
                  </span>
                </div>
              );
            },
          )}
        </div>
      </div>

      <div
        className={
          styles.reviewHeading
        }
      >
        <div>
          <span
            className={
              styles.reviewEyebrow
            }
          >
            Customer reviews
          </span>

          <h3>
            What customers say
          </h3>
        </div>

        <span
          className={
            styles.reviewCount
          }
        >
          {validReviews.length}{" "}
          {validReviews.length ===
          1
            ? "review"
            : "reviews"}
        </span>
      </div>

      <div
        className={
          styles.reviewList
        }
      >
        {validReviews.map(
          (review, index) => (
            <ReviewCard
              key={
                review?._id ||
                review?.id ||
                `product-review-${index}`
              }
              review={review}
            />
          ),
        )}
      </div>
    </div>
  );
}

export default ProductReviewSummary;