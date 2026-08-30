import {
  get,
  post,
  patch,
} from "./api";

export async function getOrders(
  params = {},
) {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.append(
          key,
          value,
        );
      }
    },
  );

  const queryString =
    query.toString();

  const endpoint =
    queryString
      ? `/orders?${queryString}`
      : "/orders";

  return get(endpoint);
}

export async function getOrderById(
  id,
) {
  if (!id) {
    throw new Error(
      "Order ID is required.",
    );
  }

  return get(
    `/orders/${id}`,
  );
}

export async function createOrder(
  data,
) {
  if (!data) {
    throw new Error(
      "Order data is required.",
    );
  }

  return post(
    "/orders",
    data,
  );
}

export async function cancelOrder(
  id,
  reason = "",
) {
  if (!id) {
    throw new Error(
      "Order ID is required.",
    );
  }

  return patch(
    `/orders/${id}/cancel`,
    {
      reason: String(
        reason || "",
      ).trim(),
    },
  );
}