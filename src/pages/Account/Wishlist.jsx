import { Link } from "react-router-dom";

import {
  FiHeart,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

import {
  useWishlistContext,
} from "../../context/WishlistContext";

import styles from "./Wishlist.module.css";

function getProduct(item) {
  if (
    item?.product &&
    typeof item.product === "object"
  ) {
    return item.product;
  }

  if (
    item?.productId &&
    typeof item.productId === "object"
  ) {
    return item.productId;
  }

  return item || {};
}

function getProductId(item) {
  const product = getProduct(item);

  if (product?._id) {
    return String(product._id);
  }

  if (product?.id) {
    return String(product.id);
  }

  if (
    typeof item?.productId === "string"
  ) {
    return item.productId;
  }

  return "";
}

function getProductImage(item) {
  const product = getProduct(item);

  const images = Array.isArray(
    product?.images,
  )
    ? product.images
    : [];

  const image = images[0];

  if (
    image &&
    typeof image === "object"
  ) {
    return (
      image.url ||
      image.secure_url ||
      ""
    );
  }

  if (typeof image === "string") {
    return image;
  }

  return (
    product?.thumbnail ||
    product?.image ||
    product?.imageUrl ||
    ""
  );
}

function getCategoryName(item) {
  const product = getProduct(item);

  if (
    product?.category &&
    typeof product.category === "object"
  ) {
    return (
      product.category.name ||
      "Jewellery"
    );
  }

  if (
    typeof product?.category === "string" &&
    product.category.trim()
  ) {
    return product.category;
  }

  return "Jewellery";
}

function getBasePrice(item) {
  const product = getProduct(item);

  const price = Number(
    product?.price,
  );

  return Number.isFinite(price)
    ? Math.max(price, 0)
    : 0;
}

function getOfferPrice(item) {
  const product = getProduct(item);

  const value = Number(
    product?.offerPrice,
  );

  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(value, 0);
}

function getOfferDiscount(item) {
  const product = getProduct(item);

  const value = Number(
    product?.offerDiscount ??
      product?.offer?.discount ??
      0,
  );

  return Number.isFinite(value)
    ? Math.max(value, 0)
    : 0;
}

function getDisplayPrice(item) {
  const basePrice =
    getBasePrice(item);

  const offerPrice =
    getOfferPrice(item);

  if (
    offerPrice !== null &&
    offerPrice < basePrice
  ) {
    return offerPrice;
  }

  return basePrice;
}

function hasActiveOffer(item) {
  const basePrice =
    getBasePrice(item);

  const offerPrice =
    getOfferPrice(item);

  return (
    offerPrice !== null &&
    offerPrice < basePrice
  );
}

function getOfferName(item) {
  const product = getProduct(item);

  return (
    product?.appliedOffer?.name ||
    product?.offerName ||
    product?.offer?.name ||
    ""
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(Number(value) || 0);
}

function Wishlist() {
  const {
    items,
    removeFromWishlist,
    loading,
  } = useWishlistContext();

  const list = Array.isArray(items)
    ? items
    : [];

  const validItems = list.filter(
    (item) => getProductId(item),
  );

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>
          Saved Items
        </span>

        <h1>Wishlist</h1>

        <p>
          Your favourite jewellery,
          saved for later.
        </p>
      </div>

      {loading &&
      validItems.length === 0 ? (
        <div className={styles.state}>
          <FiHeart size={24} />

          <p>
            Loading wishlist...
          </p>
        </div>
      ) : validItems.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <FiHeart size={24} />
          </div>

          <h3>
            Your wishlist is empty
          </h3>

          <p>
            Save pieces you love and
            find them here later.
          </p>

          <Link
            to="/shop"
            className={styles.shopButton}
          >
            Explore Jewellery
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {validItems.map((item) => {
            const product =
              getProduct(item);

            const productId =
              getProductId(item);

            const image =
              getProductImage(item);

            const category =
              getCategoryName(item);

            const basePrice =
              getBasePrice(item);

            const offerPrice =
              getOfferPrice(item);

            const displayPrice =
              getDisplayPrice(item);

            const offerDiscount =
              getOfferDiscount(item);

            const offerName =
              getOfferName(item);

            const hasOffer =
              hasActiveOffer(item);

            const productName =
              product?.name ||
              "Jewellery";

            return (
              <article
                className={styles.card}
                key={productId}
              >
                <Link
                  to={`/product/${productId}`}
                  className={styles.imageLink}
                >
                  {image ? (
                    <img
                      src={image}
                      alt={productName}
                      className={styles.image}
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={
                        styles.placeholder
                      }
                    >
                      <FiShoppingBag
                        size={26}
                      />
                    </div>
                  )}
                </Link>

                <div
                  className={
                    styles.content
                  }
                >
                  <span
                    className={
                      styles.category
                    }
                  >
                    {category}
                  </span>

                  <Link
                    to={`/product/${productId}`}
                    className={styles.name}
                  >
                    {productName}
                  </Link>

                  <div
                    className={
                      styles.priceRow
                    }
                  >
                    <span
                      className={
                        styles.price
                      }
                    >
                      {formatCurrency(
                        displayPrice,
                      )}
                    </span>

                    {hasOffer && (
                      <span
                        className={
                          styles.originalPrice
                        }
                      >
                        {formatCurrency(
                          basePrice,
                        )}
                      </span>
                    )}
                  </div>

                  {hasOffer &&
                    offerDiscount > 0 && (
                      <div
                        className={
                          styles.offer
                        }
                      >
                        {offerName ||
                          "Offer applied"}

                        <span>
                          Save{" "}
                          {formatCurrency(
                            offerDiscount,
                          )}
                        </span>
                      </div>
                    )}

                  <button
                    type="button"
                    className={
                      styles.remove
                    }
                    onClick={() =>
                      removeFromWishlist(
                        productId,
                      )
                    }
                    disabled={loading}
                    aria-label={`Remove ${productName} from wishlist`}
                  >
                    <FiTrash2 size={14} />

                    <span>
                      Remove
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Wishlist;