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
  FiSave,
} from "react-icons/fi";

import {
  createAdminCoupon,
  getAdminCouponById,
  updateAdminCoupon,
} from "../../../services/adminCouponService";

import styles from "./CouponForm.module.css";

const initialForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minimumOrderAmount: "",
  maximumDiscount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function getCoupon(response) {
  return (
    response?.data?.coupon ||
    response?.coupon ||
    null
  );
}

function formatDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

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

function CouponForm() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();

  const editing = Boolean(id);

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!editing) {
      return;
    }

    const loadCoupon =
      async () => {
        setLoading(true);
        setError("");

        try {
          const response =
            await getAdminCouponById(
              id,
            );

          const coupon =
            getCoupon(response);

          if (!coupon) {
            throw new Error(
              "Coupon not found.",
            );
          }

          setForm({
            code:
              coupon.code ||
              "",
            description:
              coupon.description ||
              "",
            discountType:
              coupon.discountType ||
              "percentage",
            discountValue:
              coupon.discountValue ??
              "",
            minimumOrderAmount:
              coupon.minimumOrderAmount ??
              "",
            maximumDiscount:
              coupon.maximumDiscount ??
              "",
            usageLimit:
              coupon.usageLimit ??
              "",
            startsAt:
              formatDateTimeLocal(
                coupon.startsAt,
              ),
            expiresAt:
              formatDateTimeLocal(
                coupon.expiresAt,
              ),
            isActive:
              coupon.isActive !==
              false,
          });
        } catch (err) {
          console.error(
            "Failed to load coupon:",
            err,
          );

          setError(
            err?.message ||
              "Failed to load coupon.",
          );
        } finally {
          setLoading(false);
        }
      };

    loadCoupon();
  }, [id, editing]);

  const handleChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      setForm(
        (current) => ({
          ...current,
          [name]:
            type === "checkbox"
              ? checked
              : value,
        }),
      );
    };

  const validateForm =
    () => {
      if (
        !form.code.trim()
      ) {
        return "Coupon code is required.";
      }

      if (
        !form.discountValue ||
        Number(form.discountValue) <= 0
      ) {
        return "Discount value must be greater than 0.";
      }

      if (
        form.discountType ===
          "percentage" &&
        Number(form.discountValue) >
          100
      ) {
        return "Percentage discount cannot be greater than 100.";
      }

      if (
        form.minimumOrderAmount !==
          "" &&
        Number(
          form.minimumOrderAmount,
        ) < 0
      ) {
        return "Minimum order amount cannot be negative.";
      }

      if (
        form.maximumDiscount !==
          "" &&
        Number(
          form.maximumDiscount,
        ) < 0
      ) {
        return "Maximum discount cannot be negative.";
      }

      if (
        form.usageLimit !==
          "" &&
        Number(form.usageLimit) <
          1
      ) {
        return "Usage limit must be at least 1.";
      }

      if (
        form.startsAt &&
        form.expiresAt
      ) {
        const start =
          new Date(
            form.startsAt,
          );

        const end =
          new Date(
            form.expiresAt,
          );

        if (
          end <= start
        ) {
          return "Expiry date must be after the start date.";
        }
      }

      return "";
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const validationError =
        validateForm();

      if (validationError) {
        setError(
          validationError,
        );
        return;
      }

      setSaving(true);

      try {
        const data = {
          code:
            form.code
              .trim()
              .toUpperCase(),

          description:
            form.description.trim(),

          discountType:
            form.discountType,

          discountValue:
            Number(
              form.discountValue,
            ),

          minimumOrderAmount:
            form.minimumOrderAmount ===
            ""
              ? 0
              : Number(
                  form.minimumOrderAmount,
                ),

          maximumDiscount:
            form.maximumDiscount ===
            ""
              ? undefined
              : Number(
                  form.maximumDiscount,
                ),

          usageLimit:
            form.usageLimit ===
            ""
              ? undefined
              : Number(
                  form.usageLimit,
                ),

          startsAt:
            form.startsAt
              ? new Date(
                  form.startsAt,
                ).toISOString()
              : undefined,

          expiresAt:
            form.expiresAt
              ? new Date(
                  form.expiresAt,
                ).toISOString()
              : undefined,

          isActive:
            form.isActive,
        };

        if (editing) {
          await updateAdminCoupon(
            id,
            data,
          );
        } else {
          await createAdminCoupon(
            data,
          );
        }

        navigate(
          "/admin/coupons",
        );
      } catch (err) {
        console.error(
          "Failed to save coupon:",
          err,
        );

        setError(
          err?.message ||
            "Failed to save coupon.",
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
          Loading coupon...
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
          to="/admin/coupons"
          className={styles.back}
        >
          <FiArrowLeft
            size={15}
          />
          Back to Coupons
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
                ? "Edit Coupon"
                : "Create Coupon"}
            </h1>

            <p
              className={
                styles.description
              }
            >
              {editing
                ? "Update the coupon details and availability."
                : "Create a discount coupon for your customers."}
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
          onSubmit={
            handleSubmit
          }
        >
          <div
            className={styles.section}
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <h2>
                Coupon Details
              </h2>
            </div>

            <div
              className={
                styles.grid
              }
            >
              <label>
                <span>
                  Coupon Code
                </span>

                <input
                  type="text"
                  name="code"
                  value={
                    form.code
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="WELCOME10"
                  maxLength={50}
                  autoComplete="off"
                />
              </label>

              <label>
                <span>
                  Description
                </span>

                <input
                  type="text"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="10% off on your order"
                />
              </label>

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
                  step="0.01"
                  placeholder={
                    form.discountType ===
                    "percentage"
                      ? "10"
                      : "500"
                  }
                />
              </label>

              <label>
                <span>
                  Minimum Order Amount
                </span>

                <input
                  type="number"
                  name="minimumOrderAmount"
                  value={
                    form.minimumOrderAmount
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="1000"
                />
              </label>

              <label>
                <span>
                  Maximum Discount
                </span>

                <input
                  type="number"
                  name="maximumDiscount"
                  value={
                    form.maximumDiscount
                  }
                  onChange={
                    handleChange
                  }
                  min="0"
                  step="0.01"
                  placeholder="500"
                  disabled={
                    form.discountType !==
                    "percentage"
                  }
                />
              </label>
            </div>
          </div>

          <div
            className={styles.section}
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <h2>
                Usage & Validity
              </h2>
            </div>

            <div
              className={
                styles.grid
              }
            >
              <label>
                <span>
                  Usage Limit
                </span>

                <input
                  type="number"
                  name="usageLimit"
                  value={
                    form.usageLimit
                  }
                  onChange={
                    handleChange
                  }
                  min="1"
                  step="1"
                  placeholder="100"
                />

                <small>
                  Leave empty for
                  unlimited usage.
                </small>
              </label>

              <label>
                <span>
                  Start Date
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
                  Expiry Date
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

              <label
                className={
                  styles.statusField
                }
              >
                <span>
                  Status
                </span>

                <label
                  className={
                    styles.switchRow
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

                  <span>
                    {form.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </label>
              </label>
            </div>
          </div>

          <div
            className={
              styles.footer
            }
          >
            <Link
              to="/admin/coupons"
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
              <FiSave
                size={16}
              />

              {saving
                ? "Saving..."
                : editing
                ? "Update Coupon"
                : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CouponForm;