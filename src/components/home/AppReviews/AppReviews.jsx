import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiMessageCircle,
  FiX,
} from "react-icons/fi";

import {
  Link,
} from "react-router-dom";

import {
  getAppReviews,
  getMyReviews,
} from "../../../services/reviewService";

import ReviewForm from "../../review/ReviewForm/ReviewForm";
import RatingStars from "../../review/RatingStars/RatingStars";

import useAuth from "../../../hooks/useAuth";

import styles from "./AppReviews.module.css";


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


function getReviewId(review) {
  return (
    review?._id ||
    review?.id ||
    ""
  );
}


function getPublicAppReviews(reviews) {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews.filter((review) => {
    if (!review) {
      return false;
    }

    if (
      review.reviewType &&
      review.reviewType !== "app"
    ) {
      return false;
    }

    if (review.isApproved === false) {
      return false;
    }

    if (review.isPublic === false) {
      return false;
    }

    const rating = Number(review.rating);

    if (
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return false;
    }

    if (
      typeof review.comment !== "string" ||
      !review.comment.trim()
    ) {
      return false;
    }

    return true;
  });
}


function isAppReview(review) {
  return (
    review &&
    (
      !review.reviewType ||
      review.reviewType === "app"
    )
  );
}


function getUserName(review) {
  const user =
    review?.user ||
    review?.customer;

  if (typeof user === "string") {
    return user;
  }

  if (user?.name) {
    return user.name;
  }

  if (
    user?.firstName ||
    user?.lastName
  ) {
    return `${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();
  }

  if (review?.userName) {
    return review.userName;
  }

  return "Customer";
}


function getInitial(name) {
  const value =
    String(name || "")
      .trim()
      .charAt(0);

  return (
    value.toUpperCase() ||
    "C"
  );
}


function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
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


function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Unable to load customer reviews."
  );
}


function getRatingSummary(response) {
  const rating =
    response?.data?.rating ||
    response?.rating;

  return {
    average:
      Number(rating?.average) || 0,

    count:
      Number(rating?.count) || 0,
  };
}


function AppReviews({
  limit = 6,
}) {
  const {
    isAuthenticated,
  } = useAuth();

  const [reviews, setReviews] =
    useState([]);

  const [myAppReview, setMyAppReview] =
    useState(null);

  const [ratingSummary, setRatingSummary] =
    useState({
      average: 0,
      count: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeIndex, setActiveIndex] =
    useState(0);

  const [showForm, setShowForm] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);


  /*
   * Public testimonials are loaded
   * independently from the logged-in
   * user's own review.
   *
   * Authentication must never change
   * the public testimonial list.
   */
  const loadReviews =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await getAppReviews();

        const publicReviews =
          getPublicAppReviews(
            getReviewList(response),
          );

        const visibleReviews =
          typeof limit === "number"
            ? publicReviews.slice(
                0,
                limit,
              )
            : publicReviews;

        setReviews(
          visibleReviews,
        );

        setRatingSummary(
          getRatingSummary(
            response,
          ),
        );
      } catch (requestError) {
        console.error(
          "Failed to load app reviews:",
          requestError,
        );

        setReviews([]);

        setRatingSummary({
          average: 0,
          count: 0,
        });

        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [limit]);


  /*
   * This request is used only to
   * prevent duplicate app reviews.
   *
   * It does not control which
   * testimonials are displayed.
   */
  const loadMyAppReview =
    useCallback(async () => {
      if (!isAuthenticated) {
        setMyAppReview(null);
        return;
      }

      try {
        const response =
          await getMyReviews();

        const myReviews =
          getReviewList(
            response,
          );

        const appReview =
          myReviews.find(
            (review) =>
              isAppReview(review),
          ) || null;

        setMyAppReview(
          appReview,
        );
      } catch (requestError) {
        console.error(
          "Failed to load user's app review:",
          requestError,
        );

        setMyAppReview(null);
      }
    }, [isAuthenticated]);


  useEffect(() => {
    loadReviews();
  }, [loadReviews]);


  useEffect(() => {
    loadMyAppReview();
  }, [loadMyAppReview]);


  useEffect(() => {
    if (
      activeIndex >= reviews.length
    ) {
      setActiveIndex(
        Math.max(
          0,
          reviews.length - 1,
        ),
      );
    }
  }, [
    activeIndex,
    reviews.length,
  ]);


  /*
   * Automatic testimonial rotation.
   *
   * It pauses while:
   * - the user hovers over the card
   * - the review form is open
   */
  useEffect(() => {
    if (
      reviews.length <= 1 ||
      isPaused ||
      showForm
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(() => {
        setActiveIndex(
          (current) =>
            current >=
            reviews.length - 1
              ? 0
              : current + 1,
        );
      }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    reviews.length,
    isPaused,
    showForm,
  ]);


  /*
   * Lock page scrolling while
   * the review form is open.
   */
  useEffect(() => {
    if (!showForm) {
      return undefined;
    }

    const handleKeyDown =
      (event) => {
        if (
          event.key === "Escape"
        ) {
          setShowForm(false);
        }
      };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        previousOverflow;
    };
  }, [showForm]);


  const activeReview =
    reviews[activeIndex] ||
    null;


  const hasMyReview =
    Boolean(myAppReview);


  const averageRating =
    ratingSummary.average ||
    (
      reviews.length
        ? reviews.reduce(
            (
              total,
              review,
            ) =>
              total +
              Number(
                review.rating || 0,
              ),
            0,
          ) /
          reviews.length
        : 0
    );


  const totalReviews =
    ratingSummary.count ||
    reviews.length;


  const position =
    reviews.length > 0
      ? `${activeIndex + 1} / ${reviews.length}`
      : "";


  const handleWriteReview =
    () => {
      if (!isAuthenticated) {
        return;
      }

      if (hasMyReview) {
        return;
      }

      setShowForm(true);
    };


  const handleReviewSuccess =
    async () => {
      setShowForm(false);
      setActiveIndex(0);

      await Promise.all([
        loadReviews(),
        loadMyAppReview(),
      ]);
    };


  const handlePrevious =
    () => {
      if (reviews.length <= 1) {
        return;
      }

      setActiveIndex(
        (current) =>
          current <= 0
            ? reviews.length - 1
            : current - 1,
      );
    };


  const handleNext =
    () => {
      if (reviews.length <= 1) {
        return;
      }

      setActiveIndex(
        (current) =>
          current >=
          reviews.length - 1
            ? 0
            : current + 1,
      );
    };


  const handleOverlayMouseDown =
    (event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        setShowForm(false);
      }
    };


  const renderReviewAction =
    () => {
      if (!isAuthenticated) {
        return (
          <Link
            to="/login"
            className={
              styles.reviewButton
            }
          >
            <FiEdit3 size={14} />
            Write a Review
          </Link>
        );
      }

      if (hasMyReview) {
        return (
          <span
            className={
              styles.submitted
            }
          >
            Review submitted
          </span>
        );
      }

      return (
        <button
          type="button"
          className={
            styles.reviewButton
          }
          onClick={
            handleWriteReview
          }
          aria-expanded={
            showForm
          }
        >
          <FiEdit3 size={14} />
          Write a Review
        </button>
      );
    };


  return (
    <section
      className={styles.section}
    >
      <div
        className={styles.container}
      >

        <header
          className={styles.heading}
        >
          <span
            className={styles.eyebrow}
          >
            Customer Love
          </span>

          <h2
            className={styles.title}
          >
            What Our Customers Say
          </h2>

          <p
            className={styles.description}
          >
            Honest experiences from
            customers who shop with
            Ayushi Jewellery.
          </p>
        </header>


        {loading &&
          reviews.length === 0 && (
            <div
              className={styles.loading}
            >
              <span
                className={
                  styles.loadingDot
                }
              />
              Loading reviews...
            </div>
          )}


        {!loading &&
          error &&
          reviews.length === 0 && (
            <div
              className={styles.empty}
            >
              <div
                className={
                  styles.emptyIcon
                }
              >
                <FiMessageCircle
                  size={21}
                />
              </div>

              <h3
                className={
                  styles.emptyTitle
                }
              >
                Reviews unavailable
              </h3>

              <p
                className={
                  styles.emptyText
                }
              >
                Please try again later.
              </p>

              <div
                className={
                  styles.emptyAction
                }
              >
                {renderReviewAction()}
              </div>
            </div>
          )}


        {!loading &&
          !error &&
          reviews.length === 0 && (
            <div
              className={styles.empty}
            >
              <div
                className={
                  styles.emptyIcon
                }
              >
                <FiMessageCircle
                  size={21}
                />
              </div>

              <span
                className={
                  styles.emptyEyebrow
                }
              >
                Your Experience
              </span>

              <h3
                className={
                  styles.emptyTitle
                }
              >
                Be the first to share
              </h3>

              <p
                className={
                  styles.emptyText
                }
              >
                Tell us about your
                experience with
                Ayushi Jewellery.
              </p>

              <div
                className={
                  styles.emptyAction
                }
              >
                {renderReviewAction()}
              </div>
            </div>
          )}


        {reviews.length > 0 && (
          <div className={styles.content}>

            <div
              className={
                styles.summary
              }
            >
              <div
                className={
                  styles.summaryRating
                }
              >
                <span
                  className={
                    styles.summaryLabel
                  }
                >
                  Overall rating
                </span>

                <strong
                  className={
                    styles.ratingNumber
                  }
                >
                  {Number(
                    averageRating,
                  ).toFixed(1)}
                </strong>

                <RatingStars
                  value={
                    averageRating
                  }
                  readOnly
                  size="large"
                />

                <span
                  className={
                    styles.reviewCount
                  }
                >
                  {totalReviews}{" "}
                  {totalReviews === 1
                    ? "customer review"
                    : "customer reviews"}
                </span>
              </div>

              <div
                className={
                  styles.summaryText
                }
              >
                <span>
                  Community feedback
                </span>

                <p>
                  Every review helps us
                  create a better
                  jewellery shopping
                  experience.
                </p>
              </div>

              <div
                className={
                  styles.summaryAction
                }
              >
                {renderReviewAction()}
              </div>
            </div>


            <div
              className={styles.testimonialArea}
              onMouseEnter={() =>
                setIsPaused(true)
              }
              onMouseLeave={() =>
                setIsPaused(false)
              }
            >
              {activeReview && (
                <article
                  className={
                    styles.testimonial
                  }
                  aria-live="polite"
                >

                  <div
                    className={
                      styles.testimonialTop
                    }
                  >
                    <div
                      className={
                        styles.quoteMark
                      }
                      aria-hidden="true"
                    >
                      <FiMessageCircle
                        size={17}
                      />
                    </div>

                    <div
                      className={
                        styles.testimonialRating
                      }
                    >
                      <RatingStars
                        value={
                          Number(
                            activeReview.rating,
                          ) || 0
                        }
                        readOnly
                        size="small"
                      />

                      <span>
                        {Number(
                          activeReview.rating,
                        ).toFixed(1)}
                      </span>
                    </div>
                  </div>


                  <div
                    className={
                      styles.testimonialBody
                    }
                  >
                    {activeReview.title && (
                      <h3
                        className={
                          styles.reviewTitle
                        }
                      >
                        {activeReview.title}
                      </h3>
                    )}

                    <p
                      className={
                        styles.reviewText
                      }
                    >
                      “{activeReview.comment}”
                    </p>
                  </div>


                  <footer
                    className={
                      styles.testimonialFooter
                    }
                  >
                    <div
                      className={
                        styles.customer
                      }
                    >
                      <div
                        className={
                          styles.avatar
                        }
                        aria-hidden="true"
                      >
                        {getInitial(
                          getUserName(
                            activeReview,
                          ),
                        )}
                      </div>

                      <div
                        className={
                          styles.customerInfo
                        }
                      >
                        <strong>
                          {getUserName(
                            activeReview,
                          )}
                        </strong>

                        <span>
                          Customer
                        </span>
                      </div>
                    </div>

                    {activeReview.createdAt && (
                      <time
                        className={
                          styles.date
                        }
                        dateTime={
                          activeReview.createdAt
                        }
                      >
                        {formatDate(
                          activeReview.createdAt,
                        )}
                      </time>
                    )}
                  </footer>
                </article>
              )}


              {reviews.length > 1 && (
                <div
                  className={
                    styles.controls
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.controlButton
                    }
                    onClick={
                      handlePrevious
                    }
                    aria-label="Previous review"
                  >
                    <FiChevronLeft
                      size={16}
                    />
                  </button>

                  <div
                    className={
                      styles.controlCenter
                    }
                  >
                    <div
                      className={
                        styles.indicators
                      }
                    >
                      {reviews.map(
                        (
                          review,
                          index,
                        ) => (
                          <button
                            type="button"
                            key={
                              getReviewId(
                                review,
                              ) ||
                              index
                            }
                            className={
                              index ===
                              activeIndex
                                ? styles.activeIndicator
                                : styles.indicator
                            }
                            onClick={() =>
                              setActiveIndex(
                                index,
                              )
                            }
                            aria-label={`Show review ${
                              index + 1
                            }`}
                            aria-current={
                              index ===
                              activeIndex
                            }
                          />
                        ),
                      )}
                    </div>

                    <span
                      className={
                        styles.position
                      }
                    >
                      {position}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={
                      styles.controlButton
                    }
                    onClick={
                      handleNext
                    }
                    aria-label="Next review"
                  >
                    <FiChevronRight
                      size={16}
                    />
                  </button>
                </div>
              )}

              {reviews.length > 1 && (
                <span
                  className={
                    styles.sliderStatus
                  }
                >
                  {isPaused
                    ? "Paused"
                    : "Auto-playing"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>


      {showForm && (
        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={
            handleOverlayMouseDown
          }
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-review-title"
          >
            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <span
                  className={
                    styles.modalEyebrow
                  }
                >
                  Your Experience
                </span>

                <h2
                  id="app-review-title"
                  className={
                    styles.modalTitle
                  }
                >
                  Share your experience
                </h2>

                <p
                  className={
                    styles.modalDescription
                  }
                >
                  Tell us what you think
                  about Ayushi Jewellery.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.modalClose
                }
                onClick={() =>
                  setShowForm(false)
                }
                aria-label="Close review form"
              >
                <FiX size={17} />
              </button>
            </div>

            <div
              className={
                styles.modalBody
              }
            >
              <ReviewForm
                type="app"
                onSuccess={
                  handleReviewSuccess
                }
                onCancel={() =>
                  setShowForm(false)
                }
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


export default AppReviews;