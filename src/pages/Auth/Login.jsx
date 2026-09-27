import {
  useEffect,
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

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

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
  ] = useState("email");

  const [
    otpRecipient,
    setOtpRecipient,
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

  const isBusy =
    loading ||
    actionLoading !== "" ||
    authLoading;

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

  useEffect(() => {
    const savedMobile =
      localStorage.getItem(
        "loginMobile",
      );

    if (savedMobile) {
      setMobile(savedMobile);
    }
  }, []);

  const applyOtpResponse = (
    response,
    fallbackChannel = "email",
  ) => {
    const data =
      getResponseData(response);

    const channel =
      data.channel ||
      fallbackChannel;

    const recipient =
      data.recipient ||
      "";

    setOtpChannel(channel);
    setOtpRecipient(recipient);
    setOtp("");

    if (data.canResendEmailAt) {
      setEmailAvailableAt(
        Number(
          data.canResendEmailAt,
        ),
      );
    }

    if (data.canSendSmsAt) {
      setSmsAvailableAt(
        Number(
          data.canSendSmsAt,
        ),
      );
    }

    if (data.canResendSmsAt) {
      setSmsAvailableAt(
        Number(
          data.canResendSmsAt,
        ),
      );
    }

    localStorage.setItem(
      "loginMobile",
      normalizePhone(mobile),
    );

    localStorage.setItem(
      "loginOtpChannel",
      channel,
    );

    localStorage.setItem(
      "loginOtpRecipient",
      recipient,
    );

    setStep("otp");

    setMessage(
      getResponseMessage(response) ||
        (
          channel === "email"
            ? "Verification code sent to your registered email address."
            : "Verification code sent to your mobile number."
        ),
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
            channel: "email",
          });

        applyOtpResponse(
          response,
          "email",
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to send email OTP. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

  const handleOtpAction =
    async (channel) => {
      setError("");
      setMessage("");

      const internationalPhone =
        normalizePhone(
          mobile.trim(),
        );

      if (!internationalPhone) {
        setError(
          "Please enter a valid mobile number.",
        );
        return;
      }

      if (channel === "email" && emailSeconds > 0) {
        return;
      }

      if (channel === "sms" && smsSeconds > 0) {
        return;
      }

      try {
        setActionLoading(channel);

        const response =
          await loginResendOtp({
            identifier:
              internationalPhone,
            channel,
            recipient:
              channel === "email"
                ? otpRecipient
                : internationalPhone,
          });

        applyOtpResponse(
          response,
          channel,
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            (
              channel === "email"
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

      try {
        setLoading(true);

        const response =
          await loginVerifyOtp({
            identifier:
              internationalPhone,
            channel:
              otpChannel,
            recipient:
              otpRecipient ||
              (
                otpChannel === "email"
                  ? ""
                  : internationalPhone
              ),
            code: otp.trim(),
          });

        const user =
          response?.user ||
          response?.data?.user ||
          null;

        const redirectPath =
          user?.role === "admin"
            ? "/admin"
            : (
              location.state
                ?.from?.pathname ||
              "/"
            );

        localStorage.removeItem(
          "loginMobile",
        );
        localStorage.removeItem(
          "loginOtpChannel",
        );
        localStorage.removeItem(
          "loginOtpRecipient",
        );

        navigate(
          redirectPath,
          {
            replace: true,
          },
        );
      } catch (requestError) {
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
      setOtpChannel("email");
      setOtpRecipient("");
      setEmailAvailableAt(0);
      setSmsAvailableAt(0);
      setError("");
      setMessage("");
    };

  const maskedRecipient =
    otpRecipient || "your registered email address";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            Welcome Back
          </span>

          <h1 className={styles.title}>
            Sign In
          </h1>

          <p className={styles.subtitle}>
            {step === "mobile"
              ? "Enter your mobile number. We will send the first OTP to your registered email."
              : otpChannel === "email"
                ? `Enter the verification code sent to ${maskedRecipient}.`
                : "Enter the verification code sent to your mobile number."}
          </p>
        </div>

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

        {step === "mobile" ? (
          <form
            className={styles.form}
            onSubmit={handleSendOtp}
          >
            <div className={styles.field}>
              <label
                htmlFor="login-mobile"
                className={styles.label}
              >
                Mobile Number
              </label>

              <div className={styles.phoneInput}>
                <span className={styles.countryCode}>
                  +91
                </span>

                <input
                  id="login-mobile"
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={(event) => {
                    setMobile(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    );
                    setError("");
                    setMessage("");
                  }}
                  placeholder="Enter mobile number"
                  autoComplete="tel"
                  maxLength={10}
                  disabled={isBusy}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              className={styles.button}
              type="submit"
              disabled={isBusy}
            >
              <span>
                {loading
                  ? "Sending Email OTP..."
                  : "Continue"}
              </span>

              {!loading && (
                <FiArrowRight size={16} />
              )}
            </button>

            <Link
              to="/forgot-password"
              className={styles.forgotPassword}
            >
              Forgot Password?
            </Link>
          </form>
        ) : (
          <form
            className={styles.form}
            onSubmit={handleVerifyOtp}
          >
            <div className={styles.field}>
              <label
                htmlFor="login-otp"
                className={styles.label}
              >
                Verification Code
              </label>

              <input
                id="login-otp"
                className={styles.input}
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
                {otpChannel === "email"
                  ? `Email OTP: ${maskedRecipient}`
                  : `Mobile OTP: +91 ${mobile}`}
              </p>
            </div>

            <button
              className={styles.button}
              type="submit"
              disabled={isBusy}
            >
              {loading
                ? "Verifying..."
                : "Verify & Sign In"}
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
              onClick={handleChangeNumber}
              disabled={isBusy}
            >
              Change Mobile Number
            </button>
          </form>
        )}

        <p className={styles.footerText}>
          New to Ankshra Jewellery?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
