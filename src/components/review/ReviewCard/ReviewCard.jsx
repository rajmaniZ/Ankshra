import { useState } from "react";

import {
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";

import RatingStars from "../RatingStars/RatingStars";

import styles from "./ReviewCard.module.css";

function getUserName(review) {
  const user = review?.user || review?.customer;

  if (typeof user === "string") {
    return user;
  }

  if (user?.name) {
    return user.name;
  }

  if (user?.firstName || user?.lastName) {
    return `${user.firstName || ""} ${
      user.lastName || ""
    }`.trim();
  }

  if (review?.userName) {
    return review.userName;
  }

  if (user?.email) {
    return user.email;
  }

  return "Customer";
}

function getInitial(name) {
  if (!name) {
    return "C";
  }

  return (
    name.trim().charAt(0).toUpperCase() || "C"
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getImages(review) {
  if (!Array.isArray(review?.images)) {
    return [];
  }

  return review.images
    .map((image) => {
      if (typeof image === "string") {
        return {
          url: image,
          publicId: "",
          alt: "",
        };
      }

      return {
        url: image?.url || "",
        publicId: image?.publicId || "",
        alt: image?.alt || "",
      };
    })
    .filter((image) => image.url);
}

function getPublicReply(review) {
  const reply = review?.adminReply;

  if (!reply) {
    return null;
  }

  if (typeof reply === "string") {
    return {
      message: reply,
      isPublic: true,
      repliedAt: null,
    };
  }

  if (!reply.message || !reply.isPublic) {
    return null;
  }

  return reply;
}

function ReviewCard({
  review,
  showReply = true,
}) {
  const [activeImage, setActiveImage] =
    useState(0);

  const [lightboxOpen, setLightboxOpen] =
    useState(false);

  if (!review) {
    return null;
  }

  const userName = getUserName(review);
  const images = getImages(review);
  const reply = getPublicReply(review);

  const hasImages = images.length > 0;

  const openImage = (index) => {
    setActiveImage(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const showPreviousImage = () => {
    setActiveImage((current) => {
      if (current <= 0) {
        return images.length - 1;
      }

      return current - 1;
    });
  };

  const showNextImage = () => {
    setActiveImage((current) => {
      if (current >= images.length - 1) {
        return 0;
      }

      return current + 1;
    });
  };

  return (
    <>
      <article className={styles.card}>
        <div className={styles.header}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              {getInitial(userName)}
            </div>

            <div className={styles.userInfo}>
              <strong>{userName}</strong>

              <div className={styles.meta}>
                {review.reviewType === "product" &&
                  review.isVerifiedPurchase && (
                    <span
                      className={styles.verified}
                    >
                      Verified purchase
                    </span>
                  )}

                {review.createdAt && (
                  <span className={styles.date}>
                    {formatDate(review.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <RatingStars
            value={Number(review.rating) || 0}
            readOnly
            size="small"
          />
        </div>

        {review.title && (
          <h3 className={styles.title}>
            {review.title}
          </h3>
        )}

        {review.comment && (
          <p className={styles.comment}>
            {review.comment}
          </p>
        )}

        {hasImages && (
          <div className={styles.images}>
            {images.map((image, index) => (
              <button
                type="button"
                key={
                  image.publicId ||
                  `${image.url}-${index}`
                }
                className={styles.imageButton}
                onClick={() =>
                  openImage(index)
                }
              >
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    `Review image ${index + 1}`
                  }
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        {showReply && reply && (
          <div className={styles.reply}>
            <strong>
              Response from Ayushi Jewellery
            </strong>

            <p>{reply.message}</p>

            {reply.repliedAt && (
              <span>
                {formatDate(reply.repliedAt)}
              </span>
            )}
          </div>
        )}
      </article>

      {lightboxOpen && hasImages && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Review image viewer"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className={styles.close}
            onClick={closeLightbox}
            aria-label="Close image"
          >
            <FiX size={22} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className={`${styles.navigation} ${styles.previous}`}
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              aria-label="Previous image"
            >
              <FiChevronLeft size={24} />
            </button>
          )}

          <img
            src={images[activeImage]?.url}
            alt={
              images[activeImage]?.alt ||
              "Review image"
            }
            className={styles.lightboxImage}
            onClick={(event) =>
              event.stopPropagation()
            }
          />

          {images.length > 1 && (
            <button
              type="button"
              className={`${styles.navigation} ${styles.next}`}
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              aria-label="Next image"
            >
              <FiChevronRight size={24} />
            </button>
          )}

          {images.length > 1 && (
            <span className={styles.imageCounter}>
              {activeImage + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}

export default ReviewCard;