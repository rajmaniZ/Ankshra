import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
} from "react-icons/fi";

import {
  createAdminProduct,
  getAdminCategories,
  getAdminProductById,
  updateAdminProduct,
} from "../../../services/adminService";

import styles from "./ProductForm.module.css";

const initialForm = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  shortDescription: "",
  category: "",
  image: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  lowStockThreshold: "5",
  tags: "",
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
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
  return (
    response?.data?.categories ||
    response?.categories ||
    response?.data ||
    []
  );
}

function getImage(product) {
  const first =
    product?.images?.[0];

  if (
    first &&
    typeof first === "object"
  ) {
    return (
      first.url ||
      first.secure_url ||
      ""
    );
  }

  return (
    first ||
    product?.image ||
    ""
  );
}

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing =
    Boolean(id);

  const [
    formData,
    setFormData,
  ] = useState(
    initialForm,
  );

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(
    editing,
  );

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

        const tags =
          Array.isArray(
            product.tags,
          )
            ? product.tags.join(
                ", ",
              )
            : "";

        setFormData({
          name:
            product.name ||
            "",
          slug:
            product.slug ||
            "",
          sku:
            product.sku ||
            "",
          description:
            product.description ||
            "",
          shortDescription:
            product.shortDescription ||
            "",
          category:
            product.category?._id ||
            product.category?.id ||
            product.category ||
            "",
          image:
            getImage(product),
          price:
            product.price ??
            "",
          compareAtPrice:
            product.compareAtPrice ??
            "",
          stock:
            product.stock ??
            0,
          lowStockThreshold:
            product.lowStockThreshold ??
            5,
          tags,
          isFeatured:
            Boolean(
              product.isFeatured,
            ),
          isNewArrival:
            Boolean(
              product.isNewArrival,
            ),
          isBestSeller:
            Boolean(
              product.isBestSeller,
            ),
        });
      } catch (requestError) {
        if (active) {
          setError(
            requestError?.message ||
              "Unable to load product.",
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

  const handleChange =
    (event) => {
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
            type ===
            "checkbox"
              ? checked
              : value,
        }),
      );

      setError("");
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const name =
        formData.name.trim();

      const sku =
        formData.sku.trim();

      const category =
        formData.category;

      const price =
        Number(formData.price);

      const stock =
        Number(formData.stock);

      if (!name) {
        setError(
          "Product name is required.",
        );
        return;
      }

      if (!sku) {
        setError(
          "SKU is required.",
        );
        return;
      }

      if (!category) {
        setError(
          "Please select a category.",
        );
        return;
      }

      if (
        !Number.isFinite(
          price,
        ) ||
        price < 0
      ) {
        setError(
          "Please enter a valid price.",
        );
        return;
      }

      if (
        !Number.isInteger(
          stock,
        ) ||
        stock < 0
      ) {
        setError(
          "Stock must be a whole number greater than or equal to 0.",
        );
        return;
      }

      const tags =
        formData.tags
          .split(",")
          .map(
            (tag) =>
              tag.trim(),
          )
          .filter(Boolean);

      const images =
        formData.image.trim()
          ? [
              {
                url:
                  formData.image.trim(),
              },
            ]
          : [];

      const payload = {
        name,
        slug:
          formData.slug.trim() ||
          undefined,
        sku,
        description:
          formData.description.trim(),
        shortDescription:
          formData.shortDescription.trim(),
        category,
        images,
        price,
        compareAtPrice:
          formData.compareAtPrice ===
          ""
            ? null
            : Number(
                formData.compareAtPrice,
              ),
        stock,
        lowStockThreshold:
          Number(
            formData.lowStockThreshold,
          ) || 5,
        tags,
        isFeatured:
          formData.isFeatured,
        isNewArrival:
          formData.isNewArrival,
        isBestSeller:
          formData.isBestSeller,
      };

      try {
        setSaving(true);

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
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to save product.",
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading) {
    return (
      <div className={styles.state}>
        Loading product...
      </div>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <Link
            to="/admin/products"
            className={styles.back}
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
            className={styles.title}
          >
            {editing
              ? "Edit Product"
              : "Add Product"}
          </h1>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form
        className={styles.form}
        onSubmit={
          handleSubmit
        }
      >
        <div
          className={styles.card}
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <h2>
              Basic Information
            </h2>

            <p>
              Product name,
              identifiers and
              category.
            </p>
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
              <label
                htmlFor="product-name"
              >
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
              <label
                htmlFor="product-sku"
              >
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
              <label
                htmlFor="product-slug"
              >
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
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="product-category"
              >
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
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category._id ||
                        category.id
                      }
                      value={
                        category._id ||
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>

        <div
          className={styles.card}
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <h2>
              Product Details
            </h2>

            <p>
              Descriptions and
              product image.
            </p>
          </div>

          <div
            className={
              styles.field
            }
          >
            <label
              htmlFor="product-short-description"
            >
              Short Description
            </label>

            <input
              id="product-short-description"
              name="shortDescription"
              value={
                formData.shortDescription
              }
              onChange={
                handleChange
              }
              placeholder="A short description of the product"
            />
          </div>

          <div
            className={
              styles.field
            }
          >
            <label
              htmlFor="product-description"
            >
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
              rows={6}
              placeholder="Describe the product..."
            />
          </div>

          <div
            className={
              styles.field
            }
          >
            <label
              htmlFor="product-image"
            >
              Image URL
            </label>

            <input
              id="product-image"
              name="image"
              type="url"
              value={
                formData.image
              }
              onChange={
                handleChange
              }
              placeholder="https://..."
            />
          </div>
        </div>

        <div
          className={styles.card}
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <h2>
              Pricing & Stock
            </h2>

            <p>
              Set price,
              comparison price and
              inventory.
            </p>
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
              <label
                htmlFor="product-price"
              >
                Price *
              </label>

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
                placeholder="0"
                required
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="product-compare-price"
              >
                Compare At Price
              </label>

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
                placeholder="Optional"
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label
                htmlFor="product-stock"
              >
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
              <label
                htmlFor="product-low-stock"
              >
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
          className={styles.card}
        >
          <div
            className={
              styles.cardHeader
            }
          >
            <h2>
              Store Settings
            </h2>

            <p>
              Control collections and
              product labels.
            </p>
          </div>

          <div
            className={
              styles.field
            }
          >
            <label
              htmlFor="product-tags"
            >
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
            disabled={saving}
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