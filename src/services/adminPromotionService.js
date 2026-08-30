import {
  get,
} from "./api";

export async function getCouponUsers(
  id,
  params = {},
) {
  if (!id) {
    throw new Error(
      "Coupon ID is required.",
    );
  }

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
          value,
        );
      }
    },
  );

  const query =
    searchParams.toString();

  return get(
    `/admin/promotions/coupons/${id}/users${
      query
        ? `?${query}`
        : ""
    }`,
  );
}

export async function getOfferUsers(
  id,
  params = {},
) {
  if (!id) {
    throw new Error(
      "Offer ID is required.",
    );
  }

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
          value,
        );
      }
    },
  );

  const query =
    searchParams.toString();

  return get(
    `/admin/promotions/offers/${id}/users${
      query
        ? `?${query}`
        : ""
    }`,
  );
}

export async function getPromotionUsageSummary(
  type,
  id,
  params = {},
) {
  if (!type) {
    throw new Error(
      "Promotion type is required.",
    );
  }

  if (!id) {
    throw new Error(
      "Promotion ID is required.",
    );
  }

  if (
    type !== "coupon" &&
    type !== "offer"
  ) {
    throw new Error(
      "Promotion type must be coupon or offer.",
    );
  }

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
          value,
        );
      }
    },
  );

  const query =
    searchParams.toString();

  return get(
    `/admin/promotions/${type}/${id}/summary${
      query
        ? `?${query}`
        : ""
    }`,
  );
}