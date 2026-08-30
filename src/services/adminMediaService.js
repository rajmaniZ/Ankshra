import {
  post,
  put,
  remove,
} from "./api";

function getId(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return String(
      value._id ||
        value.id ||
        "",
    );
  }

  return String(value);
}

function getErrorMessage(
  error,
  fallback,
) {
  return (
    error?.message ||
    fallback ||
    "Something went wrong."
  );
}

/*
 * Upload product or category images.
 *
 * Backend:
 * POST /api/admin/media/images
 *
 * FormData:
 * type = product | category
 * images = files
 */
export async function uploadAdminImages(
  files = [],
  type,
) {
  const entityType =
    String(type || "")
      .trim()
      .toLowerCase();

  if (
    entityType !== "product" &&
    entityType !== "category"
  ) {
    throw new Error(
      "Image type must be product or category.",
    );
  }

  if (!Array.isArray(files)) {
    throw new Error(
      "Images must be provided as an array.",
    );
  }

  const validFiles =
    files.filter(
      (file) =>
        typeof File !== "undefined" &&
        file instanceof File,
    );

  if (validFiles.length === 0) {
    throw new Error(
      "At least one image is required.",
    );
  }

  if (
    entityType === "category" &&
    validFiles.length > 1
  ) {
    throw new Error(
      "Only one category image can be uploaded at a time.",
    );
  }

  if (
    entityType === "product" &&
    validFiles.length > 8
  ) {
    throw new Error(
      "A product can have a maximum of 8 images.",
    );
  }

  const formData =
    new FormData();

  formData.append(
    "type",
    entityType,
  );

  validFiles.forEach(
    (file) => {
      formData.append(
        "images",
        file,
      );
    },
  );

  try {
    return await post(
      "/admin/media/images",
      formData,
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to upload images.",
      ),
    );
  }
}

/*
 * Delete one or more Cloudinary images.
 *
 * Backend:
 * DELETE /api/admin/media/images
 *
 * body:
 * {
 *   images: [...]
 * }
 */
export async function deleteAdminImages(
  images = [],
) {
  if (!Array.isArray(images)) {
    throw new Error(
      "Images must be provided as an array.",
    );
  }

  const values =
    images
      .map((image) => {
        if (
          typeof image ===
          "string"
        ) {
          return image.trim();
        }

        if (
          image &&
          typeof image ===
            "object"
        ) {
          return {
            url:
              image.url || "",
            publicId:
              image.publicId || "",
          };
        }

        return null;
      })
      .filter(Boolean);

  if (values.length === 0) {
    throw new Error(
      "At least one image is required.",
    );
  }

  try {
    return await remove(
      "/admin/media/images",
      {
        body: JSON.stringify({
          images: values,
        }),
      },
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to delete images.",
      ),
    );
  }
}

/*
 * Save the complete product image
 * collection and thumbnail.
 *
 * Backend:
 * PUT /api/admin/products/:id/images
 */
export async function syncProductImages(
  id,
  images = [],
  thumbnail = "",
) {
  const productId =
    getId(id);

  if (!productId) {
    throw new Error(
      "Product ID is required.",
    );
  }

  const imageList =
    Array.isArray(images)
      ? images
          .map((image) => {
            if (
              typeof image ===
              "string"
            ) {
              return image.trim();
            }

            return String(
              image?.url || "",
            ).trim();
          })
          .filter(Boolean)
      : [];

  const uniqueImages = [
    ...new Set(imageList),
  ];

  let nextThumbnail =
    String(
      thumbnail || "",
    ).trim();

  if (
    nextThumbnail &&
    !uniqueImages.includes(
      nextThumbnail,
    )
  ) {
    nextThumbnail =
      uniqueImages[0] || "";
  }

  if (
    !nextThumbnail &&
    uniqueImages.length > 0
  ) {
    nextThumbnail =
      uniqueImages[0];
  }

  if (
    uniqueImages.length > 8
  ) {
    throw new Error(
      "A product can have a maximum of 8 images.",
    );
  }

  try {
    return await put(
      `/admin/products/${productId}/images`,
      {
        images:
          uniqueImages,
        thumbnail:
          nextThumbnail,
      },
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to update product images.",
      ),
    );
  }
}

/*
 * Replace category image.
 *
 * Backend:
 * PUT /api/admin/categories/:id/image
 *
 * FormData:
 * image = file
 */
export async function updateCategoryImage(
  id,
  file,
) {
  const categoryId =
    getId(id);

  if (!categoryId) {
    throw new Error(
      "Category ID is required.",
    );
  }

  if (
    typeof File ===
      "undefined" ||
    !(file instanceof File)
  ) {
    throw new Error(
      "A valid category image is required.",
    );
  }

  const formData =
    new FormData();

  formData.append(
    "image",
    file,
  );

  try {
    return await put(
      `/admin/categories/${categoryId}/image`,
      formData,
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to update category image.",
      ),
    );
  }
}

/*
 * Delete category image.
 *
 * Backend:
 * DELETE /api/admin/categories/:id/image
 */
export async function deleteCategoryImage(
  id,
) {
  const categoryId =
    getId(id);

  if (!categoryId) {
    throw new Error(
      "Category ID is required.",
    );
  }

  try {
    return await remove(
      `/admin/categories/${categoryId}/image`,
    );
  } catch (error) {
    throw new Error(
      getErrorMessage(
        error,
        "Unable to delete category image.",
      ),
    );
  }
}