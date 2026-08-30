import {
  Link,
  useNavigate,
} from "react-router-dom";

import CartItem from "../../components/cart/CartItem/CartItem";
import CartSummary from "../../components/cart/CartSummary/CartSummary";
import EmptyState from "../../components/common/EmptyState/EmptyState";

import useCart from "../../hooks/useCart";

import styles from "./Cart.module.css";

function Cart() {
  const navigate =
    useNavigate();

  const {
    items,
    subtotal,
    offerDiscount,
    finalSubtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const handleCheckout = () => {
    navigate("/checkout");
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
              Shopping Bag
            </span>

            <h1
              className={styles.title}
            >
              Your Cart
            </h1>
          </div>

          <EmptyState
            title="Your cart is empty"
            message="Add something beautiful to your cart and come back here when you're ready."
            actionLabel="Continue Shopping"
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
              Shopping Bag
            </span>

            <h1
              className={styles.title}
            >
              Your Cart
            </h1>
          </div>

          <Link
            to="/shop"
            className={styles.continue}
          >
            Continue Shopping
          </Link>
        </div>

        <div
          className={styles.content}
        >
          <div
            className={styles.items}
          >
            {items.map((item) => (
              <CartItem
                key={
                  item._id ||
                  item.id ||
                  item.product?._id ||
                  item.product?.id
                }
                item={item}
                onQuantityChange={
                  updateQuantity
                }
                onRemove={
                  removeFromCart
                }
              />
            ))}
          </div>

          <CartSummary
            subtotal={subtotal}
            discount={offerDiscount}
            finalSubtotal={
              finalSubtotal
            }
            shipping={0}
            tax={0}
            onCheckout={
              handleCheckout
            }
          />
        </div>
      </div>
    </div>
  );
}

export default Cart;