import React, { useCallback, useState } from 'react';
import type { Option } from '../types/selectors';
import '../styles/_component_inline_select.scss';

export interface InlineSelectProps {
    options: Option[];
    value?: string;
    onChange?: (value: string) => void;
    label?: string;
}

/**
 * `InlineSelect` is a React component that renders a dropdown select input with an optional label.
 */
export const InlineSelect: React.FC<InlineSelectProps> = ({ options, value, onChange, label }) => {
    const selectUUID = crypto.randomUUID();
    const [internalSelectedValue, setInternalSelectedValue] = useState<string | undefined>(value);
    const isControlled = value !== undefined && options.some((o) => o.value === value);
    const selectedValue = isControlled ? value : internalSelectedValue;
    const setSelectedValue = useCallback(
        (newValue: string) => {
            if (!isControlled) {
                setInternalSelectedValue(newValue);
            }
            onChange?.(newValue);
        },
        [isControlled, onChange]
    );

    return (
        <div className="select-wrapper">
            <label className="select-label" htmlFor={selectUUID}>{label ?? 'Choose an option:'}</label>
            <select
                id={selectUUID}
                value={selectedValue}
                onChange={(e) => setSelectedValue(e.target.value)}
            >
                {options.length === 0 && <option value="">No options available</option>}
                {options?.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </div>
    );
};