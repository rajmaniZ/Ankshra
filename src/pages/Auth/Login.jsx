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
  FiCheck,
  FiLock,
  FiPhone,
} from "react-icons/fi";

import {
  useAuthContext,
} from "../../context/AuthContext";

import styles from "./Login.module.css";

function Login() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    loginSendOtp,
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

  const isLoading =
    loading || authLoading;

  const getSafeRedirect =
    (loggedInUser) => {
      const role =
        String(
          loggedInUser?.role || "",
        )
          .trim()
          .toLowerCase();

      if (role === "admin") {
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

  const handleMobileChange = (
    event,
  ) => {
    const value =
      event.target.value.replace(
        /\D/g,
        "",
      );

    setMobile(
      value.slice(0, 10),
    );

    setError("");
    setMessage("");
  };

  const handleOtpChange = (
    event,
  ) => {
    const value =
      event.target.value.replace(
        /\D/g,
        "",
      );

    setOtp(
      value.slice(0, 6),
    );

    setError("");
    setMessage("");
  };

  const handleSendOtp =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      const value =
        mobile.trim();

      if (
        !/^[6-9]\d{9}$/.test(
          value,
        )
      ) {
        setError(
          "Enter a valid 10-digit mobile number.",
        );

        return;
      }

      const internationalPhone =
        `+91${value}`;

      try {
        setLoading(true);

        await loginSendOtp({
          identifier:
            internationalPhone,
          channel: "sms",
        });

        setOtp("");
        setStep("otp");

        setMessage(
          `OTP sent to ${internationalPhone}.`,
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to send OTP. Please try again.",
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

      const code =
        otp.trim();

      if (
        !/^\d{4,6}$/.test(
          code,
        )
      ) {
        setError(
          "Enter the OTP sent to your mobile.",
        );

        return;
      }

      const internationalPhone =
        `+91${mobile.trim()}`;

      try {
        setLoading(true);

        const response =
          await loginVerifyOtp({
            identifier:
              internationalPhone,
            channel: "sms",
            code,
          });

        const loggedInUser =
          response?.user;

        if (!loggedInUser) {
          throw new Error(
            "Unable to load your account. Please try again.",
          );
        }

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
      setError("");
      setMessage("");
    };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            {step === "mobile" ? (
              <FiPhone size={20} />
            ) : (
              <FiLock size={20} />
            )}
          </div>

          <span
            className={
              styles.eyebrow
            }
          >
            Welcome Back
          </span>

          <h1
            className={
              styles.title
            }
          >
            Sign In
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            {step === "mobile"
              ? "Sign in with your registered mobile number."
              : `Enter the verification code sent to +91 ${mobile}.`}
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
            <FiCheck size={15} />

            <span>
              {message}
            </span>
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
                {isLoading
                  ? "Sending OTP..."
                  : "Continue"}
              </span>

              {!isLoading && (
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
                  styles.input
                }
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={
                  handleOtpChange
                }
                placeholder="Enter OTP"
                autoComplete="one-time-code"
                maxLength={6}
                disabled={
                  isLoading
                }
                autoFocus
              />
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
                {isLoading
                  ? "Verifying..."
                  : "Verify & Sign In"}
              </span>

              {!isLoading && (
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