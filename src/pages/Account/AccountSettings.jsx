// import {
//   useState,
// } from "react";

// import {
//   FiAlertTriangle,
//   FiLock,
//   FiLogOut,
//   FiTrash2,
// } from "react-icons/fi";

// import {
//   useNavigate,
// } from "react-router-dom";

// import {
//   useAuthContext,
// } from "../../context/AuthContext";

// import {
//   changePassword,
//   deleteAccount,
// } from "../../services/profileService";

// import styles from "./AccountSettings.module.css";

// function AccountSettings() {
//   const navigate =
//     useNavigate();

//   const {
//     logout,
//   } = useAuthContext();

//   const [
//     passwordData,
//     setPasswordData,
//   ] = useState({
//     currentPassword: "",
//     newPassword: "",
//     confirmPassword: "",
//   });

//   const [
//     passwordLoading,
//     setPasswordLoading,
//   ] = useState(false);

//   const [
//     passwordError,
//     setPasswordError,
//   ] = useState("");

//   const [
//     passwordSuccess,
//     setPasswordSuccess,
//   ] = useState("");

//   const [
//     deletePassword,
//     setDeletePassword,
//   ] = useState("");

//   const [
//     deleteConfirmation,
//     setDeleteConfirmation,
//   ] = useState("");

//   const [
//     deleteLoading,
//     setDeleteLoading,
//   ] = useState(false);

//   const [
//     deleteError,
//     setDeleteError,
//   ] = useState("");

//   const [
//     showDelete,
//     setShowDelete,
//   ] = useState(false);

//   const handlePasswordChange =
//     (event) => {
//       const {
//         name,
//         value,
//       } = event.target;

//       setPasswordData(
//         (current) => ({
//           ...current,
//           [name]: value,
//         }),
//       );

//       setPasswordError("");
//       setPasswordSuccess("");
//     };

//   const handleChangePassword =
//     async (event) => {
//       event.preventDefault();

//       setPasswordError("");
//       setPasswordSuccess("");

//       if (
//         passwordData.newPassword
//           .length < 8
//       ) {
//         setPasswordError(
//           "New password must contain at least 8 characters.",
//         );
//         return;
//       }

//       if (
//         passwordData.newPassword !==
//         passwordData.confirmPassword
//       ) {
//         setPasswordError(
//           "New passwords do not match.",
//         );
//         return;
//       }

//       try {
//         setPasswordLoading(true);

//         await changePassword({
//           currentPassword:
//             passwordData.currentPassword,
//           newPassword:
//             passwordData.newPassword,
//         });

//         setPasswordData({
//           currentPassword: "",
//           newPassword: "",
//           confirmPassword: "",
//         });

//         setPasswordSuccess(
//           "Password changed successfully.",
//         );
//       } catch (error) {
//         setPasswordError(
//           error?.message ||
//             "Unable to change your password.",
//         );
//       } finally {
//         setPasswordLoading(false);
//       }
//     };

//   const handleLogout = () => {
//     logout();

//     navigate(
//       "/login",
//       {
//         replace: true,
//       },
//     );
//   };

//   const handleDeleteAccount =
//     async (event) => {
//       event.preventDefault();

//       setDeleteError("");

//       if (
//         deleteConfirmation !==
//         "DELETE"
//       ) {
//         setDeleteError(
//           'Type "DELETE" to confirm account deletion.',
//         );
//         return;
//       }

//       if (!deletePassword) {
//         setDeleteError(
//           "Enter your current password.",
//         );
//         return;
//       }

//       try {
//         setDeleteLoading(true);

//         await deleteAccount({
//           password:
//             deletePassword,
//           confirmation:
//             deleteConfirmation,
//         });

//         logout();

//         navigate(
//           "/",
//           {
//             replace: true,
//           },
//         );
//       } catch (error) {
//         setDeleteError(
//           error?.message ||
//             "Unable to delete your account.",
//         );
//       } finally {
//         setDeleteLoading(false);
//       }
//     };

//   return (
//     <section className={styles.page}>
//       <div className={styles.heading}>
//         <span className={styles.eyebrow}>
//           Security & Account
//         </span>

//         <h2>
//           Account Settings
//         </h2>

//         <p>
//           Manage your password and
//           account access.
//         </p>
//       </div>

//       <div className={styles.section}>
//         <div className={styles.sectionHeader}>
//           <div className={styles.sectionIcon}>
//             <FiLock size={18} />
//           </div>

//           <div>
//             <h3>
//               Change Password
//             </h3>

//             <p>
//               Update your password to
//               keep your account secure.
//             </p>
//           </div>
//         </div>

//         {passwordError && (
//           <div
//             className={styles.error}
//             role="alert"
//           >
//             {passwordError}
//           </div>
//         )}

//         {passwordSuccess && (
//           <div
//             className={styles.success}
//             role="status"
//           >
//             {passwordSuccess}
//           </div>
//         )}

//         <form
//           className={styles.form}
//           onSubmit={
//             handleChangePassword
//           }
//         >
//           <div className={styles.field}>
//             <label htmlFor="current-password">
//               Current Password
//             </label>

//             <input
//               id="current-password"
//               name="currentPassword"
//               type="password"
//               value={
//                 passwordData.currentPassword
//               }
//               onChange={
//                 handlePasswordChange
//               }
//               autoComplete="current-password"
//               disabled={
//                 passwordLoading
//               }
//               required
//             />
//           </div>

//           <div className={styles.field}>
//             <label htmlFor="new-password">
//               New Password
//             </label>

//             <input
//               id="new-password"
//               name="newPassword"
//               type="password"
//               value={
//                 passwordData.newPassword
//               }
//               onChange={
//                 handlePasswordChange
//               }
//               autoComplete="new-password"
//               disabled={
//                 passwordLoading
//               }
//               required
//             />

//             <span>
//               Use at least 8 characters.
//             </span>
//           </div>

//           <div className={styles.field}>
//             <label htmlFor="confirm-password">
//               Confirm New Password
//             </label>

//             <input
//               id="confirm-password"
//               name="confirmPassword"
//               type="password"
//               value={
//                 passwordData.confirmPassword
//               }
//               onChange={
//                 handlePasswordChange
//               }
//               autoComplete="new-password"
//               disabled={
//                 passwordLoading
//               }
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             className={styles.primaryButton}
//             disabled={
//               passwordLoading
//             }
//           >
//             {passwordLoading
//               ? "Updating..."
//               : "Change Password"}
//           </button>
//         </form>
//       </div>

//       <div className={styles.section}>
//         <div className={styles.sectionHeader}>
//           <div className={styles.sectionIcon}>
//             <FiLogOut size={18} />
//           </div>

//           <div>
//             <h3>
//               Sign Out
//             </h3>

//             <p>
//               Sign out from this device.
//             </p>
//           </div>
//         </div>

//         <button
//           type="button"
//           className={styles.secondaryButton}
//           onClick={handleLogout}
//         >
//           <FiLogOut size={15} />
//           Sign Out
//         </button>
//       </div>

//       <div className={styles.dangerSection}>
//         <div className={styles.sectionHeader}>
//           <div className={styles.dangerIcon}>
//             <FiTrash2 size={18} />
//           </div>

//           <div>
//             <h3>
//               Delete Account
//             </h3>

//             <p>
//               Permanently delete your account
//               and account information.
//             </p>
//           </div>
//         </div>

//         {!showDelete ? (
//           <button
//             type="button"
//             className={styles.deleteButton}
//             onClick={() =>
//               setShowDelete(true)
//             }
//           >
//             Delete My Account
//           </button>
//         ) : (
//           <div className={styles.deleteBox}>
//             <div
//               className={
//                 styles.warning
//               }
//             >
//               <FiAlertTriangle
//                 size={17}
//               />

//               <span>
//                 This action cannot be
//                 undone. Your account will
//                 be permanently deleted.
//               </span>
//             </div>

//             {deleteError && (
//               <div
//                 className={styles.error}
//                 role="alert"
//               >
//                 {deleteError}
//               </div>
//             )}

//             <form
//               className={styles.form}
//               onSubmit={
//                 handleDeleteAccount
//               }
//             >
//               <div className={styles.field}>
//                 <label htmlFor="delete-password">
//                   Current Password
//                 </label>

//                 <input
//                   id="delete-password"
//                   type="password"
//                   value={
//                     deletePassword
//                   }
//                   onChange={(event) => {
//                     setDeletePassword(
//                       event.target.value,
//                     );
//                     setDeleteError("");
//                   }}
//                   autoComplete="current-password"
//                   disabled={
//                     deleteLoading
//                   }
//                   required
//                 />
//               </div>

//               <div className={styles.field}>
//                 <label htmlFor="delete-confirmation">
//                   Type DELETE to confirm
//                 </label>

//                 <input
//                   id="delete-confirmation"
//                   type="text"
//                   value={
//                     deleteConfirmation
//                   }
//                   onChange={(event) => {
//                     setDeleteConfirmation(
//                       event.target.value,
//                     );
//                     setDeleteError("");
//                   }}
//                   disabled={
//                     deleteLoading
//                   }
//                   autoComplete="off"
//                   required
//                 />
//               </div>

//               <div className={styles.deleteActions}>
//                 <button
//                   type="button"
//                   className={
//                     styles.cancelButton
//                   }
//                   onClick={() => {
//                     setShowDelete(false);
//                     setDeletePassword("");
//                     setDeleteConfirmation("");
//                     setDeleteError("");
//                   }}
//                   disabled={
//                     deleteLoading
//                   }
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   className={
//                     styles.confirmDelete
//                   }
//                   disabled={
//                     deleteLoading
//                   }
//                 >
//                   {deleteLoading
//                     ? "Deleting..."
//                     : "Permanently Delete"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }

// export default AccountSettings;


import {
  useState,
} from "react";

import {
  FiAlertTriangle,
  FiLock,
  FiLogOut,
  FiTrash2,
} from "react-icons/fi";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuthContext,
} from "../../context/AuthContext";

import {
  changePassword,
  deleteAccount,
} from "../../services/profileService";

import styles from "./AccountSettings.module.css";

function AccountSettings() {
  const navigate =
    useNavigate();

  const {
    logout,
  } = useAuthContext();

  const [
    passwordData,
    setPasswordData,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");

  const [
    deletePassword,
    setDeletePassword,
  ] = useState("");

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState("");

  const [
    deleteLoading,
    setDeleteLoading,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  const [
    showDelete,
    setShowDelete,
  ] = useState(false);

  const handlePasswordChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setPasswordData(
        (current) => ({
          ...current,
          [name]: value,
        }),
      );

      setPasswordError("");
      setPasswordSuccess("");
    };

  const handleChangePassword =
    async (event) => {
      event.preventDefault();

      setPasswordError("");
      setPasswordSuccess("");

      const currentPassword =
        passwordData.currentPassword;

      const newPassword =
        passwordData.newPassword;

      const confirmPassword =
        passwordData.confirmPassword;

      if (!currentPassword) {
        setPasswordError(
          "Enter your current password.",
        );
        return;
      }

      if (
        newPassword.length <
        8
      ) {
        setPasswordError(
          "New password must contain at least 8 characters.",
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setPasswordError(
          "New passwords do not match.",
        );
        return;
      }

      if (
        currentPassword ===
        newPassword
      ) {
        setPasswordError(
          "New password must be different from your current password.",
        );
        return;
      }

      try {
        setPasswordLoading(true);

        await changePassword({
          currentPassword,
          newPassword,
        });

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setPasswordSuccess(
          "Password changed successfully.",
        );
      } catch (error) {
        setPasswordError(
          error?.message ||
            "Unable to change your password.",
        );
      } finally {
        setPasswordLoading(false);
      }
    };

  const handleLogout = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  };

  const handleDeleteAccount =
    async (event) => {
      event.preventDefault();

      setDeleteError("");

      if (
        deleteConfirmation !==
        "DELETE"
      ) {
        setDeleteError(
          'Type "DELETE" to confirm account deletion.',
        );
        return;
      }

      if (!deletePassword) {
        setDeleteError(
          "Enter your current password.",
        );
        return;
      }

      try {
        setDeleteLoading(true);

        await deleteAccount({
          password:
            deletePassword,

          confirmation:
            deleteConfirmation,
        });

        logout();

        navigate(
          "/",
          {
            replace: true,
          },
        );
      } catch (error) {
        setDeleteError(
          error?.message ||
            "Unable to delete your account.",
        );
      } finally {
        setDeleteLoading(false);
      }
    };

  return (
    <section
      className={styles.page}
    >
      <div
        className={styles.heading}
      >
        <span
          className={
            styles.eyebrow
          }
        >
          Security & Account
        </span>

        <h2>
          Account Settings
        </h2>

        <p>
          Manage your password and
          account access.
        </p>
      </div>

      <section
        className={styles.section}
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div
            className={
              styles.sectionIcon
            }
          >
            <FiLock
              size={19}
            />
          </div>

          <div>
            <h3>
              Change Password
            </h3>

            <p>
              Update your password to
              keep your account secure.
            </p>
          </div>
        </div>

        {passwordError && (
          <div
            className={
              styles.error
            }
            role="alert"
          >
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div
            className={
              styles.success
            }
            role="status"
          >
            {passwordSuccess}
          </div>
        )}

        <form
          className={styles.form}
          onSubmit={
            handleChangePassword
          }
        >
          <div
            className={styles.field}
          >
            <label htmlFor="current-password">
              Current Password
            </label>

            <input
              id="current-password"
              name="currentPassword"
              type="password"
              value={
                passwordData.currentPassword
              }
              onChange={
                handlePasswordChange
              }
              autoComplete="current-password"
              disabled={
                passwordLoading
              }
              required
            />
          </div>

          <div
            className={styles.field}
          >
            <label htmlFor="new-password">
              New Password
            </label>

            <input
              id="new-password"
              name="newPassword"
              type="password"
              value={
                passwordData.newPassword
              }
              onChange={
                handlePasswordChange
              }
              autoComplete="new-password"
              disabled={
                passwordLoading
              }
              required
            />

            <p
              className={
                styles.helperText
              }
            >
              Use at least 8
              characters.
            </p>
          </div>

          <div
            className={styles.field}
          >
            <label htmlFor="confirm-new-password">
              Confirm New Password
            </label>

            <input
              id="confirm-new-password"
              name="confirmPassword"
              type="password"
              value={
                passwordData.confirmPassword
              }
              onChange={
                handlePasswordChange
              }
              autoComplete="new-password"
              disabled={
                passwordLoading
              }
              required
            />
          </div>

          <button
            type="submit"
            className={
              styles.primaryButton
            }
            disabled={
              passwordLoading
            }
          >
            {passwordLoading
              ? "Changing..."
              : "Change Password"}
          </button>
        </form>
      </section>

      <section
        className={styles.section}
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div
            className={
              styles.sectionIcon
            }
          >
            <FiLogOut
              size={19}
            />
          </div>

          <div>
            <h3>
              Sign Out
            </h3>

            <p>
              Sign out from this
              account on this device.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={
            styles.secondaryButton
          }
          onClick={
            handleLogout
          }
        >
          <FiLogOut size={16} />

          Sign Out
        </button>
      </section>

      <section
        className={
          styles.dangerSection
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div
            className={
              styles.dangerIcon
            }
          >
            <FiAlertTriangle
              size={19}
            />
          </div>

          <div>
            <h3>
              Delete Account
            </h3>

            <p>
              Permanently delete your
              account and account data.
              This action cannot be
              undone.
            </p>
          </div>
        </div>

        {!showDelete ? (
          <button
            type="button"
            className={
              styles.deleteButton
            }
            onClick={() => {
              setShowDelete(true);
              setDeleteError("");
            }}
          >
            <FiTrash2 size={16} />

            Delete My Account
          </button>
        ) : (
          <div
            className={
              styles.deletePanel
            }
          >
            <div
              className={
                styles.warning
              }
            >
              <FiAlertTriangle
                size={17}
              />

              <span>
                Account deletion is
                permanent. Your account
                will no longer be
                accessible after this
                action.
              </span>
            </div>

            {deleteError && (
              <div
                className={
                  styles.error
                }
                role="alert"
              >
                {deleteError}
              </div>
            )}

            <form
              className={styles.form}
              onSubmit={
                handleDeleteAccount
              }
            >
              <div
                className={styles.field}
              >
                <label htmlFor="delete-password">
                  Current Password
                </label>

                <input
                  id="delete-password"
                  type="password"
                  value={
                    deletePassword
                  }
                  onChange={(
                    event,
                  ) => {
                    setDeletePassword(
                      event.target.value,
                    );
                    setDeleteError("");
                  }}
                  autoComplete="current-password"
                  disabled={
                    deleteLoading
                  }
                  required
                />
              </div>

              <div
                className={styles.field}
              >
                <label htmlFor="delete-confirmation">
                  Type DELETE to confirm
                </label>

                <input
                  id="delete-confirmation"
                  type="text"
                  value={
                    deleteConfirmation
                  }
                  onChange={(
                    event,
                  ) => {
                    setDeleteConfirmation(
                      event.target.value,
                    );
                    setDeleteError("");
                  }}
                  autoComplete="off"
                  disabled={
                    deleteLoading
                  }
                  required
                />
              </div>

              <div
                className={
                  styles.deleteActions
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={() => {
                    setShowDelete(false);
                    setDeletePassword("");
                    setDeleteConfirmation("");
                    setDeleteError("");
                  }}
                  disabled={
                    deleteLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    styles.confirmDelete
                  }
                  disabled={
                    deleteLoading
                  }
                >
                  {deleteLoading
                    ? "Deleting..."
                    : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>
    </section>
  );
}

export default AccountSettings;