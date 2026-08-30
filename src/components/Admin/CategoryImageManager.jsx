import {
  useRef,
  useState,
} from "react";

import {
  FiImage,
  FiUploadCloud,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";

import {
  updateCategoryImage,
  deleteCategoryImage,
} from "../../services/adminMediaService";

import styles from "./CategoryImageManager.module.css";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

export default function CategoryImageManager({
  categoryId,
  image = "",
  onChange,
  disabled = false,
}) {
  const inputRef =
    useRef(null);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const busy =
    uploading || deleting;

  const canUpload =
    Boolean(categoryId) &&
    !disabled &&
    !busy;

  const chooseImage = () => {
    if (!canUpload) {
      if (!categoryId) {
        setError(
          "Save the category first, then you can upload its image.",
        );
      }

      return;
    }

    inputRef.current?.click();
  };

  const handleFile = async (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError("");

    if (!categoryId) {
      setError(
        "Save the category first, then you can upload its image.",
      );
      return;
    }

    if (
      !ACCEPTED_TYPES.includes(
        file.type,
      )
    ) {
      setError(
        "Only JPG, JPEG, PNG and WEBP images are allowed.",
      );
      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "The category image must be 5 MB or smaller.",
      );
      return;
    }

    try {
      setUploading(true);

      const response =
        await updateCategoryImage(
          categoryId,
          file,
        );

      const category =
        response?.data?.category;

      const nextImage =
        category?.image ||
        response?.data?.image?.url ||
        "";

      if (!nextImage) {
        throw new Error(
          "The server did not return the updated category image.",
        );
      }

      onChange?.(nextImage);
    } catch (uploadError) {
      setError(
        uploadError?.message ||
          "Unable to update category image.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete =
    async () => {
      if (
        !categoryId ||
        !image ||
        disabled ||
        busy
      ) {
        return;
      }

      const confirmed =
        window.confirm(
          "Remove this category image?",
        );

      if (!confirmed) {
        return;
      }

      setError("");

      try {
        setDeleting(true);

        const response =
          await deleteCategoryImage(
            categoryId,
          );

        const nextImage =
          response?.data?.category
            ?.image || "";

        onChange?.(nextImage);
      } catch (deleteError) {
        setError(
          deleteError?.message ||
            "Unable to delete category image.",
        );
      } finally {
        setDeleting(false);
      }
    };

  return (
    <section
      className={styles.wrapper}
    >
      <div
        className={styles.header}
      >
        <div
          className={styles.titleArea}
        >
          <div
            className={styles.icon}
          >
            <FiImage size={17} />
          </div>

          <div>
            <h3>
              Category Image
            </h3>

            <p>
              Use one high-quality
              image for this category.
            </p>
          </div>
        </div>

        <span
          className={
            image
              ? styles.status
              : styles.statusEmpty
          }
        >
          {image
            ? "Image added"
            : "No image"}
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

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(
          ",",
        )}
        className={
          styles.hiddenInput
        }
        onChange={handleFile}
        disabled={!canUpload}
      />

      {image ? (
        <div
          className={
            styles.previewSection
          }
        >
          <div
            className={styles.preview}
          >
            <img
              src={image}
              alt="Category"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />

            <div
              className={
                styles.previewBadge
              }
            >
              <FiImage size={11} />
              Category image
            </div>
          </div>

          <div
            className={
              styles.details
            }
          >
            <div
              className={
                styles.detailsHeading
              }
            >
              <h4>
                Current Image
              </h4>

              <p>
                This image is displayed
                wherever the category
                appears in the store.
              </p>
            </div>

            <div
              className={
                styles.actions
              }
            >
              <button
                type="button"
                className={
                  styles.replaceButton
                }
                onClick={
                  chooseImage
                }
                disabled={
                  !canUpload
                }
              >
                <FiRefreshCw
                  size={13}
                  className={
                    uploading
                      ? styles.spinning
                      : ""
                  }
                />

                {uploading
                  ? "Replacing..."
                  : "Replace image"}
              </button>

              <button
                type="button"
                className={
                  styles.deleteButton
                }
                onClick={
                  handleDelete
                }
                disabled={
                  disabled ||
                  busy ||
                  !categoryId
                }
              >
                <FiTrash2 size={13} />

                {deleting
                  ? "Removing..."
                  : "Remove image"}
              </button>
            </div>

            <div
              className={
                styles.guidelines
              }
            >
              <div>
                <strong>
                  File types
                </strong>

                <span>
                  JPG, PNG, WEBP
                </span>
              </div>

              <div>
                <strong>
                  Maximum size
                </strong>

                <span>
                  5 MB
                </span>
              </div>

              <div>
                <strong>
                  Images
                </strong>

                <span>
                  1 per category
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={
            styles.uploadBox
          }
          onClick={
            chooseImage
          }
          disabled={!canUpload}
        >
          <span
            className={
              styles.uploadIcon
            }
          >
            {uploading ? (
              <FiUploadCloud
                size={22}
                className={
                  styles.spinning
                }
              />
            ) : (
              <FiUploadCloud
                size={22}
              />
            )}
          </span>

          <span
            className={
              styles.uploadTitle
            }
          >
            {uploading
              ? "Uploading image..."
              : "Upload category image"}
          </span>

          <span
            className={
              styles.uploadDescription
            }
          >
            Click to choose an image
          </span>

          <span
            className={
              styles.uploadMeta
            }
          >
            JPG, PNG or WEBP · Maximum
            5 MB
          </span>
        </button>
      )}

      {!categoryId && (
        <div
          className={styles.note}
        >
          <FiImage size={13} />

          <span>
            Save the category first.
            Image upload becomes
            available after the category
            has been created.
          </span>
        </div>
      )}
    </section>
  );
}