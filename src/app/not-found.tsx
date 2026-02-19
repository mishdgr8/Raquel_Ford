import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
    return (
        <div className={styles.container}>
            <span className={styles.code}>404</span>
            <h1 className={styles.title}>Page Not Found</h1>
            <p className={styles.description}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link href="/" className={styles.link}>
                RETURN HOME
            </Link>
        </div>
    );
}
