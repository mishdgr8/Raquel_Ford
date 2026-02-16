import styles from "./MagazinePromo.module.css";
import { Button } from "../ui/Button";

interface MagazinePromoProps {
    config: {
        title?: string;
        description?: string;
        downloadUrl?: string;
    };
}

export function MagazinePromo({ config }: MagazinePromoProps) {
    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.card}>
                    <div className={styles.content}>
                        <span className={styles.tag}>NEW RELEASE</span>
                        <h2 className={styles.title}>{config.title || "THE RAQUEL FORD MAGAZINE"}</h2>
                        <p className={styles.description}>
                            {config.description || "Download our latest digital issue featuring exclusive interviews, fashion trends, and culinary secrets."}
                        </p>
                        <Button className={styles.button}>DOWNLOAD NOW</Button>
                    </div>
                    <div className={styles.visual}>
                        <div className={styles.magazinePlaceholder}>
                            <span>MAGAZINE COVER</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
