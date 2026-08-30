// import {
//   get,
//   patch,
//   post,
//   remove,
// } from "./api";

// export async function getProfile() {
//   return get("/users/profile");
// }

// export async function updateProfile(data) {
//   return patch(
//     "/users/profile",
//     data,
//   );
// }

// export async function changePassword(data) {
//   return post(
//     "/users/change-password",
//     data,
//   );
// }

// export async function deleteAccount(data) {
//   return remove(
//     "/users/account",
//     data,
//   );
// }

// export async function addAddress(data) {
//   return post(
//     "/users/addresses",
//     data,
//   );
// }

// export async function updateAddress(
//   addressId,
//   data,
// ) {
//   return patch(
//     `/users/addresses/${addressId}`,
//     data,
//   );
// }

// export async function deleteAddress(
//   addressId,
// ) {
//   return remove(
//     `/users/addresses/${addressId}`,
//   );
// }

// export async function setDefaultAddress(
//   addressId,
// ) {
//   return patch(
//     `/users/addresses/${addressId}/default`,
//     {},
//   );
// }

import {
  get,
  patch,
  post,
  remove,
} from "./api";

export async function getProfile() {
  return get("/users/profile");
}

export async function updateProfile(
  data,
) {
  return patch(
    "/users/profile",
    data,
  );
}

export async function changePassword(
  data,
) {
  return post(
    "/users/change-password",
    data,
  );
}

export async function deleteAccount(
  data,
) {
  return remove(
    "/users/account",
    data,
  );
}

export async function addAddress(
  data,
) {
  return post(
    "/users/addresses",
    data,
  );
}

export async function updateAddress(
  addressId,
  data,
) {
  return patch(
    `/users/addresses/${addressId}`,
    data,
  );
}

export async function deleteAddress(
  addressId,
) {
  return remove(
    `/users/addresses/${addressId}`,
  );
}

export async function setDefaultAddress(
  addressId,
) {
  return patch(
    `/users/addresses/${addressId}/default`,
    {},
  );
}