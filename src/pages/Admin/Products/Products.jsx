import { useCallback, useEffect, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProductStock,
} from "../../../services/adminProductService";
import { getAdminCategories } from "../../../services/adminCategoryService";
import styles from "./Products.module.css";
const LIMIT = 20;
function getProductsFromResponse(response) {
  return response?.data?.products || response?.products || [];
}
function getPaginationFromResponse(response) {
  return (
    response?.data?.pagination ||
    response?.pagination || { page: 1, limit: LIMIT, total: 0, pages: 0 }
  );
}
function getCategoriesFromResponse(response) {
  const categories =
    response?.data?.categories || response?.categories || response?.data || [];
  return Array.isArray(categories) ? categories : [];
}
function getProductId(product) {
  return product?._id || product?.id || "";
}
function getCategoryName(product) {
  if (product?.category && typeof product.category === "object") {
    return product.category.name || "Uncategorized";
  }
  return "Uncategorized";
}
function getProductImage(product) {
  const firstImage = product?.images?.[0];
  if (firstImage && typeof firstImage === "object") {
    return firstImage.url || firstImage.secure_url || product?.thumbnail || "";
  }
  return firstImage || product?.thumbnail || product?.image || "";
}
function getStockStatus(stock) {
  const value = Number(stock) || 0;
  if (value <= 0) {
    return { label: "Out of stock", className: styles.outOfStock };
  }
  if (value <= 5) {
    return { label: "Low stock", className: styles.lowStock };
  }
  return { label: "In stock", className: styles.inStock };
}
function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "₹0.00";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
function getErrorMessage(error) {
  return error?.message || "Unable to load products.";
}
function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [stockId, setStockId] = useState("");
  const [stockValues, setStockValues] = useState({});
  const loadCategories = useCallback(async () => {
    try {
      const response = await getAdminCategories({ page: 1, limit: 100 });
      setCategories(getCategoriesFromResponse(response));
    } catch {
      setCategories([]);
    }
  }, []);
  const loadProducts = useCallback(
    async (page = 1, silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError("");
        const params = { page, limit: LIMIT };
        if (search.trim()) {
          params.search = search.trim();
        }
        if (category) {
          params.category = category;
        }
        if (activeStatus) {
          params.isActive = activeStatus;
        }
        if (stockStatus) {
          params.stockStatus = stockStatus;
        }
        const response = await getAdminProducts(params);
        const nextProducts = getProductsFromResponse(response);
        const nextPagination = getPaginationFromResponse(response);
        setProducts(nextProducts);
        setPagination(nextPagination);
        const nextStockValues = {};
        nextProducts.forEach((product) => {
          const id = getProductId(product);
          if (id) {
            nextStockValues[id] = Number(product?.stock) || 0;
          }
        });
        setStockValues(nextStockValues);
      } catch (requestError) {
        setProducts([]);
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, category, activeStatus, stockStatus],
  );
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);
  const handleStockChange = (productId, value) => {
    setStockValues((current) => ({ ...current, [productId]: value }));
  };
  const handleStockUpdate = async (product) => {
    const id = getProductId(product);
    if (!id || stockId) {
      return;
    }
    const stock = Number(stockValues[id]);
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Stock must be a whole number greater than or equal to zero.");
      return;
    }
    const currentStock = Number(product?.stock) || 0;
    if (stock === currentStock) {
      return;
    }
    try {
      setStockId(id);
      setError("");
      const response = await updateAdminProductStock(id, stock);
      const updatedProduct = response?.data?.product || response?.product;
      setProducts((current) =>
        current.map((item) =>
          getProductId(item) === id
            ? {
                ...item,
                ...(updatedProduct || {}),
                stock: updatedProduct?.stock ?? stock,
              }
            : item,
        ),
      );
      setStockValues((current) => ({
        ...current,
        [id]: updatedProduct?.stock ?? stock,
      }));
    } catch (requestError) {
      setError(requestError?.message || "Unable to update stock.");
    } finally {
      setStockId("");
    }
  };
  const handleDelete = async (product) => {
    const id = getProductId(product);
    if (!id || deletingId) {
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product?.name || "this product"}"?`,
    );
    if (!confirmed) {
      return;
    }
    try {
      setDeletingId(id);
      setError("");
      await deleteAdminProduct(id);
      const remaining = products.filter((item) => getProductId(item) !== id);
      if (remaining.length === 0 && pagination.page > 1) {
        await loadProducts(pagination.page - 1);
      } else {
        await loadProducts(pagination.page, true);
      }
    } catch (requestError) {
      setError(requestError?.message || "Unable to delete product.");
    } finally {
      setDeletingId("");
    }
  };
  const handleClearFilters = () => {
    setSearch("");
    setCategory("");
    setActiveStatus("");
    setStockStatus("");
  };
  const handlePreviousPage = () => {
    if (loading || pagination.page <= 1) {
      return;
    }
    loadProducts(pagination.page - 1);
  };
  const handleNextPage = () => {
    if (loading || pagination.pages <= pagination.page) {
      return;
    }
    loadProducts(pagination.page + 1);
  };
  const hasFilters = Boolean(search || category || activeStatus || stockStatus);
  return (
    <section className={styles.page}>
      {" "}
      <div className={styles.heading}>
        {" "}
        <div>
          {" "}
          <span className={styles.eyebrow}> Store Management </span>{" "}
          <h1 className={styles.title}> Products </h1>{" "}
          <p className={styles.description}>
            {" "}
            Manage your jewellery catalogue, pricing, stock, and product
            visibility.{" "}
          </p>{" "}
        </div>{" "}
        <Link to="/admin/products/new" className={styles.addButton}>
          {" "}
          <FiPlus size={16} /> <span> Add Product </span>{" "}
        </Link>{" "}
      </div>{" "}
      <div className={styles.filters}>
        {" "}
        <div className={styles.search}>
          {" "}
          <FiSearch size={16} />{" "}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name or SKU"
            aria-label="Search products"
          />{" "}
        </div>{" "}
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by category"
        >
          {" "}
          <option value=""> All Categories </option>{" "}
          {categories.map((item) => {
            const id = item?._id || item?.id;
            return (
              <option key={id} value={id}>
                {" "}
                {item?.name || "Unnamed category"}{" "}
              </option>
            );
          })}{" "}
        </select>{" "}
        <select
          value={activeStatus}
          onChange={(event) => setActiveStatus(event.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by active status"
        >
          {" "}
          <option value=""> All Status </option>{" "}
          <option value="true"> Active </option>{" "}
          <option value="false"> Inactive </option>{" "}
        </select>{" "}
        <select
          value={stockStatus}
          onChange={(event) => setStockStatus(event.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by stock status"
        >
          {" "}
          <option value=""> All Stock </option>{" "}
          <option value="in"> In Stock </option>{" "}
          <option value="low"> Low Stock </option>{" "}
          <option value="out"> Out of Stock </option>{" "}
        </select>{" "}
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClearFilters}
          disabled={!hasFilters}
        >
          {" "}
          Clear{" "}
        </button>{" "}
        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => loadProducts(pagination.page, true)}
          disabled={loading || refreshing}
          title="Refresh products"
          aria-label="Refresh products"
        >
          {" "}
          <FiRefreshCw
            size={15}
            className={refreshing ? styles.spinning : ""}
          />{" "}
        </button>{" "}
      </div>{" "}
      {error && (
        <div className={styles.error}>
          {" "}
          <strong> Unable to complete request </strong> <p> {error} </p>{" "}
          <button type="button" onClick={() => loadProducts(pagination.page)}>
            {" "}
            Try Again{" "}
          </button>{" "}
        </div>
      )}{" "}
      {loading ? (
        <div className={styles.state}> Loading products... </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          {" "}
          <h2> No products found </h2>{" "}
          <p>
            {" "}
            {hasFilters
              ? "Try changing or clearing your filters."
              : "Add your first jewellery product to get started."}{" "}
          </p>{" "}
          {!hasFilters && (
            <Link to="/admin/products/new" className={styles.emptyButton}>
              {" "}
              <FiPlus size={15} /> <span> Add Product </span>{" "}
            </Link>
          )}{" "}
        </div>
      ) : (
        <div className={styles.card}>
          {" "}
          <div className={styles.tableWrapper}>
            {" "}
            <table className={styles.table}>
              {" "}
              <thead>
                {" "}
                <tr>
                  {" "}
                  <th> Product </th> <th> SKU </th> <th> Category </th>{" "}
                  <th> Price </th> <th> Stock </th> <th> Status </th>{" "}
                  <th> Actions </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody>
                {" "}
                {products.map((product) => {
                  const id = getProductId(product);
                  const image = getProductImage(product);
                  const stock = Number(product?.stock) || 0;
                  const stockInfo = getStockStatus(stock);
                  const isActive = product?.isActive !== false;
                  return (
                    <tr key={id}>
                      {" "}
                      <td>
                        {" "}
                        <Link
                          to={`/admin/products/${id}`}
                          className={styles.product}
                        >
                          {" "}
                          {image ? (
                            <img
                              src={image}
                              alt={product?.name || "Product"}
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className={styles.placeholder}>
                              {" "}
                              {(product?.name || "P")
                                .charAt(0)
                                .toUpperCase()}{" "}
                            </span>
                          )}{" "}
                          <span className={styles.productInfo}>
                            {" "}
                            <strong>
                              {" "}
                              {product?.name || "Unnamed product"}{" "}
                            </strong>{" "}
                            <span> {product?.slug || "No slug"} </span>{" "}
                          </span>{" "}
                        </Link>{" "}
                      </td>{" "}
                      <td> {product?.sku || "—"} </td>{" "}
                      <td> {getCategoryName(product)} </td>{" "}
                      <td>
                        {" "}
                        <strong className={styles.price}>
                          {" "}
                          {formatPrice(product?.price)}{" "}
                        </strong>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        <div className={styles.stockCell}>
                          {" "}
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={stockValues[id] ?? stock}
                            onChange={(event) =>
                              handleStockChange(id, event.target.value)
                            }
                            disabled={stockId === id}
                            aria-label={`Stock for ${product?.name || "product"}`}
                          />{" "}
                          <button
                            type="button"
                            className={styles.stockSave}
                            onClick={() => handleStockUpdate(product)}
                            disabled={
                              stockId === id ||
                              Number(stockValues[id]) === stock
                            }
                          >
                            {" "}
                            {stockId === id ? "Saving" : "Save"}{" "}
                          </button>{" "}
                          <span className={stockInfo.className}>
                            {" "}
                            {stockInfo.label}{" "}
                          </span>{" "}
                        </div>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        <span
                          className={isActive ? styles.active : styles.inactive}
                        >
                          {" "}
                          {isActive ? "Active" : "Inactive"}{" "}
                        </span>{" "}
                      </td>{" "}
                      <td>
                        {" "}
                        <div className={styles.actions}>
                          {" "}
                          <button
                            type="button"
                            className={styles.edit}
                            title="Edit product"
                            aria-label="Edit product"
                            onClick={() =>
                              navigate(`/admin/products/${id}/edit`)
                            }
                            disabled={!id}
                          >
                            {" "}
                            <FiEdit2 size={15} />{" "}
                          </button>{" "}
                          <button
                            type="button"
                            className={styles.delete}
                            title="Delete product"
                            aria-label="Delete product"
                            onClick={() => handleDelete(product)}
                            disabled={!id || deletingId === id}
                          >
                            {" "}
                            <FiTrash2 size={15} />{" "}
                          </button>{" "}
                        </div>{" "}
                      </td>{" "}
                    </tr>
                  );
                })}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>{" "}
          <div className={styles.pagination}>
            {" "}
            <span>
              {" "}
              Showing {products.length} of {pagination.total || products.length}{" "}
              products{" "}
            </span>{" "}
            <div className={styles.paginationControls}>
              {" "}
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={loading || pagination.page <= 1}
              >
                {" "}
                Previous{" "}
              </button>{" "}
              <span>
                {" "}
                Page {pagination.page || 1} of {pagination.pages || 1}{" "}
              </span>{" "}
              <button
                type="button"
                onClick={handleNextPage}
                disabled={
                  loading ||
                  !pagination.pages ||
                  pagination.page >= pagination.pages
                }
              >
                {" "}
                Next{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </section>
  );
}
export default Products;
