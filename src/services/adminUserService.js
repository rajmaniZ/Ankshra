import {
  get,
} from "./api";

export async function getAdminUserActivity(
  id,
) {
  if (!id) {
    throw new Error(
      "User ID is required.",
    );
  }

  return get(
    `/admin/users/${id}/activity`,
  );
}

export async function getAdminUserActivityHistory(
  id,
  params = {},
) {
  if (!id) {
    throw new Error(
      "User ID is required.",
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
    `/admin/users/${id}/activity/history${
      query
        ? `?${query}`
        : ""
    }`,
  );
}

export async function getAdminUserPromotionUsage(
  id,
  params = {},
) {
  if (!id) {
    throw new Error(
      "User ID is required.",
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
    `/admin/users/${id}/promotion-usage${
      query
        ? `?${query}`
        : ""
    }`,
  );
}