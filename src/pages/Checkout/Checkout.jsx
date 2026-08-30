import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  FiArrowLeft,
  FiCheck,
  FiMapPin,
} from "react-icons/fi";

import useCart from "../../hooks/useCart";

import {
  createOrder,
} from "../../services/orderService";

import {
  getProfile,
  addAddress,
} from "../../services/profileService";

import {
  validateCoupon,
} from "../../services/couponService";

import Button from "../../components/common/Button/Button";

import styles from "./Checkout.module.css";

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function getResponseData(response) {
  return (
    response?.data ||
    response ||
    {}
  );
}

function getAddressList(response) {
  const data =
    getResponseData(
      response,
    );

  if (
    Array.isArray(
      data?.user?.addresses,
    )
  ) {
    return data.user.addresses;
  }

  if (
    Array.isArray(
      data?.addresses,
    )
  ) {
    return data.addresses;
  }

  return [];
}

function getProduct(item) {
  return (
    item?.product ||
    item ||
    {}
  );
}

function getProductId(item) {
  const product =
    getProduct(item);

  return (
    product?._id ||
    product?.id ||
    item?._id ||
    item?.id ||
    ""
  );
}

function getProductImage(item) {
  const product =
    getProduct(item);

  const image =
    product?.images?.[0];

  if (
    image &&
    typeof image ===
      "object"
  ) {
    return (
      image.url ||
      image.secure_url ||
      ""
    );
  }

  return (
    image ||
    product?.image ||
    ""
  );
}

function getProductPricing(item) {
  const product =
    getProduct(item);

  const pricing =
    item?.pricing ||
    product?.pricing ||
    {};

  const price = Number(
    pricing?.price ??
      product?.price ??
      item?.price ??
      0,
  );

  const originalPrice =
    Number(
      pricing?.originalPrice ??
        product?.originalPrice ??
        product?.compareAtPrice ??
        item?.originalPrice ??
        price,
    );

  const offerDiscount =
    Number(
      item?.offerDiscount ??
        pricing?.offerDiscount ??
        product?.offerDiscount ??
        0,
    );

  return {
    price:
      Number.isFinite(
        price,
      )
        ? price
        : 0,

    originalPrice:
      Number.isFinite(
        originalPrice,
      )
        ? originalPrice
        : price,

    offerDiscount:
      Number.isFinite(
        offerDiscount,
      )
        ? offerDiscount
        : 0,
  };
}

function getQuantity(item) {
  const quantity =
    Number(
      item?.quantity,
    );

  return Number.isFinite(
    quantity,
  ) &&
    quantity > 0
    ? quantity
    : 1;
}

function getCouponData(response) {
  const data =
    getResponseData(
      response,
    );

  return {
    coupon:
      data?.coupon ||
      null,

    discount:
      Number(
        data?.discount,
      ) || 0,

    finalAmount:
      Number(
        data?.finalAmount,
      ) || 0,
  };
}

function formatPrice(value) {
  return `₹${Number(
    value || 0,
  ).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function Checkout() {
  const navigate =
    useNavigate();

  const {
    items,
    subtotal,
    offerDiscount,
    finalSubtotal,
    count,
    loading:
      cartLoading,
    loadCart,
  } = useCart();

  const [
    addresses,
    setAddresses,
  ] = useState([]);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState("");

  const [
    showAddressForm,
    setShowAddressForm,
  ] = useState(false);

  const [
    address,
    setAddress,
  ] = useState({
    ...EMPTY_ADDRESS,
  });

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("cod");

  const [
    couponCode,
    setCouponCode,
  ] = useState("");

  const [
    appliedCoupon,
    setAppliedCoupon,
  ] = useState(null);

  const [
    couponLoading,
    setCouponLoading,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    loadingAddresses,
    setLoadingAddresses,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    let active = true;

    const loadAddresses =
      async () => {
        setLoadingAddresses(
          true,
        );

        try {
          const response =
            await getProfile();

          const list =
            getAddressList(
              response,
            );

          if (!active) {
            return;
          }

          setAddresses(list);

          const defaultAddress =
            list.find(
              (item) =>
                item?.isDefault,
            );

          if (
            defaultAddress
          ) {
            setSelectedAddressId(
              defaultAddress._id ||
                defaultAddress.id ||
                "",
            );
          } else if (
            list.length === 1
          ) {
            setSelectedAddressId(
              list[0]?._id ||
                list[0]?.id ||
                "",
            );
          }
        } catch (
          loadError
        ) {
          console.error(
            "Failed to load addresses:",
            loadError,
          );

          if (active) {
            setAddresses([]);
          }
        } finally {
          if (active) {
            setLoadingAddresses(
              false,
            );
          }
        }
      };

    loadAddresses();

    return () => {
      active = false;
    };
  }, []);

  const selectedAddress =
    useMemo(
      () =>
        addresses.find(
          (item) =>
            String(
              item?._id ||
                item?.id,
            ) ===
            String(
              selectedAddressId,
            ),
        ) || null,
      [
        addresses,
        selectedAddressId,
      ],
    );

  const originalSubtotal =
    Number(
      subtotal,
    ) || 0;

  const backendOfferDiscount =
    Number(
      offerDiscount,
    ) || 0;

  const offerSubtotal =
    Number.isFinite(
      Number(
        finalSubtotal,
      ),
    )
      ? Math.max(
          Number(
            finalSubtotal,
          ),
          0,
        )
      : Math.max(
          originalSubtotal -
            backendOfferDiscount,
          0,
        );

  const shippingFee =
    offerSubtotal >= 999
      ? 0
      : 99;

  const couponDiscount =
    Number(
      appliedCoupon?.discount,
    ) || 0;

  const previewTotal =
    Math.max(
      offerSubtotal +
        shippingFee -
        couponDiscount,
      0,
    );

  const handleAddressChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setAddress(
        (previous) => ({
          ...previous,
          [name]: value,
        }),
      );
    };

  const handleSaveAddress =
    async () => {
      setError("");

      if (
        !address.fullName.trim() ||
        !address.phone.trim() ||
        !address.addressLine1.trim() ||
        !address.city.trim() ||
        !address.state.trim() ||
        !address.postalCode.trim()
      ) {
        setError(
          "Please complete all required address fields.",
        );

        return;
      }

      try {
        setSubmitting(true);

        const response =
          await addAddress(
            address,
          );

        const updatedAddresses =
          getAddressList(
            response,
          );

        if (
          updatedAddresses.length
        ) {
          setAddresses(
            updatedAddresses,
          );

          const newestAddress =
            updatedAddresses[
              updatedAddresses.length -
                1
            ];

          setSelectedAddressId(
            newestAddress?._id ||
              newestAddress?.id ||
              "",
          );
        } else {
          const profileResponse =
            await getProfile();

          const refreshedAddresses =
            getAddressList(
              profileResponse,
            );

          setAddresses(
            refreshedAddresses,
          );

          const newestAddress =
            refreshedAddresses[
              refreshedAddresses.length -
                1
            ];

          if (
            newestAddress
          ) {
            setSelectedAddressId(
              newestAddress._id ||
                newestAddress.id ||
                "",
            );
          }
        }

        setAddress({
          ...EMPTY_ADDRESS,
        });

        setShowAddressForm(
          false,
        );
      } catch (
        saveError
      ) {
        console.error(
          "Failed to save address:",
          saveError,
        );

        setError(
          saveError?.message ||
            "Failed to save address.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleCouponChange =
    (event) => {
      const uppercaseCode =
        event.target.value
          .toUpperCase();

      setCouponCode(
        uppercaseCode,
      );

      if (appliedCoupon) {
        setAppliedCoupon(
          null,
        );
      }

      if (error) {
        setError("");
      }
    };

  const handleApplyCoupon =
    async () => {
      const code =
        couponCode
          .trim()
          .toUpperCase();

      if (!code) {
        setAppliedCoupon(
          null,
        );

        return;
      }

      if (
        !Number.isFinite(
          offerSubtotal,
        ) ||
        offerSubtotal <= 0
      ) {
        setError(
          "Your order amount is not available. Please refresh the cart and try again.",
        );

        return;
      }

      try {
        setCouponLoading(
          true,
        );

        setError("");

        const response =
          await validateCoupon(
            code,
            offerSubtotal,
          );

        const result =
          getCouponData(
            response,
          );

        if (
          !result.coupon
        ) {
          throw new Error(
            "Coupon could not be validated.",
          );
        }

        setAppliedCoupon(
          result,
        );

        setCouponCode(
          String(
            result.coupon.code ||
              code,
          )
            .trim()
            .toUpperCase(),
        );
      } catch (
        couponError
      ) {
        console.error(
          "Failed to apply coupon:",
          couponError,
        );

        setAppliedCoupon(
          null,
        );

        setError(
          couponError?.message ||
            "Invalid coupon.",
        );
      } finally {
        setCouponLoading(
          false,
        );
      }
    };

  const handleRemoveCoupon =
    () => {
      setCouponCode("");
      setAppliedCoupon(
        null,
      );
      setError("");
    };

  const handlePlaceOrder =
    async () => {
      setError("");

      if (!items.length) {
        setError(
          "Your cart is empty.",
        );

        return;
      }

      if (!selectedAddress) {
        setError(
          "Please select a shipping address.",
        );

        return;
      }

      if (
        paymentMethod !==
          "cod" &&
        paymentMethod !==
          "online"
      ) {
        setError(
          "Please select a payment method.",
        );

        return;
      }

      const shippingAddress =
        {
          fullName:
            selectedAddress.fullName,

          phone:
            selectedAddress.phone,

          email:
            selectedAddress.email ||
            "",

          addressLine1:
            selectedAddress.addressLine1,

          addressLine2:
            selectedAddress.addressLine2 ||
            "",

          city:
            selectedAddress.city,

          state:
            selectedAddress.state,

          postalCode:
            selectedAddress.postalCode,

          country:
            selectedAddress.country ||
            "India",
        };

      const finalCouponCode =
        (
          appliedCoupon?.coupon
            ?.code ||
          couponCode
        )
          .trim()
          .toUpperCase();

      try {
        setSubmitting(
          true,
        );

        const response =
          await createOrder({
            shippingAddress,
            paymentMethod,

            couponCode:
              finalCouponCode ||
              undefined,
          });

        const data =
          getResponseData(
            response,
          );

        const order =
          data?.order;

        if (
          !order?._id
        ) {
          throw new Error(
            "Order was created but no order ID was returned.",
          );
        }

        await loadCart(
          false,
        );

        if (
          paymentMethod ===
          "online"
        ) {
          navigate(
            `/order/${order._id}/payment`,
            {
              state: {
                order,
              },
            },
          );

          return;
        }

        navigate(
          `/order/success?orderId=${order._id}`,
          {
            replace: true,
          },
        );
      } catch (
        orderError
      ) {
        console.error(
          "Failed to create order:",
          orderError,
        );

        setError(
          orderError?.message ||
            "Unable to place your order. Please try again.",
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  if (
    cartLoading &&
    !items.length
  ) {
    return (
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.container
          }
        >
          <div
            className={
              styles.loading
            }
          >
            Loading checkout...
          </div>
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main
        className={
          styles.page
        }
      >
        <div
          className={
            styles.container
          }
        >
          <div
            className={
              styles.empty
            }
          >
            <h1>
              Your cart is empty
            </h1>

            <p>
              Add some jewellery
              to your cart before
              continuing to checkout.
            </p>

            <Link to="/shop">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={
        styles.page
      }
    >
      <div
        className={
          styles.container
        }
      >
        <header
          className={
            styles.header
          }
        >
          <Link
            to="/cart"
            className={
              styles.back
            }
          >
            <FiArrowLeft
              size={15}
            />

            Back to Cart
          </Link>

          <span
            className={
              styles.eyebrow
            }
          >
            Checkout
          </span>

          <h1
            className={
              styles.title
            }
          >
            Complete your order
          </h1>
        </header>

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
            styles.layout
          }
        >
          <div
            className={
              styles.main
            }
          >
            <section
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
                  <span
                    className={
                      styles.step
                    }
                  >
                    1
                  </span>

                  <h2>
                    Delivery Address
                  </h2>
                </div>

                <button
                  type="button"
                  className={
                    styles.secondaryButton
                  }
                  onClick={() =>
                    setShowAddressForm(
                      (value) =>
                        !value,
                    )
                  }
                >
                  {showAddressForm
                    ? "Cancel"
                    : "Add New Address"}
                </button>
              </div>

              {loadingAddresses ? (
                <div
                  className={
                    styles.loading
                  }
                >
                  Loading addresses...
                </div>
              ) : addresses.length ? (
                <div
                  className={
                    styles.addressList
                  }
                >
                  {addresses.map(
                    (item) => {
                      const id =
                        item?._id ||
                        item?.id;

                      const selected =
                        String(
                          id,
                        ) ===
                        String(
                          selectedAddressId,
                        );

                      return (
                        <button
                          key={id}
                          type="button"
                          className={[
                            styles.addressCard,
                            selected
                              ? styles.addressSelected
                              : "",
                          ]
                            .filter(
                              Boolean,
                            )
                            .join(
                              " ",
                            )}
                          onClick={() =>
                            setSelectedAddressId(
                              id,
                            )
                          }
                        >
                          <span
                            className={
                              styles.addressIcon
                            }
                          >
                            {selected ? (
                              <FiCheck
                                size={14}
                              />
                            ) : (
                              <FiMapPin
                                size={14}
                              />
                            )}
                          </span>

                          <span
                            className={
                              styles.addressContent
                            }
                          >
                            <strong>
                              {
                                item.fullName
                              }
                            </strong>

                            <span>
                              {
                                item.addressLine1
                              }

                              {item.addressLine2
                                ? `, ${item.addressLine2}`
                                : ""}
                            </span>

                            <span>
                              {
                                item.city
                              }
                              ,{" "}
                              {
                                item.state
                              }{" "}
                              {
                                item.postalCode
                              }
                            </span>

                            <span>
                              {
                                item.phone
                              }
                            </span>
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              ) : (
                <div
                  className={
                    styles.noAddresses
                  }
                >
                  <FiMapPin
                    size={17}
                  />

                  <p>
                    No saved address.
                    Add a delivery
                    address to
                    continue.
                  </p>
                </div>
              )}

              {showAddressForm && (
                <div
                  className={
                    styles.addressForm
                  }
                >
                  <div
                    className={
                      styles.formHeader
                    }
                  >
                    <h3>
                      New Address
                    </h3>
                  </div>

                  <div
                    className={
                      styles.formGrid
                    }
                  >
                    <label>
                      Full Name

                      <input
                        name="fullName"
                        value={
                          address.fullName
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Full name"
                      />
                    </label>

                    <label>
                      Phone

                      <input
                        name="phone"
                        value={
                          address.phone
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Phone number"
                      />
                    </label>

                    <label
                      className={
                        styles.fullField
                      }
                    >
                      Address Line 1

                      <input
                        name="addressLine1"
                        value={
                          address.addressLine1
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="House number, street"
                      />
                    </label>

                    <label
                      className={
                        styles.fullField
                      }
                    >
                      Address Line 2

                      <input
                        name="addressLine2"
                        value={
                          address.addressLine2
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Apartment, landmark"
                      />
                    </label>

                    <label>
                      City

                      <input
                        name="city"
                        value={
                          address.city
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="City"
                      />
                    </label>

                    <label>
                      State

                      <input
                        name="state"
                        value={
                          address.state
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="State"
                      />
                    </label>

                    <label>
                      Postal Code

                      <input
                        name="postalCode"
                        value={
                          address.postalCode
                        }
                        onChange={
                          handleAddressChange
                        }
                        placeholder="Postal code"
                      />
                    </label>

                    <label>
                      Country

                      <input
                        name="country"
                        value={
                          address.country
                        }
                        onChange={
                          handleAddressChange
                        }
                      />
                    </label>
                  </div>

                  <Button
                    type="button"
                    size="medium"
                    loading={
                      submitting
                    }
                    onClick={
                      handleSaveAddress
                    }
                  >
                    Save Address
                  </Button>
                </div>
              )}
            </section>

            <section
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
                  <span
                    className={
                      styles.step
                    }
                  >
                    2
                  </span>

                  <h2>
                    Payment Method
                  </h2>
                </div>
              </div>

              <div
                className={
                  styles.paymentOptions
                }
              >
                <button
                  type="button"
                  className={[
                    styles.paymentOption,
                    paymentMethod ===
                    "cod"
                      ? styles.paymentSelected
                      : "",
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      " ",
                    )}
                  onClick={() =>
                    setPaymentMethod(
                      "cod",
                    )
                  }
                >
                  <span
                    className={
                      styles.paymentRadio
                    }
                  >
                    {paymentMethod ===
                      "cod" && (
                      <FiCheck
                        size={13}
                      />
                    )}
                  </span>

                  <span>
                    <strong>
                      Cash on Delivery
                    </strong>

                    <small>
                      Pay when your
                      order is delivered.
                    </small>
                  </span>
                </button>

                <button
                  type="button"
                  className={[
                    styles.paymentOption,
                    paymentMethod ===
                    "online"
                      ? styles.paymentSelected
                      : "",
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(
                      " ",
                    )}
                  onClick={() =>
                    setPaymentMethod(
                      "online",
                    )
                  }
                >
                  <span
                    className={
                      styles.paymentRadio
                    }
                  >
                    {paymentMethod ===
                      "online" && (
                      <FiCheck
                        size={13}
                      />
                    )}
                  </span>

                  <span>
                    <strong>
                      Online Payment
                    </strong>

                    <small>
                      Continue to
                      secure online
                      payment.
                    </small>
                  </span>
                </button>
              </div>
            </section>
          </div>

          <aside
            className={
              styles.sidebar
            }
          >
            <section
              className={
                styles.summary
              }
            >
              <h2>
                Order Summary
              </h2>

              <div
                className={
                  styles.productList
                }
              >
                {items.map(
                  (item) => {
                    const product =
                      getProduct(
                        item,
                      );

                    const pricing =
                      getProductPricing(
                        item,
                      );

                    const quantity =
                      getQuantity(
                        item,
                      );

                    const image =
                      getProductImage(
                        item,
                      );

                    const lineTotal =
                      pricing.price *
                      quantity;

                    return (
                      <div
                        key={getProductId(
                          item,
                        )}
                        className={
                          styles.product
                        }
                      >
                        <div
                          className={
                            styles.productImage
                          }
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={
                                product.name ||
                                "Product"
                              }
                            />
                          ) : null}
                        </div>

                        <div
                          className={
                            styles.productInfo
                          }
                        >
                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <span>
                            Qty:{" "}
                            {
                              quantity
                            }
                          </span>

                          {pricing.offerDiscount >
                            0 && (
                            <span>
                              Offer applied
                            </span>
                          )}
                        </div>

                        <strong>
                          {formatPrice(
                            lineTotal,
                          )}
                        </strong>
                      </div>
                    );
                  },
                )}
              </div>

              <div
                className={
                  styles.coupon
                }
              >
                <div
                  className={
                    styles.couponRow
                  }
                >
                  <input
                    type="text"
                    value={
                      couponCode
                    }
                    onChange={
                      handleCouponChange
                    }
                    placeholder="Coupon code"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className={
                      styles.couponInput
                    }
                    disabled={
                      couponLoading ||
                      Boolean(
                        appliedCoupon,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                        "Enter"
                      ) {
                        event.preventDefault();

                        if (
                          !couponLoading &&
                          couponCode.trim()
                        ) {
                          handleApplyCoupon();
                        }
                      }
                    }}
                  />

                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={
                        handleRemoveCoupon
                      }
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        couponLoading ||
                        !couponCode.trim()
                      }
                      onClick={
                        handleApplyCoupon
                      }
                    >
                      {couponLoading
                        ? "..."
                        : "Apply"}
                    </button>
                  )}
                </div>

                {appliedCoupon && (
                  <p
                    className={
                      styles.couponSuccess
                    }
                  >
                    {String(
                      appliedCoupon
                        .coupon
                        ?.code ||
                        couponCode,
                    ).toUpperCase()}{" "}
                    applied. You save{" "}
                    {formatPrice(
                      couponDiscount,
                    )}
                    .
                  </p>
                )}
              </div>

              <div
                className={
                  styles.totals
                }
              >
                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    {formatPrice(
                      originalSubtotal,
                    )}
                  </strong>
                </div>

                {backendOfferDiscount >
                  0 && (
                  <div>
                    <span>
                      Offer Discount
                    </span>

                    <strong>
                      -
                      {formatPrice(
                        backendOfferDiscount,
                      )}
                    </strong>
                  </div>
                )}

                <div>
                  <span>
                    After Offers
                  </span>

                  <strong>
                    {formatPrice(
                      offerSubtotal,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Shipping
                  </span>

                  <strong>
                    {shippingFee ===
                    0
                      ? "Free"
                      : formatPrice(
                          shippingFee,
                        )}
                  </strong>
                </div>

                {couponDiscount >
                  0 && (
                  <div>
                    <span>
                      Coupon Discount
                    </span>

                    <strong>
                      -
                      {formatPrice(
                        couponDiscount,
                      )}
                    </strong>
                  </div>
                )}

                <div
                  className={
                    styles.total
                  }
                >
                  <span>
                    Total
                  </span>

                  <strong>
                    {formatPrice(
                      previewTotal,
                    )}
                  </strong>
                </div>
              </div>

              <Button
                type="button"
                fullWidth
                size="large"
                loading={
                  submitting
                }
                disabled={
                  !selectedAddress ||
                  loadingAddresses ||
                  !items.length
                }
                onClick={
                  handlePlaceOrder
                }
              >
                {paymentMethod ===
                "online"
                  ? "Continue to Payment"
                  : "Place Order"}
              </Button>

              <p
                className={
                  styles.note
                }
              >
                {count}{" "}
                {count === 1
                  ? "item"
                  : "items"}{" "}
                in your order
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;