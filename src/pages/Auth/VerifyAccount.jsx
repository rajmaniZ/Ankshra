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

import styles from "./VerifyAccount.module.css";

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

function getLocalPhone(value) {
  const normalized =
    normalizePhone(value);

  if (!normalized) {
    return "";
  }

  return normalized.slice(3);
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
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  useEffect(() => {
    const savedPhone =
      localStorage.getItem(
        "registrationPhone",
      );

    if (savedPhone) {
      setPhone(
        getLocalPhone(savedPhone),
      );
    }
  }, []);

  const isLoading =
    loading || authLoading;

  const handlePhoneChange = (
    event,
  ) => {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 10);

    setPhone(value);
    setError("");
    setSuccess("");
  };

  const handleOtpChange = (
    event,
  ) => {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(value);
    setError("");
    setSuccess("");
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

      try {
        setLoading(true);

        const response =
          await verifyRegister({
            phone:
              internationalPhone,
            code: cleanOtp,
          });

        const token =
          response?.data?.token ||
          response?.data?.accessToken ||
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
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Invalid or expired OTP.",
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
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
            Verify your mobile number to
            activate your account.
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
            {success}
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
                  isLoading
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
                isLoading
              }
              autoFocus
              required
            />

            <p
              className={
                styles.helperText
              }
            >
              Enter the 6-digit verification
              code sent to your mobile number.
            </p>
          </div>

          <button
            className={
              styles.button
            }
            type="submit"
            disabled={
              isLoading
            }
          >
            {isLoading
              ? "Verifying..."
              : "Verify Account"}
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