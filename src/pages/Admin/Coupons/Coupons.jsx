import {
  useEffect,
  useState,
} from "react";

import {
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  Link,
} from "react-router-dom";

import {
  getAdminCoupons,
  createAdminCoupon,
  updateAdminCoupon,
  deleteAdminCoupon,
} from "../../../services/adminService";

import CouponForm from "./CouponForm";

import styles from "./Coupons.module.css";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minimumOrderAmount: "",
  maximumDiscountAmount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function getCouponsFromResponse(response) {
  return (
    response?.data?.coupons ||
    response?.coupons ||
    (Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
        ? response
        : [])
  );
}

function getErrorMessage(error) {
  return (
    error?.message ||
    "Something went wrong. Please try again."
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  const hours =
    String(
      date.getHours(),
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getInitialForm(coupon) {
  return {
    code:
      coupon?.code ||
      "",

    description:
      coupon?.description ||
      "",

    discountType:
      coupon?.discountType ||
      "percentage",

    discountValue:
      coupon?.discountValue ??
      "",

    minimumOrderAmount:
      coupon?.minimumOrderAmount ??
      "",

    maximumDiscountAmount:
      coupon?.maximumDiscountAmount ??
      "",

    usageLimit:
      coupon?.usageLimit ??
      "",

    startsAt:
      coupon?.startsAt
        ? formatDateTime(
            coupon.startsAt,
          )
        : "",

    expiresAt:
      coupon?.expiresAt
        ? formatDateTime(
            coupon.expiresAt,
          )
        : "",

    isActive:
      coupon?.isActive !== false,
  };
}

function getPayload(form) {
  return {
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
      form.minimumOrderAmount === ""
        ? 0
        : Number(
            form.minimumOrderAmount,
          ),

    maximumDiscountAmount:
      form.maximumDiscountAmount === ""
        ? null
        : Number(
            form.maximumDiscountAmount,
          ),

    usageLimit:
      form.usageLimit === ""
        ? null
        : Number(
            form.usageLimit,
          ),

    startsAt:
      form.startsAt ||
      null,

    expiresAt:
      form.expiresAt ||
      null,

    isActive:
      Boolean(
        form.isActive,
      ),
  };
}

function validateForm(form) {
  if (!form.code.trim()) {
    return "Coupon code is required.";
  }

  if (!form.discountValue) {
    return "Discount value is required.";
  }

  const discount =
    Number(
      form.discountValue,
    );

  if (
    !Number.isFinite(
      discount,
    ) ||
    discount <= 0
  ) {
    return "Discount value must be greater than 0.";
  }

  if (
    form.discountType ===
      "percentage" &&
    discount > 100
  ) {
    return "Percentage discount cannot exceed 100%.";
  }

  if (
    form.minimumOrderAmount !==
      "" &&
    (
      !Number.isFinite(
        Number(
          form.minimumOrderAmount,
        ),
      ) ||
      Number(
        form.minimumOrderAmount,
      ) < 0
    )
  ) {
    return "Minimum order amount cannot be negative.";
  }

  if (
    form.maximumDiscountAmount !==
      "" &&
    (
      !Number.isFinite(
        Number(
          form.maximumDiscountAmount,
        ),
      ) ||
      Number(
        form.maximumDiscountAmount,
      ) < 0
    )
  ) {
    return "Maximum discount cannot be negative.";
  }

  if (
    form.usageLimit !==
      "" &&
    (
      !Number.isFinite(
        Number(
          form.usageLimit,
        ),
      ) ||
      Number(
        form.usageLimit,
      ) < 1
    )
  ) {
    return "Usage limit must be at least 1.";
  }

  if (
    form.startsAt &&
    form.expiresAt &&
    new Date(
      form.expiresAt,
    ) <=
      new Date(
        form.startsAt,
      )
  ) {
    return "Expiry date must be after the start date.";
  }

  return "";
}

function formatDiscount(coupon) {
  const value =
    Number(
      coupon?.discountValue ||
        0,
    );

  if (
    coupon?.discountType ===
    "percentage"
  ) {
    return `${value}%`;
  }

  return `₹${value.toLocaleString(
    "en-IN",
  )}`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function Coupons() {
  const [
    coupons,
    setCoupons,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingCoupon,
    setEditingCoupon,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState({
    ...emptyForm,
  });

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const loadCoupons =
    async ({
      silent = false,
    } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminCoupons();

        setCoupons(
          getCouponsFromResponse(
            response,
          ),
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
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openCreateForm =
    () => {
      setEditingCoupon(null);

      setForm({
        ...emptyForm,
      });

      setError("");
      setFormOpen(true);
    };

  const openEditForm =
    (coupon) => {
      setEditingCoupon(coupon);

      setForm(
        getInitialForm(
          coupon,
        ),
      );

      setError("");
      setFormOpen(true);
    };

  const closeForm =
    () => {
      if (saving) {
        return;
      }

      setFormOpen(false);
      setEditingCoupon(null);

      setForm({
        ...emptyForm,
      });
    };

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
            type ===
            "checkbox"
              ? checked
              : value,
        }),
      );
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      const validationError =
        validateForm(form);

      if (validationError) {
        setError(
          validationError,
        );

        return;
      }

      try {
        setSaving(true);
        setError("");

        const payload =
          getPayload(form);

        if (editingCoupon) {
          const response =
            await updateAdminCoupon(
              editingCoupon._id,
              payload,
            );

          const updated =
            response?.data
              ?.coupon ||
            response?.coupon;

          if (updated) {
            setCoupons(
              (current) =>
                current.map(
                  (coupon) =>
                    coupon._id ===
                    editingCoupon._id
                      ? updated
                      : coupon,
                ),
            );
          } else {
            await loadCoupons({
              silent: true,
            });
          }
        } else {
          const response =
            await createAdminCoupon(
              payload,
            );

          const created =
            response?.data
              ?.coupon ||
            response?.coupon;

          if (created) {
            setCoupons(
              (current) => [
                created,
                ...current,
              ],
            );
          } else {
            await loadCoupons({
              silent: true,
            });
          }
        }

        closeForm();
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

  const handleDelete =
    async (coupon) => {
      if (!coupon?._id) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete coupon ${coupon.code}?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          coupon._id,
        );

        setError("");

        await deleteAdminCoupon(
          coupon._id,
        );

        setCoupons(
          (current) =>
            current.filter(
              (item) =>
                String(
                  item._id,
                ) !==
                String(
                  coupon._id,
                ),
            ),
        );

        if (
          editingCoupon?._id ===
          coupon._id
        ) {
          closeForm();
        }
      } catch (
        requestError
      ) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setDeletingId("");
      }
    };

  const getStatus =
    (coupon) => {
      if (
        coupon?.isActive ===
        false
      ) {
        return {
          label: "Inactive",
          className:
            styles.inactive,
        };
      }

      const now =
        new Date();

      if (
        coupon?.startsAt &&
        now <
          new Date(
            coupon.startsAt,
          )
      ) {
        return {
          label: "Scheduled",
          className:
            styles.scheduled,
        };
      }

      if (
        coupon?.expiresAt &&
        now >
          new Date(
            coupon.expiresAt,
          )
      ) {
        return {
          label: "Expired",
          className:
            styles.expired,
        };
      }

      if (
        coupon?.usageLimit !==
          null &&
        coupon?.usageLimit !==
          undefined &&
        Number(
          coupon?.usedCount ||
            0,
        ) >=
          Number(
            coupon.usageLimit,
          )
      ) {
        return {
          label: "Limit reached",
          className:
            styles.expired,
        };
      }

      return {
        label: "Active",
        className:
          styles.active,
      };
    };

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
            Coupons
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            Create and manage
            discount coupons for
            your ankshra jewellary.
          </p>
        </div>

        <div
          className={
            styles.headingActions
          }
        >
          <button
            type="button"
            className={
              styles.refreshButton
            }
            onClick={() =>
              loadCoupons({
                silent: true,
              })
            }
            disabled={
              loading ||
              refreshing
            }
          >
            <FiRefreshCw
              size={15}
              className={
                refreshing
                  ? styles.spin
                  : ""
              }
            />

            <span>
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

          <Link
            to="/admin/offers"
            className={
              styles.secondaryButton
            }
          >
            View Offers
          </Link>

          <Link
            to="/admin/offers/new"
            className={
              styles.offerButton
            }
          >
            <FiPlus size={16} />

            <span>
              Create Offer
            </span>
          </Link>

          <button
            type="button"
            className={
              styles.addButton
            }
            onClick={
              openCreateForm
            }
          >
            <FiPlus size={16} />

            <span>
              Add Coupon
            </span>
          </button>
        </div>
      </div>

      <div
        className={
          styles.switcher
        }
      >
        <Link
          to="/admin/coupons"
          className={
            `${styles.switcherLink} ${styles.switcherActive}`
          }
        >
          Coupons
        </Link>

        <Link
          to="/admin/offers"
          className={
            styles.switcherLink
          }
        >
          Offers
        </Link>
      </div>

      {error && (
        <div
          className={
            styles.error
          }
        >
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Dismiss error"
          >
            <FiX size={15} />
          </button>
        </div>
      )}

      {formOpen && (
        <CouponForm
          form={form}
          editing={
            Boolean(
              editingCoupon,
            )
          }
          saving={saving}
          onChange={
            handleChange
          }
          onSubmit={
            handleSubmit
          }
          onCancel={
            closeForm
          }
        />
      )}

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
              All Coupons
            </h2>

            <span>
              {coupons.length}{" "}
              {coupons.length ===
              1
                ? "coupon"
                : "coupons"}
            </span>
          </div>

          <Link
            to="/admin/offers"
            className={
              styles.cardLink
            }
          >
            Manage Offers
          </Link>
        </div>

        {loading ? (
          <div
            className={
              styles.state
            }
          >
            Loading coupons...
          </div>
        ) : coupons.length ===
          0 ? (
          <div
            className={
              styles.empty
            }
          >
            <div
              className={
                styles.emptyIcon
              }
            >
              %
            </div>

            <h3>
              No coupons yet
            </h3>

            <p>
              Create a coupon code
              to give customers a
              special discount.
            </p>

            <div
              className={
                styles.emptyActions
              }
            >
              <button
                type="button"
                className={
                  styles.addButton
                }
                onClick={
                  openCreateForm
                }
              >
                <FiPlus size={16} />
                Add Coupon
              </button>

              <Link
                to="/admin/offers/new"
                className={
                  styles.secondaryButton
                }
              >
                Create Offer
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={
              styles.tableWrapper
            }
          >
            <table
              className={
                styles.table
              }
            >
              <thead>
                <tr>
                  <th>
                    Coupon
                  </th>

                  <th>
                    Discount
                  </th>

                  <th>
                    Minimum Order
                  </th>

                  <th>
                    Usage
                  </th>

                  <th>
                    Validity
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {coupons.map(
                  (coupon) => {
                    const status =
                      getStatus(
                        coupon,
                      );

                    const couponId =
                      coupon?._id ||
                      coupon?.id;

                    return (
                      <tr
                        key={
                          couponId
                        }
                      >
                        <td>
                          <div
                            className={
                              styles.couponInfo
                            }
                          >
                            <Link
                              to={`/admin/coupons/${couponId}`}
                              className={
                                styles.couponLink
                              }
                            >
                              {
                                coupon.code
                              }
                            </Link>

                            {coupon.description && (
                              <span>
                                {
                                  coupon.description
                                }
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <strong>
                            {formatDiscount(
                              coupon,
                            )}
                          </strong>

                          {coupon.discountType ===
                            "percentage" &&
                            coupon.maximumDiscountAmount !==
                              null &&
                            coupon.maximumDiscountAmount !==
                              undefined && (
                              <small
                                className={
                                  styles.subValue
                                }
                              >
                                Max ₹
                                {Number(
                                  coupon.maximumDiscountAmount,
                                ).toLocaleString(
                                  "en-IN",
                                )}
                              </small>
                            )}
                        </td>

                        <td>
                          ₹
                          {Number(
                            coupon.minimumOrderAmount ||
                              0,
                          ).toLocaleString(
                            "en-IN",
                          )}
                        </td>

                        <td>
                          {coupon.usedCount ||
                            0}

                          {" / "}

                          {coupon.usageLimit ??
                            "Unlimited"}
                        </td>

                        <td>
                          <div
                            className={
                              styles.validity
                            }
                          >
                            <span>
                              {formatDate(
                                coupon.startsAt,
                              )}
                            </span>

                            <span>
                              to
                            </span>

                            <span>
                              {formatDate(
                                coupon.expiresAt,
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              `${styles.status} ${status.className}`
                            }
                          >
                            {
                              status.label
                            }
                          </span>
                        </td>

                        <td>
                          <div
                            className={
                              styles.actions
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.actionButton
                              }
                              onClick={() =>
                                openEditForm(
                                  coupon,
                                )
                              }
                              title="Edit coupon"
                            >
                              <FiEdit2
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              className={
                                `${styles.actionButton} ${styles.deleteButton}`
                              }
                              onClick={() =>
                                handleDelete(
                                  coupon,
                                )
                              }
                              disabled={
                                deletingId ===
                                couponId
                              }
                              title="Delete coupon"
                            >
                              <FiTrash2
                                size={15}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Coupons;