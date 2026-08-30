import { useState } from "react";
import Button from "../../common/Button/Button";
import styles from "./ProductActions.module.css";

function ProductActions({
  onAddToCart,
  onBuyNow,
  onWishlist,
  isWishlisted = false,
  disabled = false,
}) {
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1),
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.quantityRow}>
        <span className={styles.quantityLabel}>
          Quantity
        </span>

        <div className={styles.quantity}>
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={disabled || quantity === 1}
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={disabled}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.buttons}>
        <Button
          fullWidth
          size="large"
          disabled={disabled}
          onClick={() => onAddToCart?.(quantity)}
        >
          Add to Cart
        </Button>

        <Button
          fullWidth
          size="large"
          variant="secondary"
          disabled={disabled}
          onClick={() => onBuyNow?.(quantity)}
        >
          Buy Now
        </Button>
      </div>

      <button
        type="button"
        className={`${styles.wishlist} ${
          isWishlisted ? styles.active : ""
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