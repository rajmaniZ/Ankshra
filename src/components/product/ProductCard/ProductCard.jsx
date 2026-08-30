import { Link } from "react-router-dom";
import {
  FiHeart,
  FiShoppingBag,
} from "react-icons/fi";
import { toast } from "react-toastify";

import ProductPrice from "../ProductPrice/ProductPrice";
import ProductRating from "../ProductRating/ProductRating";

import useCart from "../../../hooks/useCart";
import useWishlist from "../../../hooks/useWishlist";

import styles from "./ProductCard.module.css";

function getProductId(product) {
  return (
    product?._id ||
    product?.id ||
    ""
  );
}

function getProductImage(product) {
  const firstImage =
    product?.images?.[0];

  if (
    firstImage &&
    typeof firstImage === "object"
  ) {
    return (
      firstImage.url ||
      firstImage.secure_url ||
      ""
    );
  }

  return (
    firstImage ||
    product?.thumbnail ||
    product?.image ||
    ""
  );
}

function getCategoryName(product) {
  return (
    product?.category?.name ||
    product?.category ||
    ""
  );
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

function getCompareAtPrice(product) {
  return (
    product?.compareAtPrice ??
    product?.comparePrice ??
    null
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

function getOfferDiscountPercentage(
  product,
) {
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

  const price =
    Number(product?.price);

  const offerPrice =
    getOfferPrice(product);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(offerPrice) ||
    price <= 0 ||
    offerPrice >= price
  ) {
    return 0;
  }

  return Math.round(
    ((price - offerPrice) /
      price) *
      100,
  );
}

function ProductCard({
  product,
}) {
  const {
    addToCart,
  } = useCart();

  const {
    isWishlisted,
    toggleWishlist,
  } = useWishlist();

  if (!product) {
    return null;
  }

  const productId =
    getProductId(product);

  if (!productId) {
    return null;
  }

  const stock = Number(
    product.stock ?? 0,
  );

  const outOfStock =
    stock <= 0;

  const image =
    getProductImage(product);

  const category =
    getCategoryName(product);

  const rating =
    getRating(product);

  const reviewCount =
    getReviewCount(product);

  const basePrice =
    Number(product.price);

  const compareAtPrice =
    getCompareAtPrice(product);

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

  const hasOffer =
    Number.isFinite(
      offerPrice,
    ) &&
    Number.isFinite(
      basePrice,
    ) &&
    offerPrice < basePrice;

  const displayPrice =
    hasOffer
      ? offerPrice
      : basePrice;

  const wishlisted =
    Boolean(
      isWishlisted(productId),
    );

  const isNew =
    Boolean(
      product.isNewArrival ||
      product.isNew,
    );

  const isBestSeller =
    Boolean(
      product.isBestSeller,
    );

  const isFeatured =
    Boolean(
      product.isFeatured,
    );

  const handleAddToCart =
    async () => {
      if (outOfStock) {
        toast.error(
          "This product is out of stock.",
        );

        return;
      }

      try {
        await addToCart(
          product,
          1,
        );

        toast.success(
          `${product.name} added to cart.`,
        );
      } catch (error) {
        console.error(
          "Failed to add product to cart:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to add product to cart.",
        );
      }
    };

  const handleWishlist =
    async () => {
      try {
        const wasWishlisted =
          wishlisted;

        await toggleWishlist(
          product,
        );

        if (wasWishlisted) {
          toast.success(
            `${product.name} removed from wishlist.`,
          );
        } else {
          toast.success(
            `${product.name} added to wishlist.`,
          );
        }
      } catch (error) {
        console.error(
          "Failed to update wishlist:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to update wishlist.",
        );
      }
    };

  return (
    <article
      className={styles.card}
    >
      <div
        className={
          styles.imageWrapper
        }
      >
        <Link
          to={`/product/${productId}`}
          className={
            styles.imageLink
          }
        >
          {image ? (
            <img
              src={image}
              alt={
                product.name ||
                "Jewellery product"
              }
              className={
                styles.image
              }
              loading="lazy"
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

        {isBestSeller && (
          <span
            className={
              styles.badge
            }
          >
            Bestseller
          </span>
        )}

        {!isBestSeller &&
          isFeatured && (
            <span
              className={
                styles.badge
              }
            >
              Featured
            </span>
          )}

        {isNew && (
          <span
            className={
              styles.newBadge
            }
          >
            New
          </span>
        )}

        <div
          className={
            styles.widgets
          }
        >
          <button
            type="button"
            className={`${styles.widget} ${
              wishlisted
                ? styles.wishlisted
                : ""
            }`}
            onClick={
              handleWishlist
            }
            aria-label={
              wishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            title={
              wishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
          >
            <FiHeart
              size={18}
              fill={
                wishlisted
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          <button
            type="button"
            className={
              styles.widget
            }
            onClick={
              handleAddToCart
            }
            disabled={
              outOfStock
            }
            aria-label={
              outOfStock
                ? "Product out of stock"
                : "Add to cart"
            }
            title={
              outOfStock
                ? "Product out of stock"
                : "Add to cart"
            }
          >
            <FiShoppingBag
              size={18}
            />
          </button>
        </div>

        {outOfStock && (
          <div
            className={
              styles.outOfStock
            }
          >
            Out of Stock
          </div>
        )}
      </div>

      <div
        className={
          styles.content
        }
      >
        {category && (
          <span
            className={
              styles.category
            }
          >
            {category}
          </span>
        )}

        <Link
          to={`/product/${productId}`}
          className={
            styles.name
          }
        >
          {product.name}
        </Link>

        {Number(rating) > 0 && (
          <ProductRating
            rating={Number(
              rating,
            )}
            reviewCount={Number(
              reviewCount,
            )}
          />
        )}

        <ProductPrice
          price={
            displayPrice
          }
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
    </article>
  );
}

export default ProductCard;