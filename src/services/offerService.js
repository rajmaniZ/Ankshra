import {
  get,
  post,
  patch,
  remove,
} from "./api";

export async function getOffers(params = {}) {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(
          key,
          value,
        );
      }
    },
  );

  const query =
    searchParams.toString();

  return get(
    `/offers${
      query
        ? `?${query}`
        : ""
    }`,
  );
}

export async function getOfferById(
  id,
) {
  if (!id) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  return get(
    `/offers/${id}`,
  );
}

export async function createOffer(
  data,
) {
  if (!data) {
    throw new Error(
      "Offer data is required.",
    );
  }

  return post(
    "/offers",
    data,
  );
}

export async function updateOffer(
  id,
  data,
) {
  if (!id) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  if (!data) {
    throw new Error(
      "Offer data is required.",
    );
  }

  return patch(
    `/offers/${id}`,
    data,
  );
}

export async function deleteOffer(
  id,
) {
  if (!id) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  return remove(
    `/offers/${id}`,
  );
}

export async function toggleOffer(
  id,
  isActive,
) {
  if (!id) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  return patch(
    `/offers/${id}`,
    {
      isActive,
    },
  );
}