import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FiCreditCard,
  FiEye,
  FiPackage,
  FiStar,
  FiTruck,
  FiX,
} from "react-icons/fi";

import {
  getOrders,
} from "../../services/orderService";

import {
  getProductById,
} from "../../services/productService";

import OrderReview from "../../components/review/OrderReview/OrderReview";

import styles from "./Orders.module.css";

function getResponseData(response) {
  return (
    response?.data ||
    response ||
    {}
  );
}

function getOrderList(response) {
  const data =
    getResponseData(response);

  const possibleLists = [
    data?.orders,
    data?.data?.orders,
    response?.orders,
    Array.isArray(data)
      ? data
      : null,
  ];

  for (const value of possibleLists) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function getId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return (
      value._id ||
      value.id ||
      ""
    );
  }

  return String(value);
}

function getOrderId(order) {
  return (
    order?._id ||
    order?.id ||
    order?.orderId ||
    ""
  );
}

function getOrderNumber(order) {
  return (
    order?.orderNumber ||
    order?.orderId ||
    getOrderId(order)
  );
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
  const product =
    getProduct(item);

  return (
    getId(product) ||
    getId(item?.productId) ||
    getId(item?.productID) ||
    ""
  );
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

  const imageSources = [
    item?.image,
    item?.imageUrl,
    item?.productImage,
    itemImages[0],

    product?.image,
    product?.imageUrl,
    productImages[0],
  ];

  for (
    const image of imageSources
  ) {
    const imageUrl =
      getImageUrl(image);

    if (imageUrl) {
      return imageUrl;
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

function getQuantity(item) {
  const quantity =
    Number(item?.quantity);

  return Number.isFinite(
    quantity,
  ) && quantity > 0
    ? quantity
    : 1;
}

function getItemPrice(item) {
  const value =
    Number(
      item?.price ??
        item?.sellingPrice ??
        item?.unitPrice ??
        0,
    );

  return Number.isFinite(value)
    ? value
    : 0;
}

function getItemSubtotal(item) {
  const storedSubtotal =
    Number(
      item?.subtotal ??
        item?.total ??
        NaN,
    );

  if (
    Number.isFinite(
      storedSubtotal,
    )
  ) {
    return storedSubtotal;
  }

  return (
    getItemPrice(item) *
    getQuantity(item)
  );
}

function getNumber(
  value,
) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    getNumber(value),
  );
}

function formatDate(value) {
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
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function formatStatus(value) {
  const status =
    String(
      value || "pending",
    )
      .replaceAll(
        "_",
        " ",
      )
      .trim();

  if (!status) {
    return "Pending";
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

function getStatusClass(status) {
  const value =
    String(
      status || "",
    ).toLowerCase();

  if (
    value === "delivered"
  ) {
    return styles.delivered;
  }

  if (
    value === "cancelled"
  ) {
    return styles.cancelled;
  }

  if (
    value === "shipped" ||
    value === "out_for_delivery"
  ) {
    return styles.shipped;
  }

  if (
    value === "processing"
  ) {
    return styles.processing;
  }

  if (
    value === "confirmed"
  ) {
    return styles.confirmed;
  }

  return styles.pending;
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

function getPaymentMethod(order) {
  const method =
    String(
      order?.paymentMethod ||
        "",
    ).toLowerCase();

  if (method === "online") {
    return "Online Payment";
  }

  if (method === "cod") {
    return "Cash on Delivery";
  }

  return formatStatus(
    order?.paymentMethod ||
      "—",
  );
}

function Orders() {
  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    productData,
    setProductData,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    activeReviewOrderId,
    setActiveReviewOrderId,
  ] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response =
          await getOrders({
            limit: 50,
          });

        const orderList =
          getOrderList(
            response,
          );

        if (active) {
          setOrders(
            orderList,
          );
        }
      } catch (requestError) {
        if (active) {
          setOrders([]);

          setError(
            requestError?.message ||
              "Unable to load your orders.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadMissingProducts() {
      const missingIds = [];

      orders.forEach(
        (order) => {
          const items =
            Array.isArray(
              order?.items,
            )
              ? order.items
              : [];

          items.forEach(
            (item) => {
              const productId =
                getProductId(item);

              const image =
                getProductImage(
                  item,
                );

              if (
                productId &&
                !image &&
                !productData[
                  productId
                ]
              ) {
                missingIds.push(
                  productId,
                );
              }
            },
          );
        },
      );

      const uniqueIds = [
        ...new Set(
          missingIds,
        ),
      ];

      if (
        uniqueIds.length === 0
      ) {
        return;
      }

      const results =
        await Promise.all(
          uniqueIds.map(
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

      if (!active) {
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
                next[
                  productId
                ] = product;
              }
            },
          );

          return next;
        },
      );
    }

    loadMissingProducts();

    return () => {
      active = false;
    };
  }, [orders, productData]);

  const toggleReviews = (
    orderId,
  ) => {
    setActiveReviewOrderId(
      (current) =>
        String(current) ===
        String(orderId)
          ? ""
          : orderId,
    );
  };

  if (loading) {
    return (
      <section
        className={styles.page}
      >
        <div
          className={styles.state}
        >
          Loading your orders...
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.page}
    >
      <div
        className={styles.heading}
      >
        <span
          className={styles.eyebrow}
        >
          Purchase History
        </span>

        <h2>
          My Orders
        </h2>

        <p>
          View, track and review
          your recent jewellery
          orders.
        </p>
      </div>

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      )}

      {!error &&
        orders.length === 0 && (
          <div
            className={styles.empty}
          >
            <FiPackage size={25} />

            <h3>
              No orders yet
            </h3>

            <p>
              Your purchases will
              appear here.
            </p>

            <Link to="/shop">
              Start Shopping
            </Link>
          </div>
        )}

      {orders.length > 0 && (
        <div
          className={styles.list}
        >
          {orders.map(
            (
              order,
              orderIndex,
            ) => {
              const orderId =
                getOrderId(order);

              const orderNumber =
                getOrderNumber(
                  order,
                );

              const items =
                Array.isArray(
                  order?.items,
                )
                  ? order.items
                  : [];

              const rawStatus =
                order?.orderStatus ||
                order?.status ||
                "pending";

              const delivered =
                isDelivered(
                  order,
                );

              const status =
                formatStatus(
                  rawStatus,
                );

              const subtotal =
                getNumber(
                  order?.subtotal,
                );

              const shipping =
                getNumber(
                  order?.shippingFee,
                );

              const discount =
                getNumber(
                  order?.discount,
                );

              const offerDiscount =
                getNumber(
                  order?.offerDiscount,
                );

              const couponDiscount =
                getNumber(
                  order?.couponDiscount,
                );

              const total =
                getNumber(
                  order?.total,
                );

              const paymentStatus =
                formatStatus(
                  order?.paymentStatus ||
                    "pending",
                );

              const reviewOpen =
                String(
                  activeReviewOrderId,
                ) ===
                String(orderId);

              return (
                <article
                  className={`${styles.card} ${
                    reviewOpen
                      ? styles.cardExpanded
                      : ""
                  }`}
                  key={
                    orderId ||
                    orderNumber ||
                    orderIndex
                  }
                >
                  <div
                    className={
                      styles.cardHeader
                    }
                  >
                    <div>
                      <span>
                        Order
                      </span>

                      <strong>
                        #
                        {orderNumber}
                      </strong>
                    </div>

                    <div
                      className={`${styles.status} ${getStatusClass(
                        rawStatus,
                      )}`}
                    >
                      {status}
                    </div>
                  </div>

                  <div
                    className={
                      styles.meta
                    }
                  >
                    <span>
                      {formatDate(
                        order?.createdAt ||
                          order?.date,
                      )}
                    </span>

                    <span>
                      {items.length}{" "}
                      {items.length ===
                      1
                        ? "item"
                        : "items"}
                    </span>

                    <strong>
                      {formatCurrency(
                        total,
                      )}
                    </strong>
                  </div>

                  {items.length > 0 && (
                    <div
                      className={
                        styles.products
                      }
                    >
                      {items
                        .slice(0, 3)
                        .map(
                          (
                            item,
                            itemIndex,
                          ) => {
                            const productId =
                              getProductId(
                                item,
                              );

                            const product =
                              productId
                                ? productData[
                                    productId
                                  ]
                                : null;

                            const image =
                              getProductImage(
                                item,
                                product,
                              );

                            const name =
                              getProductName(
                                item,
                                product,
                              );

                            const quantity =
                              getQuantity(
                                item,
                              );

                            const itemSubtotal =
                              getItemSubtotal(
                                item,
                              );

                            return (
                              <div
                                className={
                                  styles.product
                                }
                                key={
                                  item?._id ||
                                  item?.id ||
                                  productId ||
                                  itemIndex
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
                                      alt={
                                        name
                                      }
                                    />
                                  ) : (
                                    <FiPackage
                                      size={
                                        17
                                      }
                                    />
                                  )}
                                </div>

                                <div
                                  className={
                                    styles.productInfo
                                  }
                                >
                                  <strong>
                                    {name}
                                  </strong>

                                  <span>
                                    Qty:{" "}
                                    {
                                      quantity
                                    }
                                  </span>

                                  <span>
                                    {formatCurrency(
                                      itemSubtotal,
                                    )}
                                  </span>
                                </div>
                              </div>
                            );
                          },
                        )}
                    </div>
                  )}

                  {items.length > 3 && (
                    <div
                      className={
                        styles.moreItems
                      }
                    >
                      +
                      {items.length -
                        3}{" "}
                      more{" "}
                      {items.length -
                        3 ===
                      1
                        ? "item"
                        : "items"}
                    </div>
                  )}

                  <div
                    className={
                      styles.pricing
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

                    {couponDiscount >
                      0 && (
                      <div>
                        <span>
                          {order?.couponCode
                            ? `Coupon (${order.couponCode})`
                            : "Coupon Discount"}
                        </span>

                        <strong>
                          -
                          {formatCurrency(
                            couponDiscount,
                          )}
                        </strong>
                      </div>
                    )}

                    {discount > 0 &&
                      offerDiscount ===
                        0 &&
                      couponDiscount ===
                        0 && (
                        <div>
                          <span>
                            Discount
                          </span>

                          <strong>
                            -
                            {formatCurrency(
                              discount,
                            )}
                          </strong>
                        </div>
                      )}

                    <div>
                      <span>
                        Shipping
                      </span>

                      <strong>
                        {shipping ===
                        0
                          ? "Free"
                          : formatCurrency(
                              shipping,
                            )}
                      </strong>
                    </div>

                    <div
                      className={
                        styles.orderTotal
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
                      styles.payment
                    }
                  >
                    <span>
                      {getPaymentMethod(
                        order,
                      )}
                    </span>

                    <span>
                      Payment:{" "}
                      {paymentStatus}
                    </span>
                  </div>

                  <div
                    className={
                      styles.actions
                    }
                  >
                    {orderId && (
                      <>
                        <Link
                          to={`/account/orders/${orderId}`}
                          className={
                            styles.actionButton
                          }
                        >
                          <FiEye
                            size={14}
                          />

                          View Order
                        </Link>

                        <Link
                          to={`/account/orders/${orderId}/tracking`}
                          className={
                            styles.actionButton
                          }
                        >
                          <FiTruck
                            size={14}
                          />

                          Track Order
                        </Link>

                        {delivered && (
                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.reviewButton} ${
                              reviewOpen
                                ? styles.reviewButtonActive
                                : ""
                            }`}
                            onClick={() =>
                              toggleReviews(
                                orderId,
                              )
                            }
                            aria-expanded={
                              reviewOpen
                            }
                          >
                            {reviewOpen ? (
                              <FiX
                                size={14}
                              />
                            ) : (
                              <FiStar
                                size={14}
                              />
                            )}

                            {reviewOpen
                              ? "Close Reviews"
                              : "Review Products"}
                          </button>
                        )}

                        {String(
                          order?.paymentMethod ||
                            "",
                        ).toLowerCase() ===
                          "online" &&
                          String(
                            order?.paymentStatus ||
                              "",
                          ).toLowerCase() !==
                            "paid" &&
                          String(
                            rawStatus,
                          ).toLowerCase() !==
                            "cancelled" && (
                            <Link
                              to={`/account/orders/${orderId}/payment`}
                              className={`${styles.actionButton} ${styles.payButton}`}
                            >
                              <FiCreditCard
                                size={
                                  14
                                }
                              />

                              Pay Now
                            </Link>
                          )}
                      </>
                    )}
                  </div>

                  {delivered &&
                    reviewOpen && (
                      <div
                        className={
                          styles.reviewPanel
                        }
                      >
                        <OrderReview
                          order={
                            order
                          }
                        />
                      </div>
                    )}
                </article>
              );
            },
          )}
        </div>
      )}
    </section>
  );
}

export default Orders;