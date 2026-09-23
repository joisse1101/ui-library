import React, { useState } from 'react';
import styles from './Switch.module.scss';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
    size?: 'sm' | 'md';
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: string;
    onChange?: (checked: boolean) => void;
}

/**
 * A switch component that allows users to toggle between two states (on/off).
 * Supports controlled and uncontrolled usage, with optional labels and size variations.
 */
export const Switch: React.FC<SwitchProps> = ({
    size = 'md',
    checked,
    defaultChecked = false,
    disabled = false,
    label,
    onChange,
    id,
    name,
    ...restProps
}) => {
    const isControlled = checked !== undefined;

    // 2. Internal state for uncontrolled usage
    const [internalChecked, setInternalChecked] = useState(defaultChecked);

    // 3. Drive UI state based on controlled vs. uncontrolled status
    const currentChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextChecked = e.target.checked;

        // Update internal state only when uncontrolled
        if (!isControlled) {
            setInternalChecked(nextChecked);
        }

        // Always trigger callback
        onChange?.(nextChecked);
    };

    return (
        <label className={`${styles.switch} ${size === 'sm' ? styles['switch-sm'] : ''}`}>
            <input
                {...restProps}
                type="checkbox"
                role="switch"
                id={id}
                name={name}
                checked={currentChecked}
                aria-checked={currentChecked}
                disabled={disabled}
                onChange={handleChange}
            />
            <span className={styles['switch-track']} aria-hidden="true">
                <span className={styles['switch-thumb']} />
            </span>
            {label && <span className={styles['switch-label']}>{label}</span>}
        </label>
    );
};