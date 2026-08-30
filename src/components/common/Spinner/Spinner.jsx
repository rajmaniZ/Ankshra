import styles from "./Spinner.module.css";

function Spinner({ size = "medium" }) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;