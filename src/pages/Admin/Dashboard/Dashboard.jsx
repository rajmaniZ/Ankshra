import {
  useEffect,
  useState,
} from "react";

import {
  FiBox,
  FiDollarSign,
  FiPercent,
  FiRefreshCw,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiUsers,
} from "react-icons/fi";

import {
  getAdminDashboard,
} from "../../../services/adminService";

import styles from "./Dashboard.module.css";

function getDashboardData(response) {
  return (
    response?.data?.overview ||
    response?.overview ||
    response?.data?.dashboard ||
    response?.dashboard ||
    response?.data ||
    response ||
    {}
  );
}

function getValue(object, keys) {
  if (!object) {
    return undefined;
  }

  for (const key of keys) {
    const value = object?.[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return undefined;
}

function getNumber(object, keys) {
  const value = getValue(
    object,
    keys,
  );

  if (
    value === undefined ||
    value === null
  ) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
}

function getNestedNumber(
  object,
  paths,
) {
  for (const path of paths) {
    let current = object;

    for (const key of path) {
      current = current?.[key];
    }

    if (
      current !== undefined &&
      current !== null &&
      current !== ""
    ) {
      const number = Number(current);

      if (Number.isFinite(number)) {
        return number;
      }
    }
  }

  return undefined;
}

function formatNumber(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "—";
  }

  return Number(value).toLocaleString(
    "en-IN",
  );
}

function formatCurrency(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatRating(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "—";
  }

  return Number(value).toFixed(1);
}

function getWeeklyOrders(dashboard) {
  const direct = getValue(
    dashboard,
    [
      "weeklyOrders",
      "ordersThisWeek",
      "weekOrders",
      "weeklyOrderCount",
    ],
  );

  if (
    direct !== undefined
  ) {
    return direct;
  }

  return getNestedNumber(
    dashboard,
    [
      [
        "weekly",
        "orders",
      ],
      [
        "thisWeek",
        "orders",
      ],
      [
        "statistics",
        "weeklyOrders",
      ],
      [
        "stats",
        "weeklyOrders",
      ],
    ],
  );
}

function getWeeklyRevenue(dashboard) {
  const direct = getValue(
    dashboard,
    [
      "weeklyRevenue",
      "revenueThisWeek",
      "thisWeekRevenue",
      "weekRevenue",
    ],
  );

  if (
    direct !== undefined
  ) {
    return direct;
  }

  return getNestedNumber(
    dashboard,
    [
      [
        "weekly",
        "revenue",
      ],
      [
        "thisWeek",
        "revenue",
      ],
      [
        "statistics",
        "weeklyRevenue",
      ],
      [
        "stats",
        "weeklyRevenue",
      ],
    ],
  );
}

function getPromotionValue(
  dashboard,
  keys,
) {
  const direct = getNumber(
    dashboard,
    keys,
  );

  if (
    direct !== undefined
  ) {
    return direct;
  }

  return getNestedNumber(
    dashboard,
    [
      [
        "promotions",
        keys[0],
      ],
      [
        "promotion",
        keys[0],
      ],
      [
        "discounts",
        keys[0],
      ],
    ],
  );
}

function Dashboard() {
  const [
    dashboard,
    setDashboard,
  ] = useState(null);

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

  const loadDashboard =
    async (
      isRefresh = false,
    ) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getAdminDashboard();

        setDashboard(
          getDashboardData(
            response,
          ),
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getAdminDashboard();

        if (!mounted) {
          return;
        }

        setDashboard(
          getDashboardData(
            response,
          ),
        );
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        setError(
          requestError?.message ||
            "Unable to load dashboard.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const totalUsers =
    getNumber(
      dashboard,
      [
        "totalUsers",
        "userCount",
        "users",
      ],
    );

  const totalProducts =
    getNumber(
      dashboard,
      [
        "totalProducts",
        "productCount",
        "products",
      ],
    );

  const totalOrders =
    getNumber(
      dashboard,
      [
        "totalOrders",
        "orderCount",
        "orders",
      ],
    );

  const totalCategories =
    getNumber(
      dashboard,
      [
        "totalCategories",
        "categoryCount",
        "categories",
      ],
    );

  const totalReviews =
    getNumber(
      dashboard,
      [
        "totalReviews",
        "reviewCount",
        "reviews",
      ],
    );

  const averageReview =
    getNumber(
      dashboard,
      [
        "averageReview",
        "averageRating",
        "avgRating",
        "reviewAverage",
        "averageReviewRating",
      ],
    );

  const productReviews =
    getNumber(
      dashboard,
      [
        "totalProductReviews",
        "productReviewCount",
        "productReviews",
      ],
    );

  const appReviews =
    getNumber(
      dashboard,
      [
        "totalAppReviews",
        "appReviewCount",
        "appReviews",
      ],
    );

  const totalRevenue =
    getNumber(
      dashboard,
      [
        "totalRevenue",
        "revenue",
        "totalEarnings",
        "earnings",
      ],
    );

  const weeklyOrders =
    getWeeklyOrders(
      dashboard,
    );

  const weeklyRevenue =
    getWeeklyRevenue(
      dashboard,
    );

  const couponUsage =
    getPromotionValue(
      dashboard,
      [
        "couponUsage",
        "couponUses",
        "usedCoupons",
        "totalCouponUsage",
      ],
    );

  const offerUsage =
    getPromotionValue(
      dashboard,
      [
        "offerUsage",
        "offerUses",
        "usedOffers",
        "totalOfferUsage",
      ],
    );

  const couponDiscount =
    getPromotionValue(
      dashboard,
      [
        "couponDiscount",
        "couponDiscountAmount",
        "totalCouponDiscount",
      ],
    );

  const offerDiscount =
    getPromotionValue(
      dashboard,
      [
        "offerDiscount",
        "offerDiscountAmount",
        "totalOfferDiscount",
      ],
    );

  const cards = [
    {
      label: "Total Users",
      value: formatNumber(
        totalUsers,
      ),
      icon: FiUsers,
    },
    {
      label: "Total Products",
      value: formatNumber(
        totalProducts,
      ),
      icon: FiBox,
    },
    {
      label: "Total Orders",
      value: formatNumber(
        totalOrders,
      ),
      icon: FiShoppingBag,
    },
    {
      label: "Total Categories",
      value: formatNumber(
        totalCategories,
      ),
      icon: FiTag,
    },
    {
      label: "Total Reviews",
      value: formatNumber(
        totalReviews,
      ),
      icon: FiStar,
    },
    {
      label: "Average Rating",
      value:
        averageReview ===
        undefined
          ? "—"
          : formatRating(
              averageReview,
            ),
      icon: FiStar,
    },
  ];

  if (loading) {
    return (
      <section
        className={
          styles.page
        }
      >
        <div
          className={
            styles.state
          }
        >
          Loading dashboard...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={
          styles.page
        }
      >
        <div
          className={
            styles.error
          }
        >
          <strong>
            Unable to load dashboard
          </strong>

          <p>{error}</p>

          <button
            type="button"
            className={
              styles.retryButton
            }
            onClick={() =>
              loadDashboard()
            }
          >
            Try Again
          </button>
        </div>
      </section>
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
          styles.header
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Overview
          </span>

          <h1
            className={
              styles.title
            }
          >
            Dashboard
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            Monitor your jewellery
            store, orders, customers,
            reviews and promotions.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.refreshButton
          }
          onClick={() =>
            loadDashboard(true)
          }
          disabled={
            refreshing
          }
        >
          <FiRefreshCw
            size={15}
            className={
              refreshing
                ? styles.spinning
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <div
        className={
          styles.cards
        }
      >
        {cards.map(
          ({
            label,
            value,
            icon: Icon,
          }) => (
            <div
              key={label}
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.cardIcon
                }
              >
                <Icon
                  size={19}
                />
              </div>

              <div
                className={
                  styles.cardContent
                }
              >
                <span>
                  {label}
                </span>

                <strong>
                  {value}
                </strong>
              </div>
            </div>
          ),
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
          <div>
            <span
              className={
                styles.sectionEyebrow
              }
            >
              Sales
            </span>

            <h2>
              Orders & Earnings
            </h2>

            <p>
              Track overall and
              weekly store performance.
            </p>
          </div>
        </div>

        <div
          className={
            styles.salesGrid
          }
        >
          <div
            className={
              styles.metric
            }
          >
            <div
              className={
                styles.metricTop
              }
            >
              <span>
                Total Earnings
              </span>

              <FiDollarSign
                size={17}
              />
            </div>

            <strong>
              {formatCurrency(
                totalRevenue,
              )}
            </strong>

            <small>
              Lifetime store revenue
            </small>
          </div>

          <div
            className={
              styles.metric
            }
          >
            <div
              className={
                styles.metricTop
              }
            >
              <span>
                Orders This Week
              </span>

              <FiShoppingBag
                size={17}
              />
            </div>

            <strong>
              {formatNumber(
                weeklyOrders,
              )}
            </strong>

            <small>
              Orders recorded this week
            </small>
          </div>

          <div
            className={
              styles.metric
            }
          >
            <div
              className={
                styles.metricTop
              }
            >
              <span>
                Weekly Earnings
              </span>

              <FiDollarSign
                size={17}
              />
            </div>

            <strong>
              {formatCurrency(
                weeklyRevenue,
              )}
            </strong>

            <small>
              Revenue generated this week
            </small>
          </div>
        </div>
      </div>

      <div
        className={
          styles.twoColumn
        }
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
            <div>
              <span
                className={
                  styles.sectionEyebrow
                }
              >
                Reviews
              </span>

              <h2>
                Review Overview
              </h2>
            </div>
          </div>

          <div
            className={
              styles.reviewGrid
            }
          >
            <div
              className={
                styles.reviewMetric
              }
            >
              <FiStar
                size={17}
              />

              <span>
                Product Reviews
              </span>

              <strong>
                {formatNumber(
                  productReviews ??
                    totalReviews,
                )}
              </strong>
            </div>

            <div
              className={
                styles.reviewMetric
              }
            >
              <FiUsers
                size={17}
              />

              <span>
                App Reviews
              </span>

              <strong>
                {formatNumber(
                  appReviews,
                )}
              </strong>
            </div>

            <div
              className={
                styles.reviewMetric
              }
            >
              <FiStar
                size={17}
              />

              <span>
                Average Rating
              </span>

              <strong>
                {averageReview ===
                undefined
                  ? "—"
                  : `${formatRating(
                      averageReview,
                    )} / 5`}
              </strong>
            </div>
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
            <div>
              <span
                className={
                  styles.sectionEyebrow
                }
              >
                Promotions
              </span>

              <h2>
                Discount Usage
              </h2>

              <p>
                Coupons and offers used
                by customers.
              </p>
            </div>
          </div>

          <div
            className={
              styles.promotionList
            }
          >
            <div
              className={
                styles.promotionRow
              }
            >
              <div
                className={
                  styles.promotionIcon
                }
              >
                <FiPercent
                  size={17}
                />
              </div>

              <div>
                <strong>
                  Coupon Usage
                </strong>

                <span>
                  {formatNumber(
                    couponUsage,
                  )}{" "}
                  uses
                </span>
              </div>

              <strong
                className={
                  styles.promotionAmount
                }
              >
                {formatCurrency(
                  couponDiscount,
                )}
              </strong>
            </div>

            <div
              className={
                styles.promotionRow
              }
            >
              <div
                className={
                  styles.promotionIcon
                }
              >
                <FiPercent
                  size={17}
                />
              </div>

              <div>
                <strong>
                  Offer Usage
                </strong>

                <span>
                  {formatNumber(
                    offerUsage,
                  )}{" "}
                  uses
                </span>
              </div>

              <strong
                className={
                  styles.promotionAmount
                }
              >
                {formatCurrency(
                  offerDiscount,
                )}
              </strong>
            </div>
          </div>
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
          <div>
            <span
              className={
                styles.sectionEyebrow
              }
            >
              Administration
            </span>

            <h2>
              Store Management
            </h2>

            <p>
              Products, categories,
              orders, customers,
              reviews, coupons and
              offers are managed from
              the admin navigation.
            </p>
          </div>
        </div>

        <div
          className={
            styles.managementGrid
          }
        >
          <div>
            <FiBox
              size={17}
            />

            <strong>
              Products
            </strong>

            <span>
              {formatNumber(
                totalProducts,
              )}{" "}
              products
            </span>
          </div>

          <div>
            <FiTag
              size={17}
            />

            <strong>
              Categories
            </strong>

            <span>
              {formatNumber(
                totalCategories,
              )}{" "}
              categories
            </span>
          </div>

          <div>
            <FiUsers
              size={17}
            />

            <strong>
              Customers
            </strong>

            <span>
              {formatNumber(
                totalUsers,
              )}{" "}
              users
            </span>
          </div>

          <div>
            <FiShoppingBag
              size={17}
            />

            <strong>
              Orders
            </strong>

            <span>
              {formatNumber(
                totalOrders,
              )}{" "}
              orders
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;