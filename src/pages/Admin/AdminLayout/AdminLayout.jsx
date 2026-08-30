import { useState } from "react";

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiBox,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiPercent,
  FiShoppingBag,
  FiStar,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useAuthContext } from "../../../context/AuthContext";

import styles from "./AdminLayout.module.css";

const menuGroups = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: FiHome,
        end: true,
      },
    ],
  },
  {
    title: "Store",
    items: [
      {
        label: "Products",
        path: "/admin/products",
        icon: FiBox,
      },
      {
        label: "Categories",
        path: "/admin/categories",
        icon: FiGrid,
      },
      {
        label: "Orders",
        path: "/admin/orders",
        icon: FiShoppingBag,
      },
    ],
  },
  {
    title: "Promotions",
    items: [
      {
        label: "Coupons",
        path: "/admin/coupons",
        icon: FiPercent,
      },
      {
        label: "Offers",
        path: "/admin/offers",
        icon: FiPercent,
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        label: "Users",
        path: "/admin/users",
        icon: FiUsers,
      },
      {
        label: "Reviews",
        path: "/admin/reviews",
        icon: FiStar,
      },
    ],
  },
];

function AdminLayout() {
  const navigate = useNavigate();

  const location = useLocation();

  const { user, logout } = useAuthContext();

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  const getInitial = () => {
    const name = user?.name || user?.email || "A";

    return name.trim().charAt(0).toUpperCase();
  };

  const getCurrentSection = () => {
    const pathname = location.pathname;

    if (pathname === "/admin" || pathname === "/admin/") {
      return "Dashboard";
    }

    if (pathname.startsWith("/admin/products")) {
      return "Products";
    }

    if (pathname.startsWith("/admin/categories")) {
      return "Categories";
    }

    if (pathname.startsWith("/admin/orders")) {
      return "Orders";
    }

    if (pathname.startsWith("/admin/users")) {
      return "Users";
    }

    if (pathname.startsWith("/admin/reviews")) {
      return "Reviews";
    }

    if (pathname.startsWith("/admin/coupons")) {
      return "Coupons";
    }

    if (pathname.startsWith("/admin/offers")) {
      return "Offers";
    }

    return "Administration";
  };

  return (
    <div className={styles.layout}>
      {mobileOpen && (
        <button
          type="button"
          className={styles.overlay}
          onClick={closeMobileMenu}
          aria-label="Close admin navigation"
        />
      )}

      <aside
        className={
          mobileOpen
            ? `${styles.sidebar} ${styles.sidebarOpen}`
            : styles.sidebar
        }
      >
        <div className={styles.brand}>
          <Link
            to="/admin"
            className={styles.brandLink}
            onClick={closeMobileMenu}
          >
            <span className={styles.brandName}>ankshra jewellary</span>

            <span className={styles.brandLabel}>ADMIN PANEL</span>
          </Link>

          <button
            type="button"
            className={styles.mobileClose}
            onClick={closeMobileMenu}
            aria-label="Close navigation"
          >
            <FiX size={19} />
          </button>
        </div>

        <div className={styles.adminProfile}>
          <div className={styles.avatar}>{getInitial()}</div>

          <div className={styles.profileInfo}>
            <strong>{user?.name || "Administrator"}</strong>

            <span>{user?.email || ""}</span>
          </div>
        </div>

        <nav className={styles.navigation} aria-label="Admin navigation">
          {menuGroups.map((group) => (
            <div key={group.title} className={styles.menuGroup}>
              <span className={styles.groupTitle}>{group.title}</span>

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.navLink} ${styles.active}`
                        : styles.navLink
                    }
                  >
                    <Icon size={17} />

                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <Link to="/" className={styles.storeLink} onClick={closeMobileMenu}>
            View Store
          </Link>

          <button
            type="button"
            className={styles.logout}
            onClick={handleLogout}
          >
            <FiLogOut size={17} />

            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin navigation"
          >
            <FiMenu size={21} />
          </button>

          <div className={styles.topbarTitle}>
            <span>Administration</span>

            <strong>{getCurrentSection()}</strong>
          </div>

          <div className={styles.topbarUser}>
            {user?.name || user?.email || "Administrator"}
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
