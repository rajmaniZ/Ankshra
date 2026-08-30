import { Link } from "react-router-dom";
import ProductPrice from "../../product/ProductPrice/ProductPrice";
import styles from "./CartItem.module.css";

function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onWishlist,
}) {
  if (!item) {
    return null;
  }

  const product =
    item.product || {};

  const productId =
    product._id ||
    product.id ||
    item.product ||
    item._id ||
    item.id;

  const quantity =
    Number(item.quantity || 1);

  const image =
    product.image ||
    product.images?.[0];

  const sellingPrice =
    Number(product.price || 0);

  const originalPrice =
    Number(
      product.originalPrice ??
        product.price ??
        0,
    );

  const offerDiscount =
    Number(
      product.offerDiscount || 0,
    );

  const hasOffer =
    originalPrice >
      sellingPrice &&
    offerDiscount > 0;

  return (
    <article className={styles.item}>
      <Link
        to={`/product/${productId}`}
        className={styles.imageWrapper}
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
            className={styles.placeholder}
          >
            No image
          </div>
        )}
      </Link>

      <div className={styles.details}>
        <div className={styles.info}>
          {product.category && (
            <span
              className={
                styles.category
              }
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

          {item.variant && (
            <span
              className={styles.variant}
            >
              {item.variant}
            </span>
          )}

          <ProductPrice
            price={sellingPrice}
            originalPrice={
              hasOffer
                ? originalPrice
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
                ? product.offerName
                : ""
            }
          />
        </div>

        <div className={styles.actions}>
          <div
            className={styles.quantity}
          >
            <button
              type="button"
              onClick={() =>
                onQuantityChange?.(
                  productId,
                  Math.max(
                    1,
                    quantity - 1,
                  ),
                )
              }
              disabled={
                quantity <= 1
              }
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>
              {quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                onQuantityChange?.(
                  productId,
                  quantity + 1,
                )
              }
              disabled={
                Number(
                  product.stock,
                ) <= quantity
              }
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div
            className={styles.links}
          >
            {onWishlist && (
              <button
                type="button"
                onClick={() =>
                  onWishlist(item)
                }
                className={
                  styles.link
                }
              >
                Move to Wishlist
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                onRemove?.(
                  productId,
                )
              }
              className={
                styles.link
              }
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className={styles.total}>
        <ProductPrice
          price={
            sellingPrice *
            quantity
          }
          originalPrice={
            hasOffer
              ? originalPrice *
                quantity
              : undefined
          }
          offerDiscount={
            hasOffer
              ? offerDiscount *
                quantity
              : 0
          }
        />
      </div>
    </article>
  );
}

export default CartItem;