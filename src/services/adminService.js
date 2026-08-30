import { get, post, put, patch, remove } from "./api";
function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
/* ================================ DASHBOARD ================================ */ export async function getAdminDashboard() {
  return get("/admin/dashboard");
}
/* ================================ USERS ================================ */ export async function getAdminUsers(
  params = {},
) {
  return get(`/admin/users${buildQuery(params)}`);
}
export async function getAdminUserById(id) {
  if (!id) {
    throw new Error("User ID is required.");
  }
  return get(`/admin/users/${id}`);
}
export async function updateAdminUserStatus(id, isActive) {
  if (!id) {
    throw new Error("User ID is required.");
  }
  return patch(`/admin/users/${id}/status`, { isActive: Boolean(isActive) });
}
export async function updateAdminUserRole(id, role) {
  if (!id) {
    throw new Error("User ID is required.");
  }
  if (role !== "customer" && role !== "admin") {
    throw new Error("Invalid user role.");
  }
  return patch(`/admin/users/${id}/role`, { role });
}
/* ================================ PRODUCTS ================================ */ export async function getAdminProducts(
  params = {},
) {
  return get(`/admin/products${buildQuery(params)}`);
}
export async function getAdminProductById(id) {
  if (!id) {
    throw new Error("Product ID is required.");
  }
  return get(`/admin/products/${id}`);
}
export async function createAdminProduct(data) {
  if (!data) {
    throw new Error("Product data is required.");
  }
  return post("/admin/products", data);
}
export async function updateAdminProduct(id, data) {
  if (!id) {
    throw new Error("Product ID is required.");
  }
  if (!data) {
    throw new Error("Product data is required.");
  }
  return put(`/admin/products/${id}`, data);
}
export async function updateAdminProductStock(id, stock) {
  if (!id) {
    throw new Error("Product ID is required.");
  }
  const numericStock = Number(stock);
  if (!Number.isFinite(numericStock) || numericStock < 0) {
    throw new Error("Stock must be a valid non-negative number.");
  }
  return patch(`/admin/products/${id}/stock`, { stock: numericStock });
}
export async function deleteAdminProduct(id) {
  if (!id) {
    throw new Error("Product ID is required.");
  }
  return remove(`/admin/products/${id}`);
}
/* ================================ CATEGORIES ================================ */ export async function getAdminCategories(
  params = {},
) {
  return get(`/admin/categories${buildQuery(params)}`);
}
export async function getAdminCategoryById(id) {
  if (!id) {
    throw new Error("Category ID is required.");
  }
  return get(`/admin/categories/${id}`);
}
export async function createAdminCategory(data) {
  if (!data) {
    throw new Error("Category data is required.");
  }
  return post("/admin/categories", data);
}
export async function updateAdminCategory(id, data) {
  if (!id) {
    throw new Error("Category ID is required.");
  }
  if (!data) {
    throw new Error("Category data is required.");
  }
  return put(`/admin/categories/${id}`, data);
}
export async function deleteAdminCategory(id) {
  if (!id) {
    throw new Error("Category ID is required.");
  }
  return remove(`/admin/categories/${id}`);
}
/* ================================ ORDERS ================================ */ export async function getAdminOrders(
  params = {},
) {
  return get(`/admin/orders${buildQuery(params)}`);
}
export async function getAdminOrderById(id) {
  if (!id) {
    throw new Error("Order ID is required.");
  }
  return get(`/admin/orders/${id}`);
}
export async function updateAdminOrderStatus(id, orderStatus) {
  if (!id) {
    throw new Error("Order ID is required.");
  }
  if (!orderStatus) {
    throw new Error("Order status is required.");
  }
  return patch(`/admin/orders/${id}/status`, { orderStatus });
}
export async function updateAdminPaymentStatus(id, paymentStatus) {
  if (!id) {
    throw new Error("Order ID is required.");
  }
  if (!paymentStatus) {
    throw new Error("Payment status is required.");
  }
  return patch(`/admin/orders/${id}/payment-status`, { paymentStatus });
}
export async function cancelAdminOrder(id) {
  if (!id) {
    throw new Error("Order ID is required.");
  }
  return patch(`/admin/orders/${id}/cancel`, {});
}
/* ================================ REVIEWS ================================ */ export async function getAdminReviews(
  params = {},
) {
  return get(`/admin/reviews${buildQuery(params)}`);
}
export async function getAdminReviewById(id) {
  if (!id) {
    throw new Error("Review ID is required.");
  }
  return get(`/admin/reviews/${id}`);
}
export async function updateAdminReviewStatus(id, isApproved) {
  if (!id) {
    throw new Error("Review ID is required.");
  }
  return patch(`/admin/reviews/${id}/status`, {
    isApproved: Boolean(isApproved),
  });
}
export async function deleteAdminReview(id) {
  if (!id) {
    throw new Error("Review ID is required.");
  }
  return remove(`/admin/reviews/${id}`);
}
/* ================================ COUPONS ================================ */ export async function getAdminCoupons(
  params = {},
) {
  return get(`/coupons${buildQuery(params)}`);
}
export async function getAdminCouponById(id) {
  if (!id) {
    throw new Error("Coupon ID is required.");
  }
  return get(`/coupons/${id}`);
}
export async function createAdminCoupon(data) {
  if (!data) {
    throw new Error("Coupon data is required.");
  }
  return post("/coupons", data);
}
export async function updateAdminCoupon(id, data) {
  if (!id) {
    throw new Error("Coupon ID is required.");
  }
  if (!data) {
    throw new Error("Coupon data is required.");
  }
  return patch(`/coupons/${id}`, data);
}
export async function deleteAdminCoupon(id) {
  if (!id) {
    throw new Error("Coupon ID is required.");
  }
  return remove(`/coupons/${id}`);
}
/* ================================ OFFERS ================================ */ export async function getAdminOffers(
  params = {},
) {
  return get(`/offers${buildQuery(params)}`);
}
export async function getAdminOfferById(id) {
  if (!id) {
    throw new Error("Offer ID is required.");
  }
  return get(`/offers/${id}`);
}
export async function createAdminOffer(data) {
  if (!data) {
    throw new Error("Offer data is required.");
  }
  return post("/offers", data);
}
export async function updateAdminOffer(id, data) {
  if (!id) {
    throw new Error("Offer ID is required.");
  }
  if (!data) {
    throw new Error("Offer data is required.");
  }
  return put(`/offers/${id}`, data);
}
export async function patchAdminOffer(id, data) {
  if (!id) {
    throw new Error("Offer ID is required.");
  }
  if (!data) {
    throw new Error("Offer data is required.");
  }
  return patch(`/offers/${id}`, data);
}
export async function toggleAdminOffer(id, isActive) {
  if (!id) {
    throw new Error("Offer ID is required.");
  }
  return patch(`/offers/${id}/toggle`, { isActive: Boolean(isActive) });
}
export async function deleteAdminOffer(id) {
  if (!id) {
    throw new Error("Offer ID is required.");
  }
  return remove(`/offers/${id}`);
}
