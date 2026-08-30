import {
  get,
  patch,
  remove,
} from "./api";

function getReviewId(id) {
  if (!id) {
    return "";
  }

  if (typeof id === "object") {
    return String(
      id._id ||
        id.id ||
        "",
    );
  }

  return String(id);
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
  const reviewId =
    getReviewId(id);

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
  const reviewId =
    getReviewId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  if (
    typeof isApproved !==
    "boolean"
  ) {
    throw new Error(
      "Review approval status must be true or false.",
    );
  }

  return patch(
    `/admin/reviews/${reviewId}/status`,
    {
      isApproved,
    },
  );
}

export async function updateAdminReviewVisibility(
  id,
  isPublic,
) {
  const reviewId =
    getReviewId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  if (
    typeof isPublic !==
    "boolean"
  ) {
    throw new Error(
      "Review visibility must be true or false.",
    );
  }

  return patch(
    `/admin/reviews/${reviewId}/visibility`,
    {
      isPublic,
    },
  );
}

export async function updateAdminReviewReply(
  id,
  message,
  isPublic = true,
) {
  const reviewId =
    getReviewId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  if (
    typeof message !==
      "string" ||
    !message.trim()
  ) {
    throw new Error(
      "Reply message is required.",
    );
  }

  if (
    typeof isPublic !==
    "boolean"
  ) {
    throw new Error(
      "Reply visibility must be true or false.",
    );
  }

  return patch(
    `/admin/reviews/${reviewId}/reply`,
    {
      message: message.trim(),
      isPublic,
    },
  );
}

export async function deleteAdminReview(
  id,
) {
  const reviewId =
    getReviewId(id);

  if (!reviewId) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return remove(
    `/admin/reviews/${reviewId}`,
  );
}