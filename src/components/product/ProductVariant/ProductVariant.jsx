import styles from "./ProductVariant.module.css";

function ProductVariant({
  label,
  options = [],
  value,
  onChange,
  type = "button",
}) {
  if (!options.length) {
    return null;
  }

  return (
    <div className={styles.container}>
      {label && <h3 className={styles.label}>{label}</h3>}

      <div className={styles.options}>
        {options.map((option) => {
          const optionValue =
            typeof option === "object" ? option.value : option;
          const optionLabel =
            typeof option === "object" ? option.label : option;

          const isSelected = value === optionValue;
          const isDisabled =
            typeof option === "object" && option.disabled;

          return (
            <button
              key={optionValue}
              type="button"
              className={`${styles.option} ${
                isSelected ? styles.selected : ""
              } ${type === "color" ? styles.colorOption : ""}`}
              onClick={() => onChange?.(optionValue)}
              disabled={isDisabled}
              aria-pressed={isSelected}
            >
              {type === "color" && option.color ? (
                <span
                  className={styles.color}
                  style={{ backgroundColor: option.color }}
                />
              ) : (
                optionLabel
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductVariant;