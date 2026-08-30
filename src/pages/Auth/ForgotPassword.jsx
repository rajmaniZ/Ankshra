import {
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

  return value.trim();
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
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const handleIdentifierChange =
    (event) => {
      setIdentifier(
        event.target.value,
      );

      setError("");
      setMessage("");
    };

  const handleOtpChange =
    (event) => {
      const value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 6);

      setOtp(value);
      setError("");
      setMessage("");
    };

  const handleSendOtp =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      const value =
        identifier.trim();

      if (!value) {
        setError(
          "Enter your email or mobile number.",
        );

        return;
      }

      const isEmail =
        value.includes("@");

      if (
        isEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          value,
        )
      ) {
        setError(
          "Please enter a valid email address.",
        );

        return;
      }

      if (
        !isEmail &&
        !/^(?:\+91)?[6-9]\d{9}$/.test(
          value.replace(
            /[\s-]/g,
            "",
          ),
        )
      ) {
        setError(
          "Please enter a valid 10-digit mobile number.",
        );

        return;
      }

      try {
        setLoading(true);

        const requestValue =
          isEmail
            ? value.toLowerCase()
            : normalizePhone(value);

        const response =
          await forgotPassword({
            identifier:
              requestValue,
          });

        setStep("otp");

        setMessage(
          response?.message ||
            "Verification code sent successfully.",
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to send verification code.",
        );
      } finally {
        setLoading(false);
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

        const isEmail =
          identifier.includes("@");

        const requestValue =
          isEmail
            ? identifier
                .trim()
                .toLowerCase()
            : normalizePhone(
                identifier,
              );

        const response =
          await verifyPasswordResetOtp({
            identifier:
              requestValue,
            code: otp,
            channel:
              isEmail
                ? "email"
                : "sms",
          });

        const resetToken =
          response?.data?.resetToken;

        if (!resetToken) {
          throw new Error(
            "Password reset token was not returned.",
          );
        }

        sessionStorage.setItem(
          "passwordResetToken",
          resetToken,
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

  return (
    <div
      className={styles.page}
    >
      <div
        className={styles.card}
      >
        <span
          className={styles.eyebrow}
        >
          Account Recovery
        </span>

        <h1
          className={styles.title}
        >
          Forgot Password?
        </h1>

        <p
          className={styles.subtitle}
        >
          {step === "identifier"
            ? "Enter the email or mobile number associated with your account."
            : "Enter the verification code sent to your account."}
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

        {step === "identifier" && (
          <form
            className={styles.form}
            onSubmit={
              handleSendOtp
            }
          >
            <div
              className={
                styles.field
              }
            >
              <label
                className={
                  styles.label
                }
                htmlFor="forgot-identifier"
              >
                Email or Mobile Number
              </label>

              <input
                id="forgot-identifier"
                className={
                  styles.input
                }
                type="text"
                value={
                  identifier
                }
                onChange={
                  handleIdentifierChange
                }
                placeholder="Email or mobile number"
                autoComplete="username"
                disabled={
                  loading
                }
                autoFocus
                required
              />
            </div>

            <button
              className={
                styles.button
              }
              type="submit"
              disabled={
                loading
              }
            >
              {loading
                ? "Sending..."
                : "Send Verification Code"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form
            className={styles.form}
            onSubmit={
              handleVerifyOtp
            }
          >
            <div
              className={
                styles.field
              }
            >
              <label
                className={
                  styles.label
                }
                htmlFor="forgot-otp"
              >
                Verification Code
              </label>

              <input
                id="forgot-otp"
                className={
                  styles.otpInput
                }
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={
                  handleOtpChange
                }
                placeholder="Enter 6-digit OTP"
                autoComplete="one-time-code"
                maxLength={6}
                disabled={
                  loading
                }
                autoFocus
                required
              />

              <p
                className={
                  styles.helperText
                }
              >
                Enter the 6-digit code sent to
                your registered contact.
              </p>
            </div>

            <button
              className={
                styles.button
              }
              type="submit"
              disabled={
                loading
              }
            >
              {loading
                ? "Verifying..."
                : "Verify Code"}
            </button>

            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={() => {
                setStep(
                  "identifier",
                );
                setOtp("");
                setError("");
                setMessage("");
              }}
              disabled={
                loading
              }
            >
              Change Email / Mobile
            </button>
          </form>
        )}

        <Link
          to="/login"
          className={
            styles.backLink
          }
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;