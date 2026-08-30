import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiPackage,
  FiTruck,
  FiXCircle,
} from "react-icons/fi";

import {
  getOrderById,
} from "../../services/orderService";

import OrderReview from "../../components/review/OrderReview/OrderReview";

import styles from "./OrderTracking.module.css";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

function getResponseData(response) {
  return (
    response?.data ||
    response ||
    {}
  );
}

function formatStatus(value) {
  return String(
    value || "pending",
  )
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
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

function getStatusIndex(status) {
  return ORDER_STATUSES.indexOf(
    status,
  );
}

function getStatusIcon(status) {
  if (
    status ===
    "delivered"
  ) {
    return <FiCheck />;
  }

  if (
    status ===
      "shipped" ||
    status ===
      "out_for_delivery"
  ) {
    return <FiTruck />;
  }

  if (
    status ===
    "processing"
  ) {
    return <FiPackage />;
  }

  return <FiClock />;
}

function isDeliveredStatus(order) {
  return (
    String(
      order?.orderStatus ||
        order?.status ||
        "",
    ).toLowerCase() ===
    "delivered"
  );
}

function OrderTracking() {
  const {
    orderId,
  } = useParams();

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    reviewRefreshKey,
    setReviewRefreshKey,
  ] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOrder(
      showLoading = true,
    ) {
      if (!orderId) {
        if (active) {
          setError(
            "Order ID is missing.",
          );
          setLoading(false);
        }

        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        const response =
          await getOrderById(
            orderId,
          );

        const data =
          getResponseData(
            response,
          );

        if (!active) {
          return;
        }

        if (data?.order) {
          setOrder(
            data.order,
          );
          setError("");
        } else {
          setError(
            "We could not find this order.",
          );
        }
      } catch (
        requestError
      ) {
        if (
          active &&
          showLoading
        ) {
          setError(
            requestError?.message ||
              "Unable to load order tracking.",
          );
        }
      } finally {
        if (
          active &&
          showLoading
        ) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    const interval =
      window.setInterval(
        () => {
          loadOrder(false);
        },
        15000,
      );

    return () => {
      active = false;
      window.clearInterval(
        interval,
      );
    };
  }, [orderId]);

  const handleReviewSuccess = () => {
    setReviewRefreshKey(
      (current) =>
        current + 1,
    );
  };

  if (loading) {
    return (
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.container
          }
        >
          <div
            className={
              styles.state
            }
          >
            Loading tracking...
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.container
          }
        >
          <div
            className={
              styles.errorState
            }
          >
            <h1>
              Tracking unavailable
            </h1>

            <p>
              {error ||
                "We could not find this order."}
            </p>

            <Link
              to="/account/orders"
              className={
                styles.primaryButton
              }
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const id =
    order._id ||
    order.id ||
    orderId;

  const orderStatus =
    String(
      order.orderStatus ||
        order.status ||
        "pending",
    ).toLowerCase();

  const isCancelled =
    orderStatus ===
    "cancelled";

  const delivered =
    isDeliveredStatus(
      order,
    );

  const currentIndex =
    getStatusIndex(
      orderStatus,
    );

  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.container
        }
      >
        <Link
          to={`/order/${id}`}
          className={
            styles.backLink
          }
        >
          <FiArrowLeft
            size={15}
          />

          Back to Order
        </Link>

        <header
          className={
            styles.header
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              Order Tracking
            </span>

            <h1>
              {order.orderNumber ||
                id}
            </h1>

            <p>
              Placed on{" "}
              {formatDate(
                order.createdAt,
              )}
            </p>
          </div>

          <div
            className={`${styles.status} ${
              isCancelled
                ? styles.cancelled
                : ""
            }`}
          >
            {isCancelled ? (
              <FiXCircle />
            ) : (
              getStatusIcon(
                orderStatus,
              )
            )}

            {formatStatus(
              orderStatus,
            )}
          </div>
        </header>

        {isCancelled ? (
          <section
            className={
              styles.cancelledCard
            }
          >
            <div
              className={
                styles.cancelledIcon
              }
            >
              <FiXCircle
                size={28}
              />
            </div>

            <div>
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Order Cancelled
              </span>

              <h2>
                This order has been
                cancelled.
              </h2>

              {order.cancelledAt && (
                <p>
                  Cancelled on{" "}
                  {formatDateTime(
                    order.cancelledAt,
                  )}
                </p>
              )}

              {order.cancellationReason && (
                <p>
                  Reason:{" "}
                  {
                    order.cancellationReason
                  }
                </p>
              )}
            </div>
          </section>
        ) : (
          <section
            className={
              styles.trackingCard
            }
          >
            <div
              className={
                styles.cardHeader
              }
            >
              <div>
                <span
                  className={
                    styles.cardEyebrow
                  }
                >
                  Shipment
                </span>

                <h2>
                  Order Progress
                </h2>
              </div>

              <FiTruck
                size={21}
              />
            </div>

            <div
              className={
                styles.timeline
              }
            >
              {ORDER_STATUSES.map(
                (
                  status,
                  index,
                ) => {
                  const completed =
                    currentIndex >=
                    index;

                  const current =
                    currentIndex ===
                    index;

                  return (
                    <div
                      key={status}
                      className={[
                        styles.timelineItem,
                        completed
                          ? styles.completed
                          : "",
                        current
                          ? styles.current
                          : "",
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          " ",
                        )}
                    >
                      <div
                        className={
                          styles.timelineMarker
                        }
                      >
                        {completed ? (
                          <FiCheck
                            size={13}
                          />
                        ) : (
                          getStatusIcon(
                            status,
                          )
                        )}
                      </div>

                      <div
                        className={
                          styles.timelineContent
                        }
                      >
                        <strong>
                          {formatStatus(
                            status,
                          )}
                        </strong>

                        {current && (
                          <span>
                            Current
                            status
                          </span>
                        )}
                      </div>
                    </div>
                  );
                },
              )}

              {order.deliveredAt && (
                <div
                  className={
                    styles.deliveryNote
                  }
                >
                  <FiCheck
                    size={17}
                  />

                  <div>
                    <strong>
                      Order delivered
                    </strong>

                    <span>
                      {formatDateTime(
                        order.deliveredAt,
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div
          className={
            styles.infoGrid
          }
        >
          <section
            className={
              styles.infoCard
            }
          >
            <span
              className={
                styles.cardEyebrow
              }
            >
              Order
            </span>

            <h2>
              Order Information
            </h2>

            <div
              className={
                styles.infoRows
              }
            >
              <div>
                <span>
                  Order Number
                </span>

                <strong>
                  {order.orderNumber ||
                    id}
                </strong>
              </div>

              <div>
                <span>
                  Order Date
                </span>

                <strong>
                  {formatDate(
                    order.createdAt,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Payment
                </span>

                <strong>
                  {order.paymentMethod ===
                  "online"
                    ? "Online Payment"
                    : "Cash on Delivery"}
                </strong>
              </div>

              <div>
                <span>
                  Payment Status
                </span>

                <strong>
                  {formatStatus(
                    order.paymentStatus,
                  )}
                </strong>
              </div>
            </div>
          </section>

          <section
            className={
              styles.infoCard
            }
          >
            <span
              className={
                styles.cardEyebrow
              }
            >
              Delivery
            </span>

            <h2>
              Shipping Address
            </h2>

            <div
              className={
                styles.address
              }
            >
              <strong>
                {
                  order
                    .shippingAddress
                    ?.fullName
                }
              </strong>

              {order
                .shippingAddress
                ?.phone && (
                <span>
                  {
                    order
                      .shippingAddress
                      .phone
                  }
                </span>
              )}

              {order
                .shippingAddress
                ?.addressLine1 && (
                <span>
                  {
                    order
                      .shippingAddress
                      .addressLine1
                  }
                </span>
              )}

              {order
                .shippingAddress
                ?.addressLine2 && (
                <span>
                  {
                    order
                      .shippingAddress
                      .addressLine2
                  }
                </span>
              )}

              {(
                order
                  .shippingAddress
                  ?.city ||
                order
                  .shippingAddress
                  ?.state ||
                order
                  .shippingAddress
                  ?.postalCode
              ) && (
                <span>
                  {[
                    order
                      .shippingAddress
                      ?.city,
                    order
                      .shippingAddress
                      ?.state,
                    order
                      .shippingAddress
                      ?.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}

              <span>
                {order
                  .shippingAddress
                  ?.country ||
                  "India"}
              </span>
            </div>
          </section>
        </div>

        {delivered && (
          <OrderReview
            key={
              reviewRefreshKey
            }
            order={order}
            onReviewSuccess={
              handleReviewSuccess
            }
          />
        )}

        {!delivered &&
          !isCancelled && (
            <section
              className={
                styles.reviewNotice
              }
            >
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Product Reviews
              </span>

              <h2>
                Review your purchase
              </h2>

              <p>
                You can write a review
                after your order has
                been delivered.
              </p>
            </section>
          )}

        <div
          className={
            styles.bottomActions
          }
        >
          <Link
            to={`/order/${id}`}
            className={
              styles.secondaryButton
            }
          >
            View Full Order
          </Link>

          <Link
            to="/account/orders"
            className={
              styles.secondaryButton
            }
          >
            My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}

export default OrderTracking;