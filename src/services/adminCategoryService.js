import {
  get,
  post,
  put,
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
  if (!id) {
    throw new Error(
      "Category ID is required.",
    );
  }

  return get(
    `/admin/categories/${id}`,
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
  if (!id) {
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
    `/admin/categories/${id}`,
    data,
  );
}

export async function deleteAdminCategory(
  id,
) {
  if (!id) {
    throw new Error(
      "Category ID is required.",
    );
  }

  return remove(
    `/admin/categories/${id}`,
  );
}