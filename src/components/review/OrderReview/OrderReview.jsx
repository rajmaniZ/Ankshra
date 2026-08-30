import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiCheck,
  FiEdit2,
  FiEye,
  FiPackage,
  FiStar,
} from "react-icons/fi";

import ReviewForm from "../ReviewForm/ReviewForm";
import ReviewCard from "../ReviewCard/ReviewCard";

import {
  getMyReviews,
} from "../../../services/reviewService";

import {
  getProductById,
} from "../../../services/productService";

import {
  API_URL,
} from "../../../services/api";

import styles from "./OrderReview.module.css";

function getId(value) {
  if (
    value === undefined ||
    value === null
  ) {
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

function getProduct(item) {
  if (
    item?.product &&
    typeof item.product === "object"
  ) {
    return item.product;
  }

  return null;
}

function getProductId(item) {
  const product = getProduct(item);

  const productId = getId(product);

  if (productId) {
    return productId;
  }

  return (
    getId(item?.productId) ||
    getId(item?.productID) ||
    getId(item?.product_id) ||
    getId(item?.product)
  );
}

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (typeof image === "object") {
    return (
      image.url ||
      image.secure_url ||
      image.secureUrl ||
      image.path ||
      image.src ||
      ""
    );
  }

  if (typeof image !== "string") {
    return "";
  }

  const value = image.trim();

  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (value.startsWith("/")) {
    try {
      return new URL(
        value,
        API_URL,
      ).origin + value;
    } catch {
      return value;
    }
  }

  return value;
}

function getProductImage(
  item,
  product = null,
) {
  const itemImages =
    Array.isArray(item?.images)
      ? item.images
      : [];

  const productImages =
    Array.isArray(product?.images)
      ? product.images
      : [];

  const sources = [
    item?.image,
    item?.imageUrl,
    item?.productImage,
    itemImages[0],
    product?.thumbnail,
    product?.image,
    product?.imageUrl,
    productImages[0],
  ];

  for (const source of sources) {
    const url = getImageUrl(source);

    if (url) {
      return url;
    }
  }

  return "";
}

function getProductName(
  item,
  product = null,
) {
  return (
    item?.name ||
    item?.productName ||
    product?.name ||
    product?.title ||
    "Product"
  );
}

function getReviewList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.reviews,
    )
  ) {
    return response.reviews;
  }

  if (
    Array.isArray(
      response?.data?.reviews,
    )
  ) {
    return response.data.reviews;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  return [];
}

function getReviewProductId(review) {
  return getId(
    review?.product ||
      review?.productId,
  );
}

function getReviewOrderId(review) {
  return getId(
    review?.order ||
      review?.orderId,
  );
}

function getReviewId(review) {
  return getId(review);
}

function isSameReview(
  review,
  productId,
  orderId,
) {
  const reviewProductId =
    getReviewProductId(review);

  const reviewOrderId =
    getReviewOrderId(review);

  if (
    !reviewProductId ||
    !reviewOrderId
  ) {
    return false;
  }

  return (
    String(reviewProductId) ===
      String(productId) &&
    String(reviewOrderId) ===
      String(orderId)
  );
}

function getItems(order) {
  if (
    Array.isArray(order?.items)
  ) {
    return order.items;
  }

  if (
    Array.isArray(
      order?.orderItems,
    )
  ) {
    return order.orderItems;
  }

  return [];
}

function isDelivered(order) {
  return (
    String(
      order?.orderStatus ||
        order?.status ||
        "",
    ).toLowerCase() ===
    "delivered"
  );
}

function getResponseReview(response) {
  return (
    response?.data?.review ||
    response?.review ||
    null
  );
}

function OrderReview({
  order,
  onReviewSuccess,
}) {
  const [reviews, setReviews] =
    useState([]);

  const [productData, setProductData] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    activeProductId,
    setActiveProductId,
  ] = useState("");

  const [
    visibleReviewId,
    setVisibleReviewId,
  ] = useState("");

  const orderId = getId(order);

  const delivered = isDelivered(order);

  const items = useMemo(
    () => getItems(order),
    [order],
  );

  useEffect(() => {
    let mounted = true;

    const loadReviews = async () => {
      if (
        !orderId ||
        !delivered
      ) {
        if (mounted) {
          setReviews([]);
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await getMyReviews();

        if (!mounted) {
          return;
        }

        setReviews(
          getReviewList(response),
        );
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        console.error(
          "Failed to load user reviews:",
          requestError,
        );

        setReviews([]);

        setError(
          requestError?.message ||
            "Unable to load your reviews.",
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
    orderId,
    delivered,
  ]);

  useEffect(() => {
    let mounted = true;

    const loadMissingProducts =
      async () => {
        const ids = items
          .map((item) =>
            getProductId(item),
          )
          .filter(Boolean);

        const uniqueIds = [
          ...new Set(ids),
        ];

        const missingIds =
          uniqueIds.filter(
            (productId) =>
              !productData[
                productId
              ],
          );

        if (
          missingIds.length === 0
        ) {
          return;
        }

        const results =
          await Promise.all(
            missingIds.map(
              async (
                productId,
              ) => {
                try {
                  const response =
                    await getProductById(
                      productId,
                    );

                  const product =
                    response?.data
                      ?.product ||
                    response?.product ||
                    response?.data ||
                    null;

                  return [
                    productId,
                    product,
                  ];
                } catch {
                  return [
                    productId,
                    null,
                  ];
                }
              },
            ),
          );

        if (!mounted) {
          return;
        }

        setProductData(
          (current) => {
            const next = {
              ...current,
            };

            results.forEach(
              ([
                productId,
                product,
              ]) => {
                if (product) {
                  next[productId] =
                    product;
                }
              },
            );

            return next;
          },
        );
      };

    loadMissingProducts();

    return () => {
      mounted = false;
    };
  }, [items, productData]);

  const getItemReview = (
    item,
  ) => {
    const productId =
      getProductId(item);

    if (
      !productId ||
      !orderId
    ) {
      return null;
    }

    return (
      reviews.find(
        (review) =>
          isSameReview(
            review,
            productId,
            orderId,
          ),
      ) || null
    );
  };

  const handleReviewSuccess =
    (response) => {
      const newReview =
        getResponseReview(
          response,
        );

      if (newReview) {
        setReviews(
          (current) => {
            const newReviewId =
              getReviewId(
                newReview,
              );

            const existingIndex =
              current.findIndex(
                (review) =>
                  String(
                    getReviewId(
                      review,
                    ),
                  ) ===
                  String(
                    newReviewId,
                  ),
              );

            if (
              existingIndex >= 0
            ) {
              return current.map(
                (
                  review,
                  index,
                ) =>
                  index ===
                  existingIndex
                    ? newReview
                    : review,
              );
            }

            const sameOrderProductIndex =
              current.findIndex(
                (review) =>
                  isSameReview(
                    review,
                    getReviewProductId(
                      newReview,
                    ),
                    getReviewOrderId(
                      newReview,
                    ),
                  ),
              );

            if (
              sameOrderProductIndex >=
              0
            ) {
              return current.map(
                (
                  review,
                  index,
                ) =>
                  index ===
                  sameOrderProductIndex
                    ? newReview
                    : review,
              );
            }

            return [
              ...current,
              newReview,
            ];
          },
        );

        setVisibleReviewId(
          getReviewId(newReview),
        );
      } else {
        getMyReviews()
          .then(
            (
              updatedResponse,
            ) => {
              setReviews(
                getReviewList(
                  updatedResponse,
                ),
              );
            },
          )
          .catch(() => {});
      }

      setActiveProductId("");

      if (
        typeof onReviewSuccess ===
        "function"
      ) {
        onReviewSuccess(
          newReview,
        );
      }
    };

  const handleWriteReview =
    (productId) => {
      setVisibleReviewId("");
      setActiveProductId(
        (current) =>
          String(current) ===
          String(productId)
            ? ""
            : productId,
      );
    };

  const handleViewReview =
    (reviewId) => {
      setActiveProductId("");

      setVisibleReviewId(
        (current) =>
          String(current) ===
          String(reviewId)
            ? ""
            : reviewId,
      );
    };

  const handleEditReview =
    (productId) => {
      setVisibleReviewId("");
      setActiveProductId(
        (current) =>
          String(current) ===
          String(productId)
            ? ""
            : productId,
      );
    };

  if (
    !delivered ||
    items.length === 0
  ) {
    return null;
  }

  return (
    <section
      className={styles.section}
    >
      <div
        className={styles.header}
      >
        <span
          className={styles.eyebrow}
        >
          Your Experience
        </span>

        <h2
          className={styles.title}
        >
          Review your products
        </h2>

        <p
          className={
            styles.description
          }
        >
          Share your experience
          with the products you
          purchased.
        </p>
      </div>

      {loading && (
        <div
          className={styles.state}
        >
          Checking your reviews...
        </div>
      )}

      {!loading && error && (
        <div
          className={styles.error}
        >
          {error}
        </div>
      )}

      {!loading && !error && (
        <div
          className={styles.items}
        >
          {items.map(
            (item, index) => {
              const productId =
                getProductId(item);

              if (!productId) {
                return null;
              }

              const product =
                getProduct(item) ||
                productData[
                  productId
                ] ||
                null;

              const review =
                getItemReview(item);

              const productName =
                getProductName(
                  item,
                  product,
                );

              const productImage =
                getProductImage(
                  item,
                  product,
                );

              const reviewId =
                getReviewId(
                  review,
                );

              const editing =
                String(
                  activeProductId,
                ) ===
                String(productId);

              const showingReview =
                String(
                  visibleReviewId,
                ) ===
                String(reviewId) &&
                Boolean(reviewId);

              return (
                <div
                  className={
                    styles.item
                  }
                  key={`${productId}-${index}`}
                >
                  <div
                    className={
                      styles.product
                    }
                  >
                    <div
                      className={
                        styles.image
                      }
                    >
                      {productImage ? (
                        <img
                          src={
                            productImage
                          }
                          alt={
                            productName
                          }
                          onError={(
                            event,
                          ) => {
                            event.currentTarget.style.display =
                              "none";

                            const parent =
                              event.currentTarget
                                .parentElement;

                            if (
                              parent
                            ) {
                              parent.classList.add(
                                styles.imageFallback,
                              );
                            }
                          }}
                        />
                      ) : (
                        <div
                          className={
                            styles.imageFallback
                          }
                        >
                          <FiPackage
                            size={22}
                          />
                        </div>
                      )}
                    </div>

                    <div
                      className={
                        styles.productInfo
                      }
                    >
                      <h3>
                        {productName}
                      </h3>

                      {review ? (
                        <div
                          className={
                            styles.reviewStatus
                          }
                        >
                          <FiCheck
                            size={14}
                          />

                          <span>
                            Review submitted
                          </span>
                        </div>
                      ) : (
                        <p>
                          You purchased
                          this product.
                        </p>
                      )}
                    </div>

                    <div
                      className={
                        styles.action
                      }
                    >
                      {!review && (
                        <button
                          type="button"
                          className={
                            styles.reviewButton
                          }
                          onClick={() =>
                            handleWriteReview(
                              productId,
                            )
                          }
                        >
                          <FiStar
                            size={15}
                          />

                          {editing
                            ? "Close"
                            : "Write Review"}
                        </button>
                      )}

                      {review && (
                        <>
                          <button
                            type="button"
                            className={
                              styles.viewButton
                            }
                            onClick={() =>
                              handleViewReview(
                                reviewId,
                              )
                            }
                          >
                            <FiEye
                              size={14}
                            />

                            {showingReview
                              ? "Hide Review"
                              : "View Review"}
                          </button>

                          <button
                            type="button"
                            className={
                              styles.editButton
                            }
                            onClick={() =>
                              handleEditReview(
                                productId,
                              )
                            }
                          >
                            <FiEdit2
                              size={14}
                            />

                            {editing
                              ? "Close"
                              : "Edit Review"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {showingReview &&
                    review && (
                      <div
                        className={
                          styles.reviewWrapper
                        }
                      >
                        <ReviewCard
                          review={review}
                        />
                      </div>
                    )}

                  {editing && (
                    <div
                      className={
                        styles.formWrapper
                      }
                    >
                      <ReviewForm
                        type="product"
                        productId={
                          productId
                        }
                        orderId={
                          orderId
                        }
                        review={review}
                        onSuccess={
                          handleReviewSuccess
                        }
                        onCancel={() =>
                          setActiveProductId(
                            "",
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

export default OrderReview;