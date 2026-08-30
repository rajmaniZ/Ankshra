import {
  get,
  patch,
  post,
  remove,
} from "./api";

export function getProfile() {
  return get("/users/profile");
}

export function updateProfile(data) {
  return patch(
    "/users/profile",
    data,
  );
}

export function addAddress(data) {
  return post(
    "/users/addresses",
    data,
  );
}

export function updateAddress(
  addressId,
  data,
) {
  return patch(
    `/users/addresses/${addressId}`,
    data,
  );
}

export function deleteAddress(
  addressId,
) {
  return remove(
    `/users/addresses/${addressId}`,
  );
}

export function setDefaultAddress(
  addressId,
) {
  return patch(
    `/users/addresses/${addressId}/default`,
    {},
  );
}