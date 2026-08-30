import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiFilter,
  FiImage,
  FiMessageSquare,
  FiRefreshCw,
  FiSearch,
  FiStar,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  deleteAdminReview,
  getAdminReviewById,
  getAdminReviews,
  updateAdminReviewReply,
  updateAdminReviewStatus,
  updateAdminReviewVisibility,
} from "../../../services/adminService";

import styles from "./Reviews.module.css";

const PAGE_SIZE = 20;

function getReviewsFromResponse(
  response,
) {
  return (
    response?.data?.reviews ||
    response?.reviews ||
    []
  );
}

function getPaginationFromResponse(
  response,
) {
  return (
    response?.data?.pagination ||
    response?.pagination ||
    {}
  );
}

function getRatingSummaryFromResponse(
  response,
) {
  return (
    response?.data?.ratingSummary ||
    response?.ratingSummary ||
    {}
  );
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function getId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value._id ||
        value.id ||
        "",
    );
  }

  return String(value);
}

function getUserName(review) {
  if (
    review?.user &&
    typeof review.user ===
      "object"
  ) {
    return (
      review.user.name ||
      "Customer"
    );
  }

  return (
    review?.name ||
    "Customer"
  );
}

function getUserEmail(review) {
  if (
    review?.user &&
    typeof review.user ===
      "object"
  ) {
    return review.user.email || "";
  }

  return "";
}

function getProductName(review) {
  if (
    review?.product &&
    typeof review.product ===
      "object"
  ) {
    return (
      review.product.name ||
      "Product"
    );
  }

  return "";
}

function getOrderNumber(review) {
  if (
    review?.order &&
    typeof review.order ===
      "object"
  ) {
    return (
      review.order.orderNumber ||
      getId(review.order)
    );
  }

  return (
    review?.order || ""
  );
}

function getOrderStatus(review) {
  if (
    review?.order &&
    typeof review.order ===
      "object"
  ) {
    return (
      review.order.orderStatus ||
      review.order.status ||
      ""
    );
  }

  return "";
}

function getReviewType(review) {
  return review?.reviewType ===
    "app"
    ? "App"
    : "Product";
}

function getInitials(name) {
  const value = String(
    name || "Customer",
  ).trim();

  if (!value) {
    return "C";
  }

  const parts =
    value.split(/\s+/);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (
    typeof image ===
    "string"
  ) {
    return image;
  }

  return (
    image.url ||
    image.secure_url ||
    image.src ||
    ""
  );
}

function getRating(value) {
  const rating =
    Number(value);

  if (
    !Number.isFinite(
      rating,
    )
  ) {
    return 0;
  }

  return Math.min(
    5,
    Math.max(
      0,
      rating,
    ),
  );
}

function RatingStars({
  rating = 0,
  large = false,
}) {
  const value =
    getRating(rating);

  return (
    <div
      className={
        large
          ? styles.starsLarge
          : styles.stars
      }
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(
        (star) => {
          const active =
            star <= value;

          return (
            <FiStar
              key={star}
              size={
                large
                  ? 20
                  : 14
              }
              className={
                active
                  ? styles.starActive
                  : styles.starEmpty
              }
              fill={
                active
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

function getStatusLabel(review) {
  return review?.isApproved
    ? "Approved"
    : "Pending";
}

function getVisibilityLabel(
  review,
) {
  return review?.isApproved &&
    review?.isPublic
    ? "Public"
    : "Private";
}

function Reviews() {
  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pages: 0,
  });

  const [
    ratingSummary,
    setRatingSummary,
  ] = useState({
    app: {
      average: 0,
      count: 0,
    },
    product: {
      average: 0,
      count: 0,
    },
  });

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
    notice,
    setNotice,
  ] = useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    reviewType,
    setReviewType,
  ] = useState("");

  const [
    approvalFilter,
    setApprovalFilter,
  ] = useState("");

  const [
    visibilityFilter,
    setVisibilityFilter,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    actionId,
    setActionId,
  ] = useState("");

  const [
    selectedReview,
    setSelectedReview,
  ] = useState(null);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    detailError,
    setDetailError,
  ] = useState("");

  const [
    reply,
    setReply,
  ] = useState("");

  const [
    replyPublic,
    setReplyPublic,
  ] = useState(true);

  const [
    replySaving,
    setReplySaving,
  ] = useState(false);

  const loadReviews =
    async ({
      silent = false,
      requestedPage = page,
    } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminReviews({
            page:
              requestedPage,
            limit: PAGE_SIZE,
            search,
            reviewType,
            isApproved:
              approvalFilter,
            isPublic:
              visibilityFilter,
          });

        const nextReviews =
          getReviewsFromResponse(
            response,
          );

        const nextPagination =
          getPaginationFromResponse(
            response,
          );

        const nextSummary =
          getRatingSummaryFromResponse(
            response,
          );

        setReviews(
          Array.isArray(
            nextReviews,
          )
            ? nextReviews
            : [],
        );

        setPagination({
          page:
            Number(
              nextPagination.page,
            ) ||
            requestedPage,
          limit:
            Number(
              nextPagination.limit,
            ) ||
            PAGE_SIZE,
          total:
            Number(
              nextPagination.total,
            ) || 0,
          pages:
            Number(
              nextPagination.pages,
            ) || 0,
        });

        setRatingSummary({
          app: {
            average:
              Number(
                nextSummary
                  ?.app
                  ?.average,
              ) || 0,
            count:
              Number(
                nextSummary
                  ?.app
                  ?.count,
              ) || 0,
          },
          product: {
            average:
              Number(
                nextSummary
                  ?.product
                  ?.average,
              ) || 0,
            count:
              Number(
                nextSummary
                  ?.product
                  ?.count,
              ) || 0,
          },
        });
      } catch (
        requestError
      ) {
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
    loadReviews({
      requestedPage: page,
    });
  }, [
    page,
    search,
    reviewType,
    approvalFilter,
    visibilityFilter,
  ]);

  const stats =
    useMemo(() => {
      const pending =
        reviews.filter(
          (review) =>
            !review.isApproved,
        ).length;

      const approved =
        reviews.filter(
          (review) =>
            Boolean(
              review.isApproved,
            ),
        ).length;

      const publicCount =
        reviews.filter(
          (review) =>
            Boolean(
              review.isApproved &&
                review.isPublic,
            ),
        ).length;

      return {
        total:
          Number(
            pagination.total,
          ) || 0,
        pending,
        approved,
        publicCount,
      };
    }, [
      reviews,
      pagination.total,
    ]);

  const totalPages =
    Number(
      pagination.pages,
    ) || 0;

  const canGoPrevious =
    page > 1;

  const canGoNext =
    totalPages > 0 &&
    page < totalPages;

  const handleSearchSubmit =
    (event) => {
      event.preventDefault();

      setPage(1);
      setSearch(
        searchInput.trim(),
      );
    };

  const handleClearFilters =
    () => {
      setSearchInput("");
      setSearch("");
      setReviewType("");
      setApprovalFilter("");
      setVisibilityFilter("");
      setPage(1);
    };

  const updateReviewInList =
    (updatedReview) => {
      if (
        !updatedReview?._id
      ) {
        return;
      }

      setReviews(
        (current) =>
          current.map(
            (review) =>
              review._id ===
              updatedReview._id
                ? updatedReview
                : review,
          ),
      );

      setSelectedReview(
        (current) =>
          current?._id ===
          updatedReview._id
            ? updatedReview
            : current,
      );
    };

  const openReview =
    async (review) => {
      if (!review?._id) {
        return;
      }

      setSelectedReview(
        review,
      );

      setReply(
        review?.adminReply
          ?.message || "",
      );

      setReplyPublic(
        review?.adminReply
          ?.isPublic !== false,
      );

      setDetailError("");
      setDetailLoading(true);

      try {
        const response =
          await getAdminReviewById(
            review._id,
          );

        const detail =
          response?.data?.review ||
          response?.review;

        if (detail) {
          setSelectedReview(
            detail,
          );

          setReply(
            detail?.adminReply
              ?.message || "",
          );

          setReplyPublic(
            detail?.adminReply
              ?.isPublic !== false,
          );

          updateReviewInList(
            detail,
          );
        }
      } catch (
        requestError
      ) {
        setDetailError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setDetailLoading(false);
      }
    };

  const closeReview =
    () => {
      if (
        actionId ||
        replySaving
      ) {
        return;
      }

      setSelectedReview(null);
      setDetailError("");
      setReply("");
    };

  const handleStatus =
    async (review) => {
      if (!review?._id) {
        return;
      }

      const nextApproved =
        !Boolean(
          review.isApproved,
        );

      const action =
        nextApproved
          ? "approve"
          : "reject";

      const confirmed =
        window.confirm(
          `Are you sure you want to ${action} this review?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(
          review._id,
        );
        setError("");
        setNotice("");

        const response =
          await updateAdminReviewStatus(
            review._id,
            nextApproved,
          );

        const updatedReview =
          response?.data?.review ||
          response?.review;

        if (updatedReview) {
          updateReviewInList(
            updatedReview,
          );
        }

        setNotice(
          nextApproved
            ? "Review approved successfully."
            : "Review rejected and made private.",
        );
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setActionId("");
      }
    };

  const handleVisibility =
    async (review) => {
      if (
        !review?._id ||
        !review.isApproved
      ) {
        return;
      }

      const nextPublic =
        !Boolean(
          review.isPublic,
        );

      try {
        setActionId(
          review._id,
        );
        setError("");
        setNotice("");

        const response =
          await updateAdminReviewVisibility(
            review._id,
            nextPublic,
          );

        const updatedReview =
          response?.data?.review ||
          response?.review;

        if (updatedReview) {
          updateReviewInList(
            updatedReview,
          );
        }

        setNotice(
          nextPublic
            ? "Review is now public."
            : "Review is now private.",
        );
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setActionId("");
      }
    };

  const handleReply =
    async (event) => {
      event.preventDefault();

      if (
        !selectedReview?._id
      ) {
        return;
      }

      const message =
        reply.trim();

      if (!message) {
        setDetailError(
          "Enter a reply before saving.",
        );
        return;
      }

      try {
        setReplySaving(true);
        setDetailError("");
        setError("");
        setNotice("");

        const response =
          await updateAdminReviewReply(
            selectedReview._id,
            message,
            replyPublic,
          );

        const updatedReview =
          response?.data?.review ||
          response?.review;

        if (updatedReview) {
          updateReviewInList(
            updatedReview,
          );

          setSelectedReview(
            updatedReview,
          );
        }

        setNotice(
          replyPublic
            ? "Public reply saved successfully."
            : "Private reply saved successfully.",
        );
      } catch (
        requestError
      ) {
        setDetailError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setReplySaving(false);
      }
    };

  const handleDelete =
    async (review) => {
      if (!review?._id) {
        return;
      }

      const confirmed =
        window.confirm(
          "Delete this review permanently? This action cannot be undone.",
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(
          review._id,
        );
        setError("");
        setNotice("");

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

        if (
          selectedReview?._id ===
          review._id
        ) {
          setSelectedReview(
            null,
          );
        }

        setNotice(
          "Review deleted successfully.",
        );

        await loadReviews({
          silent: true,
          requestedPage:
            page,
        });
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setActionId("");
      }
    };

  const handleRefresh =
    async () => {
      await loadReviews({
        silent: true,
        requestedPage:
          page,
      });
    };

  return (
    <section
      className={styles.page}
    >
      <div
        className={
          styles.heading
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Customer feedback
          </span>

          <h1
            className={
              styles.title
            }
          >
            Reviews
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            Review, moderate and
            publish customer
            feedback across
            products and the
            store experience.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.refreshButton
          }
          onClick={
            handleRefresh
          }
          disabled={
            loading ||
            refreshing
          }
        >
          <FiRefreshCw
            size={15}
            className={
              refreshing
                ? styles.spinning
                : ""
            }
          />

          {refreshing
            ? "Refreshing"
            : "Refresh"}
        </button>
      </div>

      <div
        className={
          styles.ratingOverview
        }
      >
        <div
          className={
            styles.ratingOverviewMain
          }
        >
          <span
            className={
              styles.cardLabel
            }
          >
            Public customer rating
          </span>

          <div
            className={
              styles.overallRating
            }
          >
            <strong>
              {(
                (
                  ratingSummary
                    .app
                    .average *
                    ratingSummary
                      .app
                      .count +
                  ratingSummary
                    .product
                    .average *
                    ratingSummary
                      .product
                      .count
                ) /
                  Math.max(
                    1,
                    ratingSummary
                      .app
                      .count +
                      ratingSummary
                        .product
                        .count,
                  )
              ).toFixed(1)}
            </strong>

            <RatingStars
              rating={
                (
                  (
                    ratingSummary
                      .app
                      .average *
                      ratingSummary
                        .app
                        .count +
                    ratingSummary
                      .product
                      .average *
                      ratingSummary
                        .product
                        .count
                  ) /
                    Math.max(
                      1,
                      ratingSummary
                        .app
                        .count +
                        ratingSummary
                          .product
                          .count,
                    )
                )}
              large
            />
          </div>

          <span
            className={
              styles.ratingHint
            }
          >
            Approved and public
            reviews only
          </span>
        </div>

        <div
          className={
            styles.ratingType
          }
        >
          <span
            className={
              styles.cardLabel
            }
          >
            App rating
          </span>

          <strong>
            {ratingSummary.app.average.toFixed(
              1,
            )}
          </strong>

          <RatingStars
            rating={
              ratingSummary.app
                .average
            }
          />

          <span>
            {ratingSummary.app.count}{" "}
            review
            {ratingSummary.app
              .count === 1
              ? ""
              : "s"}
          </span>
        </div>

        <div
          className={
            styles.ratingType
          }
        >
          <span
            className={
              styles.cardLabel
            }
          >
            Product rating
          </span>

          <strong>
            {ratingSummary.product.average.toFixed(
              1,
            )}
          </strong>

          <RatingStars
            rating={
              ratingSummary
                .product
                .average
            }
          />

          <span>
            {ratingSummary.product.count}{" "}
            review
            {ratingSummary.product
              .count === 1
              ? ""
              : "s"}
          </span>
        </div>
      </div>

      <div
        className={
          styles.stats
        }
      >
        <div
          className={
            styles.statCard
          }
        >
          <span>
            All reviews
          </span>
          <strong>
            {stats.total}
          </strong>
        </div>

        <div
          className={
            styles.statCard
          }
        >
          <span>
            Pending on page
          </span>
          <strong>
            {stats.pending}
          </strong>
        </div>

        <div
          className={
            styles.statCard
          }
        >
          <span>
            Approved on page
          </span>
          <strong>
            {stats.approved}
          </strong>
        </div>

        <div
          className={
            styles.statCard
          }
        >
          <span>
            Public on page
          </span>
          <strong>
            {stats.publicCount}
          </strong>
        </div>
      </div>

      <div
        className={
          styles.toolbar
        }
      >
        <form
          className={
            styles.searchForm
          }
          onSubmit={
            handleSearchSubmit
          }
        >
          <FiSearch
            size={16}
          />

          <input
            type="search"
            value={
              searchInput
            }
            onChange={(
              event,
            ) =>
              setSearchInput(
                event.target
                  .value,
              )
            }
            placeholder="Search review title or comment"
            aria-label="Search reviews"
          />

          <button
            type="submit"
          >
            Search
          </button>
        </form>

        <div
          className={
            styles.filterGroup
          }
        >
          <div
            className={
              styles.filterLabel
            }
          >
            <FiFilter
              size={14}
            />
            Filters
          </div>

          <select
            value={
              reviewType
            }
            onChange={(
              event,
            ) => {
              setReviewType(
                event.target
                  .value,
              );
              setPage(1);
            }}
            aria-label="Review type"
          >
            <option value="">
              All types
            </option>

            <option value="product">
              Product reviews
            </option>

            <option value="app">
              App reviews
            </option>
          </select>

          <select
            value={
              approvalFilter
            }
            onChange={(
              event,
            ) => {
              setApprovalFilter(
                event.target
                  .value,
              );
              setPage(1);
            }}
            aria-label="Approval status"
          >
            <option value="">
              All approval
            </option>

            <option value="false">
              Pending
            </option>

            <option value="true">
              Approved
            </option>
          </select>

          <select
            value={
              visibilityFilter
            }
            onChange={(
              event,
            ) => {
              setVisibilityFilter(
                event.target
                  .value,
              );
              setPage(1);
            }}
            aria-label="Visibility"
          >
            <option value="">
              All visibility
            </option>

            <option value="false">
              Private
            </option>

            <option value="true">
              Public
            </option>
          </select>

          <button
            type="button"
            className={
              styles.clearButton
            }
            onClick={
              handleClearFilters
            }
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div
          className={
            styles.error
          }
          role="alert"
        >
          <strong>
            Unable to complete
            request
          </strong>

          <span>
            {error}
          </span>
        </div>
      )}

      {notice && (
        <div
          className={
            styles.notice
          }
          role="status"
        >
          <FiCheck
            size={15}
          />

          <span>
            {notice}
          </span>
        </div>
      )}

      {loading ? (
        <div
          className={
            styles.state
          }
        >
          <div
            className={
              styles.loader
            }
          />

          <span>
            Loading reviews...
          </span>
        </div>
      ) : reviews.length ===
        0 ? (
        <div
          className={
            styles.empty
          }
        >
          <FiMessageSquare
            size={24}
          />

          <h2>
            No reviews found
          </h2>

          <p>
            There are no reviews
            matching the selected
            filters.
          </p>

          {(search ||
            reviewType ||
            approvalFilter ||
            visibilityFilter) && (
            <button
              type="button"
              className={
                styles.emptyButton
              }
              onClick={
                handleClearFilters
              }
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div
          className={
            styles.tableCard
          }
        >
          <div
            className={
              styles.tableHeader
            }
          >
            <div>
              <span
                className={
                  styles.tableEyebrow
                }
              >
                Moderation queue
              </span>

              <strong>
                {pagination.total}{" "}
                review
                {pagination.total ===
                1
                  ? ""
                  : "s"}
              </strong>
            </div>

            <span
              className={
                styles.pageInfo
              }
            >
              Page {page}
              {totalPages > 0
                ? ` of ${totalPages}`
                : ""}
            </span>
          </div>

          <div
            className={
              styles.tableWrap
            }
          >
            <table
              className={
                styles.table
              }
            >
              <thead>
                <tr>
                  <th>
                    Customer
                  </th>

                  <th>
                    Review
                  </th>

                  <th>
                    Rating
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Visibility
                  </th>

                  <th>
                    Submitted
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {reviews.map(
                  (review) => {
                    const busy =
                      actionId ===
                      review._id;

                    return (
                      <tr
                        key={
                          review._id
                        }
                        className={
                          styles.row
                        }
                        onClick={() =>
                          openReview(
                            review,
                          )
                        }
                      >
                        <td>
                          <div
                            className={
                              styles.customer
                            }
                          >
                            <span
                              className={
                                styles.avatar
                              }
                            >
                              {getInitials(
                                getUserName(
                                  review,
                                ),
                              )}
                            </span>

                            <div>
                              <strong>
                                {getUserName(
                                  review,
                                )}
                              </strong>

                              {getUserEmail(
                                review,
                              ) && (
                                <span>
                                  {getUserEmail(
                                    review,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div
                            className={
                              styles.reviewCell
                            }
                          >
                            <strong>
                              {review.title ||
                                "Untitled review"}
                            </strong>

                            <span>
                              {review.comment ||
                                "No written comment."}
                            </span>

                            {Array.isArray(
                              review.images,
                            ) &&
                              review.images
                                .length >
                                0 && (
                                <small>
                                  <FiImage
                                    size={
                                      12
                                    }
                                  />
                                  {
                                    review
                                      .images
                                      .length
                                  }{" "}
                                  image
                                  {review
                                    .images
                                    .length ===
                                  1
                                    ? ""
                                    : "s"}
                                </small>
                              )}
                          </div>
                        </td>

                        <td>
                          <div
                            className={
                              styles.ratingCell
                            }
                          >
                            <RatingStars
                              rating={
                                review.rating
                              }
                            />

                            <span>
                              {Number(
                                review.rating,
                              ) || 0}
                              /5
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              review.reviewType ===
                              "app"
                                ? styles.typeApp
                                : styles.typeProduct
                            }
                          >
                            {getReviewType(
                              review,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              review.isApproved
                                ? styles.statusApproved
                                : styles.statusPending
                            }
                          >
                            {getStatusLabel(
                              review,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              review.isApproved &&
                              review.isPublic
                                ? styles.visibilityPublic
                                : styles.visibilityPrivate
                            }
                          >
                            {getVisibilityLabel(
                              review,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              styles.date
                            }
                          >
                            {formatDate(
                              review.createdAt,
                            )}
                          </span>
                        </td>

                        <td
                          onClick={(
                            event,
                          ) =>
                            event.stopPropagation()
                          }
                        >
                          <div
                            className={
                              styles.actions
                            }
                          >
                            <button
                              type="button"
                              className={
                                review.isApproved
                                  ? styles.actionButton
                                  : styles.approveButton
                              }
                              onClick={() =>
                                handleStatus(
                                  review,
                                )
                              }
                              disabled={
                                busy
                              }
                              title={
                                review.isApproved
                                  ? "Reject review"
                                  : "Approve review"
                              }
                            >
                              {review.isApproved ? (
                                <FiX
                                  size={
                                    14
                                  }
                                />
                              ) : (
                                <FiCheck
                                  size={
                                    14
                                  }
                                />
                              )}
                            </button>

                            <button
                              type="button"
                              className={
                                styles.actionButton
                              }
                              onClick={() =>
                                openReview(
                                  review,
                                )
                              }
                              title="View review"
                            >
                              <FiEye
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles.deleteButton}`}
                              onClick={() =>
                                handleDelete(
                                  review,
                                )
                              }
                              disabled={
                                busy
                              }
                              title="Delete review"
                            >
                              <FiTrash2
                                size={
                                  14
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          {totalPages >
            1 && (
            <div
              className={
                styles.pagination
              }
            >
              <span>
                Showing{" "}
                {reviews.length} of{" "}
                {pagination.total}{" "}
                reviews
              </span>

              <div
                className={
                  styles.paginationControls
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current -
                            1,
                        ),
                    )
                  }
                  disabled={
                    !canGoPrevious
                  }
                >
                  <FiChevronLeft
                    size={15}
                  />
                  Previous
                </button>

                <strong>
                  {page}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setPage(
                      (current) =>
                        current +
                        1,
                    )
                  }
                  disabled={
                    !canGoNext
                  }
                >
                  Next
                  <FiChevronRight
                    size={15}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedReview && (
        <div
          className={
            styles.overlay
          }
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeReview();
            }
          }}
        >
          <aside
            className={
              styles.drawer
            }
          >
            <div
              className={
                styles.drawerHeader
              }
            >
              <div>
                <span
                  className={
                    styles.drawerEyebrow
                  }
                >
                  Review details
                </span>

                <h2>
                  {getReviewType(
                    selectedReview,
                  )}{" "}
                  review
                </h2>
              </div>

              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={
                  closeReview
                }
                disabled={
                  replySaving ||
                  Boolean(
                    actionId,
                  )
                }
                aria-label="Close review details"
              >
                <FiX
                  size={18}
                />
              </button>
            </div>

            {detailLoading && (
              <div
                className={
                  styles.detailLoading
                }
              >
                Loading latest
                review details...
              </div>
            )}

            {detailError && (
              <div
                className={
                  styles.detailError
                }
              >
                {detailError}
              </div>
            )}

            <div
              className={
                styles.drawerBody
              }
            >
              <div
                className={
                  styles.detailCustomer
                }
              >
                <span
                  className={
                    styles.detailAvatar
                  }
                >
                  {getInitials(
                    getUserName(
                      selectedReview,
                    ),
                  )}
                </span>

                <div>
                  <strong>
                    {getUserName(
                      selectedReview,
                    )}
                  </strong>

                  {getUserEmail(
                    selectedReview,
                  ) && (
                    <span>
                      {getUserEmail(
                        selectedReview,
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={
                  styles.detailRating
                }
              >
                <RatingStars
                  rating={
                    selectedReview.rating
                  }
                  large
                />

                <strong>
                  {Number(
                    selectedReview.rating,
                  ) || 0}
                  .0 / 5
                </strong>
              </div>

              <div
                className={
                  styles.detailBadges
                }
              >
                <span
                  className={
                    selectedReview.isApproved
                      ? styles.statusApproved
                      : styles.statusPending
                  }
                >
                  {getStatusLabel(
                    selectedReview,
                  )}
                </span>

                <span
                  className={
                    selectedReview.isApproved &&
                    selectedReview.isPublic
                      ? styles.visibilityPublic
                      : styles.visibilityPrivate
                  }
                >
                  {getVisibilityLabel(
                    selectedReview,
                  )}
                </span>

                {selectedReview.reviewType ===
                  "product" && (
                  <span
                    className={
                      styles.typeProduct
                    }
                  >
                    Verified purchase
                  </span>
                )}
              </div>

              <div
                className={
                  styles.detailSection
                }
              >
                <span
                  className={
                    styles.detailLabel
                  }
                >
                  Review
                </span>

                <h3>
                  {selectedReview.title ||
                    "Untitled review"}
                </h3>

                <p
                  className={
                    styles.detailComment
                  }
                >
                  {selectedReview.comment ||
                    "No written comment."}
                </p>
              </div>

              {selectedReview.reviewType ===
                "product" && (
                <div
                  className={
                    styles.contextCard
                  }
                >
                  <div>
                    <span>
                      Product
                    </span>

                    <strong>
                      {getProductName(
                        selectedReview,
                      ) ||
                        "Product"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Order
                    </span>

                    <strong>
                      {getOrderNumber(
                        selectedReview,
                      ) ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Order status
                    </span>

                    <strong>
                      {getOrderStatus(
                        selectedReview,
                      ) ||
                        "—"}
                    </strong>
                  </div>
                </div>
              )}

              {Array.isArray(
                selectedReview.images,
              ) &&
                selectedReview.images
                  .length >
                  0 && (
                  <div
                    className={
                      styles.detailSection
                    }
                  >
                    <span
                      className={
                        styles.detailLabel
                      }
                    >
                      Review images
                    </span>

                    <div
                      className={
                        styles.imageGrid
                      }
                    >
                      {selectedReview.images.map(
                        (
                          image,
                          index,
                        ) => {
                          const imageUrl =
                            getImageUrl(
                              image,
                            );

                          if (
                            !imageUrl
                          ) {
                            return null;
                          }

                          return (
                            <a
                              key={`${imageUrl}-${index}`}
                              href={
                                imageUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className={
                                styles.reviewImage
                              }
                            >
                              <img
                                src={
                                  imageUrl
                                }
                                alt={`Review ${index + 1}`}
                              />
                            </a>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

              <div
                className={
                  styles.detailSection
                }
              >
                <span
                  className={
                    styles.detailLabel
                  }
                >
                  Submitted
                </span>

                <p
                  className={
                    styles.metaText
                  }
                >
                  {formatDateTime(
                    selectedReview.createdAt,
                  )}
                </p>
              </div>

              <div
                className={
                  styles.moderationCard
                }
              >
                <div
                  className={
                    styles.moderationHeader
                  }
                >
                  <div>
                    <span
                      className={
                        styles.detailLabel
                      }
                    >
                      Moderation
                    </span>

                    <strong>
                      Publication controls
                    </strong>
                  </div>
                </div>

                <div
                  className={
                    styles.moderationActions
                  }
                >
                  <button
                    type="button"
                    className={
                      selectedReview.isApproved
                        ? styles.secondaryAction
                        : styles.primaryAction
                    }
                    onClick={() =>
                      handleStatus(
                        selectedReview,
                      )
                    }
                    disabled={
                      Boolean(
                        actionId,
                      ) ||
                      replySaving
                    }
                  >
                    {selectedReview.isApproved ? (
                      <>
                        <FiX
                          size={15}
                        />
                        Reject review
                      </>
                    ) : (
                      <>
                        <FiCheck
                          size={15}
                        />
                        Approve review
                      </>
                    )}
                  </button>

                  {selectedReview.isApproved && (
                    <button
                      type="button"
                      className={
                        styles.secondaryAction
                      }
                      onClick={() =>
                        handleVisibility(
                          selectedReview,
                        )
                      }
                      disabled={
                        Boolean(
                          actionId,
                        ) ||
                        replySaving
                      }
                    >
                      {selectedReview.isPublic ? (
                        <>
                          <FiEyeOff
                            size={15}
                          />
                          Make private
                        </>
                      ) : (
                        <>
                          <FiEye
                            size={15}
                          />
                          Publish review
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <form
                className={
                  styles.replyCard
                }
                onSubmit={
                  handleReply
                }
              >
                <div
                  className={
                    styles.replyHeader
                  }
                >
                  <div>
                    <span
                      className={
                        styles.detailLabel
                      }
                    >
                      Admin response
                    </span>

                    <strong>
                      Reply to customer
                    </strong>
                  </div>

                  <FiMessageSquare
                    size={17}
                  />
                </div>

                <textarea
                  value={reply}
                  onChange={(
                    event,
                  ) =>
                    setReply(
                      event.target
                        .value,
                    )
                  }
                  maxLength={2000}
                  placeholder="Write a thoughtful response..."
                  rows={5}
                  disabled={
                    replySaving
                  }
                />

                <div
                  className={
                    styles.replyMeta
                  }
                >
                  <span>
                    {reply.length}
                    /2000
                  </span>

                  <label
                    className={
                      styles.visibilityToggle
                    }
                  >
                    <input
                      type="checkbox"
                      checked={
                        replyPublic
                      }
                      onChange={(
                        event,
                      ) =>
                        setReplyPublic(
                          event.target
                            .checked,
                        )
                      }
                      disabled={
                        replySaving
                      }
                    />

                    <span>
                      Public reply
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className={
                    styles.saveReply
                  }
                  disabled={
                    replySaving ||
                    !reply.trim()
                  }
                >
                  <FiMessageSquare
                    size={15}
                  />

                  {replySaving
                    ? "Saving reply..."
                    : "Save reply"}
                </button>
              </form>

              {selectedReview
                .adminReply
                ?.message && (
                <div
                  className={
                    styles.existingReply
                  }
                >
                  <div>
                    <span
                      className={
                        styles.detailLabel
                      }
                    >
                      Current reply
                    </span>

                    <span
                      className={
                        selectedReview
                          .adminReply
                          .isPublic
                          ? styles.replyPublic
                          : styles.replyPrivate
                      }
                    >
                      {selectedReview
                        .adminReply
                        .isPublic
                        ? "Public"
                        : "Private"}
                    </span>
                  </div>

                  <p>
                    {
                      selectedReview
                        .adminReply
                        .message
                    }
                  </p>
                </div>
              )}

              <button
                type="button"
                className={
                  styles.deleteReview
                }
                onClick={() =>
                  handleDelete(
                    selectedReview,
                  )
                }
                disabled={
                  Boolean(
                    actionId,
                  ) ||
                  replySaving
                }
              >
                <FiTrash2
                  size={15}
                />
                Delete review permanently
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Reviews;