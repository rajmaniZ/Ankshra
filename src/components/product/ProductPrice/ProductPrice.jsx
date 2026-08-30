import {
  formatPrice,
} from "../../../utils/pricing";

import styles from "./ProductPrice.module.css";

function ProductPrice({
  price,
  originalPrice,
  compareAtPrice,
  offerDiscount = 0,
  offerName = "",
  discountPercentage,
  currency = "₹",
  showDiscount = true,
  showOffer = true,
}) {
  const finalPrice =
    Number.isFinite(Number(price))
      ? Number(price)
      : 0;

  const basePrice =
    Number.isFinite(
      Number(originalPrice),
    )
      ? Number(originalPrice)
      : finalPrice;

  const comparePrice =
    Number.isFinite(
      Number(compareAtPrice),
    )
      ? Number(compareAtPrice)
      : 0;

  const safeOfferDiscount =
    Math.max(
      Number(offerDiscount) || 0,
      0,
    );

  const hasOffer =
    safeOfferDiscount > 0 &&
    finalPrice < basePrice;

  const hasComparePrice =
    comparePrice >
      Math.max(
        finalPrice,
        basePrice,
      );

  const referencePrice =
    hasComparePrice
      ? comparePrice
      : basePrice;

  const calculatedDiscount =
    referencePrice > 0
      ? Math.round(
          ((referencePrice -
            finalPrice) /
            referencePrice) *
            100,
        )
      : 0;

  const displayDiscount =
    Number.isFinite(
      Number(discountPercentage),
    )
      ? Number(discountPercentage)
      : calculatedDiscount;

  const shouldShowOldPrice =
    referencePrice >
    finalPrice;

  return (
    <div
      className={
        styles.priceWrapper
      }
    >
      <div
        className={
          styles.prices
        }
      >
        <span
          className={
            styles.price
          }
        >
          {formatPrice(
            finalPrice,
            currency,
          )}
        </span>

        {shouldShowOldPrice && (
          <span
            className={
              styles.comparePrice
            }
          >
            {formatPrice(
              referencePrice,
              currency,
            )}
          </span>
        )}
      </div>

      {shouldShowOldPrice &&
        showDiscount && (
          <span
            className={
              styles.discount
            }
          >
            {displayDiscount}% OFF
          </span>
        )}

      {hasOffer &&
        showOffer &&
        offerName && (
          <span
            className={
              styles.offer
            }
          >
            {offerName}
          </span>
        )}
    </div>
  );
}

export default ProductPrice;