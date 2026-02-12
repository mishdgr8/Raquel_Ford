import styles from './Card.module.css';
import { clsx } from "clsx";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
    return (
        <div
            className={clsx(
                styles.card,
                hoverable && styles.hoverable,
                onClick && styles.clickable,
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={clsx(styles.header, className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={clsx(styles.content, className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={clsx(styles.footer, className)}>{children}</div>;
}
