import {
  get,
  post,
} from "./api";

export function register(data) {
  return post(
    "/auth/register",
    data,
  );
}

export function verifyRegistration(
  data,
) {
  return post(
    "/auth/register/verify",
    data,
  );
}

export function resendRegistrationOtp(
  data,
) {
  return post(
    "/auth/register/resend-otp",
    data,
  );
}

export function sendLoginOtp(data) {
  return post(
    "/auth/login/send-otp",
    data,
  );
}

export function resendLoginOtp(
  data,
) {
  return post(
    "/auth/login/resend-otp",
    data,
  );
}

export function verifyLoginOtp(
  data,
) {
  return post(
    "/auth/login/verify-otp",
    data,
  );
}

export function forgotPassword(
  data,
) {
  return post(
    "/auth/forgot-password",
    data,
  );
}

export function verifyPasswordResetOtp(
  data,
) {
  return post(
    "/auth/forgot-password/verify-otp",
    data,
  );
}

export function resetPassword(data) {
  return post(
    "/auth/reset-password",
    data,
  );
}

export function getCurrentUser() {
  return get(
    "/auth/me",
  );
}