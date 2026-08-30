import { Link } from "react-router-dom";
import styles from "./CategoryCard.module.css";

function CategoryCard({ category }) {
  if (!category) {
    return null;
  }

  return (
    <Link to={category.path} className={styles.card}>
      <div className={styles.imageWrapper}>
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>{category.name}</div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{category.name}</h3>

        {category.description && (
          <p className={styles.description}>{category.description}</p>
        )}
      </div>
    </Link>
  );
}

export default CategoryCard;