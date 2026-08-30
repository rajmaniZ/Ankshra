import Button from "../Button/Button";
import styles from "./EmptyState.module.css";

function EmptyState({
  title = "Nothing here yet",
  message,
  actionLabel,
  onAction,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>○</div>

      <h2 className={styles.title}>{title}</h2>

      {message && <p className={styles.message}>{message}</p>}

      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export default EmptyState;