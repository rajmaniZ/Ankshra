import styles from "./Input.module.css";

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  autoComplete,
  className = "",
}) {
  const inputClassName = [
    styles.input,
    error ? styles.errorInput : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={inputClassName}
      />

      {error && <p className={styles.error}>{error}</p>}

      {!error && helperText && (
        <p className={styles.helperText}>{helperText}</p>
      )}
    </div>
  );
}

export default Input;