import {
  get,
  post,
  patch,
  remove,
} from "./api";

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
          value,
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
  if (!id) {
    throw new Error(
      "Coupon ID is required.",
    );
  }

  return get(
    `/coupons/${id}`,
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
  if (!id) {
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
    `/coupons/${id}`,
    data,
  );
}

export async function deleteAdminCoupon(
  id,
) {
  if (!id) {
    throw new Error(
      "Coupon ID is required.",
    );
  }

  return remove(
    `/coupons/${id}`,
  );
}