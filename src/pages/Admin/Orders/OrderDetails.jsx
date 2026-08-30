import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import {
  getAdminOrderById,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  cancelAdminOrder,
} from "../../../services/adminOrderService";
import styles from "./OrderDetails.module.css";
const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
function getResponseData(response) {
  if (response && typeof response === "object") {
    if (response.data && typeof response.data === "object") {
      return response.data;
    }
    return response;
  }
  return {};
}
function getOrderId(order) {
  return order?._id || order?.id || order?.orderId || "";
}
function getOrderNumber(order) {
  return order?.orderNumber || order?.orderNo || getOrderId(order) || "—";
}
function getItems(order) {
  if (Array.isArray(order?.items)) {
    return order.items;
  }
  return [];
}
function getItemId(item, index) {
  return (
    item?._id ||
    item?.id ||
    item?.product?._id ||
    item?.product?.id ||
    item?.sku ||
    index
  );
}
function getItemName(item) {
  return item?.name || item?.productName || item?.product?.name || "Product";
}
function getItemQuantity(item) {
  return Number(item?.quantity ?? item?.qty ?? 1) || 1;
}
function getItemPrice(item) {
  return Number(
    item?.price ??
      item?.unitPrice ??
      item?.sellingPrice ??
      item?.product?.price ??
      0,
  );
}
function getItemOriginalPrice(item) {
  return Number(
    item?.originalPrice ??
      item?.mrp ??
      item?.product?.price ??
      getItemPrice(item),
  );
}
function getItemSubtotal(item) {
  const subtotal = Number(item?.subtotal ?? item?.total ?? item?.lineTotal);
  if (Number.isFinite(subtotal)) {
    return subtotal;
  }
  return getItemPrice(item) * getItemQuantity(item);
}
function getItemOfferDiscount(item) {
  const discount = Number(item?.offerDiscount);
  if (Number.isFinite(discount)) {
    return discount;
  }
  return Math.max(
    getItemOriginalPrice(item) * getItemQuantity(item) - getItemSubtotal(item),
    0,
  );
}
function getProductImage(item) {
  return (
    item?.image ||
    item?.imageUrl ||
    item?.productImage ||
    item?.product?.image ||
    item?.product?.imageUrl ||
    (Array.isArray(item?.product?.images) ? item.product.images[0] : "") ||
    ""
  );
}
function getOrderStatus(order) {
  return order?.orderStatus || order?.status || "pending";
}
function getPaymentStatus(order) {
  return order?.paymentStatus || "pending";
}
function getPaymentMethod(order) {
  const method = String(order?.paymentMethod || "").toLowerCase();
  if (method === "online") {
    return "Online Payment";
  }
  if (method === "cod") {
    return "Cash on Delivery";
  }
  if (method === "cash_on_delivery") {
    return "Cash on Delivery";
  }
  return order?.paymentMethod || "—";
}
function getSubtotal(order) {
  const value = Number(order?.subtotal);
  if (Number.isFinite(value)) {
    return value;
  }
  return getItems(order).reduce(
    (total, item) => total + getItemOriginalPrice(item) * getItemQuantity(item),
    0,
  );
}
function getOfferDiscount(order) {
  const direct = Number(order?.offerDiscount);
  if (Number.isFinite(direct)) {
    return direct;
  }
  return getItems(order).reduce(
    (total, item) => total + getItemOfferDiscount(item),
    0,
  );
}
function getCouponDiscount(order) {
  const value = Number(order?.couponDiscount);
  return Number.isFinite(value) ? value : 0;
}
function getTotalDiscount(order) {
  const direct = Number(order?.totalDiscount);
  if (Number.isFinite(direct)) {
    return direct;
  }
  return getOfferDiscount(order) + getCouponDiscount(order);
}
function getShippingFee(order) {
  const value = Number(
    order?.shippingFee ?? order?.shippingCost ?? order?.deliveryFee ?? 0,
  );
  return Number.isFinite(value) ? value : 0;
}
function getOrderTotal(order) {
  const value = Number(order?.total ?? order?.grandTotal ?? order?.totalAmount);
  if (Number.isFinite(value)) {
    return value;
  }
  const subtotal = getSubtotal(order);
  const offerDiscount = getOfferDiscount(order);
  const couponDiscount = getCouponDiscount(order);
  const shipping = getShippingFee(order);
  return Math.max(subtotal - offerDiscount - couponDiscount + shipping, 0);
}
function formatCurrency(value) {
  const amount = Number(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
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
function formatDateTime(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatStatus(value) {
  return String(value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function getCustomerId(order) {
  return (
    order?.user?._id ||
    order?.user?.id ||
    order?.customer?._id ||
    order?.customer?.id ||
    order?.userId ||
    ""
  );
}
function getCustomerName(order) {
  return (
    order?.user?.name ||
    order?.customer?.name ||
    order?.shippingAddress?.fullName ||
    "Guest Customer"
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
function getAddress(order) {
  return order?.shippingAddress || order?.address || {};
}
function OrderDetails() {
  const { id, orderId } = useParams();
  const navigate = useNavigate();
  const currentOrderId = id || orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const loadOrder = useCallback(
    async (showLoading = true) => {
      if (!currentOrderId) {
        setError("Order ID is missing.");
        setLoading(false);
        return;
      }
      try {
        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError("");
        const response = await getAdminOrderById(currentOrderId);
        const data = getResponseData(response);
        const fetchedOrder = data?.order || data?.data?.order || null;
        if (!fetchedOrder) {
          throw new Error("Order was not returned by the server.");
        }
        setOrder(fetchedOrder);
      } catch (requestError) {
        setError(requestError?.message || "Unable to load order details.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentOrderId],
  );
  useEffect(() => {
    loadOrder();
  }, [loadOrder]);
  const handleOrderStatus = async (nextStatus) => {
    if (!order || updatingOrder || updatingPayment || cancelling) {
      return;
    }
    const currentStatus = getOrderStatus(order);
    if (!ORDER_STATUSES.includes(nextStatus) || nextStatus === currentStatus) {
      return;
    }
    try {
      setUpdatingOrder(true);
      setError("");
      const response = await updateAdminOrderStatus(currentOrderId, nextStatus);
      const data = getResponseData(response);
      const updatedOrder = data?.order;
      setOrder((current) => ({
        ...current,
        ...(updatedOrder || {}),
        orderStatus: updatedOrder?.orderStatus || nextStatus,
      }));
    } catch (requestError) {
      setError(requestError?.message || "Unable to update order status.");
    } finally {
      setUpdatingOrder(false);
    }
  };
  const handlePaymentStatus = async (nextStatus) => {
    if (!order || updatingOrder || updatingPayment || cancelling) {
      return;
    }
    const currentStatus = getPaymentStatus(order);
    if (
      !PAYMENT_STATUSES.includes(nextStatus) ||
      nextStatus === currentStatus
    ) {
      return;
    }
    try {
      setUpdatingPayment(true);
      setError("");
      const response = await updateAdminPaymentStatus(
        currentOrderId,
        nextStatus,
        order.paymentId,
      );
      const data = getResponseData(response);
      const updatedOrder = data?.order;
      setOrder((current) => ({
        ...current,
        ...(updatedOrder || {}),
        paymentStatus: updatedOrder?.paymentStatus || nextStatus,
      }));
    } catch (requestError) {
      setError(requestError?.message || "Unable to update payment status.");
    } finally {
      setUpdatingPayment(false);
    }
  };
  const handleCancel = async () => {
    if (!order || cancelling || updatingOrder || updatingPayment) {
      return;
    }
    const reason = window.prompt("Enter cancellation reason:", "");
    if (reason === null) {
      return;
    }
    try {
      setCancelling(true);
      setError("");
      const response = await cancelAdminOrder(currentOrderId, reason);
      const data = getResponseData(response);
      const updatedOrder = data?.order;
      setOrder((current) => ({
        ...current,
        ...(updatedOrder || {}),
        orderStatus: updatedOrder?.orderStatus || "cancelled",
      }));
    } catch (requestError) {
      setError(requestError?.message || "Unable to cancel order.");
    } finally {
      setCancelling(false);
    }
  };
  if (loading) {
    return (
      <section className={styles.page}>
        {" "}
        <div className={styles.state}> Loading order details... </div>{" "}
      </section>
    );
  }
  if (!order) {
    return (
      <section className={styles.page}>
        {" "}
        <div className={styles.error}>
          {" "}
          <strong> Order not found </strong>{" "}
          <p> {error || "The requested order could not be found."} </p>{" "}
          <Link to="/admin/orders" className={styles.back}>
            {" "}
            <FiArrowLeft size={16} /> Back to Orders{" "}
          </Link>{" "}
        </div>{" "}
      </section>
    );
  }
  const items = getItems(order);
  const subtotal = getSubtotal(order);
  const offerDiscount = getOfferDiscount(order);
  const couponDiscount = getCouponDiscount(order);
  const totalDiscount = getTotalDiscount(order);
  const shippingFee = getShippingFee(order);
  const total = getOrderTotal(order);
  const orderStatus = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);
  const address = getAddress(order);
  const customerId = getCustomerId(order);
  return (
    <section className={styles.page}>
      {" "}
      <div className={styles.heading}>
        {" "}
        <div>
          {" "}
          <Link to="/admin/orders" className={styles.back}>
            {" "}
            <FiArrowLeft size={16} /> Back to Orders{" "}
          </Link>{" "}
          <span className={styles.eyebrow}> Store Management </span>{" "}
          <h1 className={styles.title}> Order #{getOrderNumber(order)} </h1>{" "}
          <p className={styles.subtitle}>
            {" "}
            Placed {formatDateTime(order.createdAt || order.date)}{" "}
          </p>{" "}
        </div>{" "}
        <button
          type="button"
          className={styles.refresh}
          onClick={() => loadOrder(false)}
          disabled={
            refreshing || updatingOrder || updatingPayment || cancelling
          }
        >
          {" "}
          <FiRefreshCw
            size={16}
            className={refreshing ? styles.spinning : ""}
          />{" "}
          Refresh{" "}
        </button>{" "}
      </div>{" "}
      {error && <div className={styles.error}> {error} </div>}{" "}
      <div className={styles.statusBar}>
        {" "}
        <div>
          {" "}
          <span> Order Status </span>{" "}
          <strong className={styles.statusValue}>
            {" "}
            {formatStatus(orderStatus)}{" "}
          </strong>{" "}
        </div>{" "}
        <div>
          {" "}
          <span> Payment </span>{" "}
          <strong> {formatStatus(paymentStatus)} </strong>{" "}
        </div>{" "}
        <div>
          {" "}
          <span> Payment Method </span>{" "}
          <strong> {getPaymentMethod(order)} </strong>{" "}
        </div>{" "}
        <div>
          {" "}
          <span> Order Date </span>{" "}
          <strong> {formatDate(order.createdAt || order.date)} </strong>{" "}
        </div>{" "}
      </div>{" "}
      <div className={styles.actionsCard}>
        {" "}
        <div>
          {" "}
          <label>
            {" "}
            <span> Change order status </span>{" "}
            <select
              value={
                ORDER_STATUSES.includes(orderStatus) ? orderStatus : "pending"
              }
              onChange={(event) => handleOrderStatus(event.target.value)}
              disabled={updatingOrder || updatingPayment || cancelling}
              className={styles.select}
            >
              {" "}
              {ORDER_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {" "}
                  {formatStatus(item)}{" "}
                </option>
              ))}{" "}
            </select>{" "}
          </label>{" "}
          <label>
            {" "}
            <span> Change payment status </span>{" "}
            <select
              value={
                PAYMENT_STATUSES.includes(paymentStatus)
                  ? paymentStatus
                  : "pending"
              }
              onChange={(event) => handlePaymentStatus(event.target.value)}
              disabled={updatingOrder || updatingPayment || cancelling}
              className={styles.select}
            >
              {" "}
              {PAYMENT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {" "}
                  {formatStatus(item)}{" "}
                </option>
              ))}{" "}
            </select>{" "}
          </label>{" "}
        </div>{" "}
        {orderStatus !== "cancelled" && orderStatus !== "delivered" && (
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={updatingOrder || updatingPayment || cancelling}
          >
            {" "}
            {cancelling ? "Cancelling..." : "Cancel Order"}{" "}
          </button>
        )}{" "}
      </div>{" "}
      <div className={styles.layout}>
        {" "}
        <main>
          {" "}
          <section className={styles.card}>
            {" "}
            <div className={styles.cardHeader}>
              {" "}
              <div>
                {" "}
                <span className={styles.cardEyebrow}> Products </span>{" "}
                <h2> Order Items </h2>{" "}
              </div>{" "}
              <strong>
                {" "}
                {items.length} {items.length === 1 ? "item" : "items"}{" "}
              </strong>{" "}
            </div>{" "}
            {items.length === 0 ? (
              <div className={styles.empty}> No items found. </div>
            ) : (
              <div className={styles.items}>
                {" "}
                {items.map((item, index) => {
                  const image = getProductImage(item);
                  const quantity = getItemQuantity(item);
                  const price = getItemPrice(item);
                  const originalPrice = getItemOriginalPrice(item);
                  const itemSubtotal = getItemSubtotal(item);
                  const itemDiscount = getItemOfferDiscount(item);
                  return (
                    <div key={getItemId(item, index)} className={styles.item}>
                      {" "}
                      <div className={styles.productImage}>
                        {" "}
                        {image ? (
                          <img src={image} alt={getItemName(item)} />
                        ) : (
                          <span> No image </span>
                        )}{" "}
                      </div>{" "}
                      <div className={styles.itemInfo}>
                        {" "}
                        <strong> {getItemName(item)} </strong>{" "}
                        {item?.sku && <span> SKU: {item.sku} </span>}{" "}
                        <span> Quantity: {quantity} </span>{" "}
                      </div>{" "}
                      <div className={styles.itemPricing}>
                        {" "}
                        {itemDiscount > 0 && (
                          <span className={styles.oldPrice}>
                            {" "}
                            {formatCurrency(originalPrice * quantity)}{" "}
                          </span>
                        )}{" "}
                        <strong> {formatCurrency(itemSubtotal)} </strong>{" "}
                        {itemDiscount > 0 && (
                          <small>
                            {" "}
                            Offer saved {formatCurrency(itemDiscount)}{" "}
                          </small>
                        )}{" "}
                        {itemDiscount === 0 && price > 0 && (
                          <small> {formatCurrency(price)} each </small>
                        )}{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>
            )}{" "}
          </section>{" "}
          <section className={styles.card}>
            {" "}
            <div className={styles.cardHeader}>
              {" "}
              <div>
                {" "}
                <span className={styles.cardEyebrow}> Delivery </span>{" "}
                <h2> Shipping Address </h2>{" "}
              </div>{" "}
            </div>{" "}
            <div className={styles.address}>
              {" "}
              <strong> {address.fullName || "—"} </strong>{" "}
              {address.phone && <span> Phone: {address.phone} </span>}{" "}
              {address.email && <span> Email: {address.email} </span>}{" "}
              {address.addressLine1 && <span> {address.addressLine1} </span>}{" "}
              {address.addressLine2 && <span> {address.addressLine2} </span>}{" "}
              {(address.city || address.state || address.postalCode) && (
                <span>
                  {" "}
                  {address.city || "—"} , {address.state || "—"}{" "}
                  {address.postalCode || ""}{" "}
                </span>
              )}{" "}
              {address.country && <span> {address.country} </span>}{" "}
            </div>{" "}
          </section>{" "}
          <section className={styles.card}>
            {" "}
            <div className={styles.cardHeader}>
              {" "}
              <div>
                {" "}
                <span className={styles.cardEyebrow}> Customer </span>{" "}
                <h2> Customer Information </h2>{" "}
              </div>{" "}
            </div>{" "}
            <div className={styles.customer}>
              {" "}
              <div className={styles.customerAvatar}>
                {" "}
                {getCustomerName(order).charAt(0).toUpperCase()}{" "}
              </div>{" "}
              <div>
                {" "}
                {customerId ? (
                  <Link
                    to={`/admin/users/${customerId}`}
                    className={styles.customerName}
                  >
                    {" "}
                    {getCustomerName(order)}{" "}
                  </Link>
                ) : (
                  <strong> {getCustomerName(order)} </strong>
                )}{" "}
                {getCustomerEmail(order) && (
                  <span> {getCustomerEmail(order)} </span>
                )}{" "}
                {order.user?.phone || order.customer?.phone ? (
                  <span>
                    {" "}
                    Phone: {order.user?.phone || order.customer?.phone}{" "}
                  </span>
                ) : null}{" "}
              </div>{" "}
            </div>{" "}
          </section>{" "}
        </main>{" "}
        <aside>
          {" "}
          <section className={styles.summary}>
            {" "}
            <span className={styles.cardEyebrow}> Payment </span>{" "}
            <h2> Order Summary </h2>{" "}
            <div className={styles.summaryRows}>
              {" "}
              <div>
                {" "}
                <span> Subtotal </span>{" "}
                <strong> {formatCurrency(subtotal)} </strong>{" "}
              </div>{" "}
              {offerDiscount > 0 && (
                <div>
                  {" "}
                  <span> Offer Discount </span>{" "}
                  <strong> - {formatCurrency(offerDiscount)} </strong>{" "}
                </div>
              )}{" "}
              {couponDiscount > 0 && (
                <div>
                  {" "}
                  <span>
                    {" "}
                    Coupon{" "}
                    {order.couponCode ? ` (${order.couponCode})` : ""}{" "}
                  </span>{" "}
                  <strong> - {formatCurrency(couponDiscount)} </strong>{" "}
                </div>
              )}{" "}
              {totalDiscount > 0 && (
                <div>
                  {" "}
                  <span> Total Discount </span>{" "}
                  <strong> - {formatCurrency(totalDiscount)} </strong>{" "}
                </div>
              )}{" "}
              <div>
                {" "}
                <span> Shipping </span>{" "}
                <strong>
                  {" "}
                  {shippingFee === 0
                    ? "Free"
                    : formatCurrency(shippingFee)}{" "}
                </strong>{" "}
              </div>{" "}
              <div className={styles.total}>
                {" "}
                <span> Total </span>{" "}
                <strong> {formatCurrency(total)} </strong>{" "}
              </div>{" "}
            </div>{" "}
            <div className={styles.paymentInfo}>
              {" "}
              <span> Payment Method </span>{" "}
              <strong> {getPaymentMethod(order)} </strong>{" "}
              <span> Payment Status </span>{" "}
              <strong> {formatStatus(paymentStatus)} </strong>{" "}
              {order.paymentId && (
                <>
                  {" "}
                  <span> Payment ID </span>{" "}
                  <strong className={styles.paymentId}>
                    {" "}
                    {order.paymentId}{" "}
                  </strong>{" "}
                </>
              )}{" "}
              {order.couponCode && (
                <>
                  {" "}
                  <span> Coupon </span>{" "}
                  <strong> {order.couponCode} </strong>{" "}
                </>
              )}{" "}
            </div>{" "}
          </section>{" "}
          <section className={styles.summary}>
            {" "}
            <span className={styles.cardEyebrow}> Order </span>{" "}
            <h2> Order Information </h2>{" "}
            <div className={styles.metaRows}>
              {" "}
              <div>
                {" "}
                <span> Order number </span>{" "}
                <strong> # {getOrderNumber(order)} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <span> Created </span>{" "}
                <strong>
                  {" "}
                  {formatDateTime(order.createdAt || order.date)}{" "}
                </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <span> Status </span>{" "}
                <strong> {formatStatus(orderStatus)} </strong>{" "}
              </div>{" "}
              <div>
                {" "}
                <span> Payment </span>{" "}
                <strong> {formatStatus(paymentStatus)} </strong>{" "}
              </div>{" "}
              {order.cancelledAt && (
                <div>
                  {" "}
                  <span> Cancelled </span>{" "}
                  <strong> {formatDateTime(order.cancelledAt)} </strong>{" "}
                </div>
              )}{" "}
              {order.cancellationReason && (
                <div>
                  {" "}
                  <span> Cancellation reason </span>{" "}
                  <strong> {order.cancellationReason} </strong>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </section>{" "}
        </aside>{" "}
      </div>{" "}
    </section>
  );
}
export default OrderDetails;
