import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../../services/adminService";
import styles from "./Users.module.css";
const LIMIT = 20;
function getUsersFromResponse(response) {
  return response?.data?.users || response?.users || [];
}
function getPagination(response) {
  return (
    response?.data?.pagination ||
    response?.pagination || { page: 1, limit: LIMIT, total: 0, pages: 0 }
  );
}
function getErrorMessage(error) {
  return error?.message || "Unable to load users.";
}
function getUserId(user) {
  return user?._id || user?.id || "";
}
function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    pages: 0,
  });
  const loadUsers = useCallback(
    async ({ page = 1, silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError("");
        const params = { page, limit: LIMIT };
        if (search.trim()) {
          params.search = search.trim();
        }
        if (role) {
          params.role = role;
        }
        if (activeStatus) {
          params.isActive = activeStatus;
        }
        const response = await getAdminUsers(params);
        setUsers(getUsersFromResponse(response));
        setPagination(getPagination(response));
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, role, activeStatus],
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers({ page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, role, activeStatus, loadUsers]);
  const handleStatus = async (user) => {
    const id = getUserId(user);
    if (!id || actionId) {
      return;
    }
    try {
      setActionId(id);
      setError("");
      const response = await updateAdminUserStatus(id, !user.isActive);
      const updatedUser = response?.data?.user || response?.user;
      setUsers((current) =>
        current.map((item) =>
          getUserId(item) === id
            ? {
                ...item,
                ...(updatedUser || {}),
                isActive: updatedUser?.isActive ?? !user.isActive,
              }
            : item,
        ),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionId("");
    }
  };
  const handleRole = async (user, nextRole) => {
    const id = getUserId(user);
    if (
      !id ||
      actionId ||
      !["customer", "admin"].includes(nextRole) ||
      nextRole === user.role
    ) {
      return;
    }
    try {
      setActionId(id);
      setError("");
      const response = await updateAdminUserRole(id, nextRole);
      const updatedUser = response?.data?.user || response?.user;
      setUsers((current) =>
        current.map((item) =>
          getUserId(item) === id
            ? {
                ...item,
                ...(updatedUser || {}),
                role: updatedUser?.role || nextRole,
              }
            : item,
        ),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionId("");
    }
  };
  const handleRefresh = async () => {
    await loadUsers({ page: pagination.page || 1, silent: true });
  };
  const handlePrevious = async () => {
    if (loading || pagination.page <= 1) {
      return;
    }
    await loadUsers({ page: pagination.page - 1 });
  };
  const handleNext = async () => {
    if (loading || pagination.page >= pagination.pages) {
      return;
    }
    await loadUsers({ page: pagination.page + 1 });
  };
  const clearFilters = () => {
    setSearch("");
    setRole("");
    setActiveStatus("");
  };
  return (
    <section className={styles.page}>
      {" "}
      <div className={styles.heading}>
        {" "}
        <div>
          {" "}
          <span className={styles.eyebrow}> Account Management </span>{" "}
          <h1 className={styles.title}> Users </h1>{" "}
          <p className={styles.subtitle}>
            {" "}
            Manage customer and admin accounts, roles, and status.{" "}
          </p>{" "}
        </div>{" "}
        <button
          type="button"
          className={styles.refresh}
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          {" "}
          <FiRefreshCw
            size={16}
            className={refreshing ? styles.spinning : ""}
          />{" "}
          Refresh{" "}
        </button>{" "}
      </div>{" "}
      <div className={styles.filters}>
        {" "}
        <div className={styles.search}>
          {" "}
          <FiSearch size={16} />{" "}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email or phone..."
          />{" "}
        </div>{" "}
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className={styles.select}
        >
          {" "}
          <option value=""> All roles </option>{" "}
          <option value="customer"> Customer </option>{" "}
          <option value="admin"> Admin </option>{" "}
        </select>{" "}
        <select
          value={activeStatus}
          onChange={(event) => setActiveStatus(event.target.value)}
          className={styles.select}
        >
          {" "}
          <option value=""> All status </option>{" "}
          <option value="true"> Active </option>{" "}
          <option value="false"> Inactive </option>{" "}
        </select>{" "}
        {(search || role || activeStatus) && (
          <button type="button" className={styles.clear} onClick={clearFilters}>
            {" "}
            Clear{" "}
          </button>
        )}{" "}
      </div>{" "}
      {error && <div className={styles.error}> {error} </div>}{" "}
      <div className={styles.card}>
        {" "}
        {loading ? (
          <div className={styles.state}> Loading users... </div>
        ) : users.length === 0 ? (
          <div className={styles.empty}> No users found. </div>
        ) : (
          <div className={styles.tableWrapper}>
            {" "}
            <table className={styles.table}>
              {" "}
              <thead>
                {" "}
                <tr>
                  {" "}
                  <th> User </th> <th> Phone </th> <th> Role </th>{" "}
                  <th> Status </th> <th> Joined </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {users.map((user) => {
                  const id = getUserId(user);
                  const busy = actionId === id;
                  const userRole = user.role === "admin" ? "admin" : "customer";
                  return (
                    <tr key={id}>
                      {" "}
                      <td>
                        {" "}
                        <div className={styles.user}>
                          {" "}
                          <div className={styles.avatar}>
                            {" "}
                            {(user.name || "U").charAt(0).toUpperCase()}{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <Link
                              to={`/admin/users/${id}`}
                              className={styles.userName}
                            >
                              {" "}
                              {user.name || "Unnamed User"}{" "}
                            </Link>{" "}
                            <span> {user.email || "No email"} </span>{" "}
                          </div>{" "}
                        </div>{" "}
                      </td>{" "}
                      <td> {user.phone || "—"} </td>{" "}
                      <td>
                        {" "}
                        <select
                          value={userRole}
                          disabled={busy}
                          onChange={(event) =>
                            handleRole(user, event.target.value)
                          }
                          className={styles.select}
                        >
                          {" "}
                          <option value="customer"> Customer </option>{" "}
                          <option value="admin"> Admin </option>{" "}
                        </select>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        <button
                          type="button"
                          className={
                            user.isActive
                              ? styles.statusActive
                              : styles.statusInactive
                          }
                          onClick={() => handleStatus(user)}
                          disabled={busy}
                        >
                          {" "}
                          {user.isActive ? "Active" : "Inactive"}{" "}
                        </button>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}{" "}
                      </td>{" "}
                    </tr>
                  );
                })}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {!loading && users.length > 0 && (
        <div className={styles.pagination}>
          {" "}
          <span> {pagination.total || 0} users </span>{" "}
          <div className={styles.paginationControls}>
            {" "}
            <button
              type="button"
              onClick={handlePrevious}
              disabled={pagination.page <= 1}
            >
              {" "}
              Previous{" "}
            </button>{" "}
            <span>
              {" "}
              Page {pagination.page || 1} of {pagination.pages || 1}{" "}
            </span>{" "}
            <button
              type="button"
              onClick={handleNext}
              disabled={pagination.page >= pagination.pages}
            >
              {" "}
              Next{" "}
            </button>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </section>
  );
}
export default Users;
