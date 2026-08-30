import ProductPrice from "../ProductPrice/ProductPrice";
import ProductRating from "../ProductRating/ProductRating";
import ProductVariant from "../ProductVariant/ProductVariant";
import ProductActions from "../ProductActions/ProductActions";

import styles from "./ProductInfo.module.css";

function getCategoryName(category) {
  if (!category) {
    return "";
  }

  if (
    typeof category === "object"
  ) {
    return (
      category.name ||
      ""
    );
  }

  return String(category);
}

function getRating(product) {
  const value =
    product?.rating?.average ??
    product?.averageRating ??
    0;

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.min(
        5,
        Math.max(0, number),
      )
    : 0;
}

function getReviewCount(product) {
  const value =
    product?.rating?.count ??
    product?.reviewCount ??
    0;

  const number = Number(value);

  return Number.isFinite(number)
    ? Math.max(
        0,
        Math.floor(number),
      )
    : 0;
}

function getNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
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
    getNumber(product.price);

  const offerPrice =
    getNumber(product.offerPrice);

  const offerDiscount =
    getNumber(
      product.offerDiscount,
    ) || 0;

  const discountPercentage =
    getNumber(
      product.offerDiscountPercentage,
    ) || 0;

  const hasOffer =
    basePrice !== null &&
    offerPrice !== null &&
    offerPrice >= 0 &&
    offerPrice < basePrice &&
    Boolean(product.appliedOffer);

  const displayPrice =
    hasOffer
      ? offerPrice
      : basePrice;

  const stock =
    Number(product.stock ?? 0);

  const hasRating =
    rating > 0 &&
    reviewCount > 0;

  return (
    <div className={styles.container}>
      {category && (
        <span
          className={styles.category}
        >
          {category}
        </span>
      )}

      <h1 className={styles.name}>
        {product.name}
      </h1>

      {hasRating && (
        <ProductRating
          rating={rating}
          reviewCount={
            reviewCount
          }
        />
      )}

      {displayPrice !== null && (
        <div className={styles.price}>
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
                ? product
                    .appliedOffer
                    ?.name || ""
                : ""
            }
            discountPercentage={
              hasOffer
                ? discountPercentage
                : undefined
            }
          />
        </div>
      )}

      {product.shortDescription && (
        <p
          className={
            styles.shortDescription
          }
        >
          {product.shortDescription}
        </p>
      )}

      {product.description && (
        <p
          className={
            styles.description
          }
        >
          {product.description}
        </p>
      )}

      {Array.isArray(
        product.variants,
      ) &&
        product.variants.map(
          (variant, index) => (
            <div
              className={styles.variant}
              key={
                variant?._id ||
                variant?.id ||
                variant?.name ||
                `variant-${index}`
              }
            >
              <ProductVariant
                label={
                  variant?.name
                }
                options={
                  Array.isArray(
                    variant?.options,
                  )
                    ? variant.options
                    : []
                }
                value={
                  selectedVariants[
                    variant?.name
                  ]
                }
                onChange={(value) =>
                  onVariantChange?.(
                    variant?.name,
                    value,
                  )
                }
                type={
                  variant?.type
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
          maxQuantity={
            stock > 0
              ? stock
              : undefined
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
            className={styles.stock}
          >
            Only {stock}{" "}
            {stock === 1
              ? "item"
              : "items"}{" "}
            left in stock
          </p>
        )}
    </div>
  );
}

export default ProductInfo;