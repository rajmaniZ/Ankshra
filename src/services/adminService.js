import {
  get,
  post,
  put,
  patch,
  remove,
} from "./api";


function getId(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return String(
      value._id ||
        value.id ||
        "",
    );
  }

  return String(value);
}


function buildQuery(params = {}) {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(
          key,
          String(value),
        );
      }
    },
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
}


/* ================================
   DASHBOARD
================================ */

export async function getAdminDashboard() {
  return get(
    "/admin/dashboard",
  );
}


/* ================================
   USERS
================================ */

export async function getAdminUsers(
  params = {},
) {
  return get(
    `/admin/users${buildQuery(params)}`,
  );
}


export async function getAdminUserById(
  id,
) {
  const userId = getId(id);

  if (!userId) {
    throw new Error(
      "User ID is required.",
    );
  }

  return get(
    `/admin/users/${userId}`,
  );
}


export async function updateAdminUserStatus(
  id,
  isActive,
) {
  const userId = getId(id);

  if (!userId) {
    throw new Error(
      "User ID is required.",
    );
  }

  return patch(
    `/admin/users/${userId}/status`,
    {
      isActive: Boolean(
        isActive,
      ),
    },
  );
}


export async function updateAdminUserRole(
  id,
  role,
) {
  const userId = getId(id);

  if (!userId) {
    throw new Error(
      "User ID is required.",
    );
  }

  if (
    role !== "admin" &&
    role !== "customer"
  ) {
    throw new Error(
      "Invalid user role.",
    );
  }

  return patch(
    `/admin/users/${userId}/role`,
    {
      role,
    },
  );
}


/* ================================
   PRODUCTS
================================ */

export async function getAdminProducts(
  params = {},
) {
  return get(
    `/admin/products${buildQuery(params)}`,
  );
}


export async function getAdminProductById(
  id,
) {
  const productId = getId(id);

  if (!productId) {
    throw new Error(
      "Product ID is required.",
    );
  }

  return get(
    `/admin/products/${productId}`,
  );
}


export async function createAdminProduct(
  data,
) {
  if (!data) {
    throw new Error(
      "Product data is required.",
    );
  }

  return post(
    "/admin/products",
    data,
  );
}


export async function updateAdminProduct(
  id,
  data,
) {
  const productId = getId(id);

  if (!productId) {
    throw new Error(
      "Product ID is required.",
    );
  }

  if (!data) {
    throw new Error(
      "Product data is required.",
    );
  }

  return put(
    `/admin/products/${productId}`,
    data,
  );
}


export async function updateAdminProductStock(
  id,
  stock,
) {
  const productId = getId(id);

  if (!productId) {
    throw new Error(
      "Product ID is required.",
    );
  }

  const numericStock =
    Number(stock);

  if (
    !Number.isFinite(
      numericStock,
    ) ||
    numericStock < 0
  ) {
    throw new Error(
      "Stock must be a valid non-negative number.",
    );
  }

  return patch(
    `/admin/products/${productId}/stock`,
    {
      stock: numericStock,
    },
  );
}


export async function deleteAdminProduct(
  id,
) {
  const productId = getId(id);

  if (!productId) {
    throw new Error(
      "Product ID is required.",
    );
  }

  return remove(
    `/admin/products/${productId}`,
  );
}


/* ================================
   CATEGORIES
================================ */

export async function getAdminCategories(
  params = {},
) {
  return get(
    `/admin/categories${buildQuery(params)}`,
  );
}


export async function getAdminCategoryById(
  id,
) {
  const categoryId = getId(id);

  if (!categoryId) {
    throw new Error(
      "Category ID is required.",
    );
  }

  return get(
    `/admin/categories/${categoryId}`,
  );
}


export async function createAdminCategory(
  data,
) {
  if (!data) {
    throw new Error(
      "Category data is required.",
    );
  }

  return post(
    "/admin/categories",
    data,
  );
}


export async function updateAdminCategory(
  id,
  data,
) {
  const categoryId = getId(id);

  if (!categoryId) {
    throw new Error(
      "Category ID is required.",
    );
  }

  if (!data) {
    throw new Error(
      "Category data is required.",
    );
  }

  return put(
    `/admin/categories/${categoryId}`,
    data,
  );
}


export async function deleteAdminCategory(
  id,
) {
  const categoryId = getId(id);

  if (!categoryId) {
    throw new Error(
      "Category ID is required.",
    );
  }

  return remove(
    `/admin/categories/${categoryId}`,
  );
}


/* ================================
   ORDERS
================================ */

export async function getAdminOrders(
  params = {},
) {
  return get(
    `/admin/orders${buildQuery(params)}`,
  );
}


export async function getAdminOrderById(
  id,
) {
  const orderId = getId(id);

  if (!orderId) {
    throw new Error(
      "Order ID is required.",
    );
  }

  return get(
    `/admin/orders/${orderId}`,
  );
}


export async function updateAdminOrderStatus(
  id,
  orderStatus,
) {
  const orderId = getId(id);

  if (!orderId) {
    throw new Error(
      "Order ID is required.",
    );
  }

  if (!orderStatus) {
    throw new Error(
      "Order status is required.",
    );
  }

  return patch(
    `/admin/orders/${orderId}/status`,
    {
      orderStatus,
    },
  );
}


export async function updateAdminPaymentStatus(
  id,
  paymentStatus,
) {
  const orderId = getId(id);

  if (!orderId) {
    throw new Error(
      "Order ID is required.",
    );
  }

  if (!paymentStatus) {
    throw new Error(
      "Payment status is required.",
    );
  }

  return patch(
    `/admin/orders/${orderId}/payment-status`,
    {
      paymentStatus,
    },
  );
}


export async function cancelAdminOrder(
  id,
) {
  const orderId = getId(id);

  if (!orderId) {
    throw new Error(
      "Order ID is required.",
    );
  }

  return patch(
    `/admin/orders/${orderId}/cancel`,
    {},
  );
}


/* ================================
   REVIEWS
================================ */


/*
 * Get all reviews for the admin panel.
 *
 * Supported query parameters are passed
 * directly to the backend.
 *
 * Examples:
 *
 * getAdminReviews()
 *
 * getAdminReviews({
 *   reviewType: "product",
 * })
 *
 * getAdminReviews({
 *   reviewType: "app",
 * })
 *
 * getAdminReviews({
 *   isApproved: false,
 * })
 *
 * getAdminReviews({
 *   isPublic: true,
 * })
 */
export async function getAdminReviews(
  params = {},
) {
  return get(
    `/admin/reviews${buildQuery(params)}`,
  );
}


/*
 * Get one complete review.
 */
export async function getAdminReviewById(
  id,
) {
  const reviewId = getId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return get(
    `/admin/reviews/${reviewId}`,
  );
}


/*
 * Approve or reject a review.
 *
 * This controls moderation status.
 *
 * isApproved:
 * true  = approved
 * false = rejected / not approved
 */
export async function updateAdminReviewStatus(
  id,
  isApproved,
) {
  const reviewId = getId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return patch(
    `/admin/reviews/${reviewId}/status`,
    {
      isApproved: Boolean(
        isApproved,
      ),
    },
  );
}


/*
 * Control whether the review itself
 * is publicly visible.
 *
 * This is intentionally separate from
 * approval status.
 */
export async function updateAdminReviewVisibility(
  id,
  isPublic,
) {
  const reviewId = getId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return patch(
    `/admin/reviews/${reviewId}/visibility`,
    {
      isPublic: Boolean(
        isPublic,
      ),
    },
  );
}


/*
 * Create or update the admin reply.
 *
 * message:
 *   The reply text written by admin.
 *
 * isPublic:
 *   Controls whether the reply is visible
 *   to customers.
 */
export async function updateAdminReviewReply(
  id,
  message,
  isPublic,
) {
  const reviewId = getId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  if (
    typeof message !== "string" ||
    !message.trim()
  ) {
    throw new Error(
      "Reply message is required.",
    );
  }

  return patch(
    `/admin/reviews/${reviewId}/reply`,
    {
      message: message.trim(),
      isPublic: Boolean(
        isPublic,
      ),
    },
  );
}


/*
 * Delete a review.
 */
export async function deleteAdminReview(
  id,
) {
  const reviewId = getId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return remove(
    `/admin/reviews/${reviewId}`,
  );
}


/* ================================
   COUPONS
================================ */

export async function getAdminCoupons(
  params = {},
) {
  return get(
    `/coupons${buildQuery(params)}`,
  );
}


export async function getAdminCouponById(
  id,
) {
  const couponId = getId(id);

  if (!couponId) {
    throw new Error(
      "Coupon ID is required.",
    );
  }

  return get(
    `/coupons/${couponId}`,
  );
}


export async function createAdminCoupon(
  data,
) {
  if (!data) {
    throw new Error(
      "Coupon data is required.",
    );
  }

  return post(
    "/coupons",
    data,
  );
}


export async function updateAdminCoupon(
  id,
  data,
) {
  const couponId = getId(id);

  if (!couponId) {
    throw new Error(
      "Coupon ID is required.",
    );
  }

  if (!data) {
    throw new Error(
      "Coupon data is required.",
    );
  }

  return patch(
    `/coupons/${couponId}`,
    data,
  );
}


export async function deleteAdminCoupon(
  id,
) {
  const couponId = getId(id);

  if (!couponId) {
    throw new Error(
      "Coupon ID is required.",
    );
  }

  return remove(
    `/coupons/${couponId}`,
  );
}


/* ================================
   OFFERS
================================ */

export async function getAdminOffers(
  params = {},
) {
  return get(
    `/offers${buildQuery(params)}`,
  );
}


export async function getAdminOfferById(
  id,
) {
  const offerId = getId(id);

  if (!offerId) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  return get(
    `/offers/${offerId}`,
  );
}


export async function createAdminOffer(
  data,
) {
  if (!data) {
    throw new Error(
      "Offer data is required.",
    );
  }

  return post(
    "/offers",
    data,
  );
}


export async function updateAdminOffer(
  id,
  data,
) {
  const offerId = getId(id);

  if (!offerId) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  if (!data) {
    throw new Error(
      "Offer data is required.",
    );
  }

  return put(
    `/offers/${offerId}`,
    data,
  );
}


export async function patchAdminOffer(
  id,
  data,
) {
  const offerId = getId(id);

  if (!offerId) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  if (!data) {
    throw new Error(
      "Offer data is required.",
    );
  }

  return patch(
    `/offers/${offerId}`,
    data,
  );
}


export async function toggleAdminOffer(
  id,
  isActive,
) {
  const offerId = getId(id);

  if (!offerId) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  return patch(
    `/offers/${offerId}/toggle`,
    {
      isActive: Boolean(
        isActive,
      ),
    },
  );
}


export async function deleteAdminOffer(
  id,
) {
  const offerId = getId(id);

  if (!offerId) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  return remove(
    `/offers/${offerId}`,
  );
}