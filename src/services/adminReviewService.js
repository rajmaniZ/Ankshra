import {
  get,
  patch,
  remove,
} from "./api";

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(
          key,
          value,
        );
      }
    },
  );

  const query =
    searchParams.toString();

  return query ? `?${query}` : "";
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
  if (!id) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return get(
    `/admin/reviews/${id}`,
  );
}

export async function updateAdminReviewStatus(
  id,
  isApproved,
) {
  if (!id) {
    throw new Error(
      "Review ID is required.",
    );
  }

  if (typeof isApproved !== "boolean") {
    throw new Error(
      "Review approval status must be true or false.",
    );
  }

  return patch(
    `/admin/reviews/${id}/status`,
    {
      isApproved,
    },
  );
}

export async function deleteAdminReview(
  id,
) {
  if (!id) {
    throw new Error(
      "Review ID is required.",
    );
  }

  return remove(
    `/admin/reviews/${id}`,
  );
}