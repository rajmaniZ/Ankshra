import {
  get,
} from "./api";

export async function getCategories() {
  return get(
    "/categories",
  );
}

export async function getCategoryBySlug(
  slug,
) {
  if (!slug) {
    throw new Error(
      "Category slug is required",
    );
  }

  return get(
    `/categories/${encodeURIComponent(
      slug,
    )}`,
  );
}