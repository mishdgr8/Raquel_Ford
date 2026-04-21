"use client";

import styles from "./SimpleBanner.module.css";
import { Button } from "../ui/Button";

interface SimpleBannerProps {
    config?: {
        title?: string;
        backgroundColor?: string;
        textColor?: string;
        buttonText?: string;
        buttonLink?: string;
    };
}

export function SimpleBanner({ config }: SimpleBannerProps) {
    const title = config?.title || "ADVERTISE WITH RAQUEL FORD";
    const backgroundColor = config?.backgroundColor || "#FFD447";
    const textColor = config?.textColor || "#11001C";
    const buttonText = config?.buttonText || (title.includes("ADVERTISE") ? "CONTACT ME" : config?.buttonText);
    const buttonLink = config?.buttonLink || (title.includes("ADVERTISE") ? "mailto:momentswithraquel@gmail.com?subject=Advertising%20Inquiry" : config?.buttonLink);

    return (
        <section
            className={styles.section}
            style={{ backgroundColor }}
        >
            <div className={styles.container}>
                <h2 className={styles.title} style={{ color: textColor }}>
                    {title}
                </h2>
                {buttonText && (
                    <div className={styles.action}>
                        {buttonLink?.startsWith('mailto:') ? (
                            <a href={buttonLink}>
                                <button className={styles.button89}>
                                    {buttonText}
                                </button>
                            </a>
                        ) : buttonLink ? (
                            <a href={buttonLink} target="_blank" rel="noopener noreferrer">
                                <button className={styles.button89}>
                                    {buttonText}
                                </button>
                            </a>
                        ) : (
                            <button className={styles.button89}>
                                {buttonText}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
