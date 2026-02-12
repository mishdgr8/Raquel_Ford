import styles from './Input.module.css';
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
    return (
        <div className={styles.wrapper}>
            {label && <label htmlFor={id} className={styles.label}>{label}</label>}
            <input
                id={id}
                className={clsx(
                    styles.input,
                    error && styles.error,
                    className
                )}
                {...props}
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
}
