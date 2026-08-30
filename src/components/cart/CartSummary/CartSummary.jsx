import Button from "../../common/Button/Button";

import styles from "./CartSummary.module.css";

function CartSummary({
  subtotal = 0,
  discount = 0,
  finalSubtotal,
  shipping = 0,
  tax = 0,
  onCheckout,
}) {
  const originalSubtotal =
    Number(subtotal) || 0;

  const offerDiscount =
    Number(discount) || 0;

  const discountedSubtotal =
    Number.isFinite(
      Number(finalSubtotal),
    )
      ? Number(finalSubtotal)
      : Math.max(
          originalSubtotal -
            offerDiscount,
          0,
        );

  const shippingAmount =
    Number(shipping) || 0;

  const taxAmount =
    Number(tax) || 0;

  const total =
    discountedSubtotal +
    shippingAmount +
    taxAmount;

  const formatPrice = (value) =>
    `₹${Number(value).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;

  return (
    <aside className={styles.summary}>
      <h2 className={styles.title}>
        Order Summary
      </h2>

      <div className={styles.rows}>
        <div className={styles.row}>
          <span>Subtotal</span>

          <span>
            {formatPrice(
              originalSubtotal,
            )}
          </span>
        </div>

        {offerDiscount > 0 && (
          <div
            className={
              styles.discount
            }
          >
            <span>
              Offer Discount
            </span>

            <span>
              -{formatPrice(
                offerDiscount,
              )}
            </span>
          </div>
        )}

        {offerDiscount > 0 && (
          <div
            className={
              styles.offerTotal
            }
          >
            <span>
              Offer Price
            </span>

            <strong>
              {formatPrice(
                discountedSubtotal,
              )}
            </strong>
          </div>
        )}

        <div className={styles.row}>
          <span>Shipping</span>

          <span>
            {shippingAmount === 0
              ? "Free"
              : formatPrice(
                  shippingAmount,
                )}
          </span>
        </div>

        {taxAmount > 0 && (
          <div
            className={styles.row}
          >
            <span>Tax</span>

            <span>
              {formatPrice(
                taxAmount,
              )}
            </span>
          </div>
        )}
      </div>

      <div className={styles.total}>
        <span>Total</span>

        <strong>
          {formatPrice(total)}
        </strong>
      </div>

      {offerDiscount > 0 && (
        <div
          className={styles.savings}
        >
          <span>
            You save
          </span>

          <strong>
            {formatPrice(
              offerDiscount,
            )}
          </strong>
        </div>
      )}

      <Button
        fullWidth
        size="large"
        onClick={onCheckout}
        disabled={total <= 0}
      >
        Proceed to Checkout
      </Button>
    </aside>
  );
}

export default CartSummary;