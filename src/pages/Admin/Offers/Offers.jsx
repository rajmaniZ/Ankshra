import { useEffect, useState } from "react";

import { FiEdit2, FiPlus, FiTrash2, FiPower } from "react-icons/fi";

import { Link } from "react-router-dom";

import {
  getOffers,
  deleteOffer,
  toggleOffer,
} from "../../../services/offerService";

import styles from "./Offers.module.css";

function getOfferList(response) {
  return response?.data?.offers || response?.offers || response?.data || [];
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDiscountText(offer) {
  const type = offer.discountType || offer.type || "";

  const value = Number(
    offer.discountValue ?? offer.value ?? offer.discount ?? 0,
  );

  if (type === "percentage" || type === "percent") {
    return `${value}% OFF`;
  }

  return `₹${value.toLocaleString("en-IN")} OFF`;
}

function getOfferName(offer) {
  return offer.name || offer.title || offer.code || "Offer";
}

function Offers() {
  const [offers, setOffers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadOffers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getOffers();

      setOffers(getOfferList(response));
    } catch (err) {
      console.error("Failed to load offers:", err);

      setError(err?.message || "Failed to load offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleDelete = async (id) => {
    if (!id) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this offer?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteOffer(id);

      setOffers((current) =>
        current.filter((offer) => String(offer._id || offer.id) !== String(id)),
      );
    } catch (err) {
      console.error("Failed to delete offer:", err);

      window.alert(err?.message || "Failed to delete offer.");
    }
  };

  const handleToggle = async (offer) => {
    const id = offer._id || offer.id;

    if (!id) {
      return;
    }

    const currentStatus = Boolean(offer.isActive ?? offer.active);

    try {
      const response = await toggleOffer(id, !currentStatus);

      const updated = response?.data?.offer || response?.offer;

      setOffers((current) =>
        current.map((item) => {
          const itemId = item._id || item.id;

          if (String(itemId) !== String(id)) {
            return item;
          }

          if (updated) {
            return updated;
          }

          return {
            ...item,
            isActive: !currentStatus,
          };
        }),
      );
    } catch (err) {
      console.error("Failed to update offer:", err);

      window.alert(err?.message || "Failed to update offer.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Promotions</span>

          <h1 className={styles.title}>Offers</h1>

          <p className={styles.description}>
            Create and manage product offers for your jewellery store.
          </p>
        </div>

        <Link to="/admin/offers/new" className={styles.createButton}>
          <FiPlus size={16} />
          Create Offer
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className={styles.empty}>
          <h2>No offers yet</h2>

          <p>
            Create your first offer to start giving customers special discounts.
          </p>

          <Link to="/admin/offers/new" className={styles.emptyButton}>
            Create Offer
          </Link>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Offer</th>

                <th>Discount</th>

                <th>Start</th>

                <th>End</th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {offers.map((offer) => {
                const id = offer._id || offer.id;

                const active = Boolean(offer.isActive ?? offer.active);

                return (
                  <tr key={id}>
                    <td>
                      <div className={styles.offerInfo}>
                        <strong>
                          <Link
                            to={`/admin/offers/${id}`}
                            className={styles.offerLink}
                          >
                            {getOfferName(offer)}
                          </Link>
                        </strong>

                        {offer.code && <span>Code: {offer.code}</span>}
                      </div>
                    </td>

                    <td>
                      <strong>{getDiscountText(offer)}</strong>
                    </td>

                    <td>{formatDate(offer.startDate || offer.startsAt)}</td>

                    <td>{formatDate(offer.endDate || offer.endsAt)}</td>

                    <td>
                      <span
                        className={active ? styles.active : styles.inactive}
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className={styles.actions}>
                        <Link
                          to={`/admin/offers/${id}/edit`}
                          className={styles.actionButton}
                          title="Edit offer"
                        >
                          <FiEdit2 size={15} />
                        </Link>

                        <button
                          type="button"
                          className={styles.actionButton}
                          title={active ? "Deactivate offer" : "Activate offer"}
                          onClick={() => handleToggle(offer)}
                        >
                          <FiPower size={15} />
                        </button>

                        <button
                          type="button"
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Delete offer"
                          onClick={() => handleDelete(id)}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Offers;
