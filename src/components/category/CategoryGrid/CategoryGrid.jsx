import CategoryCard from "../CategoryCard/CategoryCard";
import styles from "./CategoryGrid.module.css";

function CategoryGrid({ categories = [] }) {
  if (!categories.length) {
    return null;
  }

  return (
    <div className={styles.grid}>
      {categories.map((category) => (
        <CategoryCard
          key={category.id || category.slug || category.name}
          category={category}
        />
      ))}
    </div>
  );
}

export default CategoryGrid;