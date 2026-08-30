import { Link, Outlet } from "react-router-dom";
import styles from "./CheckoutLayout.module.css";

function CheckoutLayout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Jewellery Store
        </Link>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>Secure checkout</p>
      </footer>
    </div>
  );
}

export default CheckoutLayout;