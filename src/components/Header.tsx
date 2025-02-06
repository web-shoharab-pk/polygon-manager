import Link from "next/link";
import styles from "./../styles/components/Header.module.scss";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Polygon Manager
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink} aria-current="page">
            Map
          </Link>
          <Link href="/polygons" className={styles.navLink}>
            Polygons
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
