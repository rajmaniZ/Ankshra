import { get, post, patch, remove } from "./api";

export async function getCart() {
  return get("/cart");
}

export async function addToCart(productId, quantity = 1) {
  return post("/cart", {
    productId,
    quantity,
  });
}

export async function updateCartItem(productId, quantity) {
  return patch(`/cart/${productId}`, {
    quantity,
  });
}

export async function removeFromCart(productId) {
  return remove(`/cart/${productId}`);
}

export async function clearCart() {
  return remove("/cart");
}