import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuthContext,
} from "../../context/AuthContext";

import styles from "./Register.module.css";

function Register() {
  const navigate =
    useNavigate();

  const {
    register,
    loading: authLoading,
  } = useAuthContext();

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const isLoading =
    loading || authLoading;

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    if (name === "phone") {
      const phone =
        value
          .replace(/\D/g, "")
          .slice(0, 10);

      setFormData(
        (current) => ({
          ...current,
          phone,
        }),
      );
    } else {
      setFormData(
        (current) => ({
          ...current,
          [name]: value,
        }),
      );
    }

    setError("");
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const name =
        formData.name.trim();

      const email =
        formData.email
          .trim()
          .toLowerCase();

      const phone =
        formData.phone.trim();

      const password =
        formData.password;

      const confirmPassword =
        formData.confirmPassword;

      if (name.length < 2) {
        setError(
          "Please enter your full name.",
        );

        return;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email,
        )
      ) {
        setError(
          "Please enter a valid email address.",
        );

        return;
      }

      if (
        !/^[6-9]\d{9}$/.test(
          phone,
        )
      ) {
        setError(
          "Please enter a valid 10-digit mobile number.",
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

      const internationalPhone =
        `+91${phone}`;

      try {
        setLoading(true);

        const response =
          await register({
            name,
            email,
            phone:
              internationalPhone,
            password,
          });

        const registrationData =
          response?.data || {};

        const channel =
          registrationData.channel ||
          response?.channel ||
          "email";

        const recipient =
          registrationData.recipient ||
          response?.recipient ||
          email;

        localStorage.setItem(
          "registrationPhone",
          internationalPhone,
        );

        localStorage.setItem(
          "registrationEmail",
          email,
        );

        localStorage.setItem(
          "registrationChannel",
          channel,
        );

        localStorage.setItem(
          "registrationRecipient",
          recipient,
        );

        navigate(
          "/verify-account",
        );
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to create your account.",
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
            Join Us
          </span>

          <h1
            className={
              styles.title
            }
          >
            Create Account
          </h1>

          <p
            className={
              styles.subtitle
            }
          >
            Create your account to enjoy
            a seamless jewellery shopping
            experience.
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
              htmlFor="register-name"
              className={
                styles.label
              }
            >
              Full Name
            </label>

            <input
              id="register-name"
              className={
                styles.input
              }
              name="name"
              type="text"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Enter your full name"
              autoComplete="name"
              disabled={
                isLoading
              }
              required
            />
          </div>

          <div
            className={
              styles.field
            }
          >
            <label
              htmlFor="register-email"
              className={
                styles.label
              }
            >
              Email Address
            </label>

            <input
              id="register-email"
              className={
                styles.input
              }
              name="email"
              type="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter your email address"
              autoComplete="email"
              disabled={
                isLoading
              }
              required
            />
          </div>

          <div
            className={
              styles.field
            }
          >
            <label
              htmlFor="register-phone"
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
                id="register-phone"
                className={
                  styles.input
                }
                name="phone"
                type="tel"
                inputMode="numeric"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
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
              htmlFor="register-password"
              className={
                styles.label
              }
            >
              Password
            </label>

            <input
              id="register-password"
              className={
                styles.input
              }
              name="password"
              type="password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={
                isLoading
              }
              minLength={8}
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
            className={
              styles.field
            }
          >
            <label
              htmlFor="register-confirm-password"
              className={
                styles.label
              }
            >
              Confirm Password
            </label>

            <input
              id="register-confirm-password"
              className={
                styles.input
              }
              name="confirmPassword"
              type="password"
              value={
                formData.confirmPassword
              }
              onChange={
                handleChange
              }
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={
                isLoading
              }
              minLength={8}
              required
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
            {isLoading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p
          className={
            styles.terms
          }
        >
          By creating an account, you agree
          to our terms and conditions.
        </p>

        <div
          className={
            styles.divider
          }
        >
          <span>
            Already have an account?
          </span>
        </div>

        <Link
          to="/login"
          className={
            styles.loginLink
          }
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default Register;