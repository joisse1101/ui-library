import React, { useState } from 'react';
import '../styles/_component_switch.scss';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
    size?: 'sm' | 'md';
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    label?: string;
    onChange?: (checked: boolean) => void;
}

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
        <label className={`switch ${size === 'sm' ? 'switch-sm' : ''}`}>
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
            <span className="switch-track" aria-hidden="true">
                <span className="switch-thumb" />
            </span>
            {label && <span className="switch-label">{label}</span>}
        </label>
    );
};