import Spinner from "../Spinner/Spinner";
import styles from "./Loader.module.css";

function Loader({ message = "Loading..." }) {
  return (
    <div className={styles.loader}>
      <Spinner />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

export default Loader;