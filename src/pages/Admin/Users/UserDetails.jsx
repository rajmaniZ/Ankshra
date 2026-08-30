// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   Link,
//   useParams,
// } from "react-router-dom";

// import {
//   FiArrowLeft,
//   FiCheckCircle,
//   FiClock,
//   FiRefreshCw,
//   FiShoppingBag,
//   FiTag,
//   FiXCircle,
// } from "react-icons/fi";

// import {
//   getAdminUserById,
//   getAdminOrders,
//   updateAdminUserRole,
//   updateAdminUserStatus,
// } from "../../../services/adminService";

// import {
//   getAdminUserActivity,
//   getAdminUserActivityHistory,
//   getAdminUserPromotionUsage,
// } from "../../../services/adminUserService";

// import styles from "./UserDetails.module.css";


// function toNumber(
//   value,
//   fallback = 0,
// ) {
//   const number = Number(value);

//   return Number.isFinite(number)
//     ? number
//     : fallback;
// }


// function roundMoney(value) {
//   return (
//     Math.round(
//       (
//         toNumber(value) +
//         Number.EPSILON
//       ) *
//         100,
//     ) / 100
//   );
// }


// function getId(value) {
//   if (!value) {
//     return "";
//   }

//   if (
//     typeof value ===
//     "object"
//   ) {
//     return String(
//       value._id ||
//         value.id ||
//         "",
//     );
//   }

//   return String(value);
// }


// function getUser(response) {
//   return (
//     response?.data?.user ||
//     response?.user ||
//     (
//       response?.data &&
//       !Array.isArray(
//         response.data,
//       )
//         ? response.data
//         : null
//     ) ||
//     null
//   );
// }


// function getData(response) {
//   return (
//     response?.data ||
//     response ||
//     {}
//   );
// }


// function getArray(
//   data,
//   keys = [],
// ) {
//   if (
//     Array.isArray(data)
//   ) {
//     return data;
//   }

//   for (
//     const key of keys
//   ) {
//     if (
//       Array.isArray(
//         data?.[key],
//       )
//     ) {
//       return data[key];
//     }
//   }

//   return [];
// }


// function getErrorMessage(
//   error,
// ) {
//   return (
//     error?.message ||
//     error?.data?.message ||
//     "Unable to load user details."
//   );
// }


// function formatDate(
//   value,
// ) {
//   if (!value) {
//     return "—";
//   }

//   const date =
//     new Date(value);

//   if (
//     Number.isNaN(
//       date.getTime(),
//     )
//   ) {
//     return "—";
//   }

//   return date.toLocaleDateString(
//     "en-IN",
//     {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     },
//   );
// }


// function formatDateTime(
//   value,
// ) {
//   if (!value) {
//     return "—";
//   }

//   const date =
//     new Date(value);

//   if (
//     Number.isNaN(
//       date.getTime(),
//     )
//   ) {
//     return "—";
//   }

//   return date.toLocaleString(
//     "en-IN",
//     {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     },
//   );
// }


// function formatCurrency(
//   value,
// ) {
//   return new Intl.NumberFormat(
//     "en-IN",
//     {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     },
//   ).format(
//     toNumber(value),
//   );
// }


// function getOrderTotal(
//   order,
// ) {
//   return toNumber(
//     order?.total ??
//       order?.totalAmount ??
//       order?.grandTotal ??
//       0,
//   );
// }


// function getOrderStatus(
//   order,
// ) {
//   return String(
//     order?.orderStatus ||
//       order?.status ||
//       "",
//   ).toLowerCase();
// }


// function getPaymentStatus(
//   order,
// ) {
//   return String(
//     order?.paymentStatus ||
//       "",
//   ).toLowerCase();
// }


// function getOrderItems(
//   order,
// ) {
//   return Array.isArray(
//     order?.items,
//   )
//     ? order.items
//     : [];
// }


// function getCouponCode(
//   order,
// ) {
//   return String(
//     order?.couponCode ||
//       order?.couponId?.code ||
//       order?.coupon?.code ||
//       "",
//   ).trim();
// }


// function getCouponId(
//   order,
// ) {
//   return getId(
//     order?.couponId ||
//       order?.coupon?._id ||
//       order?.coupon?.id,
//   );
// }


// function getCouponDiscount(
//   order,
// ) {
//   return roundMoney(
//     order?.couponDiscount ??
//       0,
//   );
// }


// function getOfferDiscount(
//   order,
// ) {
//   return roundMoney(
//     order?.offerDiscount ??
//       0,
//   );
// }


// function getOfferIds(
//   order,
// ) {
//   const ids = [];

//   if (
//     Array.isArray(
//       order?.offerIds,
//     )
//   ) {
//     order.offerIds.forEach(
//       (offer) => {
//         const id =
//           getId(offer);

//         if (
//           id &&
//           !ids.includes(id)
//         ) {
//           ids.push(id);
//         }
//       },
//     );
//   }

//   getOrderItems(
//     order,
//   ).forEach(
//     (item) => {
//       const id =
//         getId(
//           item?.offerId,
//         );

//       if (
//         id &&
//         !ids.includes(id)
//       ) {
//         ids.push(id);
//       }
//     },
//   );

//   return ids;
// }


// function getOfferName(
//   offer,
// ) {
//   if (
//     !offer
//   ) {
//     return "Offer";
//   }

//   if (
//     typeof offer ===
//     "object"
//   ) {
//     return (
//       offer.name ||
//       offer.title ||
//       offer.code ||
//       "Offer"
//     );
//   }

//   return String(
//     offer,
//   );
// }


// function getPromotionType(
//   item,
// ) {
//   const explicitType =
//     String(
//       item?.promotionType ||
//         item?.type ||
//         "",
//     ).toLowerCase();

//   if (
//     explicitType ===
//       "coupon" ||
//     explicitType ===
//       "coupon_applied"
//   ) {
//     return "coupon";
//   }

//   if (
//     explicitType ===
//       "offer" ||
//     explicitType ===
//       "offer_applied"
//   ) {
//     return "offer";
//   }

//   if (
//     item?.coupon ||
//     item?.couponCode ||
//     item?.couponId ||
//     item?.promotionCode
//   ) {
//     return "coupon";
//   }

//   if (
//     item?.offer ||
//     item?.offerName ||
//     item?.offerId
//   ) {
//     return "offer";
//   }

//   return "";
// }


// function getPromotionName(
//   item,
// ) {
//   const type =
//     getPromotionType(
//       item,
//     );

//   if (
//     type ===
//     "coupon"
//   ) {
//     return (
//       item?.promotionCode ||
//       item?.coupon?.code ||
//       item?.couponCode ||
//       item?.code ||
//       item?.promotionName ||
//       "Coupon"
//     );
//   }

//   if (
//     type ===
//     "offer"
//   ) {
//     return (
//       item?.offer?.name ||
//       item?.offerName ||
//       item?.name ||
//       item?.promotionName ||
//       "Offer"
//     );
//   }

//   return (
//     item?.promotionName ||
//     item?.name ||
//     item?.code ||
//     "Promotion"
//   );
// }


// function getPromotionDiscount(
//   item,
// ) {
//   return toNumber(
//     item?.discountAmount ??
//       item?.discount ??
//       item?.amount ??
//       item?.metadata?.discount ??
//       0,
//   );
// }


// function getPromotionOrder(
//   item,
// ) {
//   return (
//     item?.order?.orderNumber ||
//     item?.orderNumber ||
//     item?.order?.number ||
//     item?.orderId ||
//     "—"
//   );
// }


// function getPromotionDate(
//   item,
// ) {
//   return (
//     item?.usedAt ||
//     item?.createdAt ||
//     item?.order?.createdAt ||
//     item?.date ||
//     null
//   );
// }


// function getActivityDescription(
//   item,
// ) {
//   if (
//     item?.description
//   ) {
//     return item.description;
//   }

//   if (
//     item?.message
//   ) {
//     return item.message;
//   }

//   if (
//     item?.details
//   ) {
//     return item.details;
//   }

//   if (
//     item?.type ===
//     "coupon_applied"
//   ) {
//     return `Coupon ${getPromotionName(
//       item,
//     )} was applied.`;
//   }

//   if (
//     item?.type ===
//     "offer_applied"
//   ) {
//     return `Offer ${getPromotionName(
//       item,
//     )} was applied.`;
//   }

//   if (
//     item?.type ===
//       "order_paid" ||
//     item?.event ===
//       "order_paid"
//   ) {
//     const orderNumber =
//       item?.orderNumber ||
//       item?.order?.orderNumber;

//     if (
//       orderNumber
//     ) {
//       return `Payment received for order ${orderNumber}.`;
//     }

//     return "Payment received for an order.";
//   }

//   if (
//     item?.type ===
//       "order" &&
//     item?.orderNumber
//   ) {
//     return `Order ${item.orderNumber}`;
//   }

//   return "";
// }


// function getActivityIcon(
//   type,
// ) {
//   const value =
//     String(
//       type || "",
//     ).toLowerCase();

//   if (
//     value.includes(
//       "coupon",
//     )
//   ) {
//     return (
//       <FiTag size={15} />
//     );
//   }

//   if (
//     value.includes(
//       "offer",
//     )
//   ) {
//     return (
//       <FiTag size={15} />
//     );
//   }

//   if (
//     value.includes(
//       "payment",
//     )
//   ) {
//     return (
//       <FiCheckCircle
//         size={15}
//       />
//     );
//   }

//   if (
//     value.includes(
//       "cancel",
//     )
//   ) {
//     return (
//       <FiXCircle
//         size={15}
//       />
//     );
//   }

//   if (
//     value.includes(
//       "login",
//     ) ||
//     value.includes(
//       "sign",
//     )
//   ) {
//     return (
//       <FiClock
//         size={15}
//       />
//     );
//   }

//   return (
//     <FiShoppingBag
//       size={15}
//     />
//   );
// }


// function getOrdersFromResponse(
//   response,
// ) {
//   const data =
//     getData(response);

//   return getArray(
//     data,
//     [
//       "orders",
//       "items",
//       "results",
//     ],
//   );
// }


// async function getAllUserOrders(
//   userId,
// ) {
//   const allOrders = [];

//   let page = 1;

//   let pages = 1;

//   do {
//     const response =
//       await getAdminOrders({
//         userId,
//         page,
//         limit: 100,
//       });

//     const data =
//       getData(response);

//     const orders =
//       getOrdersFromResponse(
//         response,
//       );

//     allOrders.push(
//       ...orders,
//     );

//     const pagination =
//       data?.pagination ||
//       response?.pagination ||
//       {};

//     pages =
//       Math.max(
//         Number(
//           pagination.pages,
//         ) || 1,
//         1,
//       );

//     if (
//       orders.length === 0
//     ) {
//       break;
//     }

//     page += 1;
//   } while (
//     page <= pages
//   );

//   return allOrders;
// }


// function buildOrderStatistics(
//   orders,
// ) {
//   const statistics = {
//     totalOrders: 0,
//     totalOrderedAmount: 0,
//     paidOrders: 0,
//     totalPaidAmount: 0,
//     cancelledOrders: 0,
//     deliveredOrders: 0,
//     totalItemsPurchased: 0,
//   };

//   orders.forEach(
//     (order) => {
//       statistics.totalOrders +=
//         1;

//       statistics.totalOrderedAmount =
//         roundMoney(
//           statistics.totalOrderedAmount +
//             getOrderTotal(
//               order,
//             ),
//         );

//       const paymentStatus =
//         getPaymentStatus(
//           order,
//         );

//       const orderStatus =
//         getOrderStatus(
//           order,
//         );

//       if (
//         paymentStatus ===
//         "paid"
//       ) {
//         statistics.paidOrders +=
//           1;

//         statistics.totalPaidAmount =
//           roundMoney(
//             statistics.totalPaidAmount +
//               getOrderTotal(
//                 order,
//               ),
//           );
//       }

//       if (
//         orderStatus ===
//         "cancelled"
//       ) {
//         statistics.cancelledOrders +=
//           1;
//       }

//       if (
//         orderStatus ===
//         "delivered"
//       ) {
//         statistics.deliveredOrders +=
//           1;
//       }

//       statistics.totalItemsPurchased +=
//         getOrderItems(
//           order,
//         ).reduce(
//           (
//             total,
//             item,
//           ) =>
//             total +
//             toNumber(
//               item?.quantity,
//               0,
//             ),
//           0,
//         );
//     },
//   );

//   return statistics;
// }


// function buildPromotionRowsFromOrders(
//   orders,
// ) {
//   const rows = [];

//   orders.forEach(
//     (order) => {
//       const orderNumber =
//         order?.orderNumber ||
//         getId(order);

//       const createdAt =
//         order?.createdAt ||
//         order?.updatedAt ||
//         null;

//       const paymentStatus =
//         order?.paymentStatus ||
//         "—";

//       const orderStatus =
//         order?.orderStatus ||
//         "—";

//       const couponCode =
//         getCouponCode(
//           order,
//         );

//       const couponId =
//         getCouponId(
//           order,
//         );

//       if (
//         couponCode ||
//         couponId
//       ) {
//         rows.push({
//           id: `coupon-${getId(
//             order,
//           )}`,
//           promotionType:
//             "coupon",
//           code:
//             couponCode ||
//             "Coupon",
//           discountAmount:
//             getCouponDiscount(
//               order,
//             ),
//           orderNumber,
//           paymentStatus,
//           orderStatus,
//           createdAt,
//           usedAt:
//             order?.couponAppliedAt ||
//             createdAt,
//         });
//       }

//       const offers =
//         Array.isArray(
//           order?.offerIds,
//         )
//           ? order.offerIds
//           : [];

//       const itemOffers =
//         getOrderItems(
//           order,
//         )
//           .map(
//             (item) =>
//               item?.offerId,
//           )
//           .filter(Boolean);

//       const combinedOffers =
//         [
//           ...offers,
//           ...itemOffers,
//         ];

//       const uniqueOffers =
//         [];

//       combinedOffers.forEach(
//         (offer) => {
//           const offerId =
//             getId(
//               offer,
//             );

//           const key =
//             offerId ||
//             getOfferName(
//               offer,
//             );

//           if (
//             !uniqueOffers.some(
//               (item) =>
//                 item.key ===
//                 key,
//             )
//           ) {
//             uniqueOffers.push({
//               key,
//               offer,
//             });
//           }
//         },
//       );

//       uniqueOffers.forEach(
//         ({
//           key,
//           offer,
//         }) => {
//           rows.push({
//             id: `offer-${getId(
//               order,
//             )}-${key}`,
//             promotionType:
//               "offer",
//             name:
//               getOfferName(
//                 offer,
//               ),
//             offerName:
//               getOfferName(
//                 offer,
//               ),
//             offerId:
//               getId(
//                 offer,
//               ),
//             discountAmount:
//               getOfferDiscount(
//                 order,
//               ),
//             orderNumber,
//             paymentStatus,
//             orderStatus,
//             createdAt,
//             usedAt:
//               order?.offerAppliedAt ||
//               createdAt,
//           });
//         },
//       );
//     },
//   );

//   return rows.sort(
//     (
//       first,
//       second,
//     ) => {
//       const firstDate =
//         new Date(
//           getPromotionDate(
//             first,
//           ) || 0,
//         ).getTime();

//       const secondDate =
//         new Date(
//           getPromotionDate(
//             second,
//           ) || 0,
//         ).getTime();

//       return (
//         secondDate -
//         firstDate
//       );
//     },
//   );
// }


// function mergePromotionRows(
//   endpointRows,
//   orderRows,
// ) {
//   const combined = [
//     ...endpointRows,
//     ...orderRows,
//   ];

//   const seen =
//     new Set();

//   return combined.filter(
//     (item) => {
//       const type =
//         getPromotionType(
//           item,
//         );

//       const order =
//         getPromotionOrder(
//           item,
//         );

//       const name =
//         getPromotionName(
//           item,
//         );

//       const date =
//         getPromotionDate(
//           item,
//         );

//       const key =
//         `${type}-${name}-${order}-${date}`;

//       if (
//         seen.has(key)
//       ) {
//         return false;
//       }

//       seen.add(key);

//       return true;
//     },
//   );
// }


// function UserDetails() {
//   const { id } =
//     useParams();

//   const [user, setUser] =
//     useState(null);

//   const [activityData, setActivityData] =
//     useState({});

//   const [activityItems, setActivityItems] =
//     useState([]);

//   const [promotionUsage, setPromotionUsage] =
//     useState([]);

//   const [promotionSummary, setPromotionSummary] =
//     useState({});

//   const [orders, setOrders] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [refreshing, setRefreshing] =
//     useState(false);

//   const [saving, setSaving] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   const loadUser =
//     useCallback(
//       async ({
//         silent = false,
//       } = {}) => {
//         if (!id) {
//           setError(
//             "User ID is missing.",
//           );

//           setLoading(false);

//           return;
//         }

//         try {
//           if (silent) {
//             setRefreshing(
//               true,
//             );
//           } else {
//             setLoading(true);
//           }

//           setError("");

//           const results =
//             await Promise.allSettled(
//               [
//                 getAdminUserById(
//                   id,
//                 ),

//                 getAdminUserActivity(
//                   id,
//                 ),

//                 getAdminUserActivityHistory(
//                   id,
//                   {
//                     page: 1,
//                     limit: 100,
//                   },
//                 ),

//                 getAdminUserPromotionUsage(
//                   id,
//                   {
//                     page: 1,
//                     limit: 100,
//                   },
//                 ),

//                 getAllUserOrders(
//                   id,
//                 ),
//               ],
//             );

//           const [
//             userResult,
//             activityResult,
//             historyResult,
//             promotionResult,
//             ordersResult,
//           ] = results;

//           if (
//             userResult.status ===
//             "rejected"
//           ) {
//             throw userResult.reason;
//           }

//           const currentUser =
//             getUser(
//               userResult.value,
//             );

//           if (
//             !currentUser
//           ) {
//             throw new Error(
//               "User not found.",
//             );
//           }

//           setUser(
//             currentUser,
//           );

//           let currentActivity =
//             {};

//           if (
//             activityResult.status ===
//             "fulfilled"
//           ) {
//             currentActivity =
//               getData(
//                 activityResult.value,
//               );

//             setActivityData(
//               currentActivity,
//             );

//             const backendActivities =
//               getArray(
//                 currentActivity,
//                 [
//                   "activities",
//                   "activity",
//                   "items",
//                 ],
//               );

//             setActivityItems(
//               backendActivities,
//             );
//           } else {
//             console.error(
//               "Failed to load user activity:",
//               activityResult.reason,
//             );

//             setActivityData(
//               {},
//             );

//             setActivityItems(
//               [],
//             );
//           }

//           if (
//             historyResult.status ===
//             "fulfilled"
//           ) {
//             const historyData =
//               getData(
//                 historyResult.value,
//               );

//             const historyItems =
//               getArray(
//                 historyData,
//                 [
//                   "activities",
//                   "history",
//                   "items",
//                 ],
//               );

//             if (
//               historyItems.length >
//               0
//             ) {
//               setActivityItems(
//                 historyItems,
//               );
//             }
//           } else {
//             console.error(
//               "Failed to load activity history:",
//               historyResult.reason,
//             );
//           }

//           let currentOrders =
//             [];

//           if (
//             ordersResult.status ===
//             "fulfilled"
//           ) {
//             currentOrders =
//               Array.isArray(
//                 ordersResult.value,
//               )
//                 ? ordersResult.value
//                 : [];

//             setOrders(
//               currentOrders,
//             );
//           } else {
//             console.error(
//               "Failed to load user orders:",
//               ordersResult.reason,
//             );

//             setOrders(
//               [],
//             );
//           }

//           if (
//             promotionResult.status ===
//             "fulfilled"
//           ) {
//             const promotionData =
//               getData(
//                 promotionResult.value,
//               );

//             setPromotionSummary(
//               promotionData?.summary ||
//                 {},
//             );

//             const endpointRows =
//               [];

//             const directActivities =
//               getArray(
//                 promotionData,
//                 [
//                   "activities",
//                   "usages",
//                   "usage",
//                   "promotions",
//                   "items",
//                 ],
//               );

//             directActivities.forEach(
//               (item) => {
//                 endpointRows.push(
//                   item,
//                 );
//               },
//             );

//             const coupons =
//               getArray(
//                 promotionData,
//                 [
//                   "coupons",
//                 ],
//               );

//             coupons.forEach(
//               (item) => {
//                 endpointRows.push({
//                   ...item,
//                   promotionType:
//                     "coupon",
//                 });
//               },
//             );

//             const offers =
//               getArray(
//                 promotionData,
//                 [
//                   "offers",
//                 ],
//               );

//             offers.forEach(
//               (item) => {
//                 endpointRows.push({
//                   ...item,
//                   promotionType:
//                     "offer",
//                 });
//               },
//             );

//             const orderHistory =
//               getArray(
//                 promotionData,
//                 [
//                   "orderHistory",
//                 ],
//               );

//             orderHistory.forEach(
//               (order) => {
//                 const couponCode =
//                   getCouponCode(
//                     order,
//                   );

//                 if (
//                   couponCode
//                 ) {
//                   endpointRows.push({
//                     ...order,
//                     promotionType:
//                       "coupon",
//                     code:
//                       couponCode,
//                     discountAmount:
//                       getCouponDiscount(
//                         order,
//                       ),
//                   });
//                 }

//                 const offerIds =
//                   getOfferIds(
//                     order,
//                   );

//                 offerIds.forEach(
//                   (offerId) => {
//                     endpointRows.push({
//                       ...order,
//                       promotionType:
//                         "offer",
//                       offerId,
//                       discountAmount:
//                         getOfferDiscount(
//                           order,
//                         ),
//                     });
//                   },
//                 );
//               },
//             );

//             const orderRows =
//               buildPromotionRowsFromOrders(
//                 currentOrders,
//               );

//             setPromotionUsage(
//               mergePromotionRows(
//                 endpointRows,
//                 orderRows,
//               ),
//             );
//           } else {
//             console.error(
//               "Failed to load promotion usage:",
//               promotionResult.reason,
//             );

//             setPromotionSummary(
//               {},
//             );

//             setPromotionUsage(
//               buildPromotionRowsFromOrders(
//                 currentOrders,
//               ),
//             );
//           }
//         } catch (
//           requestError
//         ) {
//           console.error(
//             "Failed to load user details:",
//             requestError,
//           );

//           setError(
//             getErrorMessage(
//               requestError,
//             ),
//           );
//         } finally {
//           setLoading(false);
//           setRefreshing(
//             false,
//           );
//         }
//       },
//       [id],
//     );

//   useEffect(() => {
//     loadUser();
//   }, [loadUser]);


//   const handleStatus =
//     async () => {
//       if (
//         !user ||
//         saving
//       ) {
//         return;
//       }

//       const userId =
//         getId(user);

//       if (!userId) {
//         return;
//       }

//       try {
//         setSaving(true);
//         setError("");

//         const response =
//           await updateAdminUserStatus(
//             userId,
//             !Boolean(
//               user.isActive,
//             ),
//           );

//         const updatedUser =
//           getUser(
//             response,
//           );

//         setUser(
//           updatedUser || {
//             ...user,
//             isActive:
//               !Boolean(
//                 user.isActive,
//               ),
//           },
//         );
//       } catch (
//         requestError
//       ) {
//         console.error(
//           "Failed to update user status:",
//           requestError,
//         );

//         setError(
//           getErrorMessage(
//             requestError,
//           ),
//         );
//       } finally {
//         setSaving(false);
//       }
//     };


//   const handleRole =
//     async (
//       event,
//     ) => {
//       if (
//         !user ||
//         saving
//       ) {
//         return;
//       }

//       const nextRole =
//         event.target.value;

//       if (
//         nextRole !==
//           "customer" &&
//         nextRole !==
//           "admin"
//       ) {
//         return;
//       }

//       if (
//         nextRole ===
//         user.role
//       ) {
//         return;
//       }

//       const userId =
//         getId(user);

//       if (!userId) {
//         return;
//       }

//       try {
//         setSaving(true);
//         setError("");

//         const response =
//           await updateAdminUserRole(
//             userId,
//             nextRole,
//           );

//         const updatedUser =
//           getUser(
//             response,
//           );

//         setUser(
//           updatedUser || {
//             ...user,
//             role: nextRole,
//           },
//         );
//       } catch (
//         requestError
//       ) {
//         console.error(
//           "Failed to update user role:",
//           requestError,
//         );

//         setError(
//           getErrorMessage(
//             requestError,
//           ),
//         );
//       } finally {
//         setSaving(false);
//       }
//     };


//   const statistics =
//     useMemo(
//       () => {
//         const calculated =
//           buildOrderStatistics(
//             orders,
//           );

//         const backend =
//           activityData?.statistics ||
//           {};

//         return {
//           totalOrders:
//             calculated.totalOrders ||
//             toNumber(
//               backend.totalOrders,
//             ),

//           orderedAmount:
//             calculated.totalOrderedAmount ||
//             toNumber(
//               backend.totalOrderedAmount,
//             ),

//           paidOrders:
//             calculated.paidOrders ||
//             toNumber(
//               backend.paidOrders,
//             ),

//           paidAmount:
//             calculated.totalPaidAmount ||
//             toNumber(
//               backend.totalPaidAmount,
//             ),

//           cancelledOrders:
//             calculated.cancelledOrders ||
//             toNumber(
//               backend.cancelledOrders,
//             ),

//           deliveredOrders:
//             calculated.deliveredOrders ||
//             toNumber(
//               backend.deliveredOrders,
//             ),

//           totalItemsPurchased:
//             calculated.totalItemsPurchased ||
//             toNumber(
//               backend.totalItemsPurchased,
//             ),
//         };
//       },
//       [
//         orders,
//         activityData,
//       ],
//     );


//   const promotionCounts =
//     useMemo(
//       () => {
//         const rows =
//           promotionUsage;

//         const couponRows =
//           rows.filter(
//             (item) =>
//               getPromotionType(
//                 item,
//               ) === "coupon",
//           );

//         const offerRows =
//           rows.filter(
//             (item) =>
//               getPromotionType(
//                 item,
//               ) === "offer",
//           );

//         const backendCouponCount =
//           toNumber(
//             promotionSummary?.couponUsages ??
//               promotionSummary?.couponUsageCount ??
//               promotionSummary?.couponsUsed,
//           );

//         const backendOfferCount =
//           toNumber(
//             promotionSummary?.offerUsages ??
//               promotionSummary?.offerUsageCount ??
//               promotionSummary?.offersUsed,
//           );

//         const couponCount =
//           couponRows.length ||
//           backendCouponCount ||
//           toNumber(
//             activityData?.statistics
//               ?.couponUsageCount,
//           );

//         const offerCount =
//           offerRows.length ||
//           backendOfferCount ||
//           toNumber(
//             activityData?.statistics
//               ?.offerUsageCount,
//           );

//         return {
//           coupons:
//             couponCount,

//           offers:
//             offerCount,

//           total:
//             couponCount +
//             offerCount,
//         };
//       },
//       [
//         promotionUsage,
//         promotionSummary,
//         activityData,
//       ],
//     );


//   const totalSpent =
//     statistics.paidAmount;


//   const userName =
//     user?.name ||
//     user?.fullName ||
//     user?.email ||
//     "User";


//   const initial =
//     userName
//       .trim()
//       .charAt(0)
//       .toUpperCase() ||
//     "U";


//   const active =
//     Boolean(
//       user?.isActive,
//     );


//   if (loading) {
//     return (
//       <section
//         className={
//           styles.page
//         }
//       >
//         <div
//           className={
//             styles.state
//           }
//         >
//           <FiRefreshCw
//             size={18}
//             className={
//               styles.loadingIcon
//             }
//           />

//           <span>
//             Loading user details...
//           </span>
//         </div>
//       </section>
//     );
//   }


//   if (!user) {
//     return (
//       <section
//         className={
//           styles.page
//         }
//       >
//         <div
//           className={
//             styles.errorCard
//           }
//         >
//           <strong>
//             User not found
//           </strong>

//           <p>
//             {error ||
//               "The requested user could not be found."}
//           </p>

//           <Link
//             to="/admin/users"
//             className={
//               styles.backButton
//             }
//           >
//             <FiArrowLeft
//               size={16}
//             />

//             Back to Users
//           </Link>
//         </div>
//       </section>
//     );
//   }


//   return (
//     <section
//       className={
//         styles.page
//       }
//     >
//       <div
//         className={
//           styles.heading
//         }
//       >
//         <div>
//           <Link
//             to="/admin/users"
//             className={
//               styles.back
//             }
//           >
//             <FiArrowLeft
//               size={16}
//             />

//             Back to Users
//           </Link>

//           <span
//             className={
//               styles.eyebrow
//             }
//           >
//             Account Management
//           </span>

//           <h1
//             className={
//               styles.title
//             }
//           >
//             User Details
//           </h1>

//           <p
//             className={
//               styles.subtitle
//             }
//           >
//             View account information,
//             orders, payments, reviews,
//             and promotion usage.
//           </p>
//         </div>

//         <button
//           type="button"
//           className={
//             styles.refresh
//           }
//           onClick={() =>
//             loadUser({
//               silent: true,
//             })
//           }
//           disabled={
//             refreshing ||
//             saving
//           }
//         >
//           <FiRefreshCw
//             size={16}
//             className={
//               refreshing
//                 ? styles.spin
//                 : ""
//             }
//           />

//           {refreshing
//             ? "Refreshing..."
//             : "Refresh"}
//         </button>
//       </div>


//       {error && (
//         <div
//           className={
//             styles.error
//           }
//         >
//           {error}
//         </div>
//       )}


//       <div
//         className={
//           styles.profileCard
//         }
//       >
//         <div
//           className={
//             styles.profileMain
//           }
//         >
//           <div
//             className={
//               styles.avatar
//             }
//           >
//             {initial}
//           </div>

//           <div
//             className={
//               styles.profileInfo
//             }
//           >
//             <h2>
//               {userName}
//             </h2>

//             <p>
//               {user.email ||
//                 "No email available"}
//             </p>

//             <span
//               className={
//                 active
//                   ? styles.activeBadge
//                   : styles.inactiveBadge
//               }
//             >
//               {active
//                 ? "Active"
//                 : "Inactive"}
//             </span>
//           </div>
//         </div>


//         <div
//           className={
//             styles.profileActions
//           }
//         >
//           <select
//             value={
//               user.role ===
//               "admin"
//                 ? "admin"
//                 : "customer"
//             }
//             onChange={
//               handleRole
//             }
//             disabled={saving}
//             className={
//               styles.roleSelect
//             }
//           >
//             <option value="customer">
//               Customer
//             </option>

//             <option value="admin">
//               Admin
//             </option>
//           </select>

//           <button
//             type="button"
//             className={
//               styles.statusButton
//             }
//             onClick={
//               handleStatus
//             }
//             disabled={saving}
//           >
//             {active
//               ? "Deactivate User"
//               : "Activate User"}
//           </button>
//         </div>
//       </div>


//       <div
//         className={
//           styles.infoGrid
//         }
//       >
//         <div
//           className={
//             styles.infoItem
//           }
//         >
//           <span>Email</span>
//           <strong>
//             {user.email ||
//               "—"}
//           </strong>
//         </div>

//         <div
//           className={
//             styles.infoItem
//           }
//         >
//           <span>Phone</span>
//           <strong>
//             {user.phone ||
//               "—"}
//           </strong>
//         </div>

//         <div
//           className={
//             styles.infoItem
//           }
//         >
//           <span>Role</span>
//           <strong>
//             {user.role ===
//             "admin"
//               ? "Admin"
//               : "Customer"}
//           </strong>
//         </div>

//         <div
//           className={
//             styles.infoItem
//           }
//         >
//           <span>Joined</span>
//           <strong>
//             {formatDate(
//               user.createdAt,
//             )}
//           </strong>
//         </div>

//         <div
//           className={
//             styles.infoItem
//           }
//         >
//           <span>
//             Last Updated
//           </span>
//           <strong>
//             {formatDate(
//               user.updatedAt,
//             )}
//           </strong>
//         </div>

//         <div
//           className={
//             styles.infoItem
//           }
//         >
//           <span>User ID</span>
//           <strong>
//             {getId(user)}
//           </strong>
//         </div>
//       </div>


//       <div
//         className={
//           styles.summaryGrid
//         }
//       >
//         <div
//           className={
//             styles.summaryCard
//           }
//         >
//           <span>Orders</span>

//           <strong>
//             {
//               statistics.totalOrders
//             }
//           </strong>

//           <small>
//             {
//               statistics.paidOrders
//             }{" "}
//             paid
//           </small>
//         </div>

//         <div
//           className={
//             styles.summaryCard
//           }
//         >
//           <span>
//             Total Spent
//           </span>

//           <strong>
//             {formatCurrency(
//               totalSpent,
//             )}
//           </strong>

//           <small>
//             Ordered:{" "}
//             {formatCurrency(
//               statistics.orderedAmount,
//             )}
//           </small>
//         </div>

//         <div
//           className={
//             styles.summaryCard
//           }
//         >
//           <span>Reviews</span>

//           <strong>
//             {toNumber(
//               activityData
//                 ?.reviews
//                 ?.total ??
//                 activityData
//                   ?.reviewCount ??
//                 user?.reviewCount ??
//                 0,
//             )}
//           </strong>

//           <small>
//             Customer reviews
//           </small>
//         </div>

//         <div
//           className={
//             styles.summaryCard
//           }
//         >
//           <span>
//             Promotions Used
//           </span>

//           <strong>
//             {
//               promotionCounts.total
//             }
//           </strong>

//           <small>
//             {
//               promotionCounts.coupons
//             }{" "}
//             coupons ·{" "}
//             {
//               promotionCounts.offers
//             }{" "}
//             offers
//           </small>
//         </div>
//       </div>


//       <div
//         className={
//           styles.section
//         }
//       >
//         <div
//           className={
//             styles.sectionHeader
//           }
//         >
//           <div>
//             <h2>
//               Account Activity
//             </h2>

//             <p>
//               Recent activity recorded
//               for this user.
//             </p>
//           </div>

//           <span
//             className={
//               styles.sectionCount
//             }
//           >
//             {
//               activityItems.length
//             }{" "}
//             activities
//           </span>
//         </div>


//         {activityItems.length ===
//         0 ? (
//           <div
//             className={
//               styles.empty
//             }
//           >
//             <FiClock
//               size={24}
//             />

//             <p>
//               No activity recorded
//               for this user yet.
//             </p>
//           </div>
//         ) : (
//           <div
//             className={
//               styles.activityList
//             }
//           >
//             {activityItems.map(
//               (
//                 item,
//                 index,
//               ) => {
//                 const key =
//                   getId(item) ||
//                   `${item?.type || "activity"}-${item?.createdAt || index}`;

//                 const type =
//                   item?.type ||
//                   item?.action ||
//                   item?.event ||
//                   "activity";

//                 return (
//                   <div
//                     className={
//                       styles.activityItem
//                     }
//                     key={key}
//                   >
//                     <div
//                       className={
//                         styles.activityIcon
//                       }
//                     >
//                       {getActivityIcon(
//                         type,
//                       )}
//                     </div>

//                     <div
//                       className={
//                         styles.activityContent
//                       }
//                     >
//                       <strong>
//                         {item?.action ||
//                           type}
//                       </strong>

//                       <p>
//                         {getActivityDescription(
//                           item,
//                         )}
//                       </p>

//                       <span>
//                         {formatDateTime(
//                           item?.createdAt ||
//                             item?.timestamp ||
//                             item?.date,
//                         )}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               },
//             )}
//           </div>
//         )}
//       </div>


//       <div
//         className={
//           styles.section
//         }
//       >
//         <div
//           className={
//             styles.sectionHeader
//           }
//         >
//           <div>
//             <h2>
//               Promotion Usage
//             </h2>

//             <p>
//               Coupons and offers
//               actually used by this
//               customer.
//             </p>
//           </div>

//           <span
//             className={
//               styles.sectionCount
//             }
//           >
//             {
//               promotionCounts.total
//             }{" "}
//             uses
//           </span>
//         </div>


//         {promotionUsage.length ===
//         0 ? (
//           <div
//             className={
//               styles.empty
//             }
//           >
//             <FiTag
//               size={26}
//             />

//             <p>
//               No promotion usage
//               recorded.
//             </p>

//             <span>
//               Promotion usage will
//               appear here after a
//               coupon or offer is
//               successfully used on
//               an order.
//             </span>
//           </div>
//         ) : (
//           <div
//             className={
//               styles.tableWrapper
//             }
//           >
//             <table
//               className={
//                 styles.table
//               }
//             >
//               <thead>
//                 <tr>
//                   <th>
//                     Promotion
//                   </th>

//                   <th>
//                     Type
//                   </th>

//                   <th>
//                     Discount
//                   </th>

//                   <th>
//                     Order
//                   </th>

//                   <th>
//                     Payment
//                   </th>

//                   <th>
//                     Date
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {promotionUsage.map(
//                   (
//                     item,
//                     index,
//                   ) => {
//                     const type =
//                       getPromotionType(
//                         item,
//                       );

//                     const key =
//                       item?.id ||
//                       getId(
//                         item,
//                       ) ||
//                       `${type}-${getPromotionName(
//                         item,
//                       )}-${index}`;

//                     return (
//                       <tr
//                         key={key}
//                       >
//                         <td>
//                           <div
//                             className={
//                               styles.promotionName
//                             }
//                           >
//                             <FiTag
//                               size={14}
//                             />

//                             <strong>
//                               {getPromotionName(
//                                 item,
//                               )}
//                             </strong>
//                           </div>
//                         </td>

//                         <td>
//                           <span
//                             className={
//                               type ===
//                               "coupon"
//                                 ? styles.couponBadge
//                                 : styles.offerBadge
//                             }
//                           >
//                             {type ===
//                             "coupon"
//                               ? "Coupon"
//                               : "Offer"}
//                           </span>
//                         </td>

//                         <td>
//                           {formatCurrency(
//                             getPromotionDiscount(
//                               item,
//                             ),
//                           )}
//                         </td>

//                         <td>
//                           {getPromotionOrder(
//                             item,
//                           )}
//                         </td>

//                         <td>
//                           {item?.order
//                             ?.paymentStatus ||
//                             item?.paymentStatus ||
//                             "—"}
//                         </td>

//                         <td>
//                           {formatDateTime(
//                             getPromotionDate(
//                               item,
//                             ),
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   },
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>


//       <div
//         className={
//           styles.section
//         }
//       >
//         <div
//           className={
//             styles.sectionHeader
//           }
//         >
//           <div>
//             <h2>
//               Order Statistics
//             </h2>

//             <p>
//               Calculated from the
//               customer's actual orders.
//             </p>
//           </div>
//         </div>


//         <div
//           className={
//             styles.statisticsGrid
//           }
//         >
//           <div
//             className={
//               styles.statisticsItem
//             }
//           >
//             <span>
//               Total Ordered
//             </span>

//             <strong>
//               {formatCurrency(
//                 statistics.orderedAmount,
//               )}
//             </strong>
//           </div>

//           <div
//             className={
//               styles.statisticsItem
//             }
//           >
//             <span>
//               Paid Orders
//             </span>

//             <strong>
//               {
//                 statistics.paidOrders
//               }
//             </strong>
//           </div>

//           <div
//             className={
//               styles.statisticsItem
//             }
//           >
//             <span>
//               Paid Amount
//             </span>

//             <strong>
//               {formatCurrency(
//                 statistics.paidAmount,
//               )}
//             </strong>
//           </div>

//           <div
//             className={
//               styles.statisticsItem
//             }
//           >
//             <span>
//               Cancelled Orders
//             </span>

//             <strong>
//               {
//                 statistics.cancelledOrders
//               }
//             </strong>
//           </div>

//           <div
//             className={
//               styles.statisticsItem
//             }
//           >
//             <span>
//               Delivered Orders
//             </span>

//             <strong>
//               {
//                 statistics.deliveredOrders
//               }
//             </strong>
//           </div>

//           <div
//             className={
//               styles.statisticsItem
//             }
//           >
//             <span>
//               Items Purchased
//             </span>

//             <strong>
//               {
//                 statistics.totalItemsPurchased
//               }
//             </strong>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }


// export default UserDetails;



import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiRefreshCw,
  FiTag,
  FiPercent,
  FiShoppingBag,
  FiCreditCard,
  FiStar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";

import {
  getAdminUserById,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../../services/adminService";

import {
  getAdminOrders,
} from "../../../services/adminOrderService";

import {
  getAdminUserActivity,
  getAdminUserActivityHistory,
  getAdminUserPromotionUsage,
} from "../../../services/adminUserService";

import styles from "./UserDetails.module.css";


function getData(response) {
  return (
    response?.data ||
    response ||
    {}
  );
}


function getUser(response) {
  return (
    response?.data?.user ||
    response?.user ||
    response?.data ||
    null
  );
}


function getId(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value === "object"
  ) {
    return (
      value._id ||
      value.id ||
      ""
    );
  }

  return value;
}


function toNumber(value) {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


function roundMoney(value) {
  return Math.round(
    (
      toNumber(value) +
      Number.EPSILON
    ) * 100,
  ) / 100;
}


function getErrorMessage(error) {
  return (
    error?.message ||
    error?.data?.message ||
    "Unable to load user details."
  );
}


function getArray(
  value,
  keys = [],
) {
  if (
    Array.isArray(value)
  ) {
    return value;
  }

  for (
    const key of keys
  ) {
    if (
      Array.isArray(
        value?.[key],
      )
    ) {
      return value[key];
    }
  }

  return [];
}


function formatCurrency(value) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(
    toNumber(value),
  );
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}


function formatRole(role) {
  if (
    String(role)
      .toLowerCase() ===
    "admin"
  ) {
    return "Admin";
  }

  return "Customer";
}


function normalizeStatus(value) {
  return String(
    value || "pending",
  )
    .trim()
    .toLowerCase();
}


function getOrderStatus(order) {
  return normalizeStatus(
    order?.orderStatus ||
      order?.status,
  );
}


function getPaymentStatus(order) {
  return normalizeStatus(
    order?.paymentStatus,
  );
}


function getOrderTotal(order) {
  return roundMoney(
    order?.total ??
      order?.totalAmount ??
      order?.grandTotal ??
      order?.amount ??
      0,
  );
}


function getOrderSubtotal(order) {
  return roundMoney(
    order?.subtotal ??
      0,
  );
}


function getCouponDiscount(order) {
  return roundMoney(
    order?.couponDiscount ??
      0,
  );
}


function getOfferDiscount(order) {
  return roundMoney(
    order?.offerDiscount ??
      0,
  );
}


function getOrderDiscount(order) {
  const directDiscount =
    order?.discount;

  if (
    directDiscount !==
      undefined &&
    directDiscount !== null
  ) {
    return roundMoney(
      directDiscount,
    );
  }

  return roundMoney(
    getCouponDiscount(order) +
      getOfferDiscount(order),
  );
}


function getOrderItems(order) {
  return Array.isArray(
    order?.items,
  )
    ? order.items
    : [];
}


function getOrderItemCount(order) {
  return getOrderItems(
    order,
  ).reduce(
    (
      total,
      item,
    ) =>
      total +
      toNumber(
        item?.quantity,
      ),
    0,
  );
}


function getCouponCode(order) {
  return String(
    order?.couponCode ||
      order?.couponId?.code ||
      order?.coupon?.code ||
      "",
  ).trim();
}


function getCouponId(order) {
  return getId(
    order?.couponId ||
      order?.coupon?._id ||
      order?.coupon?.id,
  );
}


function getOfferIds(order) {
  const ids = [];

  if (
    Array.isArray(
      order?.offerIds,
    )
  ) {
    order.offerIds.forEach(
      (offer) => {
        const offerId =
          getId(offer);

        if (
          offerId &&
          !ids.includes(
            String(offerId),
          )
        ) {
          ids.push(
            String(offerId),
          );
        }
      },
    );
  }

  getOrderItems(
    order,
  ).forEach(
    (item) => {
      const offerId =
        getId(
          item?.offerId,
        );

      if (
        offerId &&
        !ids.includes(
          String(offerId),
        )
      ) {
        ids.push(
          String(offerId),
        );
      }
    },
  );

  return ids;
}


function getOfferNames(order) {
  const names = [];

  if (
    Array.isArray(
      order?.offerIds,
    )
  ) {
    order.offerIds.forEach(
      (offer) => {
        const name =
          typeof offer ===
          "object"
            ? offer?.name ||
              offer?.title ||
              offer?.code
            : "";

        if (
          name &&
          !names.includes(
            name,
          )
        ) {
          names.push(name);
        }
      },
    );
  }

  getOrderItems(
    order,
  ).forEach(
    (item) => {
      const name =
        String(
          item?.offerName ||
            "",
        ).trim();

      if (
        name &&
        !names.includes(
          name,
        )
      ) {
        names.push(name);
      }
    },
  );

  return names;
}


function getPromotionType(item) {
  const rawType =
    String(
      item?.promotionType ||
        item?.type ||
        "",
    ).toLowerCase();

  if (
    rawType === "coupon" ||
    rawType ===
      "coupon_applied"
  ) {
    return "coupon";
  }

  if (
    rawType === "offer" ||
    rawType ===
      "offer_applied"
  ) {
    return "offer";
  }

  if (
    item?.coupon ||
    item?.couponCode ||
    item?.couponId ||
    item?.promotionCode
  ) {
    return "coupon";
  }

  if (
    item?.offer ||
    item?.offerName ||
    item?.offerId
  ) {
    return "offer";
  }

  return "";
}


function getPromotionName(item) {
  const type =
    getPromotionType(
      item,
    );

  if (
    type === "coupon"
  ) {
    return (
      item?.promotionCode ||
      item?.coupon?.code ||
      item?.couponCode ||
      item?.code ||
      item?.promotionName ||
      "Coupon"
    );
  }

  if (
    type === "offer"
  ) {
    return (
      item?.offer?.name ||
      item?.offerName ||
      item?.name ||
      item?.promotionName ||
      "Offer"
    );
  }

  return (
    item?.promotionName ||
    item?.name ||
    item?.code ||
    "Promotion"
  );
}


function getPromotionDiscount(item) {
  return toNumber(
    item?.discountAmount ??
      item?.discount ??
      item?.amount ??
      item?.metadata
        ?.discount ??
      0,
  );
}


function getPromotionOrder(item) {
  return (
    item?.order
      ?.orderNumber ||
    item?.orderNumber ||
    item?.order
      ?.number ||
    item?.orderId ||
    "—"
  );
}


function getPromotionDate(item) {
  return (
    item?.usedAt ||
    item?.createdAt ||
    item?.order
      ?.createdAt ||
    item?.date ||
    null
  );
}


function getActivityDescription(
  item,
) {
  if (
    item?.description
  ) {
    return item.description;
  }

  if (
    item?.message
  ) {
    return item.message;
  }

  if (
    item?.details
  ) {
    return item.details;
  }

  if (
    item?.type ===
    "coupon_applied"
  ) {
    return `Coupon ${getPromotionName(
      item,
    )} was applied.`;
  }

  if (
    item?.type ===
    "offer_applied"
  ) {
    return `Offer ${getPromotionName(
      item,
    )} was applied.`;
  }

  if (
    item?.type ===
      "order_paid" ||
    item?.event ===
      "order_paid"
  ) {
    const orderNumber =
      item?.orderNumber ||
      item?.order
        ?.orderNumber;

    if (orderNumber) {
      return `Payment received for order ${orderNumber}.`;
    }

    return "Payment received for an order.";
  }

  if (
    item?.type ===
      "order" &&
    item?.orderNumber
  ) {
    return `Order ${item.orderNumber}`;
  }

  return "";
}


function getActivityIcon(type) {
  const value =
    String(
      type || "",
    ).toLowerCase();

  if (
    value.includes(
      "coupon",
    )
  ) {
    return (
      <FiTag size={15} />
    );
  }

  if (
    value.includes(
      "offer",
    )
  ) {
    return (
      <FiTag size={15} />
    );
  }

  if (
    value.includes(
      "payment",
    )
  ) {
    return (
      <FiCheckCircle
        size={15}
      />
    );
  }

  if (
    value.includes(
      "cancel",
    )
  ) {
    return (
      <FiXCircle
        size={15}
      />
    );
  }

  if (
    value.includes(
      "login",
    ) ||
    value.includes(
      "sign",
    )
  ) {
    return (
      <FiClock size={15} />
    );
  }

  return (
    <FiShoppingBag
      size={15}
    />
  );
}


function getOrdersFromResponse(
  response,
) {
  const data =
    getData(response);

  return getArray(
    data,
    [
      "orders",
      "items",
      "results",
    ],
  );
}


async function getAllUserOrders(
  userId,
) {
  const allOrders = [];

  let page = 1;

  let pages = 1;

  do {
    const response =
      await getAdminOrders({
        userId,
        page,
        limit: 100,
      });

    const data =
      getData(response);

    const orders =
      getOrdersFromResponse(
        response,
      );

    allOrders.push(
      ...orders,
    );

    const pagination =
      data?.pagination ||
      response?.pagination ||
      {};

    pages = Math.max(
      Number(
        pagination.pages,
      ) || 1,
      1,
    );

    if (
      orders.length === 0
    ) {
      break;
    }

    page += 1;
  } while (
    page <= pages
  );

  return allOrders;
}


function buildOrderStatistics(
  orders,
) {
  const result = {
    totalOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
    deliveredOrders: 0,
    totalOrdered: 0,
    totalSpent: 0,
    totalDiscount: 0,
    totalCouponDiscount: 0,
    totalOfferDiscount: 0,
    couponUsage: 0,
    offerUsage: 0,
    itemsPurchased: 0,
  };

  orders.forEach(
    (order) => {
      const total =
        getOrderTotal(order);

      const discount =
        getOrderDiscount(
          order,
        );

      const couponDiscount =
        getCouponDiscount(
          order,
        );

      const offerDiscount =
        getOfferDiscount(
          order,
        );

      const paymentStatus =
        getPaymentStatus(
          order,
        );

      const orderStatus =
        getOrderStatus(
          order,
        );

      const couponCode =
        getCouponCode(
          order,
        );

      const couponId =
        getCouponId(
          order,
        );

      const offerIds =
        getOfferIds(
          order,
        );

      result.totalOrders +=
        1;

      result.totalOrdered =
        roundMoney(
          result.totalOrdered +
            total,
        );

      result.totalDiscount =
        roundMoney(
          result.totalDiscount +
            discount,
        );

      result.totalCouponDiscount =
        roundMoney(
          result.totalCouponDiscount +
            couponDiscount,
        );

      result.totalOfferDiscount =
        roundMoney(
          result.totalOfferDiscount +
            offerDiscount,
        );

      result.itemsPurchased +=
        getOrderItemCount(
          order,
        );

      if (
        paymentStatus ===
        "paid"
      ) {
        result.paidOrders +=
          1;

        result.totalSpent =
          roundMoney(
            result.totalSpent +
              total,
          );
      }

      if (
        orderStatus ===
        "cancelled"
      ) {
        result.cancelledOrders +=
          1;
      }

      if (
        orderStatus ===
        "delivered"
      ) {
        result.deliveredOrders +=
          1;
      }

      if (
        couponCode ||
        couponId
      ) {
        result.couponUsage +=
          1;
      }

      result.offerUsage +=
        offerIds.length;
    },
  );

  return result;
}


function getUserOrderPromotionText(
  order,
) {
  const couponCode =
    getCouponCode(order);

  const offerNames =
    getOfferNames(order);

  const values = [];

  if (
    couponCode
  ) {
    values.push(
      `Coupon: ${couponCode}`,
    );
  }

  if (
    offerNames.length > 0
  ) {
    values.push(
      `Offer: ${offerNames.join(
        ", ",
      )}`,
    );
  }

  if (
    values.length === 0
  ) {
    return "—";
  }

  return values;
}


function UserDetails() {
  const { id } =
    useParams();

  const [
    user,
    setUser,
  ] = useState(null);

  const [
    activityData,
    setActivityData,
  ] = useState({});

  const [
    activityItems,
    setActivityItems,
  ] = useState([]);

  const [
    promotionUsage,
    setPromotionUsage,
  ] = useState([]);

  const [
    promotionSummary,
    setPromotionSummary,
  ] = useState({});

  const [
    orders,
    setOrders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const loadUser =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!id) {
          setError(
            "User ID is missing.",
          );

          setLoading(false);

          return;
        }

        try {
          if (silent) {
            setRefreshing(
              true,
            );
          } else {
            setLoading(
              true,
            );
          }

          setError("");

          const results =
            await Promise.allSettled(
              [
                getAdminUserById(
                  id,
                ),

                getAdminUserActivity(
                  id,
                ),

                getAdminUserActivityHistory(
                  id,
                  {
                    page: 1,
                    limit: 100,
                  },
                ),

                getAdminUserPromotionUsage(
                  id,
                  {
                    page: 1,
                    limit: 100,
                  },
                ),

                getAllUserOrders(
                  id,
                ),
              ],
            );

          const [
            userResult,
            activityResult,
            historyResult,
            promotionResult,
            ordersResult,
          ] = results;

          if (
            userResult.status ===
            "rejected"
          ) {
            throw userResult.reason;
          }

          const currentUser =
            getUser(
              userResult.value,
            );

          if (
            !currentUser
          ) {
            throw new Error(
              "User not found.",
            );
          }

          setUser(
            currentUser,
          );

          if (
            activityResult.status ===
            "fulfilled"
          ) {
            const data =
              getData(
                activityResult.value,
              );

            setActivityData(
              data,
            );

            const activities =
              getArray(
                data,
                [
                  "activities",
                  "activity",
                  "items",
                ],
              );

            setActivityItems(
              activities,
            );
          } else {
            console.error(
              "Failed to load user activity:",
              activityResult.reason,
            );

            setActivityData(
              {},
            );

            setActivityItems(
              [],
            );
          }

          if (
            historyResult.status ===
            "fulfilled"
          ) {
            const data =
              getData(
                historyResult.value,
              );

            const history =
              getArray(
                data,
                [
                  "activities",
                  "history",
                  "items",
                ],
              );

            if (
              history.length > 0
            ) {
              setActivityItems(
                history,
              );
            }
          } else {
            console.error(
              "Failed to load activity history:",
              historyResult.reason,
            );
          }

          if (
            ordersResult.status ===
            "fulfilled"
          ) {
            setOrders(
              Array.isArray(
                ordersResult.value,
              )
                ? ordersResult.value
                : [],
            );
          } else {
            console.error(
              "Failed to load user orders:",
              ordersResult.reason,
            );

            setOrders(
              [],
            );
          }

          if (
            promotionResult.status ===
            "fulfilled"
          ) {
            const data =
              getData(
                promotionResult.value,
              );

            setPromotionSummary(
              data?.summary ||
                {},
            );

            const rows = [];

            const directRows =
              getArray(
                data,
                [
                  "usages",
                  "usage",
                  "promotions",
                  "activities",
                  "items",
                ],
              );

            rows.push(
              ...directRows,
            );

            const coupons =
              getArray(
                data,
                [
                  "coupons",
                ],
              );

            const offers =
              getArray(
                data,
                [
                  "offers",
                ],
              );

            rows.push(
              ...coupons,
              ...offers,
            );

            const uniqueRows =
              [];

            const seen =
              new Set();

            rows.forEach(
              (
                item,
              ) => {
                const type =
                  getPromotionType(
                    item,
                  );

                const name =
                  getPromotionName(
                    item,
                  );

                const order =
                  getPromotionOrder(
                    item,
                  );

                const date =
                  getPromotionDate(
                    item,
                  );

                const key =
                  `${type}-${name}-${order}-${date}`;

                if (
                  seen.has(
                    key,
                  )
                ) {
                  return;
                }

                seen.add(
                  key,
                );

                uniqueRows.push(
                  item,
                );
              },
            );

            setPromotionUsage(
              uniqueRows,
            );
          } else {
            console.error(
              "Failed to load promotion usage:",
              promotionResult.reason,
            );

            setPromotionUsage(
              [],
            );

            setPromotionSummary(
              {},
            );
          }
        } catch (
          requestError
        ) {
          console.error(
            "Failed to load user details:",
            requestError,
          );

          setError(
            getErrorMessage(
              requestError,
            ),
          );
        } finally {
          setLoading(
            false,
          );

          setRefreshing(
            false,
          );
        }
      },
      [id],
    );

  useEffect(
    () => {
      loadUser();
    },
    [loadUser],
  );


  const handleStatus =
    async () => {
      if (
        !user ||
        saving
      ) {
        return;
      }

      const userId =
        getId(user);

      if (!userId) {
        return;
      }

      try {
        setSaving(
          true,
        );

        setError("");

        const nextStatus =
          !Boolean(
            user.isActive,
          );

        const response =
          await updateAdminUserStatus(
            userId,
            nextStatus,
          );

        const updatedUser =
          getUser(
            response,
          );

        setUser(
          updatedUser || {
            ...user,
            isActive:
              nextStatus,
          },
        );
      } catch (
        requestError
      ) {
        console.error(
          "Failed to update user status:",
          requestError,
        );

        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setSaving(
          false,
        );
      }
    };


  const handleRole =
    async (
      event,
    ) => {
      if (
        !user ||
        saving
      ) {
        return;
      }

      const nextRole =
        event.target.value;

      if (
        nextRole !==
          "customer" &&
        nextRole !==
          "admin"
      ) {
        return;
      }

      if (
        nextRole ===
        String(
          user.role,
        ).toLowerCase()
      ) {
        return;
      }

      const userId =
        getId(user);

      if (!userId) {
        return;
      }

      try {
        setSaving(
          true,
        );

        setError("");

        const response =
          await updateAdminUserRole(
            userId,
            nextRole,
          );

        const updatedUser =
          getUser(
            response,
          );

        setUser(
          updatedUser || {
            ...user,
            role: nextRole,
          },
        );
      } catch (
        requestError
      ) {
        console.error(
          "Failed to update user role:",
          requestError,
        );

        setError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setSaving(
          false,
        );
      }
    };


  const statistics =
    useMemo(
      () =>
        buildOrderStatistics(
          orders,
        ),
      [orders],
    );


  const promotionCounts =
    useMemo(
      () => {
        let coupons = 0;
        let offers = 0;

        promotionUsage.forEach(
          (item) => {
            const type =
              getPromotionType(
                item,
              );

            if (
              type === "coupon"
            ) {
              coupons +=
                1;
            }

            if (
              type === "offer"
            ) {
              offers +=
                1;
            }
          },
        );

        const summaryCoupons =
          toNumber(
            promotionSummary
              ?.couponUsages ??
              promotionSummary
                ?.couponUsageCount,
          );

        const summaryOffers =
          toNumber(
            promotionSummary
              ?.offerUsages ??
              promotionSummary
                ?.offerUsageCount,
          );

        if (
          summaryCoupons >
          coupons
        ) {
          coupons =
            summaryCoupons;
        }

        if (
          summaryOffers >
          offers
        ) {
          offers =
            summaryOffers;
        }

        return {
          coupons,
          offers,
          total:
            coupons +
            offers,
        };
      },
      [
        promotionUsage,
        promotionSummary,
      ],
    );


  const userId =
    getId(user);

  if (loading) {
    return (
      <section
        className={
          styles.page
        }
      >
        <div
          className={
            styles.state
          }
        >
          Loading user details...
        </div>
      </section>
    );
  }


  if (!user) {
    return (
      <section
        className={
          styles.page
        }
      >
        <div
          className={
            styles.error
          }
        >
          <strong>
            User not found
          </strong>

          <p>
            {error ||
              "The requested user could not be found."}
          </p>

          <Link
            to="/admin/users"
            className={
              styles.back
            }
          >
            <FiArrowLeft
              size={16}
            />

            Back to Users
          </Link>
        </div>
      </section>
    );
  }


  return (
    <section
      className={
        styles.page
      }
    >
      <div
        className={
          styles.heading
        }
      >
        <div>
          <Link
            to="/admin/users"
            className={
              styles.back
            }
          >
            <FiArrowLeft
              size={16}
            />

            Back to Users
          </Link>

          <span
            className={
              styles.eyebrow
            }
          >
            Customer Management
          </span>

          <h1
            className={
              styles.title
            }
          >
            User Details
          </h1>

          <p
            className={
              styles.description
            }
          >
            View account information,
            activity, promotions, and
            orders for this customer.
          </p>
        </div>

        <button
          type="button"
          className={
            styles.refresh
          }
          onClick={() =>
            loadUser({
              silent: true,
            })
          }
          disabled={
            refreshing
          }
        >
          <FiRefreshCw
            size={15}
            className={
              refreshing
                ? styles.spinning
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>


      {error && (
        <div
          className={
            styles.error
          }
        >
          {error}
        </div>
      )}


      <div
        className={
          styles.profile
        }
      >
        <div
          className={
            styles.profileTop
          }
        >
          <div
            className={
              styles.avatar
            }
          >
            {String(
              user.name ||
                "U",
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <div
            className={
              styles.profileMain
            }
          >
            <h2>
              {user.name ||
                "Unnamed User"}
            </h2>

            <p>
              {user.email ||
                "No email available"}
            </p>

            <span
              className={
                user.isActive
                  ? styles.active
                  : styles.inactive
              }
            >
              {user.isActive
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          <div
            className={
              styles.profileActions
            }
          >
            <select
              value={
                String(
                  user.role ||
                    "customer",
                ).toLowerCase()
              }
              onChange={
                handleRole
              }
              disabled={
                saving
              }
              className={
                styles.roleSelect
              }
            >
              <option value="customer">
                Customer
              </option>

              <option value="admin">
                Admin
              </option>
            </select>

            <button
              type="button"
              className={
                styles.statusButton
              }
              onClick={
                handleStatus
              }
              disabled={
                saving
              }
            >
              {user.isActive
                ? "Deactivate User"
                : "Activate User"}
            </button>
          </div>
        </div>

        <div
          className={
            styles.profileDetails
          }
        >
          <div>
            <span>Email</span>

            <strong>
              {user.email ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Phone</span>

            <strong>
              {user.phone ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Role</span>

            <strong>
              {formatRole(
                user.role,
              )}
            </strong>
          </div>

          <div>
            <span>Joined</span>

            <strong>
              {formatDate(
                user.createdAt,
              )}
            </strong>
          </div>

          <div>
            <span>
              Last Updated
            </span>

            <strong>
              {formatDate(
                user.updatedAt,
              )}
            </strong>
          </div>

          <div>
            <span>User ID</span>

            <strong>
              {userId || "—"}
            </strong>
          </div>
        </div>
      </div>


      <div
        className={
          styles.stats
        }
      >
        <div
          className={
            styles.stat
          }
        >
          <span>Orders</span>

          <strong>
            {statistics.totalOrders}
          </strong>

          <small>
            {statistics.paidOrders} paid
          </small>
        </div>

        <div
          className={
            styles.stat
          }
        >
          <span>Total Spent</span>

          <strong>
            {formatCurrency(
              statistics.totalSpent,
            )}
          </strong>

          <small>
            Ordered:{" "}
            {formatCurrency(
              statistics.totalOrdered,
            )}
          </small>
        </div>

        <div
          className={
            styles.stat
          }
        >
          <span>Reviews</span>

          <strong>
            {toNumber(
              activityData
                ?.reviews
                ?.total ??
                activityData
                  ?.reviewCount ??
                0,
            )}
          </strong>

          <small>
            Customer reviews
          </small>
        </div>

        <div
          className={
            styles.stat
          }
        >
          <span>
            Promotions Used
          </span>

          <strong>
            {promotionCounts.total}
          </strong>

          <small>
            {promotionCounts.coupons} coupons
            {" · "}
            {promotionCounts.offers} offers
          </small>
        </div>
      </div>


      <div
        className={
          styles.section
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div>
            <h2>
              Account Activity
            </h2>

            <p>
              Recent activity recorded
              for this user.
            </p>
          </div>

          <span
            className={
              styles.sectionCount
            }
          >
            {activityItems.length}{" "}
            activities
          </span>
        </div>

        {activityItems.length ===
        0 ? (
          <div
            className={
              styles.empty
            }
          >
            No activity history
            available.
          </div>
        ) : (
          <div
            className={
              styles.activityList
            }
          >
            {activityItems.map(
              (
                item,
                index,
              ) => {
                const type =
                  item?.type ||
                  item?.action ||
                  item?.event ||
                  "activity";

                const key =
                  getId(item) ||
                  `${type}-${index}`;

                return (
                  <div
                    className={
                      styles.activityItem
                    }
                    key={key}
                  >
                    <div
                      className={
                        styles.activityIcon
                      }
                    >
                      {getActivityIcon(
                        type,
                      )}
                    </div>

                    <div
                      className={
                        styles.activityContent
                      }
                    >
                      <strong>
                        {item?.action ||
                          type}
                      </strong>

                      <p>
                        {getActivityDescription(
                          item,
                        )}
                      </p>

                      <span>
                        {formatDateTime(
                          item?.createdAt ||
                            item?.timestamp ||
                            item?.date,
                        )}
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>


      <div
        className={
          styles.section
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div>
            <h2>
              Orders
            </h2>

            <p>
              All orders placed by this
              customer.
            </p>
          </div>

          <span
            className={
              styles.sectionCount
            }
          >
            {statistics.totalOrders}{" "}
            orders
          </span>
        </div>

        {orders.length === 0 ? (
          <div
            className={
              styles.empty
            }
          >
            <FiShoppingBag
              size={26}
            />

            <p>
              No orders found for
              this customer.
            </p>
          </div>
        ) : (
          <div
            className={
              styles.tableWrapper
            }
          >
            <table
              className={
                styles.table
              }
            >
              <thead>
                <tr>
                  <th>
                    Order
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Promotion
                  </th>

                  <th>
                    Discount
                  </th>

                  <th>
                    Order Status
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Items
                  </th>

                  <th>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map(
                  (
                    order,
                    index,
                  ) => {
                    const orderId =
                      getId(order);

                    const orderNumber =
                      order?.orderNumber ||
                      order?.number ||
                      orderId ||
                      `Order ${index + 1}`;

                    const promotions =
                      getUserOrderPromotionText(
                        order,
                      );

                    return (
                      <tr
                        key={
                          orderId ||
                          `${orderNumber}-${index}`
                        }
                      >
                        <td>
                          {orderId ? (
                            <Link
                              to={`/admin/orders/${orderId}`}
                              className={
                                styles.orderLink
                              }
                            >
                              {orderNumber}
                            </Link>
                          ) : (
                            <strong>
                              {orderNumber}
                            </strong>
                          )}
                        </td>

                        <td>
                          {formatDate(
                            order?.createdAt ||
                              order?.orderDate,
                          )}
                        </td>

                        <td>
                          {promotions ===
                          "—" ? (
                            "—"
                          ) : (
                            <div
                              className={
                                styles.orderPromotion
                              }
                            >
                              {promotions.map(
                                (
                                  promotion,
                                  promotionIndex,
                                ) => (
                                  <span
                                    key={
                                      `${promotion}-${promotionIndex}`
                                    }
                                  >
                                    {promotion}
                                  </span>
                                ),
                              )}
                            </div>
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              getOrderDiscount(
                                order,
                              ),
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={
                              styles.statusBadge
                            }
                          >
                            {getOrderStatus(
                              order,
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              getPaymentStatus(
                                order,
                              ) ===
                              "paid"
                                ? styles.paidBadge
                                : styles.paymentBadge
                            }
                          >
                            {
                              getPaymentStatus(
                                order,
                              )
                            }
                          </span>
                        </td>

                        <td>
                          {getOrderItemCount(
                            order,
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              getOrderTotal(
                                order,
                              ),
                            )}
                          </strong>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>

              <tfoot>
                <tr
                  className={
                    styles.summaryRow
                  }
                >
                  <td
                    colSpan="3"
                  >
                    <strong>
                      Order Summary
                    </strong>
                  </td>

                  <td>
                    <span>
                      Discount
                    </span>

                    <strong>
                      {formatCurrency(
                        statistics.totalDiscount,
                      )}
                    </strong>
                  </td>

                  <td>
                    <span>
                      Usage
                    </span>

                    <strong>
                      {statistics.couponUsage +
                        statistics.offerUsage}
                    </strong>
                  </td>

                  <td>
                    <span>
                      Paid
                    </span>

                    <strong>
                      {statistics.paidOrders}
                    </strong>
                  </td>

                  <td>
                    <span>
                      Items
                    </span>

                    <strong>
                      {
                        statistics.itemsPurchased
                      }
                    </strong>
                  </td>

                  <td>
                    <span>
                      Total Spent
                    </span>

                    <strong>
                      {formatCurrency(
                        statistics.totalSpent,
                      )}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>


      <div
        className={
          styles.section
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div>
            <h2>
              Promotion Usage
            </h2>

            <p>
              Coupons and offers
              actually used by this
              customer.
            </p>
          </div>

          <span
            className={
              styles.sectionCount
            }
          >
            {promotionCounts.total}{" "}
            uses
          </span>
        </div>

        {promotionUsage.length ===
        0 ? (
          <div
            className={
              styles.empty
            }
          >
            <FiTag
              size={26}
            />

            <p>
              No promotion usage
              recorded.
            </p>

            <span>
              Promotion usage will appear
              here after a coupon or offer
              is successfully used on an
              order.
            </span>
          </div>
        ) : (
          <div
            className={
              styles.tableWrapper
            }
          >
            <table
              className={
                styles.table
              }
            >
              <thead>
                <tr>
                  <th>
                    Promotion
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Discount
                  </th>

                  <th>
                    Order
                  </th>

                  <th>
                    Order Amount
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Used
                  </th>
                </tr>
              </thead>

              <tbody>
                {promotionUsage.map(
                  (
                    item,
                    index,
                  ) => {
                    const type =
                      getPromotionType(
                        item,
                      );

                    const name =
                      getPromotionName(
                        item,
                      );

                    const discount =
                      getPromotionDiscount(
                        item,
                      );

                    const orderId =
                      item?.order?._id ||
                      item?.order?.id ||
                      item?.orderId ||
                      "";

                    const orderAmount =
                      toNumber(
                        item?.orderAmount ??
                          item?.order
                            ?.subtotal ??
                          item?.order
                            ?.total ??
                          0,
                      );

                    const key =
                      getId(item) ||
                      `${type}-${name}-${index}`;

                    return (
                      <tr
                        key={key}
                      >
                        <td>
                          <div
                            className={
                              styles.promotionCell
                            }
                          >
                            <div
                              className={
                                styles.promotionIcon
                              }
                            >
                              {type ===
                              "coupon" ? (
                                <FiTag
                                  size={15}
                                />
                              ) : (
                                <FiPercent
                                  size={15}
                                />
                              )}
                            </div>

                            <div>
                              <strong>
                                {name}
                              </strong>

                              {type ===
                                "coupon" &&
                                item?.promotionCode && (
                                  <span>
                                    Code:{" "}
                                    {
                                      item.promotionCode
                                    }
                                  </span>
                                )}

                              {type ===
                                "offer" &&
                                item?.offer
                                  ?.name && (
                                  <span>
                                    {
                                      item.offer
                                        .name
                                    }
                                  </span>
                                )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              type ===
                              "coupon"
                                ? styles.couponBadge
                                : styles.offerBadge
                            }
                          >
                            {type ===
                            "coupon"
                              ? "Coupon"
                              : "Offer"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              discount,
                            )}
                          </strong>

                          {item?.discountType && (
                            <span
                              className={
                                styles.discountValue
                              }
                            >
                              {item.discountType ===
                              "percentage"
                                ? `${toNumber(
                                    item.discountValue,
                                  )}%`
                                : formatCurrency(
                                    item.discountValue,
                                  )}
                            </span>
                          )}
                        </td>

                        <td>
                          {orderId ? (
                            <Link
                              to={`/admin/orders/${orderId}`}
                              className={
                                styles.orderLink
                              }
                            >
                              {getPromotionOrder(
                                item,
                              )}
                            </Link>
                          ) : (
                            getPromotionOrder(
                              item,
                            )
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            orderAmount,
                          )}
                        </td>

                        <td>
                          {item?.order
                            ?.paymentStatus ||
                            item?.paymentStatus ||
                            "—"}
                        </td>

                        <td>
                          {formatDateTime(
                            getPromotionDate(
                              item,
                            ),
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>

              <tfoot>
                <tr
                  className={
                    styles.summaryRow
                  }
                >
                  <td
                    colSpan="2"
                  >
                    <strong>
                      Promotion Summary
                    </strong>
                  </td>

                  <td>
                    <span>
                      Discount
                    </span>

                    <strong>
                      {formatCurrency(
                        statistics.totalDiscount,
                      )}
                    </strong>
                  </td>

                  <td>
                    <span>
                      Coupon Uses
                    </span>

                    <strong>
                      {
                        statistics.couponUsage
                      }
                    </strong>
                  </td>

                  <td>
                    <span>
                      Offer Uses
                    </span>

                    <strong>
                      {
                        statistics.offerUsage
                      }
                    </strong>
                  </td>

                  <td
                    colSpan="2"
                  >
                    <span>
                      Total Usage
                    </span>

                    <strong>
                      {statistics.couponUsage +
                        statistics.offerUsage}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>


      <div
        className={
          styles.section
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div>
            <h2>
              Order Statistics
            </h2>

            <p>
              Detailed order and payment
              information for this
              customer.
            </p>
          </div>
        </div>

        <div
          className={
            styles.statisticsGrid
          }
        >
          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Total Ordered
            </span>

            <strong>
              {formatCurrency(
                statistics.totalOrdered,
              )}
            </strong>
          </div>

          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Paid Orders
            </span>

            <strong>
              {
                statistics.paidOrders
              }
            </strong>
          </div>

          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Paid Amount
            </span>

            <strong>
              {formatCurrency(
                statistics.totalSpent,
              )}
            </strong>
          </div>

          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Total Discount
            </span>

            <strong>
              {formatCurrency(
                statistics.totalDiscount,
              )}
            </strong>
          </div>

          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Coupon Discount
            </span>

            <strong>
              {formatCurrency(
                statistics.totalCouponDiscount,
              )}
            </strong>
          </div>

          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Offer Discount
            </span>

            <strong>
              {formatCurrency(
                statistics.totalOfferDiscount,
              )}
            </strong>
          </div>

          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Cancelled Orders
            </span>

            <strong>
              {
                statistics.cancelledOrders
              }
            </strong>
          </div>

          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Delivered Orders
            </span>

            <strong>
              {
                statistics.deliveredOrders
              }
            </strong>
          </div>

          <div
            className={
              styles.statisticsItem
            }
          >
            <span>
              Items Purchased
            </span>

            <strong>
              {
                statistics.itemsPurchased
              }
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}


export default UserDetails;