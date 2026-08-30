import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiCreditCard,
  FiLoader,
} from "react-icons/fi";

import {
  getOrderById,
} from "../../services/orderService";

import {
  createPaymentOrder,
  getPaymentStatus,
  verifyPayment,
} from "../../services/paymentService";

import styles from "./OrderPayment.module.css";

function getResponseData(
  response,
) {
  return (
    response?.data ||
    response ||
    {}
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

function loadRazorpayScript() {
  return new Promise(
    (resolve) => {
      if (
        window.Razorpay
      ) {
        resolve(true);
        return;
      }

      const existing =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
        );

      if (existing) {
        existing.addEventListener(
          "load",
          () => resolve(true),
          {
            once: true,
          },
        );

        existing.addEventListener(
          "error",
          () => resolve(false),
          {
            once: true,
          },
        );

        return;
      }

      const script =
        document.createElement(
          "script",
        );

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script,
      );
    },
  );
}

function OrderPayment() {
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
    paying,
    setPaying,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const paymentStarted =
    useRef(false);

  const loadOrder =
    async () => {
      if (!orderId) {
        setError(
          "Order ID is missing.",
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
        setLoading(false);
      }
    };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const refreshPaymentState =
    async () => {
      if (!orderId) {
        return;
      }

      try {
        const [
          orderResponse,
          paymentResponse,
        ] =
          await Promise.all([
            getOrderById(
              orderId,
            ),
            getPaymentStatus(
              orderId,
            ),
          ]);

        const orderData =
          getResponseData(
            orderResponse,
          );

        const paymentData =
          getResponseData(
            paymentResponse,
          );

        const backendOrder =
          orderData?.order;

        const payment =
          paymentData?.payment;

        if (
          backendOrder
        ) {
          setOrder(
            backendOrder,
          );

          return backendOrder;
        }

        if (
          order &&
          payment
        ) {
          const updatedOrder =
            {
              ...order,
              paymentStatus:
                payment.paymentStatus,
              paymentId:
                payment.paymentId,
              orderStatus:
                payment.orderStatus,
            };

          setOrder(
            updatedOrder,
          );

          return updatedOrder;
        }

        return null;
      } catch (
        refreshError
      ) {
        console.error(
          "Failed to refresh payment state:",
          refreshError,
        );

        return null;
      }
    };

  const handlePayment =
    async () => {
      if (
        !order?._id ||
        paymentStarted.current
      ) {
        return;
      }

      if (
        order.paymentStatus ===
        "paid"
      ) {
        return;
      }

      if (
        order.orderStatus ===
        "cancelled"
      ) {
        setError(
          "Cancelled orders cannot be paid.",
        );
        return;
      }

      setError("");
      setPaying(true);
      paymentStarted.current = true;

      try {
        const loaded =
          await loadRazorpayScript();

        if (!loaded) {
          throw new Error(
            "Unable to load Razorpay checkout.",
          );
        }

        /*
         * The backend creates the Razorpay
         * order using the stored order.total.
         *
         * Never send amount from the frontend.
         */
        const response =
          await createPaymentOrder(
            order._id,
          );

        const data =
          getResponseData(
            response,
          );

        const payment =
          data?.payment;

        if (
          !payment?.razorpayOrderId ||
          !payment?.keyId
        ) {
          throw new Error(
            "Payment information was not returned by the server.",
          );
        }

        const razorpay =
          new window.Razorpay({
            key: payment.keyId,

            amount:
              payment.amount,

            currency:
              payment.currency ||
              "INR",

            name:
              "ankshra jewellary",

            description:
              `Payment for ${
                order.orderNumber ||
                order._id
              }`,

            order_id:
              payment.razorpayOrderId,

            prefill: {
              name:
                order.shippingAddress
                  ?.fullName ||
                "",

              email:
                order.shippingAddress
                  ?.email ||
                "",

              contact:
                order.shippingAddress
                  ?.phone ||
                "",
            },

            notes: {
              orderId:
                order._id,

              orderNumber:
                order.orderNumber ||
                "",
            },

            theme: {
              color: "#222222",
            },

            handler:
              async (
                razorpayResponse,
              ) => {
                try {
                  setError("");

                  await verifyPayment({
                    orderId:
                      order._id,

                    razorpayOrderId:
                      razorpayResponse.razorpay_order_id,

                    razorpayPaymentId:
                      razorpayResponse.razorpay_payment_id,

                    razorpaySignature:
                      razorpayResponse.razorpay_signature,
                  });

                  /*
                   * Verification has completed on
                   * the backend. Fetch the canonical
                   * order again so success/details
                   * pages receive the actual stored
                   * payment state.
                   */
                  const verifiedOrder =
                    await refreshPaymentState();

                  navigate(
                    `/order/success?orderId=${order._id}`,
                    {
                      replace: true,
                      state: {
                        order:
                          verifiedOrder ||
                          undefined,
                      },
                    },
                  );
                } catch (
                  verificationError
                ) {
                  setError(
                    verificationError?.message ||
                      "Payment verification failed.",
                  );

                  setPaying(false);
                  paymentStarted.current =
                    false;
                }
              },

            modal: {
              ondismiss: () => {
                setPaying(false);
                paymentStarted.current =
                  false;
              },
            },
          });

        razorpay.on(
          "payment.failed",
          (
            paymentError,
          ) => {
            setError(
              paymentError?.error
                ?.description ||
                "Payment failed. Please try again.",
            );

            setPaying(false);
            paymentStarted.current =
              false;
          },
        );

        razorpay.open();
      } catch (
        paymentError
      ) {
        setError(
          paymentError?.message ||
            "Unable to start payment.",
        );

        setPaying(false);
        paymentStarted.current =
          false;
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
            Loading payment...
          </div>
        </div>
      </main>
    );
  }

  if (error && !order) {
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
              Payment unavailable
            </h1>

            <p>
              {error}
            </p>

            <Link
              to="/account/orders"
              className={
                styles.button
              }
            >
              View Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const id =
    order._id ||
    order.id;

  const total =
    Number(order.total) || 0;

  if (
    order.paymentStatus ===
    "paid"
  ) {
    return (
      <main className={styles.page}>
        <div
          className={
            styles.container
          }
        >
          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.icon
              }
            >
              <FiCreditCard
                size={25}
              />
            </div>

            <h1>
              Payment already completed
            </h1>

            <p>
              This order has already
              been paid.
            </p>

            <div
              className={
                styles.orderInfo
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
                  Amount
                </span>

                <strong>
                  {formatCurrency(
                    total,
                  )}
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

            <Link
              to={`/order/${id}`}
              className={
                styles.button
              }
            >
              View Order
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (
    order.orderStatus ===
    "cancelled"
  ) {
    return (
      <main className={styles.page}>
        <div
          className={
            styles.container
          }
        >
          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.icon
              }
            >
              <FiCreditCard
                size={25}
              />
            </div>

            <h1>
              Order Cancelled
            </h1>

            <p>
              This order can no longer
              be paid.
            </p>

            <Link
              to={`/order/${id}`}
              className={
                styles.button
              }
            >
              View Order
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div
        className={
          styles.container
        }
      >
        <section className={styles.card}>
          <div
            className={
              styles.icon
            }
          >
            <FiCreditCard
              size={25}
            />
          </div>

          <span
            className={
              styles.eyebrow
            }
          >
            Secure Payment
          </span>

          <h1>
            Complete your payment
          </h1>

          <p>
            Pay securely using
            Razorpay to confirm your
            order.
          </p>

          <div
            className={
              styles.orderInfo
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
                Amount
              </span>

              <strong>
                {formatCurrency(
                  total,
                )}
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

          {error && (
            <div
              className={
                styles.error
              }
            >
              {error}
            </div>
          )}

          <button
            type="button"
            className={
              styles.payButton
            }
            onClick={
              handlePayment
            }
            disabled={paying}
          >
            {paying ? (
              <>
                <FiLoader
                  className={
                    styles.spinner
                  }
                />
                Processing...
              </>
            ) : (
              <>
                <FiCreditCard
                  size={17}
                />
                Pay{" "}
                {formatCurrency(
                  total,
                )}
              </>
            )}
          </button>

          <Link
            to={`/order/${id}`}
            className={
              styles.cancelLink
            }
          >
            Back to Order
          </Link>
        </section>
      </div>
    </main>
  );
}

export default OrderPayment;