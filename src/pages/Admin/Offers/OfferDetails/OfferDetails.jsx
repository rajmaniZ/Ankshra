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
  getAdminOfferById,
} from "../../../../services/adminOfferService";

import {
  getOfferUsers,
} from "../../../../services/adminPromotionService";

import styles from "./OfferDetails.module.css";

function getResponseData(response) {
  return response?.data || response || {};
}

function getOfferId(offer) {
  return offer?._id || offer?.id;
}

function getOfferName(offer) {
  return (
    offer?.name ||
    offer?.title ||
    offer?.offerName ||
    "Offer"
  );
}

function getDiscountText(offer) {
  const type =
    offer?.discountType ||
    offer?.type ||
    "";

  const value =
    Number(
      offer?.discountValue ??
        offer?.value ??
        offer?.discount ??
        0,
    );

  if (!Number.isFinite(value)) {
    return "-";
  }

  if (
    type === "percentage" ||
    type === "percent"
  ) {
    return `${value}%`;
  }

  return formatMoney(value);
}

function formatMoney(value) {
  const amount =
    Number(value);

  if (!Number.isFinite(amount)) {
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

function getStatus(offer) {
  if (
    offer?.isActive === false ||
    offer?.active === false
  ) {
    return {
      label: "Inactive",
      className:
        styles.statusInactive,
    };
  }

  const now =
    new Date();

  const start =
    offer?.startDate ||
    offer?.startsAt;

  const end =
    offer?.endDate ||
    offer?.endsAt;

  if (
    start &&
    new Date(start) > now
  ) {
    return {
      label: "Scheduled",
      className:
        styles.statusScheduled,
    };
  }

  if (
    end &&
    new Date(end) < now
  ) {
    return {
      label: "Expired",
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

function OfferDetails() {
  const {
    id,
  } = useParams();

  const [
    offer,
    setOffer,
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

  const loadOffer =
    useCallback(
      async () => {
        if (!id) {
          return;
        }

        const response =
          await getAdminOfferById(
            id,
          );

        const data =
          getResponseData(
            response,
          );

        setOffer(
          data?.offer ||
            data?.promotion ||
            data,
        );
      },
      [id],
    );

  const loadOfferUsers =
    useCallback(
      async ({
        page = 1,
        silent = false,
      } = {}) => {
        if (!id) {
          setError(
            "Offer ID is missing.",
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

          const [
            offerResponse,
            usersResponse,
          ] = await Promise.all([
            loadOffer(),
            getOfferUsers(
              id,
              {
                page,
                limit: 20,
              },
            ),
          ]);

          void offerResponse;

          const usersData =
            getResponseData(
              usersResponse,
            );

          setUsers(
            Array.isArray(
              usersData?.users,
            )
              ? usersData.users
              : [],
          );

          setPagination(
            usersData?.pagination ||
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
              "Unable to load offer details.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [id, loadOffer],
    );

  useEffect(() => {
    loadOfferUsers();
  }, [
    loadOfferUsers,
  ]);

  const status =
    getStatus(offer);

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
      offer?.usedCount ||
        offer?.usageCount ||
        0,
    );

  const usageLimit =
    offer?.usageLimit ??
    offer?.maxUsage ??
    null;

  const remaining =
    usageLimit === null ||
    usageLimit === undefined
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

      loadOfferUsers({
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
          to="/admin/offers"
          className={
            styles.back
          }
        >
          <FiArrowLeft
            size={15}
          />

          Back to Offers
        </Link>

        <button
          type="button"
          className={
            styles.refresh
          }
          onClick={() =>
            loadOfferUsers({
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
      !offer ? (
        <div
          className={
            styles.state
          }
        >
          Loading offer details...
        </div>
      ) : offer ? (
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
                Promotions
              </span>

              <h1
                className={
                  styles.title
                }
              >
                {getOfferName(
                  offer,
                )}
              </h1>

              <p
                className={
                  styles.subtitle
                }
              >
                {offer.description ||
                  "Offer details and customer usage."}
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
                to={`/admin/offers/${getOfferId(
                  offer,
                )}/edit`}
                className={
                  styles.editButton
                }
              >
                Edit Offer
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
                {getDiscountText(
                  offer,
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
                {remaining ===
                null
                  ? "Unlimited"
                  : remaining}
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
                  Offer Details
                </h2>

                <p>
                  Current offer
                  configuration.
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
                  Offer Name
                </span>

                <strong>
                  {getOfferName(
                    offer,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Discount Type
                </span>

                <strong>
                  {offer.discountType ||
                    offer.type ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Discount
                </span>

                <strong>
                  {getDiscountText(
                    offer,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Minimum Order
                </span>

                <strong>
                  {formatMoney(
                    offer.minimumOrderAmount ||
                      offer.minOrderAmount ||
                      0,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Starts
                </span>

                <strong>
                  {formatDate(
                    offer.startDate ||
                      offer.startsAt,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Ends
                </span>

                <strong>
                  {formatDate(
                    offer.endDate ||
                      offer.endsAt,
                  )}
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
                  Customers Who Used This Offer
                </h2>

                <p>
                  Actual offer usage
                  recorded by the backend.
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
                  used this offer yet.
                </strong>

                <p>
                  Customer usage will
                  appear here after an
                  order receives this
                  offer.
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

                          const usageId =
                            usage?.id ||
                            usage?._id ||
                            `${user?.id || user?._id}-${order?.id || order?._id}-${usage?.usedAt}`;

                          return (
                            <tr
                              key={
                                usageId
                              }
                            >
                              <td>
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
                                      user?.name ||
                                      "U"
                                    )
                                      .charAt(
                                        0,
                                      )
                                      .toUpperCase()}
                                  </div>

                                  <div>
                                    <strong>
                                      {user?.name ||
                                        "Unknown user"}
                                    </strong>

                                    <span>
                                      {user?.email ||
                                        "-"}
                                    </span>

                                    {user?.phone && (
                                      <small>
                                        {
                                          user.phone
                                        }
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div
                                  className={
                                    styles.order
                                  }
                                >
                                  <strong>
                                    {order?.orderNumber ||
                                      order?.id ||
                                      order?._id ||
                                      "-"}
                                  </strong>

                                  <span>
                                    {formatDate(
                                      order?.createdAt,
                                    )}
                                  </span>
                                </div>
                              </td>

                              <td>
                                {formatMoney(
                                  usage?.orderAmount ??
                                    order?.totalAmount ??
                                    order?.grandTotal ??
                                    0,
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
                                    usage?.discountAmount ??
                                      usage?.discount ??
                                      0,
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
                                    usage?.usedAt ||
                                      usage?.createdAt,
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
            Offer not found
          </strong>

          <p>
            The requested offer could
            not be loaded.
          </p>

          <Link
            to="/admin/offers"
            className={
              styles.backButton
            }
          >
            Back to Offers
          </Link>
        </div>
      )}
    </section>
  );
}

export default OfferDetails;