import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiMapPin,
  FiPackage,
  FiX,
} from "react-icons/fi";

import {
  cancelOrder,
  getOrderById,
} from "../../services/orderService";

import styles from "./OrderDetails.module.css";

function getResponseData(
  response,
) {
  return (
    response?.data ||
    response ||
    {}
  );
}

function getProductImage(item) {
  const image =
    item?.image ||
    item?.product?.images?.[0];

  if (
    image &&
    typeof image === "object"
  ) {
    return (
      image.url ||
      image.secure_url ||
      ""
    );
  }

  return image || "";
}

function getProductName(item) {
  return (
    item?.name ||
    item?.product?.name ||
    "Jewellery"
  );
}

function getProductSku(item) {
  return (
    item?.sku ||
    item?.product?.sku ||
    ""
  );
}

function getItemPrice(item) {
  const price =
    Number(item?.price);

  return Number.isFinite(price)
    ? price
    : 0;
}

function getItemOriginalPrice(item) {
  const price =
    Number(
      item?.originalPrice,
    );

  if (
    Number.isFinite(price)
  ) {
    return price;
  }

  return getItemPrice(item);
}

function getItemQuantity(item) {
  const quantity =
    Number(item?.quantity);

  return Number.isFinite(
    quantity,
  ) && quantity > 0
    ? quantity
    : 1;
}

function getItemSubtotal(item) {
  const storedSubtotal =
    Number(item?.subtotal);

  if (
    Number.isFinite(
      storedSubtotal,
    )
  ) {
    return storedSubtotal;
  }

  return (
    getItemPrice(item) *
    getItemQuantity(item)
  );
}

function getItemOfferDiscount(
  item,
) {
  const discount =
    Number(
      item?.offerDiscount,
    );

  if (
    Number.isFinite(discount)
  ) {
    return discount;
  }

  return Math.max(
    getItemOriginalPrice(
      item,
    ) *
      getItemQuantity(item) -
      getItemSubtotal(item),
    0,
  );
}

function formatCurrency(
  value,
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    Number(value || 0),
  );
}

function formatDate(
  value,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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

function formatDateTime(
  value,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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

function formatStatus(
  value,
) {
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

function OrderDetails() {
  const {
    orderId,
  } = useParams();

  const navigate =
    useNavigate();

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
    cancelling,
    setCancelling,
  ] = useState(false);

  const loadOrder =
    async (
      showLoading = true,
    ) => {
      if (!orderId) {
        setError(
          "Order ID is missing.",
        );
        setLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const response =
          await getOrderById(
            orderId,
          );

        const data =
          getResponseData(
            response,
          );

        if (!data?.order) {
          throw new Error(
            "Order was not returned by the server.",
          );
        }

        setOrder(
          data.order,
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
            "Unable to load order.",
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleCancel =
    async () => {
      const id =
        order?._id ||
        order?.id;

      if (!id) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to cancel this order?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setCancelling(true);
        setError("");

        await cancelOrder(id);

        /*
         * Do not rely on the cancellation
         * response for the final UI state.
         *
         * Fetch the canonical order again.
         */
        await loadOrder(false);
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
            "Unable to cancel the order.",
        );
      } finally {
        setCancelling(false);
      }
    };

  if (loading) {
    return (
      <main className={styles.page}>
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
            Loading order...
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className={styles.page}>
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
              Order not found
            </h1>

            <p>
              {error ||
                "This order could not be found."}
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
    order.id;

  const items =
    Array.isArray(order.items)
      ? order.items
      : [];

  const orderStatus =
    order.orderStatus ||
    "pending";

  const paymentStatus =
    order.paymentStatus ||
    "pending";

  const canCancel =
    ![
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ].includes(
      orderStatus,
    );

  const isOnlinePayment =
    order.paymentMethod ===
    "online";

  const subtotal =
    Number(order.subtotal) || 0;

  const offerDiscount =
    Number(
      order.offerDiscount,
    ) || 0;

  const couponDiscount =
    Number(
      order.couponDiscount,
    ) || 0;

  const totalDiscount =
    Number(order.discount) ||
    offerDiscount +
      couponDiscount;

  const offerSubtotal =
    Math.max(
      subtotal -
        offerDiscount,
      0,
    );

  const shippingFee =
    Number(
      order.shippingFee,
    ) || 0;

  const total =
    Number(order.total) || 0;

  return (
    <main className={styles.page}>
      <div
        className={
          styles.container
        }
      >
        <Link
          to="/account/orders"
          className={
            styles.backLink
          }
        >
          <FiArrowLeft
            size={15}
          />
          Back to Orders
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
              Order Details
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
              orderStatus ===
              "cancelled"
                ? styles.cancelled
                : ""
            }`}
          >
            {formatStatus(
              orderStatus,
            )}
          </div>
        </header>

        {error && (
          <div
            className={
              styles.error
            }
          >
            {error}
          </div>
        )}

        <div className={styles.grid}>
          <div>
            <section
              className={
                styles.card
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
                    Items
                  </span>

                  <h2>
                    Order Items
                  </h2>
                </div>

                <span>
                  {items.length}{" "}
                  {items.length ===
                  1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div
                className={
                  styles.items
                }
              >
                {items.length ===
                0 ? (
                  <div
                    className={
                      styles.emptyItems
                    }
                  >
                    No items found
                  </div>
                ) : (
                  items.map(
                    (
                      item,
                      index,
                    ) => {
                      const quantity =
                        getItemQuantity(
                          item,
                        );

                      const price =
                        getItemPrice(
                          item,
                        );

                      const originalPrice =
                        getItemOriginalPrice(
                          item,
                        );

                      const itemSubtotal =
                        getItemSubtotal(
                          item,
                        );

                      const itemOfferDiscount =
                        getItemOfferDiscount(
                          item,
                        );

                      const image =
                        getProductImage(
                          item,
                        );

                      return (
                        <article
                          className={
                            styles.item
                          }
                          key={
                            item?._id ||
                            item?.id ||
                            index
                          }
                        >
                          <div
                            className={
                              styles.image
                            }
                          >
                            {image ? (
                              <img
                                src={
                                  image
                                }
                                alt={getProductName(
                                  item,
                                )}
                              />
                            ) : (
                              <FiPackage
                                size={
                                  20
                                }
                              />
                            )}
                          </div>

                          <div
                            className={
                              styles.itemInfo
                            }
                          >
                            <strong>
                              {getProductName(
                                item,
                              )}
                            </strong>

                            {getProductSku(
                              item,
                            ) && (
                              <span>
                                SKU:{" "}
                                {getProductSku(
                                  item,
                                )}
                              </span>
                            )}

                            <span>
                              Qty:{" "}
                              {
                                quantity
                              }
                            </span>

                            <span>
                              {formatCurrency(
                                price,
                              )}{" "}
                              each
                            </span>

                            {originalPrice >
                              price && (
                              <span>
                                Original:{" "}
                                {formatCurrency(
                                  originalPrice,
                                )}
                              </span>
                            )}

                            {itemOfferDiscount >
                              0 && (
                              <span>
                                Offer
                                saved:{" "}
                                {formatCurrency(
                                  itemOfferDiscount,
                                )}
                              </span>
                            )}

                            {item?.offerName && (
                              <span>
                                {
                                  item.offerName
                                }
                              </span>
                            )}
                          </div>

                          <strong>
                            {formatCurrency(
                              itemSubtotal,
                            )}
                          </strong>
                        </article>
                      );
                    },
                  )
                )}
              </div>
            </section>

            <section
              className={
                styles.card
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
                    Delivery
                  </span>

                  <h2>
                    Shipping Address
                  </h2>
                </div>

                <FiMapPin
                  size={18}
                />
              </div>

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

                <span>
                  {
                    order
                      .shippingAddress
                      ?.phone
                  }
                </span>

                {order
                  .shippingAddress
                  ?.email && (
                  <span>
                    {
                      order
                        .shippingAddress
                        .email
                    }
                  </span>
                )}

                <span>
                  {
                    order
                      .shippingAddress
                      ?.addressLine1
                  }
                </span>

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

                <span>
                  {order
                    .shippingAddress
                    ?.country ||
                    "India"}
                </span>
              </div>
            </section>

            <div
              className={
                styles.actions
              }
            >
              <Link
                to={`/order/${id}/tracking`}
                className={
                  styles.primaryButton
                }
              >
                Track Order
              </Link>

              {isOnlinePayment &&
                paymentStatus !==
                  "paid" &&
                orderStatus !==
                  "cancelled" && (
                  <button
                    type="button"
                    className={
                      styles.secondaryButton
                    }
                    onClick={() =>
                      navigate(
                        `/order/${id}/payment`,
                      )
                    }
                  >
                    Complete Payment
                  </button>
                )}

              {canCancel && (
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={
                    handleCancel
                  }
                  disabled={
                    cancelling
                  }
                >
                  <FiX
                    size={15}
                  />

                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              )}
            </div>
          </div>

          <aside>
            <section
              className={
                styles.summary
              }
            >
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Payment
              </span>

              <h2>
                Order Summary
              </h2>

              <div
                className={
                  styles.summaryRows
                }
              >
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatCurrency(
                      subtotal,
                    )}
                  </strong>
                </div>

                {offerDiscount >
                  0 && (
                  <div>
                    <span>
                      Offer Discount
                    </span>

                    <strong>
                      -
                      {formatCurrency(
                        offerDiscount,
                      )}
                    </strong>
                  </div>
                )}

                {offerDiscount >
                  0 && (
                  <div>
                    <span>
                      Offer Price
                    </span>

                    <strong>
                      {formatCurrency(
                        offerSubtotal,
                      )}
                    </strong>
                  </div>
                )}

                {couponDiscount >
                  0 && (
                  <div>
                    <span>
                      Coupon
                      {order.couponCode
                        ? ` (${order.couponCode})`
                        : ""}
                    </span>

                    <strong>
                      -
                      {formatCurrency(
                        couponDiscount,
                      )}
                    </strong>
                  </div>
                )}

                {totalDiscount >
                  0 && (
                  <div>
                    <span>
                      Total Discount
                    </span>

                    <strong>
                      -
                      {formatCurrency(
                        totalDiscount,
                      )}
                    </strong>
                  </div>
                )}

                <div>
                  <span>
                    Shipping
                  </span>

                  <strong>
                    {shippingFee ===
                    0
                      ? "Free"
                      : formatCurrency(
                          shippingFee,
                        )}
                  </strong>
                </div>

                <div
                  className={
                    styles.total
                  }
                >
                  <span>
                    Total
                  </span>

                  <strong>
                    {formatCurrency(
                      total,
                    )}
                  </strong>
                </div>
              </div>

              <div
                className={
                  styles.paymentInfo
                }
              >
                <span>
                  Payment Method
                </span>

                <strong>
                  {isOnlinePayment
                    ? "Online Payment"
                    : "Cash on Delivery"}
                </strong>

                <span>
                  Payment Status
                </span>

                <strong>
                  {formatStatus(
                    paymentStatus,
                  )}
                </strong>

                {order.paymentId && (
                  <>
                    <span>
                      Payment ID
                    </span>

                    <strong
                      className={
                        styles.paymentId
                      }
                    >
                      {
                        order.paymentId
                      }
                    </strong>
                  </>
                )}
              </div>
            </section>

            {(order.deliveredAt ||
              order.cancelledAt) && (
              <section
                className={
                  styles.card
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
                      Order Activity
                    </span>

                    <h2>
                      Status Information
                    </h2>
                  </div>
                </div>

                {order.deliveredAt && (
                  <div
                    className={
                      styles.activityRow
                    }
                  >
                    <span>
                      Delivered
                    </span>

                    <strong>
                      {formatDateTime(
                        order.deliveredAt,
                      )}
                    </strong>
                  </div>
                )}

                {order.cancelledAt && (
                  <div
                    className={
                      styles.activityRow
                    }
                  >
                    <span>
                      Cancelled
                    </span>

                    <strong>
                      {formatDateTime(
                        order.cancelledAt,
                      )}
                    </strong>
                  </div>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default OrderDetails;