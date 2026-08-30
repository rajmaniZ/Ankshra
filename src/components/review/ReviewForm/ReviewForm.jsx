// import { useEffect, useState } from "react";
// import { FiImage, FiX } from "react-icons/fi";

// import RatingStars from "../RatingStars/RatingStars";

// import {
//   createProductReview,
//   createAppReview,
//   updateReview,
// } from "../../../services/reviewService";

// import styles from "./ReviewForm.module.css";

// const MAX_IMAGES = 6;
// const MAX_FILE_SIZE = 15 * 1024 * 1024;

// const ALLOWED_TYPES = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
// ];

// function getReviewId(review) {
//   return review?._id || review?.id || "";
// }

// function getInitialValues(review) {
//   return {
//     rating: Number(review?.rating) || 0,
//     title: review?.title || "",
//     comment: review?.comment || "",
//   };
// }

// function getExistingImages(review) {
//   if (!Array.isArray(review?.images)) {
//     return [];
//   }

//   return review.images.filter(
//     (image) =>
//       image &&
//       typeof image === "object" &&
//       image.url,
//   );
// }

// function ReviewForm({
//   type = "product",
//   productId = "",
//   orderId = "",
//   review = null,
//   onSuccess,
//   onCancel,
// }) {
//   const isEditing = Boolean(getReviewId(review));
//   const isAppReview = type === "app";

//   const [form, setForm] = useState(
//     getInitialValues(review),
//   );

//   const [existingImages, setExistingImages] =
//     useState(getExistingImages(review));

//   const [newImages, setNewImages] = useState([]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     setForm(getInitialValues(review));
//     setExistingImages(getExistingImages(review));
//     setNewImages([]);
//     setError("");
//     setSuccess("");
//   }, [review]);

//   useEffect(() => {
//     return () => {
//       newImages.forEach((image) => {
//         if (image?.preview) {
//           URL.revokeObjectURL(image.preview);
//         }
//       });
//     };
//   }, [newImages]);

//   const totalImages =
//     existingImages.length + newImages.length;

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setForm((current) => ({
//       ...current,
//       [name]: value,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   const handleRatingChange = (rating) => {
//     setForm((current) => ({
//       ...current,
//       rating,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   const handleImageChange = (event) => {
//     const files = Array.from(
//       event.target.files || [],
//     );

//     event.target.value = "";

//     if (!files.length) {
//       return;
//     }

//     const availableSlots =
//       MAX_IMAGES - totalImages;

//     if (availableSlots <= 0) {
//       setError(
//         `A review can contain a maximum of ${MAX_IMAGES} images.`,
//       );
//       return;
//     }

//     const selectedImages = [];
//     let imageError = "";

//     for (const file of files) {
//       if (!ALLOWED_TYPES.includes(file.type)) {
//         imageError =
//           "Only JPG, JPEG and PNG images are allowed.";
//         continue;
//       }

//       if (file.size > MAX_FILE_SIZE) {
//         imageError =
//           "Each image must be smaller than 15 MB.";
//         continue;
//       }

//       const alreadySelected = [
//         ...newImages,
//         ...selectedImages,
//       ].some(
//         (image) =>
//           image.file.name === file.name &&
//           image.file.size === file.size &&
//           image.file.lastModified ===
//             file.lastModified,
//       );

//       if (alreadySelected) {
//         continue;
//       }

//       selectedImages.push({
//         file,
//         preview: URL.createObjectURL(file),
//       });
//     }

//     const imagesToAdd =
//       selectedImages.slice(0, availableSlots);

//     if (
//       selectedImages.length > availableSlots
//     ) {
//       imageError =
//         `You can upload a maximum of ${MAX_IMAGES} images.`;
//     }

//     if (imageError) {
//       setError(imageError);
//     } else {
//       setError("");
//     }

//     if (imagesToAdd.length > 0) {
//       setNewImages((current) => [
//         ...current,
//         ...imagesToAdd,
//       ]);
//     }
//   };

//   const removeExistingImage = (index) => {
//     setExistingImages((current) =>
//       current.filter(
//         (_, imageIndex) => imageIndex !== index,
//       ),
//     );

//     setError("");
//   };

//   const removeNewImage = (index) => {
//     setNewImages((current) => {
//       const image = current[index];

//       if (image?.preview) {
//         URL.revokeObjectURL(image.preview);
//       }

//       return current.filter(
//         (_, imageIndex) => imageIndex !== index,
//       );
//     });

//     setError("");
//   };

//   const validateForm = () => {
//     if (!form.rating) {
//       return "Please select a rating.";
//     }

//     if (!form.comment.trim()) {
//       return "Please write your review.";
//     }

//     if (form.title.trim().length > 150) {
//       return "Review title cannot exceed 150 characters.";
//     }

//     if (form.comment.trim().length > 2000) {
//       return "Review cannot exceed 2000 characters.";
//     }

//     if (!isAppReview) {
//       if (!productId) {
//         return "Product information is required.";
//       }

//       if (!orderId) {
//         return "Order information is required.";
//       }
//     }

//     if (totalImages > MAX_IMAGES) {
//       return `A review can contain a maximum of ${MAX_IMAGES} images.`;
//     }

//     return "";
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setError("");
//     setSuccess("");

//     const validationError = validateForm();

//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setLoading(true);

//     try {
//       const images = newImages.map(
//         (image) => image.file,
//       );

//       let response;

//       if (isEditing) {
//         const originalImages =
//           getExistingImages(review);

//         const removedImageIds = originalImages
//           .filter((originalImage) => {
//             if (!originalImage.publicId) {
//               return false;
//             }

//             return !existingImages.some(
//               (currentImage) =>
//                 currentImage.publicId ===
//                 originalImage.publicId,
//             );
//           })
//           .map((image) => image.publicId)
//           .filter(Boolean);

//         response = await updateReview(
//           getReviewId(review),
//           {
//             rating: form.rating,
//             title: form.title.trim(),
//             comment: form.comment.trim(),
//             removeImageIds: removedImageIds,
//           },
//           images,
//         );
//       } else if (isAppReview) {
//         response = await createAppReview(
//           {
//             rating: form.rating,
//             title: form.title.trim(),
//             comment: form.comment.trim(),
//           },
//           images,
//         );
//       } else {
//         response = await createProductReview(
//           {
//             productId,
//             orderId,
//             rating: form.rating,
//             title: form.title.trim(),
//             comment: form.comment.trim(),
//           },
//           images,
//         );
//       }

//       setSuccess(
//         isEditing
//           ? "Your review has been updated successfully."
//           : "Your review has been submitted successfully.",
//       );

//       newImages.forEach((image) => {
//         if (image?.preview) {
//           URL.revokeObjectURL(image.preview);
//         }
//       });

//       setNewImages([]);

//       if (!isEditing) {
//         setForm({
//           rating: 0,
//           title: "",
//           comment: "",
//         });

//         setExistingImages([]);
//       }

//       if (typeof onSuccess === "function") {
//         onSuccess(response);
//       }
//     } catch (requestError) {
//       console.error(
//         "Failed to submit review:",
//         requestError,
//       );

//       setError(
//         requestError?.data?.message ||
//           requestError?.message ||
//           "Unable to submit your review.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const headingText = isEditing
//     ? "Edit your review"
//     : isAppReview
//       ? "Tell us about your experience"
//       : "Share your experience";

//   const eyebrowText = isEditing
//     ? "Update Review"
//     : isAppReview
//       ? "Your Experience"
//       : "Your Review";

//   return (
//     <form
//       className={styles.form}
//       onSubmit={handleSubmit}
//     >
//       <div className={styles.header}>
//         <div>
//           <span className={styles.eyebrow}>
//             {eyebrowText}
//           </span>

//           <h3 className={styles.title}>
//             {headingText}
//           </h3>
//         </div>
//       </div>

//       {error && (
//         <div
//           className={styles.error}
//           role="alert"
//         >
//           {error}
//         </div>
//       )}

//       {success && (
//         <div
//           className={styles.success}
//           role="status"
//         >
//           {success}
//         </div>
//       )}

//       <div className={styles.field}>
//         <label className={styles.label}>
//           Rating
//         </label>

//         <RatingStars
//           value={form.rating}
//           onChange={handleRatingChange}
//           size="large"
//         />

//         {form.rating > 0 && (
//           <span className={styles.ratingText}>
//             {form.rating} out of 5
//           </span>
//         )}
//       </div>

//       <div className={styles.field}>
//         <label
//           htmlFor="review-title"
//           className={styles.label}
//         >
//           Title
//         </label>

//         <input
//           id="review-title"
//           name="title"
//           type="text"
//           value={form.title}
//           onChange={handleChange}
//           maxLength={150}
//           placeholder="Give your review a title"
//           className={styles.input}
//           disabled={loading}
//         />

//         <span className={styles.limit}>
//           {form.title.length}/150
//         </span>
//       </div>

//       <div className={styles.field}>
//         <label
//           htmlFor="review-comment"
//           className={styles.label}
//         >
//           Review
//         </label>

//         <textarea
//           id="review-comment"
//           name="comment"
//           value={form.comment}
//           onChange={handleChange}
//           maxLength={2000}
//           rows={6}
//           placeholder={
//             isAppReview
//               ? "Tell us what you think about Ayushi Jewellery..."
//               : "Tell us about the product..."
//           }
//           className={styles.textarea}
//           disabled={loading}
//         />

//         <span className={styles.limit}>
//           {form.comment.length}/2000
//         </span>
//       </div>

//       <div className={styles.field}>
//         <div className={styles.imageHeader}>
//           <div>
//             <label className={styles.label}>
//               Photos
//             </label>

//             <p className={styles.imageDescription}>
//               JPG, JPEG or PNG. Maximum 15 MB
//               each.
//             </p>
//           </div>

//           <span className={styles.imageCount}>
//             {totalImages}/{MAX_IMAGES}
//           </span>
//         </div>

//         {totalImages > 0 && (
//           <div className={styles.imageGrid}>
//             {existingImages.map(
//               (image, index) => (
//                 <div
//                   className={styles.imageItem}
//                   key={
//                     image.publicId ||
//                     `${image.url}-${index}`
//                   }
//                 >
//                   <img
//                     src={image.url}
//                     alt={
//                       image.alt ||
//                       `Review image ${index + 1}`
//                     }
//                   />

//                   <button
//                     type="button"
//                     className={styles.removeButton}
//                     onClick={() =>
//                       removeExistingImage(index)
//                     }
//                     disabled={loading}
//                     aria-label={`Remove review image ${index + 1}`}
//                   >
//                     <FiX size={15} />
//                   </button>
//                 </div>
//               ),
//             )}

//             {newImages.map(
//               (image, index) => (
//                 <div
//                   className={styles.imageItem}
//                   key={`${image.file.name}-${image.file.lastModified}-${index}`}
//                 >
//                   <img
//                     src={image.preview}
//                     alt={image.file.name}
//                   />

//                   <button
//                     type="button"
//                     className={styles.removeButton}
//                     onClick={() =>
//                       removeNewImage(index)
//                     }
//                     disabled={loading}
//                     aria-label={`Remove new review image ${index + 1}`}
//                   >
//                     <FiX size={15} />
//                   </button>
//                 </div>
//               ),
//             )}
//           </div>
//         )}

//         {totalImages < MAX_IMAGES && (
//           <label
//             htmlFor="review-images"
//             className={styles.upload}
//           >
//             <FiImage size={20} />

//             <span>
//               {totalImages === 0
//                 ? "Add photos"
//                 : "Add more photos"}
//             </span>

//             <input
//               id="review-images"
//               type="file"
//               accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
//               multiple
//               onChange={handleImageChange}
//               disabled={loading}
//             />
//           </label>
//         )}
//       </div>

//       <div className={styles.actions}>
//         {typeof onCancel === "function" && (
//           <button
//             type="button"
//             className={styles.cancel}
//             onClick={onCancel}
//             disabled={loading}
//           >
//             Cancel
//           </button>
//         )}

//         <button
//           type="submit"
//           className={styles.submit}
//           disabled={loading}
//         >
//           {loading
//             ? "Submitting..."
//             : isEditing
//               ? "Update Review"
//               : "Submit Review"}
//         </button>
//       </div>
//     </form>
//   );
// }

// export default ReviewForm;


import {
  useEffect,
  useState,
} from "react";

import RatingStars from "../RatingStars/RatingStars";

import {
  createProductReview,
  createAppReview,
  updateReview,
} from "../../../services/reviewService";

import styles from "./ReviewForm.module.css";

function getReviewId(review) {
  return (
    review?._id ||
    review?.id ||
    ""
  );
}

function getInitialValues(review) {
  return {
    rating:
      Number(review?.rating) || 0,
    title:
      review?.title || "",
    comment:
      review?.comment || "",
  };
}

function getExistingImages(review) {
  if (!Array.isArray(review?.images)) {
    return [];
  }

  return review.images.filter(
    (image) =>
      image &&
      typeof image === "object" &&
      image.url,
  );
}

function ReviewForm({
  type = "product",
  productId = "",
  orderId = "",
  review = null,
  onSuccess,
  onCancel,
}) {
  const isEditing =
    Boolean(
      getReviewId(review),
    );

  const isAppReview =
    type === "app";

  const [form, setForm] =
    useState(
      getInitialValues(review),
    );

  const [existingImages, setExistingImages] =
    useState(
      getExistingImages(review),
    );

  const [newImages, setNewImages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    setForm(
      getInitialValues(review),
    );

    setExistingImages(
      getExistingImages(review),
    );

    setNewImages([]);
    setError("");
    setSuccess("");
  }, [review]);

  useEffect(() => {
    return () => {
      newImages.forEach(
        (image) => {
          if (image?.preview) {
            URL.revokeObjectURL(
              image.preview,
            );
          }
        },
      );
    };
  }, [newImages]);

  const totalImages =
    existingImages.length +
    newImages.length;

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm(
        (current) => ({
          ...current,
          [name]: value,
        }),
      );

      setError("");
      setSuccess("");
    };

  const handleRatingChange =
    (rating) => {
      setForm(
        (current) => ({
          ...current,
          rating,
        }),
      );

      setError("");
      setSuccess("");
    };

  const handleImageChange =
    (event) => {
      const files =
        Array.from(
          event.target.files ||
            [],
        );

      event.target.value = "";

      if (!files.length) {
        return;
      }

      setError(
        "App reviews do not support image uploads.",
      );
    };

  const removeExistingImage =
    (index) => {
      setExistingImages(
        (current) =>
          current.filter(
            (
              _,
              imageIndex,
            ) =>
              imageIndex !==
              index,
          ),
      );

      setError("");
    };

  const removeNewImage =
    (index) => {
      setNewImages(
        (current) => {
          const image =
            current[index];

          if (
            image?.preview
          ) {
            URL.revokeObjectURL(
              image.preview,
            );
          }

          return current.filter(
            (
              _,
              imageIndex,
            ) =>
              imageIndex !==
              index,
          );
        },
      );

      setError("");
    };

  const validateForm =
    () => {
      const rating =
        Number(form.rating);

      const title =
        form.title.trim();

      const comment =
        form.comment.trim();

      if (
        !Number.isInteger(
          rating,
        ) ||
        rating < 1 ||
        rating > 5
      ) {
        return "Please select a rating from 1 to 5.";
      }

      if (!comment) {
        return "Please write your review.";
      }

      if (
        title.length > 150
      ) {
        return "Review title cannot exceed 150 characters.";
      }

      if (
        comment.length > 2000
      ) {
        return "Review cannot exceed 2000 characters.";
      }

      if (
        !isAppReview
      ) {
        if (!productId) {
          return "Product information is required.";
        }

        if (!orderId) {
          return "Order information is required.";
        }

        if (
          totalImages > 6
        ) {
          return "A review can contain a maximum of 6 images.";
        }
      }

      return "";
    };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const validationError =
        validateForm();

      if (validationError) {
        setError(
          validationError,
        );

        return;
      }

      setLoading(true);

      try {
        let response;

        const rating =
          Number(form.rating);

        const title =
          form.title.trim();

        const comment =
          form.comment.trim();

        if (isEditing) {
          const originalImages =
            getExistingImages(
              review,
            );

          const removedImageIds =
            originalImages
              .filter(
                (
                  originalImage,
                ) => {
                  if (
                    !originalImage.publicId
                  ) {
                    return false;
                  }

                  return !existingImages.some(
                    (
                      currentImage,
                    ) =>
                      currentImage.publicId ===
                      originalImage.publicId,
                  );
                },
              )
              .map(
                (image) =>
                  image.publicId,
              )
              .filter(
                Boolean,
              );

          if (isAppReview) {
            response =
              await updateReview(
                getReviewId(
                  review,
                ),
                {
                  rating,
                  title,
                  comment,
                  removeImageIds:
                    [],
                },
                [],
              );
          } else {
            response =
              await updateReview(
                getReviewId(
                  review,
                ),
                {
                  rating,
                  title,
                  comment,
                  removeImageIds,
                },
                newImages.map(
                  (image) =>
                    image.file,
                ),
              );
          }
        } else if (
          isAppReview
        ) {
          /*
           * App reviews are text/rating only.
           *
           * Do not create an image list
           * and do not send any image files.
           */
          response =
            await createAppReview(
              {
                rating,
                title,
                comment,
              },
            );
        } else {
          response =
            await createProductReview(
              {
                productId,
                orderId,
                rating,
                title,
                comment,
              },
              newImages.map(
                (image) =>
                  image.file,
              ),
            );
        }

        setSuccess(
          isEditing
            ? "Your review has been updated successfully."
            : "Your review has been submitted successfully.",
        );

        newImages.forEach(
          (image) => {
            if (
              image?.preview
            ) {
              URL.revokeObjectURL(
                image.preview,
              );
            }
          },
        );

        setNewImages([]);

        if (!isEditing) {
          setForm({
            rating: 0,
            title: "",
            comment: "",
          });

          setExistingImages(
            [],
          );
        }

        if (
          typeof onSuccess ===
          "function"
        ) {
          onSuccess(
            response,
          );
        }
      } catch (
        requestError
      ) {
        console.error(
          "Failed to submit review:",
          requestError,
        );

        setError(
          requestError?.response
            ?.data?.message ||
            requestError?.data
              ?.message ||
            requestError?.message ||
            "Unable to submit your review.",
        );
      } finally {
        setLoading(false);
      }
    };

  const headingText =
    isEditing
      ? "Edit your review"
      : isAppReview
        ? "Tell us about your experience"
        : "Share your experience";

  const eyebrowText =
    isEditing
      ? "Update Review"
      : isAppReview
        ? "Your Experience"
        : "Your Review";

  return (
    <form
      className={
        styles.form
      }
      onSubmit={
        handleSubmit
      }
    >
      <div
        className={
          styles.header
        }
      >
        <span
          className={
            styles.eyebrow
          }
        >
          {eyebrowText}
        </span>

        <h3
          className={
            styles.title
          }
        >
          {headingText}
        </h3>

        {isAppReview && (
          <p
            className={
              styles.subtitle
            }
          >
            Share your thoughts
            about your shopping
            experience.
          </p>
        )}
      </div>

      {error && (
        <div
          className={
            styles.error
          }
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className={
            styles.success
          }
          role="status"
        >
          {success}
        </div>
      )}

      <div
        className={
          styles.field
        }
      >
        <label
          className={
            styles.label
          }
        >
          Rating
        </label>

        <div
          className={
            styles.ratingField
          }
        >
          <RatingStars
            value={
              form.rating
            }
            onChange={
              handleRatingChange
            }
            size="large"
          />

          <span
            className={
              styles.ratingText
            }
          >
            {form.rating
              ? `${form.rating} out of 5`
              : "Select a rating"}
          </span>
        </div>
      </div>

      <div
        className={
          styles.field
        }
      >
        <label
          htmlFor="review-title"
          className={
            styles.label
          }
        >
          Title
        </label>

        <input
          id="review-title"
          name="title"
          type="text"
          value={
            form.title
          }
          onChange={
            handleChange
          }
          maxLength={150}
          disabled={loading}
          className={
            styles.input
          }
          placeholder="Give your review a title"
        />

        <span
          className={
            styles.counter
          }
        >
          {form.title.length}/150
        </span>
      </div>

      <div
        className={
          styles.field
        }
      >
        <label
          htmlFor="review-comment"
          className={
            styles.label
          }
        >
          Review
        </label>

        <textarea
          id="review-comment"
          name="comment"
          value={
            form.comment
          }
          onChange={
            handleChange
          }
          maxLength={2000}
          disabled={loading}
          className={
            styles.textarea
          }
          placeholder={
            isAppReview
              ? "Tell us about your shopping experience..."
              : "Share your experience with this product..."
          }
        />

        <span
          className={
            styles.counter
          }
        >
          {form.comment.length}/2000
        </span>
      </div>

      {!isAppReview && (
        <div
          className={
            styles.imageSection
          }
        >
          {existingImages.length >
            0 && (
            <div
              className={
                styles.imageGrid
              }
            >
              {existingImages.map(
                (
                  image,
                  index,
                ) => (
                  <div
                    className={
                      styles.imageItem
                    }
                    key={
                      image.publicId ||
                      image.url ||
                      index
                    }
                  >
                    <img
                      src={
                        image.url
                      }
                      alt={`Review image ${
                        index + 1
                      }`}
                    />

                    <button
                      type="button"
                      className={
                        styles.removeButton
                      }
                      onClick={() =>
                        removeExistingImage(
                          index,
                        )
                      }
                      disabled={
                        loading
                      }
                      aria-label={`Remove review image ${
                        index + 1
                      }`}
                    >
                      ×
                    </button>
                  </div>
                ),
              )}
            </div>
          )}

          {newImages.length >
            0 && (
            <div
              className={
                styles.imageGrid
              }
            >
              {newImages.map(
                (
                  image,
                  index,
                ) => (
                  <div
                    className={
                      styles.imageItem
                    }
                    key={`${image.file.name}-${index}`}
                  >
                    <img
                      src={
                        image.preview
                      }
                      alt={`Selected review image ${
                        index + 1
                      }`}
                    />

                    <button
                      type="button"
                      className={
                        styles.removeButton
                      }
                      onClick={() =>
                        removeNewImage(
                          index,
                        )
                      }
                      disabled={
                        loading
                      }
                      aria-label={`Remove selected image ${
                        index + 1
                      }`}
                    >
                      ×
                    </button>
                  </div>
                ),
              )}
            </div>
          )}

          <label
            htmlFor="review-images"
            className={
              styles.upload
            }
          >
            Add photos

            <input
              id="review-images"
              type="file"
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              multiple
              onChange={
                handleImageChange
              }
              disabled={
                loading
              }
            />
          </label>
        </div>
      )}

      {isAppReview && (
        <div
          className={
            styles.textOnlyNotice
          }
        >
          <span>
            App reviews are
            text-only. No images
            are uploaded.
          </span>
        </div>
      )}

      <div
        className={
          styles.actions
        }
      >
        {typeof onCancel ===
          "function" && (
          <button
            type="button"
            className={
              styles.cancel
            }
            onClick={
              onCancel
            }
            disabled={
              loading
            }
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className={
            styles.submit
          }
          disabled={
            loading
          }
        >
          {loading
            ? "Submitting..."
            : isEditing
              ? "Update Review"
              : "Submit Review"}
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;