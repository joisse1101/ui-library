import React from 'react';
import { useField } from '@hooks/useField';

export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
    label: string;
    id: string;
    value?: number | '';
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Unit label rendered inside the input, e.g. "km". */
    suffix?: string;
    /** Hides the native up/down spin buttons. Defaults to true. */
    noSpinner?: boolean;
}

/**
 * `NumberInput` renders a labelled numeric input, with an optional unit `suffix` displayed inside the field.
 *
 * Pass `name` (and render under a `FormProvider`) to bind it to form state automatically instead of wiring `value`/`onChange` by hand.
 */
export const NumberInput: React.FC<NumberInputProps> = ({
    label,
    id,
    name,
    value,
    onChange,
    suffix,
    noSpinner = true,
    className = '',
    ...props
}) => {
    const field = useField<number | ''>({ name, value });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value === '' ? '' : Number(e.target.value);
        field.setValue(next);
        onChange?.(e);
    };

    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <div className="input-wrapper">
                <input
                    type="number"
                    id={id}
                    name={name}
                    className={[noSpinner ? 'no-spinner' : '', className].filter(Boolean).join(' ')}
                    value={field.value ?? ''}
                    onChange={handleChange}
                    {...props}
                />
                {suffix && <span className="input-suffix">{suffix}</span>}
            </div>
            {field.error && <span className="error-message">{field.error}</span>}
        </div>
    );
};
