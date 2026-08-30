import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";

import {
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "../../../services/adminCategoryService";

import styles from "./Categories.module.css";

function getCategoriesFromResponse(
  response,
) {
  const categories =
    response?.data?.categories ||
    response?.categories ||
    response?.data ||
    [];

  return Array.isArray(categories)
    ? categories
    : [];
}

function getCategoryId(
  category,
) {
  return (
    category?._id ||
    category?.id ||
    ""
  );
}

function getCategoryName(
  category,
) {
  return (
    category?.name ||
    "Unnamed category"
  );
}

function getCategoryProductCount(
  category,
) {
  return (
    category?.productCount ??
    category?.productsCount ??
    category?.products?.length ??
    0
  );
}

function Categories() {
  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

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
    actionId,
    setActionId,
  ] = useState("");

  const loadCategories =
    useCallback(
      async (
        showRefresh = false,
      ) => {
        try {
          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await getAdminCategories();

          const list =
            getCategoriesFromResponse(
              response,
            );

          setCategories(list);
        } catch (
          requestError
        ) {
          setError(
            requestError?.message ||
              "Unable to load categories.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      return categories.filter(
        (category) => {
          const name =
            String(
              category?.name ||
                "",
            ).toLowerCase();

          const slug =
            String(
              category?.slug ||
                "",
            ).toLowerCase();

          const matchesSearch =
            !value ||
            name.includes(value) ||
            slug.includes(value);

          const isActive =
            category?.isActive !==
            false;

          const matchesStatus =
            statusFilter ===
              "all" ||
            (statusFilter ===
              "active" &&
              isActive) ||
            (statusFilter ===
              "inactive" &&
              !isActive);

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      categories,
      search,
      statusFilter,
    ]);

  const activeCount =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            category?.isActive !==
            false,
        ).length,
      [categories],
    );

  const inactiveCount =
    categories.length -
    activeCount;

  const handleToggleStatus =
    async (
      category,
    ) => {
      const id =
        getCategoryId(
          category,
        );

      if (
        !id ||
        actionId
      ) {
        return;
      }

      const currentlyActive =
        category?.isActive !==
        false;

      const nextStatus =
        !currentlyActive;

      const actionText =
        nextStatus
          ? "activate"
          : "deactivate";

      const confirmed =
        window.confirm(
          `Are you sure you want to ${actionText} "${getCategoryName(
            category,
          )}"?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(id);
        setError("");

        const response =
          await updateAdminCategory(
            id,
            {
              isActive:
                nextStatus,
            },
          );

        const updatedCategory =
          response?.data
            ?.category ||
          response?.category;

        setCategories(
          (current) =>
            current.map(
              (item) =>
                getCategoryId(
                  item,
                ) === id
                  ? {
                      ...item,
                      ...(updatedCategory ||
                        {}),
                      isActive:
                        updatedCategory
                          ?.isActive ??
                        nextStatus,
                    }
                  : item,
            ),
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
            `Unable to ${actionText} category.`,
        );
      } finally {
        setActionId("");
      }
    };

  const handleDelete =
    async (
      category,
    ) => {
      const id =
        getCategoryId(
          category,
        );

      if (
        !id ||
        actionId
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          `Deactivate "${getCategoryName(
            category,
          )}"?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionId(id);
        setError("");

        await deleteAdminCategory(
          id,
        );

        setCategories(
          (current) =>
            current.map(
              (item) =>
                getCategoryId(
                  item,
                ) === id
                  ? {
                      ...item,
                      isActive:
                        false,
                    }
                  : item,
            ),
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
            "Unable to deactivate category.",
        );
      } finally {
        setActionId("");
      }
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
            Store Management
          </span>

          <h1
            className={
              styles.title
            }
          >
            Categories
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            Manage product categories,
            visibility, and display order.
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
              styles.refresh
            }
            onClick={() =>
              loadCategories(
                true,
              )
            }
            disabled={
              loading ||
              refreshing
            }
          >
            <FiRefreshCw
              size={14}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <Link
            to="/admin/categories/new"
            className={
              styles.addButton
            }
          >
            <FiPlus
              size={14}
            />

            Add Category
          </Link>
        </div>
      </div>

      <div
        className={
          styles.stats
        }
      >
        <div
          className={
            styles.stat
          }
        >
          <span>
            Total
          </span>

          <strong>
            {categories.length}
          </strong>
        </div>

        <div
          className={
            styles.stat
          }
        >
          <span>
            Active
          </span>

          <strong>
            {activeCount}
          </strong>
        </div>

        <div
          className={
            styles.stat
          }
        >
          <span>
            Inactive
          </span>

          <strong>
            {inactiveCount}
          </strong>
        </div>
      </div>

      <div
        className={
          styles.toolbar
        }
      >
        <div
          className={
            styles.search
          }
        >
          <FiSearch
            size={15}
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search category or slug..."
            aria-label="Search categories"
          />
        </div>

        <select
          className={
            styles.filter
          }
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value,
            )
          }
          aria-label="Filter categories by status"
        >
          <option value="all">
            All categories
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>
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

      <div
        className={
          styles.card
        }
      >
        {loading ? (
          <div
            className={
              styles.state
            }
          >
            Loading categories...
          </div>
        ) : filteredCategories.length ===
          0 ? (
          <div
            className={
              styles.empty
            }
          >
            <strong>
              No categories found
            </strong>

            <p>
              {search.trim() ||
              statusFilter !==
                "all"
                ? "Try changing your search or filter."
                : "Create your first product category."}
            </p>

            {!search.trim() &&
              statusFilter ===
                "all" && (
                <Link
                  to="/admin/categories/new"
                  className={
                    styles.emptyButton
                  }
                >
                  <FiPlus
                    size={14}
                  />

                  Add Category
                </Link>
              )}
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
                    Category
                  </th>

                  <th>
                    Slug
                  </th>

                  <th>
                    Products
                  </th>

                  <th>
                    Sort Order
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
                {filteredCategories.map(
                  (
                    category,
                  ) => {
                    const id =
                      getCategoryId(
                        category,
                      );

                    const isActive =
                      category?.isActive !==
                      false;

                    const busy =
                      actionId ===
                      id;

                    return (
                      <tr
                        key={id}
                        className={
                          !isActive
                            ? styles.inactiveRow
                            : ""
                        }
                      >
                        <td>
                          <div
                            className={
                              styles.category
                            }
                          >
                            {category?.image ? (
                              <img
                                src={
                                  category.image
                                }
                                alt=""
                                className={
                                  styles.image
                                }
                                onError={(
                                  event,
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div
                                className={
                                  styles.imagePlaceholder
                                }
                              >
                                {getCategoryName(
                                  category,
                                )
                                  .charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </div>
                            )}

                            <div>
                              <strong>
                                {getCategoryName(
                                  category,
                                )}
                              </strong>

                              {category?.description && (
                                <span>
                                  {category.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              styles.slug
                            }
                          >
                            {category?.slug ||
                              "-"}
                          </span>
                        </td>

                        <td>
                          {
                            getCategoryProductCount(
                              category,
                            )
                          }
                        </td>

                        <td>
                          {category?.sortOrder ??
                            0}
                        </td>

                        <td>
                          <button
                            type="button"
                            className={
                              isActive
                                ? styles.statusActive
                                : styles.statusInactive
                            }
                            onClick={() =>
                              handleToggleStatus(
                                category,
                              )
                            }
                            disabled={
                              busy
                            }
                            title={
                              isActive
                                ? "Deactivate category"
                                : "Activate category"
                            }
                          >
                            {busy
                              ? "Saving..."
                              : isActive
                                ? "Active"
                                : "Inactive"}
                          </button>
                        </td>

                        <td>
                          <div
                            className={
                              styles.actions
                            }
                          >
                            <Link
                              to={`/admin/categories/${id}/edit`}
                              className={
                                styles.edit
                              }
                              title="Edit category"
                              aria-label={`Edit ${getCategoryName(
                                category,
                              )}`}
                            >
                              <FiEdit2
                                size={15}
                              />
                            </Link>

                            {isActive && (
                              <button
                                type="button"
                                className={
                                  styles.delete
                                }
                                onClick={() =>
                                  handleDelete(
                                    category,
                                  )
                                }
                                disabled={
                                  busy
                                }
                                title="Deactivate category"
                                aria-label={`Deactivate ${getCategoryName(
                                  category,
                                )}`}
                              >
                                <FiTrash2
                                  size={15}
                                />
                              </button>
                            )}
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

      {!loading &&
        filteredCategories.length >
          0 && (
          <div
            className={
              styles.resultCount
            }
          >
            Showing{" "}
            <strong>
              {
                filteredCategories.length
              }
            </strong>{" "}
            of{" "}
            <strong>
              {categories.length}
            </strong>{" "}
            categories
          </div>
        )}
    </section>
  );
}

export default Categories;