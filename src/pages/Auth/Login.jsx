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
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return "";
}

function getResponseData(response) {
  if (response?.data && typeof response.data === "object") {
    return response.data;
  }

  return {};
}

function getResponseMessage(response) {
  const data = getResponseData(response);
  return response?.message || data?.message || "";
}

function formatSeconds(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

function getCooldownAt(value, fallbackAt) {
  const timestamp = Number(value || 0);
  return timestamp > Date.now() ? timestamp : fallbackAt;
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    loginSendOtp,
    loginResendOtp,
    loginSendSmsOtp,
    loginVerifyOtp,
    loading: authLoading,
  } = useAuthContext();

  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpChannel, setOtpChannel] = useState("email");
  const [otpRecipient, setOtpRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [emailResendAt, setEmailResendAt] = useState(0);
  const [smsAvailableAt, setSmsAvailableAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  const isLoading = loading || resendLoading || smsLoading || authLoading;
  const emailRemaining = Math.max(0, emailResendAt - now);
  const smsRemaining = Math.max(0, smsAvailableAt - now);
  const canResendEmail = emailRemaining === 0 && !isLoading;
  const canSendSms = smsRemaining === 0 && !isLoading;

  useEffect(() => {
    if (emailResendAt <= Date.now() && smsAvailableAt <= Date.now()) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [emailResendAt, smsAvailableAt]);

  const getSafeRedirect = (loggedInUser) => {
    const role = String(loggedInUser?.role || "").trim().toLowerCase();

    if (role === "admin") return "/admin";

    const from = location.state?.from;
    const fromPath = from?.pathname || "";
    const fromSearch = from?.search || "";
    const fromHash = from?.hash || "";

    if (
      fromPath &&
      !fromPath.startsWith("/admin") &&
      fromPath !== "/login" &&
      fromPath !== "/register"
    ) {
      return `${fromPath}${fromSearch}${fromHash}`;
    }

    return "/";
  };

  const applyOtpResponse = (response, fallbackChannel = "email") => {
    const data = getResponseData(response);
    const channel = data.channel || fallbackChannel;
    const recipient = String(data.recipient || "").trim();
    const fallbackCooldownAt = Date.now() + 50 * 1000;
    const nextEmailResendAt = getCooldownAt(
      data.emailResendAt || data.canResendEmailAt,
      fallbackCooldownAt,
    );
    const nextSmsAvailableAt = getCooldownAt(
      data.smsAvailableAt || data.canSendSmsAt || data.canResendSmsAt,
      fallbackCooldownAt,
    );

    setOtpChannel(channel === "sms" ? "sms" : "email");
    setOtpRecipient(recipient);
    setEmailResendAt(nextEmailResendAt);
    setSmsAvailableAt(nextSmsAvailableAt);
    setNow(Date.now());

    return {
      channel,
      recipient,
      data,
    };
  };

  const handleMobileChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);
    setMobile(value);
    setError("");
    setMessage("");
  };

  const handleOtpChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
    setMessage("");
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanMobile = mobile.trim();
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    const internationalPhone = normalizePhone(cleanMobile);
    if (!internationalPhone) {
      setError("Unable to process this mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginSendOtp({
        identifier: internationalPhone,
      });

      const destination = applyOtpResponse(response, "email");

      setOtp("");
      setStep("otp");
      setMessage(
        getResponseMessage(response) ||
          `Verification OTP sent to ${destination.recipient || "your registered email address"}.`,
      );
    } catch (requestError) {
      const data = getResponseData(requestError?.data);

      if (data?.emailResendAt) {
        setEmailResendAt(Number(data.emailResendAt));
      }

      if (data?.smsAvailableAt) {
        setSmsAvailableAt(Number(data.smsAvailableAt));
      }

      setNow(Date.now());
      setError(requestError?.message || "Unable to send email OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (!canResendEmail) return;

    setError("");
    setMessage("");

    const internationalPhone = normalizePhone(mobile.trim());
    if (!internationalPhone) {
      setError("Unable to process this mobile number.");
      return;
    }

    try {
      setResendLoading(true);

      const response = await loginResendOtp({
        identifier: internationalPhone,
      });

      const destination = applyOtpResponse(response, "email");
      setOtpChannel("email");
      setOtpRecipient(destination.recipient);
      setOtp("");
      setMessage(
        getResponseMessage(response) ||
          "A new verification OTP was sent to your registered email address.",
      );
    } catch (requestError) {
      const data = getResponseData(requestError?.data);

      if (data?.emailResendAt) setEmailResendAt(Number(data.emailResendAt));
      if (data?.smsAvailableAt) setSmsAvailableAt(Number(data.smsAvailableAt));
      setNow(Date.now());
      setError(requestError?.message || "Unable to resend email OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSendSmsOtp = async () => {
    if (!canSendSms) return;

    setError("");
    setMessage("");

    const internationalPhone = normalizePhone(mobile.trim());
    if (!internationalPhone) {
      setError("Unable to process this mobile number.");
      return;
    }

    try {
      setSmsLoading(true);

      const response = await loginSendSmsOtp({
        identifier: internationalPhone,
      });

      const destination = applyOtpResponse(response, "sms");
      setOtpChannel("sms");
      setOtpRecipient(destination.recipient || internationalPhone);
      setOtp("");
      setMessage(
        getResponseMessage(response) ||
          "A verification OTP was sent to your mobile number.",
      );
    } catch (requestError) {
      const data = getResponseData(requestError?.data);

      if (data?.emailResendAt) setEmailResendAt(Number(data.emailResendAt));
      if (data?.smsAvailableAt) setSmsAvailableAt(Number(data.smsAvailableAt));
      setNow(Date.now());
      setError(requestError?.message || "Unable to send mobile OTP.");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const code = otp.trim();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    const internationalPhone = normalizePhone(mobile.trim());
    if (!internationalPhone) {
      setError("Unable to process this mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginVerifyOtp({
        identifier: internationalPhone,
        channel: otpChannel,
        recipient: otpRecipient,
        code,
      });

      const loggedInUser = response?.user || response?.data?.user || null;
      navigate(getSafeRedirect(loggedInUser), { replace: true });
    } catch (requestError) {
      setError(requestError?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setStep("mobile");
    setOtp("");
    setOtpChannel("email");
    setOtpRecipient("");
    setEmailResendAt(0);
    setSmsAvailableAt(0);
    setError("");
    setMessage("");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Welcome Back</span>
          <h1 className={styles.title}>Sign In</h1>
          <p className={styles.subtitle}>
            {step === "mobile"
              ? "Enter your mobile number to continue."
              : otpChannel === "email"
                ? "Enter the verification code sent to your registered email address."
                : "Enter the verification code sent to your mobile number."}
          </p>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className={styles.success} role="status">
            {message}
          </div>
        )}

        {step === "mobile" ? (
          <form className={styles.form} onSubmit={handleSendOtp}>
            <div className={styles.field}>
              <label htmlFor="login-mobile" className={styles.label}>
                Mobile Number
              </label>

              <div className={styles.phoneInput}>
                <span className={styles.countryCode}>+91</span>
                <input
                  id="login-mobile"
                  className={styles.input}
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  onChange={handleMobileChange}
                  placeholder="Enter mobile number"
                  autoComplete="tel"
                  maxLength={10}
                  disabled={isLoading}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button className={styles.button} type="submit" disabled={isLoading}>
              <span>{loading ? "Sending Email OTP..." : "Continue"}</span>
              {!loading && <FiArrowRight size={16} />}
            </button>

            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot Password?
            </Link>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleVerifyOtp}>
            <div className={styles.field}>
              <label htmlFor="login-otp" className={styles.label}>
                Verification Code
              </label>

              <input
                id="login-otp"
                className={styles.otpInput || styles.input}
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                autoComplete="one-time-code"
                maxLength={6}
                disabled={isLoading}
                autoFocus
                required
              />

              <p className={styles.helperText}>
                Enter the 6-digit verification code sent to {otpRecipient || "your registered email address"}.
              </p>
            </div>

            <button className={styles.button} type="submit" disabled={isLoading}>
              <span>{loading ? "Verifying..." : "Verify & Sign In"}</span>
              {!loading && <FiArrowRight size={16} />}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleResendEmailOtp}
              disabled={!canResendEmail}
            >
              {resendLoading
                ? "Sending Email OTP..."
                : emailRemaining > 0
                  ? `Resend Email OTP in ${formatSeconds(emailRemaining / 1000)}`
                  : "Resend OTP to Email"}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleSendSmsOtp}
              disabled={!canSendSms}
            >
              {smsLoading
                ? "Sending Mobile OTP..."
                : smsRemaining > 0
                  ? `Send OTP to Mobile in ${formatSeconds(smsRemaining / 1000)}`
                  : "Send OTP to Mobile"}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleChangeNumber}
              disabled={isLoading}
            >
              Change Number
            </button>
          </form>
        )}

        <p className={styles.footerText}>
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

