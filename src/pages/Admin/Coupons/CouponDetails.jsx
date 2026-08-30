import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";

import {
  getCouponUsers,
} from "../../../services/adminPromotionService";

import styles from "./CouponDetails.module.css";

function getResponseData(response) {
  return (
    response?.data ||
    response ||
    {}
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
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

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function formatMoney(value) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount,
    )
  ) {
    return "₹0.00";
  }

  return amount.toLocaleString(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    },
  );
}

function formatDiscount(
  type,
  value,
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount,
    )
  ) {
    return "-";
  }

  return type ===
    "percentage"
    ? `${amount}%`
    : formatMoney(amount);
}

function getStatus(coupon) {
  if (
    coupon?.isActive ===
    false
  ) {
    return {
      label: "Inactive",
      className:
        styles.statusInactive,
    };
  }

  const now =
    new Date();

  if (
    coupon?.startsAt &&
    new Date(
      coupon.startsAt,
    ) > now
  ) {
    return {
      label: "Scheduled",
      className:
        styles.statusScheduled,
    };
  }

  if (
    coupon?.expiresAt &&
    new Date(
      coupon.expiresAt,
    ) < now
  ) {
    return {
      label: "Expired",
      className:
        styles.statusExpired,
    };
  }

  if (
    coupon?.usageLimit !==
      null &&
    coupon?.usageLimit !==
      undefined &&
    Number(
      coupon.usedCount ||
        0,
    ) >=
      Number(
        coupon.usageLimit,
      )
  ) {
    return {
      label: "Limit reached",
      className:
        styles.statusExpired,
    };
  }

  return {
    label: "Active",
    className:
      styles.statusActive,
  };
}

function CouponDetails() {
  const {
    id,
  } = useParams();

  const [
    coupon,
    setCoupon,
  ] = useState(null);

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

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

  const loadCouponUsage =
    useCallback(
      async ({
        page = 1,
        silent = false,
      } = {}) => {
        if (!id) {
          setError(
            "Coupon ID is missing.",
          );
          setLoading(false);
          return;
        }

        try {
          if (silent) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await getCouponUsers(
              id,
              {
                page,
                limit: 20,
              },
            );

          const data =
            getResponseData(
              response,
            );

          setCoupon(
            data?.promotion ||
              null,
          );

          setUsers(
            Array.isArray(
              data?.users,
            )
              ? data.users
              : [],
          );

          setPagination(
            data?.pagination ||
              {
                page,
                limit: 20,
                total: 0,
                pages: 1,
              },
          );
        } catch (
          requestError
        ) {
          setError(
            requestError?.message ||
              "Unable to load coupon usage.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [id],
    );

  useEffect(() => {
    loadCouponUsage();
  }, [
    loadCouponUsage,
  ]);

  const status =
    getStatus(coupon);

  const currentPage =
    Number(
      pagination?.page || 1,
    );

  const totalPages =
    Math.max(
      Number(
        pagination?.pages || 1,
      ),
      1,
    );

  const totalUsers =
    Number(
      pagination?.total || 0,
    );

  const usedCount =
    Number(
      coupon?.usedCount || 0,
    );

  const usageLimit =
    coupon?.usageLimit;

  const usageRemaining =
    usageLimit ===
      null ||
    usageLimit ===
      undefined
      ? null
      : Math.max(
          Number(
            usageLimit,
          ) -
            usedCount,
          0,
        );

  const goToPage =
    (page) => {
      if (
        page < 1 ||
        page > totalPages ||
        page === currentPage
      ) {
        return;
      }

      loadCouponUsage({
        page,
      });
    };

  return (
    <section
      className={
        styles.page
      }
    >
      <div
        className={
          styles.topBar
        }
      >
        <Link
          to="/admin/coupons"
          className={
            styles.back
          }
        >
          <FiArrowLeft
            size={15}
          />

          <span>
            Back to Coupons
          </span>
        </Link>

        <button
          type="button"
          className={
            styles.refresh
          }
          onClick={() =>
            loadCouponUsage({
              page: currentPage,
              silent: true,
            })
          }
          disabled={
            loading ||
            refreshing
          }
        >
          <FiRefreshCw
            size={14}
            className={
              refreshing
                ? styles.spin
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
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

      {loading &&
      !coupon ? (
        <div
          className={
            styles.state
          }
        >
          Loading coupon details...
        </div>
      ) : coupon ? (
        <>
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
                Promotion
              </span>

              <h1
                className={
                  styles.title
                }
              >
                {coupon.code ||
                  "Coupon"}
              </h1>

              <p
                className={
                  styles.subtitle
                }
              >
                {coupon.description ||
                  "Coupon usage and customer activity."}
              </p>
            </div>

            <div
              className={
                styles.headingActions
              }
            >
              <span
                className={`${styles.status} ${status.className}`}
              >
                {status.label}
              </span>

              <Link
                to={`/admin/coupons/${id}/edit`}
                className={
                  styles.editButton
                }
              >
                Edit Coupon
              </Link>
            </div>
          </div>

          <div
            className={
              styles.summary
            }
          >
            <div
              className={
                styles.summaryCard
              }
            >
              <span>
                Discount
              </span>

              <strong>
                {formatDiscount(
                  coupon.discountType,
                  coupon.discountValue,
                )}
              </strong>
            </div>

            <div
              className={
                styles.summaryCard
              }
            >
              <span>
                Customers Used
              </span>

              <strong>
                {usedCount}
              </strong>
            </div>

            <div
              className={
                styles.summaryCard
              }
            >
              <span>
                Usage Limit
              </span>

              <strong>
                {usageLimit ===
                  null ||
                usageLimit ===
                  undefined
                  ? "Unlimited"
                  : usageLimit}
              </strong>
            </div>

            <div
              className={
                styles.summaryCard
              }
            >
              <span>
                Remaining
              </span>

              <strong>
                {usageRemaining ===
                null
                  ? "Unlimited"
                  : usageRemaining}
              </strong>
            </div>
          </div>

          <div
            className={
              styles.detailsCard
            }
          >
            <div
              className={
                styles.detailsHeader
              }
            >
              <div>
                <h2>
                  Coupon Details
                </h2>

                <p>
                  Current configuration
                  from the backend.
                </p>
              </div>
            </div>

            <div
              className={
                styles.detailsGrid
              }
            >
              <div>
                <span>
                  Coupon Code
                </span>

                <strong>
                  {coupon.code ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Discount Type
                </span>

                <strong>
                  {coupon.discountType ===
                  "percentage"
                    ? "Percentage"
                    : "Fixed"}
                </strong>
              </div>

              <div>
                <span>
                  Minimum Order
                </span>

                <strong>
                  {formatMoney(
                    coupon.minimumOrderAmount,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Maximum Discount
                </span>

                <strong>
                  {coupon.maximumDiscountAmount
                    ? formatMoney(
                        coupon.maximumDiscountAmount,
                      )
                    : "No limit"}
                </strong>
              </div>

              <div>
                <span>
                  Starts
                </span>

                <strong>
                  {coupon.startsAt
                    ? formatDate(
                        coupon.startsAt,
                      )
                    : "Immediately"}
                </strong>
              </div>

              <div>
                <span>
                  Expires
                </span>

                <strong>
                  {coupon.expiresAt
                    ? formatDate(
                        coupon.expiresAt,
                      )
                    : "No expiry"}
                </strong>
              </div>
            </div>
          </div>

          <div
            className={
              styles.usersCard
            }
          >
            <div
              className={
                styles.usersHeader
              }
            >
              <div>
                <h2>
                  Customers Who Used This Coupon
                </h2>

                <p>
                  Showing actual coupon
                  usage recorded by the
                  backend.
                </p>
              </div>

              <strong>
                {totalUsers}{" "}
                {totalUsers ===
                1
                  ? "usage"
                  : "usages"}
              </strong>
            </div>

            {users.length ===
            0 ? (
              <div
                className={
                  styles.empty
                }
              >
                <strong>
                  No customers have
                  used this coupon yet.
                </strong>

                <p>
                  Usage will appear here
                  after a customer
                  successfully applies
                  the coupon to an order.
                </p>
              </div>
            ) : (
              <>
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
                          Customer
                        </th>

                        <th>
                          Order
                        </th>

                        <th>
                          Order Amount
                        </th>

                        <th>
                          Discount
                        </th>

                        <th>
                          Payment
                        </th>

                        <th>
                          Order Status
                        </th>

                        <th>
                          Used At
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map(
                        (
                          usage,
                        ) => {
                          const user =
                            usage?.user;

                          const order =
                            usage?.order;

                          return (
                            <tr
                              key={
                                usage?.id ||
                                `${user?.id}-${order?.id}-${usage?.usedAt}`
                              }
                            >
                              <td>
                                {user ? (
                                  <div
                                    className={
                                      styles.user
                                    }
                                  >
                                    <div
                                      className={
                                        styles.avatar
                                      }
                                    >
                                      {(
                                        user.name ||
                                        "U"
                                      )
                                        .charAt(
                                          0,
                                        )
                                        .toUpperCase()}
                                    </div>

                                    <div>
                                      <strong>
                                        {user.name ||
                                          "Unknown user"}
                                      </strong>

                                      <span>
                                        {user.email ||
                                          "-"}
                                      </span>

                                      {user.phone && (
                                        <small>
                                          {
                                            user.phone
                                          }
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span
                                    className={
                                      styles.muted
                                    }
                                  >
                                    User unavailable
                                  </span>
                                )}
                              </td>

                              <td>
                                {order ? (
                                  <div
                                    className={
                                      styles.order
                                    }
                                  >
                                    <strong>
                                      {order.orderNumber ||
                                        "-"}
                                    </strong>

                                    <span>
                                      {formatDate(
                                        order.createdAt,
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>

                              <td>
                                {formatMoney(
                                  usage?.orderAmount,
                                )}
                              </td>

                              <td>
                                <strong
                                  className={
                                    styles.discount
                                  }
                                >
                                  -
                                  {formatMoney(
                                    usage?.discountAmount,
                                  )}
                                </strong>
                              </td>

                              <td>
                                <span
                                  className={
                                    styles.smallStatus
                                  }
                                >
                                  {order?.paymentStatus ||
                                    "-"}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={
                                    styles.smallStatus
                                  }
                                >
                                  {order?.orderStatus ||
                                    "-"}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={
                                    styles.date
                                  }
                                >
                                  {formatDateTime(
                                    usage?.usedAt,
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        },
                      )}
                    </tbody>
                  </table>
                </div>

                <div
                  className={
                    styles.pagination
                  }
                >
                  <span>
                    Page{" "}
                    <strong>
                      {currentPage}
                    </strong>{" "}
                    of{" "}
                    <strong>
                      {totalPages}
                    </strong>
                  </span>

                  <div
                    className={
                      styles.paginationActions
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        goToPage(
                          currentPage -
                            1,
                        )
                      }
                      disabled={
                        currentPage <=
                          1 ||
                        loading
                      }
                    >
                      <FiChevronLeft
                        size={14}
                      />

                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        goToPage(
                          currentPage +
                            1,
                        )
                      }
                      disabled={
                        currentPage >=
                          totalPages ||
                        loading
                      }
                    >
                      Next

                      <FiChevronRight
                        size={14}
                      />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <div
          className={
            styles.empty
          }
        >
          <strong>
            Coupon not found
          </strong>

          <p>
            The requested coupon could
            not be loaded.
          </p>

          <Link
            to="/admin/coupons"
            className={
              styles.backButton
            }
          >
            Back to Coupons
          </Link>
        </div>
      )}
    </section>
  );
}

export default CouponDetails;