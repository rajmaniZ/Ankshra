import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  FiCheck,
  FiPackage,
} from "react-icons/fi";

import {
  getOrderById,
} from "../../services/orderService";

import styles from "./OrderSuccess.module.css";

function getResponseData(response) {
  return (
    response?.data ||
    response ||
    {}
  );
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
    Number(value || 0),
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

function getPaymentMethodLabel(
  paymentMethod,
) {
  if (
    paymentMethod === "online"
  ) {
    return "Online Payment";
  }

  if (
    paymentMethod === "cod"
  ) {
    return "Cash On Delivery";
  }

  return formatStatus(
    paymentMethod,
  );
}

function OrderSuccess() {
  const [
    searchParams,
  ] = useSearchParams();

  const orderId =
    searchParams.get(
      "orderId",
    );

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

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderId) {
        setError(
          "Order information is missing.",
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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

        if (active) {
          setOrder(
            data.order,
          );
        }
      } catch (
        requestError
      ) {
        if (active) {
          setError(
            requestError?.message ||
              "Unable to load your order.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

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
              Order unavailable
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
              View My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const id =
    order._id ||
    order.id;

  const orderNumber =
    order.orderNumber ||
    id;

  /*
   * These values come directly from
   * the backend-created order.
   *
   * Do not recalculate pricing here.
   */
  const subtotal =
    Number(
      order.subtotal,
    ) || 0;

  const offerDiscount =
    Number(
      order.offerDiscount,
    ) || 0;

  const couponDiscount =
    Number(
      order.couponDiscount,
    ) || 0;

  const shippingFee =
    Number(
      order.shippingFee,
    ) || 0;

  const total =
    Number(
      order.total,
    ) || 0;

  const paymentStatus =
    order.paymentStatus ||
    "pending";

  const orderStatus =
    order.orderStatus ||
    "pending";

  return (
    <main className={styles.page}>
      <div
        className={
          styles.container
        }
      >
        <section
          className={
            styles.successCard
          }
        >
          <div
            className={
              styles.icon
            }
          >
            <FiCheck size={30} />
          </div>

          <span
            className={
              styles.eyebrow
            }
          >
            Order Confirmed
          </span>

          <h1>
            Thank you for your
            order
          </h1>

          <p
            className={
              styles.message
            }
          >
            Your jewellery order has
            been placed successfully.
          </p>

          <div
            className={
              styles.orderNumber
            }
          >
            <span>
              Order Number
            </span>

            <strong>
              {orderNumber}
            </strong>
          </div>

          <div
            className={
              styles.meta
            }
          >
            <div>
              <span>
                Placed On
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
                {getPaymentMethodLabel(
                  order.paymentMethod,
                )}
              </strong>
            </div>

            <div>
              <span>
                Payment Status
              </span>

              <strong
                className={
                  paymentStatus ===
                  "paid"
                    ? styles.statusSuccess
                    : styles.statusPending
                }
              >
                {formatStatus(
                  paymentStatus,
                )}
              </strong>
            </div>

            <div>
              <span>
                Order Status
              </span>

              <strong>
                {formatStatus(
                  orderStatus,
                )}
              </strong>
            </div>
          </div>

          <div
            className={
              styles.orderInfo
            }
          >
            <div
              className={
                styles.priceRow
              }
            >
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
              <div
                className={
                  styles.priceRow
                }
              >
                <span>
                  Offer Discount
                </span>

                <strong
                  className={
                    styles.discount
                  }
                >
                  -
                  {formatCurrency(
                    offerDiscount,
                  )}
                </strong>
              </div>
            )}

            {couponDiscount > 0 && (
              <div
                className={
                  styles.priceRow
                }
              >
                <span>
                  Coupon Discount
                </span>

                <strong
                  className={
                    styles.discount
                  }
                >
                  -
                  {formatCurrency(
                    couponDiscount,
                  )}
                </strong>
              </div>
            )}

            <div
              className={
                styles.priceRow
              }
            >
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
                `${styles.priceRow} ${styles.totalRow}`
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
              styles.actions
            }
          >
            <Link
              to={`/order/${id}`}
              className={
                styles.primaryButton
              }
            >
              <FiPackage
                size={16}
              />

              View Order
            </Link>

            <Link
              to={`/order/${id}/tracking`}
              className={
                styles.secondaryButton
              }
            >
              Track Order
            </Link>

            <Link
              to="/shop"
              className={
                styles.secondaryButton
              }
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderSuccess;