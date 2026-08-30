// import {
//   Link,
//   Outlet,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";

// import {
//   FiHeart,
//   FiHome,
//   FiLogOut,
//   FiMapPin,
//   FiPackage,
//   FiSettings,
//   FiUser,
// } from "react-icons/fi";

// import {
//   useAuthContext,
// } from "../../context/AuthContext";

// import styles from "./Account.module.css";

// const menuItems = [
//   {
//     label: "Overview",
//     path: "/account",
//     icon: FiHome,
//   },
//   {
//     label: "Profile",
//     path: "/account/profile",
//     icon: FiUser,
//   },
//   {
//     label: "Orders",
//     path: "/account/orders",
//     icon: FiPackage,
//   },
//   {
//     label: "Addresses",
//     path: "/account/addresses",
//     icon: FiMapPin,
//   },
//   {
//     label: "Wishlist",
//     path: "/account/wishlist",
//     icon: FiHeart,
//   },
//   {
//     label: "Account Settings",
//     path: "/account/settings",
//     icon: FiSettings,
//   },
// ];

// function Account() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const {
//     user,
//     logout,
//   } = useAuthContext();

//   const handleLogout = () => {
//     logout();
//     navigate("/login", {
//       replace: true,
//     });
//   };

//   return (
//     <div className={styles.page}>
//       <div className={styles.container}>
//         <div className={styles.header}>
//           <span className={styles.eyebrow}>
//             My Account
//           </span>

//           <h1 className={styles.title}>
//             Welcome, {user?.name || "there"}
//           </h1>

//           <p className={styles.subtitle}>
//             Manage your profile, orders,
//             addresses and account settings.
//           </p>
//         </div>

//         <div className={styles.layout}>
//           <aside className={styles.sidebar}>
//             <div className={styles.userCard}>
//               <div className={styles.avatar}>
//                 {(user?.name || "U")
//                   .charAt(0)
//                   .toUpperCase()}
//               </div>

//               <div>
//                 <strong>
//                   {user?.name || "User"}
//                 </strong>

//                 <span>
//                   {user?.phone || user?.email}
//                 </span>
//               </div>
//             </div>

//             <nav className={styles.navigation}>
//               {menuItems.map(
//                 ({
//                   label,
//                   path,
//                   icon: Icon,
//                 }) => {
//                   const active =
//                     location.pathname ===
//                     path;

//                   return (
//                     <Link
//                       key={path}
//                       to={path}
//                       className={
//                         active
//                           ? `${styles.link} ${styles.active}`
//                           : styles.link
//                       }
//                     >
//                       <Icon size={17} />

//                       <span>
//                         {label}
//                       </span>
//                     </Link>
//                   );
//                 },
//               )}

//               <button
//                 type="button"
//                 className={styles.logout}
//                 onClick={
//                   handleLogout
//                 }
//               >
//                 <FiLogOut size={17} />

//                 <span>
//                   Sign Out
//                 </span>
//               </button>
//             </nav>
//           </aside>

//           <main className={styles.content}>
//             <Outlet />
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Account;
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FiHeart,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiPackage,
  FiSettings,
  FiUser,
} from "react-icons/fi";

import {
  useAuthContext,
} from "../../context/AuthContext";

import styles from "./Account.module.css";

const menuItems = [
  {
    label: "Overview",
    path: "/account",
    icon: FiHome,
  },
  {
    label: "Profile",
    path: "/account/profile",
    icon: FiUser,
  },
  {
    label: "Orders",
    path: "/account/orders",
    icon: FiPackage,
  },
  {
    label: "Addresses",
    path: "/account/addresses",
    icon: FiMapPin,
  },
  {
    label: "Wishlist",
    path: "/account/wishlist",
    icon: FiHeart,
  },
  {
    label: "Account Settings",
    path: "/account/settings",
    icon: FiSettings,
  },
];

function Account() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuthContext();

  const handleLogout =
    () => {
      logout();

      navigate(
        "/login",
        {
          replace: true,
        },
      );
    };

  const firstName =
    user?.name
      ?.trim()
      ?.split(" ")[0] ||
    "there";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>
            My Account
          </span>

          <h1 className={styles.title}>
            Welcome, {firstName}
          </h1>

          <p className={styles.subtitle}>
            Manage your profile, orders,
            addresses and account
            settings.
          </p>
        </div>

        <div className={styles.layout}>
          <aside
            className={
              styles.sidebar
            }
          >
            <div
              className={
                styles.userCard
              }
            >
              <div
                className={
                  styles.avatar
                }
              >
                {(user?.name ||
                  "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user?.name ||
                    "User"}
                </strong>

                <span>
                  {user?.phone ||
                    user?.email ||
                    ""}
                </span>
              </div>
            </div>

            <nav
              className={
                styles.navigation
              }
            >
              {menuItems.map(
                ({
                  label,
                  path,
                  icon: Icon,
                }) => {
                  const active =
                    path ===
                    "/account"
                      ? location.pathname ===
                        "/account"
                      : location.pathname ===
                          path ||
                        location.pathname.startsWith(
                          `${path}/`,
                        );

                  return (
                    <Link
                      key={path}
                      to={path}
                      className={
                        active
                          ? `${styles.link} ${styles.active}`
                          : styles.link
                      }
                    >
                      <Icon
                        size={17}
                      />

                      <span>
                        {label}
                      </span>
                    </Link>
                  );
                },
              )}

              <button
                type="button"
                className={
                  styles.logout
                }
                onClick={
                  handleLogout
                }
              >
                <FiLogOut
                  size={17}
                />

                <span>
                  Sign Out
                </span>
              </button>
            </nav>
          </aside>

          <main
            className={
              styles.content
            }
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Account;