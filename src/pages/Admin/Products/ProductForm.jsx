import {
  useEffect,
  useState,
} from "react";

import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createAdminProduct,
  getAdminCategories,
  getAdminProductById,
  updateAdminProduct,
} from "../../../services/adminService";

import ProductImageManager from "../../../components/Admin/ProductImageManager";

import styles from "./ProductForm.module.css";

const initialForm = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  shortDescription: "",
  category: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  lowStockThreshold: "5",
  material: "",
  occasion: "",
  tags: "",
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isActive: true,
};

const emptyVariant = {
  name: "",
  type: "select",
  options: "",
};

function getProduct(response) {
  return (
    response?.data?.product ||
    response?.product ||
    response?.data ||
    null
  );
}

function getCategories(response) {
  const categories =
    response?.data?.categories ||
    response?.categories ||
    response?.data ||
    [];

  return Array.isArray(categories)
    ? categories
    : [];
}

function getCategoryId(product) {
  if (
    product?.category &&
    typeof product.category === "object"
  ) {
    return (
      product.category._id ||
      product.category.id ||
      ""
    );
  }

  return product?.category || "";
}

function getImages(product) {
  if (!Array.isArray(product?.images)) {
    return [];
  }

  return product.images
    .map((image) => {
      if (typeof image === "string") {
        return {
          url: image,
          publicId: "",
        };
      }

      if (
        image &&
        typeof image === "object"
      ) {
        return {
          url:
            image.url ||
            image.secure_url ||
            "",
          publicId:
            image.publicId ||
            image.public_id ||
            "",
        };
      }

      return {
        url: "",
        publicId: "",
      };
    })
    .filter(
      (image) => Boolean(image.url),
    );
}

function getImageUrls(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }

      return (
        image?.url ||
        image?.secure_url ||
        ""
      );
    })
    .filter(Boolean);
}

function getVariants(product) {
  if (!Array.isArray(product?.variants)) {
    return [];
  }

  return product.variants.map(
    (variant) => ({
      name: variant?.name || "",
      type:
        variant?.type || "select",
      options: Array.isArray(
        variant?.options,
      )
        ? variant.options.join(", ")
        : "",
    }),
  );
}

function getErrorMessage(error) {
  return (
    error?.message ||
    "Unable to save product."
  );
}

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const [
    formData,
    setFormData,
  ] = useState(initialForm);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    images,
    setImages,
  ] = useState([]);

  const [
    thumbnail,
    setThumbnail,
  ] = useState("");

  const [
    variants,
    setVariants,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(editing);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const categoryResponse =
          await getAdminCategories();

        if (!active) {
          return;
        }

        setCategories(
          getCategories(
            categoryResponse,
          ),
        );

        if (!editing) {
          setFormData(
            initialForm,
          );
          setImages([]);
          setThumbnail("");
          setVariants([]);
          setLoading(false);
          return;
        }

        const response =
          await getAdminProductById(
            id,
          );

        const product =
          getProduct(response);

        if (!product) {
          throw new Error(
            "Product not found.",
          );
        }

        const productImages =
          getImages(product);

        const imageUrls =
          getImageUrls(
            productImages,
          );

        const productThumbnail =
          product?.thumbnail ||
          imageUrls[0] ||
          "";

        setFormData({
          name:
            product?.name || "",
          slug:
            product?.slug || "",
          sku:
            product?.sku || "",
          description:
            product?.description ||
            "",
          shortDescription:
            product?.shortDescription ||
            "",
          category:
            getCategoryId(
              product,
            ),
          price:
            product?.price ?? "",
          compareAtPrice:
            product?.compareAtPrice ??
            "",
          stock:
            product?.stock ?? 0,
          lowStockThreshold:
            product?.lowStockThreshold ??
            5,
          material:
            product?.material || "",
          occasion:
            product?.occasion || "",
          tags: Array.isArray(
            product?.tags,
          )
            ? product.tags.join(", ")
            : "",
          isFeatured:
            Boolean(
              product?.isFeatured,
            ),
          isNewArrival:
            Boolean(
              product?.isNewArrival,
            ),
          isBestSeller:
            Boolean(
              product?.isBestSeller,
            ),
          isActive:
            product?.isActive !==
            false,
        });

        setImages(
          productImages,
        );

        setThumbnail(
          productThumbnail,
        );

        setVariants(
          getVariants(
            product,
          ),
        );
      } catch (
        requestError
      ) {
        if (active) {
          setError(
            getErrorMessage(
              requestError,
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [id, editing]);

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]:
          type === "checkbox"
            ? checked
            : value,
      }),
    );
  };

  const handleImagesChange = (
    nextImages,
  ) => {
    const normalized =
      Array.isArray(nextImages)
        ? nextImages
            .map((image) => {
              if (
                typeof image ===
                "string"
              ) {
                return {
                  url: image,
                  publicId: "",
                };
              }

              return {
                url:
                  image?.url ||
                  image?.secure_url ||
                  "",
                publicId:
                  image?.publicId ||
                  image?.public_id ||
                  "",
              };
            })
            .filter(
              (image) =>
                Boolean(
                  image.url,
                ),
            )
        : [];

    setImages(
      normalized,
    );

    setThumbnail(
      (currentThumbnail) => {
        if (
          normalized.some(
            (image) =>
              image.url ===
              currentThumbnail,
          )
        ) {
          return currentThumbnail;
        }

        return (
          normalized[0]?.url ||
          ""
        );
      },
    );
  };

  const handleThumbnailChange = (
    value,
  ) => {
    const nextThumbnail =
      String(
        value || "",
      ).trim();

    if (!nextThumbnail) {
      setThumbnail(
        images[0]?.url || "",
      );
      return;
    }

    const exists =
      images.some(
        (image) =>
          image?.url ===
          nextThumbnail,
      );

    if (!exists) {
      setError(
        "Primary image must be one of the uploaded product images.",
      );
      return;
    }

    setError("");
    setThumbnail(
      nextThumbnail,
    );
  };

  const handleVariantChange = (
    index,
    field,
    value,
  ) => {
    setVariants(
      (current) =>
        current.map(
          (
            variant,
            itemIndex,
          ) =>
            itemIndex === index
              ? {
                  ...variant,
                  [field]:
                    value,
                }
              : variant,
        ),
    );
  };

  const handleAddVariant = () => {
    setVariants(
      (current) => [
        ...current,
        {
          ...emptyVariant,
        },
      ],
    );
  };

  const handleRemoveVariant = (
    index,
  ) => {
    setVariants(
      (current) =>
        current.filter(
          (
            _,
            itemIndex,
          ) =>
            itemIndex !==
            index,
        ),
    );
  };

  const validateForm = () => {
    if (
      !formData.name.trim()
    ) {
      return "Product name is required.";
    }

    if (
      !formData.category
    ) {
      return "Valid category is required.";
    }

    const price =
      Number(
        formData.price,
      );

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      return "Valid product price is required.";
    }

    if (
      formData.compareAtPrice !==
      ""
    ) {
      const comparePrice =
        Number(
          formData.compareAtPrice,
        );

      if (
        Number.isNaN(
          comparePrice,
        ) ||
        comparePrice < 0
      ) {
        return "Invalid compare-at price.";
      }
    }

    const stock =
      Number(
        formData.stock,
      );

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return "Stock must be a non-negative integer.";
    }

    const lowStockThreshold =
      Number(
        formData.lowStockThreshold,
      );

    if (
      !Number.isInteger(
        lowStockThreshold,
      ) ||
      lowStockThreshold < 0
    ) {
      return "Low stock threshold must be a non-negative integer.";
    }

    if (
      images.length > 8
    ) {
      return "A product can have a maximum of 8 images.";
    }

    if (
      thumbnail &&
      !images.some(
        (image) =>
          image?.url ===
          thumbnail,
      )
    ) {
      return "Primary image must be one of the uploaded images.";
    }

    return "";
  };

  const buildPayload = () => {
    const imageUrls =
      getImageUrls(
        images,
      );

    const selectedThumbnail =
      imageUrls.includes(
        thumbnail,
      )
        ? thumbnail
        : imageUrls[0] || "";

    const cleanedVariants =
      variants
        .map(
          (variant) => ({
            name:
              variant.name.trim(),
            type:
              variant.type,
            options:
              variant.options
                .split(",")
                .map(
                  (
                    option,
                  ) =>
                    option.trim(),
                )
                .filter(Boolean),
          }),
        )
        .filter(
          (variant) =>
            variant.name &&
            variant.options
              .length > 0,
        );

    return {
      name:
        formData.name.trim(),

      slug:
        formData.slug.trim(),

      sku:
        formData.sku
          .trim()
          .toUpperCase(),

      description:
        formData.description.trim(),

      shortDescription:
        formData.shortDescription.trim(),

      category:
        formData.category,

      images:
        imageUrls,

      thumbnail:
        selectedThumbnail,

      price:
        Number(formData.price),

      compareAtPrice:
        formData.compareAtPrice ===
        ""
          ? null
          : Number(
              formData.compareAtPrice,
            ),

      stock:
        Number(formData.stock),

      lowStockThreshold:
        Number(
          formData.lowStockThreshold,
        ),

      variants:
        cleanedVariants,

      material:
        formData.material.trim(),

      occasion:
        formData.occasion.trim(),

      tags:
        formData.tags
          .split(",")
          .map(
            (tag) =>
              tag.trim(),
          )
          .filter(Boolean),

      isFeatured:
        Boolean(
          formData.isFeatured,
        ),

      isNewArrival:
        Boolean(
          formData.isNewArrival,
        ),

      isBestSeller:
        Boolean(
          formData.isBestSeller,
        ),

      isActive:
        Boolean(
          formData.isActive,
        ),
    };
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setError(
          validationError,
        );
        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload =
          buildPayload();

        if (editing) {
          await updateAdminProduct(
            id,
            payload,
          );
        } else {
          await createAdminProduct(
            payload,
          );
        }

        navigate(
          "/admin/products",
        );
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div
        className={
          styles.state
        }
      >
        Loading product...
      </div>
    );
  }

  return (
    <section
      className={
        styles.page
      }
    >
      <div
        className={
          styles.heading
        }
      >
        <div>
          <Link
            to="/admin/products"
            className={
              styles.back
            }
          >
            <FiArrowLeft
              size={15}
            />

            Products
          </Link>

          <span
            className={
              styles.eyebrow
            }
          >
            Store Management
          </span>

          <h1
            className={
              styles.title
            }
          >
            {editing
              ? "Edit Product"
              : "Add Product"}
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            {editing
              ? "Update product information, images and store settings."
              : "Create a new product with complete information and product images."}
          </p>
        </div>
      </div>

      {error && (
        <div
          className={
            styles.error
          }
        >
          {error}
        </div>
      )}

      <form
        className={
          styles.form
        }
        onSubmit={
          handleSubmit
        }
      >
        <div
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <div>
              <h2>
                Basic Information
              </h2>

              <p>
                Product name,
                identifiers and
                category.
              </p>
            </div>

            <span
              className={
                formData.isActive
                  ? styles.active
                  : styles.inactive
              }
            >
              {formData.isActive
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-name">
                Product Name *
              </label>

              <input
                id="product-name"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                placeholder="Gold Necklace"
                required
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-sku">
                SKU *
              </label>

              <input
                id="product-sku"
                name="sku"
                value={
                  formData.sku
                }
                onChange={
                  handleChange
                }
                placeholder="NK-GOLD-001"
                required
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-slug">
                Slug
              </label>

              <input
                id="product-slug"
                name="slug"
                value={
                  formData.slug
                }
                onChange={
                  handleChange
                }
                placeholder="gold-necklace"
              />

              <span
                className={
                  styles.help
                }
              >
                Leave empty if the
                backend should generate
                the slug.
              </span>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-category">
                Category *
              </label>

              <select
                id="product-category"
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => {
                    const categoryId =
                      category?._id ||
                      category?.id;

                    return (
                      <option
                        key={
                          categoryId
                        }
                        value={
                          categoryId
                        }
                      >
                        {category?.name ||
                          "Unnamed category"}
                      </option>
                    );
                  },
                )}
              </select>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-material">
                Material
              </label>

              <input
                id="product-material"
                name="material"
                value={
                  formData.material
                }
                onChange={
                  handleChange
                }
                placeholder="Gold, Silver, Pearl"
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-occasion">
                Occasion
              </label>

              <input
                id="product-occasion"
                name="occasion"
                value={
                  formData.occasion
                }
                onChange={
                  handleChange
                }
                placeholder="Wedding, Party, Daily"
              />
            </div>
          </div>
        </div>

        <div
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <div>
              <h2>
                Product Description
              </h2>

              <p>
                Customer-facing
                product content.
              </p>
            </div>
          </div>

          <div
            className={
              styles.field
            }
          >
            <label htmlFor="product-short-description">
              Short Description
            </label>

            <textarea
              id="product-short-description"
              name="shortDescription"
              value={
                formData.shortDescription
              }
              onChange={
                handleChange
              }
              placeholder="A short description for product cards and previews."
              rows="4"
            />
          </div>

          <div
            className={
              styles.field
            }
          >
            <label htmlFor="product-description">
              Description
            </label>

            <textarea
              id="product-description"
              name="description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
              placeholder="Detailed product description."
              rows="8"
            />
          </div>
        </div>

        <div
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <div>
              <h2>
                Pricing & Inventory
              </h2>

              <p>
                Manage selling price,
                comparison price and
                available stock.
              </p>
            </div>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-price">
                Price *
              </label>

              <div
                className={
                  styles.inputWithPrefix
                }
              >
                <span>
                  ₹
                </span>

                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </div>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-compare-price">
                Compare-at Price
              </label>

              <div
                className={
                  styles.inputWithPrefix
                }
              >
                <span>
                  ₹
                </span>

                <input
                  id="product-compare-price"
                  name="compareAtPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formData.compareAtPrice
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-stock">
                Stock
              </label>

              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={
                  formData.stock
                }
                onChange={
                  handleChange
                }
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label htmlFor="product-low-stock">
                Low Stock Threshold
              </label>

              <input
                id="product-low-stock"
                name="lowStockThreshold"
                type="number"
                min="0"
                step="1"
                value={
                  formData.lowStockThreshold
                }
                onChange={
                  handleChange
                }
              />
            </div>
          </div>
        </div>

        <div
          className={
            styles.card
          }
        >
          <ProductImageManager
            images={
              images
            }
            thumbnail={
              thumbnail
            }
            onChange={
              handleImagesChange
            }
            onThumbnailChange={
              handleThumbnailChange
            }
            disabled={
              saving
            }
          />
        </div>

        <div
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <div>
              <h2>
                Variants
              </h2>

              <p>
                Define selectable
                product options such
                as size or color.
              </p>
            </div>

            <button
              type="button"
              className={
                styles.addVariant
              }
              onClick={
                handleAddVariant
              }
              disabled={
                saving
              }
            >
              <FiPlus
                size={14}
              />

              Add Variant
            </button>
          </div>

          {variants.length ===
          0 ? (
            <div
              className={
                styles.variantEmpty
              }
            >
              No variants added.
            </div>
          ) : (
            <div
              className={
                styles.variantList
              }
            >
              {variants.map(
                (
                  variant,
                  index,
                ) => (
                  <div
                    key={
                      index
                    }
                    className={
                      styles.variant
                    }
                  >
                    <div
                      className={
                        styles.variantGrid
                      }
                    >
                      <div
                        className={
                          styles.field
                        }
                      >
                        <label>
                          Variant Name
                        </label>

                        <input
                          value={
                            variant.name
                          }
                          onChange={(
                            event,
                          ) =>
                            handleVariantChange(
                              index,
                              "name",
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="Size"
                        />
                      </div>

                      <div
                        className={
                          styles.field
                        }
                      >
                        <label>
                          Type
                        </label>

                        <select
                          value={
                            variant.type
                          }
                          onChange={(
                            event,
                          ) =>
                            handleVariantChange(
                              index,
                              "type",
                              event
                                .target
                                .value,
                            )
                          }
                        >
                          <option value="select">
                            Select
                          </option>

                          <option value="button">
                            Button
                          </option>

                          <option value="color">
                            Color
                          </option>
                        </select>
                      </div>

                      <div
                        className={
                          styles.field
                        }
                      >
                        <label>
                          Options
                        </label>

                        <input
                          value={
                            variant.options
                          }
                          onChange={(
                            event,
                          ) =>
                            handleVariantChange(
                              index,
                              "options",
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="Small, Medium, Large"
                        />

                        <span
                          className={
                            styles.help
                          }
                        >
                          Separate options
                          with commas.
                        </span>
                      </div>

                      <button
                        type="button"
                        className={
                          styles.removeVariant
                        }
                        onClick={() =>
                          handleRemoveVariant(
                            index,
                          )
                        }
                        disabled={
                          saving
                        }
                        title="Remove variant"
                        aria-label="Remove variant"
                      >
                        <FiTrash2
                          size={15}
                        />
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <div>
              <h2>
                Store Settings
              </h2>

              <p>
                Control product labels,
                tags and visibility.
              </p>
            </div>
          </div>

          <div
            className={
              styles.field
            }
          >
            <label htmlFor="product-tags">
              Tags
            </label>

            <input
              id="product-tags"
              name="tags"
              value={
                formData.tags
              }
              onChange={
                handleChange
              }
              placeholder="gold, necklace, wedding"
            />

            <span
              className={
                styles.help
              }
            >
              Separate tags with
              commas.
            </span>
          </div>

          <div
            className={
              styles.checkboxes
            }
          >
            <label>
              <input
                type="checkbox"
                name="isFeatured"
                checked={
                  formData.isFeatured
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Featured product
              </span>
            </label>

            <label>
              <input
                type="checkbox"
                name="isNewArrival"
                checked={
                  formData.isNewArrival
                }
                onChange={
                  handleChange
                }
              />

              <span>
                New arrival
              </span>
            </label>

            <label>
              <input
                type="checkbox"
                name="isBestSeller"
                checked={
                  formData.isBestSeller
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Best seller
              </span>
            </label>

            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={
                  formData.isActive
                }
                onChange={
                  handleChange
                }
              />

              <span>
                Product active
              </span>
            </label>
          </div>
        </div>

        <div
          className={
            styles.formActions
          }
        >
          <Link
            to="/admin/products"
            className={
              styles.cancel
            }
          >
            Cancel
          </Link>

          <button
            type="submit"
            className={
              styles.save
            }
            disabled={
              saving
            }
          >
            {saving
              ? "Saving..."
              : editing
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProductForm;
