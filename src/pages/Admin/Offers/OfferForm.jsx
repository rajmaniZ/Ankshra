import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";

import {
  createOffer,
  getOfferById,
  updateOffer,
} from "../../../services/offerService";

import { getCategories } from "../../../services/categoryService";
import { getProducts } from "../../../services/productService";

import styles from "./OfferForm.module.css";

const initialForm = {
  name: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  appliesTo: "all",
  category: "",
  products: [],
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function getOffer(response) {
  return (
    response?.data?.offer ||
    response?.offer ||
    null
  );
}

function getCategoryList(response) {
  return (
    response?.data?.categories ||
    response?.categories ||
    (Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [])
  );
}

function getProductList(response) {
  return (
    response?.data?.products ||
    response?.products ||
    (Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [])
  );
}

function getId(item) {
  return (
    item?._id ||
    item?.id ||
    ""
  );
}

function getCategoryId(category) {
  if (!category) {
    return "";
  }

  if (
    typeof category === "string"
  ) {
    return category;
  }

  return getId(category);
}

function getProductId(product) {
  if (!product) {
    return "";
  }

  if (
    typeof product === "string"
  ) {
    return product;
  }

  return getId(product);
}

function getCategoryName(category) {
  return (
    category?.name ||
    category?.title ||
    "Category"
  );
}

function getProductName(product) {
  return (
    product?.name ||
    product?.title ||
    "Product"
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  const hours = String(
    date.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function OfferForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const [form, setForm] =
    useState(initialForm);

  const [categories, setCategories] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        categoryResponse,
        productResponse,
        offerResponse,
      ] = await Promise.all([
        getCategories(),
        getProducts(),
        editing
          ? getOfferById(id)
          : Promise.resolve(null),
      ]);

      setCategories(
        getCategoryList(
          categoryResponse,
        ),
      );

      setProducts(
        getProductList(
          productResponse,
        ),
      );

      if (editing) {
        const offer =
          getOffer(offerResponse);

        if (!offer) {
          throw new Error(
            "Offer not found.",
          );
        }

        setForm({
          name:
            offer.name || "",

          description:
            offer.description ||
            "",

          discountType:
            offer.discountType ||
            "percentage",

          discountValue:
            offer.discountValue ??
            "",

          appliesTo:
            offer.appliesTo ||
            "all",

          category:
            getCategoryId(
              offer.category,
            ),

          products:
            Array.isArray(
              offer.products,
            )
              ? offer.products
                  .map(
                    getProductId,
                  )
                  .filter(Boolean)
              : [],

          startsAt:
            formatDateTime(
              offer.startsAt,
            ),

          expiresAt:
            formatDateTime(
              offer.expiresAt,
            ),

          isActive:
            offer.isActive !==
            false,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load offer form:",
        error,
      );

      setError(
        error?.message ||
          "Failed to load offer data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setError("");
  };

  const handleAppliesToChange = (
    event,
  ) => {
    const value =
      event.target.value;

    setForm((current) => ({
      ...current,
      appliesTo: value,
      category: "",
      products: [],
    }));

    setError("");
  };

  const handleProductToggle = (
    productId,
  ) => {
    setForm((current) => {
      const exists =
        current.products.includes(
          productId,
        );

      return {
        ...current,

        products: exists
          ? current.products.filter(
              (item) =>
                item !== productId,
            )
          : [
              ...current.products,
              productId,
            ],
      };
    });

    setError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Offer name is required.";
    }

    const discountValue =
      Number(form.discountValue);

    if (
      !Number.isFinite(
        discountValue,
      ) ||
      discountValue <= 0
    ) {
      return "Enter a valid discount value.";
    }

    if (
      form.discountType ===
        "percentage" &&
      discountValue > 100
    ) {
      return "Percentage discount cannot be greater than 100%.";
    }

    if (!form.startsAt) {
      return "Start date is required.";
    }

    if (!form.expiresAt) {
      return "Expiry date is required.";
    }

    const startsAt =
      new Date(form.startsAt);

    const expiresAt =
      new Date(form.expiresAt);

    if (
      Number.isNaN(
        startsAt.getTime(),
      ) ||
      Number.isNaN(
        expiresAt.getTime(),
      )
    ) {
      return "Enter valid offer dates.";
    }

    if (expiresAt <= startsAt) {
      return "Expiry date must be after the start date.";
    }

    if (
      form.appliesTo ===
        "category" &&
      !form.category
    ) {
      return "Select a category.";
    }

    if (
      form.appliesTo ===
        "products" &&
      form.products.length === 0
    ) {
      return "Select at least one product.";
    }

    return "";
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError,
      );

      return;
    }

    setSaving(true);
    setError("");

    const data = {
      name: form.name.trim(),

      description:
        form.description.trim(),

      discountType:
        form.discountType,

      discountValue:
        Number(form.discountValue),

      appliesTo:
        form.appliesTo,

      startsAt: new Date(
        form.startsAt,
      ).toISOString(),

      expiresAt: new Date(
        form.expiresAt,
      ).toISOString(),

      isActive:
        form.isActive,
    };

    if (
      form.appliesTo ===
      "category"
    ) {
      data.category =
        form.category;
    }

    if (
      form.appliesTo ===
      "products"
    ) {
      data.products =
        form.products;
    }

    if (
      form.appliesTo !==
      "category"
    ) {
      data.category =
        undefined;
    }

    if (
      form.appliesTo !==
      "products"
    ) {
      data.products = [];
    }

    try {
      if (editing) {
        await updateOffer(
          id,
          data,
        );
      } else {
        await createOffer(data);
      }

      navigate(
        "/admin/offers",
      );
    } catch (error) {
      console.error(
        "Failed to save offer:",
        error,
      );

      setError(
        error?.message ||
          "Failed to save offer.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section
        className={styles.page}
      >
        <div
          className={styles.loading}
        >
          Loading offer...
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.page}
    >
      <div
        className={styles.container}
      >
        <Link
          to="/admin/offers"
          className={styles.back}
        >
          <FiArrowLeft size={15} />
          Back to Offers
        </Link>

        <div
          className={styles.header}
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              Promotions
            </span>

            <h1
              className={
                styles.title
              }
            >
              {editing
                ? "Edit Offer"
                : "Create Offer"}
            </h1>

            <p
              className={
                styles.subtitle
              }
            >
              Create a discount for
              your jewellery products.
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
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div
            className={styles.main}
          >
            <div
              className={
                styles.section
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  Basic Information
                </h2>
              </div>

              <div
                className={
                  styles.formGrid
                }
              >
                <label
                  className={
                    styles.full
                  }
                >
                  <span>
                    Offer Name
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Festive Gold Offer"
                    maxLength={120}
                  />
                </label>

                <label
                  className={
                    styles.full
                  }
                >
                  <span>
                    Description
                  </span>

                  <textarea
                    name="description"
                    value={
                      form.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe this offer"
                    rows={4}
                    maxLength={500}
                  />
                </label>
              </div>
            </div>

            <div
              className={
                styles.section
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  Discount
                </h2>
              </div>

              <div
                className={
                  styles.formGrid
                }
              >
                <label>
                  <span>
                    Discount Type
                  </span>

                  <select
                    name="discountType"
                    value={
                      form.discountType
                    }
                    onChange={
                      handleChange
                    }
                  >
                    <option value="percentage">
                      Percentage
                    </option>

                    <option value="fixed">
                      Fixed Amount
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    Discount Value
                  </span>

                  <div
                    className={
                      styles.valueInput
                    }
                  >
                    <span>
                      {form.discountType ===
                      "percentage"
                        ? "%"
                        : "₹"}
                    </span>

                    <input
                      type="number"
                      name="discountValue"
                      value={
                        form.discountValue
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      max={
                        form.discountType ===
                        "percentage"
                          ? "100"
                          : undefined
                      }
                      step="0.01"
                      placeholder="0"
                    />
                  </div>
                </label>
              </div>
            </div>

            <div
              className={
                styles.section
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  Apply Offer To
                </h2>
              </div>

              <div
                className={
                  styles.radioGrid
                }
              >
                <label
                  className={
                    form.appliesTo ===
                    "all"
                      ? styles.radioCardSelected
                      : styles.radioCard
                  }
                >
                  <input
                    type="radio"
                    name="appliesTo"
                    value="all"
                    checked={
                      form.appliesTo ===
                      "all"
                    }
                    onChange={
                      handleAppliesToChange
                    }
                  />

                  <span>
                    <strong>
                      All Products
                    </strong>

                    <small>
                      Apply this offer
                      to all products.
                    </small>
                  </span>
                </label>

                <label
                  className={
                    form.appliesTo ===
                    "category"
                      ? styles.radioCardSelected
                      : styles.radioCard
                  }
                >
                  <input
                    type="radio"
                    name="appliesTo"
                    value="category"
                    checked={
                      form.appliesTo ===
                      "category"
                    }
                    onChange={
                      handleAppliesToChange
                    }
                  />

                  <span>
                    <strong>
                      Category
                    </strong>

                    <small>
                      Apply this offer
                      to a category.
                    </small>
                  </span>
                </label>

                <label
                  className={
                    form.appliesTo ===
                    "products"
                      ? styles.radioCardSelected
                      : styles.radioCard
                  }
                >
                  <input
                    type="radio"
                    name="appliesTo"
                    value="products"
                    checked={
                      form.appliesTo ===
                      "products"
                    }
                    onChange={
                      handleAppliesToChange
                    }
                  />

                  <span>
                    <strong>
                      Products
                    </strong>

                    <small>
                      Select specific
                      products.
                    </small>
                  </span>
                </label>
              </div>

              {form.appliesTo ===
                "category" && (
                <div
                  className={
                    styles.selection
                  }
                >
                  <label>
                    <span>
                      Category
                    </span>

                    <select
                      name="category"
                      value={
                        form.category
                      }
                      onChange={
                        handleChange
                      }
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (
                          category,
                        ) => {
                          const categoryId =
                            getId(
                              category,
                            );

                          return (
                            <option
                              key={
                                categoryId
                              }
                              value={
                                categoryId
                              }
                            >
                              {getCategoryName(
                                category,
                              )}
                            </option>
                          );
                        },
                      )}
                    </select>
                  </label>
                </div>
              )}

              {form.appliesTo ===
                "products" && (
                <div
                  className={
                    styles.productSelection
                  }
                >
                  <div
                    className={
                      styles.selectionHeader
                    }
                  >
                    <span>
                      Select Products
                    </span>

                    <small>
                      {
                        form.products
                          .length
                      }{" "}
                      selected
                    </small>
                  </div>

                  {products.length ===
                  0 ? (
                    <div
                      className={
                        styles.noItems
                      }
                    >
                      No products
                      available.
                    </div>
                  ) : (
                    <div
                      className={
                        styles.productList
                      }
                    >
                      {products.map(
                        (
                          product,
                        ) => {
                          const productId =
                            getId(
                              product,
                            );

                          const selected =
                            form.products.includes(
                              productId,
                            );

                          return (
                            <label
                              key={
                                productId
                              }
                              className={
                                selected
                                  ? styles.productItemSelected
                                  : styles.productItem
                              }
                            >
                              <input
                                type="checkbox"
                                checked={
                                  selected
                                }
                                onChange={() =>
                                  handleProductToggle(
                                    productId,
                                  )
                                }
                              />

                              <span>
                                {getProductName(
                                  product,
                                )}
                              </span>
                            </label>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className={
                styles.section
              }
            >
              <div
                className={
                  styles.sectionHeader
                }
              >
                <h2>
                  Schedule
                </h2>
              </div>

              <div
                className={
                  styles.formGrid
                }
              >
                <label>
                  <span>
                    Starts At
                  </span>

                  <input
                    type="datetime-local"
                    name="startsAt"
                    value={
                      form.startsAt
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>

                <label>
                  <span>
                    Expires At
                  </span>

                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={
                      form.expiresAt
                    }
                    onChange={
                      handleChange
                    }
                  />
                </label>
              </div>
            </div>

            <div
              className={
                styles.section
              }
            >
              <div
                className={
                  styles.statusRow
                }
              >
                <div>
                  <h2>
                    Offer Status
                  </h2>

                  <p>
                    Allow customers
                    to use this offer.
                  </p>
                </div>

                <label
                  className={
                    styles.switch
                  }
                >
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={
                      form.isActive
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span
                    className={
                      styles.slider
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <aside
            className={
              styles.sidebar
            }
          >
            <div
              className={
                styles.preview
              }
            >
              <span
                className={
                  styles.previewEyebrow
                }
              >
                Preview
              </span>

              <h2>
                {form.name ||
                  "Offer Name"}
              </h2>

              <div
                className={
                  styles.previewDiscount
                }
              >
                {form.discountValue ||
                  "0"}

                {form.discountType ===
                "percentage"
                  ? "% OFF"
                  : " OFF"}
              </div>

              <p>
                {form.appliesTo ===
                  "all" &&
                  "Storewide offer"}

                {form.appliesTo ===
                  "category" &&
                  "Category offer"}

                {form.appliesTo ===
                  "products" &&
                  `${
                    form.products
                      .length
                  } selected product${
                    form.products
                      .length ===
                    1
                      ? ""
                      : "s"
                  }`}
              </p>

              {form.discountType ===
                "fixed" &&
                form.discountValue && (
                  <span
                    className={
                      styles.fixedPreview
                    }
                  >
                    Save ₹
                    {Number(
                      form.discountValue,
                    ).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                )}
            </div>

            <button
              type="submit"
              className={
                styles.saveButton
              }
              disabled={saving}
            >
              <FiSave size={16} />

              {saving
                ? "Saving..."
                : editing
                  ? "Update Offer"
                  : "Create Offer"}
            </button>

            <Link
              to="/admin/offers"
              className={
                styles.cancelButton
              }
            >
              Cancel
            </Link>
          </aside>
        </form>
      </div>
    </section>
  );
}

export default OfferForm;