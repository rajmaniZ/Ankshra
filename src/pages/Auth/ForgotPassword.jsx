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

  return String(
    value || "",
  ).trim();
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
  ] = useState("sms");

  const [
    recipient,
    setRecipient,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    resendLoading,
    setResendLoading,
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

  const getRequestIdentifier =
    () => {
      const value =
        identifier.trim();

      if (
        value.includes("@")
      ) {
        return value.toLowerCase();
      }

      return normalizePhone(
        value,
      );
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
          getRequestIdentifier();

        const response =
          await forgotPassword({
            identifier:
              requestValue,
          });

        const responseData =
          response?.data || {};

        const responseChannel =
          responseData.channel ||
          response?.channel ||
          (
            isEmail
              ? "email"
              : "sms"
          );

        const responseRecipient =
          responseData.recipient ||
          response?.recipient ||
          requestValue;

        const actualChannel =
          responseChannel === "email"
            ? "email"
            : "sms";

        setChannel(
          actualChannel,
        );

        setRecipient(
          responseRecipient,
        );

        setOtp("");
        setStep("otp");

        setMessage(
          response?.message ||
            responseData.message ||
            (
              actualChannel === "email"
                ? "Verification code sent to your email address."
                : "Verification code sent to your mobile number."
            ),
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

  const handleResendOtp =
    async () => {
      setError("");
      setMessage("");

      const requestValue =
        getRequestIdentifier();

      if (!requestValue) {
        setError(
          "Your email or mobile number is required.",
        );

        return;
      }

      try {
        setResendLoading(true);

        /*
         * The existing forgot-password endpoint
         * creates a new OTP, so it can safely be
         * used for resend.
         *
         * This also preserves the backend's
         * SMS -> email fallback behaviour.
         */
        const response =
          await forgotPassword({
            identifier:
              requestValue,
          });

        const responseData =
          response?.data || {};

        const responseChannel =
          responseData.channel ||
          response?.channel ||
          channel;

        const responseRecipient =
          responseData.recipient ||
          response?.recipient ||
          requestValue;

        const actualChannel =
          responseChannel === "email"
            ? "email"
            : "sms";

        setChannel(
          actualChannel,
        );

        setRecipient(
          responseRecipient,
        );

        setOtp("");

        if (
          actualChannel === "email"
        ) {
          setMessage(
            responseRecipient &&
              responseRecipient.includes(
                "@",
              )
              ? `A new verification code has been sent to ${responseRecipient}.`
              : "A new verification code has been sent to your registered email address.",
          );
        } else {
          setMessage(
            `A new verification code has been sent to ${responseRecipient}.`,
          );
        }
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to resend verification code.",
        );
      } finally {
        setResendLoading(false);
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

        const requestValue =
          getRequestIdentifier();

        const response =
          await verifyPasswordResetOtp({
            identifier:
              requestValue,
            code:
              otp.trim(),
            channel,
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
      setError("");
      setMessage("");
      setChannel("sms");
      setRecipient("");
    };

  const isEmailOtp =
    channel === "email";

  const isBusy =
    loading ||
    resendLoading;

  return (
    <div
      className={
        styles.page
      }
    >
      <div
        className={
          styles.card
        }
      >
        <span
          className={
            styles.eyebrow
          }
        >
          Account Recovery
        </span>

        <h1
          className={
            styles.title
          }
        >
          Forgot Password?
        </h1>

        <p
          className={
            styles.subtitle
          }
        >
          {step === "identifier"
            ? "Enter the email or mobile number associated with your account."
            : isEmailOtp
              ? "Enter the verification code sent to your registered email address."
              : "Enter the verification code sent to your mobile number."}
        </p>

        {error && (
          <div
            className={
              styles.error
            }
            role="alert"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className={
              styles.success
            }
            role="status"
          >
            {message}
          </div>
        )}

        {step === "identifier" && (
          <form
            className={
              styles.form
            }
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
                  isBusy
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
                isBusy
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
            className={
              styles.form
            }
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
                  isBusy
                }
                autoFocus
                required
              />

              <p
                className={
                  styles.helperText
                }
              >
                {isEmailOtp
                  ? `Enter the 6-digit code sent to ${
                      recipient ||
                      "your registered email address"
                    }.`
                  : `Enter the 6-digit code sent to ${
                      recipient ||
                      "your mobile number"
                    }.`}
              </p>
            </div>

            <button
              className={
                styles.button
              }
              type="submit"
              disabled={
                isBusy
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
              onClick={
                handleResendOtp
              }
              disabled={
                isBusy
              }
            >
              {resendLoading
                ? "Sending..."
                : "Resend OTP"}
            </button>

            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={
                handleChangeIdentifier
              }
              disabled={
                isBusy
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