import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FiArrowLeft,
} from "react-icons/fi";

import {
  createAdminCategory,
  getAdminCategoryById,
  updateAdminCategory,
} from "../../../services/adminCategoryService";

import styles from "./CategoryForm.module.css";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: "0",
  isActive: true,
};

function getCategory(response) {
  return (
    response?.data?.category ||
    response?.category ||
    response?.data ||
    null
  );
}

function createSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CategoryForm() {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const editing =
    Boolean(id);

  const [
    formData,
    setFormData,
  ] = useState(initialForm);

  const [
    loading,
    setLoading,
  ] = useState(editing);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    slugTouched,
    setSlugTouched,
  ] = useState(editing);

  useEffect(() => {
    if (!editing) {
      setFormData(initialForm);
      setSlugTouched(false);
      setLoading(false);

      return undefined;
    }

    let active = true;

    const loadCategory =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getAdminCategoryById(id);

          const category =
            getCategory(response);

          if (!active) {
            return;
          }

          if (!category) {
            setError(
              "Category not found.",
            );
            return;
          }

          setFormData({
            name:
              category.name || "",
            slug:
              category.slug || "",
            description:
              category.description ||
              "",
            image:
              category.image || "",
            sortOrder:
              String(
                category.sortOrder ??
                  0,
              ),
            isActive:
              category.isActive !==
              false,
          });

          setSlugTouched(true);
        } catch (
          requestError
        ) {
          if (!active) {
            return;
          }

          setError(
            requestError?.message ||
              "Unable to load category.",
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    loadCategory();

    return () => {
      active = false;
    };
  }, [id, editing]);

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    if (name === "name") {
      setFormData(
        (current) => ({
          ...current,
          name: value,
          slug:
            slugTouched
              ? current.slug
              : createSlug(value),
        }),
      );
    } else {
      setFormData(
        (current) => ({
          ...current,
          [name]:
            type === "checkbox"
              ? checked
              : value,
        }),
      );
    }

    setError("");
  };

  const handleSlugChange = (
    event,
  ) => {
    setSlugTouched(true);

    setFormData(
      (current) => ({
        ...current,
        slug: event.target.value,
      }),
    );

    setError("");
  };

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    const name =
      formData.name.trim();

    const slug =
      createSlug(formData.slug);

    const description =
      formData.description.trim();

    const image =
      formData.image.trim();

    const sortOrder =
      Number(formData.sortOrder);

    if (!name) {
      setError(
        "Category name is required.",
      );
      return;
    }

    if (!slug) {
      setError(
        "Category slug is required.",
      );
      return;
    }

    if (
      !Number.isFinite(sortOrder) ||
      sortOrder < 0
    ) {
      setError(
        "Sort order must be a valid non-negative number.",
      );
      return;
    }

    const payload = {
      name,
      slug,
      description,
      image,
      sortOrder,
      isActive:
        Boolean(formData.isActive),
    };

    try {
      setSaving(true);
      setError("");

      if (editing) {
        await updateAdminCategory(
          id,
          payload,
        );
      } else {
        await createAdminCategory(
          payload,
        );
      }

      navigate(
        "/admin/categories",
        {
          replace: true,
        },
      );
    } catch (
      requestError
    ) {
      setError(
        requestError?.message ||
          `Unable to ${
            editing
              ? "update"
              : "create"
          } category.`,
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.page}>
        <div className={styles.state}>
          Loading category...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <Link
          to="/admin/categories"
          className={styles.backLink}
        >
          <FiArrowLeft
            size={15}
          />

          <span>
            Back to Categories
          </span>
        </Link>

        <span className={styles.eyebrow}>
          Store Management
        </span>

        <h1 className={styles.title}>
          {editing
            ? "Edit Category"
            : "Add Category"}
        </h1>

        <p className={styles.description}>
          {editing
            ? "Update the category information and visibility."
            : "Create a new jewellery category for your store."}
        </p>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>
            Unable to save category
          </strong>

          <p>{error}</p>
        </div>
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div className={styles.card}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="category-name">
                Category Name
              </label>

              <input
                id="category-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rings"
                maxLength={100}
                autoComplete="off"
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="category-slug">
                Slug
              </label>

              <input
                id="category-slug"
                name="slug"
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="rings"
                maxLength={120}
                autoComplete="off"
                disabled={saving}
              />

              <small>
                Used in category URLs.
              </small>
            </div>

            <div
              className={`${styles.field} ${styles.fullWidth}`}
            >
              <label htmlFor="category-description">
                Description
              </label>

              <textarea
                id="category-description"
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Describe this jewellery category..."
                rows={5}
                maxLength={500}
                disabled={saving}
              />

              <small>
                {formData.description.length}
                /500 characters
              </small>
            </div>

            <div className={styles.field}>
              <label htmlFor="category-image">
                Image URL
              </label>

              <input
                id="category-image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
                disabled={saving}
              />

              {formData.image && (
                <div className={styles.imagePreview}>
                  <img
                    src={formData.image}
                    alt="Category preview"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="category-sort">
                Sort Order
              </label>

              <input
                id="category-sort"
                name="sortOrder"
                type="number"
                min="0"
                step="1"
                value={formData.sortOrder}
                onChange={handleChange}
                disabled={saving}
              />

              <small>
                Lower numbers appear first.
              </small>
            </div>

            <div
              className={`${styles.field} ${styles.fullWidth}`}
            >
              <label className={styles.checkboxLabel}>
                <input
                  name="isActive"
                  type="checkbox"
                  checked={
                    formData.isActive
                  }
                  onChange={handleChange}
                  disabled={saving}
                />

                <span>
                  Category is active
                </span>
              </label>

              <small>
                Inactive categories are hidden
                from the customer catalogue.
              </small>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link
            to="/admin/categories"
            className={styles.cancel}
          >
            Cancel
          </Link>

          <button
            type="submit"
            className={styles.save}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : editing
              ? "Update Category"
              : "Create Category"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CategoryForm;