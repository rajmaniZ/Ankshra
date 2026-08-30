import { useEffect, useState } from "react";

import ReviewCard from "../ReviewCard/ReviewCard";

import {
  getProductReviews,
  getAppReviews,
} from "../../../services/reviewService";

import styles from "./ReviewList.module.css";

function getReviewList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.reviews)) {
    return response.reviews;
  }

  if (Array.isArray(response?.data?.reviews)) {
    return response.data.reviews;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getPublicReviews(reviews) {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews.filter((review) => {
    if (!review) {
      return false;
    }

    if (
      review.isApproved === false ||
      review.isPublic === false
    ) {
      return false;
    }

    return true;
  });
}

function getErrorMessage(error) {
  if (!error) {
    return "Unable to load reviews.";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Unable to load reviews."
  );
}

function ReviewList({
  type = "product",
  productId = "",
  title = "Customer Reviews",
  showTitle = true,
  limit,
  refreshKey = 0,
  showEmpty = true,
  className = "",
}) {
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadReviews = async () => {
      setLoading(true);
      setError("");

      try {
        let response;

        if (type === "app") {
          response = await getAppReviews();
        } else {
          if (!productId) {
            if (mounted) {
              setReviews([]);
              setLoading(false);
            }

            return;
          }

          response =
            await getProductReviews(productId);
        }

        if (!mounted) {
          return;
        }

        const reviewList =
          getReviewList(response);

        setReviews(
          getPublicReviews(reviewList),
        );
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        console.error(
          "Failed to load reviews:",
          requestError,
        );

        setReviews([]);

        setError(
          getErrorMessage(requestError),
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      mounted = false;
    };
  }, [
    type,
    productId,
    refreshKey,
  ]);

  if (
    type !== "product" &&
    type !== "app"
  ) {
    return (
      <section
        className={`${styles.section} ${className}`}
      >
        <div className={styles.error}>
          Invalid review type.
        </div>
      </section>
    );
  }

  const visibleReviews =
    typeof limit === "number"
      ? reviews.slice(0, Math.max(0, limit))
      : reviews;

  return (
    <section
      className={`${styles.section} ${className}`}
    >
      {showTitle && (
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              Reviews
            </span>

            <h2 className={styles.title}>
              {title}
            </h2>
          </div>

          {!loading && !error && (
            <span className={styles.count}>
              {reviews.length}{" "}
              {reviews.length === 1
                ? "review"
                : "reviews"}
            </span>
          )}
        </div>
      )}

      {loading && (
        <div className={styles.state}>
          Loading reviews...
        </div>
      )}

      {!loading && error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        reviews.length === 0 &&
        showEmpty && (
          <div className={styles.empty}>
            <p>No reviews yet.</p>

            <span>
              Be the first to share your
              experience.
            </span>
          </div>
        )}

      {!loading &&
        !error &&
        visibleReviews.length > 0 && (
          <div className={styles.list}>
            {visibleReviews.map(
              (review, index) => (
                <ReviewCard
                  key={
                    review?._id ||
                    review?.id ||
                    `review-${index}`
                  }
                  review={review}
                />
              ),
            )}
          </div>
        )}
    </section>
  );
}

export default ReviewList;