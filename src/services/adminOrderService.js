import {
  get,
  patch,
} from "./api";

function buildQuery(params = {}) {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(
          key,
          value,
        );
      }
    },
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
}

export async function getAdminOrders(
  params = {},
) {
  return get(
    `/admin/orders${buildQuery(params)}`,
  );
}

export async function getAdminOrderById(
  id,
) {
  if (!id) {
    throw new Error(
      "Order ID is required.",
    );
  }

  return get(
    `/admin/orders/${id}`,
  );
}

export async function updateAdminOrderStatus(
  id,
  orderStatus,
  reason = "",
) {
  if (!id) {
    throw new Error(
      "Order ID is required.",
    );
  }

  if (!orderStatus) {
    throw new Error(
      "Order status is required.",
    );
  }

  const body = {
    orderStatus,
  };

  if (
    reason &&
    String(reason).trim()
  ) {
    body.reason =
      String(reason).trim();
  }

  return patch(
    `/admin/orders/${id}/status`,
    body,
  );
}

export async function updateAdminPaymentStatus(
  id,
  paymentStatus,
  paymentId,
) {
  if (!id) {
    throw new Error(
      "Order ID is required.",
    );
  }

  if (!paymentStatus) {
    throw new Error(
      "Payment status is required.",
    );
  }

  const body = {
    paymentStatus,
  };

  if (
    paymentId !== undefined &&
    paymentId !== null
  ) {
    body.paymentId =
      String(paymentId).trim();
  }

  return patch(
    `/admin/orders/${id}/payment-status`,
    body,
  );
}

export async function cancelAdminOrder(
  id,
  reason = "",
) {
  if (!id) {
    throw new Error(
      "Order ID is required.",
    );
  }

  return patch(
    `/admin/orders/${id}/cancel`,
    {
      reason: String(
        reason || "",
      ).trim(),
    },
  );
}