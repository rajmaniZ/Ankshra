import ProductPrice from "../ProductPrice/ProductPrice";
import ProductRating from "../ProductRating/ProductRating";
import ProductVariant from "../ProductVariant/ProductVariant";
import ProductActions from "../ProductActions/ProductActions";

import styles from "./ProductInfo.module.css";

function getCategoryName(category) {
  if (!category) {
    return "";
  }

  if (typeof category === "object") {
    return category.name || "";
  }

  return category;
}

function getRating(product) {
  return (
    product?.rating?.average ??
    product?.rating ??
    0
  );
}

function getReviewCount(product) {
  return (
    product?.rating?.count ??
    product?.reviewCount ??
    0
  );
}

function getOfferPrice(product) {
  const value =
    product?.offerPrice ??
    product?.discountedPrice ??
    product?.finalPrice ??
    null;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function getOfferDiscount(product) {
  const value =
    product?.offerDiscount ??
    product?.offer?.discount ??
    0;

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(number, 0)
    : 0;
}

function getOfferName(product) {
  return (
    product?.offerName ||
    product?.appliedOffer?.name ||
    product?.offer?.name ||
    ""
  );
}

function getOfferDiscountPercentage(product) {
  const value =
    product?.offerDiscountPercentage ??
    product?.offer?.discountPercentage ??
    null;

  if (
    value !== null &&
    value !== undefined &&
    value !== ""
  ) {
    const number = Number(value);

    if (Number.isFinite(number)) {
      return Math.max(
        0,
        Math.round(number),
      );
    }
  }

  const basePrice =
    Number(product?.price);

  const offerPrice =
    getOfferPrice(product);

  if (
    !Number.isFinite(basePrice) ||
    !Number.isFinite(offerPrice) ||
    basePrice <= 0 ||
    offerPrice >= basePrice
  ) {
    return 0;
  }

  return Math.round(
    ((basePrice - offerPrice) /
      basePrice) *
      100,
  );
}

function ProductInfo({
  product,
  selectedVariants = {},
  onVariantChange,
  onAddToCart,
  onBuyNow,
  onWishlist,
  isWishlisted = false,
}) {
  if (!product) {
    return null;
  }

  const category =
    getCategoryName(
      product.category,
    );

  const rating =
    getRating(product);

  const reviewCount =
    getReviewCount(product);

  const basePrice =
    Number(product.price);

  const offerPrice =
    getOfferPrice(product);

  const offerDiscount =
    getOfferDiscount(product);

  const offerName =
    getOfferName(product);

  const offerDiscountPercentage =
    getOfferDiscountPercentage(
      product,
    );

  const compareAtPrice =
    product.compareAtPrice ??
    product.comparePrice ??
    null;

  const hasOffer =
    Number.isFinite(basePrice) &&
    Number.isFinite(offerPrice) &&
    offerPrice < basePrice;

  const displayPrice =
    hasOffer
      ? offerPrice
      : basePrice;

  const stock =
    Number(product.stock ?? 0);

  return (
    <div className={styles.container}>
      {category && (
        <span className={styles.category}>
          {category}
        </span>
      )}

      <h1 className={styles.name}>
        {product.name}
      </h1>

      {Number(rating) > 0 && (
        <ProductRating
          rating={Number(rating)}
          reviewCount={Number(
            reviewCount,
          )}
        />
      )}

      <div className={styles.price}>
        <ProductPrice
          price={displayPrice}
          originalPrice={
            hasOffer
              ? basePrice
              : undefined
          }
          compareAtPrice={
            compareAtPrice
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
              ? offerDiscountPercentage
              : undefined
          }
        />
      </div>

      {product.description && (
        <p className={styles.description}>
          {product.description}
        </p>
      )}

      {Array.isArray(
        product.variants,
      ) &&
        product.variants.map(
          (variant) => (
            <div
              className={styles.variant}
              key={
                variant.id ||
                variant._id ||
                variant.name
              }
            >
              <ProductVariant
                label={variant.name}
                options={
                  variant.options || []
                }
                value={
                  selectedVariants[
                    variant.name
                  ]
                }
                onChange={(value) =>
                  onVariantChange?.(
                    variant.name,
                    value,
                  )
                }
                type={
                  variant.type
                }
              />
            </div>
          ),
        )}

      <div className={styles.actions}>
        <ProductActions
          onAddToCart={
            onAddToCart
          }
          onBuyNow={onBuyNow}
          onWishlist={
            onWishlist
          }
          isWishlisted={
            isWishlisted
          }
          disabled={
            stock <= 0
          }
        />
      </div>

      {stock <= 0 && (
        <p
          className={
            styles.outOfStock
          }
        >
          Currently out of stock
        </p>
      )}

      {stock > 0 &&
        stock <= 5 && (
          <p
            className={
              styles.stock
            }
          >
            Only {stock} left in stock
          </p>
        )}
    </div>
  );
}

export default ProductInfo;