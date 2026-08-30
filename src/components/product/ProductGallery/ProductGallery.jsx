import { useState } from "react";
import styles from "./ProductGallery.module.css";

function ProductGallery({ images = [], productName = "Product" }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images.length) {
    return (
      <div className={styles.empty}>
        <span>No image available</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <img
          src={selectedImage}
          alt={`${productName} ${selectedIndex + 1}`}
        />
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`${styles.thumbnail} ${
                selectedIndex === index ? styles.selected : ""
              }`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;