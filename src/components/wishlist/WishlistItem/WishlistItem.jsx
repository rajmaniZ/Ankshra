import { Link } from "react-router-dom";

import ProductPrice from "../../product/ProductPrice/ProductPrice";
import Button from "../../common/Button/Button";

import styles from "./WishlistItem.module.css";

function WishlistItem({
  item,
  onRemove,
  onAddToCart,
}) {
  if (!item) {
    return null;
  }

  const product =
    item.product || item;

  const productId =
    product._id ||
    product.id;

  const image =
    product.image ||
    product.images?.[0];

  const basePrice =
    Number(product.price || 0);

  const offerPrice =
    Number(
      product.offerPrice,
    );

  const hasOffer =
    Number.isFinite(
      offerPrice,
    ) &&
    offerPrice >= 0 &&
    offerPrice < basePrice;

  const displayPrice =
    hasOffer
      ? offerPrice
      : basePrice;

  const offerDiscount =
    Number(
      product.offerDiscount || 0,
    );

  const offerName =
    product.offerName ||
    product.appliedOffer?.name ||
    "";

  return (
    <article
      className={styles.item}
    >
      <Link
        to={`/product/${productId}`}
        className={
          styles.imageWrapper
        }
      >
        {image ? (
          <img
            src={image}
            alt={
              product.name ||
              "Jewellery product"
            }
            className={styles.image}
          />
        ) : (
          <div
            className={
              styles.placeholder
            }
          >
            No image
          </div>
        )}
      </Link>

      <div
        className={styles.content}
      >
        {product.category && (
          <span
            className={styles.category}
          >
            {typeof product.category ===
            "object"
              ? product.category.name
              : product.category}
          </span>
        )}

        <Link
          to={`/product/${productId}`}
          className={styles.name}
        >
          {product.name}
        </Link>

        <ProductPrice
          price={displayPrice}
          originalPrice={
            hasOffer
              ? basePrice
              : undefined
          }
          compareAtPrice={
            product.compareAtPrice
          }
          offerDiscount={
            hasOffer
              ? offerDiscount
              : 0
          }
          offerName={
            hasOffer
              ? offerName
              : ""
          }
          discountPercentage={
            hasOffer
              ? product.offerDiscountPercentage
              : undefined
          }
        />

        {Number(product.stock) <=
          0 && (
          <span
            className={
              styles.outOfStock
            }
          >
            Out of stock
          </span>
        )}

        <div
          className={styles.actions}
        >
          <Button
            size="small"
            disabled={
              Number(product.stock) <=
              0
            }
            onClick={() =>
              onAddToCart?.(product)
            }
          >
            Add to Cart
          </Button>

          <button
            type="button"
            className={styles.remove}
            onClick={() =>
              onRemove?.(productId)
            }
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

export default WishlistItem;