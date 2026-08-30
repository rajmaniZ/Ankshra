import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuthContext,
} from "../../context/AuthContext";

import {
  resendRegistrationOtp,
} from "../../services/authService";

import styles from "./VerifyAccount.module.css";

function normalizePhone(value) {
  const digits =
    String(value || "")
      .replace(/\D/g, "");

  if (
    digits.length === 10
  ) {
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

function getLocalPhone(
  value,
) {
  const normalized =
    normalizePhone(value);

  if (!normalized) {
    return "";
  }

  return normalized.slice(3);
}

function getStoredChannel() {
  return (
    localStorage.getItem(
      "registrationOtpChannel",
    ) ||
    localStorage.getItem(
      "registrationChannel",
    ) ||
    "sms"
  );
}

function getStoredRecipient() {
  return (
    localStorage.getItem(
      "registrationOtpRecipient",
    ) ||
    localStorage.getItem(
      "registrationRecipient",
    ) ||
    ""
  );
}

function VerifyAccount() {
  const navigate =
    useNavigate();

  const {
    verifyRegister,
    loading: authLoading,
  } = useAuthContext();

  const [
    phone,
    setPhone,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    otpChannel,
    setOtpChannel,
  ] = useState(
    getStoredChannel(),
  );

  const [
    recipient,
    setRecipient,
  ] = useState(
    getStoredRecipient(),
  );

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
    success,
    setSuccess,
  ] = useState("");

  const isLoading =
    loading ||
    authLoading;

  const isEmailOtp =
    otpChannel === "email";

  useEffect(() => {
    const savedPhone =
      localStorage.getItem(
        "registrationPhone",
      );

    if (savedPhone) {
      setPhone(
        getLocalPhone(
          savedPhone,
        ),
      );
    }

    const savedChannel =
      getStoredChannel();

    const savedRecipient =
      getStoredRecipient();

    if (savedChannel) {
      setOtpChannel(
        savedChannel,
      );
    }

    if (savedRecipient) {
      setRecipient(
        savedRecipient,
      );
    }
  }, []);

  const handlePhoneChange =
    (event) => {
      const value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 10);

      setPhone(value);
      setError("");
      setSuccess("");
    };

  const handleOtpChange =
    (event) => {
      const value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 6);

      setOtp(value);
      setError("");
      setSuccess("");
    };

  const saveDestination = (
    channel,
    destination,
  ) => {
    const safeChannel =
      channel === "email"
        ? "email"
        : channel ===
            "whatsapp"
          ? "whatsapp"
          : "sms";

    const safeRecipient =
      String(
        destination || "",
      ).trim();

    setOtpChannel(
      safeChannel,
    );

    setRecipient(
      safeRecipient,
    );

    localStorage.setItem(
      "registrationOtpChannel",
      safeChannel,
    );

    localStorage.setItem(
      "registrationOtpRecipient",
      safeRecipient,
    );
  };

  const getDestination =
    (response) => {
      const responseData =
        response?.data || {};

      const channel =
        responseData.channel ||
        response?.channel ||
        otpChannel ||
        "sms";

      const actualChannel =
        String(channel)
          .trim()
          .toLowerCase();

      const safeChannel =
        actualChannel ===
        "email"
          ? "email"
          : actualChannel ===
              "whatsapp"
            ? "whatsapp"
            : "sms";

      const responseRecipient =
        responseData.recipient ||
        response?.recipient ||
        "";

      const fallbackRecipient =
        safeChannel ===
        "email"
          ? localStorage.getItem(
              "registrationEmail",
            ) || ""
          : normalizePhone(
              phone,
            );

      return {
        channel:
          safeChannel,
        recipient:
          String(
            responseRecipient ||
              fallbackRecipient ||
              "",
          ).trim(),
      };
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const cleanPhone =
        phone.trim();

      const cleanOtp =
        otp.trim();

      if (
        !/^[6-9]\d{9}$/.test(
          cleanPhone,
        )
      ) {
        setError(
          "Please enter a valid 10-digit mobile number.",
        );

        return;
      }

      if (
        !/^\d{6}$/.test(
          cleanOtp,
        )
      ) {
        setError(
          "Please enter the 6-digit verification code.",
        );

        return;
      }

      const internationalPhone =
        normalizePhone(
          cleanPhone,
        );

      if (!internationalPhone) {
        setError(
          "Please enter a valid mobile number.",
        );

        return;
      }

      const requestData = {
        phone:
          internationalPhone,
        code:
          cleanOtp,
        channel:
          otpChannel,
      };

      /*
       * When email fallback is being
       * used, recipient MUST be the
       * email address that received
       * the OTP.
       */
      if (
        otpChannel === "email"
      ) {
        const email =
          String(
            recipient ||
              localStorage.getItem(
                "registrationEmail",
              ) ||
              "",
          )
            .trim()
            .toLowerCase();

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email,
          )
        ) {
          setError(
            "A valid registered email address is required for email OTP verification.",
          );

          return;
        }

        requestData.recipient =
          email;
      } else {
        requestData.recipient =
          internationalPhone;
      }

      try {
        setLoading(true);

        const response =
          await verifyRegister(
            requestData,
          );

        const token =
          response?.data?.token ||
          response?.data
            ?.accessToken ||
          response?.token ||
          response?.accessToken ||
          null;

        const verifiedUser =
          response?.data?.user ||
          response?.user ||
          null;

        if (token) {
          localStorage.setItem(
            "accessToken",
            token,
          );
        }

        if (verifiedUser) {
          localStorage.setItem(
            "user",
            JSON.stringify(
              verifiedUser,
            ),
          );
        }

        localStorage.removeItem(
          "registrationPhone",
        );

        localStorage.removeItem(
          "registrationEmail",
        );

        localStorage.removeItem(
          "registrationOtpChannel",
        );

        localStorage.removeItem(
          "registrationOtpRecipient",
        );

        localStorage.removeItem(
          "registrationChannel",
        );

        localStorage.removeItem(
          "registrationRecipient",
        );

        localStorage.removeItem(
          "registrationFallbackUsed",
        );

        setSuccess(
          "Your account has been verified successfully.",
        );

        setTimeout(() => {
          navigate(
            "/",
            {
              replace: true,
            },
          );
        }, 900);
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
            "Invalid or expired OTP.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleResendOtp =
    async () => {
      setError("");
      setSuccess("");

      const cleanPhone =
        phone.trim();

      if (
        !/^[6-9]\d{9}$/.test(
          cleanPhone,
        )
      ) {
        setError(
          "Please enter a valid 10-digit mobile number before resending the OTP.",
        );

        return;
      }

      const internationalPhone =
        normalizePhone(
          cleanPhone,
        );

      if (!internationalPhone) {
        setError(
          "Please enter a valid mobile number.",
        );

        return;
      }

      try {
        setResendLoading(
          true,
        );

        /*
         * Ask backend to retry SMS.
         *
         * If SMS fails again, backend
         * automatically sends a NEW
         * OTP to registered email.
         */
        const response =
          await resendRegistrationOtp(
            {
              phone:
                internationalPhone,
              channel: "sms",
            },
          );

        const destination =
          getDestination(
            response,
          );

        saveDestination(
          destination.channel,
          destination.recipient,
        );

        setOtp("");

        if (
          destination.channel ===
          "email"
        ) {
          setSuccess(
            destination.recipient
              ? `A new verification code has been sent to ${destination.recipient}.`
              : "A new verification code has been sent to your registered email address.",
          );

          return;
        }

        if (
          destination.channel ===
          "whatsapp"
        ) {
          setSuccess(
            `A new verification code has been sent to WhatsApp at ${
              destination.recipient ||
              internationalPhone
            }.`,
          );

          return;
        }

        setSuccess(
          `A new verification code has been sent to ${internationalPhone}.`,
        );
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
            "Unable to resend verification code.",
        );
      } finally {
        setResendLoading(
          false,
        );
      }
    };

  return (
    <div
      className={styles.page}
    >
      <div
        className={styles.card}
      >
        <div
          className={styles.header}
        >
          <span
            className={
              styles.eyebrow
            }
          >
            Almost There
          </span>

          <h1
            className={
              styles.title
            }
          >
            Verify Account
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            {isEmailOtp
              ? "Enter the verification code sent to your registered email address."
              : "Enter the verification code sent to your registered mobile number."}
          </p>
        </div>

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

        {success && (
          <div
            className={
              styles.success
            }
            role="status"
          >
            <strong>
              {isEmailOtp
                ? "Verification code sent by email"
                : "Verification code sent"}
            </strong>

            <div>
              {success}
            </div>
          </div>
        )}

        <form
          className={
            styles.form
          }
          onSubmit={
            handleSubmit
          }
        >
          <div
            className={
              styles.field
            }
          >
            <label
              htmlFor="verify-phone"
              className={
                styles.label
              }
            >
              Mobile Number
            </label>

            <div
              className={
                styles.phoneInput
              }
            >
              <span
                className={
                  styles.countryCode
                }
              >
                +91
              </span>

              <input
                id="verify-phone"
                className={
                  styles.input
                }
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={
                  handlePhoneChange
                }
                placeholder="Enter mobile number"
                autoComplete="tel"
                maxLength={10}
                disabled={
                  isLoading ||
                  resendLoading
                }
                required
              />
            </div>
          </div>

          <div
            className={
              styles.field
            }
          >
            <label
              htmlFor="verify-otp"
              className={
                styles.label
              }
            >
              Verification Code
            </label>

            <input
              id="verify-otp"
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
                isLoading ||
                resendLoading
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
                : `Enter the 6-digit verification code sent to ${
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
              isLoading ||
              resendLoading
            }
          >
            {loading
              ? "Verifying..."
              : "Verify Account"}
          </button>

          <button
            className={
              styles.secondaryButton
            }
            type="button"
            onClick={
              handleResendOtp
            }
            disabled={
              isLoading ||
              resendLoading
            }
          >
            {resendLoading
              ? "Sending..."
              : "Resend OTP"}
          </button>
        </form>

        <div
          className={
            styles.divider
          }
        >
          <span>
            Already verified?
          </span>
        </div>

        <Link
          to="/login"
          className={
            styles.loginLink
          }
        >
          Go to Sign In
        </Link>

        <Link
          to="/register"
          className={
            styles.backLink
          }
        >
          Back to Registration
        </Link>
      </div>
    </div>
  );
}

export default VerifyAccount;