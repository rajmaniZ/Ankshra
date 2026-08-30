import { useEffect, useState } from "react";
import { FiArrowLeft, FiPlus, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getAdminProductById,
  updateAdminProduct,
} from "../../../services/adminProductService";
import { getAdminCategories } from "../../../services/adminCategoryService";
import styles from "./ProductDetails.module.css";
const initialForm = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  shortDescription: "",
  category: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  lowStockThreshold: "5",
  thumbnail: "",
  images: "",
  material: "",
  occasion: "",
  tags: "",
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
  isActive: true,
};
const emptyVariant = { name: "", type: "select", options: "" };
function getProduct(response) {
  return response?.data?.product || response?.product || response?.data || null;
}
function getCategories(response) {
  const categories =
    response?.data?.categories || response?.categories || response?.data || [];
  return Array.isArray(categories) ? categories : [];
}
function getCategoryId(product) {
  if (product?.category && typeof product.category === "object") {
    return product.category._id || product.category.id || "";
  }
  return product?.category || "";
}
function getImages(product) {
  if (!Array.isArray(product?.images)) {
    return [];
  }
  return product.images
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }
      if (image && typeof image === "object") {
        return image.url || image.secure_url || "";
      }
      return "";
    })
    .filter(Boolean);
}
function getFormData(product) {
  const images = getImages(product);
  return {
    name: product?.name || "",
    slug: product?.slug || "",
    sku: product?.sku || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    category: getCategoryId(product),
    price: product?.price ?? "",
    compareAtPrice: product?.compareAtPrice ?? "",
    stock: product?.stock ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    thumbnail: product?.thumbnail || images[0] || "",
    images: images.join("\n"),
    material: product?.material || "",
    occasion: product?.occasion || "",
    tags: Array.isArray(product?.tags) ? product.tags.join(", ") : "",
    isFeatured: Boolean(product?.isFeatured),
    isNewArrival: Boolean(product?.isNewArrival),
    isBestSeller: Boolean(product?.isBestSeller),
    isActive: product?.isActive !== false,
  };
}
function getVariants(product) {
  if (!Array.isArray(product?.variants)) {
    return [];
  }
  return product.variants.map((variant) => ({
    name: variant?.name || "",
    type: variant?.type || "select",
    options: Array.isArray(variant?.options) ? variant.options.join(", ") : "",
  }));
}
function getErrorMessage(error) {
  return error?.message || "Unable to complete the request.";
}
function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const loadProduct = async (showRefresh = false) => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");
      const [productResponse, categoryResponse] = await Promise.all([
        getAdminProductById(id),
        getAdminCategories({ limit: 100 }),
      ]);
      const productData = getProduct(productResponse);
      if (!productData) {
        throw new Error("Product not found.");
      }
      setProduct(productData);
      setFormData(getFormData(productData));
      setVariants(getVariants(productData));
      setCategories(getCategories(categoryResponse));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadProduct();
  }, [id]);
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleVariantChange = (index, field, value) => {
    setVariants((current) =>
      current.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, [field]: value } : variant,
      ),
    );
  };
  const handleAddVariant = () => {
    setVariants((current) => [...current, { ...emptyVariant }]);
  };
  const handleRemoveVariant = (index) => {
    setVariants((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };
  const buildPayload = () => {
    const imageList = formData.images
      .split(/\r?\n|,/)
      .map((image) => image.trim())
      .filter(Boolean);
    const thumbnail = formData.thumbnail.trim();
    if (thumbnail && !imageList.includes(thumbnail)) {
      imageList.unshift(thumbnail);
    }
    const cleanedVariants = variants
      .map((variant) => ({
        name: variant.name.trim(),
        type: variant.type,
        options: variant.options
          .split(",")
          .map((option) => option.trim())
          .filter(Boolean),
      }))
      .filter((variant) => variant.name && variant.options.length > 0);
    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    return {
      name: formData.name.trim(),
      slug: formData.slug.trim().toLowerCase(),
      sku: formData.sku.trim().toUpperCase(),
      description: formData.description.trim(),
      shortDescription: formData.shortDescription.trim(),
      category: formData.category,
      price: Number(formData.price),
      compareAtPrice:
        formData.compareAtPrice === "" || formData.compareAtPrice === null
          ? null
          : Number(formData.compareAtPrice),
      images: imageList,
      thumbnail,
      stock: Number(formData.stock),
      lowStockThreshold: Number(formData.lowStockThreshold),
      variants: cleanedVariants,
      material: formData.material.trim(),
      occasion: formData.occasion.trim(),
      tags,
      isFeatured: Boolean(formData.isFeatured),
      isNewArrival: Boolean(formData.isNewArrival),
      isBestSeller: Boolean(formData.isBestSeller),
      isActive: Boolean(formData.isActive),
    };
  };
  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }
    if (!formData.slug.trim()) {
      return "Product slug is required.";
    }
    if (!formData.sku.trim()) {
      return "Product SKU is required.";
    }
    if (!formData.category) {
      return "Product category is required.";
    }
    const price = Number(formData.price);
    if (!Number.isFinite(price) || price < 0) {
      return "Product price must be a valid non-negative number.";
    }
    if (formData.compareAtPrice !== "") {
      const compareAtPrice = Number(formData.compareAtPrice);
      if (!Number.isFinite(compareAtPrice) || compareAtPrice < 0) {
        return "Compare-at price must be a valid non-negative number.";
      }
    }
    const stock = Number(formData.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      return "Stock must be a valid non-negative number.";
    }
    const threshold = Number(formData.lowStockThreshold);
    if (!Number.isFinite(threshold) || threshold < 0) {
      return "Low stock threshold must be a valid non-negative number.";
    }
    return "";
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSaving(true);
      setError("");
      const payload = buildPayload();
      const response = await updateAdminProduct(id, payload);
      const updatedProduct = getProduct(response);
      if (updatedProduct) {
        setProduct(updatedProduct);
        setFormData(getFormData(updatedProduct));
        setVariants(getVariants(updatedProduct));
      } else {
        await loadProduct();
      }
      window.alert("Product updated successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div className={styles.state}> Loading product... </div>;
  }
  if (!product) {
    return (
      <section className={styles.page}>
        {" "}
        <div className={styles.errorState}>
          {" "}
          <h1> Product not found </h1>{" "}
          <p> {error || "The requested product could not be found."} </p>{" "}
          <Link to="/admin/products" className={styles.backButton}>
            {" "}
            <FiArrowLeft size={15} /> Products{" "}
          </Link>{" "}
        </div>{" "}
      </section>
    );
  }
  const productId = product?._id || product?.id || id;
  const currentImages = getImages(product);
  return (
    <section className={styles.page}>
      {" "}
      <div className={styles.heading}>
        {" "}
        <div>
          {" "}
          <Link to="/admin/products" className={styles.back}>
            {" "}
            <FiArrowLeft size={15} /> Products{" "}
          </Link>{" "}
          <span className={styles.eyebrow}> Store Management </span>{" "}
          <h1 className={styles.title}> Product Details </h1>{" "}
          <p className={styles.subtitle}>
            {" "}
            Edit the product information and save changes to the store.{" "}
          </p>{" "}
        </div>{" "}
        <button
          type="button"
          className={styles.refresh}
          onClick={() => loadProduct(true)}
          disabled={refreshing || saving}
        >
          {" "}
          <FiRefreshCw
            size={14}
            className={refreshing ? styles.spinning : ""}
          />{" "}
          {refreshing ? "Refreshing..." : "Refresh"}{" "}
        </button>{" "}
      </div>{" "}
      {error && <div className={styles.error}> {error} </div>}{" "}
      <form className={styles.form} onSubmit={handleSubmit}>
        {" "}
        <div className={styles.card}>
          {" "}
          <div className={styles.cardHeader}>
            {" "}
            <div>
              {" "}
              <h2> Basic Information </h2>{" "}
              <p> Core product information. </p>{" "}
            </div>{" "}
            <span
              className={formData.isActive ? styles.active : styles.inactive}
            >
              {" "}
              {formData.isActive ? "Active" : "Inactive"}{" "}
            </span>{" "}
          </div>{" "}
          <div className={styles.grid}>
            {" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-name"> Product Name * </label>{" "}
              <input
                id="product-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />{" "}
            </div>{" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-sku"> SKU * </label>{" "}
              <input
                id="product-sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
              />{" "}
            </div>{" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-slug"> Slug * </label>{" "}
              <input
                id="product-slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
              />{" "}
            </div>{" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-category"> Category * </label>{" "}
              <select
                id="product-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {" "}
                <option value=""> Select category </option>{" "}
                {categories.map((item) => {
                  const categoryId = item?._id || item?.id;
                  return (
                    <option key={categoryId} value={categoryId}>
                      {" "}
                      {item?.name || "Unnamed category"}{" "}
                    </option>
                  );
                })}{" "}
              </select>{" "}
            </div>{" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-material"> Material </label>{" "}
              <input
                id="product-material"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="Gold, Silver, Pearl"
              />{" "}
            </div>{" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-occasion"> Occasion </label>{" "}
              <input
                id="product-occasion"
                name="occasion"
                value={formData.occasion}
                onChange={handleChange}
                placeholder="Wedding, Party, Daily"
              />{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className={styles.card}>
          {" "}
          <div className={styles.cardHeader}>
            {" "}
            <div>
              {" "}
              <h2> Product Description </h2>{" "}
              <p> Customer-facing product copy. </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className={styles.field}>
            {" "}
            <label htmlFor="product-short-description">
              {" "}
              Short Description{" "}
            </label>{" "}
            <textarea
              id="product-short-description"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              rows="4"
            />{" "}
          </div>{" "}
          <div className={styles.field}>
            {" "}
            <label htmlFor="product-description"> Description </label>{" "}
            <textarea
              id="product-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="8"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className={styles.card}>
          {" "}
          <div className={styles.cardHeader}>
            {" "}
            <div>
              {" "}
              <h2> Pricing & Inventory </h2>{" "}
              <p>
                {" "}
                Manage selling price, comparison price and inventory.{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className={styles.grid}>
            {" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-price"> Price * </label>{" "}
              <div className={styles.inputWithPrefix}>
                {" "}
                <span> ₹ </span>{" "}
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-compare-price">
                {" "}
                Compare-at Price{" "}
              </label>{" "}
              <div className={styles.inputWithPrefix}>
                {" "}
                <span> ₹ </span>{" "}
                <input
                  id="product-compare-price"
                  name="compareAtPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                />{" "}
              </div>{" "}
            </div>{" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-stock"> Stock </label>{" "}
              <input
                id="product-stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
              />{" "}
            </div>{" "}
            <div className={styles.field}>
              {" "}
              <label htmlFor="product-low-stock">
                {" "}
                Low Stock Threshold{" "}
              </label>{" "}
              <input
                id="product-low-stock"
                name="lowStockThreshold"
                type="number"
                min="0"
                step="1"
                value={formData.lowStockThreshold}
                onChange={handleChange}
              />{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div className={styles.card}>
          {" "}
          <div className={styles.cardHeader}>
            {" "}
            <div>
              {" "}
              <h2> Product Images </h2>{" "}
              <p> Use image URLs stored by the backend. </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className={styles.field}>
            {" "}
            <label htmlFor="product-thumbnail"> Thumbnail URL </label>{" "}
            <input
              id="product-thumbnail"
              name="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://..."
            />{" "}
          </div>{" "}
          <div className={styles.field}>
            {" "}
            <label htmlFor="product-images"> Image URLs </label>{" "}
            <textarea
              id="product-images"
              name="images"
              value={formData.images}
              onChange={handleChange}
              rows="6"
              placeholder={"https://image-1.jpg\nhttps://image-2.jpg"}
            />{" "}
            <span className={styles.help}>
              {" "}
              Enter one image URL per line. Commas are also supported.{" "}
            </span>{" "}
          </div>{" "}
          {currentImages.length > 0 && (
            <div className={styles.previewGrid}>
              {" "}
              {currentImages.map((image, index) => (
                <div key={`${image}-${index}`} className={styles.preview}>
                  {" "}
                  <img src={image} alt={`${product.name} ${index + 1}`} />{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
        <div className={styles.card}>
          {" "}
          <div className={styles.cardHeader}>
            {" "}
            <div>
              {" "}
              <h2> Variants </h2>{" "}
              <p> Define selectable product options. </p>{" "}
            </div>{" "}
            <button
              type="button"
              className={styles.addVariant}
              onClick={handleAddVariant}
            >
              {" "}
              <FiPlus size={14} /> Add Variant{" "}
            </button>{" "}
          </div>{" "}
          {variants.length === 0 ? (
            <div className={styles.variantEmpty}> No variants added. </div>
          ) : (
            <div className={styles.variantList}>
              {" "}
              {variants.map((variant, index) => (
                <div key={index} className={styles.variant}>
                  {" "}
                  <div className={styles.variantGrid}>
                    {" "}
                    <div className={styles.field}>
                      {" "}
                      <label> Variant Name </label>{" "}
                      <input
                        value={variant.name}
                        onChange={(event) =>
                          handleVariantChange(index, "name", event.target.value)
                        }
                        placeholder="Size"
                      />{" "}
                    </div>{" "}
                    <div className={styles.field}>
                      {" "}
                      <label> Type </label>{" "}
                      <select
                        value={variant.type}
                        onChange={(event) =>
                          handleVariantChange(index, "type", event.target.value)
                        }
                      >
                        {" "}
                        <option value="select"> Select </option>{" "}
                        <option value="button"> Button </option>{" "}
                        <option value="color"> Color </option>{" "}
                      </select>{" "}
                    </div>{" "}
                    <div className={styles.field}>
                      {" "}
                      <label> Options </label>{" "}
                      <input
                        value={variant.options}
                        onChange={(event) =>
                          handleVariantChange(
                            index,
                            "options",
                            event.target.value,
                          )
                        }
                        placeholder="Small, Medium, Large"
                      />{" "}
                    </div>{" "}
                    <button
                      type="button"
                      className={styles.removeVariant}
                      onClick={() => handleRemoveVariant(index)}
                      title="Remove variant"
                      aria-label="Remove variant"
                    >
                      {" "}
                      <FiTrash2 size={15} />{" "}
                    </button>{" "}
                  </div>{" "}
                </div>
              ))}{" "}
            </div>
          )}{" "}
        </div>{" "}
        <div className={styles.card}>
          {" "}
          <div className={styles.cardHeader}>
            {" "}
            <div>
              {" "}
              <h2> Store Settings </h2>{" "}
              <p> Control tags, collections and visibility. </p>{" "}
            </div>{" "}
          </div>{" "}
          <div className={styles.field}>
            {" "}
            <label htmlFor="product-tags"> Tags </label>{" "}
            <input
              id="product-tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="gold, necklace, wedding"
            />{" "}
            <span className={styles.help}>
              {" "}
              Separate tags with commas.{" "}
            </span>{" "}
          </div>{" "}
          <div className={styles.checkboxes}>
            {" "}
            <label>
              {" "}
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
              />{" "}
              <span> Featured product </span>{" "}
            </label>{" "}
            <label>
              {" "}
              <input
                type="checkbox"
                name="isNewArrival"
                checked={formData.isNewArrival}
                onChange={handleChange}
              />{" "}
              <span> New arrival </span>{" "}
            </label>{" "}
            <label>
              {" "}
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleChange}
              />{" "}
              <span> Best seller </span>{" "}
            </label>{" "}
            <label>
              {" "}
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />{" "}
              <span> Product active </span>{" "}
            </label>{" "}
          </div>{" "}
        </div>{" "}
        <div className={styles.formActions}>
          {" "}
          <Link to="/admin/products" className={styles.cancel}>
            {" "}
            Cancel{" "}
          </Link>{" "}
          <button
            type="button"
            className={styles.secondary}
            onClick={() => navigate(`/admin/products/${productId}`)}
            disabled={saving}
          >
            {" "}
            View{" "}
          </button>{" "}
          <button type="submit" className={styles.save} disabled={saving}>
            {" "}
            {saving ? "Saving..." : "Save Changes"}{" "}
          </button>{" "}
        </div>{" "}
      </form>{" "}
    </section>
  );
}
export default ProductDetails;
