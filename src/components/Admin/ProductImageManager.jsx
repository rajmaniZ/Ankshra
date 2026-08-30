import {
  useRef,
  useState,
} from "react";

import {
  FiImage,
  FiPlus,
  FiTrash2,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiUploadCloud,
} from "react-icons/fi";

import {
  uploadAdminImages,
} from "../../services/adminMediaService";

import styles from "./ProductImageManager.module.css";

const MAX_IMAGES = 8;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function normaliseImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === "string") {
        return {
          url: image,
          publicId: "",
        };
      }

      if (
        image &&
        typeof image === "object"
      ) {
        return {
          url:
            image.url ||
            image.secure_url ||
            "",
          publicId:
            image.publicId ||
            image.public_id ||
            "",
        };
      }

      return {
        url: "",
        publicId: "",
      };
    })
    .filter((image) =>
      Boolean(image.url),
    );
}

function getImageKey(image, index) {
  return (
    image?.publicId ||
    image?.url ||
    `image-${index}`
  );
}

export default function ProductImageManager({
  images = [],
  thumbnail = "",
  onChange,
  onThumbnailChange,
  disabled = false,
}) {
  const inputRef = useRef(null);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const currentImages =
    normaliseImages(images);

  const remainingImages =
    MAX_IMAGES -
    currentImages.length;

  const openPicker = () => {
    if (
      disabled ||
      uploading ||
      currentImages.length >= MAX_IMAGES
    ) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFiles = async (
    event,
  ) => {
    const files = Array.from(
      event.target.files || [],
    );

    event.target.value = "";

    if (!files.length) {
      return;
    }

    setError("");

    const remaining =
      MAX_IMAGES -
      currentImages.length;

    if (remaining <= 0) {
      setError(
        `A product can have up to ${MAX_IMAGES} images.`,
      );
      return;
    }

    if (files.length > remaining) {
      setError(
        `You can add only ${remaining} more image${
          remaining === 1 ? "" : "s"
        }.`,
      );
      return;
    }

    const invalidType =
      files.find(
        (file) =>
          !ACCEPTED_TYPES.includes(
            file.type,
          ),
      );

    if (invalidType) {
      setError(
        "Only JPG, JPEG, PNG and WEBP images are allowed.",
      );
      return;
    }

    const oversized =
      files.find(
        (file) =>
          file.size > MAX_FILE_SIZE,
      );

    if (oversized) {
      setError(
        "Each image must be 5 MB or smaller.",
      );
      return;
    }

    try {
      setUploading(true);

      const response =
        await uploadAdminImages(
          files,
          "product",
        );

      const uploaded =
        Array.isArray(
          response?.data?.images,
        )
          ? response.data.images
          : [];

      if (!uploaded.length) {
        throw new Error(
          "The server did not return the uploaded images.",
        );
      }

      const nextImages = [
        ...currentImages,
        ...normaliseImages(
          uploaded,
        ),
      ].slice(0, MAX_IMAGES);

      onChange?.(nextImages);

      if (
        !thumbnail &&
        nextImages[0]?.url
      ) {
        onThumbnailChange?.(
          nextImages[0].url,
        );
      }
    } catch (uploadError) {
      setError(
        uploadError?.message ||
          "Unable to upload product images.",
      );
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    if (
      disabled ||
      uploading
    ) {
      return;
    }

    const image =
      currentImages[index];

    if (!image) {
      return;
    }

    const nextImages =
      currentImages.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      );

    onChange?.(nextImages);

    if (
      image.url === thumbnail
    ) {
      onThumbnailChange?.(
        nextImages[0]?.url || "",
      );
    }
  };

  const setThumbnail = (image) => {
    if (
      disabled ||
      uploading ||
      !image?.url
    ) {
      return;
    }

    onThumbnailChange?.(
      image.url,
    );
  };

  const moveImage = (
    index,
    direction,
  ) => {
    if (
      disabled ||
      uploading
    ) {
      return;
    }

    const target =
      index + direction;

    if (
      target < 0 ||
      target >= currentImages.length
    ) {
      return;
    }

    const nextImages = [
      ...currentImages,
    ];

    const movedImage =
      nextImages.splice(
        index,
        1,
      )[0];

    nextImages.splice(
      target,
      0,
      movedImage,
    );

    onChange?.(nextImages);
  };

  return (
    <section
      className={styles.wrapper}
    >
      <div
        className={styles.header}
      >
        <div
          className={styles.titleRow}
        >
          <div
            className={styles.titleIcon}
          >
            <FiImage size={17} />
          </div>

          <div
            className={styles.titleContent}
          >
            <h3>
              Product Images
            </h3>

            <p>
              Upload up to {MAX_IMAGES}{" "}
              product images. The
              primary image is used as
              the product thumbnail.
            </p>
          </div>
        </div>

        <span
          className={styles.counter}
        >
          {currentImages.length}/
          {MAX_IMAGES}
        </span>
      </div>

      {error && (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      )}

      {currentImages.length > 0 && (
        <div
          className={styles.imagesSection}
        >
          <div
            className={
              styles.sectionLabel
            }
          >
            <div>
              <h4>
                Uploaded Images
              </h4>

              <p>
                Set a primary image and
                adjust the image order.
              </p>
            </div>

            <span>
              {currentImages.length}{" "}
              image
              {currentImages.length ===
              1
                ? ""
                : "s"}
            </span>
          </div>

          <div
            className={styles.imageGrid}
          >
            {currentImages.map(
              (image, index) => {
                const isPrimary =
                  image.url ===
                  thumbnail;

                return (
                  <div
                    key={getImageKey(
                      image,
                      index,
                    )}
                    className={`${styles.imageCard} ${
                      isPrimary
                        ? styles.primary
                        : ""
                    }`}
                  >
                    <div
                      className={
                        styles.imagePreview
                      }
                    >
                      <img
                        src={image.url}
                        alt={`Product image ${
                          index + 1
                        }`}
                        onError={(
                          event,
                        ) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                      <span
                        className={
                          styles.imageNumber
                        }
                      >
                        {index + 1}
                      </span>

                      {isPrimary && (
                        <span
                          className={
                            styles.primaryBadge
                          }
                        >
                          <FiStar
                            size={10}
                          />
                          Primary
                        </span>
                      )}

                      <button
                        type="button"
                        className={
                          styles.deleteButton
                        }
                        onClick={() =>
                          removeImage(
                            index,
                          )
                        }
                        disabled={
                          disabled ||
                          uploading
                        }
                        aria-label={`Remove product image ${
                          index + 1
                        }`}
                        title="Remove image"
                      >
                        <FiTrash2
                          size={14}
                        />
                      </button>
                    </div>

                    <div
                      className={
                        styles.imageFooter
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setThumbnail(
                            image,
                          )
                        }
                        disabled={
                          disabled ||
                          uploading ||
                          isPrimary
                        }
                        className={
                          isPrimary
                            ? styles.activeAction
                            : styles.actionButton
                        }
                      >
                        <FiStar
                          size={12}
                        />

                        {isPrimary
                          ? "Primary"
                          : "Set primary"}
                      </button>

                      <div
                        className={
                          styles.moveActions
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            moveImage(
                              index,
                              -1,
                            )
                          }
                          disabled={
                            disabled ||
                            uploading ||
                            index === 0
                          }
                          aria-label="Move image left"
                          title="Move left"
                        >
                          <FiChevronLeft
                            size={14}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveImage(
                              index,
                              1,
                            )
                          }
                          disabled={
                            disabled ||
                            uploading ||
                            index ===
                              currentImages.length -
                                1
                          }
                          aria-label="Move image right"
                          title="Move right"
                        >
                          <FiChevronRight
                            size={14}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {remainingImages > 0 && (
        <button
          type="button"
          className={
            styles.uploadBox
          }
          onClick={openPicker}
          disabled={
            disabled ||
            uploading
          }
        >
          <span
            className={
              styles.uploadIcon
            }
          >
            {uploading ? (
              <FiUploadCloud
                size={21}
                className={
                  styles.spinning
                }
              />
            ) : (
              <FiPlus size={20} />
            )}
          </span>

          <span
            className={
              styles.uploadContent
            }
          >
            <strong>
              {uploading
                ? "Uploading images..."
                : currentImages.length ===
                  0
                ? "Upload product images"
                : "Add more images"}
            </strong>

            <span>
              {uploading
                ? "Please wait while your images are uploaded."
                : "Click to choose images or drag and drop them here."}
            </span>
          </span>

          <span
            className={
              styles.remaining
            }
          >
            {remainingImages}{" "}
            remaining
          </span>
        </button>
      )}

      {currentImages.length ===
        MAX_IMAGES && (
        <div
          className={
            styles.limitMessage
          }
        >
          <span>
            Maximum of {MAX_IMAGES}{" "}
            product images reached.
          </span>

          <span>
            Remove an image to upload
            another one.
          </span>
        </div>
      )}

      <div
        className={styles.guidelines}
      >
        <div
          className={
            styles.guideline
          }
        >
          <strong>
            File types
          </strong>

          <span>
            JPG, PNG or WEBP
          </span>
        </div>

        <div
          className={
            styles.guideline
          }
        >
          <strong>
            Maximum size
          </strong>

          <span>
            5 MB per image
          </span>
        </div>

        <div
          className={
            styles.guideline
          }
        >
          <strong>
            Product images
          </strong>

          <span>
            Up to {MAX_IMAGES} images
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(
          ",",
        )}
        multiple
        className={
          styles.hiddenInput
        }
        onChange={handleFiles}
        disabled={
          disabled ||
          uploading
        }
      />
    </section>
  );
}