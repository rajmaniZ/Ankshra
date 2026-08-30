import { useNavigate } from "react-router-dom";

import WishlistItem from "../../components/wishlist/WishlistItem/WishlistItem";
import EmptyState from "../../components/common/EmptyState/EmptyState";

import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

import styles from "./Wishlist.module.css";

function getProductId(product) {
  return (
    product?._id ||
    product?.id ||
    product?.product?._id ||
    product?.product?.id ||
    ""
  );
}

function Wishlist() {
  const navigate =
    useNavigate();

  const {
    items,
    removeFromWishlist,
  } = useWishlist();

  const {
    addToCart,
  } = useCart();

  const handleRemove =
    async (productId) => {
      try {
        await removeFromWishlist(
          productId,
        );
      } catch (error) {
        console.error(
          "Failed to remove wishlist item:",
          error,
        );
      }
    };

  const handleAddToCart =
    async (product) => {
      try {
        await addToCart(
          product,
          1,
        );
      } catch (error) {
        console.error(
          "Failed to add wishlist item to cart:",
          error,
        );
      }
    };

  if (!items.length) {
    return (
      <div className={styles.page}>
        <div
          className={styles.container}
        >
          <div
            className={styles.heading}
          >
            <span
              className={styles.eyebrow}
            >
              Saved Items
            </span>

            <h1
              className={styles.title}
            >
              Wishlist
            </h1>
          </div>

          <EmptyState
            title="Your wishlist is empty"
            message="Save jewellery you love and find it here whenever you are ready."
            actionLabel="Explore Jewellery"
            onAction={() =>
              navigate("/shop")
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div
        className={styles.container}
      >
        <div
          className={styles.heading}
        >
          <div>
            <span
              className={styles.eyebrow}
            >
              Saved Items
            </span>

            <h1
              className={styles.title}
            >
              Wishlist
            </h1>
          </div>

          <span
            className={styles.count}
          >
            {items.length}{" "}
            {items.length === 1
              ? "item"
              : "items"}
          </span>
        </div>

        <div
          className={styles.grid}
        >
          {items.map((product) => {
            const productId =
              getProductId(
                product,
              );

            return (
              <WishlistItem
                key={productId}
                item={product}
                onRemove={
                  handleRemove
                }
                onAddToCart={
                  handleAddToCart
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;