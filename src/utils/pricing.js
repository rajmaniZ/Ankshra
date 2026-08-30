export function toNumber(
  value,
  fallback = 0,
) {
  const number =
    Number(value);

  return Number.isFinite(
    number,
  )
    ? number
    : fallback;
}

export function roundMoney(
  value,
) {
  return Math.round(
    (toNumber(value) +
      Number.EPSILON) *
      100,
  ) / 100;
}

export function getProductId(
  product,
) {
  if (!product) {
    return "";
  }

  if (
    product._id
  ) {
    return String(
      product._id,
    );
  }

  if (
    product.id
  ) {
    return String(
      product.id,
    );
  }

  if (
    product.product?._id
  ) {
    return String(
      product.product._id,
    );
  }

  if (
    product.product?.id
  ) {
    return String(
      product.product.id,
    );
  }

  return "";
}

export function getCategoryId(
  product,
) {
  if (!product) {
    return "";
  }

  if (
    product.categoryId
  ) {
    return String(
      getObjectId(
        product.categoryId,
      ),
    );
  }

  const category =
    product.category;

  if (!category) {
    return "";
  }

  if (
    typeof category ===
    "object"
  ) {
    return String(
      getObjectId(
        category,
      ),
    );
  }

  return String(category);
}

function getObjectId(
  value,
) {
  if (!value) {
    return "";
  }

  if (
    typeof value ===
    "object"
  ) {
    if (
      value._id
    ) {
      return String(
        value._id,
      );
    }

    if (
      value.id
    ) {
      return String(
        value.id,
      );
    }

    return "";
  }

  return String(value);
}

export function isOfferActive(
  offer,
  now = new Date(),
) {
  if (!offer) {
    return false;
  }

  if (
    offer.isActive ===
      false ||
    offer.active ===
      false
  ) {
    return false;
  }

  const currentTime =
    new Date(
      now,
    ).getTime();

  if (
    Number.isNaN(
      currentTime,
    )
  ) {
    return false;
  }

  if (
    offer.startsAt
  ) {
    const startsAt =
      new Date(
        offer.startsAt,
      ).getTime();

    if (
      !Number.isNaN(
        startsAt,
      ) &&
      currentTime <
        startsAt
    ) {
      return false;
    }
  }

  if (
    offer.expiresAt
  ) {
    const expiresAt =
      new Date(
        offer.expiresAt,
      ).getTime();

    if (
      !Number.isNaN(
        expiresAt,
      ) &&
      currentTime >
        expiresAt
    ) {
      return false;
    }
  }

  return true;
}

export function offerAppliesToProduct(
  product,
  offer,
) {
  if (
    !product ||
    !offer
  ) {
    return false;
  }

  const appliesTo =
    offer.appliesTo ||
    "all";

  if (
    appliesTo ===
    "all"
  ) {
    return true;
  }

  const productId =
    getProductId(
      product,
    );

  if (
    appliesTo ===
    "products"
  ) {
    if (
      !productId ||
      !Array.isArray(
        offer.products,
      )
    ) {
      return false;
    }

    return offer.products.some(
      (
        offerProduct,
      ) => {
        const offerProductId =
          getObjectId(
            offerProduct,
          );

        return (
          Boolean(
            offerProductId,
          ) &&
          String(
            offerProductId,
          ) ===
            String(
              productId,
            )
        );
      },
    );
  }

  if (
    appliesTo ===
    "category"
  ) {
    const productCategoryId =
      getCategoryId(
        product,
      );

    const offerCategoryId =
      getObjectId(
        offer.category,
      );

    if (
      !productCategoryId ||
      !offerCategoryId
    ) {
      return false;
    }

    return (
      String(
        productCategoryId,
      ) ===
      String(
        offerCategoryId,
      )
    );
  }

  return false;
}

export function calculateOfferDiscount(
  price,
  offer,
) {
  const amount =
    toNumber(
      price,
    );

  const value =
    toNumber(
      offer?.discountValue,
    );

  if (
    amount <= 0 ||
    value <= 0
  ) {
    return 0;
  }

  let discount = 0;

  if (
    offer?.discountType ===
    "percentage"
  ) {
    discount =
      (amount * value) /
      100;
  }

  if (
    offer?.discountType ===
    "fixed"
  ) {
    discount = value;
  }

  return roundMoney(
    Math.min(
      Math.max(
        discount,
        0,
      ),
      amount,
    ),
  );
}

export function findBestOffer(
  product,
  offers = [],
  now = new Date(),
) {
  const originalPrice =
    toNumber(
      product?.price,
    );

  if (
    originalPrice <= 0 ||
    !Array.isArray(
      offers,
    )
  ) {
    return {
      offer: null,
      originalPrice,
      offerDiscount: 0,
      price: originalPrice,
      discountPercentage: 0,
    };
  }

  let bestOffer =
    null;

  let bestDiscount =
    0;

  offers.forEach(
    (offer) => {
      if (
        !isOfferActive(
          offer,
          now,
        )
      ) {
        return;
      }

      if (
        !offerAppliesToProduct(
          product,
          offer,
        )
      ) {
        return;
      }

      const discount =
        calculateOfferDiscount(
          originalPrice,
          offer,
        );

      if (
        discount >
        bestDiscount
      ) {
        bestDiscount =
          discount;

        bestOffer =
          offer;
      }
    },
  );

  const price =
    roundMoney(
      Math.max(
        originalPrice -
          bestDiscount,
        0,
      ),
    );

  const discountPercentage =
    originalPrice > 0
      ? Math.round(
          (bestDiscount /
            originalPrice) *
            100,
        )
      : 0;

  return {
    offer:
      bestOffer,

    originalPrice,

    offerDiscount:
      bestDiscount,

    price,

    discountPercentage,
  };
}

export function getProductPricing(
  product,
  offers = [],
) {
  if (!product) {
    return {
      originalPrice: 0,
      price: 0,
      offerDiscount: 0,
      discountPercentage: 0,
      displayOriginalPrice: 0,
      displayDiscount: 0,
      displayDiscountPercentage: 0,
      offer: null,
      hasOffer: false,
      hasComparePrice: false,
    };
  }

  const result =
    findBestOffer(
      product,
      offers,
    );

  const compareAtPrice =
    toNumber(
      product.compareAtPrice,
    );

  const hasComparePrice =
    compareAtPrice >
    result.originalPrice;

  const displayOriginalPrice =
    hasComparePrice
      ? compareAtPrice
      : result.originalPrice;

  const displayDiscount =
    hasComparePrice
      ? roundMoney(
          Math.max(
            displayOriginalPrice -
              result.price,
            0,
          ),
        )
      : result.offerDiscount;

  const displayDiscountPercentage =
    displayOriginalPrice >
    0
      ? Math.round(
          (displayDiscount /
            displayOriginalPrice) *
            100,
        )
      : 0;

  return {
    ...result,

    displayOriginalPrice,

    displayDiscount,

    displayDiscountPercentage,

    hasOffer:
      Boolean(
        result.offer,
      ),

    hasComparePrice,
  };
}

export function calculateCartPricing(
  items = [],
  offers = [],
) {
  let subtotal = 0;

  let offerDiscount =
    0;

  const pricedItems =
    Array.isArray(
      items,
    )
      ? items.map(
          (item) => {
            const product =
              item?.product ||
              item;

            const quantity =
              Math.max(
                1,
                Math.floor(
                  toNumber(
                    item?.quantity,
                    1,
                  ),
                ),
              );

            const pricing =
              getProductPricing(
                product,
                offers,
              );

            const itemSubtotal =
              roundMoney(
                pricing.price *
                  quantity,
              );

            const originalSubtotal =
              roundMoney(
                pricing.originalPrice *
                  quantity,
              );

            const itemOfferDiscount =
              roundMoney(
                Math.max(
                  originalSubtotal -
                    itemSubtotal,
                  0,
                ),
              );

            subtotal =
              roundMoney(
                subtotal +
                  originalSubtotal,
              );

            offerDiscount =
              roundMoney(
                offerDiscount +
                  itemOfferDiscount,
              );

            return {
              ...item,

              pricing,

              originalSubtotal,

              subtotal:
                itemSubtotal,

              offerDiscount:
                itemOfferDiscount,
            };
          },
        )
      : [];

  const offerSubtotal =
    roundMoney(
      Math.max(
        subtotal -
          offerDiscount,
        0,
      ),
    );

  const shippingFee =
    offerSubtotal >=
    999
      ? 0
      : 99;

  const total =
    roundMoney(
      offerSubtotal +
        shippingFee,
    );

  return {
    items:
      pricedItems,

    subtotal,

    offerDiscount,

    offerSubtotal,

    shippingFee,

    couponDiscount:
      0,

    discount:
      offerDiscount,

    total,
  };
}

export function calculateCouponDiscount(
  amount,
  coupon,
) {
  const orderAmount =
    toNumber(
      amount,
    );

  if (
    orderAmount <= 0 ||
    !coupon
  ) {
    return 0;
  }

  const minimumOrderAmount =
    toNumber(
      coupon.minimumOrderAmount,
    );

  if (
    orderAmount <
    minimumOrderAmount
  ) {
    return 0;
  }

  const value =
    toNumber(
      coupon.discountValue,
    );

  if (
    value <= 0
  ) {
    return 0;
  }

  let discount = 0;

  if (
    coupon.discountType ===
    "percentage"
  ) {
    discount =
      (orderAmount * value) /
      100;

    if (
      coupon.maximumDiscountAmount !==
        null &&
      coupon.maximumDiscountAmount !==
        undefined
    ) {
      discount =
        Math.min(
          discount,
          toNumber(
            coupon.maximumDiscountAmount,
          ),
        );
    }
  }

  if (
    coupon.discountType ===
    "fixed"
  ) {
    discount = value;
  }

  return roundMoney(
    Math.min(
      Math.max(
        discount,
        0,
      ),
      orderAmount,
    ),
  );
}

export function calculateCheckoutTotals({
  subtotal = 0,
  offerDiscount = 0,
  couponDiscount = 0,
} = {}) {
  const safeSubtotal =
    Math.max(
      toNumber(
        subtotal,
      ),
      0,
    );

  const safeOfferDiscount =
    Math.min(
      Math.max(
        toNumber(
          offerDiscount,
        ),
        0,
      ),
      safeSubtotal,
    );

  const offerSubtotal =
    roundMoney(
      Math.max(
        safeSubtotal -
          safeOfferDiscount,
        0,
      ),
    );

  const safeCouponDiscount =
    Math.min(
      Math.max(
        toNumber(
          couponDiscount,
        ),
        0,
      ),
      offerSubtotal,
    );

  const shippingFee =
    offerSubtotal >=
    999
      ? 0
      : 99;

  const discount =
    roundMoney(
      safeOfferDiscount +
        safeCouponDiscount,
    );

  const total =
    roundMoney(
      Math.max(
        offerSubtotal -
          safeCouponDiscount +
          shippingFee,
        0,
      ),
    );

  return {
    subtotal:
      roundMoney(
        safeSubtotal,
      ),

    offerDiscount:
      roundMoney(
        safeOfferDiscount,
      ),

    couponDiscount:
      roundMoney(
        safeCouponDiscount,
      ),

    discount,

    offerSubtotal,

    shippingFee,

    total,
  };
}

export function formatPrice(
  value,
  currency = "₹",
) {
  return `${currency}${toNumber(
    value,
  ).toLocaleString(
    "en-IN",
  )}`;
}