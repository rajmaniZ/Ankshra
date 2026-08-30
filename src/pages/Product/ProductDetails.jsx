// import {
//   useEffect,
//   useState,
// } from "react";

// import {
//   Link,
//   useParams,
// } from "react-router-dom";

// import ProductGallery from "../../components/product/ProductGallery/ProductGallery";
// import ProductInfo from "../../components/product/ProductInfo/ProductInfo";
// import RelatedProducts from "../../components/product/RelatedProducts/RelatedProducts";

// import useCart from "../../hooks/useCart";
// import useWishlist from "../../hooks/useWishlist";

// import {
//   getProductById,
//   getProductBySlug,
//   getProducts,
// } from "../../services/productService";

// import styles from "./ProductDetails.module.css";

// function getProductId(product) {
//   return (
//     product?._id ||
//     product?.id ||
//     ""
//   );
// }

// function getProductImage(product) {
//   const firstImage =
//     product?.images?.[0];

//   if (
//     firstImage &&
//     typeof firstImage === "object"
//   ) {
//     return (
//       firstImage.url ||
//       firstImage.secure_url ||
//       ""
//     );
//   }

//   return (
//     firstImage ||
//     product?.image ||
//     ""
//   );
// }

// function getProductImages(product) {
//   if (
//     Array.isArray(product?.images) &&
//     product.images.length > 0
//   ) {
//     return product.images.map(
//       (image) => {
//         if (
//           typeof image === "object"
//         ) {
//           return (
//             image.url ||
//             image.secure_url ||
//             ""
//           );
//         }

//         return image;
//       },
//     ).filter(Boolean);
//   }

//   const image =
//     getProductImage(product);

//   return image ? [image] : [];
// }

// function getCategoryName(product) {
//   if (
//     product?.category &&
//     typeof product.category ===
//       "object"
//   ) {
//     return (
//       product.category.name ||
//       ""
//     );
//   }

//   return product?.category || "";
// }

// function getCategoryId(product) {
//   if (
//     product?.category &&
//     typeof product.category ===
//       "object"
//   ) {
//     return (
//       product.category._id ||
//       product.category.id ||
//       ""
//     );
//   }

//   return "";
// }

// function normalizeProduct(product) {
//   if (!product) {
//     return null;
//   }

//   return {
//     ...product,

//     id: getProductId(product),

//     image:
//       getProductImage(product),

//     images:
//       getProductImages(product),

//     category:
//       getCategoryName(product),

//     rating:
//       product.rating?.average ??
//       product.rating ??
//       0,

//     reviewCount:
//       product.reviewCount ??
//       product.rating?.count ??
//       0,
//   };
// }

// async function loadProduct(id) {
//   try {
//     const response =
//       await getProductBySlug(id);

//     const product =
//       response?.data?.product ||
//       response?.product ||
//       response?.data ||
//       null;

//     if (product) {
//       return product;
//     }
//   } catch (error) {
//     if (
//       error?.status !== 404
//     ) {
//       throw error;
//     }
//   }

//   const response =
//     await getProductById(id);

//   return (
//     response?.data?.product ||
//     response?.product ||
//     response?.data ||
//     null
//   );
// }

// function ProductDetails() {
//   const { id } = useParams();

//   const {
//     addToCart,
//   } = useCart();

//   const {
//     isWishlisted,
//     toggleWishlist,
//   } = useWishlist();

//   const [product, setProduct] =
//     useState(null);

//   const [
//     relatedProducts,
//     setRelatedProducts,
//   ] = useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState(null);

//   const [
//     selectedVariants,
//     setSelectedVariants,
//   ] = useState({});

//   useEffect(() => {
//     let active = true;

//     async function fetchProduct() {
//       if (!id) {
//         setError(
//           new Error(
//             "Product identifier is missing",
//           ),
//         );
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       setError(null);

//       try {
//         const productData =
//           await loadProduct(id);

//         if (!active) {
//           return;
//         }

//         if (!productData) {
//           setProduct(null);
//           setError(
//             new Error(
//               "Product not found",
//             ),
//           );
//           return;
//         }

//         setProduct(productData);

//         const categoryId =
//           getCategoryId(
//             productData,
//           );

//         if (!categoryId) {
//           setRelatedProducts([]);
//           return;
//         }

//         try {
//           const relatedResponse =
//             await getProducts({
//               category:
//                 categoryId,
//               limit: 5,
//             });

//           const products =
//             relatedResponse?.data
//               ?.products ||
//             [];

//           if (!active) {
//             return;
//           }

//           const currentProductId =
//             getProductId(
//               productData,
//             );

//           const related =
//             Array.isArray(products)
//               ? products
//                   .filter(
//                     (item) =>
//                       String(
//                         getProductId(
//                           item,
//                         ),
//                       ) !==
//                       String(
//                         currentProductId,
//                       ),
//                   )
//                   .slice(0, 4)
//                   .map(
//                     normalizeProduct,
//                   )
//               : [];

//           setRelatedProducts(
//             related,
//           );
//         } catch (
//           relatedError
//         ) {
//           console.error(
//             "Failed to load related products:",
//             relatedError,
//           );

//           if (active) {
//             setRelatedProducts(
//               [],
//             );
//           }
//         }
//       } catch (loadError) {
//         console.error(
//           "Failed to load product:",
//           loadError,
//         );

//         if (!active) {
//           return;
//         }

//         setProduct(null);
//         setRelatedProducts([]);
//         setError(loadError);
//       } finally {
//         if (active) {
//           setLoading(false);
//         }
//       }
//     }

//     fetchProduct();

//     return () => {
//       active = false;
//     };
//   }, [id]);

//   const handleVariantChange = (
//     name,
//     value,
//   ) => {
//     setSelectedVariants(
//       (current) => ({
//         ...current,
//         [name]: value,
//       }),
//     );
//   };

//   const handleAddToCart = async (
//     quantity = 1,
//   ) => {
//     if (!product) {
//       return;
//     }

//     try {
//       await addToCart(
//         product,
//         quantity,
//       );
//     } catch (error) {
//       console.error(
//         "Failed to add product to cart:",
//         error,
//       );
//     }
//   };

//   const handleBuyNow = async (
//     quantity = 1,
//   ) => {
//     if (!product) {
//       return;
//     }

//     try {
//       await addToCart(
//         product,
//         quantity,
//       );
//     } catch (error) {
//       console.error(
//         "Failed to buy product:",
//         error,
//       );
//     }
//   };

//   const handleWishlist = async () => {
//     if (!product) {
//       return;
//     }

//     try {
//       await toggleWishlist(
//         product,
//       );
//     } catch (error) {
//       console.error(
//         "Failed to update wishlist:",
//         error,
//       );
//     }
//   };

//   if (loading) {
//     return (
//       <div
//         className={styles.notFound}
//       >
//         <p>
//           Loading product...
//         </p>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div
//         className={styles.notFound}
//       >
//         <h1>
//           Product not found
//         </h1>

//         <p>
//           The product you are
//           looking for is no
//           longer available.
//         </p>

//         <Link
//           to="/shop"
//           className={
//             styles.backButton
//           }
//         >
//           Continue Shopping
//         </Link>
//       </div>
//     );
//   }

//   const productId =
//     getProductId(product);

//   const normalizedProduct =
//     normalizeProduct(product);

//   const images =
//     getProductImages(product);

//   return (
//     <div
//       className={styles.page}
//     >
//       <div
//         className={styles.container}
//       >
//         <nav
//           className={
//             styles.breadcrumb
//           }
//         >
//           <Link to="/">
//             Home
//           </Link>

//           <span>/</span>

//           <Link to="/shop">
//             Shop
//           </Link>

//           <span>/</span>

//           <span>
//             {product.name}
//           </span>
//         </nav>

//         <div
//           className={styles.product}
//         >
//           <ProductGallery
//             images={images}
//             productName={
//               product.name
//             }
//           />

//           <ProductInfo
//             product={
//               normalizedProduct
//             }
//             selectedVariants={
//               selectedVariants
//             }
//             onVariantChange={
//               handleVariantChange
//             }
//             onAddToCart={
//               handleAddToCart
//             }
//             onBuyNow={
//               handleBuyNow
//             }
//             onWishlist={
//               handleWishlist
//             }
//             isWishlisted={
//               isWishlisted(
//                 productId,
//               )
//             }
//           />
//         </div>

//         {relatedProducts.length >
//           0 && (
//           <RelatedProducts
//             products={
//               relatedProducts
//             }
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// export default ProductDetails;

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import ProductGallery from "../../components/product/ProductGallery/ProductGallery";
import ProductInfo from "../../components/product/ProductInfo/ProductInfo";
import RelatedProducts from "../../components/product/RelatedProducts/RelatedProducts";

import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

import {
  getProductById,
  getProductBySlug,
  getProducts,
} from "../../services/productService";

import styles from "./ProductDetails.module.css";

function getProductId(product) {
  return (
    product?._id ||
    product?.id ||
    ""
  );
}

function getProductImage(product) {
  const firstImage =
    product?.images?.[0];

  if (
    firstImage &&
    typeof firstImage ===
      "object"
  ) {
    return (
      firstImage.url ||
      firstImage.secure_url ||
      ""
    );
  }

  return (
    firstImage ||
    product?.image ||
    product?.thumbnail ||
    ""
  );
}

function getProductImages(product) {
  if (
    Array.isArray(
      product?.images,
    ) &&
    product.images.length > 0
  ) {
    return product.images
      .map((image) => {
        if (
          typeof image ===
          "object"
        ) {
          return (
            image.url ||
            image.secure_url ||
            ""
          );
        }

        return image;
      })
      .filter(Boolean);
  }

  const image =
    getProductImage(product);

  return image ? [image] : [];
}

function getCategoryName(product) {
  if (
    product?.category &&
    typeof product.category ===
      "object"
  ) {
    return (
      product.category.name ||
      ""
    );
  }

  return product?.category || "";
}

function getCategoryId(product) {
  if (
    product?.category &&
    typeof product.category ===
      "object"
  ) {
    return (
      product.category._id ||
      product.category.id ||
      ""
    );
  }

  return "";
}

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  return {
    ...product,

    id: getProductId(product),

    image:
      getProductImage(product),

    images:
      getProductImages(product),

    category:
      getCategoryName(product),

    rating:
      product.rating?.average ??
      product.rating ??
      0,

    reviewCount:
      product.reviewCount ??
      product.rating?.count ??
      0,
  };
}

async function loadProduct(id) {
  try {
    const response =
      await getProductById(id);

    return (
      response?.data?.product ||
      response?.product ||
      response?.data ||
      null
    );
  } catch (error) {
    if (
      error?.status !== 404
    ) {
      throw error;
    }
  }

  try {
    const response =
      await getProductBySlug(id);

    return (
      response?.data?.product ||
      response?.product ||
      response?.data ||
      null
    );
  } catch (error) {
    if (
      error?.status === 404
    ) {
      return null;
    }

    throw error;
  }
}

function ProductDetails() {
  const { id } = useParams();
  const navigate =
    useNavigate();

  const {
    addToCart,
  } = useCart();

  const {
    isWishlisted,
    toggleWishlist,
  } = useWishlist();

  const [product, setProduct] =
    useState(null);

  const [
    relatedProducts,
    setRelatedProducts,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [
    selectedVariants,
    setSelectedVariants,
  ] = useState({});

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchProduct() {
      if (!id) {
        setError(
          new Error(
            "Product identifier is missing",
          ),
        );

        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const productData =
          await loadProduct(id);

        if (!active) {
          return;
        }

        if (!productData) {
          setProduct(null);

          setError(
            new Error(
              "Product not found",
            ),
          );

          setRelatedProducts([]);

          return;
        }

        setProduct(productData);

        const categoryId =
          getCategoryId(
            productData,
          );

        if (!categoryId) {
          setRelatedProducts([]);
          return;
        }

        try {
          const relatedResponse =
            await getProducts({
              category:
                categoryId,
              limit: 5,
            });

          const products =
            relatedResponse?.data
              ?.products ||
            [];

          if (!active) {
            return;
          }

          const currentProductId =
            getProductId(
              productData,
            );

          const related =
            Array.isArray(products)
              ? products
                  .filter(
                    (item) =>
                      String(
                        getProductId(
                          item,
                        ),
                      ) !==
                      String(
                        currentProductId,
                      ),
                  )
                  .slice(0, 4)
                  .map(
                    normalizeProduct,
                  )
              : [];

          setRelatedProducts(
            related,
          );
        } catch (
          relatedError
        ) {
          console.error(
            "Failed to load related products:",
            relatedError,
          );

          if (active) {
            setRelatedProducts(
              [],
            );
          }
        }
      } catch (loadError) {
        console.error(
          "Failed to load product:",
          loadError,
        );

        if (!active) {
          return;
        }

        setProduct(null);
        setRelatedProducts([]);
        setError(loadError);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const handleVariantChange = (
    name,
    value,
  ) => {
    setSelectedVariants(
      (current) => ({
        ...current,
        [name]: value,
      }),
    );
  };

  const handleAddToCart =
    async (quantity = 1) => {
      if (!product) {
        return;
      }

      if (
        Number(product.stock) <= 0
      ) {
        toast.error(
          "This product is out of stock.",
        );
        return;
      }

      if (actionLoading) {
        return;
      }

      setActionLoading(true);

      try {
        await addToCart(
          product,
          quantity,
        );

        toast.success(
          `${product.name} added to cart.`,
        );
      } catch (error) {
        console.error(
          "Failed to add product to cart:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to add product to cart.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleBuyNow =
    async (quantity = 1) => {
      if (!product) {
        return;
      }

      if (
        Number(product.stock) <= 0
      ) {
        toast.error(
          "This product is out of stock.",
        );
        return;
      }

      if (actionLoading) {
        return;
      }

      setActionLoading(true);

      try {
        await addToCart(
          product,
          quantity,
        );

        toast.success(
          "Product added to cart.",
        );

        navigate("/checkout");
      } catch (error) {
        console.error(
          "Failed to buy product:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to continue to checkout.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleWishlist =
    async () => {
      if (!product) {
        return;
      }

      if (actionLoading) {
        return;
      }

      const productId =
        getProductId(product);

      const wasWishlisted =
        Boolean(
          isWishlisted(
            productId,
          ),
        );

      setActionLoading(true);

      try {
        await toggleWishlist(
          product,
        );

        if (wasWishlisted) {
          toast.success(
            `${product.name} removed from wishlist.`,
          );
        } else {
          toast.success(
            `${product.name} added to wishlist.`,
          );
        }
      } catch (error) {
        console.error(
          "Failed to update wishlist:",
          error,
        );

        toast.error(
          error?.message ||
            "Unable to update wishlist.",
        );
      } finally {
        setActionLoading(false);
      }
    };

  if (loading) {
    return (
      <div
        className={
          styles.loading
        }
      >
        Loading product...
      </div>
    );
  }

  if (
    !product ||
    error
  ) {
    return (
      <div
        className={
          styles.notFound
        }
      >
        <h1>
          Product not found
        </h1>

        <p>
          The product you are
          looking for is no longer
          available.
        </p>

        <Link
          to="/shop"
          className={
            styles.backButton
          }
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const productId =
    getProductId(product);

  const images =
    getProductImages(product);

  const wishlisted =
    Boolean(
      isWishlisted(
        productId,
      ),
    );

  return (
    <div
      className={
        styles.page
      }
    >
      <div
        className={
          styles.container
        }
      >
        <nav
          className={
            styles.breadcrumb
          }
        >
          <Link to="/">
            Home
          </Link>

          <span>/</span>

          <Link to="/shop">
            Shop
          </Link>

          <span>/</span>

          <span>
            {product.name}
          </span>
        </nav>

        <div
          className={
            styles.product
          }
        >
          <ProductGallery
            images={images}
            productName={
              product.name
            }
          />

          <ProductInfo
            product={{
              ...product,
              id: productId,
              image:
                getProductImage(
                  product,
                ),
              images,
              category:
                getCategoryName(
                  product,
                ),
              rating:
                product.rating
                  ?.average ??
                product.rating ??
                0,
              reviewCount:
                product.reviewCount ??
                product.rating
                  ?.count ??
                0,
            }}
            selectedVariants={
              selectedVariants
            }
            onVariantChange={
              handleVariantChange
            }
            onAddToCart={
              handleAddToCart
            }
            onBuyNow={
              handleBuyNow
            }
            onWishlist={
              handleWishlist
            }
            isWishlisted={
              wishlisted
            }
          />
        </div>

        <RelatedProducts
          products={
            relatedProducts
          }
        />
      </div>
    </div>
  );
}

export default ProductDetails;