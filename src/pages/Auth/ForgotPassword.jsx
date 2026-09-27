import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  forgotPassword,
  verifyPasswordResetOtp,
} from "../../services/authService";

import styles from "./ForgotPassword.module.css";

function normalizePhone(value) {
  const digits =
    String(value || "")
      .replace(/\D/g, "");

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return `+${digits}`;
  }

  return "";
}

function getResponseData(response) {
  return response?.data &&
    typeof response.data === "object"
    ? response.data
    : {};
}

function getResponseMessage(response) {
  const data =
    getResponseData(response);

  return (
    response?.message ||
    data?.message ||
    ""
  );
}

function ForgotPassword() {
  const navigate =
    useNavigate();

  const [
    step,
    setStep,
  ] = useState("identifier");

  const [
    identifier,
    setIdentifier,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    channel,
    setChannel,
  ] = useState("email");

  const [
    recipient,
    setRecipient,
  ] = useState("");

  const [
    emailAvailableAt,
    setEmailAvailableAt,
  ] = useState(0);

  const [
    smsAvailableAt,
    setSmsAvailableAt,
  ] = useState(0);

  const [
    now,
    setNow,
  ] = useState(Date.now());

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const emailSeconds = Math.max(
    0,
    Math.ceil(
      (emailAvailableAt - now) /
        1000,
    ),
  );

  const smsSeconds = Math.max(
    0,
    Math.ceil(
      (smsAvailableAt - now) /
        1000,
    ),
  );

  const isBusy =
    loading ||
    actionLoading !== "";

  useEffect(() => {
    if (
      !emailAvailableAt &&
      !smsAvailableAt
    ) {
      return undefined;
    }

    const timer =
      window.setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [
    emailAvailableAt,
    smsAvailableAt,
  ]);

  const getRequestIdentifier =
    () => {
      const value =
        identifier.trim();

      if (value.includes("@")) {
        return value.toLowerCase();
      }

      return normalizePhone(value);
    };

  const applyResponse = (
    response,
    fallbackChannel = "email",
  ) => {
    const data =
      getResponseData(response);

    const nextChannel =
      data.channel ||
      fallbackChannel;

    const nextRecipient =
      data.recipient ||
      recipient ||
      "";

    setChannel(
      nextChannel === "sms"
        ? "sms"
        : "email",
    );

    setRecipient(
      nextRecipient,
    );

    setOtp("");

    setEmailAvailableAt(
      Number(
        data.canResendEmailAt ||
          0,
      ),
    );

    setSmsAvailableAt(
      Number(
        data.canSendSmsAt ||
          data.canResendSmsAt ||
          0,
      ),
    );

    setStep("otp");

    setMessage(
      getResponseMessage(response) ||
        (
          nextChannel === "email"
            ? "Verification code sent to your registered email."
            : "Verification code sent to your mobile."
        ),
    );
  };

  const handleSendOtp =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      const requestIdentifier =
        getRequestIdentifier();

      if (!requestIdentifier) {
        setError(
          "Enter a valid email address or mobile number.",
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await forgotPassword({
            identifier:
              requestIdentifier,
            channel: "email",
          });

        applyResponse(
          response,
          "email",
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to send email OTP.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleOtpAction =
    async (nextChannel) => {
      setError("");
      setMessage("");

      const requestIdentifier =
        getRequestIdentifier();

      if (!requestIdentifier) {
        setError(
          "Your email or mobile number is required.",
        );
        return;
      }

      if (
        nextChannel === "email" &&
        emailSeconds > 0
      ) {
        return;
      }

      if (
        nextChannel === "sms" &&
        smsSeconds > 0
      ) {
        return;
      }

      try {
        setActionLoading(
          nextChannel,
        );

        const response =
          await forgotPassword({
            identifier:
              requestIdentifier,
            channel:
              nextChannel,
            recipient:
              nextChannel === "email"
                ? recipient
                : normalizePhone(
                    requestIdentifier,
                  ),
          });

        applyResponse(
          response,
          nextChannel,
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            (
              nextChannel === "email"
                ? "Unable to resend email OTP."
                : "Unable to send mobile OTP."
            ),
        );
      } finally {
        setActionLoading("");
      }
    };

  const handleVerifyOtp =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      if (!/^\d{6}$/.test(otp)) {
        setError(
          "Please enter the 6-digit verification code.",
        );
        return;
      }

      try {
        setLoading(true);

        const requestIdentifier =
          getRequestIdentifier();

        const response =
          await verifyPasswordResetOtp({
            identifier:
              requestIdentifier,
            code:
              otp.trim(),
            channel,
            recipient,
          });

        const resetToken =
          response?.data?.resetToken ||
          response?.resetToken;

        if (!resetToken) {
          throw new Error(
            "Password reset token was not returned.",
          );
        }

        sessionStorage.setItem(
          "passwordResetToken",
          resetToken,
        );

        sessionStorage.setItem(
          "passwordResetChannel",
          channel,
        );

        navigate(
          `/reset-password?token=${encodeURIComponent(
            resetToken,
          )}`,
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Invalid or expired verification code.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleChangeIdentifier =
    () => {
      setStep("identifier");
      setOtp("");
      setChannel("email");
      setRecipient("");
      setEmailAvailableAt(0);
      setSmsAvailableAt(0);
      setError("");
      setMessage("");
    };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>
          Account Recovery
        </span>

        <h1 className={styles.title}>
          Forgot Password?
        </h1>

        <p className={styles.subtitle}>
          {step === "identifier"
            ? "Enter the email or mobile number associated with your account. The first OTP is always sent by email."
            : channel === "email"
              ? `Enter the verification code sent to ${
                  recipient ||
                  "your registered email"
                }.`
              : "Enter the verification code sent to your mobile number."}
        </p>

        {error && (
          <div
            className={styles.error}
            role="alert"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className={styles.success}
            role="status"
          >
            {message}
          </div>
        )}

        {step === "identifier" ? (
          <form
            className={styles.form}
            onSubmit={handleSendOtp}
          >
            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor="forgot-identifier"
              >
                Email or Mobile Number
              </label>

              <input
                id="forgot-identifier"
                className={styles.input}
                type="text"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(
                    event.target.value,
                  );
                  setError("");
                  setMessage("");
                }}
                placeholder="Email or mobile number"
                autoComplete="username"
                disabled={isBusy}
                autoFocus
                required
              />
            </div>

            <button
              className={styles.button}
              type="submit"
              disabled={isBusy}
            >
              {loading
                ? "Sending Email OTP..."
                : "Send Verification Code"}
            </button>
          </form>
        ) : (
          <form
            className={styles.form}
            onSubmit={handleVerifyOtp}
          >
            <div className={styles.field}>
              <label
                className={styles.label}
                htmlFor="forgot-otp"
              >
                Verification Code
              </label>

              <input
                id="forgot-otp"
                className={styles.otpInput}
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(event) => {
                  setOtp(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6),
                  );
                  setError("");
                  setMessage("");
                }}
                placeholder="Enter 6-digit OTP"
                autoComplete="one-time-code"
                maxLength={6}
                disabled={isBusy}
                autoFocus
                required
              />

              <p className={styles.helperText}>
                Current channel:{" "}
                {channel === "email"
                  ? "Email"
                  : "Mobile SMS"}
              </p>
            </div>

            <button
              className={styles.button}
              type="submit"
              disabled={isBusy}
            >
              {loading
                ? "Verifying..."
                : "Verify Code"}
            </button>

            {emailSeconds > 0 ? (
              <div className={styles.secondaryButton}>
                Resend email in {emailSeconds}s
              </div>
            ) : (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  handleOtpAction("email")
                }
                disabled={isBusy}
              >
                {actionLoading === "email"
                  ? "Sending..."
                  : "Resend OTP to Email"}
              </button>
            )}

            {smsSeconds > 0 ? (
              <div className={styles.secondaryButton}>
                Mobile OTP available in {smsSeconds}s
              </div>
            ) : (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() =>
                  handleOtpAction("sms")
                }
                disabled={isBusy}
              >
                {actionLoading === "sms"
                  ? "Sending..."
                  : "Send OTP to Mobile"}
              </button>
            )}

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={
                handleChangeIdentifier
              }
              disabled={isBusy}
            >
              Change Email / Mobile
            </button>
          </form>
        )}

        <Link
          to="/login"
          className={styles.backLink}
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
