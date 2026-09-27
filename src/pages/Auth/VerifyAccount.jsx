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
    success,
    setSuccess,
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
    const savedPhone =
      localStorage.getItem(
        "registrationPhone",
      );

    if (savedPhone) {
      setPhone(
        savedPhone
          .replace(/^\+91/, "")
          .replace(/\D/g, "")
          .slice(-10),
      );
    }

    const savedEmail =
      localStorage.getItem(
        "registrationEmail",
      );

    const savedChannel =
      localStorage.getItem(
        "registrationOtpChannel",
      ) || "email";

    const savedRecipient =
      localStorage.getItem(
        "registrationOtpRecipient",
      ) || savedEmail || "";

    setOtpChannel(
      savedChannel === "sms"
        ? "sms"
        : "email",
    );

    setRecipient(
      savedRecipient,
    );

    const savedEmailAvailableAt =
      Number(
        localStorage.getItem(
          "registrationEmailAvailableAt",
        ) || 0,
      );

    const savedSmsAvailableAt =
      Number(
        localStorage.getItem(
          "registrationSmsAvailableAt",
        ) || 0,
      );

    setEmailAvailableAt(
      savedEmailAvailableAt,
    );

    setSmsAvailableAt(
      savedSmsAvailableAt,
    );
  }, []);

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

  const applyResponse = (
    response,
    fallbackChannel = "email",
  ) => {
    const data =
      getResponseData(response);

    const channel =
      data.channel ||
      fallbackChannel;

    const recipientValue =
      data.recipient ||
      (
        channel === "email"
          ? localStorage.getItem(
              "registrationEmail",
            ) || ""
          : normalizePhone(phone)
      );

    const safeChannel =
      channel === "sms"
        ? "sms"
        : "email";

    setOtpChannel(
      safeChannel,
    );

    setRecipient(
      recipientValue,
    );

    setOtp("");

    const nextEmailAt =
      Number(
        data.canResendEmailAt ||
          0,
      );

    const nextSmsAt =
      Number(
        (
          data.canSendSmsAt ||
          data.canResendSmsAt ||
          0
        ),
      );

    setEmailAvailableAt(
      nextEmailAt,
    );

    setSmsAvailableAt(
      nextSmsAt,
    );

    localStorage.setItem(
      "registrationOtpChannel",
      safeChannel,
    );

    localStorage.setItem(
      "registrationOtpRecipient",
      recipientValue,
    );

    localStorage.setItem(
      "registrationEmailAvailableAt",
      String(
        nextEmailAt,
      ),
    );

    localStorage.setItem(
      "registrationSmsAvailableAt",
      String(
        nextSmsAt,
      ),
    );

    setSuccess(
      getResponseMessage(response) ||
        (
          safeChannel === "email"
            ? "Verification code sent to your email."
            : "Verification code sent to your mobile."
        ),
    );
  };

  const handleVerify =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !/^[6-9]\d{9}$/.test(
          phone.trim(),
        )
      ) {
        setError(
          "Please enter a valid 10-digit mobile number.",
        );
        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        setError(
          "Please enter the 6-digit verification code.",
        );
        return;
      }

      const internationalPhone =
        normalizePhone(
          phone.trim(),
        );

      if (!internationalPhone) {
        setError(
          "Please enter a valid mobile number.",
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await verifyRegister({
            phone:
              internationalPhone,
            channel:
              otpChannel,
            recipient:
              recipient ||
              (
                otpChannel === "email"
                  ? localStorage.getItem(
                      "registrationEmail",
                    )
                  : internationalPhone
              ),
            code: otp.trim(),
          });

        const token =
          response?.data?.token ||
          response?.token ||
          null;

        const user =
          response?.data?.user ||
          response?.user ||
          null;

        if (token) {
          localStorage.setItem(
            "accessToken",
            token,
          );
        }

        if (user) {
          localStorage.setItem(
            "user",
            JSON.stringify(user),
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
          "registrationEmailAvailableAt",
        );
        localStorage.removeItem(
          "registrationSmsAvailableAt",
        );

        navigate(
          "/",
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

  const handleOtpAction =
    async (channel) => {
      setError("");
      setSuccess("");

      const internationalPhone =
        normalizePhone(
          phone.trim(),
        );

      if (!internationalPhone) {
        setError(
          "Please enter a valid mobile number.",
        );
        return;
      }

      if (
        channel === "email" &&
        emailSeconds > 0
      ) {
        return;
      }

      if (
        channel === "sms" &&
        smsSeconds > 0
      ) {
        return;
      }

      try {
        setActionLoading(channel);

        const response =
          await resendRegistrationOtp({
            phone:
              internationalPhone,
            channel,
            recipient:
              channel === "email"
                ? (
                  recipient ||
                  localStorage.getItem(
                    "registrationEmail",
                  )
                )
                : internationalPhone,
          });

        applyResponse(
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

  const handleChangeRegistration =
    () => {
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
        "registrationEmailAvailableAt",
      );
      localStorage.removeItem(
        "registrationSmsAvailableAt",
      );

      navigate(
        "/register",
        {
          replace: true,
        },
      );
    };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            Almost There
          </span>

          <h1 className={styles.title}>
            Verify Account
          </h1>

          <p className={styles.subtitle}>
            {otpChannel === "email"
              ? `Enter the OTP sent to ${
                  recipient ||
                  "your registered email"
                }.`
              : "Enter the OTP sent to your mobile number."}
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

        {success && (
          <div
            className={styles.success}
            role="status"
          >
            {success}
          </div>
        )}

        <form
          className={styles.form}
          onSubmit={handleVerify}
        >
          <div className={styles.field}>
            <label
              htmlFor="verify-phone"
              className={styles.label}
            >
              Mobile Number
            </label>

            <div className={styles.phoneInput}>
              <span className={styles.countryCode}>
                +91
              </span>

              <input
                id="verify-phone"
                className={styles.input}
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => {
                  setPhone(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10),
                  );
                  setError("");
                }}
                placeholder="Enter mobile number"
                autoComplete="tel"
                maxLength={10}
                disabled={isBusy}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label
              htmlFor="verify-otp"
              className={styles.label}
            >
              Verification Code
            </label>

            <input
              id="verify-otp"
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
                setSuccess("");
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
              {otpChannel === "email"
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
              : "Verify Account"}
          </button>

          <div className={styles.secondaryButton}>
            {emailSeconds > 0 ? (
              <span>
                Resend email in{" "}
                {emailSeconds}s
              </span>
            ) : (
              <button
                type="button"
                className={styles.secondaryAction}
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
          </div>

          <div className={styles.secondaryButton}>
            {smsSeconds > 0 ? (
              <span>
                Mobile OTP available in{" "}
                {smsSeconds}s
              </span>
            ) : (
              <button
                type="button"
                className={styles.secondaryAction}
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
          </div>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={
              handleChangeRegistration
            }
            disabled={isBusy}
          >
            Change Registration Details
          </button>
        </form>

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

export default VerifyAccount;
