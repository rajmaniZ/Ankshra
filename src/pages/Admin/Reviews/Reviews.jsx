import {
  useEffect,
  useState,
} from "react";

import {
  FiCheck,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  deleteAdminReview,
  getAdminReviews,
  updateAdminReviewStatus,
} from "../../../services/adminService";

import styles from "./Reviews.module.css";

function getReviewsFromResponse(response) {
  return (
    response?.data?.reviews ||
    response?.reviews ||
    response?.data ||
    []
  );
}

function getErrorMessage(error) {
  return (
    error?.message ||
    "Unable to load reviews."
  );
}

function getProductName(review) {
  if (
    typeof review.product ===
    "string"
  ) {
    return review.product;
  }

  return (
    review.product?.name ||
    "Product"
  );
}

function getUserName(review) {
  if (
    typeof review.user ===
    "string"
  ) {
    return review.user;
  }

  return (
    review.user?.name ||
    review.name ||
    "Customer"
  );
}

function Reviews() {
  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    actionId,
    setActionId,
  ] = useState("");

  const loadReviews =
    async ({
      silent = false,
    } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminReviews();

        setReviews(
          getReviewsFromResponse(
            response,
          ),
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    loadReviews();

    return undefined;
  }, []);

  const handleStatus =
    async (review) => {
      try {
        setActionId(review._id);
        setError("");

        const response =
          await updateAdminReviewStatus(
            review._id,
            !review.isApproved,
          );

        const updatedReview =
          response?.data?.review ||
          response?.review;

        setReviews(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                review._id
                  ? updatedReview ||
                    {
                      ...item,
                      isApproved:
                        !item.isApproved,
                    }
                  : item,
            ),
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setActionId("");
      }
    };

  const handleDelete =
    async (review) => {
      const confirmed =
        window.confirm(
          "Delete this review?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(review._id);
        setError("");

        await deleteAdminReview(
          review._id,
        );

        setReviews(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                review._id,
            ),
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setActionId("");
      }
    };

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.state}>
          Loading reviews...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            Administration
          </span>

          <h1 className={styles.title}>
            Reviews
          </h1>

          <p className={styles.subtitle}>
            Review customer feedback
            and manage approval status.
          </p>
        </div>

        <button
          type="button"
          className={styles.refresh}
          onClick={() =>
            loadReviews({
              silent: true,
            })
          }
          disabled={refreshing}
        >
          <FiRefreshCw size={16} />
          {refreshing
            ? "Refreshing"
            : "Refresh"}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.card}>
        {reviews.length === 0 ? (
          <div className={styles.empty}>
            No reviews found.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {reviews.map(
                  (review) => (
                    <tr
                      key={
                        review._id
                      }
                    >
                      <td>
                        <strong>
                          {getUserName(
                            review,
                          )}
                        </strong>

                        {review.user?.email && (
                          <span
                            className={
                              styles.secondary
                            }
                          >
                            {
                              review.user
                                .email
                            }
                          </span>
                        )}
                      </td>

                      <td>
                        {getProductName(
                          review,
                        )}
                      </td>

                      <td>
                        <span
                          className={
                            styles.rating
                          }
                        >
                          {review.rating ??
                            0}
                          /5
                        </span>
                      </td>

                      <td>
                        <p
                          className={
                            styles.comment
                          }
                        >
                          {review.comment ||
                            review.review ||
                            "—"}
                        </p>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            review.isApproved
                              ? styles.approved
                              : styles.pending
                          }
                          onClick={() =>
                            handleStatus(
                              review,
                            )
                          }
                          disabled={
                            actionId ===
                            review._id
                          }
                        >
                          {review.isApproved
                            ? "Approved"
                            : "Pending"}
                        </button>
                      </td>

                      <td>
                        {review.createdAt
                          ? new Date(
                              review.createdAt,
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>
                        <div
                          className={
                            styles.actions
                          }
                        >
                          <button
                            type="button"
                            title={
                              review.isApproved
                                ? "Reject review"
                                : "Approve review"
                            }
                            className={
                              styles.iconButton
                            }
                            onClick={() =>
                              handleStatus(
                                review,
                              )
                            }
                            disabled={
                              actionId ===
                              review._id
                            }
                          >
                            {review.isApproved ? (
                              <FiX
                                size={15}
                              />
                            ) : (
                              <FiCheck
                                size={15}
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            title="Delete review"
                            className={`${styles.iconButton} ${styles.delete}`}
                            onClick={() =>
                              handleDelete(
                                review,
                              )
                            }
                            disabled={
                              actionId ===
                              review._id
                            }
                          >
                            <FiTrash2
                              size={15}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Reviews;