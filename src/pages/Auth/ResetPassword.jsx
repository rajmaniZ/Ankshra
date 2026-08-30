import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  resetPassword,
} from "../../services/authService";

import styles from "./ResetPassword.module.css";

function ResetPassword() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    token,
    setToken,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const urlToken =
      searchParams.get("token");

    const savedToken =
      sessionStorage.getItem(
        "passwordResetToken",
      );

    setToken(
      urlToken ||
        savedToken ||
        "",
    );
  }, [searchParams]);

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (!token) {
        setError(
          "Password reset session is invalid or expired.",
        );

        return;
      }

      if (password.length < 8) {
        setError(
          "Password must contain at least 8 characters.",
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match.",
        );

        return;
      }

      try {
        setLoading(true);

        await resetPassword({
          token,
          password,
        });

        sessionStorage.removeItem(
          "passwordResetToken",
        );

        navigate(
          "/login",
          {
            replace: true,
            state: {
              message:
                "Your password has been reset successfully. Please sign in.",
            },
          },
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to reset your password.",
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
          Reset Password
        </h1>

        <p
          className={styles.subtitle}
        >
          Create a new password for your
          account.
        </p>

        {error && (
          <div
            className={styles.error}
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div
            className={styles.field}
          >
            <label
              className={styles.label}
              htmlFor="reset-password"
            >
              New Password
            </label>

            <input
              id="reset-password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={loading}
              autoFocus
              required
            />

            <p
              className={
                styles.helperText
              }
            >
              Use at least 8 characters.
            </p>
          </div>

          <div
            className={styles.field}
          >
            <label
              className={styles.label}
              htmlFor="reset-confirm-password"
            >
              Confirm New Password
            </label>

            <input
              id="reset-confirm-password"
              className={styles.input}
              type="password"
              value={
                confirmPassword
              }
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value,
                )
              }
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={loading}
              required
            />
          </div>

          <button
            className={styles.button}
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
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

export default ResetPassword;