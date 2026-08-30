import styles from "./ProductVariant.module.css";

function ProductVariant({
  label,
  options = [],
  value,
  onChange,
  type = "button",
}) {
  if (
    !Array.isArray(options) ||
    options.length === 0
  ) {
    return null;
  }

  return (
    <div className={styles.container}>
      {label && (
        <h3 className={styles.label}>
          {label}
        </h3>
      )}

      <div className={styles.options}>
        {options.map(
          (option, index) => {
            const isObject =
              option &&
              typeof option === "object";

            const optionValue =
              isObject
                ? option.value ??
                  option.label ??
                  ""
                : option;

            const optionLabel =
              isObject
                ? option.label ??
                  option.value ??
                  ""
                : option;

            const isSelected =
              String(value ?? "") ===
              String(optionValue ?? "");

            const isDisabled =
              Boolean(
                isObject &&
                  option.disabled,
              );

            if (
              optionValue === "" ||
              optionValue === null ||
              optionValue === undefined
            ) {
              return null;
            }

            return (
              <button
                key={`${String(
                  optionValue,
                )}-${index}`}
                type="button"
                className={`${styles.option} ${
                  isSelected
                    ? styles.selected
                    : ""
                } ${
                  type === "color"
                    ? styles.colorOption
                    : ""
                }`}
                onClick={() =>
                  onChange?.(
                    optionValue,
                  )
                }
                disabled={
                  isDisabled
                }
                aria-pressed={
                  isSelected
                }
                title={
                  type === "color"
                    ? String(
                        optionLabel,
                      )
                    : undefined
                }
              >
                {type ===
                  "color" &&
                isObject &&
                option.color ? (
                  <span
                    className={
                      styles.color
                    }
                    style={{
                      backgroundColor:
                        option.color,
                    }}
                  />
                ) : (
                  optionLabel
                )}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}

export default ProductVariant;