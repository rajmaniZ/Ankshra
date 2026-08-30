import {
  FiArrowRight,
  FiHeart,
  FiMapPin,
  FiPackage,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import {
  Link,
} from "react-router-dom";

import {
  useAuthContext,
} from "../../context/AuthContext";

import styles from "./AccountOverview.module.css";

function AccountOverview() {
  const {
    user,
  } = useAuthContext();

  const firstName =
    user?.name
      ?.trim()
      ?.split(" ")[0] ||
    "there";

  return (
    <div className={styles.page}>
      <div className={styles.welcomeCard}>
        <div>
          <span className={styles.eyebrow}>
            Account Overview
          </span>

          <h2 className={styles.title}>
            Hello, {firstName}
          </h2>

          <p className={styles.description}>
            From your account dashboard you
            can view your recent orders, manage
            your addresses, update your profile
            and more.
          </p>
        </div>

        <div className={styles.avatar}>
          {(user?.name || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
      </div>

      <div className={styles.grid}>
        <Link
          to="/account/profile"
          className={styles.card}
        >
          <div className={styles.icon}>
            <FiUser size={20} />
          </div>

          <div className={styles.cardContent}>
            <h3>My Profile</h3>

            <p>
              View and update your personal
              information.
            </p>
          </div>

          <FiArrowRight
            className={styles.arrow}
            size={17}
          />
        </Link>

        <Link
          to="/account/orders"
          className={styles.card}
        >
          <div className={styles.icon}>
            <FiPackage size={20} />
          </div>

          <div className={styles.cardContent}>
            <h3>My Orders</h3>

            <p>
              View your orders and track your
              purchases.
            </p>
          </div>

          <FiArrowRight
            className={styles.arrow}
            size={17}
          />
        </Link>

        <Link
          to="/account/addresses"
          className={styles.card}
        >
          <div className={styles.icon}>
            <FiMapPin size={20} />
          </div>

          <div className={styles.cardContent}>
            <h3>My Addresses</h3>

            <p>
              Manage your delivery and billing
              addresses.
            </p>
          </div>

          <FiArrowRight
            className={styles.arrow}
            size={17}
          />
        </Link>

        <Link
          to="/account/wishlist"
          className={styles.card}
        >
          <div className={styles.icon}>
            <FiHeart size={20} />
          </div>

          <div className={styles.cardContent}>
            <h3>My Wishlist</h3>

            <p>
              View the jewellery products you
              have saved.
            </p>
          </div>

          <FiArrowRight
            className={styles.arrow}
            size={17}
          />
        </Link>

        <Link
          to="/account/settings"
          className={styles.card}
        >
          <div className={styles.icon}>
            <FiSettings size={20} />
          </div>

          <div className={styles.cardContent}>
            <h3>Account Settings</h3>

            <p>
              Manage your password and account
              preferences.
            </p>
          </div>

          <FiArrowRight
            className={styles.arrow}
            size={17}
          />
        </Link>
      </div>

      <div className={styles.infoCard}>
        <div>
          <span className={styles.infoLabel}>
            Account Email
          </span>

          <span className={styles.infoValue}>
            {user?.email || "Not available"}
          </span>
        </div>

        <div>
          <span className={styles.infoLabel}>
            Mobile Number
          </span>

          <span className={styles.infoValue}>
            {user?.phone
              ? `+91 ${user.phone}`
              : "Not available"}
          </span>
        </div>

        <Link
          to="/account/profile"
          className={styles.profileLink}
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

export default AccountOverview;