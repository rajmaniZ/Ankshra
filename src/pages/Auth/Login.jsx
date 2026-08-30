import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiArrowRight,
} from "react-icons/fi";

import {
  useAuthContext,
} from "../../context/AuthContext";

import styles from "./Login.module.css";

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

function getResponseData(
  response,
) {
  if (
    response?.data &&
    typeof response.data === "object"
  ) {
    return response.data;
  }

  return {};
}

function normalizeChannel(
  value,
) {
  const channel =
    String(value || "")
      .trim()
      .toLowerCase();

  if (
    channel === "email"
  ) {
    return "email";
  }

  if (
    channel === "whatsapp"
  ) {
    return "whatsapp";
  }

  return "sms";
}

function getResponseMessage(
  response,
) {
  const data =
    getResponseData(response);

  return (
    response?.message ||
    data?.message ||
    ""
  );
}

function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    loginSendOtp,
    loginResendOtp,
    loginVerifyOtp,
    loading: authLoading,
  } = useAuthContext();

  const [
    step,
    setStep,
  ] = useState("mobile");

  const [
    mobile,
    setMobile,
  ] = useState("");

  const [
    otp,
    setOtp,
  ] = useState("");

  const [
    otpChannel,
    setOtpChannel,
  ] = useState("sms");

  const [
    otpRecipient,
    setOtpRecipient,
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

  const isLoading =
    loading ||
    resendLoading ||
    authLoading;

  const getSafeRedirect =
    (loggedInUser) => {
      const role =
        String(
          loggedInUser?.role || "",
        )
          .trim()
          .toLowerCase();

      if (
        role === "admin"
      ) {
        return "/admin";
      }

      const from =
        location.state?.from;

      const fromPath =
        from?.pathname || "";

      const fromSearch =
        from?.search || "";

      const fromHash =
        from?.hash || "";

      if (
        fromPath &&
        !fromPath.startsWith(
          "/admin",
        ) &&
        fromPath !== "/login" &&
        fromPath !== "/register"
      ) {
        return `${fromPath}${fromSearch}${fromHash}`;
      }

      return "/";
    };

  const handleMobileChange =
    (event) => {
      const value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 10);

      setMobile(value);
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

  const updateOtpDestination =
    (
      response,
      fallbackChannel = "sms",
      fallbackRecipient = "",
    ) => {
      const data =
        getResponseData(response);

      const returnedChannel =
        normalizeChannel(
          data.channel ||
            response?.channel ||
            fallbackChannel,
        );

      const returnedRecipient =
        String(
          data.recipient ||
            response?.recipient ||
            fallbackRecipient ||
            "",
        ).trim();

      setOtpChannel(
        returnedChannel,
      );

      setOtpRecipient(
        returnedRecipient,
      );

      return {
        channel:
          returnedChannel,
        recipient:
          returnedRecipient,
      };
    };

  const getOtpRecipientText =
    () => {
      if (
        otpChannel === "email"
      ) {
        return (
          otpRecipient ||
          "your registered email address"
        );
      }

      if (
        otpChannel === "whatsapp"
      ) {
        return (
          otpRecipient ||
          `+91 ${mobile}`
        );
      }

      return (
        otpRecipient ||
        `+91 ${mobile}`
      );
    };

  const handleSendOtp =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      const cleanMobile =
        mobile.trim();

      if (
        !/^[6-9]\d{9}$/.test(
          cleanMobile,
        )
      ) {
        setError(
          "Enter a valid 10-digit mobile number.",
        );

        return;
      }

      const internationalPhone =
        normalizePhone(
          cleanMobile,
        );

      if (!internationalPhone) {
        setError(
          "Unable to process this mobile number.",
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await loginSendOtp({
            identifier:
              internationalPhone,
            channel:
              "sms",
          });

        const destination =
          updateOtpDestination(
            response,
            "sms",
            internationalPhone,
          );

        setOtp("");
        setStep("otp");

        if (
          destination.channel ===
          "email"
        ) {
          setMessage(
            destination.recipient
              ? `Verification code sent to ${destination.recipient}.`
              : "SMS was unavailable. Verification code sent to your registered email address.",
          );
        } else if (
          destination.channel ===
          "whatsapp"
        ) {
          setMessage(
            destination.recipient
              ? `Verification code sent to ${destination.recipient} on WhatsApp.`
              : "Verification code sent to your WhatsApp number.",
          );
        } else {
          setMessage(
            destination.recipient
              ? `Verification code sent to ${destination.recipient}.`
              : `Verification code sent to ${internationalPhone}.`,
          );
        }
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
            "Unable to send OTP. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleResendOtp =
    async () => {
      setError("");
      setMessage("");

      const cleanMobile =
        mobile.trim();

      if (
        !/^[6-9]\d{9}$/.test(
          cleanMobile,
        )
      ) {
        setError(
          "Enter a valid 10-digit mobile number.",
        );

        return;
      }

      const internationalPhone =
        normalizePhone(
          cleanMobile,
        );

      if (!internationalPhone) {
        setError(
          "Unable to process this mobile number.",
        );

        return;
      }

      try {
        setResendLoading(true);

        /*
         * Always resend using the original
         * mobile identifier.
         *
         * The backend decides whether the
         * OTP is delivered by SMS or falls
         * back to the registered email.
         */
        const response =
          await loginResendOtp({
            identifier:
              internationalPhone,
            channel:
              "sms",
          });

        const destination =
          updateOtpDestination(
            response,
            "sms",
            internationalPhone,
          );

        setOtp("");

        if (
          destination.channel ===
          "email"
        ) {
          setMessage(
            destination.recipient
              ? `New verification code sent to ${destination.recipient}.`
              : "SMS was unavailable. New verification code sent to your registered email address.",
          );
        } else if (
          destination.channel ===
          "whatsapp"
        ) {
          setMessage(
            destination.recipient
              ? `New verification code sent to ${destination.recipient} on WhatsApp.`
              : "New verification code sent to your WhatsApp number.",
          );
        } else {
          setMessage(
            destination.recipient
              ? `New verification code sent to ${destination.recipient}.`
              : `New verification code sent to ${internationalPhone}.`,
          );
        }
      } catch (
        requestError
      ) {
        setError(
          requestError?.message ||
            "Unable to resend OTP. Please try again.",
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

      const code =
        otp.trim();

      if (
        !/^\d{6}$/.test(code)
      ) {
        setError(
          "Enter the 6-digit verification code.",
        );

        return;
      }

      const internationalPhone =
        normalizePhone(
          mobile.trim(),
        );

      if (!internationalPhone) {
        setError(
          "Unable to process this mobile number.",
        );

        return;
      }

      /*
       * IMPORTANT:
       *
       * identifier remains the original
       * phone number used to find the account.
       *
       * channel and recipient are the actual
       * destination returned by the backend.
       *
       * Example:
       *
       * identifier = +919999999999
       * channel    = email
       * recipient  = user@gmail.com
       *
       * This allows an email fallback OTP
       * to be verified against the email OTP,
       * while still logging into the account
       * found through the phone number.
       */
      const requestData = {
        identifier:
          internationalPhone,
        channel:
          normalizeChannel(
            otpChannel,
          ),
        recipient:
          otpRecipient ||
          internationalPhone,
        code,
      };

      try {
        setLoading(true);

        const response =
          await loginVerifyOtp(
            requestData,
          );

        const loggedInUser =
          response?.user ||
          response?.data?.user ||
          null;

        const redirectPath =
          getSafeRedirect(
            loggedInUser,
          );

        navigate(
          redirectPath,
          {
            replace: true,
          },
        );
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

  const handleChangeNumber =
    () => {
      setStep("mobile");
      setOtp("");
      setOtpChannel("sms");
      setOtpRecipient("");
      setError("");
      setMessage("");
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
            Welcome Back
          </span>

          <h1
            className={styles.title}
          >
            Sign In
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            {step === "mobile"
              ? "Enter your mobile number to continue."
              : otpChannel === "email"
                ? "Enter the verification code sent to your registered email address."
                : otpChannel === "whatsapp"
                  ? "Enter the verification code sent to your WhatsApp number."
                  : "Enter the verification code sent to your mobile number."}
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

        {step === "mobile" ? (
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
                htmlFor="login-mobile"
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
                  id="login-mobile"
                  className={
                    styles.input
                  }
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={
                    handleMobileChange
                  }
                  placeholder="Enter mobile number"
                  autoComplete="tel"
                  maxLength={10}
                  disabled={
                    isLoading
                  }
                  autoFocus
                  required
                />
              </div>
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
              <span>
                {loading
                  ? "Sending OTP..."
                  : "Continue"}
              </span>

              {!loading && (
                <FiArrowRight
                  size={16}
                />
              )}
            </button>

            <Link
              to="/forgot-password"
              className={
                styles.forgotPassword
              }
            >
              Forgot Password?
            </Link>
          </form>
        ) : (
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
                htmlFor="login-otp"
                className={
                  styles.label
                }
              >
                Verification Code
              </label>

              <input
                id="login-otp"
                className={
                  styles.otpInput ||
                  styles.input
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
                Enter the 6-digit
                verification code sent
                to{" "}
                {getOtpRecipientText()}.
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
              <span>
                {loading
                  ? "Verifying..."
                  : "Verify & Sign In"}
              </span>

              {!loading && (
                <FiArrowRight
                  size={16}
                />
              )}
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
                isLoading
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
                handleChangeNumber
              }
              disabled={
                isLoading
              }
            >
              Change Number
            </button>
          </form>
        )}

        <p
          className={
            styles.footerText
          }
        >
          Don't have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;