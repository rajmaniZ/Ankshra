import {
  get,
  post,
  put,
  patch,
  remove,
} from "./api";

function buildQuery(params = {}) {
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

  return query
    ? `?${query}`
    : "";
}

export async function getAdminOffers(
  params = {},
) {
  return get(
    `/offers${buildQuery(params)}`,
  );
}

export async function getAdminOfferById(
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

export async function createAdminOffer(
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

export async function updateAdminOffer(
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

  return put(
    `/offers/${id}`,
    data,
  );
}

export async function patchAdminOffer(
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

export async function toggleAdminOffer(
  id,
  isActive,
) {
  if (!id) {
    throw new Error(
      "Offer ID is required.",
    );
  }

  return patch(
    `/offers/${id}/toggle`,
    {
      isActive: Boolean(
        isActive,
      ),
    },
  );
}

export async function deleteAdminOffer(
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