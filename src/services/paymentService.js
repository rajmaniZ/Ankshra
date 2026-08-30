import {
  get,
  post,
} from "./api";

export async function createPaymentOrder(
  orderId,
) {
  if (!orderId) {
    throw new Error(
      "Order ID is required.",
    );
  }

  return post(
    "/payments/create-order",
    {
      orderId,
    },
  );
}

export async function verifyPayment(
  data,
) {
  if (!data) {
    throw new Error(
      "Payment verification data is required.",
    );
  }

  const requiredFields = [
    "orderId",
    "razorpayOrderId",
    "razorpayPaymentId",
    "razorpaySignature",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(
        `Missing payment field: ${field}`,
      );
    }
  }

  return post(
    "/payments/verify",
    data,
  );
}

export async function getPaymentStatus(
  orderId,
) {
  if (!orderId) {
    throw new Error(
      "Order ID is required.",
    );
  }

  return get(
    `/payments/${orderId}`,
  );
}