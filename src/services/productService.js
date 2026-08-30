import { get } from "./api";

export function getProducts(
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
    `/products${
      query
        ? `?${query}`
        : ""
    }`,
  );
}

export function getProductById(
  id,
) {
  return get(
    `/products/${id}`,
  );
}

export function getProductBySlug(
  slug,
) {
  return get(
    `/products/slug/${slug}`,
  );
}