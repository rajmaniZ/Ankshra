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

import OrderReview from "../../components/review/OrderReview/OrderReview";

import styles from "./OrderDetails.module.css";

function getResponseData(response) {
  return response?.data || response || {};
}

function getProduct(item) {
  if (item?.product && typeof item.product === "object") {
    return item.product;
  }

  return {};
}

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
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

  return "";
}

function getProductImage(item) {
  const product = getProduct(item);

  if (Array.isArray(item?.images) && item.images.length > 0) {
    const image = getImageUrl(item.images[0]);

    if (image) {
      return image;
    }
  }

  const itemImage = getImageUrl(item?.image);

  if (itemImage) {
    return itemImage;
  }

  const itemImageUrl = getImageUrl(item?.imageUrl);

  if (itemImageUrl) {
    return itemImageUrl;
  }

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const image = getImageUrl(product.images[0]);

    if (image) {
      return image;
    }
  }

  const productImage = getImageUrl(product?.image);

  if (productImage) {
    return productImage;
  }

  const productImageUrl = getImageUrl(product?.imageUrl);

  if (productImageUrl) {
    return productImageUrl;
  }

  return "";
}

function getProductName(item) {
  const product = getProduct(item);

  return (
    item?.name ||
    item?.productName ||
    product?.name ||
    product?.title ||
    "Jewellery"
  );
}

function getProductSku(item) {
  const product = getProduct(item);

  return (
    item?.sku ||
    item?.productSku ||
    product?.sku ||
    ""
  );
}

function getProductId(item) {
  const product = getProduct(item);

  return (
    item?.productId ||
    product?._id ||
    product?.id ||
    ""
  );
}

function getItemPrice(item) {
  const price = Number(
    item?.price ??
      item?.sellingPrice ??
      item?.unitPrice ??
      0,
  );

  return Number.isFinite(price) ? price : 0;
}

function getItemOriginalPrice(item) {
  const price = Number(
    item?.originalPrice ??
      item?.mrp ??
      getItemPrice(item),
  );

  return Number.isFinite(price) ? price : 0;
}

function getItemQuantity(item) {
  const quantity = Number(
    item?.quantity ??
      item?.qty ??
      1,
  );

  return Number.isFinite(quantity) && quantity > 0
    ? quantity
    : 1;
}

function getItemSubtotal(item) {
  const storedSubtotal = Number(
    item?.subtotal ??
      item?.total ??
      item?.lineTotal,
  );

  if (Number.isFinite(storedSubtotal)) {
    return storedSubtotal;
  }

  return (
    getItemPrice(item) *
    getItemQuantity(item)
  );
}

function getItemOfferDiscount(item) {
  const discount = Number(
    item?.offerDiscount ??
      item?.discount ??
      0,
  );

  if (Number.isFinite(discount) && discount > 0) {
    return discount;
  }

  return Math.max(
    getItemOriginalPrice(item) *
      getItemQuantity(item) -
      getItemSubtotal(item),
    0,
  );
}

function getItems(order) {
  if (Array.isArray(order?.items)) {
    return order.items;
  }

  if (Array.isArray(order?.orderItems)) {
    return order.orderItems;
  }

  return [];
}

function getOrderTotal(order) {
  const value = Number(
    order?.total ??
      order?.grandTotal ??
      order?.totalAmount,
  );

  if (Number.isFinite(value)) {
    return value;
  }

  const subtotal = getOrderSubtotal(order);
  const discount = getOrderDiscount(order);
  const shipping = getShippingFee(order);

  return Math.max(
    subtotal - discount + shipping,
    0,
  );
}

function getOrderSubtotal(order) {
  const value = Number(order?.subtotal);

  if (Number.isFinite(value)) {
    return value;
  }

  return getItems(order).reduce(
    (total, item) =>
      total +
      getItemOriginalPrice(item) *
        getItemQuantity(item),
    0,
  );
}

function getOrderDiscount(order) {
  const directDiscount = Number(
    order?.totalDiscount ??
      order?.discount,
  );

  if (
    Number.isFinite(directDiscount) &&
    directDiscount >= 0
  ) {
    return directDiscount;
  }

  const offerDiscount = Number(
    order?.offerDiscount ?? 0,
  );

  const couponDiscount = Number(
    order?.couponDiscount ?? 0,
  );

  return (
    (Number.isFinite(offerDiscount)
      ? offerDiscount
      : 0) +
    (Number.isFinite(couponDiscount)
      ? couponDiscount
      : 0)
  );
}

function getOfferDiscount(order) {
  const direct = Number(
    order?.offerDiscount,
  );

  if (Number.isFinite(direct)) {
    return direct;
  }

  return getItems(order).reduce(
    (total, item) =>
      total + getItemOfferDiscount(item),
    0,
  );
}

function getCouponDiscount(order) {
  const value = Number(
    order?.couponDiscount ?? 0,
  );

  return Number.isFinite(value) ? value : 0;
}

function getShippingFee(order) {
  const value = Number(
    order?.shippingFee ??
      order?.shippingCost ??
      order?.deliveryFee ??
      0,
  );

  return Number.isFinite(value) ? value : 0;
}

function getOrderStatus(order) {
  return (
    order?.orderStatus ||
    order?.status ||
    "pending"
  );
}

function getPaymentStatus(order) {
  return order?.paymentStatus || "pending";
}

function getPaymentMethod(order) {
  const method = String(
    order?.paymentMethod || "",
  ).toLowerCase();

  if (
    method === "cod" ||
    method === "cash_on_delivery"
  ) {
    return "Cash on Delivery";
  }

  if (method === "online") {
    return "Online Payment";
  }

  return order?.paymentMethod || "—";
}

function getOrderNumber(order) {
  return (
    order?.orderNumber ||
    order?.orderNo ||
    order?._id ||
    order?.id ||
    "—"
  );
}

function getAddress(order) {
  return (
    order?.shippingAddress ||
    order?.address ||
    {}
  );
}

function formatCurrency(value) {
  const amount = Number(value);

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

  if (Number.isNaN(date.getTime())) {
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

function formatStatus(value) {
  return String(
    value || "pending",
  )
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function isDelivered(order) {
  return (
    String(
      getOrderStatus(order),
    ).toLowerCase() === "delivered"
  );
}

function OrderDetails() {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [cancelling, setCancelling] =
    useState(false);

  const [reviewRefreshKey, setReviewRefreshKey] =
    useState(0);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (!orderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getOrderById(orderId);

        const data =
          getResponseData(response);

        if (!data?.order) {
          throw new Error(
            "Order was not returned by the server.",
          );
        }

        if (mounted) {
          setOrder(data.order);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError?.message ||
              "Unable to load order details.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handleCancel = async () => {
    if (!orderId || cancelling) {
      return;
    }

    const reason = window.prompt(
      "Enter cancellation reason:",
      "",
    );

    if (reason === null) {
      return;
    }

    try {
      setCancelling(true);
      setError("");

      const response =
        await cancelOrder(
          orderId,
          reason.trim(),
        );

      const data =
        getResponseData(response);

      if (data?.order) {
        setOrder(data.order);
      } else {
        setOrder((current) => ({
          ...current,
          orderStatus: "cancelled",
          status: "cancelled",
        }));
      }
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to cancel this order.",
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSuccess = () => {
    setReviewRefreshKey(
      (current) => current + 1,
    );
  };

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.state}>
          Loading order details...
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className={styles.page}>
        <div className={styles.errorState}>
          <h1>Order not found</h1>

          <p>
            {error ||
              "The requested order could not be found."}
          </p>

          <Link
            to="/account/orders"
            className={styles.button}
          >
            <FiArrowLeft size={15} />
            Back to Orders
          </Link>
        </div>
      </section>
    );
  }

  const items = getItems(order);

  const subtotal =
    getOrderSubtotal(order);

  const offerDiscount =
    getOfferDiscount(order);

  const couponDiscount =
    getCouponDiscount(order);

  const totalDiscount =
    getOrderDiscount(order);

  const shippingFee =
    getShippingFee(order);

  const total =
    getOrderTotal(order);

  const orderStatus =
    getOrderStatus(order);

  const paymentStatus =
    getPaymentStatus(order);

  const address =
    getAddress(order);

  const delivered =
    isDelivered(order);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <Link
          to="/account/orders"
          className={styles.backLink}
        >
          <FiArrowLeft size={15} />
          Back to Orders
        </Link>

        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Order
            </span>

            <h1>
              #{getOrderNumber(order)}
            </h1>

            <p>
              Placed{" "}
              {formatDateTime(
                order.createdAt ||
                  order.date,
              )}
            </p>
          </div>

          <div
            className={`${styles.status} ${
              orderStatus === "cancelled"
                ? styles.cancelled
                : ""
            }`}
          >
            {formatStatus(orderStatus)}
          </div>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.grid}>
          <main>
            <section className={styles.card}>
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
                    Products
                  </span>

                  <h2>
                    Order Items
                  </h2>
                </div>

                <span>
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}
                </span>
              </div>

              {items.length === 0 ? (
                <div
                  className={
                    styles.emptyItems
                  }
                >
                  No items found.
                </div>
              ) : (
                <div className={styles.items}>
                  {items.map(
                    (item, index) => {
                      const productImage =
                        getProductImage(item);

                      const productName =
                        getProductName(item);

                      const productSku =
                        getProductSku(item);

                      const productId =
                        getProductId(item);

                      const quantity =
                        getItemQuantity(item);

                      const itemSubtotal =
                        getItemSubtotal(item);

                      return (
                        <div
                          key={
                            item?._id ||
                            productId ||
                            productSku ||
                            index
                          }
                          className={
                            styles.item
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
                                }}
                              />
                            ) : (
                              <FiPackage
                                size={25}
                              />
                            )}
                          </div>

                          <div
                            className={
                              styles.itemInfo
                            }
                          >
                            <strong>
                              {productName}
                            </strong>

                            {productSku && (
                              <span>
                                SKU:{" "}
                                {
                                  productSku
                                }
                              </span>
                            )}

                            <span>
                              Qty:{" "}
                              {quantity}
                            </span>
                          </div>

                          <strong>
                            {formatCurrency(
                              itemSubtotal,
                            )}
                          </strong>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            <section className={styles.card}>
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
              </div>

              <div
                className={styles.address}
              >
                <FiMapPin size={18} />

                <div>
                  <strong>
                    {address.fullName ||
                      "—"}
                  </strong>

                  {address.phone && (
                    <span>
                      Phone:{" "}
                      {address.phone}
                    </span>
                  )}

                  {address.email && (
                    <span>
                      Email:{" "}
                      {address.email}
                    </span>
                  )}

                  {address.addressLine1 && (
                    <span>
                      {
                        address.addressLine1
                      }
                    </span>
                  )}

                  {address.addressLine2 && (
                    <span>
                      {
                        address.addressLine2
                      }
                    </span>
                  )}

                  {(address.city ||
                    address.state ||
                    address.postalCode) && (
                    <span>
                      {address.city ||
                        "—"}
                      ,{" "}
                      {address.state ||
                        "—"}{" "}
                      {
                        address.postalCode
                      }
                    </span>
                  )}

                  {address.country && (
                    <span>
                      {
                        address.country
                      }
                    </span>
                  )}
                </div>
              </div>
            </section>

            {delivered && (
              <OrderReview
                key={reviewRefreshKey}
                order={order}
                onReviewSuccess={
                  handleReviewSuccess
                }
              />
            )}

            {!delivered &&
              orderStatus !==
                "cancelled" && (
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
          </main>

          <aside>
            <section
              className={styles.summary}
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

                {offerDiscount > 0 && (
                  <div>
                    <span>
                      Offer Discount
                    </span>

                    <strong>
                      -{" "}
                      {formatCurrency(
                        offerDiscount,
                      )}
                    </strong>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div>
                    <span>
                      Coupon
                      {order.couponCode
                        ? ` (${order.couponCode})`
                        : ""}
                    </span>

                    <strong>
                      -{" "}
                      {formatCurrency(
                        couponDiscount,
                      )}
                    </strong>
                  </div>
                )}

                {totalDiscount > 0 && (
                  <div>
                    <span>
                      Total Discount
                    </span>

                    <strong>
                      -{" "}
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
                    {shippingFee === 0
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
                    {formatCurrency(total)}
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
                  {getPaymentMethod(
                    order,
                  )}
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

                {order.couponCode && (
                  <>
                    <span>
                      Coupon
                    </span>

                    <strong>
                      {
                        order.couponCode
                      }
                    </strong>
                  </>
                )}
              </div>
            </section>

            <section
              className={styles.summary}
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
                  styles.paymentInfo
                }
              >
                <span>
                  Order Number
                </span>

                <strong>
                  #{getOrderNumber(order)}
                </strong>

                <span>
                  Order Date
                </span>

                <strong>
                  {formatDate(
                    order.createdAt ||
                      order.date,
                  )}
                </strong>

                <span>
                  Order Status
                </span>

                <strong>
                  {formatStatus(
                    orderStatus,
                  )}
                </strong>

                {order.cancelledAt && (
                  <>
                    <span>
                      Cancelled
                    </span>

                    <strong>
                      {formatDateTime(
                        order.cancelledAt,
                      )}
                    </strong>
                  </>
                )}

                {order.cancellationReason && (
                  <>
                    <span>
                      Cancellation Reason
                    </span>

                    <strong>
                      {
                        order.cancellationReason
                      }
                    </strong>
                  </>
                )}
              </div>
            </section>

            {orderStatus !==
              "cancelled" &&
              orderStatus !==
                "delivered" && (
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={
                    handleCancel
                  }
                  disabled={cancelling}
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              )}

            <Link
              to={`/order/${orderId}/tracking`}
              className={
                styles.trackButton
              }
            >
              <FiPackage size={16} />
              Track Order
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default OrderDetails;