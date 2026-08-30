import {
  get,
  post,
  remove,
} from "./api";

export async function getWishlist() {
  return get("/wishlist");
}

export async function addToWishlist(productId) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  return post("/wishlist", {
    productId,
  });
}

export async function toggleWishlist(productId) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  return post("/wishlist/toggle", {
    productId,
  });
}

export async function removeFromWishlist(productId) {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  return remove(`/wishlist/${productId}`);
}