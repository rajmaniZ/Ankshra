import {
  get,
  post,
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

  if (typeof value === "object") {
    return value._id || value.id || "";
  }

  return String(value);
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(key, String(value));
      }
    },
  );

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

function buildFormData(
  data = {},
  images = [],
) {
  const formData = new FormData();

  Object.entries(data).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        formData.append(
          key,
          String(value),
        );
      }
    },
  );

  if (Array.isArray(images)) {
    images.forEach((image) => {
      if (
        typeof File !== "undefined" &&
        image instanceof File
      ) {
        formData.append(
          "images",
          image,
        );
      }
    });
  }

  return formData;
}

export async function getProductReviews(
  productId,
) {
  const id = getId(productId);

  if (!id) {
    throw new Error(
      "Product ID is required.",
    );
  }

  return get(
    `/reviews/product/${id}`,
  );
}

export async function getAppReviews(
  params = {},
) {
  return get(
    `/reviews/app${buildQuery(params)}`,
  );
}

export async function getMyReviews() {
  return get("/reviews/my");
}

export async function getReviewById(id) {
  const reviewId = getId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return get(
    `/reviews/${reviewId}`,
  );
}

export async function createProductReview(
  data = {},
  images = [],
) {
  const productId = getId(
    data.productId,
  );

  const orderId = getId(
    data.orderId,
  );

  if (!productId) {
    throw new Error(
      "Product ID is required.",
    );
  }

  if (!orderId) {
    throw new Error(
      "Order ID is required.",
    );
  }

  const rating = Number(data.rating);

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error(
      "Rating must be between 1 and 5.",
    );
  }

  const formData = buildFormData(
    {
      reviewType: "product",
      productId,
      orderId,
      rating,
      title: data.title || "",
      comment: data.comment || "",
    },
    images,
  );

  return post(
    "/reviews",
    formData,
  );
}

export async function createAppReview(
  data = {},
) {
  const rating = Number(
    data.rating,
  );

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    throw new Error(
      "Rating must be between 1 and 5.",
    );
  }

  const formData =
    new FormData();

  formData.append(
    "reviewType",
    "app",
  );

  formData.append(
    "rating",
    String(rating),
  );

  formData.append(
    "title",
    data.title || "",
  );

  formData.append(
    "comment",
    data.comment || "",
  );

  return post(
    "/reviews/app",
    formData,
  );
}

export async function updateReview(
  id,
  data = {},
  images = [],
) {
  const reviewId = getId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  const formData = buildFormData(
    {
      rating:
        data.rating !== undefined
          ? Number(data.rating)
          : undefined,

      title:
        data.title !== undefined
          ? data.title
          : undefined,

      comment:
        data.comment !== undefined
          ? data.comment
          : undefined,

      removeImageIds:
        Array.isArray(
          data.removeImageIds,
        )
          ? JSON.stringify(
              data.removeImageIds,
            )
          : data.removeImageIds,
    },
    images,
  );

  return patch(
    `/reviews/${reviewId}`,
    formData,
  );
}

export async function deleteReview(id) {
  const reviewId = getId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return remove(
    `/reviews/${reviewId}`,
  );
}

export async function getAdminReviews(
  params = {},
) {
  return get(
    `/admin/reviews${buildQuery(params)}`,
  );
}

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