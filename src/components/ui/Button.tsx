import styles from './Button.module.css';
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    loading,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={clsx(
                styles.button,
                styles[variant],
                styles[size],
                loading && styles.loading,
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <span className={styles.spinner} /> : children}
        </button>
    );
}
