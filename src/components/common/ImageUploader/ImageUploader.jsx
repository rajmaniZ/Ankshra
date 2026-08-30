import { useEffect, useRef, useState } from "react";

import { FiImage, FiTrash2, FiUpload, FiX } from "react-icons/fi";

import styles from "./ImageUploader.module.css";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_FILES = 6;

const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
];

function getFileKey(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function ImageUploader({
  value = [],
  onChange,
  maxFiles = MAX_FILES,
  maxSize = MAX_FILE_SIZE,
  disabled = false,
  label = "Images",
  description = "Upload JPG, JPEG or PNG images.",
}) {
  const inputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Array.isArray(value)) {
      setItems([]);
      return;
    }

    setItems(value);
  }, [value]);

  const updateItems = (nextItems) => {
    setItems(nextItems);

    if (typeof onChange === "function") {
      onChange(nextItems);
    }
  };

  const handleFiles = (event) => {
    const selectedFiles = Array.from(
      event.target.files || [],
    );

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (selectedFiles.length === 0) {
      return;
    }

    setError("");

    const existingFiles = items.filter(
      (item) => item instanceof File,
    );

    const existingKeys = new Set(
      existingFiles.map(getFileKey),
    );

    const newFiles = [];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Only JPG, JPEG and PNG images are allowed.",
        );
        continue;
      }

      if (file.size > maxSize) {
        setError(
          `Each image must be smaller than ${Math.round(
            maxSize / (1024 * 1024),
          )} MB.`,
        );
        continue;
      }

      if (existingKeys.has(getFileKey(file))) {
        continue;
      }

      newFiles.push(file);
      existingKeys.add(getFileKey(file));
    }

    const remainingSlots =
      Math.max(maxFiles - items.length, 0);

    if (newFiles.length > remainingSlots) {
      setError(
        `You can upload a maximum of ${maxFiles} images.`,
      );
    }

    const filesToAdd = newFiles.slice(
      0,
      remainingSlots,
    );

    if (filesToAdd.length === 0) {
      return;
    }

    const fileItems = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    updateItems([
      ...items,
      ...fileItems,
    ]);
  };

  const handleRemove = (index) => {
    const item = items[index];

    if (
      item &&
      typeof item === "object" &&
      item.preview
    ) {
      URL.revokeObjectURL(item.preview);
    }

    updateItems(
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleRemoveExisting = (index) => {
    const item = items[index];

    if (
      item &&
      typeof item === "object" &&
      item.preview
    ) {
      URL.revokeObjectURL(item.preview);
    }

    updateItems(
      items.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const openFilePicker = () => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const getPreview = (item) => {
    if (item instanceof File) {
      return URL.createObjectURL(item);
    }

    if (item?.file instanceof File) {
      return item.preview;
    }

    if (typeof item === "string") {
      return item;
    }

    return item?.url || item?.preview || "";
  };

  const getAlt = (item, index) => {
    if (item?.alt) {
      return item.alt;
    }

    if (item?.file?.name) {
      return item.file.name;
    }

    if (item?.name) {
      return item.name;
    }

    return `Image ${index + 1}`;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <label className={styles.label}>
            {label}
          </label>

          <p className={styles.description}>
            {description}
          </p>
        </div>

        <span className={styles.counter}>
          {items.length}/{maxFiles}
        </span>
      </div>

      {items.length > 0 && (
        <div className={styles.previewGrid}>
          {items.map((item, index) => {
            const preview = getPreview(item);

            return (
              <div
                className={styles.preview}
                key={
                  item?.publicId ||
                  item?.url ||
                  item?.file?.name ||
                  index
                }
              >
                {preview ? (
                  <img
                    src={preview}
                    alt={getAlt(item, index)}
                  />
                ) : (
                  <div className={styles.noImage}>
                    <FiImage size={22} />
                  </div>
                )}

                {!disabled && (
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() =>
                      handleRemoveExisting(index)
                    }
                    title="Remove image"
                  >
                    <FiX size={15} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {items.length < maxFiles && (
        <button
          type="button"
          className={styles.upload}
          onClick={openFilePicker}
          disabled={disabled}
        >
          <FiUpload size={18} />

          <span>
            {items.length === 0
              ? "Choose images"
              : "Add more images"}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/jpg,image/png"
        multiple
        onChange={handleFiles}
        disabled={disabled}
        className={styles.input}
      />

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;