import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEye, FiRefreshCw, FiSearch } from "react-icons/fi";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  cancelAdminOrder,
} from "../../../services/adminOrderService";
import styles from "./Orders.module.css";
const LIMIT = 20;
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
function getOrders(response) {
  const data = response?.data || response || {};
  if (Array.isArray(data)) {
    return data;
  }
  return data.orders || data.items || data.results || [];
}
function getPagination(response) {
  const data = response?.data || response || {};
  return (
    data.pagination ||
    response?.pagination || { page: 1, limit: LIMIT, total: 0, pages: 1 }
  );
}
function getOrderId(order) {
  return order?._id || order?.id || "";
}
function getOrderNumber(order) {
  return order?.orderNumber || order?.orderNo || getOrderId(order) || "—";
}
function getCustomerName(order) {
  return (
    order?.user?.name ||
    order?.customer?.name ||
    order?.shippingAddress?.fullName ||
    order?.userName ||
    "Guest"
  );
}
function getCustomerEmail(order) {
  return (
    order?.user?.email ||
    order?.customer?.email ||
    order?.shippingAddress?.email ||
    ""
  );
}
function getTotal(order) {
  return order?.total ?? order?.grandTotal ?? order?.totalAmount ?? 0;
}
function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "₹0.00";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
function formatDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatStatus(value) {
  if (!value) {
    return "Unknown";
  }
  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function getErrorMessage(error) {
  return error?.message || "Unable to load orders.";
}
function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    pages: 1,
  });
  const loadOrders = useCallback(
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
        if (status) {
          params.orderStatus = status;
        }
        if (paymentStatus) {
          params.paymentStatus = paymentStatus;
        }
        const response = await getAdminOrders(params);
        setOrders(getOrders(response));
        setPagination(getPagination(response));
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status, paymentStatus],
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders({ page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, status, paymentStatus, loadOrders]);
  const handleOrderStatus = async (order, nextStatus) => {
    const id = getOrderId(order);
    if (!id || actionId || !nextStatus || nextStatus === order.orderStatus) {
      return;
    }
    try {
      setActionId(id);
      setError("");
      const response = await updateAdminOrderStatus(id, nextStatus);
      const updatedOrder = response?.data?.order || response?.order;
      setOrders((current) =>
        current.map((item) =>
          getOrderId(item) === id
            ? {
                ...item,
                ...(updatedOrder || {}),
                orderStatus: updatedOrder?.orderStatus || nextStatus,
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
  const handlePaymentStatus = async (order, nextPaymentStatus) => {
    const id = getOrderId(order);
    if (
      !id ||
      actionId ||
      !nextPaymentStatus ||
      nextPaymentStatus === order.paymentStatus
    ) {
      return;
    }
    try {
      setActionId(id);
      setError("");
      const response = await updateAdminPaymentStatus(
        id,
        nextPaymentStatus,
        order.paymentId,
      );
      const updatedOrder = response?.data?.order || response?.order;
      setOrders((current) =>
        current.map((item) =>
          getOrderId(item) === id
            ? {
                ...item,
                ...(updatedOrder || {}),
                paymentStatus: updatedOrder?.paymentStatus || nextPaymentStatus,
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
  const handleCancel = async (order) => {
    const id = getOrderId(order);
    if (!id || actionId || order.orderStatus === "cancelled") {
      return;
    }
    const reason = window.prompt("Enter cancellation reason:", "");
    if (reason === null) {
      return;
    }
    try {
      setActionId(id);
      setError("");
      const response = await cancelAdminOrder(id, reason);
      const updatedOrder = response?.data?.order || response?.order;
      setOrders((current) =>
        current.map((item) =>
          getOrderId(item) === id
            ? {
                ...item,
                ...(updatedOrder || {}),
                orderStatus: updatedOrder?.orderStatus || "cancelled",
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
  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
  };
  const handlePrevious = () => {
    if (loading || pagination.page <= 1) {
      return;
    }
    loadOrders({ page: pagination.page - 1 });
  };
  const handleNext = () => {
    if (loading || pagination.page >= pagination.pages) {
      return;
    }
    loadOrders({ page: pagination.page + 1 });
  };
  return (
    <section className={styles.page}>
      {" "}
      <div className={styles.heading}>
        {" "}
        <div>
          {" "}
          <span className={styles.eyebrow}> Store Management </span>{" "}
          <h1 className={styles.title}> Orders </h1>{" "}
          <p className={styles.subtitle}>
            {" "}
            Manage orders, payment status, and fulfilment.{" "}
          </p>{" "}
        </div>{" "}
        <button
          type="button"
          className={styles.refresh}
          onClick={() =>
            loadOrders({ page: pagination.page || 1, silent: true })
          }
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
            placeholder="Search order or customer..."
          />{" "}
        </div>{" "}
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={styles.select}
        >
          {" "}
          <option value=""> All order status </option>{" "}
          {ORDER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {" "}
              {formatStatus(item)}{" "}
            </option>
          ))}{" "}
        </select>{" "}
        <select
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value)}
          className={styles.select}
        >
          {" "}
          <option value=""> All payment status </option>{" "}
          {PAYMENT_STATUSES.map((item) => (
            <option key={item} value={item}>
              {" "}
              {formatStatus(item)}{" "}
            </option>
          ))}{" "}
        </select>{" "}
        {(search || status || paymentStatus) && (
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
          <div className={styles.state}> Loading orders... </div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}> No orders found. </div>
        ) : (
          <div className={styles.tableWrapper}>
            {" "}
            <table className={styles.table}>
              {" "}
              <thead>
                {" "}
                <tr>
                  {" "}
                  <th> Order </th> <th> Customer </th> <th> Total </th>{" "}
                  <th> Order Status </th> <th> Payment </th> <th> Date </th>{" "}
                  <th> Action </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {orders.map((order) => {
                  const id = getOrderId(order);
                  const busy = actionId === id;
                  return (
                    <tr key={id}>
                      {" "}
                      <td>
                        {" "}
                        <Link
                          to={`/admin/orders/${id}`}
                          className={styles.orderLink}
                        >
                          {" "}
                          {getOrderNumber(order)}{" "}
                        </Link>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        <div className={styles.customer}>
                          {" "}
                          <strong> {getCustomerName(order)} </strong>{" "}
                          {getCustomerEmail(order) && (
                            <span> {getCustomerEmail(order)} </span>
                          )}{" "}
                        </div>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        <strong>
                          {" "}
                          {formatCurrency(getTotal(order))}{" "}
                        </strong>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        <select
                          value={order.orderStatus || ""}
                          disabled={busy}
                          onChange={(event) =>
                            handleOrderStatus(order, event.target.value)
                          }
                          className={styles.statusSelect}
                        >
                          {" "}
                          {ORDER_STATUSES.map((item) => (
                            <option key={item} value={item}>
                              {" "}
                              {formatStatus(item)}{" "}
                            </option>
                          ))}{" "}
                        </select>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        <select
                          value={order.paymentStatus || ""}
                          disabled={busy}
                          onChange={(event) =>
                            handlePaymentStatus(order, event.target.value)
                          }
                          className={styles.statusSelect}
                        >
                          {" "}
                          {PAYMENT_STATUSES.map((item) => (
                            <option key={item} value={item}>
                              {" "}
                              {formatStatus(item)}{" "}
                            </option>
                          ))}{" "}
                        </select>{" "}
                      </td>{" "}
                      <td> {formatDate(order.createdAt)} </td>{" "}
                      <td>
                        {" "}
                        <div className={styles.actions}>
                          {" "}
                          <Link
                            to={`/admin/orders/${id}`}
                            className={styles.view}
                            aria-label="View order"
                          >
                            {" "}
                            <FiEye size={15} /> View{" "}
                          </Link>{" "}
                          {order.orderStatus !== "cancelled" &&
                            order.orderStatus !== "delivered" && (
                              <button
                                type="button"
                                className={styles.cancel}
                                disabled={busy}
                                onClick={() => handleCancel(order)}
                              >
                                {" "}
                                Cancel{" "}
                              </button>
                            )}{" "}
                        </div>{" "}
                      </td>{" "}
                    </tr>
                  );
                })}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {!loading && orders.length > 0 && (
        <div className={styles.pagination}>
          {" "}
          <span> {pagination.total || orders.length} orders </span>{" "}
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
export default Orders;
