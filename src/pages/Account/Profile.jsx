import {
  useEffect,
  useState,
} from "react";

import {
  FiCheck,
  FiEdit2,
} from "react-icons/fi";

import {
  useAuthContext,
} from "../../context/AuthContext";

import {
  getProfile,
  updateProfile,
} from "../../services/profileService";

import styles from "./Profile.module.css";

function getUser(response) {
  return (
    response?.data?.user ||
    response?.user ||
    response?.data ||
    null
  );
}

function Profile() {
  const {
    user,
  } = useAuthContext();

  const [
    formData,
    setFormData,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    whatsappNumber: "",
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
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
    let active = true;

    async function loadProfile() {
      try {
        const response =
          await getProfile();

        const profile =
          getUser(response);

        if (!active) {
          return;
        }

        if (profile) {
          setFormData({
            name:
              profile.name || "",
            email:
              profile.email || "",
            phone:
              profile.phone || "",
            whatsappNumber:
              profile.whatsappNumber ||
              "",
          });
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError?.message ||
              "Unable to load your profile.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData((current) => ({
      ...current,
      name:
        current.name ||
        user.name ||
        "",
      email:
        current.email ||
        user.email ||
        "",
      phone:
        current.phone ||
        user.phone ||
        "",
      whatsappNumber:
        current.whatsappNumber ||
        user.whatsappNumber ||
        "",
    }));
  }, [user]);

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name =
      formData.name.trim();

    if (name.length < 2) {
      setError(
        "Please enter your full name.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim(),
      )
    ) {
      setError(
        "Please enter a valid email address.",
      );
      return;
    }

    if (
      formData.phone &&
      !/^\+?[1-9]\d{7,14}$/.test(
        formData.phone.replace(
          /[\s()-]/g,
          "",
        ),
      )
    ) {
      setError(
        "Please enter a valid phone number.",
      );
      return;
    }

    try {
      setSaving(true);

      const response =
        await updateProfile({
          name,
          email:
            formData.email
              .trim()
              .toLowerCase(),
          phone:
            formData.phone.trim(),
          whatsappNumber:
            formData.whatsappNumber.trim(),
        });

      const updatedUser =
        getUser(response);

      if (updatedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(
            updatedUser,
          ),
        );

        window.dispatchEvent(
          new CustomEvent(
            "auth:user-updated",
            {
              detail:
                updatedUser,
            },
          ),
        );
      }

      setSuccess(
        "Profile updated successfully.",
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.state}>
        Loading profile...
      </div>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            Personal Information
          </span>

          <h2>
            Profile
          </h2>

          <p>
            Manage the information
            associated with your
            account.
          </p>
        </div>

        <div className={styles.icon}>
          <FiEdit2 size={18} />
        </div>
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
          <FiCheck size={16} />
          {success}
        </div>
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div className={styles.grid}>
          <div className={styles.field}>
            <label htmlFor="profile-name">
              Full Name
            </label>

            <input
              id="profile-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={
                handleChange
              }
              autoComplete="name"
              disabled={saving}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-email">
              Email Address
            </label>

            <input
              id="profile-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={
                handleChange
              }
              autoComplete="email"
              disabled={saving}
            />

            <span>
              Changing your email may
              require verification.
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-phone">
              Mobile Number
            </label>

            <input
              id="profile-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={
                handleChange
              }
              autoComplete="tel"
              disabled={saving}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="profile-whatsapp">
              WhatsApp Number
            </label>

            <input
              id="profile-whatsapp"
              name="whatsappNumber"
              type="tel"
              value={
                formData.whatsappNumber
              }
              onChange={
                handleChange
              }
              autoComplete="tel"
              disabled={saving}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Profile;