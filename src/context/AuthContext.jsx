
// // import { createContext, useContext, useEffect, useState } from "react";

// // import {
// //   register as registerUser,
// //   verifyRegistration,
// //   sendLoginOtp,
// //   verifyLoginOtp,
// // } from "../services/authService";

// // import { getProfile } from "../services/profileService";

// // const AuthContext = createContext(null);

// // function getStoredUser() {
// //   const savedUser = localStorage.getItem("user");

// //   if (!savedUser) {
// //     return null;
// //   }

// //   try {
// //     return JSON.parse(savedUser);
// //   } catch {
// //     localStorage.removeItem("user");

// //     return null;
// //   }
// // }

// // function getToken(response) {
// //   return (
// //     response?.data?.accessToken ||
// //     response?.data?.token ||
// //     response?.accessToken ||
// //     response?.token ||
// //     null
// //   );
// // }

// // function getUser(response) {
// //   return response?.data?.user || response?.user || null;
// // }

// // function saveUser(user) {
// //   if (!user) {
// //     return;
// //   }

// //   localStorage.setItem("user", JSON.stringify(user));
// // }

// // function clearAuthStorage() {
// //   localStorage.removeItem("accessToken");

// //   localStorage.removeItem("user");
// // }

// // export function AuthProvider({ children }) {
// //   const [user, setUser] = useState(getStoredUser);

// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     let active = true;

// //     async function restoreSession() {
// //       const token = localStorage.getItem("accessToken");

// //       if (!token) {
// //         if (active) {
// //           setUser(null);
// //           setLoading(false);
// //         }

// //         return;
// //       }

// //       try {
// //         const response = await getProfile();

// //         const profile = getUser(response) || response?.data || null;

// //         if (!active) {
// //           return;
// //         }

// //         if (!profile) {
// //           clearAuthStorage();
// //           setUser(null);
// //           return;
// //         }

// //         saveUser(profile);
// //         setUser(profile);
// //       } catch {
// //         if (!active) {
// //           return;
// //         }

// //         clearAuthStorage();
// //         setUser(null);
// //       } finally {
// //         if (active) {
// //           setLoading(false);
// //         }
// //       }
// //     }

// //     restoreSession();

// //     return () => {
// //       active = false;
// //     };
// //   }, []);

// //   const register = async (data) => {
// //     return registerUser(data);
// //   };

// //   const verifyRegister = async (data) => {
// //     return verifyRegistration(data);
// //   };

// //   const loginSendOtp = async (data) => {
// //     return sendLoginOtp(data);
// //   };

// //   const loginVerifyOtp = async (data) => {
// //     const response = await verifyLoginOtp(data);

// //     const token = getToken(response);

// //     const loggedInUser = getUser(response);

// //     if (!token) {
// //       throw new Error("Authentication token was not returned.");
// //     }

// //     localStorage.setItem("accessToken", token);

// //     if (loggedInUser) {
// //       saveUser(loggedInUser);

// //       setUser(loggedInUser);
// //     } else {
// //       await refreshUser();
// //     }

// //     return response;
// //   };

// //   const refreshUser = async () => {
// //     const token = localStorage.getItem("accessToken");

// //     if (!token) {
// //       clearAuthStorage();
// //       setUser(null);

// //       return null;
// //     }

// //     try {
// //       const response = await getProfile();

// //       const profile = getUser(response) || response?.data || null;

// //       if (!profile) {
// //         throw new Error("Unable to load user profile.");
// //       }

// //       saveUser(profile);
// //       setUser(profile);

// //       return profile;
// //     } catch (error) {
// //       clearAuthStorage();
// //       setUser(null);

// //       throw error;
// //     }
// //   };

// //   const updateUser = (updatedUser) => {
// //     if (!updatedUser) {
// //       return;
// //     }

// //     saveUser(updatedUser);

// //     setUser(updatedUser);
// //   };

// //   const logout = () => {
// //     clearAuthStorage();
// //     setUser(null);
// //   };

// //   useEffect(() => {
// //     const handleLogout = () => {
// //       clearAuthStorage();
// //       setUser(null);
// //     };

// //     const handleUserUpdated = (event) => {
// //       if (event.detail) {
// //         saveUser(event.detail);

// //         setUser(event.detail);
// //       }
// //     };

// //     window.addEventListener("auth:logout", handleLogout);

// //     window.addEventListener("auth:user-updated", handleUserUpdated);

// //     return () => {
// //       window.removeEventListener("auth:logout", handleLogout);

// //       window.removeEventListener("auth:user-updated", handleUserUpdated);
// //     };
// //   }, []);

// //   const isAuthenticated = Boolean(user && localStorage.getItem("accessToken"));

// //   const isAdmin = user?.role === "admin";

// //   const value = {
// //     user,

// //     loading,

// //     isAuthenticated,

// //     isAdmin,

// //     register,

// //     verifyRegister,

// //     loginSendOtp,

// //     loginVerifyOtp,

// //     refreshUser,

// //     updateUser,

// //     logout,
// //   };

// //   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// // }

// // export function useAuthContext() {
// //   const context = useContext(AuthContext);

// //   if (!context) {
// //     throw new Error("useAuthContext must be used inside AuthProvider");
// //   }

// //   return context;
// // }

// // export default AuthProvider;

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import {
//   register as registerUser,
//   verifyRegistration,
//   sendLoginOtp,
//   verifyLoginOtp,
// } from "../services/authService";

// import {
//   getProfile,
// } from "../services/profileService";

// const AuthContext = createContext(null);

// function getStoredUser() {
//   const savedUser =
//     localStorage.getItem("user");

//   if (!savedUser) {
//     return null;
//   }

//   try {
//     return JSON.parse(savedUser);
//   } catch {
//     localStorage.removeItem("user");

//     return null;
//   }
// }

// function getToken(response) {
//   return (
//     response?.data?.accessToken ||
//     response?.data?.token ||
//     response?.accessToken ||
//     response?.token ||
//     null
//   );
// }

// function getUser(response) {
//   return (
//     response?.data?.user ||
//     response?.data?.data?.user ||
//     response?.user ||
//     null
//   );
// }

// function saveUser(user) {
//   if (!user) {
//     return;
//   }

//   localStorage.setItem(
//     "user",
//     JSON.stringify(user),
//   );
// }

// function clearAuthStorage() {
//   localStorage.removeItem(
//     "accessToken",
//   );

//   localStorage.removeItem("user");
// }

// async function extractProfile(response) {
//   return (
//     getUser(response) ||
//     response?.data?.data ||
//     response?.data ||
//     null
//   );
// }

// export function AuthProvider({
//   children,
// }) {
//   const [
//     user,
//     setUser,
//   ] = useState(getStoredUser);

//   const [
//     loading,
//     setLoading,
//   ] = useState(true);

//   useEffect(() => {
//     let active = true;

//     async function restoreSession() {
//       const token =
//         localStorage.getItem(
//           "accessToken",
//         );

//       if (!token) {
//         if (active) {
//           setUser(null);
//           setLoading(false);
//         }

//         return;
//       }

//       try {
//         const response =
//           await getProfile();

//         const profile =
//           await extractProfile(
//             response,
//           );

//         if (!active) {
//           return;
//         }

//         if (!profile) {
//           clearAuthStorage();
//           setUser(null);
//           return;
//         }

//         saveUser(profile);
//         setUser(profile);
//       } catch {
//         if (!active) {
//           return;
//         }

//         clearAuthStorage();
//         setUser(null);
//       } finally {
//         if (active) {
//           setLoading(false);
//         }
//       }
//     }

//     restoreSession();

//     return () => {
//       active = false;
//     };
//   }, []);

//   const register = async (
//     data,
//   ) => {
//     return registerUser(data);
//   };

//   const verifyRegister = async (
//     data,
//   ) => {
//     return verifyRegistration(data);
//   };

//   const loginSendOtp = async (
//     data,
//   ) => {
//     return sendLoginOtp(data);
//   };

//   const refreshUser = async () => {
//     const token =
//       localStorage.getItem(
//         "accessToken",
//       );

//     if (!token) {
//       clearAuthStorage();
//       setUser(null);

//       return null;
//     }

//     try {
//       const response =
//         await getProfile();

//       const profile =
//         await extractProfile(
//           response,
//         );

//       if (!profile) {
//         throw new Error(
//           "Unable to load user profile.",
//         );
//       }

//       saveUser(profile);
//       setUser(profile);

//       return profile;
//     } catch (error) {
//       clearAuthStorage();
//       setUser(null);

//       throw error;
//     }
//   };

// const loginVerifyOtp = async (data) => {
//   const response = await verifyLoginOtp(data);

//   const token = getToken(response);

//   if (!token) {
//     throw new Error(
//       "Authentication token was not returned.",
//     );
//   }

//   localStorage.setItem(
//     "accessToken",
//     token,
//   );

//   let loggedInUser = getUser(response);

//   if (!loggedInUser) {
//     loggedInUser = await refreshUser();
//   } else {
//     saveUser(loggedInUser);
//     setUser(loggedInUser);
//   }

//   if (!loggedInUser) {
//     clearAuthStorage();

//     throw new Error(
//       "Unable to load authenticated user.",
//     );
//   }

//   return {
//     ...response,
//     user: loggedInUser,
//   };
// };

//   const updateUser = (
//     updatedUser,
//   ) => {
//     if (!updatedUser) {
//       return;
//     }

//     saveUser(updatedUser);
//     setUser(updatedUser);
//   };

//   const logout = () => {
//     clearAuthStorage();
//     setUser(null);
//   };

//   useEffect(() => {
//     const handleLogout =
//       () => {
//         clearAuthStorage();
//         setUser(null);
//       };

//     const handleUserUpdated =
//       (event) => {
//         if (!event.detail) {
//           return;
//         }

//         saveUser(
//           event.detail,
//         );

//         setUser(
//           event.detail,
//         );
//       };

//     window.addEventListener(
//       "auth:logout",
//       handleLogout,
//     );

//     window.addEventListener(
//       "auth:user-updated",
//       handleUserUpdated,
//     );

//     return () => {
//       window.removeEventListener(
//         "auth:logout",
//         handleLogout,
//       );

//       window.removeEventListener(
//         "auth:user-updated",
//         handleUserUpdated,
//       );
//     };
//   }, []);

//   const isAuthenticated =
//     Boolean(
//       user &&
//         localStorage.getItem(
//           "accessToken",
//         ),
//     );

//   const isAdmin =
//     user?.role === "admin";

//   const value = {
//     user,

//     loading,

//     isAuthenticated,

//     isAdmin,

//     register,

//     verifyRegister,

//     loginSendOtp,

//     loginVerifyOtp,

//     refreshUser,

//     updateUser,

//     logout,
//   };

//   return (
//     <AuthContext.Provider
//       value={value}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuthContext() {
//   const context =
//     useContext(AuthContext);

//   if (!context) {
//     throw new Error(
//       "useAuthContext must be used inside AuthProvider",
//     );
//   }

//   return context;
// }

// export default AuthProvider;

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  register as registerUser,
  verifyRegistration,
  sendLoginOtp,
  verifyLoginOtp,
} from "../services/authService";

import {
  getProfile,
} from "../services/profileService";

const AuthContext = createContext(null);

function getStoredUser() {
  const savedUser =
    localStorage.getItem("user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

function getToken(response) {
  return (
    response?.data?.accessToken ||
    response?.data?.token ||
    response?.accessToken ||
    response?.token ||
    null
  );
}

function getUser(response) {
  if (!response) {
    return null;
  }

  if (
    response?.data?.user &&
    typeof response.data.user === "object"
  ) {
    return response.data.user;
  }

  if (
    response?.data?.data?.user &&
    typeof response.data.data.user === "object"
  ) {
    return response.data.data.user;
  }

  if (
    response?.user &&
    typeof response.user === "object"
  ) {
    return response.user;
  }

  if (
    response?.data?.data &&
    typeof response.data.data === "object" &&
    !Array.isArray(response.data.data) &&
    (
      response.data.data._id ||
      response.data.data.id ||
      response.data.data.role
    )
  ) {
    return response.data.data;
  }

  return null;
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  return {
    ...user,
    role:
      typeof user.role === "string"
        ? user.role.trim().toLowerCase()
        : "",
  };
}

function saveUser(user) {
  const normalizedUser =
    normalizeUser(user);

  if (!normalizedUser) {
    return null;
  }

  localStorage.setItem(
    "user",
    JSON.stringify(normalizedUser),
  );

  return normalizedUser;
}

function clearAuthStorage() {
  localStorage.removeItem(
    "accessToken",
  );

  localStorage.removeItem(
    "user",
  );
}

async function getAuthenticatedUser() {
  const response =
    await getProfile();

  const profile =
    getUser(response);

  if (!profile) {
    throw new Error(
      "Unable to load authenticated user.",
    );
  }

  return normalizeUser(profile);
}

export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(() =>
    normalizeUser(
      getStoredUser(),
    ),
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token =
        localStorage.getItem(
          "accessToken",
        );

      if (!token) {
        if (active) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const profile =
          await getAuthenticatedUser();

        if (!active) {
          return;
        }

        const savedUser =
          saveUser(profile);

        setUser(savedUser);
      } catch {
        if (!active) {
          return;
        }

        clearAuthStorage();
        setUser(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const register = async (
    data,
  ) => {
    return registerUser(data);
  };

  const verifyRegister = async (
    data,
  ) => {
    return verifyRegistration(
      data,
    );
  };

  const loginSendOtp = async (
    data,
  ) => {
    return sendLoginOtp(data);
  };

  const refreshUser = async () => {
    const token =
      localStorage.getItem(
        "accessToken",
      );

    if (!token) {
      clearAuthStorage();
      setUser(null);

      return null;
    }

    try {
      const profile =
        await getAuthenticatedUser();

      const savedUser =
        saveUser(profile);

      setUser(savedUser);

      return savedUser;
    } catch (error) {
      clearAuthStorage();
      setUser(null);

      throw error;
    }
  };

  const loginVerifyOtp = async (
    data,
  ) => {
    const response =
      await verifyLoginOtp(data);

    const token =
      getToken(response);

    if (!token) {
      throw new Error(
        "Authentication token was not returned.",
      );
    }

    localStorage.setItem(
      "accessToken",
      token,
    );

    let loggedInUser =
      getUser(response);

    /*
     * Always get the authenticated
     * profile when the login response
     * does not contain a user.
     *
     * This guarantees that the role
     * comes from the backend user record.
     */
    if (!loggedInUser) {
      loggedInUser =
        await getAuthenticatedUser();
    }

    const savedUser =
      saveUser(loggedInUser);

    if (!savedUser) {
      clearAuthStorage();

      throw new Error(
        "Unable to load authenticated user.",
      );
    }

    setUser(savedUser);

    return {
      ...response,
      user: savedUser,
    };
  };

  const updateUser = (
    updatedUser,
  ) => {
    const normalizedUser =
      normalizeUser(updatedUser);

    if (!normalizedUser) {
      return;
    }

    saveUser(normalizedUser);
    setUser(normalizedUser);
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  useEffect(() => {
    const handleLogout =
      () => {
        clearAuthStorage();
        setUser(null);
      };

    const handleUserUpdated =
      (event) => {
        const updatedUser =
          normalizeUser(
            event.detail,
          );

        if (!updatedUser) {
          return;
        }

        saveUser(updatedUser);
        setUser(updatedUser);
      };

    window.addEventListener(
      "auth:logout",
      handleLogout,
    );

    window.addEventListener(
      "auth:user-updated",
      handleUserUpdated,
    );

    return () => {
      window.removeEventListener(
        "auth:logout",
        handleLogout,
      );

      window.removeEventListener(
        "auth:user-updated",
        handleUserUpdated,
      );
    };
  }, []);

  const hasToken =
    Boolean(
      localStorage.getItem(
        "accessToken",
      ),
    );

  const isAuthenticated =
    Boolean(
      user &&
      hasToken,
    );

  const role =
    typeof user?.role === "string"
      ? user.role
          .trim()
          .toLowerCase()
      : "";

  const isAdmin =
    isAuthenticated &&
    role === "admin";

  const value = {
    user,

    role,

    loading,

    isAuthenticated,

    isAdmin,

    register,

    verifyRegister,

    loginSendOtp,

    loginVerifyOtp,

    refreshUser,

    updateUser,

    logout,
  };

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider",
    );
  }

  return context;
}

export default AuthProvider;