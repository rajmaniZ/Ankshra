import { get, post, patch, remove } from "./api";

export async function getProductReviews(productId) {
  return get(`/reviews/product/${productId}`);
}

export async function getReviewById(id) {
  return get(`/reviews/${id}`);
}

export async function createReview(data) {
  return post("/reviews", data);
}

export async function updateReview(id, data) {
  return patch(`/reviews/${id}`, data);
}

export async function deleteReview(id) {
  return remove(`/reviews/${id}`);
}