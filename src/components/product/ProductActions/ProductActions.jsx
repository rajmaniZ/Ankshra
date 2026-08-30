import {
  useEffect,
  useState,
} from "react";

import Button from "../../common/Button/Button";

import styles from "./ProductActions.module.css";

function ProductActions({
  onAddToCart,
  onBuyNow,
  onWishlist,
  isWishlisted = false,
  disabled = false,
  maxQuantity,
}) {
  const maximum =
    Number.isInteger(
      Number(maxQuantity),
    ) && Number(maxQuantity) > 0
      ? Number(maxQuantity)
      : null;

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  useEffect(() => {
    setQuantity((current) => {
      if (!maximum) {
        return current;
      }

      return Math.min(
        current,
        maximum,
      );
    });
  }, [maximum]);

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(
        1,
        current - 1,
      ),
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) => {
      if (!maximum) {
        return current + 1;
      }

      return Math.min(
        maximum,
        current + 1,
      );
    });
  };

  const isMaximumReached =
    maximum !== null &&
    quantity >= maximum;

  return (
    <div className={styles.container}>
      <div className={styles.quantityRow}>
        <span
          className={
            styles.quantityLabel
          }
        >
          Quantity
        </span>

        <div className={styles.quantity}>
          <button
            type="button"
            onClick={
              decreaseQuantity
            }
            disabled={
              disabled ||
              quantity === 1
            }
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span
            aria-live="polite"
          >
            {quantity}
          </span>

          <button
            type="button"
            onClick={
              increaseQuantity
            }
            disabled={
              disabled ||
              isMaximumReached
            }
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {maximum !== null && (
        <p className={styles.stockHint}>
          {maximum}{" "}
          {maximum === 1
            ? "item"
            : "items"}{" "}
          available
        </p>
      )}

      <div className={styles.buttons}>
        <Button
          fullWidth
          size="large"
          disabled={disabled}
          onClick={() =>
            onAddToCart?.(
              quantity,
            )
          }
        >
          Add to Cart
        </Button>

        <Button
          fullWidth
          size="large"
          variant="secondary"
          disabled={disabled}
          onClick={() =>
            onBuyNow?.(
              quantity,
            )
          }
        >
          Buy Now
        </Button>
      </div>

      <button
        type="button"
        className={`${styles.wishlist} ${
          isWishlisted
            ? styles.active
            : ""
        }`}
        onClick={onWishlist}
        disabled={disabled}
      >
        {isWishlisted
          ? "Remove from Wishlist"
          : "Add to Wishlist"}
      </button>
    </div>
  );
}

export default ProductActions;