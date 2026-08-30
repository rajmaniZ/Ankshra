import Button from "../Button/Button";
import styles from "./ErrorMessage.module.css";

function ErrorMessage({
  title = "Something went wrong",
  message = "We couldn't complete your request.",
  actionLabel = "Try again",
  onAction,
}) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>

      {onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default ErrorMessage;