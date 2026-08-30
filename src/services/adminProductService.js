

import {
  get,
  post,
  put,
  patch,
  remove,
} from "./api";

export async function getAdminProducts(
  params = {},
) {
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
    `/admin/products${
      query
        ? `?${query}`
        : ""
    }`,
  );
}

export async function getAdminProductById(
  id,
) {
  return get(
    `/admin/products/${id}`,
  );
}

export async function createAdminProduct(
  data,
) {
  return post(
    "/admin/products",
    data,
  );
}

export async function updateAdminProduct(
  id,
  data,
) {
  return put(
    `/admin/products/${id}`,
    data,
  );
}

export async function updateAdminProductStock(
  id,
  stock,
) {
  return patch(
    `/admin/products/${id}/stock`,
    {
      stock,
    },
  );
}

export async function deleteAdminProduct(
  id,
) {
  return remove(
    `/admin/products/${id}`,
  );
}