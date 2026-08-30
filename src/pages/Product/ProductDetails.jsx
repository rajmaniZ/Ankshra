import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import ProductGallery from "../../components/product/ProductGallery/ProductGallery";
import ProductInfo from "../../components/product/ProductInfo/ProductInfo";
import ProductReviewSummary from "../../components/product/ProductReviewSummary/ProductReviewSummary";
import RelatedProducts from "../../components/product/RelatedProducts/RelatedProducts";

import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

import {
  getProductById,
  getProductBySlug,
  getProducts,
} from "../../services/productService";

import {
  getProductReviews,
} from "../../services/reviewService";

import styles from "./ProductDetails.module.css";

function getProductId(product) {
  return (
    product?._id ||
    product?.id ||
    ""
  );
}

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
  }

  return (
    image.url ||
    image.secure_url ||
    image.src ||
    ""
  );
}

function getProductImages(product) {
  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    return product.images
      .map(getImageUrl)
      .filter(Boolean);
  }

  const fallbackImage =
    getImageUrl(product?.image) ||
    getImageUrl(product?.thumbnail);

  return fallbackImage
    ? [fallbackImage]
    : [];
}

function getCategoryName(product) {
  if (
    product?.category &&
    typeof product.category === "object"
  ) {
    return (
      product.category.name ||
      product.category.title ||
      ""
    );
  }

  return product?.category || "";
}

function getCategoryId(product) {
  if (
    product?.category &&
    typeof product.category === "object"
  ) {
    return (
      product.category._id ||
      product.category.id ||
      ""
    );
  }

  return "";
}

function getCategorySlug(product) {
  if (
    product?.category &&
    typeof product.category === "object"
  ) {
    return product.category.slug || "";
  }

  return "";
}

function getReviewList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.reviews)) {
    return response.reviews;
  }

  if (Array.isArray(response?.data?.reviews)) {
    return response.data.reviews;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function getPublicReviews(reviews) {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews.filter((review) => {
    if (!review) {
      return false;
    }

    if (
      review.reviewType &&
      review.reviewType !== "product"
    ) {
      return false;
    }

    if (review.isApproved === false) {
      return false;
    }

    if (review.isPublic === false) {
      return false;
    }

    return Number(review.rating) > 0;
  });
}

function getProductResponse(response) {
  return (
    response?.data?.product ||
    response?.product ||
    response?.data ||
    null
  );
}

function getProductsResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.products)) {
    return response.products;
  }

  if (Array.isArray(response?.data?.products)) {
    return response.data.products;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  const productId =
    getProductId(product);

  const images =
    getProductImages(product);

  const category =
    getCategoryName(product);

  const ratingAverage = Number(
    product?.rating?.average ??
      product?.averageRating ??
      product?.rating ??
      0,
  );

  const ratingCount = Number(
    product?.rating?.count ??
      product?.reviewCount ??
      product?.reviewsCount ??
      0,
  );

  return {
    ...product,

    id: productId,

    image:
      images[0] ||
      "",

    images,

    category,

    rating: {
      ...(product.rating &&
      typeof product.rating === "object"
        ? product.rating
        : {}),

      average:
        Number.isFinite(ratingAverage) &&
        ratingAverage > 0
          ? Math.min(5, ratingAverage)
          : 0,

      count:
        Number.isFinite(ratingCount) &&
        ratingCount > 0
          ? Math.floor(ratingCount)
          : 0,
    },
  };
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Unable to load this product."
  );
}

function ProductDetails() {
  const {
    id,
    slug,
  } = useParams();

  const {
    addToCart,
  } = useCart();

  const {
    isWishlisted,
    toggleWishlist,
  } = useWishlist();

  const [product, setProduct] =
    useState(null);

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reviewsError, setReviewsError] =
    useState("");

  const [
    selectedVariants,
    setSelectedVariants,
  ] = useState({});

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setRelatedProducts([]);
      setSelectedVariants({});

      try {
        let response;

        if (slug) {
          response =
            await getProductBySlug(slug);
        } else if (id) {
          response =
            await getProductById(id);
        } else {
          throw new Error(
            "Product identifier is missing.",
          );
        }

        const productData =
          getProductResponse(response);

        if (!active) {
          return;
        }

        if (!productData) {
          setError(
            "The product you are looking for is no longer available.",
          );

          return;
        }

        const normalized =
          normalizeProduct(productData);

        setProduct(normalized);

        const categoryId =
          getCategoryId(productData);

        const categorySlug =
          getCategorySlug(productData);

        const categoryQuery =
          categoryId
            ? {
                category: categoryId,
              }
            : categorySlug
              ? {
                  category: categorySlug,
                }
              : {};

        try {
          const relatedResponse =
            await getProducts({
              ...categoryQuery,
              limit: 5,
            });

          if (!active) {
            return;
          }

          const currentId =
            getProductId(productData);

          const related =
            getProductsResponse(
              relatedResponse,
            )
              .filter(
                (item) =>
                  getProductId(item) !==
                  currentId,
              )
              .slice(0, 4)
              .map(normalizeProduct)
              .filter(Boolean);

          setRelatedProducts(
            related,
          );
        } catch (relatedError) {
          if (active) {
            console.error(
              "Failed to load related products:",
              relatedError,
            );

            setRelatedProducts([]);
          }
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        console.error(
          "Failed to load product:",
          loadError,
        );

        setProduct(null);
        setError(
          getErrorMessage(loadError),
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id, slug]);

  useEffect(() => {
    if (!product?.id) {
      setReviews([]);
      setReviewsLoading(false);
      return undefined;
    }

    let active = true;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError("");

      try {
        const response =
          await getProductReviews(
            product.id,
          );

        if (!active) {
          return;
        }

        const reviewList =
          getReviewList(response);

        setReviews(
          getPublicReviews(
            reviewList,
          ),
        );
      } catch (reviewLoadError) {
        if (!active) {
          return;
        }

        console.error(
          "Failed to load product reviews:",
          reviewLoadError,
        );

        setReviews([]);
        setReviewsError(
          getErrorMessage(
            reviewLoadError,
          ),
        );
      } finally {
        if (active) {
          setReviewsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, [product?.id]);

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

  const handleAddToCart = async (
    quantity,
  ) => {
    if (!product?.id) {
      return;
    }

    try {
      await addToCart(
        product.id,
        quantity,
      );

      toast.success(
        quantity > 1
          ? `${product.name} (${quantity}) added to cart.`
          : `${product.name} added to cart.`,
      );
    } catch (addError) {
      console.error(
        "Failed to add product to cart:",
        addError,
      );

      toast.error(
        addError?.response?.data?.message ||
          addError?.message ||
          "Unable to add product to cart.",
      );
    }
  };

  const handleBuyNow = async (
    quantity,
  ) => {
    if (!product?.id) {
      return;
    }

    try {
      await addToCart(
        product.id,
        quantity,
      );

      toast.success(
        "Product added to cart.",
      );
    } catch (addError) {
      console.error(
        "Failed to add product for checkout:",
        addError,
      );

      toast.error(
        addError?.response?.data?.message ||
          addError?.message ||
          "Unable to continue to checkout.",
      );

      return;
    }

    window.location.assign(
      "/checkout",
    );
  };

  const handleWishlist = async () => {
    if (!product) {
      return;
    }

    try {
      await toggleWishlist(
        product,
      );

      toast.success(
        isWishlisted(product.id)
          ? `${product.name} removed from wishlist.`
          : `${product.name} added to wishlist.`,
      );
    } catch (wishlistError) {
      console.error(
        "Failed to update wishlist:",
        wishlistError,
      );

      toast.error(
        wishlistError?.response?.data
          ?.message ||
          wishlistError?.message ||
          "Unable to update wishlist.",
      );
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <span className={styles.loadingLine} />
            <span className={styles.loadingLine} />
            <span className={styles.loadingLine} />
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          <span className={styles.eyebrow}>
            Product
          </span>

          <h1>
            Product not found
          </h1>

          <p>
            {error ||
              "The product you are looking for is no longer available."}
          </p>

          <Link
            to="/shop"
            className={styles.backButton}
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const productImages =
    getProductImages(product);

  const category =
    getCategoryName(product);

  const wishlisted =
    Boolean(
      isWishlisted(product.id),
    );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <nav
          className={styles.breadcrumb}
          aria-label="Breadcrumb"
        >
          <Link to="/">
            Home
          </Link>

          <span>/</span>

          <Link to="/shop">
            Shop
          </Link>

          {category && (
            <>
              <span>/</span>

              <span>
                {category}
              </span>
            </>
          )}

          <span>/</span>

          <span
            className={
              styles.current
            }
          >
            {product.name}
          </span>
        </nav>

        <section
          className={styles.product}
        >
          <div
            className={
              styles.galleryColumn
            }
          >
            <ProductGallery
              images={productImages}
              productName={
                product.name
              }
            />
          </div>

          <div
            className={
              styles.infoColumn
            }
          >
            <ProductInfo
              product={product}
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
        </section>

        {!reviewsLoading &&
          reviews.length > 0 && (
            <section
              className={
                styles.reviewSection
              }
              aria-labelledby="product-reviews-title"
            >
              <div
                className={
                  styles.reviewHeader
                }
              >
                <span
                  className={
                    styles.eyebrow
                  }
                >
                  Customer feedback
                </span>

                <h2
                  id="product-reviews-title"
                  className={
                    styles.reviewTitle
                  }
                >
                  Reviews
                </h2>

                <p
                  className={
                    styles.reviewIntro
                  }
                >
                  See what customers who
                  purchased this product
                  think about it.
                </p>
              </div>

              <ProductReviewSummary
                reviews={reviews}
              />
            </section>
          )}

        {!reviewsLoading &&
          reviews.length === 0 &&
          reviewsError && (
            <section
              className={
                styles.reviewError
              }
            >
              <span>
                Reviews are temporarily
                unavailable.
              </span>
            </section>
          )}

        {relatedProducts.length >
          0 && (
          <RelatedProducts
            products={
              relatedProducts
            }
          />
        )}
      </div>
    </main>
  );
}

export default ProductDetails;