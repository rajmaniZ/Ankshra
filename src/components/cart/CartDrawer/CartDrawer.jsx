import { Link } from "react-router-dom";

import CartItem from "../CartItem/CartItem";
import Button from "../../common/Button/Button";

import styles from "./CartDrawer.module.css";

function CartDrawer({
  isOpen,
  onClose,
  items = [],
  subtotal = 0,
  offerDiscount = 0,
  finalSubtotal = 0,
  onQuantityChange,
  onRemove,
  onCheckout,
}) {
  if (!isOpen) {
    return null;
  }

  const formatPrice = (value) =>
    `₹${Number(value).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <aside
        className={styles.drawer}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            Your Cart

            {items.length > 0 && (
              <span
                className={styles.count}
              >
                {items.length}
              </span>
            )}
          </h2>

          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <p>
                Your cart is empty.
              </p>

              <Link
                to="/shop"
                className={
                  styles.shopLink
                }
                onClick={onClose}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              <div
                className={styles.items}
              >
                {items.map((item) => (
                  <CartItem
                    key={
                      item._id ||
                      item.id ||
                      item.product?._id ||
                      item.product?.id
                    }
                    item={item}
                    onQuantityChange={
                      onQuantityChange
                    }
                    onRemove={onRemove}
                  />
                ))}
              </div>

              <div
                className={styles.footer}
              >
                <div
                  className={
                    styles.subtotal
                  }
                >
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatPrice(
                      subtotal,
                    )}
                  </strong>
                </div>

                {Number(
                  offerDiscount,
                ) > 0 && (
                  <div
                    className={
                      styles.discount
                    }
                  >
                    <span>
                      Offer Discount
                    </span>

                    <strong>
                      -{formatPrice(
                        offerDiscount,
                      )}
                    </strong>
                  </div>
                )}

                {Number(
                  offerDiscount,
                ) > 0 && (
                  <div
                    className={
                      styles.finalSubtotal
                    }
                  >
                    <span>
                      Offer Price
                    </span>

                    <strong>
                      {formatPrice(
                        finalSubtotal,
                      )}
                    </strong>
                  </div>
                )}

                <p
                  className={styles.note}
                >
                  Shipping and taxes are
                  calculated at checkout.
                </p>

                <Button
                  fullWidth
                  size="large"
                  onClick={onCheckout}
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

export default CartDrawer;