import {
  post,
} from "./api";

export async function validateCoupon(
  code,
  orderAmount,
) {
  const couponCode =
    String(code || "")
      .trim()
      .toUpperCase();

  if (!couponCode) {
    throw new Error(
      "Coupon code is required.",
    );
  }

  const amount =
    Number(orderAmount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Valid order amount is required.",
    );
  }

  return post(
    "/coupons/validate",
    {
      code: couponCode,
      amount,
    },
  );
}