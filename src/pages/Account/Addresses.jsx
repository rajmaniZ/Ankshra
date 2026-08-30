// import {
//   useEffect,
//   useState,
// } from "react";

// import {
//   FiEdit2,
//   FiMapPin,
//   FiPlus,
//   FiStar,
//   FiTrash2,
// } from "react-icons/fi";

// import {
//   addAddress,
//   deleteAddress,
//   getProfile,
//   setDefaultAddress,
//   updateAddress,
// } from "../../services/profileService";

// import styles from "./Addresses.module.css";

// const EMPTY_ADDRESS = {
//   label: "Home",
//   fullName: "",
//   phone: "",
//   addressLine1: "",
//   addressLine2: "",
//   city: "",
//   state: "",
//   postalCode: "",
//   country: "India",
//   isDefault: false,
// };

// function getUser(response) {
//   return (
//     response?.data?.user ||
//     response?.user ||
//     response?.data ||
//     null
//   );
// }

// function getAddressList(response) {
//   const user =
//     getUser(response);

//   if (
//     Array.isArray(
//       user?.addresses,
//     )
//   ) {
//     return user.addresses;
//   }

//   if (
//     Array.isArray(
//       response?.data?.addresses,
//     )
//   ) {
//     return response.data.addresses;
//   }

//   return [];
// }

// function Addresses() {
//   const [
//     addresses,
//     setAddresses,
//   ] = useState([]);

//   const [
//     formData,
//     setFormData,
//   ] = useState(EMPTY_ADDRESS);

//   const [
//     editingId,
//     setEditingId,
//   ] = useState(null);

//   const [
//     showForm,
//     setShowForm,
//   ] = useState(false);

//   const [
//     loading,
//     setLoading,
//   ] = useState(true);

//   const [
//     saving,
//     setSaving,
//   ] = useState(false);

//   const [
//     error,
//     setError,
//   ] = useState("");

//   const loadAddresses =
//     async () => {
//       try {
//         setLoading(true);

//         const response =
//           await getProfile();

//         setAddresses(
//           getAddressList(
//             response,
//           ),
//         );
//       } catch (requestError) {
//         setError(
//           requestError?.message ||
//             "Unable to load your addresses.",
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//   useEffect(() => {
//     loadAddresses();
//   }, []);

//   const handleChange =
//     (event) => {
//       const {
//         name,
//         value,
//         type,
//         checked,
//       } = event.target;

//       setFormData(
//         (current) => ({
//           ...current,
//           [name]:
//             type === "checkbox"
//               ? checked
//               : value,
//         }),
//       );

//       setError("");
//     };

//   const openAddForm = () => {
//     setEditingId(null);
//     setFormData({
//       ...EMPTY_ADDRESS,
//     });
//     setShowForm(true);
//     setError("");
//   };

//   const openEditForm =
//     (address) => {
//       setEditingId(
//         address._id ||
//           address.id,
//       );

//       setFormData({
//         label:
//           address.label ||
//           "Home",
//         fullName:
//           address.fullName ||
//           "",
//         phone:
//           address.phone || "",
//         addressLine1:
//           address.addressLine1 ||
//           "",
//         addressLine2:
//           address.addressLine2 ||
//           "",
//         city:
//           address.city || "",
//         state:
//           address.state || "",
//         postalCode:
//           address.postalCode ||
//           "",
//         country:
//           address.country ||
//           "India",
//         isDefault:
//           Boolean(
//             address.isDefault,
//           ),
//       });

//       setShowForm(true);
//       setError("");
//     };

//   const closeForm = () => {
//     setShowForm(false);
//     setEditingId(null);
//     setFormData({
//       ...EMPTY_ADDRESS,
//     });
//     setError("");
//   };

//   const handleSubmit =
//     async (event) => {
//       event.preventDefault();

//       setError("");

//       if (
//         !formData.fullName.trim() ||
//         !formData.phone.trim() ||
//         !formData.addressLine1.trim() ||
//         !formData.city.trim() ||
//         !formData.state.trim() ||
//         !formData.postalCode.trim()
//       ) {
//         setError(
//           "Please fill all required address fields.",
//         );
//         return;
//       }

//       try {
//         setSaving(true);

//         const data = {
//           ...formData,
//           fullName:
//             formData.fullName.trim(),
//           phone:
//             formData.phone.trim(),
//           addressLine1:
//             formData.addressLine1.trim(),
//           addressLine2:
//             formData.addressLine2.trim(),
//           city:
//             formData.city.trim(),
//           state:
//             formData.state.trim(),
//           postalCode:
//             formData.postalCode.trim(),
//           country:
//             formData.country.trim() ||
//             "India",
//         };

//         if (editingId) {
//           await updateAddress(
//             editingId,
//             data,
//           );
//         } else {
//           await addAddress(data);
//         }

//         await loadAddresses();
//         closeForm();
//       } catch (requestError) {
//         setError(
//           requestError?.message ||
//             "Unable to save this address.",
//         );
//       } finally {
//         setSaving(false);
//       }
//     };

//   const handleDelete =
//     async (addressId) => {
//       const confirmed =
//         window.confirm(
//           "Are you sure you want to delete this address?",
//         );

//       if (!confirmed) {
//         return;
//       }

//       try {
//         await deleteAddress(
//           addressId,
//         );

//         await loadAddresses();
//       } catch (requestError) {
//         setError(
//           requestError?.message ||
//             "Unable to delete this address.",
//         );
//       }
//     };

//   const handleDefault =
//     async (addressId) => {
//       try {
//         await setDefaultAddress(
//           addressId,
//         );

//         await loadAddresses();
//       } catch (requestError) {
//         setError(
//           requestError?.message ||
//             "Unable to update the default address.",
//         );
//       }
//     };

//   return (
//     <section className={styles.page}>
//       <div className={styles.heading}>
//         <div>
//           <span className={styles.eyebrow}>
//             Delivery Information
//           </span>

//           <h2>
//             Addresses
//           </h2>

//           <p>
//             Manage your saved delivery
//             addresses.
//           </p>
//         </div>

//         <button
//           type="button"
//           className={styles.addButton}
//           onClick={openAddForm}
//         >
//           <FiPlus size={15} />
//           Add Address
//         </button>
//       </div>

//       {error && (
//         <div
//           className={styles.error}
//           role="alert"
//         >
//           {error}
//         </div>
//       )}

//       {showForm && (
//         <div className={styles.formCard}>
//           <div className={styles.formHeader}>
//             <h3>
//               {editingId
//                 ? "Edit Address"
//                 : "Add New Address"}
//             </h3>

//             <button
//               type="button"
//               onClick={closeForm}
//             >
//               Cancel
//             </button>
//           </div>

//           <form
//             className={styles.form}
//             onSubmit={handleSubmit}
//           >
//             <div className={styles.formGrid}>
//               <div className={styles.field}>
//                 <label>
//                   Address Label
//                 </label>

//                 <select
//                   name="label"
//                   value={
//                     formData.label
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                 >
//                   <option value="Home">
//                     Home
//                   </option>

//                   <option value="Work">
//                     Work
//                   </option>

//                   <option value="Other">
//                     Other
//                   </option>
//                 </select>
//               </div>

//               <div className={styles.field}>
//                 <label>
//                   Full Name
//                 </label>

//                 <input
//                   name="fullName"
//                   value={
//                     formData.fullName
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                   required
//                 />
//               </div>

//               <div className={styles.field}>
//                 <label>
//                   Phone
//                 </label>

//                 <input
//                   name="phone"
//                   type="tel"
//                   value={
//                     formData.phone
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                   required
//                 />
//               </div>

//               <div className={styles.field}>
//                 <label>
//                   Postal Code
//                 </label>

//                 <input
//                   name="postalCode"
//                   value={
//                     formData.postalCode
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                   required
//                 />
//               </div>

//               <div
//                 className={
//                   styles.fieldFull
//                 }
//               >
//                 <label>
//                   Address Line 1
//                 </label>

//                 <input
//                   name="addressLine1"
//                   value={
//                     formData.addressLine1
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                   required
//                 />
//               </div>

//               <div
//                 className={
//                   styles.fieldFull
//                 }
//               >
//                 <label>
//                   Address Line 2
//                 </label>

//                 <input
//                   name="addressLine2"
//                   value={
//                     formData.addressLine2
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                   placeholder="Apartment, landmark, etc."
//                 />
//               </div>

//               <div className={styles.field}>
//                 <label>
//                   City
//                 </label>

//                 <input
//                   name="city"
//                   value={
//                     formData.city
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                   required
//                 />
//               </div>

//               <div className={styles.field}>
//                 <label>
//                   State
//                 </label>

//                 <input
//                   name="state"
//                   value={
//                     formData.state
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                   required
//                 />
//               </div>

//               <div className={styles.field}>
//                 <label>
//                   Country
//                 </label>

//                 <input
//                   name="country"
//                   value={
//                     formData.country
//                   }
//                   onChange={
//                     handleChange
//                   }
//                   disabled={saving}
//                 />
//               </div>
//             </div>

//             <label
//               className={
//                 styles.checkbox
//               }
//             >
//               <input
//                 type="checkbox"
//                 name="isDefault"
//                 checked={
//                   formData.isDefault
//                 }
//                 onChange={
//                   handleChange
//                 }
//                 disabled={saving}
//               />

//               <span>
//                 Make this my default
//                 address
//               </span>
//             </label>

//             <button
//               type="submit"
//               className={
//                 styles.saveButton
//               }
//               disabled={saving}
//             >
//               {saving
//                 ? "Saving..."
//                 : editingId
//                   ? "Update Address"
//                   : "Save Address"}
//             </button>
//           </form>
//         </div>
//       )}

//       {loading ? (
//         <div className={styles.state}>
//           Loading addresses...
//         </div>
//       ) : addresses.length === 0 ? (
//         <div className={styles.empty}>
//           <FiMapPin size={24} />

//           <h3>
//             No saved addresses
//           </h3>

//           <p>
//             Add an address to make
//             checkout faster.
//           </p>

//           <button
//             type="button"
//             onClick={
//               openAddForm
//             }
//           >
//             Add Address
//           </button>
//         </div>
//       ) : (
//         <div className={styles.list}>
//           {addresses.map(
//             (address) => {
//               const addressId =
//                 address._id ||
//                 address.id;

//               return (
//                 <article
//                   className={
//                     styles.addressCard
//                   }
//                   key={addressId}
//                 >
//                   <div
//                     className={
//                       styles.addressTop
//                     }
//                   >
//                     <div
//                       className={
//                         styles.addressTitle
//                       }
//                     >
//                       <FiMapPin
//                         size={16}
//                       />

//                       <strong>
//                         {address.label ||
//                           "Address"}
//                       </strong>

//                       {address.isDefault && (
//                         <span
//                           className={
//                             styles.defaultBadge
//                           }
//                         >
//                           Default
//                         </span>
//                       )}
//                     </div>

//                     <div
//                       className={
//                         styles.actions
//                       }
//                     >
//                       <button
//                         type="button"
//                         onClick={() =>
//                           openEditForm(
//                             address,
//                           )
//                         }
//                         title="Edit address"
//                       >
//                         <FiEdit2
//                           size={15}
//                         />
//                       </button>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           handleDelete(
//                             addressId,
//                           )
//                         }
//                         title="Delete address"
//                       >
//                         <FiTrash2
//                           size={15}
//                         />
//                       </button>
//                     </div>
//                   </div>

//                   <div
//                     className={
//                       styles.addressBody
//                     }
//                   >
//                     <strong>
//                       {address.fullName}
//                     </strong>

//                     <span>
//                       {address.phone}
//                     </span>

//                     <p>
//                       {
//                         address.addressLine1
//                       }

//                       {address.addressLine2 && (
//                         <>
//                           <br />
//                           {
//                             address.addressLine2
//                           }
//                         </>
//                       )}

//                       <br />

//                       {address.city},{" "}
//                       {address.state}{" "}
//                       {address.postalCode}
//                       <br />
//                       {address.country ||
//                         "India"}
//                     </p>
//                   </div>

//                   {!address.isDefault && (
//                     <button
//                       type="button"
//                       className={
//                         styles.defaultButton
//                       }
//                       onClick={() =>
//                         handleDefault(
//                           addressId,
//                         )
//                       }
//                     >
//                       <FiStar
//                         size={14}
//                       />
//                       Set as Default
//                     </button>
//                   )}
//                 </article>
//               );
//             },
//           )}
//         </div>
//       )}
//     </section>
//   );
// }

// export default Addresses;


import {
  useEffect,
  useState,
} from "react";

import {
  FiEdit2,
  FiMapPin,
  FiPlus,
  FiStar,
  FiTrash2,
} from "react-icons/fi";

import {
  addAddress,
  deleteAddress,
  getProfile,
  setDefaultAddress,
  updateAddress,
} from "../../services/profileService";

import styles from "./Addresses.module.css";

const COUNTRY_CODES = [
  {
    code: "+91",
    name: "India",
  },
  {
    code: "+1",
    name: "USA / Canada",
  },
  {
    code: "+44",
    name: "United Kingdom",
  },
  {
    code: "+61",
    name: "Australia",
  },
  {
    code: "+971",
    name: "UAE",
  },
  {
    code: "+65",
    name: "Singapore",
  },
  {
    code: "+49",
    name: "Germany",
  },
  {
    code: "+33",
    name: "France",
  },
  {
    code: "+81",
    name: "Japan",
  },
];

const EMPTY_ADDRESS = {
  label: "Home",
  fullName: "",
  countryCode: "+91",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

function getUser(response) {
  return (
    response?.data?.user ||
    response?.user ||
    response?.data ||
    null
  );
}

function getAddressList(response) {
  const user =
    getUser(response);

  if (
    Array.isArray(
      user?.addresses,
    )
  ) {
    return user.addresses;
  }

  if (
    Array.isArray(
      response?.data?.addresses,
    )
  ) {
    return response.data.addresses;
  }

  return [];
}

function normalizeAddress(
  address,
) {
  return {
    ...address,

    countryCode:
      address.countryCode ||
      "+91",

    phone:
      address.phone ||
      "",
  };
}

function Addresses() {
  const [
    addresses,
    setAddresses,
  ] = useState([]);

  const [
    formData,
    setFormData,
  ] = useState(
    EMPTY_ADDRESS,
  );

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

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

  const loadAddresses =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getProfile();

        const list =
          getAddressList(
            response,
          ).map(
            normalizeAddress,
          );

        setAddresses(list);
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to load your addresses.",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleChange =
    (event) => {
      const {
        name,
        value,
        type,
        checked,
      } = event.target;

      setFormData(
        (current) => ({
          ...current,
          [name]:
            type === "checkbox"
              ? checked
              : value,
        }),
      );

      setError("");
    };

  const handlePhoneChange =
    (event) => {
      const value =
        event.target.value
          .replace(/\D/g, "")
          .slice(0, 15);

      setFormData(
        (current) => ({
          ...current,
          phone: value,
        }),
      );

      setError("");
    };

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      ...EMPTY_ADDRESS,
    });

    setShowForm(true);
    setError("");
  };

  const openEditForm =
    (address) => {
      setEditingId(
        address._id ||
          address.id,
      );

      setFormData({
        label:
          address.label ||
          "Home",

        fullName:
          address.fullName ||
          "",

        countryCode:
          address.countryCode ||
          "+91",

        phone:
          address.phone ||
          "",

        addressLine1:
          address.addressLine1 ||
          "",

        addressLine2:
          address.addressLine2 ||
          "",

        city:
          address.city ||
          "",

        state:
          address.state ||
          "",

        postalCode:
          address.postalCode ||
          "",

        country:
          address.country ||
          "India",

        isDefault:
          Boolean(
            address.isDefault,
          ),
      });

      setShowForm(true);
      setError("");
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      const cleanPhone =
        formData.phone
          .replace(/\D/g, "");

      if (
        cleanPhone.length <
          6 ||
        cleanPhone.length >
          15
      ) {
        setError(
          "Please enter a valid phone number.",
        );
        return;
      }

      if (
        !formData.fullName.trim()
      ) {
        setError(
          "Please enter the full name.",
        );
        return;
      }

      if (
        !formData.addressLine1.trim()
      ) {
        setError(
          "Please enter address line 1.",
        );
        return;
      }

      if (
        !formData.city.trim() ||
        !formData.state.trim() ||
        !formData.postalCode.trim()
      ) {
        setError(
          "Please complete the city, state and postal code.",
        );
        return;
      }

      const payload = {
        label:
          formData.label.trim() ||
          "Home",

        fullName:
          formData.fullName.trim(),

        countryCode:
          formData.countryCode,

        phone:
          cleanPhone,

        addressLine1:
          formData.addressLine1.trim(),

        addressLine2:
          formData.addressLine2.trim(),

        city:
          formData.city.trim(),

        state:
          formData.state.trim(),

        postalCode:
          formData.postalCode.trim(),

        country:
          formData.country.trim() ||
          "India",

        isDefault:
          Boolean(
            formData.isDefault,
          ),
      };

      try {
        setSaving(true);

        if (editingId) {
          await updateAddress(
            editingId,
            payload,
          );
        } else {
          await addAddress(
            payload,
          );
        }

        setFormData({
          ...EMPTY_ADDRESS,
        });

        setEditingId(null);
        setShowForm(false);

        await loadAddresses();
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to save the address.",
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDelete =
    async (addressId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this address?",
        );

      if (!confirmed) {
        return;
      }

      try {
        setError("");

        await deleteAddress(
          addressId,
        );

        await loadAddresses();
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to delete the address.",
        );
      }
    };

  const handleDefault =
    async (addressId) => {
      try {
        setError("");

        await setDefaultAddress(
          addressId,
        );

        await loadAddresses();
      } catch (requestError) {
        setError(
          requestError?.message ||
            "Unable to update the default address.",
        );
      }
    };

  return (
    <section
      className={styles.page}
    >
      <div
        className={styles.heading}
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Delivery
          </span>

          <h2>
            My Addresses
          </h2>

          <p>
            Manage your saved delivery
            addresses.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            className={
              styles.addButton
            }
            onClick={
              openAddForm
            }
          >
            <FiPlus size={16} />

            Add Address
          </button>
        )}
      </div>

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      )}

      {showForm && (
        <form
          className={
            styles.formCard
          }
          onSubmit={
            handleSubmit
          }
        >
          <div
            className={
              styles.formHeader
            }
          >
            <div>
              <h3>
                {editingId
                  ? "Edit Address"
                  : "Add New Address"}
              </h3>

              <p>
                Enter your delivery
                details below.
              </p>
            </div>
          </div>

          <div
            className={
              styles.formGrid
            }
          >
            <div
              className={
                styles.field
              }
            >
              <label>
                Address Label
              </label>

              <select
                name="label"
                value={
                  formData.label
                }
                onChange={
                  handleChange
                }
                disabled={saving}
              >
                <option value="Home">
                  Home
                </option>

                <option value="Work">
                  Work
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label>
                Full Name
              </label>

              <input
                name="fullName"
                value={
                  formData.fullName
                }
                onChange={
                  handleChange
                }
                autoComplete="name"
                disabled={saving}
                required
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label>
                Mobile Number
              </label>

              <div
                className={
                  styles.phoneInput
                }
              >
                <select
                  name="countryCode"
                  value={
                    formData.countryCode
                  }
                  onChange={
                    handleChange
                  }
                  disabled={saving}
                  aria-label="Country code"
                >
                  {COUNTRY_CODES.map(
                    (country) => (
                      <option
                        key={
                          country.code
                        }
                        value={
                          country.code
                        }
                      >
                        {country.code}{" "}
                        {country.name}
                      </option>
                    ),
                  )}
                </select>

                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  value={
                    formData.phone
                  }
                  onChange={
                    handlePhoneChange
                  }
                  autoComplete="tel"
                  maxLength={15}
                  disabled={saving}
                  required
                />
              </div>
            </div>

            <div
              className={
                styles.field
              }
            >
              <label>
                Country
              </label>

              <input
                name="country"
                value={
                  formData.country
                }
                onChange={
                  handleChange
                }
                autoComplete="country-name"
                disabled={saving}
              />
            </div>

            <div
              className={`${styles.field} ${styles.full}`}
            >
              <label>
                Address Line 1
              </label>

              <input
                name="addressLine1"
                value={
                  formData.addressLine1
                }
                onChange={
                  handleChange
                }
                autoComplete="address-line1"
                disabled={saving}
                required
              />
            </div>

            <div
              className={`${styles.field} ${styles.full}`}
            >
              <label>
                Address Line 2
              </label>

              <input
                name="addressLine2"
                value={
                  formData.addressLine2
                }
                onChange={
                  handleChange
                }
                autoComplete="address-line2"
                disabled={saving}
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label>
                City
              </label>

              <input
                name="city"
                value={
                  formData.city
                }
                onChange={
                  handleChange
                }
                autoComplete="address-level2"
                disabled={saving}
                required
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label>
                State
              </label>

              <input
                name="state"
                value={
                  formData.state
                }
                onChange={
                  handleChange
                }
                autoComplete="address-level1"
                disabled={saving}
                required
              />
            </div>

            <div
              className={
                styles.field
              }
            >
              <label>
                Postal Code
              </label>

              <input
                name="postalCode"
                value={
                  formData.postalCode
                }
                onChange={
                  handleChange
                }
                autoComplete="postal-code"
                disabled={saving}
                required
              />
            </div>
          </div>

          <label
            className={
              styles.checkbox
            }
          >
            <input
              type="checkbox"
              name="isDefault"
              checked={
                formData.isDefault
              }
              onChange={
                handleChange
              }
              disabled={saving}
            />

            <span>
              Make this my default
              address
            </span>
          </label>

          <div
            className={
              styles.formActions
            }
          >
            <button
              type="button"
              className={
                styles.cancelButton
              }
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                  ...EMPTY_ADDRESS,
                });
                setError("");
              }}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={
                styles.saveButton
              }
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Address"
                  : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <>
          {loading ? (
            <div
              className={
                styles.state
              }
            >
              Loading addresses...
            </div>
          ) : addresses.length ===
            0 ? (
            <div
              className={
                styles.empty
              }
            >
              <FiMapPin
                size={25}
              />

              <h3>
                No saved addresses
              </h3>

              <p>
                Add an address to make
                checkout faster.
              </p>

              <button
                type="button"
                onClick={
                  openAddForm
                }
              >
                Add Address
              </button>
            </div>
          ) : (
            <div
              className={
                styles.list
              }
            >
              {addresses.map(
                (address) => {
                  const addressId =
                    address._id ||
                    address.id;

                  return (
                    <article
                      className={
                        styles.addressCard
                      }
                      key={
                        addressId
                      }
                    >
                      <div
                        className={
                          styles.addressTop
                        }
                      >
                        <div
                          className={
                            styles.addressTitle
                          }
                        >
                          <FiMapPin
                            size={16}
                          />

                          <strong>
                            {address.label ||
                              "Address"}
                          </strong>

                          {address.isDefault && (
                            <span
                              className={
                                styles.defaultBadge
                              }
                            >
                              Default
                            </span>
                          )}
                        </div>

                        <div
                          className={
                            styles.actions
                          }
                        >
                          {!address.isDefault && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDefault(
                                  addressId,
                                )
                              }
                              title="Make default"
                            >
                              <FiStar
                                size={15}
                              />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                address,
                              )
                            }
                            title="Edit address"
                          >
                            <FiEdit2
                              size={15}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                addressId,
                              )
                            }
                            title="Delete address"
                          >
                            <FiTrash2
                              size={15}
                            />
                          </button>
                        </div>
                      </div>

                      <div
                        className={
                          styles.addressBody
                        }
                      >
                        <strong>
                          {
                            address.fullName
                          }
                        </strong>

                        <span>
                          {
                            address.countryCode
                          }{" "}
                          {
                            address.phone
                          }
                        </span>

                        <p>
                          {
                            address.addressLine1
                          }

                          {address.addressLine2 && (
                            <>
                              <br />

                              {
                                address.addressLine2
                              }
                            </>
                          )}

                          <br />

                          {
                            address.city
                          }
                          ,{" "}
                          {
                            address.state
                          }{" "}
                          {
                            address.postalCode
                          }

                          <br />

                          {
                            address.country
                          }
                        </p>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Addresses;