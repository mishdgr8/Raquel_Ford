import styles from "./loading.module.css";

export default function Loading() {
    return (
        <div className={styles.container}>
            <div className={styles.loaderWrapper}>
                <span className={styles.loaderLetter}>R</span>
                <span className={styles.loaderLetter}>A</span>
                <span className={styles.loaderLetter}>Q</span>
                <span className={styles.loaderLetter}>U</span>
                <span className={styles.loaderLetter}>E</span>
                <span className={styles.loaderLetter}>L</span>

                <span className={styles.spacer}></span>

                <span className={styles.loaderLetter}>F</span>
                <span className={styles.loaderLetter}>O</span>
                <span className={styles.loaderLetter}>R</span>
                <span className={styles.loaderLetter}>D</span>

                <div className={styles.loader}></div>
            </div>
        </div>
    );
}
