import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FiPackage,
} from "react-icons/fi";

import {
  getOrders,
} from "../../services/orderService";

import styles from "./Orders.module.css";

function getResponseData(response) {
  return response?.data || response || {};
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

function getOrderId(order) {
  return (
    order?._id ||
    order?.id ||
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
  return (
    item?.product ||
    item ||
    {}
  );
}

function getProductName(item) {
  const product =
    getProduct(item);

  return (
    item?.name ||
    product?.name ||
    "Product"
  );
}

function getProductImage(item) {
  const product =
    getProduct(item);

  const images =
    product?.images;

  if (
    Array.isArray(images) &&
    images.length > 0
  ) {
    const image =
      images[0];

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

  if (
    product?.image &&
    typeof product.image ===
      "object"
  ) {
    return (
      product.image.url ||
      product.image.secure_url ||
      ""
    );
  }

  return (
    product?.image ||
    item?.image ||
    ""
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

function getOrderTotal(order) {
  const value =
    Number(order?.total);

  return Number.isFinite(value)
    ? value
    : 0;
}

function getOrderSubtotal(order) {
  const value =
    Number(order?.subtotal);

  return Number.isFinite(value)
    ? value
    : 0;
}

function getShippingFee(order) {
  const value =
    Number(order?.shippingFee);

  return Number.isFinite(value)
    ? value
    : 0;
}

function getOrderDiscount(order) {
  const value =
    Number(order?.discount);

  return Number.isFinite(value)
    ? value
    : 0;
}

function getOfferDiscount(order) {
  const value =
    Number(
      order?.offerDiscount,
    );

  return Number.isFinite(value)
    ? value
    : 0;
}

function getCouponDiscount(order) {
  const value =
    Number(
      order?.couponDiscount,
    );

  return Number.isFinite(value)
    ? value
    : 0;
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
  const price =
    getItemPrice(item);

  const quantity =
    getQuantity(item);

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

  return price * quantity;
}

function formatCurrency(value) {
  const amount =
    Number(value);

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
    String(status || "")
      .toLowerCase();

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
    value === "shipped"
  ) {
    return styles.shipped;
  }

  if (
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

function Orders() {
  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
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
          View and track your
          recent jewellery orders.
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
              index,
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

              const status =
                formatStatus(
                  rawStatus,
                );

              const subtotal =
                getOrderSubtotal(
                  order,
                );

              const shipping =
                getShippingFee(
                  order,
                );

              const discount =
                getOrderDiscount(
                  order,
                );

              const offerDiscount =
                getOfferDiscount(
                  order,
                );

              const couponDiscount =
                getCouponDiscount(
                  order,
                );

              const total =
                getOrderTotal(
                  order,
                );

              const paymentStatus =
                formatStatus(
                  order?.paymentStatus ||
                    "pending",
                );

              const paymentMethod =
                order?.paymentMethod ===
                "online"
                  ? "Online Payment"
                  : "Cash on Delivery";

              return (
                <article
                  className={styles.card}
                  key={
                    orderId ||
                    orderNumber ||
                    index
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
                    className={styles.meta}
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

                  {items.length >
                    0 && (
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
                            const image =
                              getProductImage(
                                item,
                              );

                            const name =
                              getProductName(
                                item,
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

                                <div>
                                  <strong>
                                    {
                                      name
                                    }
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

                  {items.length >
                    3 && (
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
                          Coupon Discount
                        </span>

                        <strong>
                          -
                          {formatCurrency(
                            couponDiscount,
                          )}
                        </strong>
                      </div>
                    )}

                    {discount >
                      0 &&
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
                      {paymentMethod}
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
                            styles.viewButton
                          }
                        >
                          View Order
                        </Link>

                        <Link
                          to={`/account/orders/${orderId}/tracking`}
                          className={
                            styles.viewButton
                          }
                        >
                          Track Order
                        </Link>

                        {order?.paymentMethod ===
                          "online" &&
                          order?.paymentStatus !==
                            "paid" &&
                          rawStatus !==
                            "cancelled" && (
                            <Link
                              to={`/account/orders/${orderId}/payment`}
                              className={
                                styles.viewButton
                              }
                            >
                              Pay Now
                            </Link>
                          )}
                      </>
                    )}
                  </div>
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