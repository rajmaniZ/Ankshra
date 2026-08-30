export function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  const image =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image ||
    "";

  return {
    ...product,
    id: product._id || product.id,
    image,
    categoryName:
      product.category?.name ||
      product.categoryName ||
      "",
  };
}

export function normalizeProducts(products = []) {
  return products
    .map(normalizeProduct)
    .filter(Boolean);
}