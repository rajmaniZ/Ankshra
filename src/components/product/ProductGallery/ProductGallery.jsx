import {
  useEffect,
  useState,
} from "react";

import {
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import styles from "./ProductGallery.module.css";

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

function ProductGallery({
  images = [],
  productName = "Product",
}) {
  const normalizedImages =
    Array.isArray(images)
      ? images
          .map(getImageUrl)
          .filter(Boolean)
      : [];

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  if (!normalizedImages.length) {
    return (
      <div className={styles.empty}>
        <span>
          No image available
        </span>
      </div>
    );
  }

  const selectedImage =
    normalizedImages[
      selectedIndex
    ] ||
    normalizedImages[0];

  const showPrevious = () => {
    setSelectedIndex(
      (current) =>
        current <= 0
          ? normalizedImages.length - 1
          : current - 1,
    );
  };

  const showNext = () => {
    setSelectedIndex(
      (current) =>
        current >=
        normalizedImages.length - 1
          ? 0
          : current + 1,
    );
  };

  return (
    <div className={styles.gallery}>
      <div
        className={
          styles.mainImage
        }
      >
        <img
          src={selectedImage}
          alt={`${productName} ${
            selectedIndex + 1
          }`}
        />

        {normalizedImages.length >
          1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.previous}`}
              onClick={
                showPrevious
              }
              aria-label="Previous product image"
            >
              <FiChevronLeft
                size={20}
              />
            </button>

            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              onClick={showNext}
              aria-label="Next product image"
            >
              <FiChevronRight
                size={20}
              />
            </button>

            <span
              className={
                styles.counter
              }
            >
              {selectedIndex + 1} /{" "}
              {normalizedImages.length}
            </span>
          </>
        )}
      </div>

      {normalizedImages.length >
        1 && (
        <div
          className={
            styles.thumbnails
          }
        >
          {normalizedImages.map(
            (image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`${styles.thumbnail} ${
                  selectedIndex ===
                  index
                    ? styles.selected
                    : ""
                }`}
                onClick={() =>
                  setSelectedIndex(
                    index,
                  )
                }
                aria-label={`View product image ${
                  index + 1
                }`}
                aria-current={
                  selectedIndex ===
                  index
                    ? "true"
                    : undefined
                }
              >
                <img
                  src={image}
                  alt=""
                />
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;