import { formatPrice } from "../../../utils/pricing";

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
  const finalPrice = Number(price);

  if (!Number.isFinite(finalPrice) || finalPrice < 0) {
    return null;
  }

  const original = Number(originalPrice);
  const compare = Number(compareAtPrice);

  const basePrice =
    Number.isFinite(original) &&
    original > finalPrice
      ? original
      : finalPrice;

  const comparePrice =
    Number.isFinite(compare) &&
    compare > finalPrice
      ? compare
      : 0;

  const referencePrice =
    comparePrice > basePrice
      ? comparePrice
      : basePrice;

  const hasReduction =
    referencePrice > finalPrice;

  const numericDiscount =
    Number(offerDiscount);

  const hasOffer =
    hasReduction &&
    Number.isFinite(numericDiscount) &&
    numericDiscount > 0;

  const calculatedPercentage =
    hasReduction && referencePrice > 0
      ? Math.round(
          ((referencePrice - finalPrice) /
            referencePrice) *
            100,
        )
      : 0;

  const suppliedPercentage =
    Number(discountPercentage);

  const displayPercentage =
    Number.isFinite(suppliedPercentage) &&
    suppliedPercentage > 0
      ? Math.min(100, Math.round(suppliedPercentage))
      : calculatedPercentage;

  return (
    <div className={styles.wrapper}>
      <div className={styles.prices}>
        <span className={styles.price}>
          {formatPrice(
            finalPrice,
            currency,
          )}
        </span>

        {hasReduction && (
          <span className={styles.comparePrice}>
            {formatPrice(
              referencePrice,
              currency,
            )}
          </span>
        )}
      </div>

      {hasReduction &&
        showDiscount &&
        displayPercentage > 0 && (
          <span className={styles.discount}>
            {displayPercentage}% OFF
          </span>
        )}

      {hasOffer &&
        showOffer &&
        offerName && (
          <span className={styles.offer}>
            {offerName}
          </span>
        )}
    </div>
  );
}

export default ProductPrice;